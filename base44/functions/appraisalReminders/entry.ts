import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APP_URL = 'https://polite-safe-hire-flow.base44.app';
const MANAGER_EMAIL = 'kristyleebatkin@live.com.au';
const WARN_DAYS = 7;

function daysBetween(fromStr, toStr) {
  return Math.round((new Date(toStr + 'T00:00:00Z') - new Date(fromStr + 'T00:00:00Z')) / 86400000);
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const service = base44.asServiceRole;

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
    const horizon = new Date(Date.now() + WARN_DAYS * 24 * 3600 * 1000).toISOString().slice(0, 10);

    // Reviews scheduled within the next 7 days (or overdue but not done).
    const due = await service.entities.PerformanceReview.filter(
      { status: { $in: ['Scheduled', 'In Progress'] }, review_date: { $ne: null, $lte: horizon } },
      { limit: 100 },
    );

    let sent = 0;
    const failures = [];
    for (const review of (due.items || [])) {
      if (!review.review_date) continue;
      const subject = `[Appraisal reminder] ${review.review_type || 'Performance review'} for ${review.staff_name} on ${review.review_date}`;
      const alreadyLogged = await service.entities.CommunicationEntry.filter(
        { subject, entry_date: today }, { limit: 1 },
      );
      if ((alreadyLogged.items || []).length) continue;

      const reviewer = String(review.reviewer || '').trim();
      // Resolve the reviewer's email from their staff profile, else the registered manager.
      let to = MANAGER_EMAIL;
      if (reviewer) {
        try {
          const staff = await service.entities.StaffProfile.filter({ full_name: reviewer }, { limit: 1 });
          const email = (staff.items || [])[0]?.email;
          if (email && EMAIL_RE.test(email)) to = email;
        } catch (_) { /* fall back to manager */ }
      }

      const days = daysBetween(today, review.review_date);
      const when = days === 0 ? 'is TODAY' : days > 0 ? `is in ${days} day${days === 1 ? '' : 's'}` : `was ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`;
      const emailBody = `Appraisal reminder\n\n${review.review_type || 'Performance review'} for ${review.staff_name} ${when} (scheduled ${review.review_date}).\nReviewer: ${reviewer || 'Unassigned'}\nStatus: ${review.status}\n\nPrepare the review pack and complete it in the HR Hub: ${APP_URL}/hr\n\nThis is an automated reminder from ComplianceHR Portal.`;

      try {
        await service.integrations.Core.SendEmail({ to, from_name: 'ComplianceHR Portal', subject, body: emailBody });
        await service.entities.CommunicationEntry.create({
          entry_kind: 'Message',
          person_type: 'Employee',
          attention: reviewer || 'Manager',
          subject,
          body: emailBody,
          entry_date: today,
          entry_time: new Date().toLocaleTimeString('en-AU', { timeZone: 'Australia/Brisbane', hour12: false }).slice(0, 5),
          recipients_json: JSON.stringify([{ name: reviewer || 'Manager', email: to }]),
          sender_name: 'Automated Appraisal Reminder',
          sender_email: 'system@compliancehr-portal',
          module: 'HR',
        });
        sent += 1;
      } catch (error) {
        failures.push(String(error?.message || error));
      }
    }
    return Response.json({ ok: true, checked: (due.items || []).length, emails_sent: sent, failures });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
}