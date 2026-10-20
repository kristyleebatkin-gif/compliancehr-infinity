import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

// Emails a generated payslip to the employee's registered app-user address.
const PAYROLL_ROLES = ['admin', 'Provider Administrator', 'Administration', 'Finance & Accounts Officer'];
const money = (v) => `$${Number(v || 0).toFixed(2)}`;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me().catch(() => null);
    if (!me || !PAYROLL_ROLES.includes(me.role)) {
      return Response.json({ error: 'Not authorised to email payslips.' }, { status: 403 });
    }
    const body = await req.json().catch(() => ({}));
    const payslipId = String(body.payslip_id || '');
    if (!payslipId) return Response.json({ error: 'Payslip is required.' }, { status: 400 });

    const service = base44.asServiceRole;
    const payslip = await service.entities.Payslip.get(payslipId);
    if (!payslip) return Response.json({ error: 'Payslip not found.' }, { status: 404 });

    const to = payslip.sent_to || (payslip.employee_email || '');
    if (!to) return Response.json({ error: 'No employee email recorded on this payslip.' }, { status: 400 });

    const first = String(payslip.employee_name || '').split(' ')[0] || 'there';
    await service.integrations.Core.SendEmail({
      to,
      template_name: 'PayslipEmail',
      variables: {
        first_name: first,
        pay_period_start: payslip.pay_period_start || '',
        pay_period_end: payslip.pay_period_end || '',
        pay_date: payslip.pay_date || '',
        gross: money(payslip.gross),
        payg_tax: money(payslip.payg_tax),
        super_amount: money(payslip.superannuation),
        net: money(payslip.net),
        hours_worked: String(payslip.hours_worked ?? ''),
      },
    });

    await service.entities.Payslip.update(payslip.id, {
      status: payslip.status === 'Paid' ? 'Paid' : 'Sent',
      sent_at: new Date().toISOString(),
      sent_to: to,
    });
    return Response.json({ sent: true, to });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}