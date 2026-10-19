import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Notifies admin/manager staff whenever a leave request is entered, and
// records the entry in the audit log. Called by the Leave Request Alerts
// workflow (entity trigger on LeaveRequest create).
const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Administration', 'Human Resources Manager', 'Team Leader'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { leave_id } = await req.json();
    if (!leave_id) return Response.json({ error: 'leave_id is required' }, { status: 400 });

    const leave = await base44.asServiceRole.entities.LeaveRequest.get(leave_id);
    if (!leave) return Response.json({ error: 'Leave request not found' }, { status: 404 });

    const dates = [leave.start_date, leave.end_date].filter(Boolean).join(' to ');
    const variables = {
      staff_name: leave.staff_name || 'A staff member',
      leave_type: leave.leave_type || 'Leave',
      leave_dates: dates || 'Dates not set',
      reason: leave.reason || 'Not provided',
    };

    // Log the leave entry in the audit log
    await base44.asServiceRole.entities.AuditLog.create({
      action: 'Leave request entered',
      entity_type: 'LeaveRequest',
      record_id: String(leave.id),
      record_title: `${variables.staff_name}: ${variables.leave_type} leave`,
      performed_by: variables.staff_name,
      details: `Leave request logged for ${variables.staff_name} (${variables.leave_type}, ${variables.dates}). Reason: ${variables.reason}`,
      timestamp: new Date().toISOString(),
    });

    // Notify admin staff
    const staff = await base44.asServiceRole.entities.User.list();
    const recipients = staff
      .filter((u) => ADMIN_ROLES.includes(u.role) && u.email)
      .map((u) => u.email);

    const results = await Promise.allSettled(recipients.map((to) =>
      base44.asServiceRole.integrations.Core.SendEmail({
        to,
        template_name: 'LeaveRequestAlert',
        variables,
      })
    ));

    const notified = results.filter((r) => r.status === 'fulfilled').length;
    return Response.json({ ok: true, notified, recipients });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}