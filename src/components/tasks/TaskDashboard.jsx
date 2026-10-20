import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CalendarClock, CheckCircle2, Circle, Clock, ListTodo, Timer, Bot, Sparkles, TrendingUp, Users } from 'lucide-react';
import { format } from 'date-fns';

const today = () => format(new Date(), 'yyyy-MM-dd');

function Tile({ icon: Icon, label, value, tone, hint }) {
  return (
    <div className={`rounded-xl bg-gradient-to-br ${tone} p-3.5 text-white shadow-lg`}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 opacity-90" />
        <p className="text-[10px] font-bold uppercase tracking-wide opacity-85">{label}</p>
      </div>
      <p className="mt-1.5 text-2xl font-extrabold leading-none">{value}</p>
      {hint && <p className="mt-1 text-[10px] font-medium opacity-80">{hint}</p>}
    </div>
  );
}

function Panel({ title, icon: Icon, tone, tasks, onOpen, emptyText }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/60">
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${tone} text-white shadow`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
          {title} ({tasks.length})
        </p>
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
            {tasks.slice(0, 8).map((t) => (
              <button key={t.id} onClick={() => onOpen(t)} className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted/60">
                {t.status === 'Completed' ? <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" /> : <Circle className="h-4 w-4 shrink-0 text-foreground/30" />}
                <span className="min-w-0 flex-1 truncate">{t.title}</span>
                {t.due_date && <span className={`shrink-0 text-xs ${t.due_date < today() && t.status !== 'Completed' ? 'font-semibold text-danger' : 'text-foreground/50'}`}>{format(new Date(t.due_date), 'd MMM')}</span>}
                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground/60">{t.status}</span>
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
  if (!rows.length) return null;
  return (
    <Card><CardContent className="p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/60"><Users className="h-3.5 w-3.5" />Who is carrying what (live)</p>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className="w-28 shrink-0 truncate text-xs font-semibold sm:w-36">{r.name}</span>
            <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-muted">
              {r.overdue > 0 && <div className="shrink-0 bg-gradient-to-r from-rose-500 to-red-500" style={{ width: `${(r.overdue / max) * 100}%` }} />}
              <div className="min-w-1 flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-400" style={{ maxWidth: `${((r.open - r.overdue) / max) * 100}%` }} />
            </div>
            <span className="w-24 shrink-0 text-right text-[10px] font-semibold text-foreground/60 sm:w-32">{r.open} open{r.overdue ? ` · ${r.overdue} overdue` : ''}</span>
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
    <Card><CardContent className="p-4">
      <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/60"><Timer className="h-3.5 w-3.5" />Completion insights</p>
      <div className="grid grid-cols-3 gap-2 text-center">
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

function AssistantCard() {
  return (
    <Card className="overflow-hidden"><CardContent className="p-0">
      <div className="bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 p-4 text-white">
        <p className="flex items-center gap-2 text-sm font-bold"><Bot className="h-4 w-4" />AI assistants - your task helpers</p>
        <p className="mt-1 text-xs opacity-90">Open the AI Assistant from the sidebar and it will work alongside you on any task.</p>
      </div>
      <div className="p-4">
        <ul className="grid gap-1.5 text-xs sm:grid-cols-2">
          {[
            'Break a big task into clear steps and a plan',
            'Draft professional notes, updates and sign-offs',
            'Write polite reminders and follow-up messages',
            'Summarise overdue work for your manager',
            'Explain the policy or checklist behind a task',
            'Proofread and lift the quality of your writing',
          ].map((x) => <li key={x} className="flex items-start gap-1.5"><Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />{x}</li>)}
        </ul>
        <Link to="/assistant" className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-xs font-semibold text-white hover:bg-brand/90">Open AI Assistant</Link>
      </div>
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
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Tile icon={ListTodo} label="Open" value={tasks.filter((t) => t.status === 'Open').length} tone="from-violet-500 to-purple-400" />
        <Tile icon={Clock} label="In progress" value={tasks.filter((t) => t.status === 'In Progress').length} tone="from-sky-500 to-cyan-400" />
        <Tile icon={CalendarClock} label="Due today" value={dueToday.length} tone="from-amber-500 to-orange-400" />
        <Tile icon={AlertTriangle} label="Overdue" value={overdue.length} tone="from-rose-500 to-red-400" hint={overdue.length ? 'Needs attention now' : 'All on track'} />
        <Tile icon={CheckCircle2} label="Completed" value={completedCount} tone="from-emerald-500 to-teal-400" />
        <Tile icon={TrendingUp} label="Avg finish" value={avgMin ? `${avgMin}m` : '-'} tone="from-fuchsia-500 to-pink-400" hint="Across timed tasks" />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Current" icon={Clock} tone="from-violet-500 to-purple-400" tasks={current} onOpen={onOpen} emptyText="No current tasks." />
        <Panel title="Future" icon={CalendarClock} tone="from-sky-500 to-cyan-400" tasks={future} onOpen={onOpen} emptyText="No future tasks scheduled." />
        <Panel title="Past" icon={CheckCircle2} tone="from-emerald-500 to-teal-400" tasks={past} onOpen={onOpen} emptyText="No past tasks." />
      </div>
      <StaffStrip tasks={tasks} />
      <div className="grid gap-4 md:grid-cols-2">
        <TimeCard tasks={tasks} avgMin={avgMin} />
        <AssistantCard />
      </div>
    </div>
  );
}