import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { BUSINESS_TIME_ZONE } from '../../shared/businessTime.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DONE_STATUSES = ['Completed', 'Cancelled', 'Finalised'];

// Finds compliance tasks that have passed their due date (Brisbane time) and are
// not finished, then instantly notifies the assignee, everyone responsible and
// every admin user — via in-app notification and email — once per task.
// Called with { task_id } by the instant entity-triggered workflow, or with no
// args by the hourly sweep that catches tasks crossing their due date quietly.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const service = base44.asServiceRole;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: BUSINESS_TIME_ZONE });

    const userPage = await service.entities.User.list();
    const allUsers = Array.isArray(userPage) ? userPage : userPage.items || [];
    const adminUsers = allUsers.filter((u) => u.role === 'admin' || u.role === 'Provider Administrator');
    const userByEmail = {};
    for (const u of allUsers) {
      if (u.email) userByEmail[String(u.email).trim().toLowerCase()] = u;
    }

    let candidates = [];
    if (body.task_id) {
      const task = await service.entities.TodoTask.get(body.task_id).catch(() => null);
      if (task) candidates = [task];
    } else {
      let cursor = null;
      do {
        const page = await service.entities.TodoTask.filter(
          { due_date: { $lt: today }, overdue_alert_sent: { $ne: true } },
          { limit: 200, ...(cursor ? { cursor } : {}) },
        );
        candidates.push(...(page.items || []));
        cursor = page.has_more ? page.next_cursor : null;
      } while (cursor);
    }

    const due = candidates.filter((t) => t.due_date && t.due_date < today && !DONE_STATUSES.includes(t.status) && t.overdue_alert_sent !== true);

    let notificationsSent = 0;
    let emailsSent = 0;
    const failures = [];

    for (const task of due) {
      const title = String(task.title || 'Task').slice(0, 120);
      const recipientEmails = new Set();
      if (task.assigned_email) recipientEmails.add(String(task.assigned_email).trim().toLowerCase());
      for (const e of task.responsible_emails || []) recipientEmails.add(String(e).trim().toLowerCase());
      for (const a of adminUsers) {
        if (a.email) recipientEmails.add(String(a.email).trim().toLowerCase());
      }

      const message = `Task overdue: "${title}" was due ${task.due_date}. Assigned to: ${task.assigned_to || 'unassigned'}. Module: ${task.module || '-'}.`;
      const emailBody = `OVERDUE TASK ALERT\n\nTask: ${title}\nDue date: ${task.due_date}\nAssigned to: ${task.assigned_to || 'unassigned'}\nModule: ${task.module || '-'}\nPriority: ${task.priority || '-'}\n\nHow to complete: ${task.how_to_complete || '-'}\n\nPlease update the task in the Task register as soon as possible.`;

      const jobs = [];
      const seenUserIds = new Set();
      for (const email of recipientEmails) {
        const u = userByEmail[email];
        if (u && !seenUserIds.has(u.id)) {
          seenUserIds.add(u.id);
          jobs.push({ kind: 'notification', run: () => service.entities.Notification.create({
            type: 'Overdue Escalation',
            recipient_id: u.id,
            recipient: u.full_name || u.email,
            message,
            linked_entity_type: 'TodoTask',
            linked_entity_id: task.id,
            action_url: '/tasks',
          }) });
        }
      }
      for (const email of recipientEmails) {
        if (EMAIL_RE.test(email)) {
          jobs.push({ kind: 'email', run: () => service.integrations.Core.SendEmail({
            to: email,
            from_name: 'ComplianceHR Infinity',
            subject: `OVERDUE: ${title}`,
            body: emailBody,
          }) });
        }
      }

      for (let i = 0; i < jobs.length; i += 6) {
        const results = await Promise.allSettled(jobs.slice(i, i + 6).map((j) => j.run()));
        results.forEach((r, idx) => {
          if (r.status === 'fulfilled') {
            if (jobs.slice(i, i + 6)[idx].kind === 'notification') notificationsSent += 1;
            else emailsSent += 1;
          } else {
            failures.push(String(r.reason?.message || r.reason));
          }
        });
      }

      await service.entities.TodoTask.update(task.id, { overdue_alert_sent: true });
    }

    return Response.json({ ok: true, checked: candidates.length, overdue_found: due.length, notifications_sent: notificationsSent, emails_sent: emailsSent, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}