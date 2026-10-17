import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const to = String(body.to || '').trim();
    const subject = String(body.subject || '').trim().slice(0, 200);
    const message = String(body.body || '').trim().slice(0, 5000);
    if (!EMAIL_RE.test(to) || !subject || !message) {
      return Response.json({ error: 'A valid recipient, subject and message are required' }, { status: 400 });
    }

    const attachments = Array.isArray(body.attachments)
      ? body.attachments
        .slice(0, 5)
        .filter((item) => item && String(item.filename || '').trim() && String(item.content || '').trim())
        .map((item) => ({ filename: String(item.filename).trim(), content: String(item.content) }))
      : undefined;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to,
      subject,
      body: message,
      from_name: 'ComplianceHR Infinitely',
      ...(attachments && attachments.length ? { attachments } : {}),
    });

    return Response.json({ ok: true, to, subject });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}