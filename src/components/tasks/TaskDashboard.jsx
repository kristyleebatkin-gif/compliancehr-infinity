import React from 'react';
import TaskAssistantCard from '@/components/tasks/TaskAssistantCard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CalendarClock, CheckCircle2, Circle, Clock, ListTodo, Timer, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

const today = () => format(new Date(), 'yyyy-MM-dd');

function Panel({ title, icon: Icon, tone, tasks, onOpen, emptyText }) {
  return (
    <Card className="min-w-0 h-28 overflow-y-auto">
      <CardContent className="p-2.5">
        <p className="mb-1.5 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/60">
          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-gradient-to-br ${tone} text-white shadow-sm`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title} ({tasks.length})
        </p>
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="max-h-28 space-y-1 overflow-y-auto pr-1">
            {tasks.slice(0, 8).map((t) => (
              <button key={t.id} onClick={() => onOpen(t)} className="flex w-full min-w-0 items-center gap-1 rounded-lg px-1 py-1 text-left text-[11px] hover:bg-muted/60">
                {t.status === 'Completed' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" /> : <Circle className="h-4 w-4 shrink-0 text-foreground/30" />}
                <span className="min-w-0 flex-1 truncate">{t.title}</span>
                {t.due_date && <span className={`shrink-0 text-xs ${t.due_date < today() && t.status !== 'Completed' ? 'font-semibold text-danger' : 'text-foreground/50'}`}>{format(new Date(t.due_date), 'd MMM')}</span>}
                <span className="hidden shrink-0 rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-foreground/60 xl:inline">{t.status}</span>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function StaffStrip({ tasks }) {
  const todayStr = today();
  const pending = tasks.filter((t) => !['Completed', 'Cancelled'].includes(t.status));
  const byPerson = new Map();
  for (const t of pending) {
    const name = t.assigned_to || 'Unallocated';
    const row = byPerson.get(name) || { name, open: 0, overdue: 0 };
    row.open += 1;
    if (t.due_date && t.due_date < todayStr) row.overdue += 1;
    byPerson.set(name, row);
  }
  const rows = [...byPerson.values()]
    .sort((a, b) => (b.overdue * 3 + b.open) - (a.overdue * 3 + a.open))
    .slice(0, 6);
  const max = Math.max(1, ...rows.map((r) => r.open));
  return (
    <Card className="min-w-0 h-28 overflow-y-auto"><CardContent className="p-2.5">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/60"><Users className="h-3.5 w-3.5" />Who is carrying what (live)</p>
      {!rows.length && <p className="text-xs text-muted-foreground">No pending workload.</p>}
      <div className="grid max-h-28 grid-cols-1 gap-x-4 gap-y-1.5 overflow-y-auto sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.name} className="grid grid-cols-2 items-center gap-1">
            <span className="min-w-0 truncate text-xs font-semibold" title={r.name}>{r.name}</span>
            <div className="col-span-2 row-start-2 flex h-1.5 overflow-hidden rounded-full bg-muted">
              {r.overdue > 0 && <div className="shrink-0 bg-gradient-to-r from-rose-500 to-red-500" style={{ width: `${(r.overdue / max) * 100}%` }} />}
              <div className="min-w-1 flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ maxWidth: `${((r.open - r.overdue) / max) * 100}%` }} />
            </div>
            <span className="col-start-2 row-start-1 text-right text-[10px] font-semibold text-foreground/60">{r.open} open{r.overdue ? ` · ${r.overdue} overdue` : ''}</span>
          </div>
        ))}
      </div>
    </CardContent></Card>
  );
}

function TimeCard({ tasks, avgMin }) {
  const completed = tasks.filter((t) => ['Completed', 'Finalised'].includes(t.status)).length;
  const timed = tasks.filter((t) => ['Completed', 'Finalised'].includes(t.status) && Number(t.time_taken_minutes) > 0);
  const totalMin = timed.reduce((s, t) => s + Number(t.time_taken_minutes), 0);
  const fastest = [...timed].sort((a, b) => a.time_taken_minutes - b.time_taken_minutes)[0];
  return (
    <Card className="min-w-0 h-28 overflow-y-auto"><CardContent className="p-2.5">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/60"><Timer className="h-3.5 w-3.5" />Completion insights</p>
      <div className="grid grid-cols-1 gap-1 text-center [&>div]:flex [&>div]:items-center [&>div]:justify-between [&>div]:gap-1 [&>div]:px-1 [&>div]:py-0.5 [&>div>p]:text-[9px]">
        <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-950/40">
          <p className="text-lg font-extrabold text-emerald-700 dark:text-emerald-300">{completed}</p>
          <p className="text-[10px] font-semibold uppercase text-emerald-700/70 dark:text-emerald-300/70">Done</p>
        </div>
        <div className="rounded-lg bg-sky-100 p-2 dark:bg-sky-950/40">
          <p className="text-lg font-extrabold text-sky-700 dark:text-sky-300">{avgMin ? `${avgMin} min` : '-'}</p>
          <p className="text-[10px] font-semibold uppercase text-sky-700/70 dark:text-sky-300/70">Avg time</p>
        </div>
        <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-950/40">
          <p className="text-lg font-extrabold text-amber-700 dark:text-amber-300">{totalMin ? `${Math.round(totalMin / 60)} h` : '-'}</p>
          <p className="text-[10px] font-semibold uppercase text-amber-700/70 dark:text-amber-300/70">Total time</p>
        </div>
      </div>
      {fastest && <p className="mt-2 text-xs text-muted-foreground">Fastest task: &ldquo;{fastest.title}&rdquo; ({fastest.time_taken_minutes} min)</p>}
    </CardContent></Card>
  );
}

export default function TaskDashboard({ tasks, onOpen }) {
  const todayStr = today();
  const open = tasks.filter((t) => ['Open', 'In Progress', 'Overdue'].includes(t.status));
  const overdue = open.filter((t) => t.due_date && t.due_date < todayStr);
  const dueToday = open.filter((t) => t.due_date === todayStr);
  const current = [...overdue, ...dueToday, ...open.filter((t) => !t.due_date || (t.due_date > todayStr && t.due_date !== todayStr))].filter((t, i, arr) => arr.indexOf(t) === i);
  const future = open.filter((t) => t.due_date > todayStr);
  const past = tasks.filter((t) => ['Completed', 'Cancelled'].includes(t.status) || (t.due_date && t.due_date < todayStr));
  const completedCount = tasks.filter((t) => ['Completed', 'Finalised'].includes(t.status)).length;
  const timed = tasks.filter((t) => ['Completed', 'Finalised'].includes(t.status) && Number(t.time_taken_minutes) > 0);
  const avgMin = timed.length ? Math.round(timed.reduce((s, t) => s + Number(t.time_taken_minutes), 0) / timed.length) : 0;

  return (
    <div className="space-y-3">
      <TaskAssistantCard compact inline />
      <div className="grid items-start gap-1.5 grid-cols-2 sm:grid-cols-4">
        <Panel title="Current" icon={Clock} tone="from-violet-500 to-purple-400" tasks={current} onOpen={onOpen} emptyText="No current tasks." />
        <Panel title="Future" icon={CalendarClock} tone="from-sky-500 to-cyan-400" tasks={future} onOpen={onOpen} emptyText="No future tasks scheduled." />
        <Panel title="Past" icon={CheckCircle2} tone="from-emerald-500 to-teal-400" tasks={past} onOpen={onOpen} emptyText="No past tasks." />
        <TimeCard tasks={tasks} avgMin={avgMin} />
      </div>
      <StaffStrip tasks={tasks} />

    </div>
  );
}