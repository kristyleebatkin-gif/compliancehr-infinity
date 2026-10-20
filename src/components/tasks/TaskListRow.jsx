import React from 'react';
import { Bell, CheckCircle2, Circle, Clock, Mail, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Open', 'In Progress', 'Completed', 'Overdue', 'Cancelled'];
export default function TaskListRow({ task: t, checked, focused, onSelect, onToggle, onStatus, onSend, onAlert, onEdit, onDelete }) {
  return <div className={`task-register-row flex flex-wrap items-center gap-1.5 rounded-lg border px-2 py-1 transition-colors ${checked ? 'border-primary bg-primary/5' : 'border-border/60 bg-card'} ${focused ? 'ring-2 ring-primary/60' : ''}`}>
    <input type="checkbox" checked={checked} onChange={onSelect} aria-label={`Select ${t.title}`} className="h-4 w-4 shrink-0 accent-primary" />
    <button onClick={onToggle} aria-label={t.status === 'Completed' ? 'Reopen task' : 'Complete task'} className="shrink-0">{t.status === 'Completed' ? <CheckCircle2 className="h-5 w-5 text-safe" /> : <Circle className="h-5 w-5 text-foreground/30" />}</button>
    <div className="min-w-0 flex-1">
      <p className={t.status === 'Completed' ? 'text-sm font-medium line-through text-muted-foreground' : 'text-sm font-medium'}>{t.title}</p>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span className={t.priority === 'Urgent' || t.priority === 'High' ? 'rounded-full bg-danger/10 px-2 py-0.5 font-medium text-danger' : 'rounded-full bg-muted px-2 py-0.5 font-medium'}>{t.priority}</span>
        <span>{t.task_type}</span>{t.assigned_to && <span>• {t.assigned_to}</span>}
        {t.due_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(t.due_date), 'EEE d MMM yyyy')}</span>}
        {t.completed_date && t.status === 'Completed' && <span>• completed {format(new Date(t.completed_date), 'd MMM yyyy')}</span>}
      </div>
    </div>
    <select aria-label={`Status for ${t.title}`} value={t.status} onChange={(event) => onStatus(event.target.value)} className="h-8 shrink-0 rounded-full border border-border/60 bg-card px-2 text-xs font-medium">{STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select>
    <div className="flex gap-1">
      <button onClick={onSend} title="Send / alert assignee" className="rounded p-1.5 hover:bg-primary/10"><Mail className="h-4 w-4 text-muted-foreground" /></button>
      <button onClick={onAlert} title="Send in-app alert" className="rounded p-1.5 hover:bg-primary/10"><Bell className="h-4 w-4 text-muted-foreground" /></button>
      <button onClick={onEdit} aria-label="Edit task" className="rounded p-1.5 hover:bg-primary/10"><Pencil className="h-4 w-4 text-muted-foreground" /></button>
      <button onClick={onDelete} aria-label="Delete task" className="rounded p-1.5 hover:bg-danger/10"><Trash2 className="h-4 w-4 text-danger" /></button>
    </div>
  </div>;
}