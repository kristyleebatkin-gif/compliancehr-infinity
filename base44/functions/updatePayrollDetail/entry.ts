import { hasApprovedAccess } from '../../shared/appAccess.ts';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Updates a staff payroll detail record with a full audit trail: every changed
// field is logged to the PayrollChangeLog (date, time, who) and administrators
// receive a notification alert so any change is visible immediately.
// Employees may only change their own bank/super details; payroll roles may
// change anything.
const PAYROLL_ROLES = ['admin', 'Provider Administrator', 'Administration', 'Finance & Accounts Officer', 'Human Resources Manager'];
const EMPLOYEE_EDITABLE = ['bsb', 'account_number', 'account_name', 'super_fund_name', 'super_member_number'];

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!hasApprovedAccess(me)) return Response.json({ error: 'Approved account access required.' }, { status: 403 });
    if (!me) return Response.json({ error: 'Sign in required.' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const id = String(body.id || '');
    const changes = body.changes && typeof body.changes === 'object' ? body.changes : {};
    const note = String(body.note || '').slice(0, 500);
    if (!id || !Object.keys(changes).length) {
      return Response.json({ error: 'Nothing to change.' }, { status: 400 });
    }

    const service = base44.asServiceRole;
    const record = await service.entities.StaffPayrollDetail.get(id);
    if (!record) return Response.json({ error: 'Payroll record not found.' }, { status: 404 });

    const isManager = PAYROLL_ROLES.includes(me.role);
    const isOwn = record.employee_user_id === me.id;
    if (!isManager && !isOwn) {
      return Response.json({ error: 'You can only change your own payroll details.' }, { status: 403 });
    }
    const allowedFields = isManager ? Object.keys(changes) : EMPLOYEE_EDITABLE;
    const blocked = Object.keys(changes).filter((k) => !allowedFields.includes(k));
    if (blocked.length) {
      return Response.json({ error: `You cannot change: ${blocked.join(', ')}` }, { status: 403 });
    }

    const now = new Date().toISOString();
    const applied = {};
    const logs = [];
    for (const [field, rawNew] of Object.entries(changes)) {
      const newValue = String(rawNew ?? '');
      const oldValue = String(record[field] ?? '');
      if (newValue === oldValue) continue;
      applied[field] = newValue;
      logs.push({
        payroll_detail_id: record.id,
        employee_name: record.employee_name,
        field,
        old_value: oldValue,
        new_value: newValue,
        changed_by: me.full_name || me.email || 'Unknown',
        changed_by_user_id: me.id,
        changed_by_email: me.email || '',
        changed_by_role: me.role || '',
        changed_at: now,
        note,
      });
    }
    if (!Object.keys(applied).length) {
      return Response.json({ changed: 0, message: 'No actual changes.' });
    }

    await service.entities.StaffPayrollDetail.update(record.id, applied);
    await service.entities.PayrollChangeLog.bulkCreate(logs);

    // Alert every payroll administrator.
    const users = await service.entities.User.list();
    const admins = (users || []).filter((u) => PAYROLL_ROLES.includes(u.role) && u.id !== me.id);
    const message = `Payroll details changed for ${record.employee_name}: ${logs.map((l) => `${l.field} updated by ${l.changed_by}`).join('; ')}`;
    if (admins.length) {
      await service.entities.Notification.bulkCreate(admins.map((u) => ({
        recipient_id: u.id,
        type: 'Payroll change alert',
        message,
        read: false,
      })));
    }

    return Response.json({ changed: logs.length, logged: logs.map((l) => l.field), message: 'Change logged and administrators alerted.' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}