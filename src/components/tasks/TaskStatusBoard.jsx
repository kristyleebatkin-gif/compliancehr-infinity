import React, { useState } from 'react';
import TaskBoardCard from '@/components/tasks/TaskBoardCard';
import { Circle, Users2, Building2, KanbanSquare, CheckCircle2 } from 'lucide-react';

const COLUMNS = ['Open', 'In Progress', 'Overdue'];
const COL_TONE = {
  Open: 'border-violet-300 bg-violet-100 text-violet-800 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300',
  'In Progress': 'border-blue-300 bg-blue-100 text-blue-800 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  Overdue: 'border-rose-300 bg-rose-100 text-rose-800 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
};
const DOT = { Open: 'bg-violet-500', 'In Progress': 'bg-blue-500', Overdue: 'bg-rose-500' };

const today = () => new Date().toISOString().slice(0, 10);

// Pending = not Completed and not Cancelled; a task is overdue when its status says so or its due date has passed.
const boardStatus = (t) => {
  if (t.status === 'Overdue') return 'Overdue';
  if (t.status === 'In Progress') return t.due_date && t.due_date < today() ? 'Overdue' : 'In Progress';
  return t.due_date && t.due_date < today() ? 'Overdue' : 'Open';
};

export default function TaskStatusBoard({ tasks, onOpen, setStatus }) {
  const [groupBy, setGroupBy] = useState('department'); // 'department' (task type) | 'worker' (assignee)

  const pending = tasks.filter((t) => !['Completed', 'Finalised', 'Pending Approval', 'Cancelled'].includes(t.status));

  const groups = [];
  if (groupBy === 'department') {
    const keys = [...new Set(pending.map((t) => t.task_type || 'General'))].sort();
    keys.forEach((k) => groups.push({ key: k, label: k, rows: pending.filter((t) => (t.task_type || 'General') === k) }));
  } else {
    const keys = [...new Set(pending.map((t) => t.assigned_to || 'Unassigned'))].sort();
    keys.forEach((k) => groups.push({ key: k, label: k, rows: pending.filter((t) => (t.assigned_to || 'Unassigned') === k) }));
  }
  groups.sort((a, b) => b.rows.length - a.rows.length);

  if (pending.length === 0) {
    return <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs"><CheckCircle2 className="h-4 w-4 text-safe" /><span className="font-semibold">Board is clear</span><span className="text-muted-foreground">No pending tasks.</span></div>;
  }

  return (
    <details open className="task-status-board shadow-sm">
      <summary>Task Status Board · {pending.length} pending</summary>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex items-center gap-2 text-sm font-bold">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <KanbanSquare className="h-4 w-4" />
          </span>
          Task Status Board
          <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-semibold text-violet-800 dark:bg-violet-950/40 dark:text-violet-300">{pending.length} pending</span>
        </div>
        <div className="flex gap-1 rounded-lg border border-border/60 bg-muted/50 p-1">
          {[
            ['department', 'By department', Building2],
            ['worker', 'By worker', Users2],
          ].map(([val, label, Icon]) => (
            <button
              key={val}
              onClick={() => setGroupBy(val)}
              className={`flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-semibold transition-colors ${groupBy === val ? 'bg-primary/10 text-primary shadow-sm' : 'text-foreground/60 hover:text-foreground'}`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        {groups.map((g) => (
          <details key={g.key} open className="task-board-group">
            <summary className="mb-1.5 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                <span className={`h-2 w-2 shrink-0 rounded-full ${groupBy === 'department' ? 'bg-fuchsia-500' : 'bg-teal-500'}`} />
                <span className="truncate">{g.label}</span>
              </div>
              <span className="shrink-0 text-xs font-semibold text-foreground/45">{g.rows.length} task{g.rows.length === 1 ? '' : 's'}</span>
            </summary>
            <div className="task-board-columns grid grid-cols-1 sm:grid-cols-3">
              {COLUMNS.map((col) => {
                const colTasks = g.rows.filter((t) => boardStatus(t) === col);
                return (
                  <div key={col} className="min-w-0">
                    <div className={`mb-1 flex items-center justify-between gap-1 rounded-md border px-1.5 py-1 text-[9px] font-bold uppercase tracking-wide ${COL_TONE[col]}`}>
                      <span className="flex items-center gap-1.5"><span className={`h-1.5 w-1.5 rounded-full ${DOT[col]}`} />{col}</span>
                      <span>{colTasks.length}</span>
                    </div>
                    <div className="task-board-items space-y-2 overflow-y-auto pr-0.5">
                      {colTasks.map((t) => (
                        <TaskBoardCard key={t.id} task={t} overdue={boardStatus(t) === 'Overdue'} onOpen={onOpen} onComplete={(task) => setStatus(task, 'Completed')} />
                      ))}
                      {colTasks.length === 0 && (
                        <div className="flex h-6 items-center justify-center rounded-md border border-dashed border-border/60 text-[10px] text-foreground/30">
                          <Circle className="h-2 w-2" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </details>
        ))}
      </div>
    </details>
  );
}