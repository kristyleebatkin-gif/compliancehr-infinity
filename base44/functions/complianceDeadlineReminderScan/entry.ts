import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { auDate, addDays, pretty } from '../../shared/reminders.ts';

const COMPLIANCE_PATTERN = 'compliance|ndis|audit|screening|certification|training|policy|governance|safeguard';
const NDIS_READERS = new Set(['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Support Worker (JR)', 'Support Workers (SN)']);
const normalize = (value) => String(value || '').trim().toLowerCase();
const safeText = (value) => String(value || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 200);

async function allPages(entity, query) {
  const items = [];
  let cursor;
  do {
    const page = await entity.filter(query, { limit: 200, ...(cursor ? { cursor } : {}) });
    items.push(...page.items);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
  return items;
}

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((error) => error.status === 401 ? null : Promise.reject(error));
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const { dry_run: dryRun = false } = await req.json().catch(() => ({}));
    const svc = base44.asServiceRole;
    const today = auDate(new Date());
    const horizon = addDays(today, 14);
    const dateRange = { $gte: today, $lte: horizon };
    const [userResult, deadlines, certificates, tasks, previous] = await Promise.all([
      svc.entities.User.list('-created_date', 1000),
      allPages(svc.entities.NDISComplianceDeadline, { due_date: dateRange, status: { $nin: ['Completed', 'Submitted'] } }),
      allPages(svc.entities.Certificate, { expiry_date: dateRange, status: { $nin: ['Revoked', 'Expired'] } }),
      allPages(svc.entities.TodoTask, { due_date: dateRange, archived: { $ne: true }, status: { $in: ['Pending', 'Open', 'In Progress', 'Overdue', 'Pending Approval'] }, $or: [
        { task_type: { $regex: COMPLIANCE_PATTERN, $options: 'i' } }, { module: { $regex: COMPLIANCE_PATTERN, $options: 'i' } }, { linked_entity_type: { $regex: COMPLIANCE_PATTERN, $options: 'i' } }
      ] }),
      allPages(svc.entities.ComplianceDeadlineReminder, { due_date: dateRange }),
    ]);
    const users = (Array.isArray(userResult) ? userResult : userResult.items).filter((u) => u.id && u.email && !['Archived', 'Suspended', 'Rejected', 'Pending Approval'].includes(u.account_status) && !['Archived', 'Pending Approval'].includes(u.role));
    const admins = users.filter((u) => u.role === 'admin');
    const byEmail = new Map(users.map((u) => [normalize(u.email), u]));
    const uniqueName = (name) => {
      const key = normalize(name);
      if (!key) return null;
      const matches = users.filter((u) => normalize(u.full_name) === key);
      return matches.length === 1 ? matches[0] : null;
    };
    const reminderKey = (type, id, date, recipientId) => [type, id, date, recipientId].join('|');
    const existing = new Map(previous.map((r) => [reminderKey(r.source_type, r.source_id, r.due_date, r.recipient_id), r]));
    const candidates = [];
    let unresolved = 0;
    function add(type, item, date, title, category, recipients, missingOwner = false) {
      const selected = Array.from(new Map(recipients.filter(Boolean).map((u) => [u.id, u])).values());
      if (!selected.length) {
        unresolved += 1;
        selected.push(...admins);
        missingOwner = true;
      }
      for (const recipient of selected) {
        const cleanTitle = safeText(title) || category;
        const message = `Compliance reminder: ${cleanTitle} is due ${pretty(date)}.${missingOwner ? ' No eligible staff account could be matched; please assign an owner.' : ''}`;
        candidates.push({ recipient, source_type: type, source_id: item.id, due_date: date, item_title: cleanTitle, category, message });
      }
    }
    for (const item of deadlines) {
      const owner = byEmail.get(normalize(item.owner)) || uniqueName(item.owner);
      add('NDISComplianceDeadline', item, item.due_date, item.title, 'NDIS compliance deadline', owner && NDIS_READERS.has(owner.role) ? [owner] : []);
    }
    for (const item of certificates) {
      const linked = users.filter((u) => item.staff_id && (u.id === item.staff_id || u.personal_staff_profile_id === item.staff_id));
      const owner = linked.length === 1 ? linked[0] : uniqueName(item.staff_name);
      const title = owner ? item.module_title : `${item.module_title || 'Certificate'} (${item.staff_name || 'staff not recorded'})`;
      add('Certificate', item, item.expiry_date, title, 'Staff certification', owner ? [owner] : []);
    }
    for (const item of tasks) {
      const recipients = [
        ...[item.assigned_email, ...(Array.isArray(item.responsible_emails) ? item.responsible_emails : [])].map((email) => byEmail.get(normalize(email))),
        ...[item.assigned_to, ...(Array.isArray(item.responsible) ? item.responsible : [])].map(uniqueName),
      ];
      add('TodoTask', item, item.due_date, item.title, 'Assigned compliance task', recipients);
    }
    const uniqueCandidates = Array.from(new Map(candidates.map((item) => [reminderKey(item.source_type, item.source_id, item.due_date, item.recipient.id), item])).values());
    if (dryRun) return Response.json({ ok: true, dry_run: true, deadlines: deadlines.length, certifications: certificates.length, tasks: tasks.length, unmatched_items: unresolved, new_reminders: uniqueCandidates.filter((item) => !existing.has(reminderKey(item.source_type, item.source_id, item.due_date, item.recipient.id))).length });
    if (unresolved && !admins.length) throw new Error('Some reminders have no matching recipient and no active admin is available.');
    let created = 0;
    let notified = 0;
    for (let i = 0; i < uniqueCandidates.length; i += 5) {
      await Promise.all(uniqueCandidates.slice(i, i + 5).map(async (item) => {
        const recipient = item.recipient;
        const key = reminderKey(item.source_type, item.source_id, item.due_date, recipient.id);
        let reminder = existing.get(key);
        if (!reminder) {
          reminder = await svc.entities.ComplianceDeadlineReminder.create({
            recipient_id: recipient.id, recipient_email: recipient.email,
            first_name: safeText(recipient.full_name).split(/\s+/)[0] || 'there',
            item_title: item.item_title, category: item.category, due_date: item.due_date,
            source_type: item.source_type, source_id: item.source_id, message: item.message, notification_created: false,
          });
          created += 1;
        }
        if (!reminder.notification_created) {
          const found = await svc.entities.Notification.filter({ recipient_id: recipient.id, linked_entity_type: item.source_type, linked_entity_id: item.source_id, message: item.message }, { limit: 1 });
          if (!found.items.length) {
            await svc.entities.Notification.create({
              type: item.source_type === 'Certificate' ? 'Training Expiry' : item.source_type === 'NDISComplianceDeadline' ? 'NDIS Audit Due' : 'Expiry Alert',
              severity: 'Warning', recipient: recipient.email, recipient_id: recipient.id,
              ...(recipient.organisation_id || recipient.data?.organisation_id ? { organisation_id: recipient.organisation_id || recipient.data.organisation_id } : {}),
              message: item.message, read: false, linked_entity_type: item.source_type, linked_entity_id: item.source_id,
              action_url: item.source_type === 'TodoTask' ? '/tasks' : item.source_type === 'NDISComplianceDeadline' ? '/ndis-portal' : ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'].includes(recipient.role) ? '/certificates' : '/my-profile',
            });
            notified += 1;
          }
          await svc.entities.ComplianceDeadlineReminder.update(reminder.id, { notification_created: true });
        }
      }));
    }
    return Response.json({ ok: true, deadlines: deadlines.length, certifications: certificates.length, tasks: tasks.length, unmatched_items: unresolved, reminder_records_created: created, notifications_created: notified });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});