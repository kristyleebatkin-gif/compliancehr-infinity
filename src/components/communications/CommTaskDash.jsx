import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ClipboardList, Loader2, PlayCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

const tiles = [
  { key: 'open', label: 'Open', color: '#0072FF', Icon: ClipboardList },
  { key: 'progress', label: 'In Progress', color: '#A855F7', Icon: PlayCircle },
  { key: 'overdue', label: 'Overdue', color: '#FF2E9A', Icon: AlertTriangle },
  { key: 'done', label: 'Completed', color: '#0072FF', Icon: CheckCircle2 },
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
          { sort: 'due_date', limit: 3 }
        ).then((p) => (p.items || []).slice(0, 2)),
      ]);
      if (!alive) return;
      setStats({ open, progress, overdue, done });
      setUpNext(next);
    })().catch(() => { if (alive) setStats({ open: 0, progress: 0, overdue: 0, done: 0 }); });
    return () => { alive = false; };
  }, []);

  return (
    <section className="overflow-hidden rounded-xl border border-[#0072FF]/50 bg-[#162235] p-2.5 text-white">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-extrabold text-white">Task Status Summary</span>
      </div>

      {!stats ? (
        <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
            {tiles.map(({ key, label, color, Icon }) => (
              <div key={key} className="flex min-w-0 items-center gap-2 rounded-lg border border-white/15 bg-[#081018] p-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-white" style={{ backgroundColor: color }}>
                  <Icon className="h-3.5 w-3.5 text-white" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold leading-4 text-white">{stats[key]}</p>
                  <p className="text-[10px] font-bold leading-tight text-slate-300 break-words">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {upNext.length > 0 && (
            <div className="space-y-1">
              {upNext.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-[#081018] px-2.5 py-1 text-[11px] text-white">
                  <span className="truncate font-bold">{t.title}</span>
                  <span className="shrink-0 text-[10px] text-slate-300">{t.due_date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}