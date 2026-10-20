import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Employee self-service payroll data: their own payroll details, timesheet
// shifts and payslips only. Nothing else is reachable through this function.
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me) return Response.json({ error: 'Sign in required.' }, { status: 401 });
    const service = base44.asServiceRole;

    const profilePage = await service.entities.StaffProfile.filter({ email: me.email }, { limit: 1 });
    const profile = (profilePage.items || [])[0] || null;

    const [detailPage, payslipPage, logPage] = await Promise.all([
      service.entities.StaffPayrollDetail.filter({ employee_user_id: me.id }, { limit: 10 }),
      service.entities.Payslip.filter({ employee_user_id: me.id }, { sort: '-pay_period_end', limit: 52 }),
      service.entities.PayrollChangeLog.filter({ changed_by_user_id: me.id }, { sort: '-changed_at', limit: 50 }),
    ]);

    let shifts = [];
    if (profile && profile.full_name) {
      const shiftPage = await service.entities.Shift.filter(
        { employee_name: profile.full_name },
        { sort: '-date', limit: 200, fields: ['date', 'start_time', 'end_time', 'status', 'approval_status', 'break_minutes', 'travel_km', 'participant_name', 'service_type'] },
      );
      shifts = shiftPage.items || [];
    }

    return Response.json({
      profile: profile ? { full_name: profile.full_name, employee_number: profile.employee_number || '', position: profile.position || '', hourly_rate: profile.hourly_rate ?? null } : null,
      payroll_detail: (detailPage.items || [])[0] || null,
      payslips: payslipPage.items || [],
      timesheets: shifts,
      change_log: logPage.items || [],
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}