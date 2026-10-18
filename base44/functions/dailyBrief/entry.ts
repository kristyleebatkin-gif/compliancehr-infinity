import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

// Daily brief: org-wide snapshot of what needs attention today.
// Called by the dashboard panel (no notify) and by the scheduled "Daily Brief"
// workflow with { notify: true } to email administrators.

const MANAGEMENT_ROLES = [
  'admin', 'Provider Administrator', 'Compliance Manager', 'Administration',
  'Team Leader', 'Human Resources Manager', 'Finance & Accounts Officer',
  'Quality & Improvement Manager', 'Rostering Coordinator',
];

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const esc = (text) => String(text || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function sectionHtml(title, colour, count, lines) {
  const body = lines.length
    ? lines.map((line) => `<li style="margin:0 0 4px;">${esc(line)}</li>`).join('')
    : '<li style="margin:0; color:#737373;">Nothing to report.</li>';
  return `
  <div style="background:#ffffff; border:1px solid #e5e7eb; border-radius:6px; padding:14px 16px; margin-bottom:12px;">
    <div style="font-weight:700; font-size:14px; color:#0a0a0a;">
      <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:${colour}; margin-right:6px;"></span>
      ${esc(title)}: <strong>${count}</strong>
    </div>
    <ul style="margin:8px 0 0; padding-left:18px; font-size:13px; color:#404040; line-height:1.5;">${body}</ul>
  </div>`;
}

function briefEmailHtml(brief) {
  const b = brief;
  return `
  <div style="font-family:Arial, Helvetica, sans-serif; background:#f4f4f5; padding:24px;">
    <div style="max-width:600px; margin:0 auto;">
      <div style="background:#7c3bed; color:#ffffff; padding:16px 20px; border-radius:6px 6px 0 0;">
        <div style="font-size:18px; font-weight:700;">ComplianceHR Infinitely — Morning Brief</div>
        <div style="font-size:12px; opacity:0.85; margin-top:4px;">${esc(b.date_label)}</div>
      </div>
      <div style="background:#ffffff; border:1px solid #e5e7eb; border-top:none; padding:16px; border-radius:0 0 6px 6px;">
        ${sectionHtml('Documents expiring in 30 days', '#d97706', b.expiring_docs.total, b.expiring_docs.lines)}
        ${sectionHtml('Expired documents', '#dc2626', b.expired_docs.total, b.expired_docs.lines)}
        ${sectionHtml('Overdue tasks', '#db2777', b.overdue_tasks.total, b.overdue_tasks.lines)}
        ${sectionHtml('Unfilled shifts (next 7 days)', '#dc2626', b.unfilled_shifts.total, b.unfilled_shifts.lines)}
        ${sectionHtml('Shifts awaiting approval', '#2563eb', b.pending_approvals, ['Open the Rostering &gt; Approvals tab to action these.'])}
        ${sectionHtml('Leave requests pending', '#d97706', b.pending_leave, ['Open the HR Hub to review.'])}
        <div style="font-size:12px; color:#737373; text-align:center; padding:8px 0 0;">
          Complete Control. Greater Confidence. Brighter Success.
        </div>
      </div>
    </div>
  </div>`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!MANAGEMENT_ROLES.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const today = dateOffset(0);
    const in30 = dateOffset(30);
    const in7 = dateOffset(7);
    const s = base44.asServiceRole.entities;

    const [expiringCount, expiredCount, overdueTaskCount, unfilledCount, approvals, leave, expiringPage, expiredPage, taskPage, shiftPage] = await Promise.all([
      s.EmployeeDocument.count({ expiry_date: { $gte: today, $lte: in30 }, status: { $ne: 'Archived' } }),
      s.EmployeeDocument.count({ expiry_date: { $lt: today }, status: { $ne: 'Archived' } }),
      s.TodoTask.count({ status: 'Pending', due_date: { $lt: today } }),
      s.Shift.count({ date: { $gte: today, $lte: in7 }, employee_name: null }),
      s.Shift.count({ approval_status: 'Pending Approval' }),
      s.LeaveRequest.count({ status: 'Pending' }),
      s.EmployeeDocument.filter({ expiry_date: { $gte: today, $lte: in30 }, status: { $ne: 'Archived' } }, { sort: 'expiry_date', limit: 5, fields: ['title', 'employee_name', 'expiry_date', 'document_type'] }),
      s.EmployeeDocument.filter({ expiry_date: { $lt: today }, status: { $ne: 'Archived' } }, { sort: '-expiry_date', limit: 5, fields: ['title', 'employee_name', 'expiry_date', 'document_type'] }),
      s.TodoTask.filter({ status: 'Pending', due_date: { $lt: today } }, { sort: 'due_date', limit: 5, fields: ['title', 'due_date'] }),
      s.Shift.filter({ date: { $gte: today, $lte: in7 }, employee_name: null }, { sort: 'date', limit: 5, fields: ['date', 'participant_name', 'start_time', 'end_time'] }),
    ]);

    const brief = {
      date_label: new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
      expiring_docs: { total: expiringCount, lines: expiringPage.items.map((d) => `${d.document_type || 'Document'}: ${d.title || 'Untitled'} — ${d.employee_name || 'Unassigned'} (${d.expiry_date})`) },
      expired_docs: { total: expiredCount, lines: expiredPage.items.map((d) => `${d.document_type || 'Document'}: ${d.title || 'Untitled'} — ${d.employee_name || 'Unassigned'} (expired ${d.expiry_date})`) },
      overdue_tasks: { total: overdueTaskCount, lines: taskPage.items.map((t) => `${t.title} (due ${t.due_date})`) },
      unfilled_shifts: { total: unfilledCount, lines: shiftPage.items.map((sh) => `${sh.date}: ${sh.start_time || ''}–${sh.end_time || ''} ${sh.participant_name || ''}`.trim()) },
      pending_approvals: approvals,
      pending_leave: leave,
    };

    if (body.notify) {
      const adminRecords = await s.User.list();
      const admins = { items: (Array.isArray(adminRecords) ? adminRecords : adminRecords.items || [])
        .filter((u) => ['admin', 'Provider Administrator'].includes(u.role)).slice(0, 10) };
      const html = briefEmailHtml(brief);
      await Promise.allSettled((admins.items || []).map((admin) =>
        base44.asServiceRole.integrations.Core.SendEmail({
          to: admin.email,
          subject: `Morning brief — ${brief.date_label}`,
          html,
          from_name: 'ComplianceHR Infinitely',
        }),
      ));
    }

    return Response.json({ brief });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}