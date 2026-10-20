import React from 'react';
import { ListTodo } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import TaskListRow from '@/components/tasks/TaskListRow';

export default function TaskList({ tasks, loading, filter, onFilter, selected, focusIdx, allChecked, onSelectAll, onSelect, onToggle, onStatus, onSend, onAlert, onEdit, onDelete }) {
  return <div className="task-register-list space-y-1.5">
    <div className="module-filter-bar flex flex-wrap items-center gap-1">
      {['All', 'My tasks', 'Pending', 'Open', 'In Progress', 'Completed', 'Overdue'].map((status) => <button key={status} onClick={() => onFilter(status)} className={filter === status ? 'whitespace-nowrap rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary' : 'whitespace-nowrap rounded-md border border-border bg-card px-2 py-1 text-[11px] text-muted-foreground hover:bg-muted'}>{status}</button>)}
      <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-1.5 px-1 text-[11px] text-muted-foreground"><input type="checkbox" checked={allChecked} onChange={onSelectAll} className="h-3.5 w-3.5" />Select all</label>
    </div>
    <p className="hidden text-[10px] text-muted-foreground md:block">N new · J/K navigate · Enter open</p>
    {loading ? <p role="status" className="py-6 text-center text-sm text-muted-foreground">Loading tasks...</p> : tasks.length === 0 ? <EmptyState icon={ListTodo} title="No tasks" message="Create tasks to track compliance actions." /> : <div className="task-register-rows max-h-72 space-y-1 overflow-y-auto overscroll-contain pr-1">{tasks.map((task, index) => <TaskListRow key={task.id} task={task} checked={selected.includes(task.id)} focused={focusIdx === index} onSelect={() => onSelect(task.id)} onToggle={() => onToggle(task)} onStatus={(status) => onStatus(task, status)} onSend={() => onSend(task)} onAlert={() => onAlert(task)} onEdit={() => onEdit(task)} onDelete={() => onDelete(task)} />)}</div>}
  </div>;
}