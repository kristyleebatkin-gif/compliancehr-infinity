import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Loader2, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts';

const PIE_COLOURS = ['#4f46e5', '#0d9488', '#16a34a', '#ca8a04', '#dc2626', '#9333ea', '#2563eb', '#db2777'];
const BUCKET_COMPUTED = ['count', 'sum_amount', 'avg_amount', 'min_amount', 'max_amount'];
const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { maximumFractionDigits: 0 })}`;
const rowSum = (rows, key = 'sum_amount') => rows.reduce((t, r) => t + Number(r[key] || 0), 0);
const bucketRows = (rows, valueKey) => (rows || [])
  .map((r) => {
    const bucketKey = Object.keys(r).find((k) => !BUCKET_COMPUTED.includes(k));
    const bucket = r[bucketKey] || '';
    return { bucket: String(bucket).slice(0, 7), value: Number(r[valueKey] ?? r.count ?? 0) };
  })
  .filter((r) => r.bucket)
  .sort((a, b) => a.bucket.localeCompare(b.bucket));

export default function AnalyticsHub() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [inv, quotes, tasks, staff, parts] = await Promise.all([
        base44.entities.Invoice.aggregate({ groupBy: 'status', sum: ['amount'] }),
        base44.entities.Quote.aggregate({ groupBy: 'status' }),
        base44.entities.TodoTask.aggregate({ groupBy: 'status' }),
        base44.entities.StaffProfile.aggregate({ groupBy: 'status' }),
        base44.entities.ParticipantProfile.aggregate({ groupBy: 'status' }),
      ]);
      let revenue = [];
      let incidents = [];
      try {
        revenue = bucketRows((await base44.entities.Invoice.aggregate({ dateBucket: { field: 'issue_date', unit: 'month' }, sum: ['amount'] })).rows, 'sum_amount');
      } catch (e) { console.error(e); }
      try {
        incidents = bucketRows((await base44.entities.Incident.aggregate({ dateBucket: { field: 'created_date', unit: 'month' } })).rows, 'count');
      } catch (e) { console.error(e); }

      const byStatus = (rows) => Object.fromEntries(rows.map((r) => [r.status, r]));
      const i = byStatus(inv.rows || []);
      const q = byStatus(quotes.rows || []);
      const accepted = Number(q.Accepted?.count || 0);
      const lostQuotes = Number(q.Declined?.count || 0) + Number(q.Expired?.count || 0);
      setStats({
        invoicedTotal: rowSum(inv.rows || []),
        paid: Number(i.Paid?.sum_amount || 0),
        overdue: Number(i.Overdue?.sum_amount || 0),
        outstanding: Number(i.Sent?.sum_amount || 0) + Number(i.Overdue?.sum_amount || 0),
        invoiceCount: (inv.rows || []).reduce((t, r) => t + Number(r.count || 0), 0),
        quoteWinRate: accepted + lostQuotes > 0 ? Math.round((accepted / (accepted + lostQuotes)) * 100) : null,
        quotesWon: accepted,
        openTasks: Number(tasks.rows?.find((r) => r.status === 'Pending')?.count || 0),
        doneTasks: Number(tasks.rows?.find((r) => r.status === 'Finalised')?.count || 0),
        activeStaff: Number(staff.rows?.find((r) => r.status === 'Active')?.count || 0),
        staffRows: staff.rows || [],
        activeParticipants: Number(parts.rows?.find((r) => r.status === 'Active')?.count || 0),
        revenue,
        incidents,
        quoteRows: (quotes.rows || []).map((r) => ({ status: r.status, value: Number(r.count || 0) })),
        taskRows: (tasks.rows || []).map((r) => ({ status: r.status, value: Number(r.count || 0) })),
      });
    } catch (err) {
      setError(err?.response?.data?.error || err.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const kpis = [
    { label: 'Total invoiced', value: money(stats?.invoicedTotal), sub: `${stats?.invoiceCount || 0} invoices` },
    { label: 'Paid', value: money(stats?.paid), sub: 'collected revenue' },
    { label: 'Outstanding', value: money(stats?.outstanding), sub: `incl. ${money(stats?.overdue)} overdue`, warn: stats?.overdue > 0 },
    { label: 'Quote win rate', value: stats?.quoteWinRate != null ? `${stats.quoteWinRate}%` : 'n/a', sub: `${stats?.quotesWon || 0} accepted` },
    { label: 'Open tasks', value: stats?.openTasks ?? 0, sub: `${stats?.doneTasks || 0} completed` },
    { label: 'Active staff', value: stats?.activeStaff ?? 0, sub: `${stats?.activeParticipants || 0} active participants` },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Business Analytics"
        subtitle="Live cross-module KPIs: revenue, sales outcomes, operations and workforce - exportable for the board pack."
        icon={BarChart3}
        showAlerts={false}
      />

      {loading && <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Crunching the numbers...</CardContent></Card>}

      {error && <Card><CardContent className="flex items-center gap-2 p-4 text-sm text-danger"><AlertCircle className="h-4 w-4" />{error}</CardContent></Card>}

      {stats && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {kpis.map((k) => (
              <Card key={k.label} className={k.warn ? 'border-danger/40' : ''}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{k.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-tight">{k.value}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{k.sub}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-bold">Revenue by month (invoiced)</p>
                {stats.revenue.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No invoices yet.</p> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.revenue}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="bucket" fontSize={11} />
                      <YAxis fontSize={11} />
                      <Tooltip formatter={(v) => money(v)} />
                      <Bar dataKey="value" name="Invoiced" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-bold">Quote outcomes</p>
                {stats.quoteRows.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No quotes yet.</p> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={stats.quoteRows} dataKey="value" nameKey="status" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {stats.quoteRows.map((_, i) => <Cell key={i} fill={PIE_COLOURS[i % PIE_COLOURS.length]} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-bold">Incidents by month</p>
                {stats.incidents.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No incidents recorded.</p> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.incidents}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="bucket" fontSize={11} />
                      <YAxis fontSize={11} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" name="Incidents" fill="#dc2626" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <p className="mb-3 text-sm font-bold">Task completion</p>
                {stats.taskRows.length === 0 ? <p className="py-10 text-center text-sm text-muted-foreground">No tasks yet.</p> : (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={stats.taskRows} dataKey="value" nameKey="status" innerRadius={60} outerRadius={100} paddingAngle={2}>
                        {stats.taskRows.map((_, i) => <Cell key={i} fill={PIE_COLOURS[(i + 2) % PIE_COLOURS.length]} />)}
                      </Pie>
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}