import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { auDate, auTime, pretty, pageItems } from '../../shared/reminders.ts';
import { authorizeSystemCall, MANAGEMENT_ROLES } from '../../shared/systemAuth.ts';
import { sendGmail } from '../../shared/gmailSend.ts';

// Daily worker-screening expiry scan. For every NDISComplianceDeadline of type
// Worker Screening (or Worker Screening Audit) that is expired or due within 30
// days it alerts the responsible staff member by email and in-app notification,
// logs a Communication Centre diary entry, and raises an in-app alert for admins.
// Idempotent: each deadline alerts again only when its state changes.
const SCREENING_TYPES = ['Worker Screening', 'Worker Screening Audit'];
const SKIP_STATUSES = ['Completed', 'Submitted'];
const HORIZON_DAYS = 7;
const ADMIN_ROLES = MANAGEMENT_ROLES;
const APP_URL = 'https://polite-safe-hire-flow.base44.app';
const ENTRY_NOTE_TYPE = 'Screening Expiry Alert';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const service = base44.asServiceRole;
    if (!(await authorizeSystemCall(base44))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    const todayStr = auDate(now);
    const time = auTime(now);
    const horizonStr = auDate(new Date(now.getTime() + HORIZON_DAYS * 86400000));

    const [deadlinesPage, staffPage, usersPage, notifsPage, entriesPage] = await Promise.all([
      service.entities.NDISComplianceDeadline.filter({ deadline_type: { $in: SCREENING_TYPES } }, { limit: 500 }),
      service.entities.StaffProfile.filter({}, { limit: 1000, fields: ['full_name', 'email'] }),
      service.entities.User.list(),
      service.entities.Notification.filter({ type: 'Expiry Alert' }, { limit: 1000 }),
      service.entities.CommunicationEntry.filter({ entry_kind: 'Message', note_type: ENTRY_NOTE_TYPE }, { limit: 1000 }),
    ]);

    const users = pageItems(usersPage);
    const userByEmail = new Map(users.filter((u) => u.email).map((u) => [String(u.email).trim().toLowerCase(), u]));
    const staffByName = new Map(pageItems(staffPage).map((s) => [String(s.full_name || '').trim().toLowerCase(), s]));
    const seenNotifKeys = new Set(pageItems(notifsPage).map((n) => String(n.message || '')));
    const entryKeys = new Set(pageItems(entriesPage).map((e) => String(e.subject || '')));

    // Collect affected screening deadlines, matched to a staff member + user.
    const affected = [];
    for (const deadline of pageItems(deadlinesPage)) {
      const due = String(deadline.due_date || '').slice(0, 10);
      if (!due || SKIP_STATUSES.includes(deadline.status)) continue;
      const state = due < todayStr ? 'Expired' : (due <= horizonStr ? 'Expiring Soon' : null);
      if (!state) continue;
      const owner = String(deadline.owner || '').trim();
      const staff = staffByName.get(owner.toLowerCase());
      const user = staff?.email ? userByEmail.get(String(staff.email).trim().toLowerCase()) : null;
      const key = `Worker screening ${state.toLowerCase()}: ${owner || 'Staff member'} (${due})`;
      affected.push({ key, deadline_id: deadline.id, owner, state, due, staff, user });
    }

    if (affected.length === 0) {
      return Response.json({ success: true, due_items: 0, message: 'No worker screenings expired or due within 30 days.' });
    }

    // Diary entries for every affected screening (once per key).
    let entriesCreated = 0;
    for (const item of affected) {
      if (entryKeys.has(item.key)) continue;
      await service.entities.CommunicationEntry.create({
        entry_kind: 'Message',
        note_type: ENTRY_NOTE_TYPE,
        person_type: 'Employee',
        person_name: item.owner || 'Staff member',
        subject: item.key,
        attention: item.owner || 'Compliance Manager',
        body: `${item.state === 'Expired' ? 'EXPIRED' : 'Expiring soon'}: NDIS worker screening `
          + `${item.state === 'Expired' ? 'expired' : 'is due'} on ${pretty(item.due)} `
          + 'for the staff member listed. Please renew the check or update the deadline record.',
        module: 'NDIS Portal',
        entry_date: todayStr,
        entry_time: time,
        sender_name: 'System (Compliance Reminders)',
        email_sent: false,
      });
      entryKeys.add(item.key);
      entriesCreated += 1;
    }

    // Per-staff emails + in-app notifications (registered users only).
    const byStaff = new Map();
    for (const item of affected) {
      if (!item.user) continue;
      const list = byStaff.get(item.user.id) || { user: item.user, items: [] };
      list.items.push(item);
      byStaff.set(item.user.id, list);
    }
    const emailsSent = [];
    const notificationsCreated = [];
    for (const [, group] of byStaff) {
      const lines = group.items.map((i) => `- ${i.owner || 'You'}: worker screening ${i.state.toLowerCase()} (${pretty(i.due)})`);
      const message = `Worker screening ${group.items.length === 1 ? group.items[0].state.toLowerCase() : 'alerts'}: `
        + group.items.map((i) => `${i.owner || 'You'} (${pretty(i.due)})`).join('; ');
      if (!seenNotifKeys.has(message)) {
        await service.entities.Notification.create({
          type: 'Expiry Alert',
          recipient: group.user.email,
          recipient_id: group.user.id,
          message,
          read: false,
          linked_entity_type: 'NDISComplianceDeadline',
          linked_entity_id: group.items[0].deadline_id,
          action_url: '/ndis-portal',
        });
        seenNotifKeys.add(message);
        notificationsCreated.push(group.user.email);
      }
      const emailBody = 'Worker screening alert\n\n'
        + `The following NDIS worker screening check${group.items.length === 1 ? ' is' : 's are'} `
        + 'expired or due within 30 days:\n\n'
        + `${lines.join('\n')}\n\nReview and renew the checks, then update the deadline records: ${APP_URL}/ndis-portal`;
      const subject = `[Action needed] Worker screening ${group.items.length === 1 ? 'due soon' : `${group.items.length} screenings due soon`}`;
      try {
        await sendGmail(service, { to: group.user.email, subject, body: emailBody });
        emailsSent.push(group.user.email);
      } catch (error) {
        // Delivery failure is non-fatal: the in-app notification already went out.
      }
    }

    // Admin notifications (deduped on the combined message).
    const adminMessage = affected.map((a) => a.key).join('; ');
    const administrators = users.filter((u) => ADMIN_ROLES.includes(u.role)
      && u.account_status !== 'Archived' && String(u.email || '').trim());
    if (!seenNotifKeys.has(adminMessage)) {
      for (const admin of administrators) {
        await service.entities.Notification.create({
          type: 'Expiry Alert',
          recipient: admin.email,
          recipient_id: admin.id,
          message: adminMessage,
          read: false,
          linked_entity_type: 'NDISComplianceDeadline',
          linked_entity_id: affected[0].deadline_id,
          action_url: '/ndis-portal',
        });
        notificationsCreated.push(admin.email);
      }
      seenNotifKeys.add(adminMessage);
    }

    return Response.json({
      success: true,
      due_items: affected.length,
      due_list: affected.map((a) => a.key),
      diary_entries_created: entriesCreated,
      emails_sent: emailsSent,
      notifications_created: notificationsCreated,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});