import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ALLOWED_SENDERS = ['admin', 'Provider Administrator', 'Compliance Manager', 'Quality & Improvement Manager'];
const DIGEST_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Quality & Improvement Manager', 'Administration'];

// Weekly resolution status report: aggregates the Compliance Issues register
// server-side and emails a branded digest to management roles.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!ALLOWED_SENDERS.includes(user.role)) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const svc = base44.asServiceRole;
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

    const [byStatus, byCategory, overdueCount, resolvedThisWeek, users] = await Promise.all([
      svc.entities.ComplianceIssue.aggregate({ groupBy: 'status' }),
      svc.entities.ComplianceIssue.aggregate({ groupBy: 'category', sort: '-count' }),
      svc.entities.ComplianceIssue.count({ status: { $in: ['Open', 'In Progress'] }, target_date: { $lt: today } }),
      svc.entities.ComplianceIssue.count({ status: { $in: ['Resolved', 'Closed'] }, resolved_date: { $gte: weekAgo } }),
      svc.entities.User.list(),
    ]);

    const statusRows = byStatus.rows || [];
    const get = (s) => statusRows.find((r) => r.status === s)?.count || 0;
    const open = get('Open');
    const progress = get('In Progress');
    const resolvedTotal = get('Resolved') + get('Closed');
    const total = statusRows.reduce((a, r) => a + (r.count || 0), 0);
    const categories = (byCategory.rows || []).slice(0, 6);

    const recipients = (users || []).filter((u) => DIGEST_ROLES.includes(u.role) && u.email).map((u) => u.email);
    if (recipients.length === 0) {
      return Response.json({ sent: 0, recipients: [], total, open, in_progress: progress, resolved_total: resolvedTotal, resolved_this_week: resolvedThisWeek, overdue: overdueCount });
    }

    const dateLabel = new Date().toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const stat = (value, label, tint) => `
      <td style="width:25%; padding:4px;">
        <div style="background:${tint}; border-radius:12px; padding:12px 14px;">
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:22px; font-weight:800; color:#0f1729;">${value}</div>
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:11px; color:#6b7280;">${esc(label)}</div>
        </div>
      </td>`;
    const catRows = categories.map((c, i) => `
      <tr style="background:${i % 2 ? '#faf9fc' : '#ffffff'};">
        <td style="padding:8px 12px; font-family:'Manrope',Arial,sans-serif; font-size:13px; color:#404040;">${esc(c.category || 'Other')}</td>
        <td style="padding:8px 12px; text-align:right; font-family:'Manrope',Arial,sans-serif; font-size:13px; font-weight:700; color:#0f1729;">${c.count || 0}</td>
      </tr>`).join('');

    const html = `
    <div style="margin:0; padding:0; background:#f8fafc;">
      <div style="max-width:600px; margin:0 auto; padding:24px 12px;">
        <div style="background:#7c3bed; color:#ffffff; padding:20px 24px; border-radius:24px 24px 0 0;">
          <img src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/e772c8399_logo.jpg" alt="ComplianceHR Infinity" width="40" style="display:block; border-radius:8px;" />
          <div style="font-family:'Fraunces',Georgia,serif; font-size:20px; font-weight:700; margin-top:10px;">Compliance Issues Weekly Digest</div>
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:13px; opacity:0.9; margin-top:4px;">Resolution status across the register, ${esc(dateLabel)}</div>
        </div>
        <div style="background:#ffffff; border:1px solid #e5e7eb; border-top:none; padding:20px 24px 12px; border-radius:0 0 24px 24px;">
          <table style="width:100%; border-collapse:separate; border-spacing:0;">
            <tr>
              ${stat(total, 'Total issues', '#f3eef9')}
              ${stat(open, 'Open', '#fff4e5')}
            </tr>
            <tr>
              ${stat(progress, 'In progress', '#eef4fb')}
              ${stat(overdueCount, 'Past target date', '#fdeaea')}
            </tr>
          </table>
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:14px; color:#0f1729; font-weight:700; margin:16px 0 4px;">This week</div>
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:13px; color:#404040; line-height:1.6;">
            ${resolvedThisWeek} issue(s) resolved in the last 7 days, ${resolvedTotal} resolved in total. ${overdueCount > 0 ? `${overdueCount} issue(s) are past their target date and need attention.` : 'Nothing is past its target date.'}
          </div>
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:14px; color:#0f1729; font-weight:700; margin:16px 0 6px;">Issues by category</div>
          <table style="width:100%; border-collapse:collapse; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden;">
            <tr style="background:#f3eef9;">
              <th style="padding:8px 12px; text-align:left; font-family:'Manrope',Arial,sans-serif; font-size:11px; color:#0f1729; text-transform:uppercase;">Category</th>
              <th style="padding:8px 12px; text-align:right; font-family:'Manrope',Arial,sans-serif; font-size:11px; color:#0f1729; text-transform:uppercase;">Issues</th>
            </tr>
            ${catRows || '<tr><td colspan="2" style="padding:10px 12px; font-family:Manrope,Arial,sans-serif; font-size:13px; color:#737373;">No issues logged yet.</td></tr>'}
          </table>
          <div style="text-align:center; margin-top:16px;">
            <a href="https://compliancehrinfinity.com/compliance" style="display:inline-block; background:#7c3bed; color:#ffffff; text-decoration:none; font-family:'Manrope',Arial,sans-serif; font-weight:700; font-size:14px; padding:12px 28px; border-radius:24px;">Open the Compliance Issues register</a>
          </div>
          <div style="font-family:'Manrope',Arial,sans-serif; font-size:11px; color:#737373; text-align:center; padding:12px 0 4px;">
            ComplianceHR Infinity · Complete Control. Greater Confidence. Brighter Success.
          </div>
        </div>
      </div>
    </div>`;

    const subject = `Weekly compliance issues digest — ${open + progress} unresolved, ${overdueCount} overdue`;
    let sent = 0;
    for (const to of recipients) {
      try {
        await svc.integrations.Core.SendEmail({ to, from_name: 'ComplianceHR Infinity', subject, html });
        sent += 1;
      } catch (e) {
        console.error('digest email failed for', to, e.message);
      }
    }

    return Response.json({ sent, recipients, total, open, in_progress: progress, resolved_total: resolvedTotal, resolved_this_week: resolvedThisWeek, overdue: overdueCount });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}