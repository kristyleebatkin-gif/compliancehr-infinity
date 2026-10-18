import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_URL = 'https://polite-safe-hire-flow.base44.app';
const WARN_DAYS = 3;

function daysBetween(fromStr, toStr) {
  return Math.round((new Date(toStr + 'T00:00:00Z') - new Date(fromStr + 'T00:00:00Z')) / 86400000);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
    const horizon = new Date(Date.now() + WARN_DAYS * 24 * 3600 * 1000).toISOString().slice(0, 10);

    const active = [];
    let cursor = null;
    do {
      const page = await service.entities.Task.filter(
        { archived: { $ne: true }, status: { $in: ['Open', 'In Progress'] } },
        { limit: 200, ...(cursor ? { cursor } : {}) },
      );
      active.push(...(page.items || []));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);

    const due = active.filter((t) => t.due_date && t.due_date <= horizon && t.assigned_email);

    let sent = 0;
    const failures = [];
    for (const task of due) {
      const to = String(task.assigned_email || '').trim();
      if (!EMAIL_RE.test(to)) continue;
      const days = daysBetween(today, task.due_date);
      const when = days === 0
        ? 'is DUE TODAY'
        : days > 0
          ? `expires in ${days} day${days === 1 ? '' : 's'}`
          : `is OVERDUE by ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'}`;
      try {
        const subject = `[Action needed] ${task.task_type || 'Compliance'} task ${when}: ${String(task.title || '').slice(0, 100)}`;
        const body = `Compliance task alert\n\nTask: ${task.title || ''}\nType: ${task.task_type || '-'}\nPriority: ${task.priority || '-'}\nStatus: ${task.status || '-'}\nDue date: ${task.due_date} (this task ${when})\n\n${task.notes ? `Notes: ${task.notes}\n\n` : ''}Open your tasks here: ${APP_URL}/tasks\n\nPlease complete the task or update its status in the app so the register stays audit-ready.`;

        await service.integrations.Core.SendEmail({ to, from_name: 'ComplianceHR Portal', subject, body });

        // Track the reminder in the Communication Centre (once per task per day).
        const alreadyLogged = await service.entities.CommunicationEntry.filter(
          { subject, entry_date: today }, { limit: 1 },
        );
        if (!(alreadyLogged.items || []).length) {
          await service.entities.CommunicationEntry.create({
            entry_kind: 'Message',
            person_type: 'Employee',
            attention: task.assigned_to || '',
            subject,
            body,
            entry_date: today,
            entry_time: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5),
            recipients_json: JSON.stringify([{ name: task.assigned_to || '', email: to }]),
            sender_name: 'Automated Compliance Reminder',
            sender_email: 'system@compliancehr-portal',
            module: 'Tasks',
          });
        }
        sent += 1;
      } catch (error) {
        failures.push(String(error?.message || error));
      }
    }
    return Response.json({ ok: true, checked: active.length, due_tasks: due.length, emails_sent: sent, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}