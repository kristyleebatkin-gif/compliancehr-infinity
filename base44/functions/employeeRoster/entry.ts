import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';
import { requireEmployee, approvedEmployeeParticipant, employeeRosterIdentity } from '../../shared/employeeAccess.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireEmployee(base44);
    const { action, from, to, participant_id, shift_id, cursor } = await req.json();
    if (!['list', 'confirm', 'start', 'finish'].includes(action)) return Response.json({ error: 'Unsupported roster action.' }, { status: 400 });
    const staff = await employeeRosterIdentity(base44, user);
    const entities = base44.asServiceRole.entities;
    if (action !== 'list') {
      if (typeof shift_id !== 'string' || shift_id.length > 100) return Response.json({ error: 'Select a shift.' }, { status: 400 });
      const shift = await entities.Shift.get(shift_id);
      if (!shift || shift.employee_name !== staff.full_name) return Response.json({ error: 'This shift is not assigned to you.' }, { status: 403 });
      if (shift.participant_name && await entities.ParticipantProfile.count({ full_name: shift.participant_name, admin_approved: true }) !== 1) return Response.json({ error: 'This participant is not approved.' }, { status: 403 });
      const now = new Date().toISOString();
      let changes;
      if (action === 'confirm' && shift.status === 'Scheduled') changes = { staff_confirmation: 'Confirmed' };
      if (action === 'start' && shift.status === 'Scheduled') changes = { status: 'In Progress', clock_in: now };
      if (action === 'finish' && shift.status === 'In Progress') changes = { status: 'Completed', clock_out: now, approval_status: 'Pending Approval' };
      if (!changes) return Response.json({ error: 'This action is not available for the shift’s current status.' }, { status: 409 });
      await entities.Shift.update(shift.id, changes);
      return Response.json({ success: true });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from || '') || !/^\d{4}-\d{2}-\d{2}$/.test(to || '') || to < from || (Date.parse(to) - Date.parse(from)) > 366 * 86400000 || (cursor != null && (typeof cursor !== 'string' || cursor.length > 4000))) return Response.json({ error: 'Choose a valid date range of up to one year.' }, { status: 400 });
    let participantScope;
    if (participant_id) {
      const person = await approvedEmployeeParticipant(base44, participant_id);
      participantScope = { participant_name: person.full_name };
    } else {
      const names = [];
      let next;
      for (let pageNumber = 0; pageNumber < 20; pageNumber++) {
        const page = await entities.ParticipantProfile.filter({ admin_approved: true }, { limit: 200, fields: ['full_name'], cursor: next });
        names.push(...page.items.map((person) => person.full_name));
        if (!page.has_more) { next = null; break; }
        next = page.next_cursor;
      }
      if (next) return Response.json({ error: 'Select a participant to narrow this roster view.' }, { status: 400 });
      participantScope = { $or: [{ participant_name: { $in: names } }, { participant_name: null }, { participant_name: '' }] };
    }
    const page = await entities.Shift.filter({ employee_name: staff.full_name, date: { $gte: from, $lte: to }, ...participantScope }, { sort: 'date', limit: 25, cursor, fields: ['id', 'date', 'employee_name', 'participant_name', 'start_time', 'end_time', 'status', 'staff_confirmation', 'location', 'notes', 'service_type', 'clock_in', 'clock_out'] });
    return Response.json(page);
  } catch (error) {
    return Response.json({ error: error.message || 'Roster access could not be checked.' }, { status: 403 });
  }
}