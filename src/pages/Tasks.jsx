import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import { Field, TextInput, Select, TextArea, DateInput } from '@/components/Field';
import EmptyState from '@/components/EmptyState';
import TaskDashboard from '@/components/tasks/TaskDashboard';
import TaskCompletionReports from '@/components/tasks/TaskCompletionReports';
import TaskToolbar from '@/components/tasks/TaskToolbar';
import TaskSummaryCards from '@/components/tasks/TaskSummaryCards';
import TaskList from '@/components/tasks/TaskList';
import TaskProgressChart from '@/components/tasks/TaskProgressChart';
import TaskStatusBoard from '@/components/tasks/TaskStatusBoard';
import TaskCalendar from '@/components/tasks/TaskCalendar';
import TaskSendDialog from '@/components/tasks/TaskSendDialog';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
import '@/components/tasks/taskDashboardLayout.css';
import { ListTodo, Plus, Pencil, Trash2, CheckCircle2, Circle, Clock, Zap, Mail, Bell, Download, Archive, X } from 'lucide-react';
import { downloadCsv, fetchAllRecords } from '@/lib/csvExport';
import { format } from 'date-fns';

const TYPES = ['Review Reminder', 'Training Renewal', 'Policy Review', 'Incident Action', 'Audit Action', 'General'];
const STATUSES = ['Open', 'In Progress', 'Completed', 'Overdue', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const blank = { title: '', task_type: 'General', assigned_to: '', assigned_email: '', due_date: '', status: 'Open', priority: 'Medium', estimated_hours: '', completed_date: '', notes: '', linked_entity_type: '', linked_entity_id: '' };

export default function Tasks() {
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [taskTotals, setTaskTotals] = useState([]);
  const [taskMetrics, setTaskMetrics] = useState({ dueToday: 0, overdue: 0, averageMinutes: 0 });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [emailAssignee, setEmailAssignee] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [running, setRunning] = useState(false);
  const [sending, setSending] = useState(null);
  const [focusIdx, setFocusIdx] = useState(-1);
  const [view, setView] = useState('list');
  const [meEmail, setMeEmail] = useState('');

  // Management roles see the full register; everyone else sees only their own tasks.
  const MANAGEMENT_ROLES = ['admin', 'Provider Administrator', 'Administration', 'Compliance Manager', 'Team Leader', 'Finance & Accounts Officer', 'Human Resources Manager', 'Rostering Coordinator', 'Quality & Improvement Manager', 'CRM & Marketing Officer', 'Intake Officer'];

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const me = await base44.auth.me();
      const seesAll = MANAGEMENT_ROLES.includes(me?.role);
      setMeEmail(me?.email || '');
      const taskQuery = seesAll ? { archived: { $ne: true } } : { archived: { $ne: true }, assigned_email: me?.email };
      const today = format(new Date(), 'yyyy-MM-dd');
      const activeStatuses = { $in: ['Open', 'In Progress', 'Overdue'] };
      const [page, userPage, totals, dueToday, overdue, timing] = await Promise.all([
        base44.entities.TodoTask.filter(taskQuery, { sort: '-due_date', limit: 500 }),
        base44.entities.User.list(),
        base44.entities.TodoTask.aggregate({ query: taskQuery, groupBy: 'status' }),
        base44.entities.TodoTask.count({ ...taskQuery, status: activeStatuses, due_date: today }),
        base44.entities.TodoTask.count({ ...taskQuery, status: activeStatuses, due_date: { $lt: today } }),
        base44.entities.TodoTask.aggregate({ query: { ...taskQuery, status: { $in: ['Completed', 'Finalised'] }, time_taken_minutes: { $gt: 0 } }, groupBy: 'status', avg: ['time_taken_minutes'] }),
      ]);
      const timedCount = (timing.rows || []).reduce((sum, row) => sum + row.count, 0);
      const timedMinutes = (timing.rows || []).reduce((sum, row) => sum + (row.avg_time_taken_minutes || 0) * row.count, 0);
      setTaskMetrics({ dueToday, overdue, averageMinutes: timedCount ? Math.round(timedMinutes / timedCount) : 0 });
      setTaskTotals(totals.rows || []);
      setList(page.items || []);
      setUsers(userPage || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const assignUser = (name) => {
    const user = users.find((u) => u.full_name === name);
    setForm((f) => ({ ...f, assigned_to: name, assigned_email: user?.email || f.assigned_email }));
    if (user?.email) setEmailAssignee(true);
  };

  const openNew = () => { setEditing('new'); setForm({ ...blank, due_date: new Date().toISOString().slice(0, 10) }); setEmailAssignee(false); };
  const openEdit = (t) => { setEditing(t.id); setForm({ ...blank, ...t }); setEmailAssignee(false); };

  const alertAssignee = async (task) => {
    if (!task.assigned_to) return;
    try {
      await base44.entities.Notification.create({
        type: 'Task Allocation',
        recipient: task.assigned_to,
        message: `Task allocated: ${task.title}${task.due_date ? ` (due ${format(new Date(task.due_date), 'd MMM yyyy')})` : ''}`,
        read: false,
        linked_entity_type: 'Task',
        linked_entity_id: task.id,
      });
    } catch { /* alert is best-effort */ }
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    const payload = {
      ...form,
      estimated_hours: form.estimated_hours === '' ? undefined : Number(form.estimated_hours),
      completed_date: form.status === 'Completed' ? (form.completed_date || new Date().toISOString().slice(0, 10)) : form.completed_date,
    };
    const previous = editing === 'new' ? null : list.find((t) => t.id === editing);
    if (editing === 'new') await base44.entities.TodoTask.create(payload);
    else await base44.entities.TodoTask.update(editing, payload);
    if (payload.assigned_to && (!previous || previous.assigned_to !== payload.assigned_to)) await alertAssignee(payload);
    if (payload.assigned_to && emailAssignee && payload.assigned_email && (!previous || previous.assigned_to !== payload.assigned_to)) {
      try {
        await base44.functions.invoke('sendAppEmail', {
          to: payload.assigned_email,
          subject: `Task allocated: ${payload.title}${payload.due_date ? ` (due ${format(new Date(payload.due_date), 'd MMM yyyy')})` : ''}`,
          body: `You have been allocated the task "${payload.title}"${payload.due_date ? `, due ${format(new Date(payload.due_date), 'EEEE d MMMM yyyy')}` : ''}. Priority: ${payload.priority}.${payload.notes ? `\n\nDetails: ${payload.notes}` : ''}\n\nPlease open the Tasks module to keep it up to date.`,
        });
      } catch { /* email is best-effort here */ }
    }
    toast({ title: 'Task saved' });
    setEditing(null);
    load();
  };

  const toggle = async (t) => {
    const completed = t.status !== 'Completed';
    await base44.entities.TodoTask.update(t.id, {
      status: completed ? 'Completed' : 'Open',
      completed_date: completed ? new Date().toISOString().slice(0, 10) : undefined,
    });
    load();
  };

  const setStatus = async (t, status) => {
    await base44.entities.TodoTask.update(t.id, {
      status,
      completed_date: status === 'Completed' ? new Date().toISOString().slice(0, 10) : undefined,
    });
    load();
  };

  const remove = async (t) => { if (confirm('Delete this task?')) { await base44.entities.TodoTask.delete(t.id); load(); } };

  const exportTasks = async () => {
    const rows = await fetchAllRecords(base44.entities.TodoTask, {}, '-due_date');
    downloadCsv('Task-Register.csv', [
      { key: 'title', label: 'Task' }, { key: 'task_type', label: 'Type' },
      { key: 'assigned_to', label: 'Assigned To' }, { key: 'assigned_email', label: 'Assigned Email' },
      { key: 'due_date', label: 'Due Date' }, { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' }, { key: 'estimated_hours', label: 'Estimated Hours' },
      { key: 'completed_date', label: 'Completed Date' }, { key: 'notes', label: 'Notes' },
    ], rows);
  };

  const runAutomations = async () => {
    setRunning(true);
    try {
      const res = await base44.functions.invoke('runAutomations', {});
      const data = res?.data || res;
      toast({ title: data.message || 'Automations complete' });
      load();
    } catch (err) { toast({ title: 'Automations failed', description: err.message, variant: 'destructive' }); }
    setRunning(false);
  };

  const filtered = filter === 'All' ? list
    : filter === 'My tasks' ? list.filter((t) => t.assigned_email === meEmail)
    : list.filter((t) => t.status === filter);

  // Keyboard-first triage: N new, J/K next/previous, Enter open, Escape close.
  useEffect(() => {
    const onKey = (e) => {
      const tag = (e.target.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
      if (e.key === 'Escape' && editing) { setEditing(null); setFocusIdx(-1); return; }
      if (typing || editing) return;
      if (e.key === 'n' || e.key === 'N') { e.preventDefault(); setFocusIdx(-1); openNew(); }
      else if (e.key === 'j' || e.key === 'ArrowDown') { e.preventDefault(); setFocusIdx((i) => Math.min(i + 1, filtered.length - 1)); }
      else if (e.key === 'k' || e.key === 'ArrowUp') { e.preventDefault(); setFocusIdx((i) => Math.max(i - 1, 0)); }
      else if (e.key === 'Enter' && focusIdx >= 0 && filtered[focusIdx]) { openEdit(filtered[focusIdx]); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered, editing, focusIdx]);

  const allChecked = filtered.length > 0 && filtered.every((t) => selected.includes(t.id));
  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleSelectAll = () => setSelected(allChecked ? [] : filtered.map((t) => t.id));

  const bulkArchive = async () => {
    if (selected.length === 0) return;
    await base44.entities.TodoTask.bulkUpdate(selected.map((id) => ({ id, archived: true })));
    toast({ title: `${selected.length} task${selected.length === 1 ? '' : 's'} archived` });
    setSelected([]);
    load();
  };

  const bulkStatus = async (status) => {
    if (!status || selected.length === 0) return;
    await base44.entities.TodoTask.bulkUpdate(selected.map((id) => ({ id, status, completed_date: status === 'Completed' ? new Date().toISOString().slice(0, 10) : undefined })));
    toast({ title: `${selected.length} task${selected.length === 1 ? '' : 's'} moved to ${status}` });
    setSelected([]);
    load();
  };

  return (
    <div className="compact-module tasks-workspace mx-auto max-w-5xl space-y-2 p-2 md:p-3">
      <PageHeader title="Task Dashboard" subtitle="Current, past and future tasks with allocation, alerts and status tracking" action={<TaskToolbar view={view} onView={(nextView) => { setView(nextView); requestAnimationFrame(() => document.getElementById('task-register-view')?.scrollIntoView({ block: 'start' })); }} onExport={exportTasks} onRun={runAutomations} onNew={openNew} loading={loading} empty={list.length === 0} running={running} />} />

      <TaskSummaryCards totals={taskTotals} metrics={taskMetrics} loading={loading} />

      <TaskDashboard tasks={list} onOpen={openEdit} />

      <section id="task-register-view" aria-label={view === 'calendar' ? 'Task calendar' : 'Task list'}>
        {view === 'calendar' ? <TaskCalendar tasks={list} onOpen={openEdit} /> : <TaskList tasks={filtered} loading={loading} filter={filter} onFilter={setFilter} selected={selected} focusIdx={focusIdx} allChecked={allChecked} onSelectAll={toggleSelectAll} onSelect={toggleSelect} onToggle={toggle} onStatus={setStatus} onSend={setSending} onAlert={alertAssignee} onEdit={openEdit} onDelete={remove} />}
      </section>

      <TaskProgressChart tasks={list} users={users} />

      {loading ? <p role="status" className="text-sm text-muted-foreground">Loading task status board...</p> : <TaskStatusBoard tasks={list} onOpen={openEdit} setStatus={setStatus} />}

      <RegisterInsights module="tasks" />

      {selected.length > 0 && (
        <div className="sticky bottom-4 z-40 flex flex-wrap items-center gap-2 rounded-xl border border-brand/40 bg-card p-3 shadow-xl shadow-brand/10">
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{selected.length} selected</span>
          <button onClick={bulkArchive} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"><Archive className="h-4 w-4" />Archive</button>
          <span className="text-xs font-medium text-foreground/40">Move to:</span>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button key={s} onClick={() => bulkStatus(s)} className={s === 'Completed' ? 'rounded-lg bg-safe px-3 py-2 text-sm font-bold text-safe-foreground hover:bg-safe/90' : 'rounded-lg border border-brand/40 bg-brand/5 px-3 py-2 text-sm font-semibold text-brand hover:bg-brand/15'}>{s}</button>
            ))}
          </div>
          <button onClick={() => setSelected([])} className="ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 hover:bg-muted"><X className="h-4 w-4" />Clear</button>
        </div>
      )}

      {editing && (
        <Dialog open onOpenChange={(open) => { if (!open) setEditing(null); }}>
          <DialogContent className="max-h-[90dvh] overflow-y-auto rounded-2xl bg-card p-5 sm:max-w-lg">
            <DialogHeader><DialogTitle>{editing === 'new' ? 'New Task' : 'Edit Task'}</DialogTitle></DialogHeader>
            <form onSubmit={save} className="space-y-3">
              <Field label="Title"><TextInput value={form.title} onChange={(e) => set('title', e.target.value)} required /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Type"><Select value={form.task_type} onChange={(e) => set('task_type', e.target.value)}>{TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
                <Field label="Priority"><Select value={form.priority} onChange={(e) => set('priority', e.target.value)}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
              </div>
              <Field label="Allocate to">
                <Select value={form.assigned_to || ''} onChange={(e) => assignUser(e.target.value)}>
                  <option value="">Unassigned</option>
                  {users.map((u) => <option key={u.id} value={u.full_name}>{u.full_name || u.email}</option>)}
                  {form.assigned_to && !users.some((u) => u.full_name === form.assigned_to) && <option value={form.assigned_to}>{form.assigned_to}</option>}
                </Select>
              </Field>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Due Date"><DateInput value={form.due_date || ''} onChange={(e) => set('due_date', e.target.value)} /></Field>
                <Field label="Estimated hours"><TextInput type="number" value={form.estimated_hours ?? ''} onChange={(e) => set('estimated_hours', e.target.value)} /></Field>
                <Field label="Status"><Select value={form.status} onChange={(e) => set('status', e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              </div>
              {form.status === 'Completed' && <Field label="Completed date"><DateInput value={form.completed_date || ''} onChange={(e) => set('completed_date', e.target.value)} /></Field>}
              <Field label="Linked entity type (e.g. Incident, Policy)"><TextInput value={form.linked_entity_type || ''} onChange={(e) => set('linked_entity_type', e.target.value)} /></Field>
              <Field label="Linked entity ID"><TextInput value={form.linked_entity_id || ''} onChange={(e) => set('linked_entity_id', e.target.value)} /></Field>
              <Field label="Notes"><TextArea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} /></Field>
              {form.assigned_to && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={emailAssignee} onChange={(e) => setEmailAssignee(e.target.checked)} />
                  Email the task to {form.assigned_to} and send an in-app alert
                </label>
              )}
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button><button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Save</button></div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      <TaskSendDialog open={Boolean(sending)} onOpenChange={(v) => !v && setSending(null)} task={sending} onSaved={load} />

      <TaskLeaderboard />
      <TaskCompletionReports />
    </div>
  );
}