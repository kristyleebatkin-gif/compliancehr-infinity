import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ClipboardList, Loader2, PlayCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const priorityTone = {
  Low: 'bg-emerald-100 text-emerald-800',
  Medium: 'bg-amber-100 text-amber-800',
  High: 'bg-orange-100 text-orange-800',
  Urgent: 'bg-red-100 text-red-800',
};

const tiles = [
  { key: 'open', label: 'Open', from: '#2563eb', to: '#3b82f6', Icon: ClipboardList, statuses: ['Pending', 'Open', 'Pending Approval'] },
  { key: 'progress', label: 'In Progress', from: '#7c3aed', to: '#a855f7', Icon: PlayCircle, statuses: ['In Progress'] },
  { key: 'overdue', label: 'Overdue', from: '#dc2626', to: '#f87171', Icon: AlertTriangle, statuses: null },
  { key: 'done', label: 'Completed', from: '#059669', to: '#34d399', Icon: CheckCircle2, statuses: ['Completed'] },
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
          { sort: 'due_date', limit: 6 }
        ).then((p) => p.items.filter((t) => t.due_date >= today).slice(0, 3)),
      ]);
      if (!alive) return;
      setStats({ open, progress, overdue, done });
      setUpNext(next);
    })().catch(() => { if (alive) setStats({ open: 0, progress: 0, overdue: 0, done: 0 }); });
    return () => { alive = false; };
  }, []);

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-lg">
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--header-gradient)', color: '#fff' }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <ClipboardList className="h-5 w-5 text-white" />
        </span>
        <div>
          <h3 className="text-base font-bold">Task Dashboard</h3>
          <p className="text-[11px] font-semibold text-white/85">Live team to-do status at a glance</p>
        </div>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading tasks…
        </div>
      ) : (
        <div className="space-y-2.5 p-3">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {tiles.map(({ key, label, from, to, Icon, statuses }) => (
              <div key={key} className="overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
                <div className="flex items-center gap-2.5 p-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xl font-bold leading-6">{stats[key]}</p>
                    <p className="text-[11px] font-semibold text-muted-foreground">{label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {upNext.length > 0 && (
            <div className="rounded-xl border bg-white p-2.5">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Up next</p>
              <div className="space-y-1">
                {upNext.map((t) => (
                  <div key={t.id} className="flex items-center gap-2 rounded-lg border px-2 py-1.5">
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${priorityTone[t.priority] || 'bg-slate-100'}`}>{t.priority}</span>
                    <p className="flex-1 truncate text-xs font-semibold">{t.title}</p>
                    <span className="text-[11px] font-semibold text-muted-foreground">{t.due_date}</span>
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