import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ListTodo, Loader2, Plus, Send } from 'lucide-react';

const statusTone = {
  Pending: 'bg-blue-100 text-blue-800',
  Open: 'bg-sky-100 text-sky-800',
  'Pending Approval': 'bg-amber-100 text-amber-800',
  'In Progress': 'bg-violet-100 text-violet-800',
};

export default function CommSharedTodo() {
  const [tasks, setTasks] = useState(null);
  const [text, setText] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const page = await base44.entities.TodoTask.filter(
        { status: { $in: ['Pending', 'Open', 'Pending Approval', 'In Progress'] } },
        { sort: '-created_date', limit: 8 }
      );
      if (alive) setTasks(page.items);
    };
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
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border-2 border-black bg-white shadow-lg">
      <div className="flex items-center gap-3 px-4 py-3" style={{ background: 'var(--header-gradient)', color: '#fff' }}>
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <ListTodo className="h-5 w-5 text-white" />
        </span>
        <div>
          <h3 className="text-base font-bold">Shared To-Do List</h3>
          <p className="text-[11px] font-semibold text-white/85">What the team needs to get done</p>
        </div>
      </div>

      {!tasks ? (
        <div className="flex items-center justify-center gap-2 py-8 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading to-dos…
        </div>
      ) : (
        <div className="space-y-2.5 p-3">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
              placeholder="Add a shared to-do…"
              className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-300"
            />
            <button
              type="button"
              onClick={add}
              disabled={adding || !text.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">All clear — nothing open on the shared list.</p>
          ) : (
            <div className="space-y-1.5">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-lg border px-2.5 py-2">
                  <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-bold ${statusTone[t.status] || 'bg-slate-100 text-slate-700'}`}>{t.status}</span>
                  <p className="min-w-0 flex-1 truncate text-xs font-semibold">{t.title}</p>
                  {t.due_date && <span className="shrink-0 text-[11px] font-semibold text-muted-foreground">{t.due_date}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}