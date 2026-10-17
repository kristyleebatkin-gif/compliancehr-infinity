import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

const TYPES = ['Idea', 'Suggestion', 'Corrective Action'];
const STATUSES = ['New', 'In Progress', 'Implemented', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const blank = { title: '', type: 'Idea', description: '', source: '', raised_by: '', raised_date: '', owner: '', nominated_to: '', nominated_email: '', nominated_date: '', priority: 'Medium', status: 'New', target_date: '', outcome: '', notes: '' };

export default function QualityItemDialog({ open, onOpenChange, editing, users, onSaved, defaultType = 'Idea' }) {
  const [form, setForm] = useState(blank);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(false);

  if (open && !ready) {
    setReady(true);
    setForm(editing ? { ...blank, ...editing } : { ...blank, type: defaultType, raised_date: new Date().toISOString().slice(0, 10) });
  }
  if (!open && ready) setReady(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const nominate = (name) => {
    const user = users.find((u) => u.full_name === name);
    setForm((f) => ({ ...f, nominated_to: name, nominated_email: user?.email || f.nominated_email, nominated_date: f.nominated_date || new Date().toISOString().slice(0, 10) }));
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        completed_date: form.status === 'Closed' ? (editing?.completed_date || new Date().toISOString().slice(0, 10)) : form.completed_date,
      };
      if (editing) await base44.entities.QualityItem.update(editing.id, payload);
      else await base44.entities.QualityItem.create(payload);
      onSaved();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader><DialogTitle>{editing ? 'Edit item' : 'New idea, suggestion or corrective action'}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => set('title', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => set('type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => set('priority', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5"><Label>Description (all details)</Label><Textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5"><Label>Source</Label><Input value={form.source} onChange={(e) => set('source', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Raised by</Label><Input value={form.raised_by} onChange={(e) => set('raised_by', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Raised date</Label><Input type="date" value={form.raised_date} onChange={(e) => set('raised_date', e.target.value)} /></div>
          </div>
          <div className="grid gap-1.5"><Label>Nominate to (person responsible)</Label>
            <Select value={form.nominated_to || ''} onValueChange={nominate}>
              <SelectTrigger><SelectValue placeholder="Select a person" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not nominated</SelectItem>
                {users.map((u) => <SelectItem key={u.id} value={u.full_name}>{u.full_name || u.email}</SelectItem>)}
                {form.nominated_to && !users.some((u) => u.full_name === form.nominated_to) && <SelectItem value={form.nominated_to}>{form.nominated_to}</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Nominated person email</Label><Input type="email" value={form.nominated_email} onChange={(e) => set('nominated_email', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Nominated date</Label><Input type="date" value={form.nominated_date} onChange={(e) => set('nominated_date', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5"><Label>Owner</Label><Input value={form.owner} onChange={(e) => set('owner', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Target date</Label><Input type="date" value={form.target_date} onChange={(e) => set('target_date', e.target.value)} /></div>
            <div className="grid gap-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-1.5"><Label>Outcome / result</Label><Textarea value={form.outcome} onChange={(e) => set('outcome', e.target.value)} /></div>
          <div className="grid gap-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} /></div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title.trim()}>{saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}Save item</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}