import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';

export default function TaskOverviewPanel({ title, icon: Icon, tone, tasks, onOpen, emptyText }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  return <Card className="task-overview-panel min-w-0 overflow-hidden" data-task-tone={tone}><CardContent className="task-overview-content">
    <h3 className="task-panel-heading"><span className="task-panel-icon"><Icon className="h-4 w-4" /></span>{title} ({tasks.length})</h3>
    {!tasks.length ? <p className="text-xs text-muted-foreground">{emptyText}</p> : <div className="task-panel-items space-y-1 overflow-y-auto">
      {tasks.map((t) => <button key={t.id} type="button" onClick={() => onOpen(t)} className="task-overview-entry flex w-full min-w-0 items-start gap-2 rounded-lg p-2 text-left">
        {['Completed', 'Finalised'].includes(t.status) ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-safe" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />}
        <span className="min-w-0 flex-1"><span className="block break-words text-xs font-semibold">{t.title}</span><span className="mt-1 block text-[10px] text-muted-foreground">{t.status}{t.assigned_to ? ` · ${t.assigned_to}` : ''}</span></span>
        {(t.due_date || t.task_date) && <span className={`shrink-0 text-[10px] ${(t.due_date || t.task_date) < today && !['Completed', 'Finalised', 'Cancelled'].includes(t.status) ? 'font-bold text-danger' : 'text-muted-foreground'}`}>{format(new Date(t.due_date || t.task_date), 'd MMM')}</span>}
      </button>)}
    </div>}
  </CardContent></Card>;
}