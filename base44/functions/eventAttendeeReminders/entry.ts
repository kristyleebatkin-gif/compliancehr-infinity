import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { auDate, addDays, pretty } from '../../shared/reminders.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const extractEmails = (text) => String(text || '').match(/[^\s,;]+@[^\s,;]+\.[^\s,;]+/g) || [];

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    if (!(await authorizeSystemCall(base44))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const service = base44.asServiceRole;

    const today = auDate(new Date());
    const horizon = addDays(today, 7);

    const page = await service.entities.Event.filter(
      { status: { $in: ['Planned', 'Ongoing'] } },
      { limit: 200, sort: 'date' },
    );
    const upcoming = (page.items || []).filter((e) => e.date && e.date >= today && e.date <= horizon);
    if (!upcoming.length) return Response.json({ ok: true, checked: upcoming.length, emails_sent: 0 });

    let sent = 0;
    const failures = [];
    for (const ev of upcoming) {
      const recipients = new Set(
        [ev.contact_email, ...(extractEmails(ev.attendees)), ...(extractEmails(ev.invited_to))]
          .map((e) => String(e || '').trim().toLowerCase())
          .filter((e) => EMAIL_RE.test(e)),
      );
      if (!recipients.size) continue;
      for (const to of recipients) {
        try {
          await service.integrations.Core.SendEmail({
            to,
            subject: `Weekly reminder: ${ev.title} on ${pretty(ev.date)}`,
            from_name: 'ComplianceHR Infinity',
            body: `Weekly reminder for an upcoming ${String(ev.type || 'Program').toLowerCase()}.\n\nTitle: ${ev.title}\nDate: ${pretty(ev.date)}${ev.end_date ? ` to ${pretty(ev.end_date)}` : ''}\nTime: ${ev.start_time || '-'}${ev.end_time ? ` - ${ev.end_time}` : ''}\nLocation: ${ev.location || '-'}\nOrganiser: ${ev.organiser || '-'}\n\nDetails: ${ev.description || '-'}\n\nThis is a weekly reminder sent every Monday until the date passes. Contact the organiser if you can no longer attend.`,
          });
          sent += 1;
        } catch (error) {
          failures.push(String(error?.message || error));
        }
      }
    }
    return Response.json({ ok: true, checked: upcoming.length, emails_sent: sent, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});