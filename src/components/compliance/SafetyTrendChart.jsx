import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { subMonths, startOfMonth, endOfMonth, format, isBefore } from 'date-fns';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { AlertTriangle, ShieldAlert, FileCheck2, Loader2 } from 'lucide-react';

const SEVERITY_COLORS = { Low: '#22c55e', Medium: '#eab308', High: '#f97316', Critical: '#dc2626' };
const REPORT_COLORS = { Risk: '#7c3aed', Hazard: '#f59e0b', 'Near Miss': '#0ea5e9' };

// Small gradient-tinted summary card, consistent with the dashboard tiles.
const SummaryCard = ({ icon: Icon, label, value, tone }) => (
  <div
    className="relative overflow-hidden rounded-xl border p-4 shadow-md"
    style={{ borderColor: `${tone}55`, background: `linear-gradient(135deg, ${tone}26, hsl(var(--card)) 75%)`, boxShadow: `0 8px 24px -14px ${tone}77` }}
  >
    <div className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${tone}, ${tone}99)` }} />
    <div className="relative mb-2 flex items-center gap-2">
      <div className="flex items-center justify-center rounded-lg p-1.5 text-white shadow-md" style={{ background: `linear-gradient(135deg, ${tone}, ${tone}bb)` }}>
        <Icon className="h-4 w-4" />
      </div>
      <span className="text-xs font-semibold text-foreground/60">{label}</span>
    </div>
    <p className="relative text-3xl font-extrabold leading-none" style={{ color: tone }}>{value}</p>
  </div>
);

export default function SafetyTrendChart() {
  const [incidents, setIncidents] = useState([]);
  const [risks, setRisks] = useState([]);
  const [takeFives, setTakeFives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [incPage, riskPage, tfPage] = await Promise.all([
          base44.entities.Incident.filter({}, { sort: '-created_date', limit: 500 }),
          base44.entities.Risk.filter({}, { sort: '-created_date', limit: 500 }),
          base44.entities.TakeFive.filter({}, { sort: '-created_date', limit: 500 }),
        ]);
        if (alive) { setIncidents(incPage.items || []); setRisks(riskPage.items || []); setTakeFives(tfPage.items || []); }
      } catch (e) { console.error(e); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card p-10 text-sm text-foreground/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading trends…
      </div>
    );
  }

  // Last 6 months, oldest first
  const months = Array.from({ length: 6 }, (_, idx) => subMonths(new Date(), 5 - idx)).map((m) => ({
    key: format(startOfMonth(m), 'yyyy-MM'),
    label: format(m, 'MMM'),
    start: startOfMonth(m),
    end: endOfMonth(m),
  }));

  const inMonth = (date, m) => date && isBefore(new Date(date), m.end) && !isBefore(new Date(date), m.start);

  const severityOf = (i) => i.severity || 'Medium';

  const incidentTrend = months.map((m) => {
    const monthInc = incidents.filter((i) => inMonth(i.date_occurred || i.date_reported || i.created_date, m));
    const row = { label: m.label, Total: monthInc.length };
    ['Low', 'Medium', 'High', 'Critical'].forEach((s) => { row[s] = monthInc.filter((i) => severityOf(i) === s).length; });
    return row;
  });

  const safetyTrend = months.map((m) => ({
    label: m.label,
    Risks: risks.filter((r) => inMonth(r.identified_date || r.created_date, m) && (r.report_type || 'Risk') === 'Risk').length,
    Hazards: risks.filter((r) => inMonth(r.identified_date || r.created_date, m) && r.report_type === 'Hazard').length,
    'Near Miss': risks.filter((r) => inMonth(r.identified_date || r.created_date, m) && r.report_type === 'Near Miss').length,
    'Take 5s': takeFives.filter((t) => inMonth(t.assessment_date || t.created_date, m)).length,
  }));

  const today = new Date();
  const lastMonth = months[months.length - 1];
  const prevMonth = months[months.length - 2];
  const lastMonthIncidents = incidentTrend[incidentTrend.length - 1]?.Total || 0;
  const prevMonthIncidents = incidentTrend[incidentTrend.length - 2]?.Total || 0;
  const delta = lastMonthIncidents - prevMonthIncidents;
  const trendNote = delta > 0 ? `up ${delta} on the previous month` : delta < 0 ? `down ${Math.abs(delta)} on the previous month` : 'unchanged on the previous month';

  const openIncidents = incidents.filter((i) => !['Resolved', 'Closed'].includes(String(i.status || '').trim())).length;
  const openRisks = risks.filter((r) => String(r.status || '').trim().toLowerCase() !== 'closed').length;
  const totalTakeFives = takeFives.length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={AlertTriangle} label="Incidents logged (all time)" value={incidents.length} tone="#e11d48" />
        <SummaryCard icon={FileCheck2} label="Open incidents" value={openIncidents} tone="#f59e0b" />
        <SummaryCard icon={ShieldAlert} label="Open safety reports" value={openRisks} tone="#7c3aed" />
        <SummaryCard icon={FileCheck2} label="Take 5 assessments" value={totalTakeFives} tone="#0d9488" />
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-5 shadow-lg shadow-rose-500/5 dark:border-rose-900 dark:from-rose-950/25 dark:via-card dark:to-orange-950/20">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-red-500" />
        <div className="mb-1 flex items-center gap-2 text-sm font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-rose-600 to-orange-500 text-white shadow-md">
            <AlertTriangle className="h-4 w-4" />
          </span>
          Incident Frequency — Last 6 Months
        </div>
        <div className="mb-4 pl-10 text-xs font-medium text-foreground/55">Stacked by severity · {lastMonth ? `${lastMonthIncidents} incident${lastMonthIncidents === 1 ? '' : 's'} in ${lastMonth.label}, ${trendNote}` : ''}</div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={incidentTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            {['Low', 'Medium', 'High', 'Critical'].map((s) => (
              <Bar key={s} dataKey={s} stackId="severity" fill={SEVERITY_COLORS[s]} radius={s === 'Critical' ? [6, 6, 0, 0] : [0, 0, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-teal-50 p-5 shadow-lg shadow-violet-500/5 dark:border-violet-900 dark:from-violet-950/25 dark:via-card dark:to-teal-950/20">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-cyan-500 to-teal-500" />
        <div className="mb-1 flex items-center gap-2 text-sm font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-teal-500 text-white shadow-md">
            <ShieldAlert className="h-4 w-4" />
          </span>
          Safety Report Trends — Last 6 Months
        </div>
        <div className="mb-4 pl-10 text-xs font-medium text-foreground/55">Risks, hazards, near misses and Take 5 assessments recorded each month</div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={safetyTrend} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              {Object.entries(REPORT_COLORS).map(([key, color]) => (
                <linearGradient key={key} id={`grad-${key.replace(/\s/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.7} />
                  <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                </linearGradient>
              ))}
              <linearGradient id="grad-Take5s" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="Risks" stroke={REPORT_COLORS.Risk} fill="url(#grad-Risk)" strokeWidth={2} />
            <Area type="monotone" dataKey="Hazards" stroke={REPORT_COLORS.Hazard} fill="url(#grad-Hazard)" strokeWidth={2} />
            <Area type="monotone" dataKey="Near Miss" stroke={REPORT_COLORS['Near Miss']} fill="url(#grad-NearMiss)" strokeWidth={2} />
            <Area type="monotone" dataKey="Take 5s" stroke="#0d9488" fill="url(#grad-Take5s)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative overflow-hidden rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-white to-fuchsia-50 p-5 shadow-lg shadow-cyan-500/5 dark:border-cyan-900 dark:from-cyan-950/25 dark:via-card dark:to-fuchsia-950/20">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-violet-500" />
        <div className="mb-1 flex items-center gap-2 text-sm font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-fuchsia-500 text-white shadow-md">
            <ShieldAlert className="h-4 w-4" />
          </span>
          Safety Report Mix
        </div>
        <div className="mb-4 pl-10 text-xs font-medium text-foreground/55">Share of each report type across all safety reports logged</div>
        <div className="grid gap-4 lg:grid-cols-2">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Risk', value: risks.filter((r) => (r.report_type || 'Risk') === 'Risk').length },
                  { name: 'Hazard', value: risks.filter((r) => r.report_type === 'Hazard').length },
                  { name: 'Near Miss', value: risks.filter((r) => r.report_type === 'Near Miss').length },
                  { name: 'Take 5s', value: takeFives.length },
                ]}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {['#7c3aed', '#f59e0b', '#0ea5e9', '#0d9488'].map((color, i) => (
                  <Cell key={i} fill={color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col justify-center gap-2">
            {[
              ['Risk', '#7c3aed', risks.filter((r) => (r.report_type || 'Risk') === 'Risk').length],
              ['Hazard', '#f59e0b', risks.filter((r) => r.report_type === 'Hazard').length],
              ['Near Miss', '#0ea5e9', risks.filter((r) => r.report_type === 'Near Miss').length],
              ['Take 5 assessments', '#0d9488', takeFives.length],
            ].map(([label, color, value]) => (
              <div key={label} className="flex items-center justify-between rounded-lg border bg-card/70 px-3 py-2">
                <span className="flex items-center gap-2 text-sm font-semibold text-foreground/80">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                  {label}
                </span>
                <span className="text-lg font-extrabold" style={{ color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}