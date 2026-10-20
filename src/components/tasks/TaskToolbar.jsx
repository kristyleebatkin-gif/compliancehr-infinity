import React from 'react';
import { CalendarDays, Download, ListTodo, Plus, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaskToolbar({ view, onView, onExport, onRun, onNew, loading, empty, running }) {
  return <div className="flex flex-wrap items-center gap-1">
    {[['list', 'List', ListTodo], ['calendar', 'Calendar', CalendarDays]].map(([value, label, Icon]) => <Button key={value} type="button" size="sm" variant="outline" aria-pressed={view === value} aria-controls="task-register-view" onClick={() => onView(value)} className={view === value ? 'h-7 gap-1 border-primary/40 bg-primary/10 px-2 text-[11px] text-primary' : 'h-7 gap-1 px-2 text-[11px]'}><Icon className="h-3 w-3" />{label}</Button>)}
    <Button size="sm" variant="outline" onClick={onExport} disabled={loading || empty} className="h-7 gap-1 px-2 text-[11px]"><Download className="h-3 w-3" />Export CSV</Button>
    <Button size="sm" variant="outline" onClick={onRun} disabled={running} className="h-7 gap-1 px-2 text-[11px]"><Zap className="h-3 w-3" />{running ? 'Running...' : 'Run Automations'}</Button>
    <Button size="sm" variant="outline" onClick={onNew} className="h-7 gap-1 border-primary/30 bg-primary/10 px-2 text-[11px] text-primary"><Plus className="h-3 w-3" />New Task</Button>
  </div>;
}