import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { todayIso } from '@/components/today/useTodayData';

const readItems = async (request) => {
  try {
    const result = await request;
    const rows = Array.isArray(result) ? result : result?.items;
    if (!Array.isArray(rows)) {
      throw new Error('The data service returned an unexpected response.');
    }
    return { items: rows, error: null };
  } catch (error) {
    return {
      items: [],
      error: error?.message || 'Unable to load this information.'
    };
  }
};

const minutes = (time) => {
  if (!time) return null;
  const [hour, minute] = String(time).split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  return hour * 60 + minute;
};

export default function useTeamLeaderData() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const day = todayIso();
    const [shifts, notes, todos, incidents, team] = await Promise.all([
      readItems(base44.entities.Shift.filter({ date: day }, { sort: 'start_time', limit: 40 })),
      readItems(base44.entities.CommunicationEntry.filter({ entry_kind: 'Shift Note', entry_date: day }, { sort: '-created_date', limit: 40 })),
      readItems(base44.entities.TodoTask.filter({ status: { $in: ['Pending', 'In Progress', 'Open'] } }, { limit: 20 })),
      readItems(base44.entities.Incident.filter({ status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } }, { limit: 10 })),
      readItems(base44.entities.StaffProfile.filter({ status: { $in: ['Active', 'On Leave'] } }, { limit: 20 }))
    ]);

    setData({
      day,
      shifts: shifts.items,
      notes: notes.items,
      todos: todos.items,
      incidents: incidents.items,
      team: team.items,
      errors: {
        shifts: shifts.error,
        notes: notes.error,
        todos: todos.error,
        incidents: incidents.error,
        team: team.error
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const derived = useMemo(() => {
    if (!data) return null;
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const notedParticipants = data.notes.map((note) => note.person_name).filter(Boolean);
    const activeShifts = data.shifts.filter((shift) => shift.status !== 'Cancelled');

    const onShift = activeShifts.filter((shift) => shift.clock_in && !shift.clock_out);
    const unfilled = activeShifts.filter((shift) => !shift.employee_name);
    const late = activeShifts.filter((shift) => {
      const start = minutes(shift.start_time);
      return start !== null && start < nowMinutes && !shift.clock_in && shift.status !== 'Completed';
    });
    const missingNotes = activeShifts.filter((shift) => {
      const end = minutes(shift.end_time);
      const finished = shift.status === 'Completed' || (end !== null && end < nowMinutes);
      return finished && shift.participant_name && !notedParticipants.includes(shift.participant_name);
    });
    const escalations = data.todos.filter(
      (task) => task.priority === 'Urgent' || (task.due_date && task.due_date < data.day)
    );
    const noteIncidents = data.notes.filter((note) => note.incident_report || note.issues_concerns);

    const statusFor = (member) => {
      if (member.status === 'On Leave') return { label: 'On leave', tone: 'gray' };
      const shift = activeShifts.find((item) => item.employee_name === member.full_name);
      if (!shift) return { label: 'No shift today', tone: 'gray' };
      if (shift.clock_in && !shift.clock_out) return { label: 'On shift', tone: 'blue' };
      if (shift.status === 'Completed') return { label: 'Finished', tone: 'gray' };
      if (late.some((item) => item.id === shift.id)) return { label: 'Not clocked in', tone: 'pink' };
      return { label: shift.start_time ? `From ${shift.start_time}` : 'Scheduled', tone: 'amber' };
    };

    return { onShift, unfilled, late, missingNotes, escalations, noteIncidents, statusFor };
  }, [data]);

  return { data, derived, reload: load };
}
