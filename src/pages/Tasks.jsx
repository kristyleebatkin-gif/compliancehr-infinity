import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import PageHeader from '@/components/PageHeader';
import { Field, TextInput, Select, TextArea, DateInput } from '@/components/Field';
import EmptyState from '@/components/EmptyState';
import { ListTodo, Plus, Pencil, Trash2, CheckCircle2, Circle, Clock, Zap } from 'lucide-react';

const TYPES = ['Review Reminder', 'Training Renewal', 'Policy Review', 'Incident Action', 'Audit Action', 'General'];
const STATUSES = ['Open', 'In Progress', 'Completed', 'Overdue', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

const blank = { title: '', task_type: 'General', assigned_to: '', due_date: '', status: 'Open', priority: 'Medium', notes: '', linked_entity_type: '', linked_entity_id: '' };

export default function Tasks() {
  const { toast } = useToast();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [filter, setFilter] = useState('All');
  const [running, setRunning] = useState(false);

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

  const load = async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Task.filter({}, { sort: '-due_date', limit: 500 });
      setList(page.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setEditing('new'); setForm({ ...blank, due_date: new Date().toISOString().slice(0, 10) }); };
  const openEdit = (t) => { setEditing(t.id); setForm(t); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.title) { toast({ title: 'Title required', variant: 'destructive' }); return; }
    if (editing === 'new') await base44.entities.Task.create(form);
    else await base44.entities.Task.update(editing, form);
    toast({ title: 'Task saved' });
    setEditing(null); load();
  };

  const toggle = async (t) => {
    await base44.entities.Task.update(t.id, { status: t.status === 'Completed' ? 'Open' : 'Completed' });
    load();
  };

  const remove = async (t) => { if (confirm('Delete this task?')) { await base44.entities.Task.delete(t.id); load(); } };

  const filtered = filter === 'All' ? list : list.filter((t) => t.status === filter);
  const counts = { Open: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
  list.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8 space-y-6">
      <PageHeader title="Tasks" subtitle={`${counts.Open} open • ${counts.Overdue} overdue`} action={<div className="flex gap-2"><button onClick={runAutomations} disabled={running} className="flex items-center gap-1.5 rounded-lg border border-brand px-3.5 py-2 text-sm font-semibold text-brand hover:bg-brand/5 disabled:opacity-60"><Zap className="h-4 w-4" />{running ? 'Running...' : 'Run Automations'}</button><button onClick={openNew} className="flex items-center gap-1.5 rounded-lg bg-brand px-3.5 py-2 text-sm font-semibold text-white hover:bg-brand/90"><Plus className="h-4 w-4" />New Task</button></div>} />

      <div className="flex gap-1 overflow-x-auto">
        {['All', 'Open', 'In Progress', 'Completed', 'Overdue'].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ${filter === s ? 'bg-brand text-white' : 'bg-card border border-border/60 text-foreground/60 hover:bg-brand/5'}`}>{s}</button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-foreground/40">Loading...</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={ListTodo} title="No tasks" message="Create tasks to track compliance actions." />
      ) : (
        <div className="space-y-2">
          {filtered.map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5">
              <button onClick={() => toggle(t)} className="shrink-0">
                {t.status === 'Completed' ? <CheckCircle2 className="h-5 w-5 text-safe" /> : <Circle className="h-5 w-5 text-foreground/30" />}
              </button>
              <div className="min-w-0 flex-1">
                <div className={`text-sm font-medium ${t.status === 'Completed' ? 'line-through text-foreground/40' : ''}`}>{t.title}</div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/50">
                  <span className={`rounded-full px-2 py-0.5 font-medium ${t.priority === 'Urgent' || t.priority === 'High' ? 'bg-danger/10 text-danger' : 'bg-muted text-foreground/60'}`}>{t.priority}</span>
                  <span>{t.task_type}</span>
                  {t.assigned_to && <span>• {t.assigned_to}</span>}
                  {t.due_date && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{t.due_date}</span>}
                </div>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.status === 'Completed' ? 'bg-safe/10 text-safe' : t.status === 'Overdue' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>{t.status}</span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(t)} className="rounded p-1.5 hover:bg-brand/10"><Pencil className="h-4 w-4 text-foreground/50" /></button>
                <button onClick={() => remove(t)} className="rounded p-1.5 hover:bg-danger/10"><Trash2 className="h-4 w-4 text-danger" /></button>
              </div>
            </div>
          ))}
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
              <div className="grid grid-cols-2 gap-3">
                <Field label="Assigned To"><TextInput value={form.assigned_to || ''} onChange={(e) => set('assigned_to', e.target.value)} /></Field>
                <Field label="Due Date"><DateInput value={form.due_date || ''} onChange={(e) => set('due_date', e.target.value)} /></Field>
              </div>
              <Field label="Status"><Select value={form.status} onChange={(e) => set('status', e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="Notes"><TextArea value={form.notes || ''} onChange={(e) => set('notes', e.target.value)} /></Field>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setEditing(null)} className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted">Cancel</button><button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}