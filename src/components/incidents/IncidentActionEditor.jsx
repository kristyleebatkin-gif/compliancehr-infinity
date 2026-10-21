import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function IncidentActionEditor({ action, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const save = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try { await base44.entities.TodoTask.update(action.id, form); await onSaved(); setEditing(false); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  };
  if (!editing) return <Button size="sm" variant="outline" className="mt-2 h-7 text-xs" onClick={() => { setForm({ title: action.title || '', notes: action.notes || '', assigned_to: action.assigned_to || '', due_date: action.due_date || '', priority: action.priority || 'Medium' }); setEditing(true); }}>Edit response</Button>;
  return <form onSubmit={save} className="mt-3 space-y-2 rounded-xl border border-primary/30 bg-card p-3">
    <Label>Action title<Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} disabled={busy} /></Label>
    <Label>Response / notes<Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} disabled={busy} /></Label>
    <div className="grid gap-2 sm:grid-cols-2"><Label>Assigned to<Input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} disabled={busy} /></Label><Label>Due date<Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} disabled={busy} /></Label></div>
    <Label>Priority<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} disabled={busy} className="block w-full rounded-md border border-input bg-background p-2 text-sm">{['Low', 'Medium', 'High', 'Urgent'].map((value) => <option key={value}>{value}</option>)}</select></Label>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    <div className="flex gap-2"><Button size="sm" disabled={busy}>{busy ? 'Saving…' : 'Save response'}</Button><Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setEditing(false)}>Cancel</Button></div>
  </form>;
}