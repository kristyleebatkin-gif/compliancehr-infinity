import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { BUSINESS_TIME_ZONE } from '../../shared/reminders.ts';

const norm = (v) => String(v || '').trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Business-local (Brisbane) date + "HH:MM" to epoch, corrected for DST offsets.
function businessLocalToEpoch(dateStr, timeStr) {
  let ts = Date.parse(`${dateStr}T${timeStr}:00Z`);
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
  for (let i = 0; i < 3; i++) {
    const parts = Object.fromEntries(fmt.formatToParts(new Date(ts)).map((p) => [p.type, p.value]));
    const haveTs = Date.parse(`${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`);
    const wantTs = Date.parse(`${dateStr}T${timeStr}:00Z`);
    const delta = wantTs - haveTs;
    if (delta === 0) break;
    ts += delta;
  }
  return ts;
}

const CHECKLIST = [
  '1. Licence, registration and insurance current',
  '2. Tyres, lights and indicators in good condition',
  '3. Fuel / charge level sufficient for the shift including travel',
  '4. First aid kit, fire extinguisher and emergency contact card on board',
  '5. Child restraints / mobility equipment secured as required',
  '6. Phone charged and Take Five completed before driving',
];

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    if (!(await authorizeSystemCall(base44))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const service = base44.asServiceRole;

    const now = Date.now();
    const from = now;               // already started counts as at-the-door
    const to = now + 10 * 60 * 1000; // 5-min cadence with a 10-min window

    // Upcoming shifts today with an assigned employee, not cancelled or missed.
    const today = new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
    const page = await service.entities.Shift.filter({ date: today }, { limit: 500 });
    const upcoming = (page.items || []).filter((s) =>
      s.employee_name && s.date && s.start_time &&
      s.status !== 'Cancelled' && s.status !== 'Missed');

    if (!upcoming.length) return Response.json({ ok: true, checked: 0, sent: 0 });

    // Dedupe: one car safety check per shift, ever.
    const keys = upcoming.map((s) => `car_safety:${s.id}`);
    const existing = await service.entities.PushLog.filter({ key: { $in: keys } }, { limit: 500, fields: ['key'] });
    const alreadySent = new Set((existing.items || []).map((p) => p.key));

    const staffPage = await service.entities.StaffProfile.filter({}, { limit: 1000, fields: ['full_name', 'email'] });
    const emailByName = new Map(staffPage.items.map((s) => [norm(s.full_name), String(s.email || '').trim()]));

    let sent = 0;
    const failures = [];
    for (const shift of upcoming) {
      if (alreadySent.has(`car_safety:${shift.id}`)) continue;
      const startEpoch = businessLocalToEpoch(shift.date, shift.start_time);
      if (!(startEpoch >= from && startEpoch < to)) continue;
      const email = emailByName.get(norm(shift.employee_name));
      if (!email || !EMAIL_RE.test(email)) continue;
      try {
        await service.integrations.Core.SendEmail({
          to: email,
          subject: `Car safety check before your shift at ${shift.start_time} (${shift.participant_name || 'participant'})`,
          from_name: 'ComplianceHR Infinity',
          body: `Car safety check - 5 minutes before your shift.\n\nEmployee: ${shift.employee_name}\nParticipant: ${shift.participant_name || '-'}\nShift: ${shift.date} ${shift.start_time} - ${shift.end_time || '-'}\nService: ${shift.service_type || '-'}\nLocation: ${shift.location || '-'}\n\nBefore driving, confirm:\n${CHECKLIST.join('\n')}\n\nRecord the completed car safety check in Safety Checks (Compliance Hub). The completed check is saved to your staff profile and the document hub.`,
        });
        await service.entities.PushLog.create({ key: `car_safety:${shift.id}`, sent_at: new Date(now).toISOString(), recipient_id: shift.employee_name });
        sent += 1;
      } catch (error) {
        failures.push(String(error?.message || error));
      }
    }
    return Response.json({ ok: true, checked: upcoming.length, emails_sent: sent, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});