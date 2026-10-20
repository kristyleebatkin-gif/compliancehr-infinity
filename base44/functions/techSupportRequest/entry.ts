import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';

const SUPPORT_EMAIL = 'kristyleebatkin@live.com.au';

function escapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const kind = body.kind === 'support_ticket' ? 'Support desk request' : 'Technical support request';
    const subject = String(body.subject || '').trim().slice(0, 200);
    const description = String(body.description || '').trim().slice(0, 4000);
    if (!subject || !description) {
      return Response.json({ error: 'Subject and description are required' }, { status: 400 });
    }

    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
    const rows = [
      ['Requested by', user.full_name || ''],
      ['Email', user.email || ''],
      ['Role', user.role || ''],
      ['Module', String(body.module || '')],
      ...Object.entries(answers).map(([label, value]) => [label, String(value ?? '')]),
    ];
    const rowsHtml = rows
      .filter(([, value]) => value)
      .map(([label, value]) => `<tr><td style="padding:6px 10px;border:1px solid #e5e7eb;font-weight:700;background:#f8fafc">${escapeHtml(label)}</td><td style="padding:6px 10px;border:1px solid #e5e7eb">${escapeHtml(value)}</td></tr>`)
      .join('');

    const html = `<div style="font-family:Arial,sans-serif;color:#0f1729">` +
      `<p>A new <strong>${escapeHtml(kind.toLowerCase())}</strong> was submitted in ComplianceHR Infinity.</p>` +
      `<p><strong>${escapeHtml(subject)}</strong></p>` +
      `<p style="white-space:pre-wrap">${escapeHtml(description)}</p>` +
      `<table style="border-collapse:collapse;font-size:13px">${rowsHtml}</table>` +
      `</div>`;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: SUPPORT_EMAIL,
      subject: `[ComplianceHR Infinity] ${kind}: ${subject}`,
      html,
      from_name: 'ComplianceHR Support Desk',
    });

    // Log the ticket so the requester can track a response. Best effort only.
    try {
      await base44.asServiceRole.entities.HelpDeskTicket.create({
        subject,
        module: String(body.module || ''),
        description,
        priority: String(body.priority || 'Medium'),
        requested_by: user.full_name || 'App user',
        requested_email: user.email || '',
        status: 'Open',
      });
    } catch (logError) {
      // The email already went out; ticket logging is secondary.
    }

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}