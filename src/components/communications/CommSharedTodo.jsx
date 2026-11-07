import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ListTodo, Loader2, Plus } from 'lucide-react';

export default function CommSharedTodo() {
  const [tasks, setTasks] = useState(null);
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);

  const load = async () => {
    const page = await base44.entities.TodoTask.filter(
      { status: { $in: ['Pending', 'Open', 'Pending Approval', 'In Progress'] } },
      { sort: '-created_date', limit: 6 }
    );
    setTasks(page.items || []);
  };

  useEffect(() => {
    let alive = true;
    load().catch(() => { if (alive) setTasks([]); });
    const unsubscribe = base44.entities.TodoTask.subscribe(() => { load().catch(() => {}); });
    return () => { alive = false; unsubscribe(); };
  }, []);

  const add = async () => {
    const title = text.trim();
    if (!title) return;
    setAdding(true);
    try {
      await base44.entities.TodoTask.create({
        title,
        status: 'Pending',
        priority: 'Medium',
        task_date: new Date().toISOString().slice(0, 10),
      });
      setText('');
      await load();
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-xl border border-[#FF2E9A]/50 bg-[#162235] p-2.5 text-white">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-white">
          <ListTodo className="h-3.5 w-3.5 text-[#FF2E9A]" />
          Quick Shared To-Do List
        </span>
      </div>

      {!tasks ? (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-slate-300">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading to-dos…
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
              placeholder="Quick add a shared to-do…"
              className="h-7 min-w-0 flex-1 rounded-lg border border-white/20 bg-[#081018] px-2.5 text-xs font-semibold text-white placeholder:text-slate-400 outline-none"
            />
            <button
              type="button"
              onClick={add}
              disabled={adding || !text.trim()}
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-lg bg-[#FF2E9A] px-2.5 text-xs font-extrabold text-white disabled:opacity-50"
            >
              {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="py-1.5 text-xs text-slate-300">All clear — nothing open on the shared list.</p>
          ) : (
            <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/15 bg-[#081018] px-2.5 py-1 text-xs text-white">
                  <span className="truncate font-bold text-white">{t.title}</span>
                  <span className="shrink-0 rounded bg-[#A855F7]/30 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {t.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}