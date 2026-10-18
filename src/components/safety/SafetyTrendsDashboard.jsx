import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { AlertTriangle, FileSearch, ShieldAlert, Clock } from 'lucide-react';
import { format, subMonths, startOfMonth, isBefore } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import SafetyHeatmap from '@/components/safety/SafetyHeatmap';

const SEVERITY_KEYS = ['Low', 'Medium', 'High', 'Critical'];
const SEVERITY_COLORS = { Low: '#22c55e', Medium: '#6366f1', High: '#f59e0b', Critical: '#dc2626' };

const PENDING_INV_STATUSES = ['Pending', 'In Progress', 'Findings Draft'];
const OPEN_INC_STATUSES = ['Reported', 'Under Investigation', 'Action Required'];
const ACTIVE_RISK_STATUSES = ['Identified', 'Assessed', 'Treating', 'Monitored'];

const Tile = ({ icon: Icon, label, value, tone }) => (
  <div
    className="relative overflow-hidden rounded-xl border p-4 shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
    style={{ borderColor: `${tone}55`, background: `linear-gradient(135deg, ${tone}26, hsl(var(--card)) 75%)`, boxShadow: `0 8px 24px -14px ${tone}77` }}
  >
    <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${tone}, ${tone}99)` }} />
    <div className="relative mb-2 flex items-center gap-2">
      <div className="flex items-center justify-center rounded-lg p-1.5 text-white shadow-md" style={{ background: `linear-gradient(135deg, ${tone}, ${tone}bb)` }}><Icon className="h-4 w-4" /></div>
      <span className="text-xs font-semibold text-foreground/60">{label}</span>
    </div>
    <p className="relative text-3xl font-extrabold leading-none" style={{ color: tone }}>{value}</p>
  </div>
);

export default function SafetyTrendsDashboard() {
  const [incidents, setIncidents] = useState([]);
  const [investigations, setInvestigations] = useState([]);
  const [severityRows, setSeverityRows] = useState([]);
  const [openIncidentsCount, setOpenIncidents] = useState(0);
  const [activeRisksCount, setActiveRisks] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // The trend chart covers the last 6 months only; pending investigations are
      // a slim filtered page; open/active totals come from server counts.
      const since = format(subMonths(new Date(), 6), 'yyyy-MM-dd');
      const [trendPage, pendingPage, severityRows, openIncCount, activeRiskCount] = await Promise.all([
        base44.entities.Incident.filter({ created_date: { $gte: since } }, { sort: '-date_occurred', limit: 500, fields: ['severity', 'date_occurred', 'status', 'title'] }),
        base44.entities.Investigation.filter({ status: { $in: PENDING_INV_STATUSES } }, { sort: '-start_date', limit: 100, fields: ['title', 'status', 'investigator', 'target_completion', 'incident_id'] }),
        base44.entities.Incident.aggregate({ query: { status: { $in: OPEN_INC_STATUSES } }, groupBy: 'severity' }),
        base44.entities.Incident.count({ status: { $in: OPEN_INC_STATUSES } }),
        base44.entities.Risk.count({ status: { $in: ACTIVE_RISK_STATUSES } }),
      ]);
      setIncidents(trendPage.items || []);
      setInvestigations(pendingPage.items || []);
      setSeverityRows(severityRows.rows || []);
      setOpenIncidents(openIncCount);
      setActiveRisks(activeRiskCount);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time: refresh whenever incidents, investigations or risks change
  useEffect(() => {
    const subs = ['Incident', 'Investigation', 'Risk'].map((name) =>
      base44.entities[name].subscribe(() => load())
    );
    return () => subs.forEach((u) => u());
  }, [load]);

  const pendingInv = investigations;
  const today = format(new Date(), 'yyyy-MM-dd');
  const overdueInv = pendingInv.filter((i) => i.target_completion && isBefore(new Date(i.target_completion + 'T00:00:00'), new Date(today + 'T00:00:00')));

  // Incident trend: incidents per month split by severity, last 6 months
  const months = Array.from({ length: 6 }, (_, idx) => {
    const m = subMonths(new Date(), 5 - idx);
    return { key: format(startOfMonth(m), 'yyyy-MM'), label: format(m, 'MMM') };
  });
  const trend = months.map((m) => {
    const monthIncidents = incidents.filter((i) => (i.date_occurred || '').slice(0, 7) === m.key);
    const row = { label: m.label, Total: monthIncidents.length };
    SEVERITY_KEYS.forEach((s) => { row[s] = monthIncidents.filter((i) => (i.severity || 'Medium') === s).length; });
    return row;
  });
  const trendMax = Math.max(1, ...trend.map((t) => t.Total));

  // Severity breakdown of open incidents
  const severityCounts = ['Low', 'Medium', 'High', 'Critical'].map((s) => ({
    severity: s,
    count: severityRows.find((r) => r.severity === s)?.count || 0,
  }));
  const SEVERITY_TONE = { Low: 'bg-safe/15 text-safe', Medium: 'bg-brand/10 text-brand', High: 'bg-warning/15 text-warning', Critical: 'bg-red-600/15 text-red-600 dark:text-red-300' };

  const incLabel = (id) => incidents.find((x) => x.id === id)?.title || 'Unlinked';

  return (
    <SectionCard
      title="Safety Live Dashboard"
      description="Current incident trends and pending investigations — updates in real time as records change"
    >
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-7 w-7 animate-spin rounded-full border-4 border-border border-t-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Tile icon={AlertTriangle} label="Open incidents" value={openIncidentsCount} tone="#f59e0b" />
            <Tile icon={FileSearch} label="Pending investigations" value={pendingInv.length} tone="#7c3aed" />
            <Tile icon={Clock} label="Investigations overdue" value={overdueInv.length} tone="#dc2626" />
            <Tile icon={ShieldAlert} label="Active risks" value={activeRisksCount} tone="#0d9488" />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-4 shadow-lg shadow-amber-500/5 dark:border-amber-900 dark:from-amber-950/25 dark:via-card dark:to-rose-950/20 lg:col-span-2">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-red-500" />
              <h4 className="mb-3 text-sm font-semibold">Incident frequency and severity by month — last 6 months</h4>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trend} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} />
                  <YAxis allowDecimals={false} domain={[0, trendMax]} tickLine={false} axisLine={false} fontSize={11} />
                  <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                  {SEVERITY_KEYS.map((s) => (
                    <Bar key={s} dataKey={s} stackId="severity" fill={SEVERITY_COLORS[s]} radius={s === 'Critical' ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-muted-foreground">Each bar is a month; the stacked segments show how many incidents were Low, Medium, High or Critical. Rising red segments flag escalating severity early.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {severityCounts.map((s) => (
                  <div key={s.severity} className={`rounded-full px-3 py-1 text-xs font-semibold ${SEVERITY_TONE[s.severity]}`}>{s.severity} (open): {s.count}</div>
                ))}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-cyan-50 p-4 shadow-lg shadow-violet-500/5 dark:border-violet-900 dark:from-violet-950/25 dark:via-card dark:to-cyan-950/20">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500" />
              <h4 className="relative mb-3 text-sm font-semibold">Pending investigations</h4>
              {pendingInv.length === 0 ? (
                <p className="text-xs text-muted-foreground">No pending investigations.</p>
              ) : (
                <div className="max-h-[220px] space-y-2 overflow-y-auto pr-1">
                  {pendingInv.map((inv) => {
                    const overdue = inv.target_completion && inv.target_completion < today;
                    return (
                      <div key={inv.id} className={`rounded-lg border p-2 ${overdue ? 'border-red-300 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10' : 'border-border/60'}`}>
                        <Link to={`/incidents/${inv.incident_id}`} className="block truncate text-xs font-semibold hover:underline">{inv.title || 'Untitled'}</Link>
                        <div className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-semibold text-foreground/60">{inv.status}</span>
                          {inv.investigator && <span>{inv.investigator}</span>}
                          {inv.target_completion && <span className={overdue ? 'font-semibold text-red-600 dark:text-red-300' : ''}>Due {format(new Date(inv.target_completion + 'T00:00:00'), 'd MMM')}</span>}
                        </div>
                        <div className="truncate text-[10px] text-foreground/40">{incLabel(inv.incident_id)}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <SafetyHeatmap />
        </div>
      )}
    </SectionCard>
  );
}