import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { BUSINESS_TIME_ZONE } from '../../shared/businessTime.ts';

// Sends native mobile push notifications to staff for:
//  1. New compliance tasks assigned to them (TodoTask).
//  2. Upcoming staff document / certificate renewal deadlines (next 7 days).
// Every sent push is recorded in PushLog, so each assignment or renewal is
// notified exactly once. Intended to run on an hourly schedule via workflow.
const APP_URL = 'https://compliancehrinfinity.com';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const authorized = await authorizeSystemCall(base44);
    if (!authorized) return Response.json({ error: 'Forbidden' }, { status: 403 });
    const svc = base44.asServiceRole;

    const auDate = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE }).format(d); // YYYY-MM-DD
    const now = new Date();
    const today = auDate(now);
    const soon = auDate(new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000));

    // Registered app users by email -> user id (push targets a user id).
    const users = await svc.entities.User.list();
    const userByEmail = new Map();
    for (const u of Array.isArray(users) ? users : users.items || []) {
      if (u.email) userByEmail.set(String(u.email).trim().toLowerCase(), u.id);
    }

    // Staff profiles -> email/identity for document owners.
    const staff = await svc.entities.StaffProfile.list();
    const staffList = Array.isArray(staff) ? staff : staff.items || [];
    const staffById = new Map(staffList.map((s) => [s.id, s]));
    const staffByName = new Map(staffList.map((s) => [String(s.full_name || '').toLowerCase(), s]));

    type Candidate = { key: string; user_id: string; email: string; title: string; content: string; action_url: string; notification_type: string; linked_entity_type?: string; linked_entity_id?: string };
    const candidates: Candidate[] = [];

    // 1. New compliance task assignments (open tasks only).
    const taskPage = await svc.entities.TodoTask.filter(
      { status: { $nin: ['Completed', 'Cancelled'] }, archived: { $ne: true } },
      { sort: '-created_date', limit: 100 },
    );
    for (const t of taskPage.items || []) {
      const emails = new Set([...(t.responsible_emails || []), t.assigned_email]
        .filter(Boolean).map((e) => String(e).trim().toLowerCase()));
      for (const email of emails) {
        const userId = userByEmail.get(email);
        if (!userId) continue;
        candidates.push({
          key: `task:${t.id}:${email}`,
          user_id: userId,
          email,
          title: 'New compliance task assigned',
          content: `${t.title || 'Task'}${t.due_date ? ` (due ${t.due_date})` : ''}`,
          action_url: `${APP_URL}/tasks`,
          notification_type: 'Task Assigned',
          linked_entity_type: 'TodoTask',
          linked_entity_id: t.id,
        });
      }
    }

    // 2. Staff documents expiring in the next 7 days.
    const docs = await svc.entities.EmployeeDocument.filter(
      { expiry_date: { $gte: today, $lte: soon }, status: { $ne: 'Archived' } },
      { limit: 200, fields: ['id', 'title', 'document_type', 'expiry_date', 'employee_id', 'employee_name'] },
    );
    for (const d of docs.items || []) {
      const owner = (d.employee_id && staffById.get(d.employee_id))
        || (d.employee_name ? staffByName.get(String(d.employee_name).toLowerCase()) : null);
      const email = owner?.email ? String(owner.email).trim().toLowerCase() : null;
      const userId = email ? userByEmail.get(email) : null;
      if (!userId) continue;
      candidates.push({
        key: `doc:EmployeeDocument:${d.id}`,
        user_id: userId,
        email,
        title: 'Document renewal due',
        content: `${d.title || d.document_type || 'Document'} expires ${d.expiry_date}`,
        action_url: `${APP_URL}/my-profile?tab=documents`,
        notification_type: 'Expiry Alert',
        linked_entity_type: 'EmployeeDocument',
        linked_entity_id: d.id,
      });
    }

    // 3. Certificates expiring in the next 7 days.
    const certs = await svc.entities.Certificate.filter(
      { expiry_date: { $gte: today, $lte: soon }, status: { $ne: 'Revoked' } },
      { limit: 200, fields: ['id', 'module_title', 'expiry_date', 'staff_id', 'staff_name'] },
    );
    for (const c of certs.items || []) {
      const owner = (c.staff_id && staffById.get(c.staff_id))
        || (c.staff_name ? staffByName.get(String(c.staff_name).toLowerCase()) : null);
      const email = owner?.email ? String(owner.email).trim().toLowerCase() : null;
      const userId = email ? userByEmail.get(email) : null;
      if (!userId) continue;
      candidates.push({
        key: `doc:Certificate:${c.id}`,
        user_id: userId,
        email,
        title: 'Certificate renewal due',
        content: `${c.module_title || 'Certificate'} expires ${c.expiry_date}`,
        action_url: `${APP_URL}/certificates`,
        notification_type: 'Expiry Alert',
        linked_entity_type: 'Certificate',
        linked_entity_id: c.id,
      });
    }

    // Never already-notified keys, and cap the run to stay within time limits.
    const keys = candidates.map((c) => c.key);
    const existing = await svc.entities.PushLog.filter({ key: { $in: keys } }, { limit: 1000, fields: ['key'] });
    const seen = new Set((existing.items || []).map((r) => r.key));
    const toSend = candidates.filter((c) => !seen.has(c.key)).slice(0, 40);

    let sent = 0, failed = 0;
    for (let i = 0; i < toSend.length; i += 6) {
      const batch = toSend.slice(i, i + 6);
      const results = await Promise.allSettled(batch.map((p) => svc.integrations.Core.SendPushNotification({
        user_id: p.user_id,
        title: p.title,
        content: p.content,
        action_url: p.action_url,
      })));
      for (let j = 0; j < results.length; j++) {
        const p = batch[j];
        if (results[j].status === 'fulfilled') {
          sent++;
          // Record the push and mirror it into the in-app notifications feed.
          await Promise.allSettled([
            svc.entities.PushLog.create({ key: p.key, sent_at: now.toISOString(), recipient_id: p.user_id }),
            svc.entities.Notification.create({
              type: p.notification_type,
              recipient: p.email,
              recipient_id: p.user_id,
              message: `${p.title}: ${p.content}`,
              action_url: p.action_url,
              linked_entity_type: p.linked_entity_type,
              linked_entity_id: p.linked_entity_id,
            }),
          ]);
        } else {
          failed++;
          console.error(`Push failed for ${p.key}:`, results[j].reason);
        }
      }
    }

    return Response.json({
      checked: candidates.length,
      skipped_already_sent: candidates.length - candidates.filter((c) => !seen.has(c.key)).length,
      to_send: toSend.length,
      sent,
      failed,
    });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : 'Push alert scan failed' }, { status: 500 });
  }
}