import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { auDate, auTime, pretty, pageItems } from '../../shared/reminders.ts';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';

// Daily staff compliance document expiry scan. For every EmployeeDocument that has
// expired or expires within 30 days it:
//   1. posts an alert entry into the Communication Centre (CommunicationEntry diary),
//   2. raises a Notification for each administrator,
//   3. emails the affected staff member (once per document state) with their items.
// Idempotent: a document only alerts again when its state changes (Expiring Soon -> Expired).

const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration'];
const HORIZON_DAYS = 30;
const NOTIF_TYPE = 'Staff Document Expiry';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dryRun = !!body.dry_run;

    const now = new Date();
    const todayStr = auDate(now);
    const horizonStr = auDate(new Date(now.getTime() + HORIZON_DAYS * 86400000));
    const time = auTime(now);

    const [docsPage, notifsPage, existingEntries, users, staffPage] = await Promise.all([
      service.entities.EmployeeDocument.filter(
        { expiry_date: { $exists: true, $ne: null } }, { limit: 1000 },
      ),
      service.entities.Notification.filter({ type: NOTIF_TYPE }, { limit: 1000 }),
      service.entities.CommunicationEntry.filter({ entry_kind: 'Message', note_type: 'Document Expiry Alert' }, { limit: 1000 }),
      service.entities.User.list(),
      service.entities.StaffProfile.filter({}, { limit: 500, fields: ['full_name', 'email'] }),
    ]);

    const docs = pageItems(docsPage).filter((d) => d.status !== 'Archived');
    const seenKeys = new Set(pageItems(notifsPage).map((n) => String(n.message || '')));
    const entryKeys = new Set(pageItems(existingEntries).map((e) => String(e.subject || '')));

    const due = [];
    for (const doc of docs) {
      const expiry = String(doc.expiry_date || '').slice(0, 10);
      if (!expiry) continue;
      const state = expiry < todayStr ? 'Expired' : (expiry <= horizonStr ? 'Expiring Soon' : null);
      if (!state) continue;
      const key = `Document ${state.toLowerCase()}: ${doc.title} - ${doc.employee_name || 'Unknown staff member'}`;
      if (seenKeys.has(key) || entryKeys.has(key)) continue;
      due.push({
        key,
        doc_id: doc.id,
        employee_name: doc.employee_name || 'Unknown staff member',
        title: doc.title,
        document_type: doc.document_type || 'Document',
        state,
        expiry,
      });
    }

    if (due.length === 0) {
      return Response.json({ success: true, due_items: 0, message: 'No staff documents expired or expiring within 30 days.' });
    }

    // 1. Communication Centre diary entry per due document.
    if (!dryRun) {
      for (const item of due) {
        await service.entities.CommunicationEntry.create({
          entry_kind: 'Message',
          note_type: 'Document Expiry Alert',
          person_type: 'Employee',
          person_name: item.employee_name,
          subject: item.key,
          attention: 'Compliance Manager, Administration',
          body: `${item.state === 'Expired' ? 'EXPIRED' : 'Expiring soon'}: ${item.document_type} "${item.title}" for ${item.employee_name} `
            + `${item.state === 'Expired' ? 'expired' : 'expires'} on ${pretty(item.expiry)}. `
            + 'Please arrange a renewal or updated document and record it in the Staff file checklist.',
          module: 'Staff',
          entry_date: todayStr,
          entry_time: time,
          sender_name: 'System (Compliance Reminders)',
          email_sent: false,
        });
      }
    }

    // 2. Notification per administrator + 3. one email per affected staff member.
    const administrators = pageItems(users).filter((u) => ADMIN_ROLES.includes(u.role)
      && u.account_status !== 'Archived' && String(u.email || '').trim());
    const staffEmails = new Map(pageItems(staffPage)
      .filter((s) => s.email).map((s) => [String(s.full_name || '').trim().toLowerCase(), s.email]));

    const itemsList = due
      .map((d) => `- ${d.employee_name}: ${d.document_type} "${d.title}" ${d.state.toLowerCase()} ${d.state === 'Expired' ? 'on' : 'expiring'} ${pretty(d.expiry)}`)
      .join('\n');

    const notificationsCreated = [];
    if (!dryRun) {
      for (const admin of administrators) {
        await service.entities.Notification.create({
          type: NOTIF_TYPE,
          recipient: admin.email,
          recipient_id: admin.id,
          message: due.map((d) => d.key).join('; '),
          read: false,
          linked_entity_type: 'EmployeeDocument',
        });
        notificationsCreated.push(admin.email);
      }
    }

    const byStaff = new Map();
    for (const item of due) {
      const email = staffEmails.get(String(item.employee_name || '').trim().toLowerCase());
      if (email) {
        if (!byStaff.has(email)) byStaff.set(email, { name: item.employee_name, items: [] });
        byStaff.get(email).items.push(item);
      }
    }

    const emailed = [];
    if (!dryRun) {
      for (const [email, group] of byStaff.entries()) {
        const list = group.items
          .map((d) => `- ${d.document_type} "${d.title}": ${d.state === 'Expired' ? 'expired' : 'expiring'} ${pretty(d.expiry)}`)
          .join('\n');
        const result = await service.integrations.Core.SendEmail({
          to: email,
          template_name: 'StaffDocExpiry',
          variables: {
            first_name: String(group.name || '').split(' ')[0] || 'there',
            item_count: String(group.items.length),
            items_list: list,
          },
        }).catch((error) => ({ error: error.message }));
        if (!result.error) emailed.push(email);
      }
    }

    return Response.json({
      success: true,
      due_items: due.length,
      diary_entries_created: dryRun ? 0 : due.length,
      notifications_created: notificationsCreated,
      emails_sent: emailed,
      dry_run: dryRun,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}