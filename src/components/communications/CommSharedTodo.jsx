import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ListTodo, Loader2, Plus } from 'lucide-react';

const statusTone = {
  Pending: 'bg-pink-100 text-pink-800',
  Open: 'bg-rose-100 text-rose-800',
  'Pending Approval': 'bg-primary/15 text-foreground',
  'In Progress': 'bg-fuchsia-100 text-fuchsia-800',
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
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2.5 px-4 py-2.5" style={{ '--comm-bar-bg': 'linear-gradient(120deg, #ec4899 0%, #db2777 55%, #f43f5e 100%)', color: '#fff' }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <ListTodo className="h-4 w-4 text-white" />
        </span>
        <div>
          <h3 className="text-base font-bold">Shared To-Do List</h3>
          <p className="text-xs font-semibold text-white/90">What the team needs to get done</p>
        </div>
      </div>

      {!tasks ? (
        <div className="flex items-center justify-center gap-2 py-6 text-sm font-semibold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading to-dos…
        </div>
      ) : (
        <div className="space-y-2.5 p-3.5">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
              placeholder="Add a shared to-do…"
              className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-pink-300"
            />
            <button
              type="button"
              onClick={add}
              disabled={adding || !text.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-bold text-white shadow transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">All clear — nothing open on the shared list.</p>
          ) : (
            <div className="space-y-1.5">
              {tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2 rounded-xl border px-3 py-2">
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-bold ${statusTone[t.status] || 'bg-pink-100 text-pink-800'}`}>{t.status}</span>
                  <p className="min-w-0 flex-1 truncate text-xs sm:text-sm font-semibold">{t.title}</p>
                  {t.due_date && <span className="shrink-0 text-xs font-semibold text-muted-foreground">{t.due_date}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}