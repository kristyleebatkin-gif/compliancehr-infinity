import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { auDate, pretty } from '../../shared/reminders.ts';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const extractEmails = (text) => String(text || '').match(/[^\s,;]+@[^\s,;]+\.[^\s,;]+/g) || [];

// Sends a 24-hour and a 12-hour reminder email to every attendee of an
// upcoming scheduled meeting. Runs hourly from the scheduled workflow; the
// PushLog dedupe key stops anyone getting the same reminder twice.
export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    if (!(await authorizeSystemCall(base44))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const service = base44.asServiceRole;

    const page = await service.entities.Meeting.filter(
      { status: 'Scheduled' },
      { limit: 200, sort: 'date' },
    );
    const now = Date.now();
    const sent = [];
    const skipped = [];

    for (const m of page.items || []) {
      if (!m.date) continue;
      const startsAt = new Date(`${m.date}T${m.time || '09:00'}:00`);
      const hoursAhead = (startsAt.getTime() - now) / 3600000;
      const bucket = hoursAhead > 18 && hoursAhead <= 24 ? '24'
        : hoursAhead > 11 && hoursAhead <= 12.5 ? '12' : null;
      if (!bucket) continue;

      const recipients = new Set([
        ...extractEmails(m.attendee_emails),
        ...extractEmails(m.attendees),
      ].map((e) => String(e || '').trim().toLowerCase()).filter((e) => EMAIL_RE.test(e)));
      if (!recipients.size) { skipped.push({ meeting: m.title, reason: 'no attendee emails' }); continue; }

      const body = `Reminder: "${m.title}" starts in about ${bucket} hours.\n\nMeeting: ${m.title}\nType: ${m.meeting_type || '-'}\nDate: ${pretty(m.date)}\nTime: ${m.time || '-'}${m.duration ? ` (${m.duration})` : ''}\nLocation: ${m.location || '-'}${m.meeting_link ? `\nJoin online: ${m.meeting_link}` : ''}\nChair: ${m.chair || '-'}\n\nPurpose: ${m.purpose || '-'}\n\nAgenda:\n${m.agenda || '-'}\n\nPlease come prepared. This reminder is sent automatically 24 hours and 12 hours before the meeting starts.`;

      for (const to of recipients) {
        const key = `meeting_${bucket}h_${m.id}_${to}`;
        const existing = await service.entities.PushLog.filter({ key }, { limit: 1 });
        if ((existing.items || []).length) continue;
        try {
          await service.integrations.Core.SendEmail({
            to,
            subject: `${bucket}h reminder: ${m.title} - ${pretty(m.date)} ${m.time || ''}`.trim(),
            from_name: 'ComplianceHR Infinity',
            body,
          });
          await service.entities.PushLog.create({ key, sent_at: new Date().toISOString(), recipient_id: to });
          sent.push(`${to} (${bucket}h, ${m.title})`);
        } catch (error) {
          skipped.push({ meeting: m.title, to, reason: String(error?.message || error) });
        }
      }
    }
    return Response.json({ ok: true, sent: sent.length, details: sent, skipped });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});