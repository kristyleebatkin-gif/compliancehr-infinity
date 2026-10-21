import React from 'react';
import { CheckCircle2, Clock, Pencil } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskBoardCard({ task, overdue, onOpen, onComplete }) {
  return <div className="task-board-card rounded-xl border border-border/60 bg-card p-2.5">
    <button type="button" onClick={() => onOpen(task)} className="block w-full text-left">
      <span className="flex items-start justify-between gap-2"><span className="break-words text-xs font-bold">{task.title}</span><Pencil className="mt-0.5 h-3 w-3 shrink-0 text-primary" /></span>
      <span className="mt-2 flex flex-wrap items-center gap-1 text-[10px] text-muted-foreground"><span className={['Urgent', 'High'].includes(task.priority) ? 'rounded-full bg-danger/10 px-2 py-0.5 text-danger' : 'rounded-full bg-primary/10 px-2 py-0.5'}>{task.priority}</span>{task.due_date && <span className={`flex items-center gap-1 ${overdue ? 'font-semibold text-danger' : ''}`}><Clock className="h-3 w-3" />{format(new Date(task.due_date), 'd MMM')}</span>}</span>
    </button>
    <button type="button" onClick={() => onComplete(task)} className="mt-2 flex items-center gap-1 rounded-lg border border-safe/25 bg-safe/10 px-2 py-1 text-[10px] font-semibold text-foreground hover:bg-safe/20"><CheckCircle2 className="h-3 w-3" />Mark complete</button>
  </div>;
}