import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { auDate, pretty, pageItems, addDays } from '../../shared/reminders.ts';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';

// Daily two-week document renewal scan. For every EmployeeDocument expiring
// within 14 days (and not yet expired) it creates an in-app Notification for
// the staff member who holds the document. Idempotent: each document state
// (staff + document + expiry date) only ever raises one notification.

const LOOKAHEAD_DAYS = 14;
const NOTIF_TYPE = 'Expiry Alert';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dryRun = !!body.dry_run;

    const now = new Date();
    const todayStr = auDate(now);
    const horizonStr = addDays(todayStr, LOOKAHEAD_DAYS);

    const [docsPage, existingNotifs, users, staffPage] = await Promise.all([
      service.entities.EmployeeDocument.filter(
        { expiry_date: { $exists: true, $ne: null } }, { limit: 1000 },
      ),
      service.entities.Notification.filter({ type: NOTIF_TYPE }, { limit: 1000 }),
      service.entities.User.list(),
      service.entities.StaffProfile.filter({}, { limit: 1000, fields: ['email'] }),
    ]);

    const docs = pageItems(docsPage).filter((d) => d.status !== 'Archived');
    const seenKeys = new Set(pageItems(existingNotifs).map((n) => String(n.message || '')));

    // Documents link to staff by profile id; staff link to app users by email,
    // so the notification reaches the staff member's own notification inbox.
    const staffEmailById = new Map(pageItems(staffPage)
      .filter((s) => s.email)
      .map((s) => [s.id, String(s.email).trim().toLowerCase()]));
    const usersByEmail = new Map(pageItems(users)
      .filter((u) => u.email && u.account_status !== 'Archived')
      .map((u) => [String(u.email).trim().toLowerCase(), u]));

    const due = [];
    for (const doc of docs) {
      const expiry = String(doc.expiry_date || '').slice(0, 10);
      if (!expiry || expiry < todayStr || expiry > horizonStr) continue;
      const staffId = doc.employee_id;
      const employeeEmail = staffEmailById.get(staffId) || null;
      const user = employeeEmail ? usersByEmail.get(employeeEmail) : null;
      if (!user) continue;
      const message = `${doc.employee_name || 'Your'} ${doc.document_type || 'document'} "${doc.title}" `
        + `expires on ${pretty(expiry)} — please arrange renewal within 2 weeks.`;
      if (seenKeys.has(message)) continue;
      due.push({
        doc_id: doc.id,
        recipient: user.email,
        recipient_id: user.id,
        message,
        expiry,
      });
    }

    if (due.length === 0) {
      return Response.json({ success: true, due_items: 0, notifications_created: 0, message: `No staff documents expiring within ${LOOKAHEAD_DAYS} days need a first reminder.` });
    }

    if (!dryRun) {
      for (const item of due) {
        await service.entities.Notification.create({
          type: NOTIF_TYPE,
          recipient: item.recipient,
          recipient_id: item.recipient_id,
          message: item.message,
          read: false,
          linked_entity_type: 'EmployeeDocument',
          linked_entity_id: item.doc_id,
          action_url: '/my-profile?tab=documents',
        });
      }
    }

    return Response.json({
      success: true,
      due_items: due.length,
      notifications_created: dryRun ? 0 : due.length,
      dry_run: dryRun,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});