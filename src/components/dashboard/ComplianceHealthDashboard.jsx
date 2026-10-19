import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Loader2, Gauge, ArrowRight, ShieldCheck, FileDown } from 'lucide-react';
import { downloadComplianceHealthReport } from '@/lib/complianceHealthPdf';

const pct = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);
const barTone = (p) => (p >= 80 ? 'bg-emerald-500' : p >= 50 ? 'bg-amber-500' : 'bg-rose-500');
const chipTone = (p) => (p >= 80 ? 'text-emerald-600 dark:text-emerald-400' : p >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400');

function Ring({ percent }) {
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-violet-500/15" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className={`${barTone(percent)} transition-all duration-700`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-extrabold leading-none">{percent}%</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/50">healthy</span>
      </div>
    </div>
  );
}

export default function ComplianceHealthDashboard() {
  const [rows, setRows] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const exportPdf = async () => {
    setExporting(true);
    try {
      await downloadComplianceHealthReport();
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [all, done] = await Promise.all([
          base44.entities.TodoTask.aggregate({ query: { status: { $ne: 'Cancelled' } }, groupBy: 'task_type' }),
          base44.entities.TodoTask.aggregate({ query: { status: 'Completed' }, groupBy: 'task_type' }),
        ]);
        if (!alive) return;
        const doneBy = Object.fromEntries((done.rows || []).map((r) => [r.task_type || 'General', r.count]));
        const groups = (all.rows || [])
          .map((r) => ({
            label: r.task_type || 'General',
            total: r.count,
            done: doneBy[r.task_type || 'General'] || 0,
          }))
          .map((g) => ({ ...g, outstanding: g.total - g.done, percent: pct(g.done, g.total) }))
          .sort((a, b) => a.percent - b.percent || b.total - a.total);
        setRows(groups);
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const totals = (rows || []).reduce((acc, g) => ({ done: acc.done + g.done, total: acc.total + g.total }), { done: 0, total: 0 });
  const overall = pct(totals.done, totals.total);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 via-white to-indigo-50 p-5 shadow-lg shadow-violet-500/5 dark:border-violet-900 dark:from-violet-950/25 dark:via-card dark:to-indigo-950/20">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-emerald-500" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-md">
              <Gauge className="h-4 w-4" />
            </span>
            Compliance health by department
          </div>
          <div className="text-xs text-foreground/50">Completed versus outstanding audit tasks in each department</div>
        </div>
        {!loading && rows?.length > 0 && (
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={exportPdf} disabled={exporting} className="inline-flex items-center gap-1.5 rounded-full border border-violet-300 bg-white px-3 py-1.5 text-xs font-semibold text-violet-800 transition-all hover:-translate-y-0.5 hover:shadow-sm disabled:opacity-60 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300">
              {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <FileDown className="h-3 w-3" />}
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <Link to="/tasks" className="hidden items-center gap-1 rounded-full border border-violet-300 bg-violet-100 px-3 py-1.5 text-xs font-semibold text-violet-800 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300 sm:inline-flex">
              Open tasks <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-foreground/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : !rows || rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg"><ShieldCheck className="h-6 w-6" /></div>
          <div className="text-sm font-medium">No compliance tasks yet</div>
          <div className="mt-0.5 text-xs text-foreground/50">Department health bars appear as soon as audit tasks are added.</div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <Ring percent={overall} />
            <div className="text-center text-xs font-medium text-foreground/60">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{totals.done}</span> completed &middot;{' '}
              <span className="font-bold text-rose-600 dark:text-rose-400">{totals.total - totals.done}</span> outstanding
            </div>
          </div>

          <div className="w-full space-y-3">
            {rows.map((g) => (
              <Link key={g.label} to="/tasks" className="block rounded-xl border border-border/70 bg-card/60 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-card/40">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{g.label}</span>
                  <span className={`shrink-0 text-xs font-bold tabular-nums ${chipTone(g.percent)}`}>
                    {g.done}/{g.total} &middot; {g.percent}%
                  </span>
                </div>
                <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div className={`h-full rounded-full ${barTone(g.percent)} transition-all duration-700`} style={{ width: `${g.percent}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium">
                  <span className="text-rose-600 dark:text-rose-400">{g.outstanding} outstanding</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{g.done} completed</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}