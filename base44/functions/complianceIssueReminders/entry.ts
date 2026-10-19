import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Daily automated scan: escalates compliance issues whose target date has
// passed while still Open or In Progress. Creates deduplicated follow-up
// tasks, management notifications and status-log entries.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const svc = base44.asServiceRole;
    const today = new Date().toISOString().slice(0, 10);

    const overduePage = await svc.entities.ComplianceIssue.filter(
      { status: { $in: ['Open', 'In Progress'] }, target_date: { $lt: today } },
      { sort: 'target_date', limit: 100 },
    );
    const overdue = overduePage.items || [];
    if (overdue.length === 0) {
      return Response.json({ overdue: 0, tasks_created: 0, notifications_created: 0 });
    }

    const [taskPage, notifPage, users] = await Promise.all([
      svc.entities.TodoTask.filter({ module: 'Compliance Issues' }, { limit: 500 }),
      svc.entities.Notification.filter({ type: 'Overdue Escalation', linked_entity_type: 'ComplianceIssue' }, { limit: 500, sort: '-created_date' }),
      svc.entities.User.list(),
    ]);
    const existingTaskTitles = new Set((taskPage.items || []).map((t) => t.title));
    const notifKeys = new Set((notifPage.items || []).map((n) => `${n.linked_entity_id}|${String(n.message).slice(0, 80)}`));
    const managers = (users || []).filter((u) => ['admin', 'Provider Administrator', 'Compliance Manager'].includes(u.role));

    const tasks = [];
    const notifications = [];
    const statusLogs = [];
    for (const issue of overdue) {
      const taskTitle = `Follow up compliance issue ${issue.issue_id ? `${issue.issue_id}: ` : ''}${issue.title}`;
      if (!existingTaskTitles.has(taskTitle)) {
        tasks.push({
          title: taskTitle,
          module: 'Compliance Issues',
          task_date: today,
          due_date: issue.target_date,
          status: 'Pending',
          how_to_complete: 'Open the Compliance Hub, Compliance Issues tab, review the overdue issue and record its resolution.',
          responsible: issue.assigned_to ? [issue.assigned_to] : [],
          important_info: `Target date was ${issue.target_date}.`,
        });
      }
      const message = `Compliance issue ${issue.issue_id || ''} is overdue (target ${issue.target_date}): ${issue.title}`.trim();
      for (const m of managers) {
        const key = `${issue.id}|${message}`;
        if (m.email && !notifKeys.has(key)) {
          notifications.push({
            type: 'Overdue Escalation',
            recipient_id: m.id,
            recipient: m.email,
            message,
            linked_entity_type: 'ComplianceIssue',
            linked_entity_id: issue.id,
            action_url: '/compliance',
          });
        }
      }
      statusLogs.push({
        entity_type: 'Compliance Issues',
        record_id: issue.issue_id || String(issue.id),
        record_title: issue.title,
        from_status: issue.status,
        to_status: issue.status,
        changed_by: 'Automated overdue escalation',
        notes: `Target date ${issue.target_date} has passed — escalated to management.`,
      });
    }

    if (tasks.length) await svc.entities.TodoTask.bulkCreate(tasks);
    if (notifications.length) await svc.entities.Notification.bulkCreate(notifications);
    if (statusLogs.length) await svc.entities.StatusLog.bulkCreate(statusLogs);

    return Response.json({
      overdue: overdue.length,
      tasks_created: tasks.length,
      notifications_created: notifications.length,
      escalated: overdue.map((i) => ({ id: i.issue_id || i.id, target_date: i.target_date })),
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}