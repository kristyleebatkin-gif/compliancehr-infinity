import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ClipboardList, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const STATUSES = ['Open', 'In Progress', 'Completed', 'Overdue', 'Cancelled'];

export default function MeetingTasks({ meeting }) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', assigned_to: '', due_date: '', priority: 'Medium', notes: '' });

  const load = useCallback(async () => {
    if (!meeting?.id) return;
    setLoading(true);
    try {
      const page = await base44.entities.Task.filter(
        { linked_entity_type: 'Meeting', linked_entity_id: meeting.id },
        { sort: '-created_date', limit: 50 },
      );
      setTasks(page.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [meeting?.id]);

  useEffect(() => {
    load();
    base44.entities.StaffProfile.filter({}, { sort: 'full_name', limit: 100 })
      .then((page) => setStaff(page.items))
      .catch(() => {});
  }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      await base44.entities.Task.create({
        ...form,
        task_type: 'General',
        status: 'Open',
        linked_entity_type: 'Meeting',
        linked_entity_id: meeting.id,
      });
      setForm({ title: '', assigned_to: '', due_date: '', priority: 'Medium', notes: '' });
      setOpen(false);
      await load();
      toast({ title: 'Follow-up task created', description: 'It is also listed in the Tasks module with a changeable status.' });
    } catch (error) {
      toast({ title: 'Could not create task', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (task, status) => {
    await base44.entities.Task.update(task.id, { status });
    await load();
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground/50">
          <ClipboardList className="h-3.5 w-3.5" /> Meeting follow-up tasks ({tasks.length})
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOpen(true)}>
          <Plus className="mr-1 h-3 w-3" />Assign task
        </Button>
      </div>

      {loading ? (
        <p className="mt-2 text-xs text-muted-foreground">Loading...</p>
      ) : tasks.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">No follow-up tasks nominated for this meeting yet.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-card p-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {[task.assigned_to ? `Assigned to ${task.assigned_to}` : '', task.due_date ? `Due ${format(new Date(task.due_date), 'd MMM yyyy')}` : '', task.priority !== 'Medium' ? task.priority : ''].filter(Boolean).join(' · ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Select value={task.status} onValueChange={(v) => setStatus(task, v)}>
                  <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
                <Badge className={statusTone(task.status)}>{task.status}</Badge>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await base44.entities.Task.delete(task.id); await load(); }}>
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign follow-up task</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Task *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="grid gap-1.5"><Label>Assign to staff</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                  <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
                  <SelectContent>{staff.map((s) => <SelectItem key={s.id} value={s.full_name}>{s.full_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{['Low', 'Medium', 'High', 'Urgent'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-1.5"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <Button onClick={save} disabled={saving || !form.title.trim()}>Create task</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}