const DAY = 86400000;
export const serviceDay = (now = new Date()) => now.toLocaleDateString('en-CA', { timeZone: 'Australia/Brisbane' });
export function previousServiceDay(day) {
  return new Date(Date.parse(`${day}T12:00:00Z`) - DAY).toISOString().slice(0, 10);
}
export function shiftBounds(shift) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(shift?.date || '')) return null;
  const midnight = Date.parse(`${shift.date}T00:00:00+10:00`);
  if (!Number.isFinite(midnight) || serviceDay(new Date(midnight)) !== shift.date) return null;
  const minutes = value => {
    if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value || '')) return null;
    const [h, m] = value.split(':').map(Number); return h * 60 + m;
  };
  const start = minutes(shift.start_time), end = minutes(shift.end_time);
  if (start === null || end === null || start === end) return null;
  return { start: midnight + start * 60000, end: midnight + end * 60000 + (end < start ? DAY : 0) };
}
export function relevantRoster(shifts, day) {
  return shifts.filter(shift => {
    if (shift.date === day) return true;
    const bounds = shiftBounds(shift);
    return shift.date === previousServiceDay(day) && (bounds && serviceDay(new Date(bounds.end - 1)) === day || shift.clock_in && !shift.clock_out);
  });
}
export function shiftNeedsClockIn(shift, now = new Date()) {
  const bounds = shiftBounds(shift);
  return Boolean(bounds && bounds.start < +now && shift.employee_name && !shift.clock_in && !shift.clock_out && !['Cancelled', 'Completed', 'Missed'].includes(shift.status));
}
export function shiftNoteReview(shift, notes, now = new Date(), evidence = []) {
  if (['Cancelled', 'Missed'].includes(shift.status)) return { state: 'not-required', label: 'No service note due', tone: 'gray' };
  const association = evidence.find(row => row.shift_id === shift.id);
  if (association?.state === 'linked') return { state: 'linked', label: 'Exact note linked', tone: 'green' };
  if (association && !['linked', 'unlinked'].includes(association.state)) return { state: 'review', label: association.label, tone: 'amber' };
  const bounds = shiftBounds(shift);
  const finished = shift.status === 'Completed' || Boolean(shift.clock_out) || Boolean(bounds && bounds.end < +now);
  if (!finished) return { state: bounds ? 'not-due' : 'unknown', label: bounds ? 'Not due yet' : 'Check shift times', tone: 'gray' };
  // Current records have no canonical shift ID on a note. A name/date match is only a candidate.
  const candidate = notes.some(note => note.entry_kind === 'Shift Note' && note.lifecycle_status !== 'Archived' && note.person_name && note.person_name === shift.participant_name && note.entry_date === shift.date);
  return candidate ? { state: 'review', label: 'Review note match', tone: 'amber' } : { state: 'missing', label: 'No matching note', tone: 'pink' };
}
export function rosterMemberStatus(member, shifts, team, now = new Date()) {
  if (member.status === 'On Leave') return { label: 'On leave', tone: 'gray' };
  if (!member.full_name || team.filter(person => person.full_name === member.full_name).length !== 1) return { label: 'Check worker identity', tone: 'amber' };
  const own = shifts.filter(shift => shift.employee_name === member.full_name && !['Cancelled', 'Missed'].includes(shift.status));
  if (own.some(shift => shift.clock_in && !shift.clock_out && shift.status !== 'Completed')) return { label: 'On shift', tone: 'blue' };
  if (own.some(shift => shiftNeedsClockIn(shift, now))) return { label: 'Not clocked in', tone: 'pink' };
  const upcoming = own.filter(shift => { const bounds = shiftBounds(shift); return bounds && bounds.start >= +now; }).sort((a, b) => shiftBounds(a).start - shiftBounds(b).start)[0];
  if (upcoming) return { label: `From ${upcoming.start_time}`, tone: 'amber' };
  if (own.some(shift => shift.status === 'Completed' || shift.clock_out)) return { label: 'Finished', tone: 'gray' };
  return { label: own.length ? 'Check roster' : 'No shift recorded', tone: 'gray' };
}
export function deriveRosterDashboard(data, now = new Date()) {
  const active = data.shifts.filter(shift => !['Cancelled', 'Missed'].includes(shift.status));
  const review = shift => shiftNoteReview(shift, data.notes, now, data.evidence || []);
  return {
    onShift: active.filter(shift => shift.clock_in && !shift.clock_out && shift.status !== 'Completed'),
    unfilled: active.filter(shift => !shift.employee_name && shift.status !== 'Completed'),
    late: active.filter(shift => shiftNeedsClockIn(shift, now)),
    missingNotes: active.filter(shift => ['review', 'missing', 'unknown'].includes(review(shift).state)),
    escalations: data.todos.filter(task => task.priority === 'Urgent' || task.due_date && task.due_date < data.day),
    noteIncidents: data.notes.filter(note => note.incident_report || note.issues_concerns),
    openIncidents: data.incidents,
    statusFor: member => rosterMemberStatus(member, data.shifts, data.team, now)
  };
}

export function rosterShiftStatus(shift, now = new Date()) {
  if (shift.status === 'Cancelled') return { label: 'Cancelled', tone: 'gray' };
  if (shift.status === 'Missed') return { label: 'Missed', tone: 'pink' };
  if (shift.status === 'Completed') return { label: 'Completed', tone: 'gray' };
  if (!shift.employee_name) return { label: 'Unfilled', tone: 'pink' };
  if (shift.clock_in && !shift.clock_out) return { label: 'On shift', tone: 'blue' };
  if (shift.clock_out) return { label: 'Clocked out', tone: 'gray' };
  if (shiftNeedsClockIn(shift, now)) return { label: 'Not clocked in', tone: 'amber' };
  return { label: shiftBounds(shift) ? 'Scheduled' : 'Check times', tone: 'gray' };
}
