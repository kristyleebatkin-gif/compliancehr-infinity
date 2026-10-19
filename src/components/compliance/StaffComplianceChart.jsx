import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader2, Users } from 'lucide-react';

const PENDING = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'];
const EXPIRY_WINDOW_DAYS = 30;
const COLORS = { compliant: '#28A745', expiring: '#FF9800', expired: '#D32F2F' };

// Donut chart: what share of staff are fully compliant vs have documents or
// certificates expiring within 30 days vs already have expired/overdue items.
export default function StaffComplianceChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const today = format(new Date(), 'yyyy-MM-dd');
      const horizon = format(new Date(Date.now() + EXPIRY_WINDOW_DAYS * 86400000), 'yyyy-MM-dd');
      const [staffPage, docs, certs, tasks] = await Promise.all([
        base44.entities.StaffProfile.filter({}, { limit: 500, fields: ['full_name'] }),
        base44.entities.EmployeeDocument.filter(
          { expiry_date: { $ne: null } },
          { limit: 500, fields: ['employee_name', 'expiry_date'] },
        ),
        base44.entities.Certificate.filter(
          { expiry_date: { $ne: null } },
          { limit: 500, fields: ['staff_name', 'expiry_date'] },
        ),
        base44.entities.TodoTask.filter(
          { status: { $in: PENDING }, due_date: { $ne: null } },
          { sort: 'due_date', limit: 500, fields: ['assigned_to', 'due_date'] },
        ),
      ]);
      if (cancelled) return;

      const names = (staffPage.items || []).map((s) => s.full_name).filter(Boolean);
      const buckets = { compliant: [], expiring: [], expired: [] };
      const stateOf = (name) => {
        let expired = false, expiring = false;
        (docs.items || []).forEach((d) => {
          if (d.employee_name !== name) return;
          if (d.expiry_date < today) expired = true;
          else if (d.expiry_date <= horizon) expiring = true;
        });
        (certs.items || []).forEach((c) => {
          if (c.staff_name !== name) return;
          if (c.expiry_date < today) expired = true;
          else if (c.expiry_date <= horizon) expiring = true;
        });
        (tasks.items || []).forEach((t) => {
          if (t.assigned_to !== name) return;
          if (t.due_date < today) expired = true;
        });
        return expired ? 'expired' : expiring ? 'expiring' : 'compliant';
      };
      names.forEach((n) => buckets[stateOf(n)].push(n));
      const total = names.length || 1;
      setData({
        total: names.length,
        chart: [
          { name: 'Fully compliant', value: buckets.compliant.length, key: 'compliant' },
          { name: `Expiring ≤ ${EXPIRY_WINDOW_DAYS}d`, value: buckets.expiring.length, key: 'expiring' },
          { name: 'Expired / overdue items', value: buckets.expired.length, key: 'expired' },
        ],
        buckets,
      });
    };
    load().catch(() => { if (!cancelled) setData(null); });
    return () => { cancelled = true; };
  }, []);

  if (!data) {
    return <Card className="shadow-panel"><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" /> Calculating staff compliance overview…
    </CardContent></Card>;
  }

  const compliantPct = data.total ? Math.round((data.chart[0].value / data.total) * 100) : 0;

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <Users className="h-5 w-5 text-primary" /> Staff compliance overview
        </h2>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Share of active staff with every document, certificate and compliance task up to date, versus staff with items expiring within {EXPIRY_WINDOW_DAYS} days or already expired / overdue.
        </p>
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.1fr]">
          <div className="relative h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.chart} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={3} strokeWidth={0}>
                  {data.chart.map((s) => <Cell key={s.key} fill={COLORS[s.key]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} staff`, n]} />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-9">
              <span className="font-display text-3xl font-bold tabular-nums" style={{ color: COLORS.compliant }}>{compliantPct}%</span>
              <span className="text-xs font-medium text-muted-foreground">fully compliant</span>
            </div>
          </div>
          <div className="space-y-3">
            {data.chart.map((s) => (
              <div key={s.key} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3">
                <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: COLORS[s.key] }} />
                <span className="min-w-0 flex-1 text-sm font-semibold">{s.name}</span>
                <span className="text-lg font-bold tabular-nums" style={{ color: COLORS[s.key] }}>{data.total ? Math.round((s.value / data.total) * 100) : 0}%</span>
                <span className="text-sm font-semibold tabular-nums text-muted-foreground">{s.value} / {data.total}</span>
              </div>
            ))}
            {data.buckets.expired.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs dark:border-red-800 dark:bg-red-950/30">
                <span className="font-semibold">Needs attention:</span>{' '}
                <span className="text-foreground/70">{data.buckets.expired.join(', ')}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}