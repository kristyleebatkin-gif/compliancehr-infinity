import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { changeStatus } from '@/lib/statusLog';
import { downloadCsv } from '@/lib/csvExport';
import { useToast } from '@/components/ui/use-toast';
import { format, isBefore, startOfDay } from 'date-fns';
import { Plus, Trash2, Download, UserPlus } from 'lucide-react';

const STATUSES = ['Open', 'In Progress', 'Completed', 'Cancelled'];
const EMPTY = { title: '', audit_title: '', description: '', allocated_to: '', allocated_email: '', priority: 'Medium', due_date: '', notes: '' };

export default function AuditActions({ audits }) {
  const { toast } = useToast();
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [actionPage, userPage] = await Promise.all([
        base44.entities.AuditAction.filter({}, { sort: '-created_date', limit: 300 }),
        base44.entities.User.list(),
      ]);
      setActions(actionPage.items);
      setUsers(userPage.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const user = users.find((u) => u.id === form.allocated_to);
      await base44.entities.AuditAction.create({
        ...form,
        allocated_to: user?.full_name || form.allocated_to,
        allocated_email: user?.email || form.allocated_email,
      });
      setForm(EMPTY);
      setOpen(false);
      await load();
      toast({ title: 'Action created and allocated' });
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (action, status) => {
    if (status === action.status) return;
    await changeStatus({ entityType: 'AuditAction', entity: 'AuditAction', record: action, toStatus: status });
    if (status === 'Completed') await base44.entities.AuditAction.update(action.id, { completed_date: format(new Date(), 'yyyy-MM-dd') });
    await load();
  };

  const exportCsv = () => {
    downloadCsv('audit-actions-register.csv', [
      { key: 'title', label: 'Action' }, { key: 'audit_title', label: 'Linked Audit' },
      { key: 'description', label: 'Finding / Description' }, { key: 'allocated_to', label: 'Allocated To' },
      { key: 'allocated_email', label: 'Allocated Email' }, { key: 'priority', label: 'Priority' },
      { key: 'due_date', label: 'Due Date' }, { key: 'status', label: 'Status' },
      { key: 'completed_date', label: 'Completed Date' }, { key: 'notes', label: 'Notes' },
      { key: 'status_log', label: 'Status History' },
    ], actions.map((a) => ({ ...a, description: a.description || '', audit_title: a.audit_title || '', allocated_email: a.allocated_email || '', notes: a.notes || '', status_log: a.status_log || '' })));
    toast({ title: 'Actions register exported' });
  };

  const isOverdue = (a) => a.due_date && a.status !== 'Completed' && a.status !== 'Cancelled' && isBefore(new Date(a.due_date), startOfDay(new Date()));

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Corrective and improvement actions from audits. Every status change is logged.</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export register</Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button><UserPlus className="mr-2 h-4 w-4" />Allocate action</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Allocate an action</DialogTitle></DialogHeader>
              <div className="grid gap-3">
                <div className="grid gap-1.5"><Label>Action title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Linked audit</Label>
                  <Select value={form.audit_title} onValueChange={(v) => setForm({ ...form, audit_title: v })}>
                    <SelectTrigger><SelectValue placeholder="Select audit (optional)" /></SelectTrigger>
                    <SelectContent>{audits.map((a) => <SelectItem key={a.id} value={a.title}>{a.title}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Finding / description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5"><Label>Allocate to</Label>
                    <Select value={form.allocated_to} onValueChange={(v) => setForm({ ...form, allocated_to: v })}>
                      <SelectTrigger><SelectValue placeholder="Select person" /></SelectTrigger>
                      <SelectContent>{users.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name || u.email}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5"><Label>Priority</Label>
                    <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{['Low', 'Medium', 'High'].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-1.5"><Label>Due date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Notes</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button onClick={save} disabled={saving || !form.title.trim()}>Save action</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : actions.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No actions allocated yet.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {actions.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{a.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {[[a.audit_title ? `Audit: ${a.audit_title}` : ''], [a.allocated_to ? `Allocated to ${a.allocated_to}` : ''],
                        [a.due_date ? `Due ${format(new Date(a.due_date), 'd MMM yyyy')}` : ''], [a.completed_date ? `Completed ${format(new Date(a.completed_date), 'd MMM yyyy')}` : '']]
                        .map((p) => p[0]).filter(Boolean).join(' · ') || 'No details yet'}
                    </p>
                    {a.description && <p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}
                    {a.status_log && <p className="mt-1 truncate text-xs text-muted-foreground" title={a.status_log}>{a.status_log.split('\n').slice(-1)[0]}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    {a.priority === 'High' && <Badge variant="destructive">High</Badge>}
                    {isOverdue(a) && <Badge className={statusTone('Overdue')}>Overdue</Badge>}
                    <Badge className={statusTone(a.status)}>{a.status}</Badge>
                    <Select value={a.status} onValueChange={(v) => setStatus(a, v)}>
                      <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={async () => { if (confirm('Delete this action?')) { await base44.entities.AuditAction.delete(a.id); await load(); } }}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}