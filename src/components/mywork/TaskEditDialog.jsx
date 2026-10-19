import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { logUserAction } from '@/lib/actionLog';

const STATUSES = ['Pending', 'Pending Approval', 'In Progress', 'Open', 'Completed', 'Overdue', 'Cancelled'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

export default function TaskEditDialog({ task, open, onClose, onSaved }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) setForm({ title: task.title || '', due_date: task.due_date || '', priority: task.priority || 'Medium', status: task.status || 'Pending', notes: task.notes || '' });
  }, [task]);

  if (!task) return null;

  const save = async () => {
    setSaving(true);
    await base44.entities.TodoTask.update(task.id, {
      title: form.title,
      due_date: form.due_date || undefined,
      priority: form.priority,
      status: form.status,
      notes: form.notes,
      completed_date: form.status === 'Completed' ? (task.completed_date || new Date().toISOString().slice(0, 10)) : undefined,
    });
    logUserAction('Task Updated', 'Task', { record_id: task.id, record_title: form.title, details: `Status: ${form.status}` });
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader><DialogTitle>Quick edit task</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Task</Label>
            <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label>Due date</Label>
              <input type="date" className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <Label>Status</Label>
              <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>Notes</Label>
            <textarea rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title.trim()} className="bg-safe text-white hover:bg-safe/90">{saving ? 'Saving...' : 'Save'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}