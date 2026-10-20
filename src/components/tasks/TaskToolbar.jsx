import React from 'react';
import { CalendarDays, Download, ListTodo, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function TaskToolbar({ view, onView, onExport, onRun, onNew, loading, empty, running, navigationOnly = false }) {
  if (navigationOnly) return <Button asChild size="sm" variant="outline" className="h-7 gap-1 border-primary/40 bg-primary/15 px-2 text-[11px] text-foreground"><Link to="/shared-to-do"><ListTodo className="h-3 w-3" />Shared To-do Dashboard</Link></Button>;
  return <div className="flex flex-wrap items-center gap-1">
    <Button size="sm" variant="outline" onClick={onRun} disabled={running} className="h-7 gap-1 px-2 text-[11px]"><Zap className="h-3 w-3" />{running ? 'Running...' : 'Run Automations'}</Button>
    <Button size="sm" variant="outline" onClick={onExport} disabled={loading || empty} className="h-7 gap-1 px-2 text-[11px]"><Download className="h-3 w-3" />Export CSV</Button>
    <div className="ml-auto flex flex-wrap items-center gap-1">
      <Button type="button" size="sm" variant="outline" aria-pressed={view === 'list'} aria-controls="task-register-view" onClick={() => onView('list')} className={view === 'list' ? 'h-7 gap-1 border-primary/40 bg-primary/10 px-2 text-[11px] text-primary' : 'h-7 gap-1 px-2 text-[11px]'}><ListTodo className="h-3 w-3" />List</Button>
      <Button size="sm" variant="outline" onClick={onNew} className="h-7 gap-1 border-primary/30 bg-primary/10 px-2 text-[11px] text-primary"><Plus className="h-3 w-3" />New Task</Button>
      <Button type="button" size="sm" variant="outline" aria-pressed={view === 'calendar'} aria-controls="task-register-view" onClick={() => onView('calendar')} className={view === 'calendar' ? 'h-7 gap-1 border-primary/40 bg-primary/10 px-2 text-[11px] text-primary' : 'h-7 gap-1 px-2 text-[11px]'}><CalendarDays className="h-3 w-3" />Calendar</Button>
    </div>
  </div>;
}