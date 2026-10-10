import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, FileSearch, ClipboardList, ChevronRight, CircleAlert } from 'lucide-react';
import { isOpenIncident } from '@/lib/safetyFilters';
import { format } from 'date-fns';

const severityTone = {
  Low: 'border-transparent bg-safe/10 text-safe',
  Medium: 'border-transparent bg-warning/10 text-warning',
  High: 'border-transparent bg-orange-500/10 text-orange-600',
  Critical: 'border-transparent bg-destructive/10 text-destructive',
};

const Tile = ({ icon: Icon, label, count, urgent, to, tone }) => (
  <Card>
    <CardContent className="p-4">
      <Link to={to} className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tone}`}><Icon className="h-4.5 w-4.5" /></span>
          <div>
            <p className="text-xs font-semibold text-foreground/50">{label}</p>
            <p className="text-2xl font-bold leading-none">{count}</p>
          </div>
        </div>
        {urgent > 0 && <Badge className="border-transparent bg-destructive/10 text-destructive">{urgent} urgent</Badge>}
      </Link>
    </CardContent>
  </Card>
);

export default function SafetyOperationsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [checklists, setChecklists] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const urgentIncidents = incidents.filter((i) => ['High', 'Critical'].includes(i.severity));
  const openInvestigations = investigations.filter((i) => ['In Progress', 'Findings Draft'].includes(i.status));
  const overdueChecklists = checklists.filter((c) => c.overdue);

  if (loading) {
    return (
      <Card><CardContent className="p-8 text-center"><div className="mx-auto h-7 w-7 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /></CardContent></Card>
    );
  }

  const Row = ({ to, primary, secondary, badge, alert }) => (
    <Link to={to} className={`flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2.5 hover:bg-accent ${alert ? 'bg-destructive/5 ring-1 ring-destructive/30' : ''}`}>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{primary}</p>
        <p className="truncate text-[11px] text-muted-foreground">{secondary}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {badge}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
      </div>
    </Link>
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="text-base font-bold">Safety Operations Dashboard</h3>
          <p className="text-xs text-muted-foreground">Everything in the safety section that needs attention right now</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <Tile icon={AlertTriangle} label="Active incidents" count={incidents.length} urgent={urgentIncidents.length} to="/incidents" tone="bg-red-100 text-red-600" />
          <Tile icon={FileSearch} label="Open investigations" count={investigations.length} urgent={openInvestigations.length} to="/incidents" tone="bg-indigo-100 text-indigo-600" />
          <Tile icon={ClipboardList} label="Pending checklists" count={checklists.length} urgent={overdueChecklists.length} to="/checklists" tone="bg-teal-100 text-teal-600" />
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Active incidents</p>
            {incidents.length === 0 ? <p className="text-xs text-muted-foreground">No active incidents.</p> : incidents.slice(0, 5).map((inc) => (
              <Row
                key={inc.id}
                to={`/incidents/${inc.id}`}
                alert={['High', 'Critical'].includes(inc.severity)}
                primary={inc.title || 'Untitled'}
                secondary={`${inc.date_occurred || 'No date'} · ${inc.incident_id || ''}`}
                badge={<Badge className={severityTone[inc.severity] || 'border-transparent bg-muted text-foreground/60'}>{inc.severity || '—'}</Badge>}
              />
            ))}
            {incidents.length > 5 && <Link to="/incidents" className="text-xs font-semibold text-brand hover:underline">View all {incidents.length} →</Link>}
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Current investigations</p>
            {investigations.length === 0 ? <p className="text-xs text-muted-foreground">No open investigations.</p> : investigations.slice(0, 5).map((inv) => (
              <Row
                key={inv.id}
                to={inv.incident_id ? `/incidents/${inv.incident_id}` : '/incidents'}
                alert={['In Progress', 'Pending'].includes(inv.status) && Boolean(inv.target_completion && inv.target_completion < format(new Date(), 'yyyy-MM-dd'))}
                primary={inv.title || 'Untitled'}
                secondary={`${inv.investigator || 'Unassigned'} · ${inv.status || ''}`}
                badge={<Badge className="border-transparent bg-indigo-500/10 text-indigo-600">{inv.status || '—'}</Badge>}
              />
            ))}
            {investigations.length > 5 && <Link to="/incidents" className="text-xs font-semibold text-brand hover:underline">View all {investigations.length} →</Link>}
          </div>

          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground/50">Pending checklists</p>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}