import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ratingTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, ClipboardList, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

const COLUMNS = [
  { key: 'open', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];
const NEXT = { open: 'in_progress', in_progress: 'done', done: 'open' };
const priorityTone = (p) => ratingTone[p.charAt(0).toUpperCase() + p.slice(1)] || 'bg-muted text-foreground/60';

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', status: 'open', priority: 'medium', due_date: '', assigned_to: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.Task.filter({}, { sort: 'due_date', limit: 100 });
      setTasks(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Task.create(form);
      setForm({ title: '', description: '', status: 'open', priority: 'medium', due_date: '', assigned_to: '' });
      setOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const advance = async (task) => {
    await base44.entities.Task.update(task.id, { status: NEXT[task.status] });
    await load();
  };

  const remove = async (id) => {
    await base44.entities.Task.delete(id);
    await load();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><ClipboardList className="h-6 w-6" /> Tasks</h1>
          <p className="text-sm text-muted-foreground">Compliance actions and follow-ups.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="mr-2 h-4 w-4" /> Add task</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New task</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5"><Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{COLUMNS.map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{['low', 'medium', 'high'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              </div>
              <div className="grid gap-1.5"><Label>Assigned to</Label><Input value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} /></div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>Save task</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {COLUMNS.map((col) => {
            const items = tasks.filter((t) => t.status === col.key);
            return (
              <div key={col.key} className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="font-semibold">{col.label}</p>
                  <Badge variant="outline">{items.length}</Badge>
                </div>
                {items.length === 0 && (
                  <Card><CardContent className="p-4 text-center text-sm text-muted-foreground">No tasks</CardContent></Card>
                )}
                {items.map((t) => (
                  <Card key={t.id}>
                    <CardContent className="space-y-2 p-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-medium ${t.status === 'done' ? 'line-through text-muted-foreground' : ''}`}>{t.title}</p>
                        <Badge className={priorityTone(t.priority)}>{t.priority}</Badge>
                      </div>
                      {t.description && <p className="text-xs text-muted-foreground">{t.description}</p>}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{[t.assigned_to, t.due_date ? `Due ${format(new Date(t.due_date), 'd MMM')}` : ''].filter(Boolean).join(' · ')}</span>
                        <span className="flex items-center">
                          <Button variant="ghost" size="icon" onClick={() => advance(t)} title="Move to next stage"><ArrowRight className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => remove(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}