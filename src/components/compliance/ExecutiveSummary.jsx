import React, { useEffect, useMemo, useState } from 'react';
import { subMonths, startOfMonth, endOfMonth, format, isWithinInterval } from 'date-fns';
import {
  ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, Area, AreaChart,
} from 'recharts';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ScoreRing from '@/components/ScoreRing';
import { downloadCsv } from '@/lib/csvExport';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileCheck2, AlertTriangle, ClipboardCheck, CalendarClock, Download, RefreshCw } from 'lucide-react';
import SafetyTrendChart from '@/components/compliance/SafetyTrendChart';

const GREEN = '#16a34a';
const VIOLET = '#7c3aed';
const AMBER = '#f59e0b';
const ROSE = '#e11d48';

const CARD = (tone) => ({ borderColor: `${tone}55`, background: `linear-gradient(135deg, ${tone}26, hsl(var(--card)) 75%)`, boxShadow: `0 8px 24px -14px ${tone}77` });

const DeltaBadge = ({ delta, invert }) => {
  if (delta === 0) return <Badge className="border-transparent bg-muted text-foreground/60">no change</Badge>;
  const good = invert ? delta < 0 : delta > 0;
  return (
    <Badge className={`border-transparent ${good ? 'bg-safe/10 text-safe' : 'bg-danger/10 text-danger'}`}>
      {delta > 0 ? '▲' : '▼'} {Math.abs(delta)} vs last month
    </Badge>
  );
};

