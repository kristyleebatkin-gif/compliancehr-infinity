import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CalendarClock, CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react';
import { format } from 'date-fns';

const today = () => format(new Date(), 'yyyy-MM-dd');

function Tile({ icon: Icon, label, value, tone }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
      <Icon className="h-5 w-5 shrink-0 opacity-80" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70">{label}</p>
        <p className="text-lg font-bold leading-none">{value}</p>
      </div>
    </div>
  );
}

function Panel({ title, icon: Icon, tasks, onOpen, emptyText }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/60"><Icon className="h-3.5 w-3.5" />{title} ({tasks.length})</p>
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground">{emptyText}</p>
        ) : (
          <div className="space-y-1.5">
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

export default function TaskDashboard({ tasks, onOpen }) {
  const todayStr = today();
  const open = tasks.filter((t) => ['Open', 'In Progress', 'Overdue'].includes(t.status));
  const overdue = open.filter((t) => t.due_date && t.due_date < todayStr);
  const dueToday = open.filter((t) => t.due_date === todayStr);
  const current = [...overdue, ...dueToday, ...open.filter((t) => !t.due_date || (t.due_date > todayStr && t.due_date !== todayStr))].filter((t, i, arr) => arr.indexOf(t) === i);
  const future = open.filter((t) => t.due_date > todayStr);
  const past = tasks.filter((t) => ['Completed', 'Cancelled'].includes(t.status) || (t.due_date && t.due_date < todayStr));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
        {[['Open', tasks.filter((t) => t.status === 'Open').length, ListTodo], ['In progress', tasks.filter((t) => t.status === 'In Progress').length, Clock], ['Due today', dueToday.length, CalendarClock], ['Overdue', overdue.length, AlertTriangle], ['Completed', tasks.filter((t) => t.status === 'Completed').length, CheckCircle2]].map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl border border-border/60 bg-card p-3">
            <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-foreground/50" /><p className="text-xs font-medium text-foreground/60">{label}</p></div>
            <p className="mt-1 text-xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Panel title="Current" icon={Clock} tasks={current} onOpen={onOpen} emptyText="No current tasks." />
        <Panel title="Future" icon={CalendarClock} tasks={future} onOpen={onOpen} emptyText="No future tasks scheduled." />
        <Panel title="Past" icon={CheckCircle2} tasks={past} onOpen={onOpen} emptyText="No past tasks." />
      </div>
    </div>
  );
}