import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ClipboardList, Loader2, PlayCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const priorityTone = {
  Low: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-chart-2/15 text-foreground',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const tiles = [
  { key: 'open', label: 'Open', from: '#2563eb', to: '#0ea5e9', Icon: ClipboardList, statuses: ['Pending', 'Open', 'Pending Approval'] },
  { key: 'progress', label: 'In Progress', from: '#d97706', to: '#ca8a04', Icon: PlayCircle, statuses: ['In Progress'] },
  { key: 'overdue', label: 'Overdue', from: '#dc2626', to: '#f97316', Icon: AlertTriangle, statuses: null },
  { key: 'done', label: 'Completed', from: '#16a34a', to: '#14b8a6', Icon: CheckCircle2, statuses: ['Completed'] },
];

export default function CommTaskDash() {
  const [stats, setStats] = useState(null);
  const [upNext, setUpNext] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [open, progress, overdue, done, next] = await Promise.all([
        base44.entities.TodoTask.count({ status: { $in: ['Pending', 'Open', 'Pending Approval'] } }),
        base44.entities.TodoTask.count({ status: 'In Progress' }),
        base44.entities.TodoTask.count({ due_date: { $lt: today }, status: { $nin: ['Completed', 'Finalised', 'Cancelled'] } }),
        base44.entities.TodoTask.count({ status: 'Completed' }),
        base44.entities.TodoTask.filter(
          { status: { $in: ['Pending', 'Open', 'In Progress', 'Pending Approval'] }, due_date: { $ne: null } },
          { sort: 'due_date', limit: 4 }
        ).then((p) => p.items.filter((t) => t.due_date >= today).slice(0, 3)),
      ]);
      if (!alive) return;
      setStats({ open, progress, overdue, done });
      setUpNext(next);
    })().catch(() => { if (alive) setStats({ open: 0, progress: 0, overdue: 0, done: 0 }); });
    return () => { alive = false; };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2.5 px-4 py-2.5" style={{ '--comm-bar-bg': 'linear-gradient(120deg, #b45309 0%, #d97706 50%, #eab308 100%)', color: '#fff' }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <ClipboardList className="h-4 w-4 text-white" />
        </span>
        <div>
          <h3 className="text-base font-extrabold">Task Dashboard</h3>
          <p className="text-xs font-bold text-white/95">Live team to-do status at a glance</p>
        </div>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center gap-2 py-4 text-xs font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading tasks…
        </div>
      ) : (
        <div className="space-y-2.5 p-3.5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {tiles.map(({ key, label, from, to, Icon }) => (
              <div key={key} className="overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
                <div className="flex items-center gap-2.5 p-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-base sm:text-lg font-extrabold leading-5">{stats[key]}</p>
                    <p className="text-xs font-semibold text-muted-foreground">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {upNext.length > 0 && (
            <div className="rounded-xl border bg-white p-3">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">Up next</p>
              <div className="space-y-1.5">
                {upNext.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg border px-2.5 py-2">
                    <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${priorityTone[t.priority] || 'bg-slate-100'}`}>{t.priority}</span>
                    <p className="flex-1 truncate text-xs sm:text-sm font-semibold">{t.title}</p>
                    <span className="text-xs font-semibold text-muted-foreground">{t.due_date}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}