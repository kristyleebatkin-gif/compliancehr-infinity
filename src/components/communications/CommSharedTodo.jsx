import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { ListTodo, Loader2, Plus } from 'lucide-react';
import SharedTodoInfoPanel from '@/components/communications/SharedTodoInfoPanel';

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

  const load = async () => {
    const page = await base44.entities.TodoTask.filter(
      { status: { $in: ['Pending', 'Open', 'Pending Approval', 'In Progress'] } },
      { sort: '-created_date', limit: 12 }
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
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
      <div className="comm-panel-bar relative flex items-center gap-2.5 px-4 py-2.5" style={{ '--comm-bar-bg': 'linear-gradient(120deg, #ec4899 0%, #db2777 55%, #f43f5e 100%)', color: '#fff' }}>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/30">
          <ListTodo className="h-4 w-4 text-white" />
        </span>
        <div>
          <h3 className="text-base font-extrabold">Shared To-Do List</h3>
          <p className="text-xs font-bold text-white/90">What the team needs to get done</p>
        </div>
      </div>

      {!tasks ? (
        <div className="flex items-center justify-center gap-2 py-5 text-sm font-bold text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading to-dos…
        </div>
      ) : (
        <div className="space-y-2.5 p-3.5">
          <div className="flex items-center gap-2">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
              placeholder="Quick add a shared to-do…"
              className="min-w-0 flex-1 rounded-xl border px-3 py-2 text-sm font-semibold outline-none focus:ring-2 focus:ring-pink-300"
            />
            <button
              type="button"
              onClick={add}
              disabled={adding || !text.trim()}
              className="flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-extrabold text-white shadow transition hover:opacity-90 disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #ec4899, #db2777)' }}
            >
              {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add
            </button>
          </div>

          {tasks.length === 0 ? (
            <p className="py-3 text-center text-sm font-semibold text-muted-foreground">All clear — nothing open on the shared list.</p>
          ) : (
            <div className="space-y-1.5">
              {tasks.map((t) => (
                <div key={t.id} className="rounded-xl border bg-white px-3 py-2 shadow-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-extrabold ${statusTone[t.status] || 'bg-pink-100 text-pink-800'}`}>{t.status}</span>
                    {t.module && <span className="rounded-md bg-pink-50 px-2 py-0.5 text-[11px] font-bold text-pink-700">{t.module}</span>}
                    <p className="min-w-0 flex-1 truncate text-xs sm:text-sm font-extrabold">{t.title}</p>
                    {t.due_date && <span className="shrink-0 text-xs font-bold text-rose-700">Due {t.due_date}</span>}
                  </div>
                  {(t.how_to_complete || t.resources_needed || t.important_info || (t.responsible && t.responsible.length > 0)) && (
                    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold text-foreground/75">
                      {t.responsible?.length > 0 && <span><strong>Responsible:</strong> {t.responsible.join(', ')}</span>}
                      {t.how_to_complete && <span><strong>How:</strong> {t.how_to_complete}</span>}
                      {t.resources_needed && <span><strong>Resources:</strong> {t.resources_needed}</span>}
                      {t.important_info && <span><strong>Info:</strong> {t.important_info}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <SharedTodoInfoPanel tasks={tasks} onCreated={load} />
        </div>
      )}
    </section>
  );
}