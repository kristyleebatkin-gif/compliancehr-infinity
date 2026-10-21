import React from 'react';
import { CalendarDays, Download, ListTodo, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function TaskToolbar({ view, onView, onExport, onRun, onNew, loading, empty, running, navigationOnly = false }) {
  if (navigationOnly) return <Button asChild size="sm" variant="outline" className="bright-pink-action h-7 gap-1 px-2 text-[11px]"><Link to="/shared-to-do"><ListTodo className="h-3 w-3" />Shared To-do Dashboard</Link></Button>;
  return <div className="task-action-toolbar flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-card p-2">
    <Button size="sm" variant="outline" onClick={onRun} disabled={running} className="h-8 gap-1 border-warning/40 bg-warning/20 px-3 text-xs text-foreground hover:bg-warning/30"><Zap className="h-3 w-3" />{running ? 'Running...' : 'Run Automations'}</Button>
    <Button size="sm" variant="outline" onClick={onExport} disabled={loading || empty} className="h-8 gap-1 border-safe/40 bg-safe/15 px-3 text-xs text-foreground hover:bg-safe/25"><Download className="h-3 w-3" />Export CSV</Button>
    <div className="ml-auto flex flex-wrap items-center gap-1">
      <Button type="button" size="sm" variant="outline" aria-pressed={view === 'list'} aria-controls="task-register-view" onClick={() => onView('list')} className={view === 'list' ? 'h-8 gap-1 border-primary/50 bg-primary/25 px-3 text-xs text-foreground' : 'h-8 gap-1 border-primary/25 bg-primary/10 px-3 text-xs text-foreground'}><ListTodo className="h-3 w-3" />List</Button>
      <Button size="sm" variant="outline" onClick={onNew} className="bright-pink-action h-8 gap-1 px-3 text-xs"><Plus className="h-3 w-3" />New Task</Button>
      <Button type="button" size="sm" variant="outline" aria-pressed={view === 'calendar'} aria-controls="task-register-view" onClick={() => onView('calendar')} className={view === 'calendar' ? 'h-8 gap-1 border-teal/50 bg-teal/25 px-3 text-xs text-foreground' : 'h-8 gap-1 border-teal/25 bg-teal/10 px-3 text-xs text-foreground'}><CalendarDays className="h-3 w-3" />Calendar</Button>
    </div>
  </div>;
}