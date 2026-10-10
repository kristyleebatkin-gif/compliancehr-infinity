// Rostering helpers: time math, overlap checks, recurrence expansion, CSV columns.

export const SERVICE_TYPES = [
  'Personal Care', 'Community Access', 'Domestic Assistance',
  'Transport', 'Respite', 'Social Support', 'Other',
];

export const FUNDING_SOURCES = [
  'NDIS Core Supports', 'NDIS Capacity Building', 'NDIS Capital', 'Private', 'Other',
];

export const SHIFT_STATUSES = ['Scheduled', 'In Progress', 'Completed', 'Missed', 'Cancelled'];

export const SHIFT_CSV_COLUMNS = [
  { key: 'date', label: 'Date' },
  { key: 'employee_name', label: 'Employee' },
  { key: 'participant_name', label: 'Participant' },
  { key: 'start_time', label: 'Start' },
  { key: 'end_time', label: 'End' },
  { key: 'hours', label: 'Planned Hours' },
  { key: 'service_type', label: 'Service Type' },
  { key: 'funding_source', label: 'Funding' },
  { key: 'location', label: 'Location' },
  { key: 'status', label: 'Status' },
  { key: 'approval_status', label: 'Approval' },
  { key: 'clock_in', label: 'Clock In' },
  { key: 'clock_out', label: 'Clock Out' },
  { key: 'travel_km', label: 'Travel (km)' },
  { key: 'invoiced', label: 'Invoiced' },
  { key: 'notes', label: 'Notes' },
];

export function timeToMinutes(t) {
  if (!t) return null;
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return null;
  return h * 60 + (m || 0);
}

// Planned hours between two HH:MM times (end < start counts as crossing midnight).
export function shiftHours(start, end) {
  const s = timeToMinutes(start);
  let e = timeToMinutes(end);
  if (s === null || e === null) return 0;
  if (e <= s) e += 24 * 60;
  return Math.max(0, (e - s) / 60);
}

export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  const aS = timeToMinutes(aStart);
  let aE = timeToMinutes(aEnd);
  const bS = timeToMinutes(bStart);
  let bE = timeToMinutes(bEnd);
  if (aS === null || aE === null || bS === null || bE === null) return true; // unknown times -> assume clash
  if (aE <= aS) aE += 24 * 60;
  if (bE <= bS) bE += 24 * 60;
  return aS < bE && bS < aE;
}

// Overlapping-shift detection for the rostering calendar.
// Returns a Set of shift ids that clash with another shift for the same staff member:
// same-date overlaps, or an overnight shift spilling into the next day's shift.
export function findShiftConflicts(shifts) {
  const ids = new Set();
  const active = shifts.filter((s) => s.status !== 'Cancelled' && s.employee_name);
  const byStaff = {};
  active.forEach((s) => {
    const key = s.employee_name.toLowerCase();
    (byStaff[key] = byStaff[key] || []).push(s);
  });
  Object.values(byStaff).forEach((list) => {
    list.forEach((a, i) => {
      list.slice(i + 1).forEach((b) => {
        const aSpills = timeToMinutes(a.end_time) !== null && timeToMinutes(a.end_time) <= timeToMinutes(a.start_time);
        const bSpills = timeToMinutes(b.end_time) !== null && timeToMinutes(b.end_time) <= timeToMinutes(b.start_time);
        const sameDay = a.date === b.date;
        const bNext = b.date === nextDateStr(a.date);
        const aNext = a.date === nextDateStr(b.date);
        const clashes =
          (sameDay && rangesOverlap(a.start_time, a.end_time, b.start_time, b.end_time)) ||
          (bNext && aSpills && rangesOverlap('00:00', a.end_time, b.start_time, b.end_time)) ||
          (aNext && bSpills && rangesOverlap('00:00', b.end_time, a.start_time, a.end_time));
        if (clashes) { ids.add(a.id); ids.add(b.id); }
      });
    });
  });
  return ids;
}

function nextDateStr(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Expand a shift occurrence list from repeat_rule/repeat_until (weekly / fortnightly).
export function expandRecurrence(base, rule, until) {
  if (!rule || rule === 'none' || !until) return [base.date];
  const dates = [];
  const step = rule === 'weekly' ? 7 : 14;
  const day = new Date(base.date + 'T00:00:00');
  const end = new Date(until + 'T00:00:00');
  for (let i = 0; i < 104 && day <= end; i += 1) {
    dates.push(day.toISOString().slice(0, 10));
    day.setDate(day.getDate() + step);
  }
  return dates;
}

export function shiftLabel(s) {
  const time = s.start_time ? `${s.start_time}${s.end_time ? `–${s.end_time}` : ''}` : 'All day';
  return `${s.employee_name || 'Unassigned'}${s.participant_name ? ` → ${s.participant_name}` : ''} · ${time}`;
}