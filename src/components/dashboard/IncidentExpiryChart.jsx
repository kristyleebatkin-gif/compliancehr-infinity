import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Siren, CalendarClock, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

// Semantic palette channel values mirror src/index.css tokens (safe/warning/danger/brand).
const C = {
  safe: 'hsl(134 61% 40%)',
  warning: 'hsl(33 100% 50%)',
  danger: 'hsl(0 63% 51%)',
  orange: '#f97316',
  muted: 'hsl(215 16% 47%)',
};

const INCIDENT_TONE = {
  Reported: { color: C.warning, cls: 'bg-warning/10 text-warning' },
  'Under Investigation': { color: C.orange, cls: 'bg-orange-500/10 text-orange-600' },
  'Action Required': { color: C.danger, cls: 'bg-danger/10 text-danger' },
  Resolved: { color: C.safe, cls: 'bg-safe/10 text-safe' },
  Closed: { color: C.muted, cls: 'bg-muted text-foreground/60' },
};

const today = () => new Date().toISOString().slice(0, 10);
const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString().slice(0, 10);
const monthKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

// Admin dashboard charts: incident report progress (donut) and upcoming compliance
// expiries by urgency (bar chart), both in the central semantic status colours.
export default function IncidentExpiryChart() {
  const [incRows, setIncRows] = useState(null);
  const [expBuckets, setExpBuckets] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [inc, docs, certs, expiredDocs, expiredCerts] = await Promise.all([
          base44.entities.Incident.aggregate({ groupBy: 'status' }),
          base44.entities.EmployeeDocument.aggregate({
            query: { expiry_date: { $gte: today(), $lte: inDays(180) }, status: { $ne: 'Archived' } },
            dateBucket: { field: 'expiry_date', unit: 'month' },
          }),
          base44.entities.Certificate.aggregate({
            query: { expiry_date: { $gte: today(), $lte: inDays(180) } },
            dateBucket: { field: 'expiry_date', unit: 'month' },
          }),
          base44.entities.EmployeeDocument.count({ expiry_date: { $gte: inDays(-30), $lt: today() }, status: { $ne: 'Archived' } }),
          base44.entities.Certificate.count({ expiry_date: { $gte: inDays(-30), $lt: today() } }),
        ]);
        if (!alive) return;
        setIncRows(inc.rows || []);

        const byMonth = new Map();
        for (const r of [...(docs.rows || []), ...(certs.rows || [])]) {
          byMonth.set(r.expiry_date, (byMonth.get(r.expiry_date) || 0) + (r.count || 0));
        }
        const now = new Date();
        const months = Array.from({ length: 6 }, (_, i) => {
          const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
          return { label: d.toLocaleString('en-AU', { month: 'short' }), count: byMonth.get(monthKey(d)) || 0 };
        });
        const later = months.slice(2).reduce((a, r) => a + r.count, 0);
        setExpBuckets([
          { label: 'Expired', count: (expiredDocs || 0) + (expiredCerts || 0), color: C.danger },
          { label: 'This month', count: months[0].count, color: C.warning },
          { label: 'Next month', count: months[1].count, color: C.orange },
          { label: '2-6 months', count: later, color: C.safe },
        ]);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  if (failed) return null;
  if (!incRows || !expBuckets) return <div className="h-64 animate-pulse rounded-2xl border border-border/60 bg-card" />;

  const donut = incRows.map((r) => ({
    name: r.status || 'Unspecified',
    value: r.count || 0,
    color: (INCIDENT_TONE[r.status] || { color: C.muted }).color,
  }));
  const incidentTotal = donut.reduce((a, r) => a + r.value, 0);
  const pendingIncidents = donut
    .filter((r) => !['Resolved', 'Closed'].includes(r.name))
    .reduce((a, r) => a + r.value, 0);
  const expiryTotal = expBuckets.reduce((a, r) => a + r.count, 0);

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-md">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Incident report progress donut */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <Link to="/incidents" className="flex items-center gap-2 text-sm font-bold hover:underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white shadow-md"><Siren className="h-4 w-4" /></span>
            Incident report progress
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
          {incidentTotal === 0 ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">No incident reports on record yet.</p>
          ) : (
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="relative h-40 w-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donut} dataKey="value" nameKey="name" innerRadius={52} outerRadius={78} paddingAngle={2} strokeWidth={0}>
                      {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold tabular-nums">{pendingIncidents}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-foreground/50">pending</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                {donut.map((d) => (
                  <div key={d.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                    <span className="min-w-0 flex-1 truncate font-medium">{d.name}</span>
                    <span className="font-bold tabular-nums">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Upcoming compliance expiries bar chart */}
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4">
          <Link to="/documents" className="flex items-center gap-2 text-sm font-bold hover:underline">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white shadow-md"><CalendarClock className="h-4 w-4" /></span>
            Upcoming compliance expiries
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
          </Link>
          {expiryTotal === 0 ? (
            <p className="mt-6 text-center text-xs text-muted-foreground">No expiries in the last 30 days or next 6 months.</p>
          ) : (
            <div className="mt-3 h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expBuckets} margin={{ top: 8, right: 8, left: -22, bottom: 0 }}>
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: 'hsl(215 16% 47%)' }} />
                  <Tooltip cursor={{ fill: 'rgba(124,58,237,0.06)' }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={56}>
                    {expBuckets.map((b, i) => <Cell key={i} fill={b.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] font-medium">
            {expBuckets.map((b) => (
              <span key={b.label} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: b.color }} />
                {b.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}