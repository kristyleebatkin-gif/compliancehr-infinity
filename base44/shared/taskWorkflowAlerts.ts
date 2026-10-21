export const TASK_APPROVERS = ['admin', 'Provider Administrator', 'Compliance Manager', 'Administration', 'Team Leader', 'Human Resources Manager', 'Quality & Improvement Manager'];
export const taskEmails = (task) => [...new Set([task.assigned_email, ...(task.responsible_emails || [])].filter(Boolean).map((email) => String(email).trim().toLowerCase()))];
export function taskAlertPlan(task, body) {
  const old = body.previous || {};
  const assignmentsChanged = JSON.stringify(taskEmails(task).sort()) !== JSON.stringify(taskEmails(old).sort());
  const statusChanged = task.status !== old.status;
  if (body.action === 'manual') return { label: 'Task reminder', review: false };
  if (task.status === 'Pending Approval' && statusChanged) return { label: 'Task awaiting manager sign-off', review: true };
  if (statusChanged && ['Completed', 'Finalised', 'Cancelled'].includes(task.status)) return { label: `Task ${task.status.toLowerCase()}`, review: false };
  if (statusChanged && old.status === 'Pending Approval') return { label: 'Task returned for further work', review: false };
  if (assignmentsChanged || body.event === 'create') return { label: 'Task assigned', review: false };
  if (old.due_date !== task.due_date) return { label: 'Task due date updated', review: false };
  if (statusChanged && ['Completed', 'Finalised', 'Cancelled'].includes(old.status)) return { label: 'Task reopened', review: false };
  return null;
}