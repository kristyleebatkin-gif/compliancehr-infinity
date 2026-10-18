import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import { Field, TextInput, Select, TextArea, DateInput } from '@/components/Field';
import EmptyState from '@/components/EmptyState';
import TaskDashboard from '@/components/tasks/TaskDashboard';
import TaskProgressChart from '@/components/tasks/TaskProgressChart';
import TaskStatusBoard from '@/components/tasks/TaskStatusBoard';
import TaskSendDialog from '@/components/tasks/TaskSendDialog';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
import TodoBoard from '@/components/communications/TodoBoard';
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
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [emailAssignee, setEmailAssignee] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState([]);
  const [running, setRunning] = useState(false);
  const [sending, setSending] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, userPage] = await Promise.all([
        base44.entities.Task.filter({ archived: { $ne: true } }, { sort: '-due_date', limit: 500 }),
        base44.entities.User.list({ fields: ['id', 'full_name', 'email'], sort: 'full_name', limit: 200 }),
      ]);
      setList(page.items || []);
      setUsers(userPage.items || []);
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
    if (editing === 'new') await base44.entities.Task.create(payload);
    else await base44.entities.Task.update(editing, payload);
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
    await base44.entities.Task.update(t.id, {
      status: completed ? 'Completed' : 'Open',
      completed_date: completed ? new Date().toISOString().slice(0, 10) : undefined,
    });
    load();
  };

  const setStatus = async (t, status) => {
    await base44.entities.Task.update(t.id, {
      status,
      completed_date: status === 'Completed' ? new Date().toISOString().slice(0, 10) : undefined,
    });
    load();
  };

  const remove = async (t) => { if (confirm('Delete this task?')) { await base44.entities.Task.delete(t.id); load(); } };

  const exportTasks = async () => {
    const rows = await fetchAllRecords(base44.entities.Task, {}, '-due_date');
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

  const filtered = filter === 'All' ? list : list.filter((t) => t.status === filter);

  const allChecked = filtered.length > 0 && filtered.every((t) => selected.includes(t.id));
  const toggleSelect = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const toggleSelectAll = () => setSelected(allChecked ? [] : filtered.map((t) => t.id));

  const bulkArchive = async () => {
    if (selected.length === 0) return;
    await base44.entities.Task.bulkUpdate(selected.map((id) => ({ id, archived: true })));
    toast({ title: `${selected.length} task${selected.length === 1 ? '' : 's'} archived` });
    setSelected([]);
    load();
  };

  const bulkStatus = async (status) => {
    if (!status || selected.length === 0) return;
    await base44.entities.Task.bulkUpdate(selected.map((id) => ({ id, status, completed_date: status === 'Completed' ? new Date().toISOString().slice(0, 10) : undefined })));
    toast({ title: `${selected.length} task${selected.length === 1 ? '' : 's'} moved to ${status}` });
    setSelected([]);
    load();
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-6">
      <PageHeader title="Task Dashboard" subtitle="Current, past and future tasks with allocation, alerts, status tracking and the shared to-do board" action={<div className="flex gap-2"><button onClick={exportTasks} disabled={loading || list.length === 0} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"><Download className="h-4 w-4" />Export CSV</button><button onClick={runAutomations} disabled={running} className="flex items-center gap-1.5 rounded-lg border border-brand px-3.5 py-2 text-sm font-semibold text-brand hover:bg-brand/5 disabled:opacity-60"><Zap className="h-4 w-4" />{running ? 'Running...' : 'Run Automations'}</button><button onClick={openNew} className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand/90"><Plus className="h-4 w-4" />New Task</button></div>} />

      <TaskDashboard tasks={list} onOpen={openEdit} />

      <TaskProgressChart tasks={list} users={users} />

      <TaskStatusBoard tasks={list} onOpen={openEdit} setStatus={setStatus} />

      <div className="flex items-center gap-1 overflow-x-auto">
        {['All', 'Open', 'In Progress', 'Completed', 'Overdue'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${filter === s ? 'bg-brand text-white' : 'bg-card border border-border/60 text-foreground/60 hover:bg-brand/5'}`}>{s}</button>
        ))}
        <label className="ml-auto flex shrink-0 cursor-pointer items-center gap-2 pl-3 text-xs font-medium text-foreground/60">
          <input type="checkbox" checked={allChecked} onChange={toggleSelectAll} className="h-4 w-4" />
          Select all
        </label>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-foreground/40">Loading...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ListTodo} title="No tasks" message="Create tasks to track compliance actions." />
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div key={t.id} className={`flex items-center gap-3 rounded-xl border p-3.5 transition-colors ${selected.includes(t.id) ? 'border-brand bg-brand/5' : 'border-border/60 bg-card'}`}>
              <input type="checkbox" checked={selected.includes(t.id)} onChange={() => toggleSelect(t.id)} aria-label={`Select ${t.title}`} className="h-4 w-4 shrink-0 accent-[hsl(var(--brand))]" />
              <button onClick={() => toggle(t)} className="shrink-0">
                {t.status === 'Completed' ? <CheckCircle2 className="h-5 w-5 text-safe" /> : <Circle className="h-5 w-5 text-foreground/30" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${t.status === 'Completed' ? 'line-through text-foreground/40' : ''}`}>{t.title}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${t.priority === 'Urgent' || t.priority === 'High' ? 'bg-danger/10 text-danger' : 'bg-muted text-foreground/60'}`}>{t.priority}</span>
                  <span>{t.task_type}</span>
                  {t.assigned_to && <span>• {t.assigned_to}</span>}
                  {t.due_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{format(new Date(t.due_date), 'EEE d MMM yyyy')}</span>}
                  {t.completed_date && t.status === 'Completed' && <span>• completed {format(new Date(t.completed_date), 'd MMM yyyy')}</span>}
                </div>
              </div>
              <select value={t.status} onChange={(e) => setStatus(t, e.target.value)} className="h-8 shrink-0 rounded-full border border-border/60 bg-card px-2 text-xs font-medium">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="flex gap-1">
                <button onClick={() => setSending(t)} title="Send / alert assignee" className="rounded p-1.5 hover:bg-brand/10"><Mail className="h-4 w-4 text-foreground/50" /></button>
                <button onClick={() => alertAssignee(t)} title="Send in-app alert" className="rounded p-1.5 hover:bg-brand/10"><Bell className="h-4 w-4 text-foreground/50" /></button>
                <button onClick={() => openEdit(t)} aria-label="Edit task" className="rounded p-1.5 hover:bg-brand/10"><Pencil className="h-4 w-4 text-foreground/50" /></button>
                <button onClick={() => remove(t)} aria-label="Delete task" className="rounded p-1.5 hover:bg-danger/10"><Trash2 className="h-4 w-4 text-danger" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="sticky bottom-4 z-40 flex flex-wrap items-center gap-2 rounded-xl border border-brand/40 bg-card p-3 shadow-xl shadow-brand/10">
          <span className="rounded-full bg-brand px-3 py-1 text-xs font-bold text-white">{selected.length} selected</span>
          <button onClick={bulkArchive} className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted"><Archive className="h-4 w-4" />Archive</button>
          <select value="" onChange={(e) => bulkStatus(e.target.value)} className="h-9 rounded-lg border border-border bg-card px-2.5 text-sm font-medium">
            <option value="">Move to status…</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setSelected([])} className="ml-auto flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground/60 hover:bg-muted"><X className="h-4 w-4" />Clear</button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-card p-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <h3 className="mb-4 text-lg font-semibold">{editing === 'new' ? 'New Task' : 'Edit Task'}</h3>
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
          </div>
        </div>
      )}

      <TaskSendDialog open={Boolean(sending)} onOpenChange={(v) => !v && setSending(null)} task={sending} onSaved={load} />

      <TodoBoard />

      <TaskLeaderboard />
    </div>
  );
}