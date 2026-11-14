import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { TASK_APPROVERS, taskEmails, taskAlertPlan } from '../../shared/taskWorkflowAlerts.ts';

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in to continue.' }, { status: 401 });
    if (['Suspended', 'Archived', 'Rejected'].includes(user.account_status)) return Response.json({ error: 'Access denied.' }, { status: 403 });
    const text = await req.text();
    if (text.length > 16000) return Response.json({ error: 'Request too large.' }, { status: 400 });
    const body = JSON.parse(text);
    if (!['manual', 'event'].includes(body.action) || typeof body.task_id !== 'string' || !body.task_id || body.task_id.length > 100) return Response.json({ error: 'Select a valid task.' }, { status: 400 });
    if ((body.action === 'event' || body.dry_run) && user.role !== 'admin') return Response.json({ error: 'Administrator access required.' }, { status: 403 });
    const service = base44.asServiceRole;
    // Manual sends use the caller's existing task permissions, never an elevated lookup.
    const task = await (body.action === 'manual' ? base44.entities : service.entities).TodoTask.get(body.task_id);
    if (!task) return Response.json({ error: 'Task not found.' }, { status: 404 });
    if (task.archived || (body.expected_status && task.status !== body.expected_status)) return Response.json({ ok: true, skipped: true });
    const plan = taskAlertPlan(task, body);
    if (!plan) return Response.json({ ok: true, skipped: true });
    const records = await service.entities.User.list();
    const users = (Array.isArray(records) ? records : records.items || []).filter((member) => !['Suspended', 'Archived', 'Rejected'].includes(member.account_status));
    const emails = new Set(taskEmails(task));
    const recipients = users.filter((member) => emails.has(String(member.email || '').trim().toLowerCase()) || (plan.review && TASK_APPROVERS.includes(member.role)));
    if (body.dry_run) return Response.json({ ok: true, dry_run: true, planned: recipients.length, label: plan.label });
    const message = `${plan.label}: ${String(task.title || 'Task').slice(0, 200)}${task.due_date ? `. Due ${task.due_date}` : ''}.`;
    let sent = 0;
    for (let offset = 0; offset < recipients.length; offset += 6) {
      await Promise.all(recipients.slice(offset, offset + 6).map(async (member) => {
        const reviewing = plan.review && TASK_APPROVERS.includes(member.role);
        const path = reviewing ? '/shared-to-do' : '/tasks';
        const actionUrl = `${path}?task=${encodeURIComponent(task.id)}&notice=${encodeURIComponent(task.updated_date || task.created_date)}&kind=${body.action === 'manual' ? 'reminder' : 'workflow'}`;
        const key = { recipient_id: member.id, linked_entity_type: 'TodoTask', linked_entity_id: task.id, action_url: actionUrl };
        const existing = await service.entities.Notification.filter(key, { limit: 1 });
        if (existing.items.length) return;
        await service.entities.Notification.create({ ...key, type: reviewing ? 'Review Reminder' : 'Task Assigned', recipient: member.full_name || member.email, message, read: false });
        sent++;
      }));
    }
    return Response.json({ ok: true, sent });
  } catch (error) {
    return Response.json({ error: error.message || 'Unable to send the task alert.' }, { status: 400 });
  }
});