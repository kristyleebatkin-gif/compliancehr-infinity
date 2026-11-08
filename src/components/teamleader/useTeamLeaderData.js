import { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { todayIso } from '@/components/today/useTodayData';

const items = async (request) => {
  try {
    const result = await request;
    if (Array.isArray(result)) return result;
    return result?.items || [];
  } catch {
    return [];
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
      items(base44.entities.Shift.filter({ date: day }, { sort: 'start_time', limit: 40 })),
      items(base44.entities.CommunicationEntry.filter({ entry_kind: 'Shift Note' }, { sort: '-created_date', limit: 20 })),
      items(base44.entities.TodoTask.filter({ status: { $in: ['Pending', 'In Progress', 'Open'] } }, { limit: 20 })),
      items(base44.entities.Incident.filter({ status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } }, { limit: 10 })),
      items(base44.entities.StaffProfile.filter({ status: { $in: ['Active', 'On Leave'] } }, { limit: 20 }))
    ]);
    setData({ day, shifts, notes, todos, incidents, team });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const derived = useMemo(() => {
    if (!data) return null;
    const nowMinutes = new Date().getHours() * 60 + new Date().getMinutes();
    const notedParticipants = data.notes.map((note) => note.person_name).filter(Boolean);

    const onShift = data.shifts.filter((shift) => shift.clock_in && !shift.clock_out);
    const unfilled = data.shifts.filter((shift) => !shift.employee_name);
    const late = data.shifts.filter((shift) => {
      const start = minutes(shift.start_time);
      return start !== null && start < nowMinutes && !shift.clock_in && shift.status !== 'Cancelled';
    });
    const missingNotes = data.shifts.filter((shift) => {
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
      const shift = data.shifts.find((item) => item.employee_name === member.full_name);
      if (!shift) return { label: 'Available', tone: 'green' };
      if (shift.clock_in && !shift.clock_out) return { label: 'On shift', tone: 'blue' };
      if (shift.status === 'Completed') return { label: 'Finished', tone: 'gray' };
      if (late.some((item) => item.id === shift.id)) return { label: 'Not clocked in', tone: 'pink' };
      return { label: shift.start_time ? `From ${shift.start_time}` : 'Scheduled', tone: 'amber' };
    };

    return { onShift, unfilled, late, missingNotes, escalations, noteIncidents, statusFor };
  }, [data]);

  return { data, derived, reload: load };
}