import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';

import { authorizeSystemCall } from '../../shared/systemAuth.ts';
import { auDate, addDays, pageItems } from '../../shared/reminders.ts';

const norm = (v) => String(v || '').trim().toLowerCase();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MANAGERS = new Set(['admin', 'Provider Administrator', 'Compliance Manager', 'Team Leader']);

export default perBusiness(async function(req) {
  try {
    const base44 = createScopedClientFromRequest(req);
    if (!(await authorizeSystemCall(base44))) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const service = base44.asServiceRole;
    const body = await req.json().catch(() => ({}));
    const dryRun = body.dry_run === true;
    const today = auDate(new Date());
    const all = async (entity, query = {}) => {
      const rows = []; let cursor = null; const seen = new Set();
      do {
        const page = await service.entities[entity].filter(query, { limit: 200, ...(cursor ? { cursor } : {}) });
        const items = pageItems(page);
        if (!Array.isArray(items)) throw new Error(entity + ' response not confirmed');
        rows.push(...items);
        cursor = page.has_more ? page.next_cursor : null;
        if (cursor && seen.has(cursor)) throw new Error(entity + ' pagination did not advance');
        if (cursor) seen.add(cursor);
        if (page.has_more && !cursor) throw new Error(entity + ' pagination incomplete');
      } while (cursor);
      return rows;
    };
    const [shifts, notes, staff] = await Promise.all([all('Shift', { status: 'Completed' }), all('ShiftNote'), all('StaffProfile')]);
    const endDate = (shift) => {
      if (shift.clock_out && Number.isFinite(Date.parse(shift.clock_out))) return auDate(new Date(shift.clock_out));
      return shift.start_time && shift.end_time && shift.end_time <= shift.start_time ? addDays(shift.date, 1) : shift.date;
    };
    const group = (row) => norm(row.employee_name || row.staff_name) + '|' + norm(row.participant_name) + '|' + row.date;
    const counts = new Map();
    for (const shift of shifts) counts.set(group(shift), (counts.get(group(shift)) || 0) + 1);
    const due = shifts.filter(s => s.employee_name && endDate(s) && endDate(s) < today);
    // Legacy name/date matching only establishes completion for a unique shift.
    // Multiple shifts on the same date remain unresolved rather than silently sharing one note.
    const missing = due.filter(s => !notes.some(n => n.shift_id === s.id || (!n.shift_id && counts.get(group(s)) === 1 && group(n) === group(s) && String(n.what_happened || '').trim())));
    const failures = []; let sent = 0, escalations = 0, plannedEmployee = 0, plannedManager = 0;
    const users = missing.length ? pageItems(await service.entities.User.list()) : [];
    const managers = users.filter(u => MANAGERS.has(u.role) && u.account_status !== 'Archived');
    for (const shift of missing) {
      const days = Math.floor((Date.parse(today + 'T00:00:00Z') - Date.parse(endDate(shift) + 'T00:00:00Z')) / 86400000);
      if (!Number.isFinite(days)) { failures.push({ shift_id: shift.id, step: 'date', error: 'Shift end date unknown' }); continue; }
      try {
        if (days <= 5) {
          plannedEmployee += 1;
          const matches = staff.filter(s => norm(s.full_name) === norm(shift.employee_name) && s.status !== 'Inactive');
          if (matches.length !== 1 || !EMAIL_RE.test(String(matches[0]?.email || '').trim())) {
            failures.push({ shift_id: shift.id, step: 'recipient', error: 'Employee identity/email requires manager review' }); continue;
          }
          const key = 'shift_note:' + shift.id + ':' + today;
          if (pageItems(await service.entities.PushLog.filter({ key }, { limit: 1 })).length || dryRun) continue;
          await service.integrations.Core.SendEmail({
            to: matches[0].email.trim(), from_name: 'ComplianceHR Infinity',
            subject: 'Shift note required — reminder ' + days + ' of 5',
            body: 'Your shift note is due after the shift. Please open Communication Centre and complete the note for shift ' + shift.id + ' (' + shift.date + ', ' + (shift.start_time || '') + '–' + (shift.end_time || '') + '). Include factual support delivered, goal progress, concerns and handover. Report urgent incidents immediately. If still missing after five reminder days, this goes to management. Do not reply with sensitive participant information.',
          });
          await service.entities.PushLog.create({ key, sent_at: new Date().toISOString(), recipient_id: matches[0].id });
          sent += 1;
        } else {
          plannedManager += 1;
          if (!managers.length) { failures.push({ shift_id: shift.id, step: 'escalation', error: 'No active manager found' }); continue; }
          const reference = 'Missing shift note: ' + shift.id;
          const existing = pageItems(await service.entities.TodoTask.filter({ important_info: reference }, { limit: 1 }));
          if (!existing.length && !dryRun) {
            const task = await service.entities.TodoTask.create({
              title: 'Manager follow-up: missing shift note', task_type: 'Shift Note Escalation', module: 'Rostering',
              task_date: today, due_date: today, status: 'Pending', priority: 'High',
              important_info: reference, linked_entity_type: 'Shift', linked_entity_id: shift.id,
              assigned_to: 'Management', resources_needed: '/communications',
              how_to_complete: 'Shift note remains unconfirmed after five daily reminder days. Resolve the correct employee/shift, obtain the actual note, review goals/incidents and attach evidence before closing. Do not mark a reminder as note completion.',
            });
            if (!task?.id) throw new Error('Manager task not confirmed');
          }
          for (const manager of managers) {
            const key = { recipient_id: manager.id, linked_entity_type: 'Shift', linked_entity_id: shift.id, type: 'General', message: 'Manager review required: shift note remains unconfirmed after five reminder days. Shift ' + shift.id };
            if (pageItems(await service.entities.Notification.filter(key, { limit: 1 })).length || dryRun) continue;
            const alert = await service.entities.Notification.create({ ...key, recipient: manager.email || manager.full_name, read: false, action_url: '/rostering' });
            if (!alert?.id) throw new Error('Manager alert not confirmed');
            escalations += 1;
          }
        }
      } catch (error) { failures.push({ shift_id: shift.id, error: String(error?.message || error) }); }
    }
    return Response.json({ ok: failures.length === 0, dry_run: dryRun, checked: due.length, overdue: missing.length, employee_reminders_due: plannedEmployee, manager_cases_due: plannedManager, emails_sent: sent, manager_alerts_created: escalations, failures, matching_limit: 'Legacy notes require a unique employee/participant/date; CommunicationEntry notes need explicit reconciliation.' });
  } catch (error) { return Response.json({ error: String(error?.message || error) }, { status: 500 }); }
});
