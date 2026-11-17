import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { serviceDay, previousServiceDay, relevantRoster, deriveRosterDashboard } from '@/lib/rosterDashboard';
import { readDashboardCollection } from '@/lib/dashboardRecords';

export default function useTeamLeaderData() {
  const [data, setData] = useState(null);
  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    const day = serviceDay();
    const dates = [previousServiceDay(day), day];
    const [shifts, notes, todos, incidents, team] = await Promise.all([
      readDashboardCollection(options => base44.entities.Shift.filter({ date: { $in: dates } }, { ...options, sort: 'id' })),
      readDashboardCollection(options => base44.entities.CommunicationEntry.filter({ entry_kind: 'Shift Note', entry_date: { $in: dates }, lifecycle_status: { $ne: 'Archived' } }, { ...options, sort: 'id' })),
      readDashboardCollection(options => base44.entities.TodoTask.filter({ status: { $in: ['Pending', 'In Progress', 'Open'] } }, { ...options, sort: 'id' })),
      readDashboardCollection(options => base44.entities.Incident.filter({ status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } }, { ...options, sort: 'id' })),
      readDashboardCollection(options => base44.entities.StaffProfile.filter({ status: { $in: ['Active', 'On Leave'] } }, { ...options, sort: 'id' }))
    ]);

    if (version !== requestVersion.current) return;
    setData({
      day,
      loadedAt: new Date().toISOString(),
      shifts: relevantRoster(shifts.items, day),
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
    const timer = setInterval(load, 60000);
    return () => { clearInterval(timer); requestVersion.current += 1; };
  }, [load]);

  const derived = useMemo(() => data ? deriveRosterDashboard(data) : null, [data]);

  return { data, derived, reload: load };
}
