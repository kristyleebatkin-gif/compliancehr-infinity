import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, FileSearch, ClipboardList, CircleAlert, Filter } from 'lucide-react';
import { isOpenIncident } from '@/lib/safetyFilters';
import { format } from 'date-fns';
import SectionCard from '@/components/SectionCard';
import Tile from '@/components/safety/SafetyOperationTile';
import Row from '@/components/safety/SafetyOperationRow';

// Shift buckets derived from the incident's time_occurred (same convention as the SafetyHeatmap)
const SHIFT_BUCKETS = [
  { value: 'morning', label: 'Morning (6am-12pm)', from: 6, to: 12 },
  { value: 'afternoon', label: 'Afternoon (12pm-6pm)', from: 12, to: 18 },
  { value: 'evening', label: 'Evening (6pm-10pm)', from: 18, to: 22 },
  { value: 'night', label: 'Night (10pm-6am)', from: 22, to: 6 },
];

const parseHour = (t) => {
  if (!t) return null;
  const m = String(t).match(/^(\d{1,2})/);
  if (!m) return null;
  const h = parseInt(m[1], 10);
  return h >= 0 && h <= 23 ? h : null;
};

const shiftValue = (timeOccurred) => {
  const h = parseHour(timeOccurred);
  if (h === null) return 'unspecified';
  const idx = SHIFT_BUCKETS.findIndex((b) => (b.from < b.to ? h >= b.from && h < b.to : h >= b.from || h < b.to));
  return idx >= 0 ? SHIFT_BUCKETS[idx].value : 'unspecified';
};

const severityTone = {
  Low: 'border-transparent bg-safe/10 text-safe',
  Medium: 'border-transparent bg-warning/10 text-warning',
  High: 'border-transparent bg-orange-500/10 text-orange-600 dark:text-orange-300',
  Critical: 'border-transparent bg-destructive/10 text-destructive',
};

