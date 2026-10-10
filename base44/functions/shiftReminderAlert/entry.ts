import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';

const SYDNEY = 'Australia/Sydney';
const prettyDate = (iso) => new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));

// Convert a Sydney-local date + time string ("2026-10-12", "07:30") to an epoch timestamp
function sydneyLocalToEpoch(dateStr, timeStr) {
  let ts = Date.parse(`${dateStr}T${timeStr}:00Z`);
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: SYDNEY, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false });
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

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const dryRun = !!body.dry_run;

    const service = base44.asServiceRole;

    // Window: shift starts between 23 and 25 hours from now (hourly runs hit each shift at least once)
    const now = Date.now();
    const from = now + 23 * 60 * 60 * 1000;
    const to = now + 25 * 60 * 60 * 1000;

    const [shiftPage, staffPage] = await Promise.all([
      service.entities.Shift.filter({}, { limit: 500, sort: '-date' }),
      service.entities.StaffProfile.list({ limit: 500 }),
    ]);
    const shifts = (shiftPage.items || []).filter((s) => s.date && s.start_time && !s.reminder_sent);
    const staffByName = new Map((staffPage.items || []).map((s) => [String(s.full_name || '').toLowerCase(), s]));

    const due = [];
    const unmatched = [];
    for (const shift of shifts) {
      if (shift.status === 'Cancelled' || shift.status === 'Missed') continue;
      if (!shift.employee_name) continue;
      const startEpoch = sydneyLocalToEpoch(shift.date, shift.start_time);
      if (!(startEpoch >= from && startEpoch < to)) continue;
      const staff = staffByName.get(String(shift.employee_name).toLowerCase());
      const email = (staff?.email || '').trim().toLowerCase();
      if (!email) { unmatched.push(shift.employee_name); continue; }
      due.push({ shift, email, staff, startEpoch });
    }

    if (dryRun) {
      return Response.json({
        dry_run: true,
        window_from: new Date(from).toISOString(),
        window_to: new Date(to).toISOString(),
        would_notify: due.map((d) => ({ to: d.email, shift: `${d.shift.date} ${d.shift.start_time} - ${d.shift.employee_name}`, participant: d.shift.participant_name || '' })),
        unmatched,
      });
    }

    const results = await Promise.allSettled(due.map((d) =>
      service.integrations.Core.SendEmail({
        to: d.email,
        template_name: 'ShiftReminder',
        variables: {
          first_name: String(d.staff?.full_name || d.shift.employee_name || '').split(' ')[0] || 'there',
          shift_date: prettyDate(d.shift.date),
          start_time: d.shift.start_time,
          end_time: d.shift.end_time || '',
          participant_name: d.shift.participant_name || 'Not assigned',
          service_type: d.shift.service_type || 'Support shift',
          location: d.shift.location || '',
        },
      })
    ));

    // Mark sent shifts so each reminder goes out once
    const succeeded = due.filter((_, i) => results[i].status === 'fulfilled');
    for (let i = 0; i < succeeded.length; i += 500) {
      await service.entities.Shift.bulkUpdate(succeeded.slice(i, i + 500).map((d) => ({ id: d.shift.id, reminder_sent: true })));
    }

    const failed = due.filter((_, i) => results[i].status === 'rejected').map((d) => d.email);
    return Response.json({
      checked: shifts.length,
      sent_to: succeeded.map((d) => d.email),
      failed,
      unmatched,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}