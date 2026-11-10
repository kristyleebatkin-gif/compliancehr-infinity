import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

export const todayIso = () => new Date().toLocaleDateString('en-CA');

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

export default function useTodayData() {
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const day = todayIso();
    const [emails, shifts, invoices, notes, ndis, todos, team, incidents, issues] = await Promise.all([
      readItems(base44.entities.CommunicationEntry.filter({ entry_kind: 'Email' }, { sort: '-created_date', limit: 6 })),
      readItems(base44.entities.Shift.filter({ date: day }, { sort: 'start_time', limit: 40 })),
      // Only Draft invoices await approval. Sent invoices have already been issued.
      readItems(base44.entities.Invoice.filter({ status: 'Draft' }, { sort: '-created_date', limit: 6 })),
      readItems(base44.entities.CommunicationEntry.filter({ entry_kind: 'Shift Note', entry_date: day }, { sort: '-created_date', limit: 8 })),
      readItems(base44.entities.NdisUpdate.list({ sort: '-published_date', limit: 3 })),
      readItems(base44.entities.TodoTask.filter({ status: { $in: ['Pending', 'In Progress', 'Open'] } }, { limit: 6 })),
      readItems(base44.entities.StaffProfile.filter({ status: { $in: ['Active', 'On Leave'] } }, { limit: 12 })),
      readItems(base44.entities.Incident.filter({ status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } }, { limit: 5 })),
      readItems(base44.entities.ComplianceIssue.filter({ status: { $in: ['Open', 'In Progress'] } }, { limit: 4 }))
    ]);

    setData({
      day,
      emails: emails.items,
      shifts: shifts.items,
      invoices: invoices.items,
      notes: notes.items,
      ndis: ndis.items,
      todos: todos.items,
      team: team.items,
      incidents: incidents.items,
      issues: issues.items,
      errors: {
        emails: emails.error,
        shifts: shifts.error,
        invoices: invoices.error,
        notes: notes.error,
        ndis: ndis.error,
        todos: todos.error,
        team: team.error,
        incidents: incidents.error,
        issues: issues.error
      }
    });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { data, reload: load };
}
