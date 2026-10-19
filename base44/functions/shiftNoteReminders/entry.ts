import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { auDate } from '../../shared/reminders.ts';

const norm = (v) => String(v || '').trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    if (!(await authorizeSystemCall(base44))) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const service = base44.asServiceRole;

    const today = auDate(new Date());

    // Completed shifts (finished or ended) up to and including today.
    const completed = [];
    let cursor = null;
    do {
      const page = await service.entities.Shift.filter(
        { status: 'Completed' },
        { limit: 200, ...(cursor ? { cursor } : {}) },
      );
      completed.push(...(page.items || []));
      cursor = page.has_more ? page.next_cursor : null;
    } while (cursor);
    const due = completed.filter((s) => s.employee_name && s.date && s.date <= today);

    // Shift notes already recorded, matched on staff + participant + date.
    const notes = [];
    let noteCursor = null;
    do {
      const page = await service.entities.ShiftNote.filter(
        {},
        { limit: 200, ...(noteCursor ? { cursor: noteCursor } : {}) },
      );
      notes.push(...(page.items || []));
      noteCursor = page.has_more ? page.next_cursor : null;
    } while (noteCursor);
    const noted = new Set(notes.map((n) => `${norm(n.staff_name)}|${norm(n.participant_name)}|${n.date}`));

    const missing = due.filter((s) => !noted.has(`${norm(s.employee_name)}|${norm(s.participant_name)}|${s.date}`));
    if (!missing.length) return Response.json({ ok: true, checked: due.length, overdue: 0, emails_sent: 0 });

    const staffPage = await service.entities.StaffProfile.filter({}, { limit: 1000, fields: ['full_name', 'email'] });
    const emailByName = new Map(staffPage.items.map((s) => [norm(s.full_name), String(s.email || '').trim()]));

    let sent = 0;
    const failures = [];
    for (const shift of missing) {
      const to = emailByName.get(norm(shift.employee_name));
      if (!to || !EMAIL_RE.test(to)) continue;
      try {
        await service.integrations.Core.SendEmail({
          to,
          subject: `Shift note overdue: ${shift.participant_name || 'participant'} on ${shift.date}`,
          from_name: 'ComplianceHR Infinity',
          body: `Your shift note is overdue.\n\nEmployee: ${shift.employee_name}\nParticipant: ${shift.participant_name || '-'}\nShift date: ${shift.date}\nTime: ${shift.start_time || '-'} to ${shift.end_time || '-'}\nService: ${shift.service_type || '-'}\n\nPlease open the Communication Centre, record the shift note for this shift, and save it. You will receive this reminder daily until the note is recorded.`,
        });
        sent += 1;
      } catch (error) {
        failures.push(String(error?.message || error));
      }
    }
    return Response.json({ ok: true, checked: due.length, overdue: missing.length, emails_sent: sent, failures });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}