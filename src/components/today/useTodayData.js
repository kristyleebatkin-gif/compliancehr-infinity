import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export const todayIso = () => new Date().toLocaleDateString('en-CA');

const items = async (request) => {
  try {
    const result = await request;
    if (Array.isArray(result)) return result;
    return result?.items || [];
  } catch {
    return [];
  }
};

export default function useTodayData() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const day = todayIso();
    const [emails, shifts, invoices, notes, ndis, todos, team, incidents, issues] = await Promise.all([
      items(base44.entities.CommunicationEntry.filter({ entry_kind: 'Email' }, { sort: '-created_date', limit: 6 })),
      items(base44.entities.Shift.filter({ date: day }, { sort: 'start_time', limit: 40 })),
      items(base44.entities.Invoice.filter({ status: { $in: ['Draft', 'Sent'] } }, { sort: '-created_date', limit: 6 })),
      items(base44.entities.CommunicationEntry.filter({ entry_kind: 'Shift Note' }, { sort: '-created_date', limit: 8 })),
      items(base44.entities.NdisUpdate.list({ sort: '-published_date', limit: 3 })),
      items(base44.entities.TodoTask.filter({ status: { $in: ['Pending', 'In Progress', 'Open'] } }, { limit: 6 })),
      items(base44.entities.StaffProfile.filter({ status: { $in: ['Active', 'On Leave'] } }, { limit: 12 })),
      items(base44.entities.Incident.filter({ status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } }, { limit: 5 })),
      items(base44.entities.ComplianceIssue.filter({ status: { $in: ['Open', 'In Progress'] } }, { limit: 4 }))
    ]);

    setData({ day, emails, shifts, invoices, notes, ndis, todos, team, incidents, issues });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, reload: load };
}