import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { MANAGEMENT_ROLES, STAFF_SEND_ROLES, hasAnyRole, appContactEmails } from '../../shared/systemAuth.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const esc = (v) => String(v ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const nl2p = (v) => String(v ?? '')
  .split(/\n{2,}/)
  .map((p) => `<p style="margin:0 0 14px;">${esc(p).replace(/\n/g, '<br/>')}</p>`)
  .join('');

const asList = (res) => (Array.isArray(res) ? res : (res?.items || []));

export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const recipients = (Array.isArray(body.recipients) ? body.recipients : String(body.recipients || '').split(/[,;]/))
      .map((r) => String(r || '').trim())
      .filter((r) => EMAIL_RE.test(r))
      .slice(0, 25);
    const subject = String(body.subject || '').trim().slice(0, 200);
    const attention = String(body.attention || '').trim().slice(0, 200);
    const greeting = (String(body.greeting || '').trim() || 'Greetings,').slice(0, 150);
    const message = String(body.body || '').trim().slice(0, 10000);
    const dateLine = String(body.date || '').trim()
      || new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
    if (!recipients.length || !subject || !message) {
      return Response.json({ error: 'At least one valid recipient, a subject and a message are required' }, { status: 400 });
    }

    // Only staff roles may send from the organisation's identity, and
    // non-management senders are limited to contacts stored in the app.
    if (!hasAnyRole(user, STAFF_SEND_ROLES)) {
      return Response.json({ error: 'Your role cannot send professional email' }, { status: 403 });
    }
    if (!hasAnyRole(user, MANAGEMENT_ROLES)) {
      const contacts = await appContactEmails(base44);
      const disallowed = recipients.find((r) => !contacts.has(r.toLowerCase()));
      if (disallowed) {
        return Response.json({ error: 'Recipients must be registered app users or contacts stored in the app' }, { status: 403 });
      }
    }
    const attachments = Array.isArray(body.attachments)
      ? body.attachments
        .slice(0, 5)
        .filter((a) => a && String(a.filename || '').trim() && String(a.file_url || a.content || '').trim())
        .map((a) => {
          const item = { filename: String(a.filename).trim() };
          if (a.content) item.content = String(a.content);
          else item.file_url = String(a.file_url);
          return item;
        })
      : undefined;

    const [businessPage, providerPage, contactsPage] = await Promise.allSettled([
      base44.asServiceRole.entities.BusinessDetails.list({ sort: '-created_date', limit: 1 }),
      base44.asServiceRole.entities.Provider.list({ sort: '-created_date', limit: 50 }),
      base44.asServiceRole.entities.Contact.filter({ category: 'Business' }, { limit: 8 }),
    ]);
    const biz = businessPage.status === 'fulfilled' ? (asList(businessPage.value)[0] || {}) : {};
    const providers = providerPage.status === 'fulfilled' ? asList(providerPage.value) : [];
    const logoUrl = (providers.find((p) => p.logo_url) || {}).logo_url
      || 'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3cedb4a2f_IMG_1221.jpeg';
    const keyPersonnel = contactsPage.status === 'fulfilled' ? asList(contactsPage.value) : [];

    const businessName = biz.business_name || 'ComplianceHR';

    const metaRows = [
      `<tr><td style="padding:4px 10px 4px 0;color:#737373;width:90px;font-size:13px;">Date</td><td style="padding:4px 0;font-size:13px;color:#0a0a0a;">${esc(dateLine)}</td></tr>`,
      `<tr><td style="padding:4px 10px 4px 0;color:#737373;font-size:13px;">Subject</td><td style="padding:4px 0;font-size:13px;font-weight:bold;color:#0a0a0a;">${esc(subject)}</td></tr>`,
      attention ? `<tr><td style="padding:4px 10px 4px 0;color:#737373;font-size:13px;">Attention</td><td style="padding:4px 0;font-size:13px;color:#0a0a0a;">${esc(attention)}</td></tr>` : '',
    ].filter(Boolean).join('');

    const contactLine = [biz.abn && `ABN ${esc(biz.abn)}`, biz.phone && `Phone ${esc(biz.phone)}`, biz.email && `Email ${esc(biz.email)}`]
      .filter(Boolean).join(' &nbsp;·&nbsp; ');

    const purposeRows = [
      biz.business_goal ? `<p style="margin:0 0 8px;"><strong>Our goal</strong><br/>${esc(biz.business_goal)}</p>` : '',
      biz.mission ? `<p style="margin:0 0 8px;"><strong>Our mission</strong><br/>${esc(biz.mission)}</p>` : '',
      biz.vision ? `<p style="margin:0 0 8px;"><strong>Our vision</strong><br/>${esc(biz.vision)}</p>` : '',
      biz.values ? `<p style="margin:0;"><strong>Our values</strong><br/>${esc(biz.values)}</p>` : '',
    ].filter(Boolean).join('');

    const personnelRows = keyPersonnel
      .map((p) => `<tr>
        <td style="padding:5px 12px 5px 0;font-size:12px;color:#0a0a0a;font-weight:bold;">${esc(p.name || '')}</td>
        <td style="padding:5px 12px 5px 0;font-size:12px;color:#737373;">${esc(p.role || '')}</td>
        <td style="padding:5px 12px 5px 0;font-size:12px;color:#737373;">${esc(p.phone || p.mobile || '')}</td>
        <td style="padding:5px 0;font-size:12px;color:#737373;">${esc(p.email || '')}</td>
      </tr>`)
      .join('');

    const html = `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f4f4f5;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
  <tr><td style="background:#0a0a0a;padding:20px 32px;">
    ${logoUrl ? `<img src="${esc(logoUrl)}" alt="${esc(businessName)} logo" height="42" style="display:block;border:0;margin-bottom:8px;" />` : ''}
    <div style="color:#ffffff;font-size:20px;font-weight:bold;font-family:Arial, Arial, sans-serif;">${esc(businessName)}</div>
  </td></tr>
  <tr><td style="padding:24px 32px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-bottom:2px solid #e5e7eb;padding-bottom:10px;margin-bottom:16px;">${metaRows}</table>
    <p style="margin:0 0 14px;font-size:15px;color:#0a0a0a;">${esc(greeting)}</p>
    ${nl2p(message)}
  </td></tr>
  <tr><td style="padding:0 32px 20px;">
    <p style="margin:0 0 4px;font-size:15px;color:#0a0a0a;">Kind regards,</p>
    <p style="margin:0;font-size:15px;font-weight:bold;color:#0a0a0a;">Administrative Team</p>
    <p style="margin:0 0 12px;font-size:14px;color:#0a0a0a;">${esc(businessName)}</p>
    <p style="margin:0;font-size:12px;color:#737373;">${contactLine}</p>
  </td></tr>
  ${purposeRows ? `<tr><td style="padding:0 32px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;"><tr><td style="padding:16px 20px;font-size:12px;color:#404040;line-height:1.6;">${purposeRows}</td></tr></table></td></tr>` : ''}
  ${personnelRows ? `<tr><td style="padding:0 32px 20px;">
    <p style="margin:0 0 8px;font-size:12px;font-weight:bold;color:#0a0a0a;text-transform:uppercase;letter-spacing:0.05em;">Key personnel</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #e5e7eb;">${personnelRows}</table>
  </td></tr>` : ''}
  <tr><td style="padding:14px 32px;border-top:1px solid #e5e7eb;background:#fafafa;">
    <p style="margin:0;font-size:11px;color:#737373;line-height:1.5;font-family:Arial, Arial, sans-serif;">CONFIDENTIALITY: This email and any attachments are confidential and intended solely for the named recipient. If you have received this email in error, please notify the sender and delete it. Any unauthorised use, disclosure, copying or distribution is prohibited. Personal information is handled in line with the Privacy Act 1988 (Cth) and the NDIS Practice Standards.</p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

    const results = [];
    for (let i = 0; i < recipients.length; i += 6) {
      const chunk = recipients.slice(i, i + 6);
      const settled = await Promise.allSettled(chunk.map((to) => base44.asServiceRole.integrations.Core.SendEmail({
        to,
        subject,
        html,
        from_name: businessName,
        ...(attachments && attachments.length ? { attachments } : {}),
      })));
      settled.forEach((r, idx) => results.push({ to: chunk[idx], ok: r.status === 'fulfilled' }));
    }
    const sent = results.filter((r) => r.ok).length;
    const failed = results.filter((r) => !r.ok).map((r) => r.to);
    if (!sent) {
      return Response.json({ error: 'All sends failed. Recipients must be registered app users unless a custom email domain is connected.' }, { status: 502 });
    }
    return Response.json({ ok: true, sent, failed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}