export default function SafetyOperationsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState('all');
  const [shiftFilter, setShiftFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [incPage, invPage, chkPage] = await Promise.all([
          base44.entities.Incident.filter({ status: { $nin: ['Resolved', 'Closed'] } }, { sort: '-date_occurred', limit: 50 }),
          base44.entities.Investigation.filter({ status: { $nin: ['Completed', 'Closed'] } }, { sort: '-start_date', limit: 50 }),
          base44.entities.Checklist.list({ sort: 'due_date', limit: 200, fields: ['title', 'due_date', 'items', 'category'] }),
        ]);
        if (cancelled) return;
        setIncidents(incPage.items || []);
        setInvestigations(invPage.items || []);
        const today = format(new Date(), 'yyyy-MM-dd');
        setChecklists((chkPage.items || []).filter((c) => (c.items || []).some((i) => !i.done)));
        setChecklists((prev) => prev.map((c) => ({ ...c, overdue: c.due_date && c.due_date < today })));
      } catch (e) { console.error(e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // Facility / shift filtering — isolates incident reports to spot problem areas
  const filteredIncidents = incidents.filter((inc) => {
    if (locationFilter !== 'all' && ((inc.location || '').trim() || 'Unspecified') !== locationFilter) return false;
    if (shiftFilter !== 'all' && shiftValue(inc.time_occurred) !== shiftFilter) return false;
    return true;
  });

  const locationOptions = Array.from(new Set(incidents.map((i) => (i.location || '').trim() || 'Unspecified'))).sort();

  const urgentIncidents = filteredIncidents.filter((i) => ['High', 'Critical'].includes(i.severity));
  const openInvestigations = investigations.filter((i) => ['In Progress', 'Findings Draft'].includes(i.status));
  const overdueChecklists = checklists.filter((c) => c.overdue);

  if (loading) {
    return (
      <Card><CardContent className="p-8 text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-border border-t-foreground" /></CardContent></Card>
    );
  }

  return (
    <SectionCard title="Safety Operations Dashboard" description="Everything in the safety section that needs attention right now" className="safety-operations-dashboard">
      <div className="space-y-5">

        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/40 p-2.5">
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/50"><Filter className="h-3.5 w-3.5" /> Filter incidents</span>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="h-8 w-[200px] bg-card text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All locations</SelectItem>
              {locationOptions.map((loc) => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={shiftFilter} onValueChange={setShiftFilter}>
            <SelectTrigger className="h-8 w-[210px] bg-card text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All shift types</SelectItem>
              {SHIFT_BUCKETS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
              <SelectItem value="unspecified">Time not recorded</SelectItem>
            </SelectContent>
          </Select>
          {(locationFilter !== 'all' || shiftFilter !== 'all') && (
            <button type="button" onClick={() => { setLocationFilter('all'); setShiftFilter('all'); }} className="text-xs font-semibold text-brand hover:underline">Clear</button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Tile icon={AlertTriangle} label={`Active incidents${locationFilter !== 'all' || shiftFilter !== 'all' ? ' (filtered)' : ''}`} count={filteredIncidents.length} urgent={urgentIncidents.length} to="/incidents" tone="danger" />
          <Tile icon={FileSearch} label="Open investigations" count={investigations.length} urgent={openInvestigations.length} to="/incidents" tone="primary" />
          <Tile icon={ClipboardList} label="Pending checklists" count={checklists.length} urgent={overdueChecklists.length} to="/checklists" tone="teal" />
        </div>

        <div className="safety-operations-lists grid items-start gap-4 lg:grid-cols-3">
          <details open className="space-y-2">
            <summary>Active incidents</summary>
            {filteredIncidents.length === 0 ? <p className="text-xs text-muted-foreground">{incidents.length === 0 ? 'No active incidents.' : 'No incidents match the selected filters.'}</p> : filteredIncidents.slice(0, 5).map((inc) => (
              <Row
                key={inc.id}
                to={`/incidents/${inc.id}`}
                alert={['High', 'Critical'].includes(inc.severity)}
                primary={inc.title || 'Untitled'}
                secondary={`${inc.date_occurred || 'No date'} · ${inc.incident_id || ''}`}
                badge={<Badge className={severityTone[inc.severity] || 'border-transparent bg-muted text-foreground/60'}>{inc.severity || '—'}</Badge>}
              />
            ))}
            {filteredIncidents.length > 5 && <Link to="/incidents" className="text-xs font-semibold text-brand hover:underline">View all {filteredIncidents.length} →</Link>}
          </details>

          <details open className="space-y-2">
            <summary>Current investigations</summary>
            {investigations.length === 0 ? <p className="text-xs text-muted-foreground">No open investigations.</p> : investigations.slice(0, 5).map((inv) => (
              <Row
                key={inv.id}
                to={inv.incident_id ? `/incidents/${inv.incident_id}` : '/incidents'}
                alert={['In Progress', 'Pending'].includes(inv.status) && Boolean(inv.target_completion && inv.target_completion < format(new Date(), 'yyyy-MM-dd'))}
                primary={inv.title || 'Untitled'}
                secondary={`${inv.investigator || 'Unassigned'} · ${inv.status || ''}`}
                badge={<Badge className="border-transparent bg-violet-500/10 text-violet-600 dark:text-violet-300">{inv.status || '—'}</Badge>}
              />
            ))}
            {investigations.length > 5 && <Link to="/incidents" className="text-xs font-semibold text-brand hover:underline">View all {investigations.length} →</Link>}
          </details>

          <details open className="space-y-2">
            <summary>Pending checklists</summary>
            {checklists.length === 0 ? <p className="text-xs text-muted-foreground">All checklists complete.</p> : checklists.slice(0, 5).map((c) => {
              const done = (c.items || []).filter((i) => i.done).length;
              return (
                <Row
                  key={c.id}
                  to="/checklists"
                  alert={c.overdue}
                  primary={c.title || 'Untitled'}
                  secondary={c.overdue ? `Overdue — was due ${c.due_date}` : c.due_date ? `Due ${c.due_date} · ${done}/${(c.items || []).length} done` : `${done}/${(c.items || []).length} items done`}
                  badge={c.overdue ? <Badge className="border-transparent bg-destructive/10 text-destructive"><CircleAlert className="mr-1 h-3 w-3" />Overdue</Badge> : null}
                />
              );
            })}
            {checklists.length > 5 && <Link to="/checklists" className="text-xs font-semibold text-brand hover:underline">View all {checklists.length} →</Link>}
          </details>
        </div>
      </div>
    </SectionCard>
  );
}