import React, { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Flame } from 'lucide-react';

const PENDING = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Overdue'];

// Buckets per staff member: overdue/soon tasks plus document and certificate expiries.
const COLUMNS = [
  { key: 'tasksOverdue', label: 'Tasks overdue' },
  { key: 'tasksWeek', label: 'Tasks due ≤ 7d' },
  { key: 'tasksMonth', label: 'Tasks due ≤ 30d' },
  { key: 'docsExpired', label: 'Docs expired' },
  { key: 'docsSoon', label: 'Docs expiring ≤ 30d' },
  { key: 'certsExpired', label: 'Certificates expired' },
  { key: 'certsSoon', label: 'Certificates expiring ≤ 30d' },
];

// Cell colour by risk count: clear, watch, warn, high.
const cellTone = (n) => {
  if (!n) return { cls: 'bg-muted/40 text-foreground/30', label: 'Clear' };
  if (n <= 2) return { cls: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100', label: 'Watch' };
  if (n <= 5) return { cls: 'bg-orange-200 text-orange-900 dark:bg-orange-900/60 dark:text-orange-100', label: 'Elevated' };
  return { cls: 'bg-red-200 text-red-900 dark:bg-red-900/60 dark:text-red-100', label: 'High' };
};

// Heatmap of risk hot spots: pending compliance tasks and upcoming staff
// document / certificate expirations, per staff member.
export default function RiskHeatmap() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const today = format(new Date(), 'yyyy-MM-dd');
        const in7 = format(new Date(Date.now() + 7 * 86400000), 'yyyy-MM-dd');
        const in30 = format(new Date(Date.now() + 30 * 86400000), 'yyyy-MM-dd');
        const [tasks, docs, certs] = await Promise.all([
          base44.entities.TodoTask.filter(
            { status: { $in: PENDING }, due_date: { $ne: null } },
            { sort: 'due_date', limit: 500, fields: ['title', 'due_date', 'assigned_to'] }
          ),
          base44.entities.EmployeeDocument.filter(
            { expiry_date: { $ne: null } },
            { sort: 'expiry_date', limit: 500, fields: ['title', 'expiry_date', 'employee_name'] }
          ),
          base44.entities.Certificate.filter(
            { expiry_date: { $ne: null } },
            { sort: 'expiry_date', limit: 500, fields: ['module_title', 'expiry_date', 'staff_name'] }
          ),
        ]);
        if (cancelled) return;
        const map = new Map();
        const row = (name) => {
          const key = String(name || '').trim();
          if (!key) return null;
          if (!map.has(key)) map.set(key, { name: key, tasksOverdue: 0, tasksWeek: 0, tasksMonth: 0, docsExpired: 0, docsSoon: 0, certsExpired: 0, certsSoon: 0, items: {} });
          return map.get(key);
        };
        (tasks.items || []).forEach((t) => {
          const r = row(t.assigned_to);
          if (!r) return;
          const due = t.due_date;
          if (due < today) r.tasksOverdue += 1;
          else if (due <= in7) r.tasksWeek += 1;
          else if (due <= in30) r.tasksMonth += 1;
        });
        (docs.items || []).forEach((d) => {
          const r = row(d.employee_name);
          if (!r) return;
          if (d.expiry_date < today) r.docsExpired += 1;
          else if (d.expiry_date <= in30) r.docsSoon += 1;
        });
        (certs.items || []).forEach((c) => {
          const r = row(c.staff_name);
          if (!r) return;
          if (c.expiry_date < today) r.certsExpired += 1;
          else if (c.expiry_date <= in30) r.certsSoon += 1;
        });
        setRows(Array.from(map.values()).sort((a, b) => total(b) - total(a)));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const riskAreas = useMemo(() => {
    const areas = [];
    for (const r of rows) {
      for (const col of COLUMNS) {
        const n = r[col.key];
        if (n >= 3) areas.push({ name: r.name, area: col.label, count: n });
      }
    }
    return areas.sort((a, b) => b.count - a.count).slice(0, 6);
  }, [rows]);

  if (loading) {
    return <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
      <Loader2 className="h-4 w-4 animate-spin" />Building risk heatmap...
    </CardContent></Card>;
  }

  if (!rows.length) {
    return <Card><CardContent className="p-10 text-center text-sm text-foreground/60">No pending tasks or expiring documents found.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-panel">
        <CardContent className="p-5">
          <div className="mb-1 flex items-center gap-2 font-display text-base font-bold"><Flame className="h-4 w-4 text-red-500" />Risk heatmap</div>
          <p className="mb-4 text-xs font-medium text-muted-foreground">Each cell counts pending tasks and expiring documents or certificates per staff member — darker means higher risk. Rows are sorted by total risk.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left">
                  <th className="px-3 py-2 font-semibold text-foreground/60">Staff member</th>
                  {COLUMNS.map((c) => <th key={c.key} className="px-3 py-2 font-semibold text-foreground/60">{c.label}</th>)}
                  <th className="px-3 py-2 text-right font-semibold text-foreground/60">Total</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.name} className="border-t border-border/50">
                    <td className="px-3 py-1.5 font-semibold">{r.name}</td>
                    {COLUMNS.map((c) => {
                      const n = r[c.key];
                      const tone = cellTone(n);
                      return (
                        <td key={c.key} className="px-1 py-1.5">
                          <div title={`${r.name}: ${tone.label} — ${n} ${c.label.toLowerCase()}`} className={`rounded-md text-center font-bold tabular-nums ${tone.cls}`}>{n}</div>
                        </td>
                      );
                    })}
                    <td className="px-3 py-1.5 text-right font-bold tabular-nums">{total(r)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {riskAreas.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 text-sm font-semibold">Highest risk areas right now</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {riskAreas.map((a, i) => (
                <div key={i} className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs dark:border-red-800 dark:bg-red-950/30">
                  <Flame className="h-3.5 w-3.5 text-red-500" />
                  <span className="font-semibold">{a.name}</span>
                  <span className="text-foreground/70">{a.area}</span>
                  <span className="ml-auto font-bold tabular-nums text-red-700 dark:text-red-300">{a.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

const total = (r) => r.tasksOverdue + r.tasksWeek + r.tasksMonth + r.docsExpired + r.docsSoon + r.certsExpired + r.certsSoon;