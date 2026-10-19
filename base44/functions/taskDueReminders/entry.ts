import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const service = base44.asServiceRole;

    const sydneyToday = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Sydney' });
    const tomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString().slice(0, 10);

    const pending = [];
    let cursor = null;
    do {
      const page = await service.entities.TodoTask.filter(
        { status: 'Pending' },
        { limit: 200, ...(cursor ? { cursor } : {}) },
      );
      pending.push(...(page.items || []));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);

    const due = pending.filter((t) => t.due_date && t.due_date <= tomorrow);
    let sent = 0;
    const failures = [];
    for (const task of due) {
      for (const to of task.responsible_emails || []) {
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