import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { CATEGORIES, SOURCES } from '@/lib/complianceIssues.js';

export default function IssueLogDialog({ open, onOpenChange, nextId, onSaved }) {
  const [form, setForm] = useState({ title: '', description: '', category: 'Other', source: 'Management Observation', priority: 'Medium', assigned_to: '', target_date: '' });
  const [saving, setSaving] = useState(false);
  const [me, setMe] = useState(null);

  useEffect(() => {
    if (open && !me) base44.auth.me().then(setMe).catch(() => {});
  }, [open, me]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await base44.entities.ComplianceIssue.create({
        ...form,
        issue_id: `CI-${String(nextId).padStart(4, '0')}`,
        status: 'Open',
        date_logged: today,
        logged_by: me?.full_name || me?.email || 'Compliance team',
        actions_log: `${today} | ${me?.full_name || 'Compliance team'} | Issue logged and documented.`,
      });
      setForm({ title: '', description: '', category: 'Other', source: 'Management Observation', priority: 'Medium', assigned_to: '', target_date: '' });
      onOpenChange(false);
      await onSaved();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Log compliance issue</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Issue title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="What is the compliance issue?" /></div>
          <div className="grid gap-1.5"><Label>Description</Label><Textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Details, evidence, standard or requirement affected" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Source</Label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{SOURCES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{['Low', 'Medium', 'High', 'Urgent'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Assigned to</Label><Input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} placeholder="Who will fix it" /></div>
          </div>
          <div className="grid gap-1.5"><Label>Target resolution date</Label><Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></div>
          <Button onClick={save} disabled={saving || !form.title.trim()}>Log issue</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}