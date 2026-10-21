import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { Badge } from '@/components/ui/badge';
import { Download, CalendarDays } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const SEVERITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];
const severityTone = {
  Low: 'border-transparent bg-safe/10 text-safe',
  Medium: 'border-transparent bg-warning/10 text-warning',
  High: 'border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-300',
  Critical: 'border-transparent bg-destructive/10 text-destructive',
};
const LOG_CSV_COLUMNS = [
  { key: 'date_occurred', label: 'Date' },
  { key: 'incident_id', label: 'Incident ID' },
  { key: 'title', label: 'Title' },
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'category', label: 'Category' },
  { key: 'location', label: 'Location' },
  { key: 'participant_name', label: 'Participant' },
  { key: 'staff_name', label: 'Staff' },
  { key: 'reported_by', label: 'Reported By' },
];

export default function IncidentLog() {
  const { toast } = useToast();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [severity, setSeverity] = useState('All');
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = {};
      if (fromDate || toDate) {
        query.date_occurred = { ...(fromDate ? { $gte: fromDate } : {}), ...(toDate ? { $lte: toDate } : {}) };
      }
      if (severity !== 'All') query.severity = severity;
      const page = await base44.entities.Incident.filter(query, { sort: '-date_occurred', limit: 200 });
      setEntries(page.items || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [fromDate, toDate, severity]);

  useEffect(() => { load(); }, [load]);

  const exportLog = () => {
    if (!entries.length) { toast({ title: 'No log entries to export' }); return; }
    downloadCsv(`Incident Log ${format(new Date(), 'yyyy-MM-dd')}.csv`, LOG_CSV_COLUMNS, entries);
    toast({ title: 'Incident log exported' });
  };

  return (
    <SectionCard
      collapsible
      title="Incident Log"
      description="Past incident reports filtered by date and severity"
      action={
        <div className="flex items-center gap-2">
          <button onClick={exportLog} className="flex items-center gap-1.5 rounded-lg bg-teal px-3 py-1.5 text-xs font-semibold text-white hover:bg-teal/90"><Download className="h-3.5 w-3.5" />Export CSV</button>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-foreground/60">{loading ? '…' : `${entries.length} entries`}</span>
        </div>
      }
    >
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-foreground/60">From</label>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-foreground/60">To</label>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-foreground/60">Severity</label>
          <select value={severity} onChange={(e) => setSeverity(e.target.value)} className="rounded-lg border border-input bg-background px-2.5 py-1.5 text-sm">
            {SEVERITIES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(fromDate || toDate || severity !== 'All') && (
          <button onClick={() => { setFromDate(''); setToDate(''); setSeverity('All'); }} className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground/60 hover:bg-muted">Clear filters</button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-border border-t-foreground" />
        </div>
      ) : entries.length === 0 ? (
        <EmptyState icon={CalendarDays} title="No incidents in this period" subtitle="Adjust the date range or severity filter." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border/60 text-[11px] font-semibold uppercase tracking-wide text-foreground/50">
                <th className="py-2 pr-3">Date</th>
                <th className="py-2 pr-3">Incident</th>
                <th className="py-2 pr-3">Severity</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2 pr-3">Location</th>
                <th className="py-2 pr-3">Reported By</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((inc) => (
                <tr key={inc.id} className="border-b border-border/40">
                  <td className="whitespace-nowrap py-2.5 pr-3 text-foreground/70">{inc.date_occurred || '—'}</td>
                  <td className="py-2.5 pr-3">
                    <Link to={`/incidents/${inc.id}`} className="font-medium hover:underline">{inc.title || 'Untitled'}</Link>
                    {inc.incident_id && <div className="text-[11px] text-foreground/40">{inc.incident_id}</div>}
                  </td>
                  <td className="py-2.5 pr-3"><Badge className={severityTone[inc.severity] || 'border-transparent bg-muted text-foreground/60'}>{inc.severity || '—'}</Badge></td>
                  <td className="py-2.5 pr-3 text-foreground/70">{inc.status || '—'}</td>
                  <td className="py-2.5 pr-3 text-foreground/70">{inc.location || '—'}</td>
                  <td className="py-2.5 pr-3 text-foreground/70">{inc.reported_by || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
}