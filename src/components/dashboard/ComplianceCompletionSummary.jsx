import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ListChecks, AlertTriangle, ShieldAlert, ClipboardList, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';

const pct = (done, total) => (total > 0 ? Math.round((done / total) * 100) : 0);

function Ring({ percent }) {
  const size = 132;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  return (
    <div className="relative h-[132px] w-[132px] shrink-0">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-emerald-500/15" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          className={percent >= 80 ? 'stroke-emerald-500 transition-all duration-700' : percent >= 50 ? 'stroke-amber-500 transition-all duration-700' : 'stroke-rose-500 transition-all duration-700'}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-extrabold leading-none">{percent}%</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-foreground/50">complete</span>
      </div>
    </div>
  );
}

const TRACKS = [
  { key: 'tasks', label: 'Compliance tasks', to: '/tasks', Icon: ListChecks, bar: 'bg-gradient-to-r from-violet-500 to-fuchsia-500', chip: 'bg-violet-500' },
  { key: 'incidents', label: 'Incident reports', to: '/incidents', Icon: AlertTriangle, bar: 'bg-gradient-to-r from-orange-500 to-rose-500', chip: 'bg-orange-500' },
  { key: 'risks', label: 'Risk register', to: '/risks', Icon: ShieldAlert, bar: 'bg-gradient-to-r from-rose-500 to-red-500', chip: 'bg-rose-500' },
  { key: 'actions', label: 'Improvement actions', to: '/quality', Icon: ClipboardList, bar: 'bg-gradient-to-r from-blue-500 to-cyan-500', chip: 'bg-blue-500' },
];

export default function ComplianceCompletionSummary() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [tasks, incs, rsk, acts] = await Promise.all([
          base44.entities.TodoTask.aggregate({ groupBy: 'status' }),
          base44.entities.Incident.aggregate({ groupBy: 'status' }),
          base44.entities.Risk.aggregate({ groupBy: 'status' }),
          base44.entities.ImprovementAction.aggregate({ groupBy: 'status' }),
        ]);
        if (!alive) return;
        const rows = (res) => Object.fromEntries((res.rows || []).map((row) => [row.status || 'Unknown', row.count]));
        const t = rows(tasks), i = rows(incs), r = rows(rsk), a = rows(acts);

        const tracks = {
          tasks: { done: t.Finalised || 0, pending: t.Pending || 0 },
          incidents: { done: (i.Resolved || 0) + (i.Closed || 0), pending: (i.Reported || 0) + (i['Under Investigation'] || 0) + (i['Action Required'] || 0) },
          risks: { done: r.Closed || 0, pending: (r.Identified || 0) + (r.Assessed || 0) + (r.Treating || 0) + (r.Monitored || 0) },
          actions: { done: a.Closed || 0, pending: (a.Identified || 0) + (a.Investigating || 0) + (a.Implementing || 0) + (a.Reviewing || 0) },
        };
        const totals = Object.values(tracks).reduce((acc, tr) => ({ done: acc.done + tr.done, pending: acc.pending + tr.pending }), { done: 0, pending: 0 });
        setData({ tracks, totals, overall: pct(totals.done, totals.done + totals.pending) });
      } catch (e) {
        console.error(e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-5 shadow-lg shadow-emerald-500/5 dark:border-emerald-900 dark:from-emerald-950/25 dark:via-card dark:to-teal-950/20">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-violet-500" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md">
              <CheckCircle2 className="h-4 w-4" />
            </span>
            Compliance completion &amp; outstanding issues
          </div>
          <div className="text-xs text-foreground/50">How far along your compliance work is, and what is still open</div>
        </div>
        {!loading && data?.totals.pending > 0 && (
          <Link to="/tasks" className="hidden shrink-0 items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition-all hover:-translate-y-0.5 hover:shadow-sm dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 sm:inline-flex">
            {data.totals.pending} outstanding <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8 text-foreground/40">
          <Loader2 className="h-5 w-5 animate-spin" />
        </div>
      ) : !data || (data.totals.done + data.totals.pending) === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg"><CheckCircle2 className="h-6 w-6" /></div>
          <div className="text-sm font-medium">Nothing tracked yet</div>
          <div className="mt-0.5 text-xs text-foreground/50">Compliance tasks, incidents, risks and improvement actions will appear here.</div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="flex flex-col items-center gap-2">
            <Ring percent={data.overall} />
            <div className="text-center text-xs font-medium text-foreground/60">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.totals.done}</span> done &middot;{' '}
              <span className="font-bold text-rose-600 dark:text-rose-400">{data.totals.pending}</span> outstanding
            </div>
          </div>

          <div className="w-full space-y-3">
            {TRACKS.map((tr) => {
              const t = data.tracks[tr.key];
              const total = t.done + t.pending;
              const p = pct(t.done, total);
              return (
                <Link key={tr.key} to={tr.to} className="block rounded-xl border border-border/70 bg-card/60 p-3 transition-all hover:-translate-y-0.5 hover:shadow-md dark:bg-card/40">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm ${tr.chip}`}>
                        <tr.Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="truncate text-sm font-semibold">{tr.label}</span>
                    </div>
                    <span className="shrink-0 text-xs font-bold tabular-nums text-foreground/60">
                      {t.done}/{total} &middot; {p}%
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div className={`h-full rounded-full ${tr.bar} transition-all duration-700`} style={{ width: `${p}%` }} />
                  </div>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] font-medium">
                    <span className="text-rose-600 dark:text-rose-400">{t.pending} outstanding</span>
                    <span className="text-emerald-600 dark:text-emerald-400">{t.done} completed</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}