// Executive summary: a month-over-month breakdown of compliance health for the
// board — live score, task throughput, incident volume and the staff document
// renewal outlook, reusing the existing safety trend charts.
export default function ExecutiveSummary() {
  const { toast } = useToast();
  const [scoreData, setScoreData] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [certs, setCerts] = useState([]);
  const [empDocs, setEmpDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const since = format(subMonths(new Date(), 6), 'yyyy-MM-dd');
      const [scoreRes, taskPage, incPage, certPage, empPage] = await Promise.all([
        base44.functions.invoke('complianceScore', {}).catch(() => null),
        base44.entities.TodoTask.filter({ created_date: { $gte: since } }, { sort: '-created_date', limit: 500, fields: ['status', 'created_date', 'completed_date'] }),
        base44.entities.Incident.filter({ created_date: { $gte: since } }, { sort: '-created_date', limit: 500, fields: ['severity', 'created_date', 'date_occurred'] }),
        base44.entities.Certificate.filter({ expiry_date: { $ne: null } }, { sort: 'expiry_date', limit: 500, fields: ['staff_name', 'expiry_date', 'status'] }),
        base44.entities.EmployeeDocument.filter({ expiry_date: { $ne: null } }, { sort: 'expiry_date', limit: 500, fields: ['employee_name', 'expiry_date', 'status'] }),
      ]);
      if (scoreRes?.data && !scoreRes.data.error) setScoreData(scoreRes.data);
      setTasks(taskPage.items || []);
      setIncidents(incPage.items || []);
      setCerts(certPage.items || []);
      setEmpDocs(empPage.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const months = useMemo(
    () => Array.from({ length: 6 }, (_, i) => subMonths(new Date(), 5 - i)).map((m) => ({
      key: format(startOfMonth(m), 'yyyy-MM'),
      label: format(m, 'MMM'),
      start: startOfMonth(m),
      end: endOfMonth(m),
    })),
    [],
  );

  const inMonth = (date, m) => date && isWithinInterval(new Date(date), { start: m.start, end: m.end });

  const rows = useMemo(() => months.map((m) => {
    const monthTasks = tasks.filter((t) => inMonth(t.created_date, m));
    const completed = monthTasks.filter((t) => t.completed_date || t.status === 'Completed').length;
    const created = monthTasks.length;
    return {
      key: m.key,
      label: m.label,
      created,
      completed,
      rate: created ? Math.round((completed / created) * 100) : null,
      incidents: incidents.filter((i) => inMonth(i.date_occurred || i.created_date, m)).length,
      certRenewals: certs.filter((c) => inMonth(c.expiry_date, m)).length,
      empRenewals: empDocs.filter((d) => inMonth(d.expiry_date, m)).length,
    };
  }), [months, tasks, incidents, certs, empDocs]);

  // Renewal outlook across the same six-month window for staff documents.
  const renewalChart = rows.map((r) => ({ label: r.label, 'Certificates due': r.certRenewals, 'Employee docs due': r.empRenewals }));

  // Ops chart: task throughput and incident volume per month.
  const opsChart = rows.map((r) => ({ label: r.label, 'Tasks completed': r.completed, 'Tasks created': r.created, Incidents: r.incidents }));

  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2] || {};
  const now = new Date();
  const expiredCerts = certs.filter((c) => new Date(c.expiry_date) < now).length;
  const dueSoonDocs = [...certs, ...empDocs].filter((c) => {
    const d = new Date(c.expiry_date);
    return d >= now && d <= new Date(now.getTime() + 30 * 86400000);
  }).length;

  const exportCsv = () => {
    downloadCsv('compliance-executive-summary.csv', [
      { key: 'label', label: 'Month' },
      { key: 'created', label: 'Tasks Created' },
      { key: 'completed', label: 'Tasks Completed' },
      { key: 'rate', label: 'Completion Rate %' },
      { key: 'incidents', label: 'Incidents Logged' },
      { key: 'certRenewals', label: 'Certificate Renewals Due' },
      { key: 'empRenewals', label: 'Employee Doc Renewals Due' },
    ], rows);
    toast({ title: 'Executive summary exported' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-2xl border border-border/60 bg-card p-10 text-sm text-foreground/50">
        <Loader2 className="h-4 w-4 animate-spin" /> Compiling executive summary…
      </div>
    );
  }

  const score = scoreData?.score ?? null;

  return (
    <div className="space-y-4">
      {/* Score + headline MoM tiles */}
      <Card className="shadow-panel">
        <CardContent className="p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-display text-lg font-bold">Executive summary — compliance health</div>
              <p className="text-xs text-muted-foreground">Month-over-month breakdown across the last six months{scoreData ? `, live score collected from ${scoreData.registers_monitored ?? 10} registers` : ''}.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={load}><RefreshCw className="mr-2 h-3.5 w-3.5" />Refresh</Button>
              <Button variant="outline" size="sm" onClick={exportCsv}><Download className="mr-2 h-3.5 w-3.5" />Export CSV</Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-[auto,1fr]">
            <div className="mx-auto md:mx-0">
              {score === null ? (
                <div className="flex h-[130px] w-[130px] animate-pulse items-center justify-center rounded-full bg-muted text-[11px] text-muted-foreground">collecting…</div>
              ) : (
                <ScoreRing value={score} size={130} label="Live score" />
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div className="rounded-xl border p-4 shadow-sm" style={CARD(VIOLET)}>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground/60"><ClipboardCheck className="h-3.5 w-3.5" />Tasks completed — {last?.label}</div>
                <p className="text-3xl font-extrabold tabular-nums" style={{ color: VIOLET }}>{last?.completed ?? 0}</p>
                <div className="mt-2"><DeltaBadge delta={(last?.completed ?? 0) - (prev.completed ?? 0)} /></div>
              </div>
              <div className="rounded-xl border p-4 shadow-sm" style={CARD(ROSE)}>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground/60"><AlertTriangle className="h-3.5 w-3.5" />Incidents — {last?.label}</div>
                <p className="text-3xl font-extrabold tabular-nums" style={{ color: ROSE }}>{last?.incidents ?? 0}</p>
                <div className="mt-2"><DeltaBadge delta={(last?.incidents ?? 0) - (prev.incidents ?? 0)} invert /></div>
              </div>
              <div className="rounded-xl border p-4 shadow-sm" style={CARD(AMBER)}>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground/60"><CalendarClock className="h-3.5 w-3.5" />Renewals due in 30 days</div>
                <p className="text-3xl font-extrabold tabular-nums" style={{ color: AMBER }}>{dueSoonDocs}</p>
              </div>
              <div className="rounded-xl border p-4 shadow-sm" style={CARD(ROSE)}>
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground/60"><FileCheck2 className="h-3.5 w-3.5" />Expired certificates</div>
                <p className="text-3xl font-extrabold tabular-nums" style={{ color: ROSE }}>{expiredCerts}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff document renewal outlook */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-200 bg-gradient-to-br from-teal-50 via-white to-cyan-50 p-5 shadow-lg shadow-teal-500/5 dark:border-teal-900 dark:from-teal-950/25 dark:via-card dark:to-cyan-950/20">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-500 to-violet-500" />
        <div className="mb-1 flex items-center gap-2 text-sm font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-600 to-cyan-500 text-white shadow-md"><FileCheck2 className="h-4 w-4" /></span>
          Staff document renewals — last 6 months
        </div>
        <div className="mb-4 pl-10 text-xs font-medium text-foreground/55">Certificates and employee documents falling due each month — a shrinking overdue backlog and spread-out renewals are the health signal.</div>
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={renewalChart} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="es-cert" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="es-emp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7c3aed" stopOpacity={0.7} />
                <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="Certificates due" stroke="#0d9488" fill="url(#es-cert)" strokeWidth={2} />
            <Area type="monotone" dataKey="Employee docs due" stroke="#7c3aed" fill="url(#es-emp)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Compliance operations, month over month */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-rose-50 p-5 shadow-lg shadow-violet-500/5 dark:border-violet-900 dark:from-violet-950/25 dark:via-card dark:to-rose-950/20">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-fuchsia-500 to-rose-500" />
        <div className="mb-1 flex items-center gap-2 text-sm font-bold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white shadow-md"><ClipboardCheck className="h-4 w-4" /></span>
          Compliance operations — month over month
        </div>
        <div className="mb-4 pl-10 text-xs font-medium text-foreground/55">Tasks created vs completed and incident volume for each of the last six months.</div>
        <ResponsiveContainer width="100%" height={230}>
          <ComposedChart data={opsChart} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: 12, border: '1px solid hsl(var(--border))', fontSize: 12 }} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="Tasks completed" fill={GREEN} radius={[6, 6, 0, 0]} />
            <Bar dataKey="Tasks created" fill={VIOLET} radius={[6, 6, 0, 0]} />
            <Line type="monotone" dataKey="Incidents" stroke={ROSE} strokeWidth={2} dot={{ r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Month-over-month table */}
      <Card>
        <CardContent className="p-0">
          <div className="border-b border-border/60 px-5 py-4 font-semibold">Month-over-month breakdown</div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs text-muted-foreground">
                  <th className="px-5 py-2 font-semibold">Month</th>
                  <th className="px-3 py-2 font-semibold">Tasks created</th>
                  <th className="px-3 py-2 font-semibold">Tasks completed</th>
                  <th className="px-3 py-2 font-semibold">Completion rate</th>
                  <th className="px-3 py-2 font-semibold">Incidents</th>
                  <th className="px-3 py-2 font-semibold">Cert renewals due</th>
                  <th className="px-5 py-2 font-semibold">Employee doc renewals due</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="border-b border-border/40 last:border-0">
                    <td className="px-5 py-2.5 font-semibold">{r.label}</td>
                    <td className="px-3 py-2.5 tabular-nums">{r.created}</td>
                    <td className="px-3 py-2.5 tabular-nums text-safe">{r.completed}</td>
                    <td className="px-3 py-2.5 tabular-nums">{r.rate === null ? '—' : `${r.rate}%`}</td>
                    <td className={`px-3 py-2.5 tabular-nums ${r.incidents > 0 ? 'text-danger' : ''}`}>{r.incidents}</td>
                    <td className="px-3 py-2.5 tabular-nums">{r.certRenewals}</td>
                    <td className="px-5 py-2.5 tabular-nums">{r.empRenewals}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Existing safety trend charts, embedded in the report */}
      <SafetyTrendChart />
    </div>
  );
}