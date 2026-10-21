import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { auDate, addDays } from '../../shared/reminders.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    if (!(await authorizeSystemCall(base44, body))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const service = base44.asServiceRole;

    const sydneyToday = auDate(new Date());
    const tomorrow = addDays(sydneyToday, 1);

    const pending = [];
    let cursor = null;
    do {
      const page = await service.entities.TodoTask.filter(
        { status: { $in: ['Pending', 'Open', 'In Progress', 'Overdue'] }, archived: { $ne: true }, due_date: { $gte: '0001-01-01', $lte: tomorrow } },
        { limit: 200, ...(cursor ? { cursor } : {}) },
      );
      pending.push(...(page.items || []));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);

    const due = pending.filter((t) => t.due_date && t.due_date <= tomorrow);
    let sent = 0;
    const failures = [];
    if (body.dry_run === true) return Response.json({ ok: true, dry_run: true, due_tasks: due.length });
    for (const task of due) {
      for (const to of new Set([task.assigned_email, ...(task.responsible_emails || [])].filter(Boolean).map((email) => String(email).trim().toLowerCase()))) {
        if (!EMAIL_RE.test(String(to))) continue;
        try {
          await service.integrations.Core.SendEmail({
            to,
            subject: `Task due: ${String(task.title || '').slice(0, 150)}`,
            from_name: 'ComplianceHR Infinity',
            body: `Daily task reminder\n\nTask: ${task.title || ''}\nModule: ${task.module || '-'}\nDue date: ${task.due_date || '-'}\nDate: ${task.task_date || '-'}  Time: ${task.task_time || '-'}\n\nHow to complete: ${task.how_to_complete || '-'}\nResources needed: ${task.resources_needed || '-'}\nImportant info: ${task.important_info || '-'}\n\nPlease open the To-Do Board in the Communication Centre and mark the task finalised when it is done.`,
          });
          sent += 1;
        } catch (error) {
          failures.push(String(error?.message || error));
        }
      }
    }
    return Response.json({ ok: true, checked: pending.length, due_tasks: due.length, emails_sent: sent, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}