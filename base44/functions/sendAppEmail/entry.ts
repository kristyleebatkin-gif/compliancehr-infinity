import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { MANAGEMENT_ROLES, STAFF_SEND_ROLES, hasAnyRole, appContactEmails } from '../../shared/systemAuth.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const to = String(body.to || '').trim();
    const subject = String(body.subject || '').trim().slice(0, 200);
    const message = String(body.body || '').trim().slice(0, 5000);
    if (!EMAIL_RE.test(to) || !subject || !message) {
      return Response.json({ error: 'A valid recipient, subject and message are required' }, { status: 400 });
    }

    // Only staff roles may send from the organisation's identity, and
    // non-management senders are limited to contacts stored in the app.
    if (!hasAnyRole(user, STAFF_SEND_ROLES)) {
      return Response.json({ error: 'Your role cannot send app email' }, { status: 403 });
    }
    if (!hasAnyRole(user, MANAGEMENT_ROLES)) {
      const contacts = await appContactEmails(base44);
      if (!contacts.has(to.toLowerCase())) {
        return Response.json({ error: 'Recipients must be registered app users or contacts stored in the app' }, { status: 403 });
      }
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
      from_name: 'ComplianceHR Infinity',
      ...(attachments && attachments.length ? { attachments } : {}),
    });

    return Response.json({ ok: true, to, subject });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});