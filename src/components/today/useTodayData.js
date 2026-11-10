import { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';

export const todayIso = () => new Date().toLocaleDateString('en-CA');

const readItems = async (request) => {
  try {
    const result = await request;
    const rows = Array.isArray(result) ? result : result?.items;
    if (!Array.isArray(rows)) throw new Error('Unexpected data response.');
    return { items: rows, error: null };
  } catch (error) {
    return { items: [], error: error?.message || 'Unable to load this information.' };
  }
};

const readCount = async (request) => {
  try {
    const result = await request;
    const count = typeof result === 'number' ? result : result?.count;
    if (typeof count !== 'number' || !Number.isFinite(count)) throw new Error('Unexpected count response.');
    return { count, error: null };
  } catch (error) {
    return { count: null, error: error?.message || 'Unable to count these records.' };
  }
};

const skippedItems = () => ({ items: [], error: null });
const skippedCount = () => ({ count: null, error: null });

export default function useTodayData() {
  const { can } = useRole();
  const [data, setData] = useState(null);

  const load = useCallback(async () => {
    const day = todayIso();
    const access = {
      emails: can('communications'),
      shifts: can('rostering'),
      invoices: can('invoicing'),
      notes: can('communications'),
      ndis: can('ndis-news'),
      todos: can('tasks'),
      team: can('our-staff'),
      incidents: can('incidents'),
      issues: can('compliance')
    };

    const [emails, shifts, invoices, notes, ndis, todos, team, incidents, issues, emailCount, shiftCount, invoiceCount, noteCount] = await Promise.all([
      access.emails ? readItems(base44.entities.CommunicationEntry.filter({ entry_kind: 'Email' }, { sort: '-created_date', limit: 6 })) : skippedItems(),
      access.shifts ? readItems(base44.entities.Shift.filter({ date: day }, { sort: 'start_time', limit: 500 })) : skippedItems(),
      // Only Draft invoices await approval. Sent invoices have already been issued.
      access.invoices ? readItems(base44.entities.Invoice.filter({ status: 'Draft' }, { sort: '-created_date', limit: 6 })) : skippedItems(),
      access.notes ? readItems(base44.entities.CommunicationEntry.filter({ entry_kind: 'Shift Note', entry_date: day }, { sort: '-created_date', limit: 8 })) : skippedItems(),
      access.ndis ? readItems(base44.entities.NdisUpdate.list({ sort: '-published_date', limit: 3 })) : skippedItems(),
      access.todos ? readItems(base44.entities.TodoTask.filter({ status: { $in: ['Pending', 'In Progress', 'Open'] } }, { limit: 6 })) : skippedItems(),
      access.team ? readItems(base44.entities.StaffProfile.filter({ status: { $in: ['Active', 'On Leave'] } }, { limit: 12 })) : skippedItems(),
      access.incidents ? readItems(base44.entities.Incident.filter({ status: { $in: ['Reported', 'Under Investigation', 'Action Required'] } }, { limit: 5 })) : skippedItems(),
      access.issues ? readItems(base44.entities.ComplianceIssue.filter({ status: { $in: ['Open', 'In Progress'] } }, { limit: 4 })) : skippedItems(),
      access.emails ? readCount(base44.entities.CommunicationEntry.count({ entry_kind: 'Email', lifecycle_status: { $in: ['Sent', 'Delivered', 'Read', 'Acknowledged'] } })) : skippedCount(),
      access.shifts ? readCount(base44.entities.Shift.count({ date: day, status: { $in: ['Scheduled', 'In Progress', 'Completed', 'Missed'] } })) : skippedCount(),
      access.invoices ? readCount(base44.entities.Invoice.count({ status: 'Draft' })) : skippedCount(),
      access.notes ? readCount(base44.entities.CommunicationEntry.count({ entry_kind: 'Shift Note', entry_date: day, lifecycle_status: { $in: ['Sent', 'Delivered', 'Read'] } })) : skippedCount()
    ]);

    setData({
      day,
      access,
      emails: emails.items,
      shifts: shifts.items,
      invoices: invoices.items,
      notes: notes.items,
      ndis: ndis.items,
      todos: todos.items,
      team: team.items,
      incidents: incidents.items,
      issues: issues.items,
      summary: {
        emails: emailCount.count,
        shifts: shiftCount.count,
        invoices: invoiceCount.count,
        notesOutstanding: noteCount.count
      },
      errors: {
        emails: emails.error,
        shifts: shifts.error,
        invoices: invoices.error,
        notes: notes.error,
        ndis: ndis.error,
        todos: todos.error,
        team: team.error,
        incidents: incidents.error,
        issues: issues.error,
        emailCount: emailCount.error,
        shiftCount: shiftCount.error,
        invoiceCount: invoiceCount.error,
        noteCount: noteCount.error
      }
    });
  }, [can]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, reload: load };
}
