import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Users, RefreshCcw, ListPlus } from 'lucide-react';

const DOC_TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Other'];
const DOC_STATUSES = ['Current', 'Expiring Soon', 'Expired', 'Archived'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];

// Bulk staff actions for the compliance dashboard: tick multiple staff
// members, then update their document renewal statuses or assign each of
// them a new task in a single operation.
export default function StaffBulkActions() {
  const [staff, setStaff] = useState(null);
  const [docs, setDocs] = useState([]);
  const [selected, setSelected] = useState([]);
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  // Renewal form state
  const [docType, setDocType] = useState('All documents');
  const [newStatus, setNewStatus] = useState('');
  const [newExpiry, setNewExpiry] = useState('');

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDue, setTaskDue] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskNotes, setTaskNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      base44.entities.StaffProfile.list(),
      base44.entities.EmployeeDocument.filter(
        { status: { $ne: 'Archived' } },
        { limit: 1000, fields: ['employee_id', 'employee_name', 'document_type', 'status', 'expiry_date'] },
      ),
    ])
      .then(([staffPage, docPage]) => {
        if (cancelled) return;
        const staffItems = (Array.isArray(staffPage) ? staffPage : staffPage.items || [])
          .sort((a, b) => (a.full_name || '').localeCompare(b.full_name || ''));
        setStaff(staffItems);
        setDocs(docPage.items || []);
      })
      .catch((error) => console.error(error))
      .finally(() => { if (!cancelled) setStaff((prev) => (prev === null ? [] : prev)); });
    return () => { cancelled = true; };
  }, []);

  const docsFor = useMemo(() => {
    const byId = new Map();
    docs.forEach((d) => {
      if (!d.employee_id) return;
      if (!byId.has(d.employee_id)) byId.set(d.employee_id, 0);
      if (!docType || docType === 'All documents' || d.document_type === docType) byId.set(d.employee_id, byId.get(d.employee_id) + 1);
    });
    return byId;
  }, [docs, docType]);

  const toggleRow = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleAll = () => setSelected((prev) => (prev.length === staff.length ? [] : staff.map((s) => s.id)));
  const chosenStaff = (staff || []).filter((s) => selected.includes(s.id));

  const applyRenewal = async () => {
    if (!newStatus) { toast({ title: 'Choose a new status first', variant: 'destructive' }); return; }
    setBusy(true);
    try {
      const query = { employee_id: { $in: selected } };
      if (docType !== 'All documents') query.document_type = docType;
      const set = { status: newStatus };
      if (newExpiry) set.expiry_date = newExpiry;
      await base44.entities.EmployeeDocument.updateMany(query, { $set: set });
      toast({ title: `${chosenStaff.length} staff member${chosenStaff.length === 1 ? '' : 's'} updated`, description: `${docType === 'All documents' ? 'All documents' : docType} set to ${newStatus}` });
      const docPage = await base44.entities.EmployeeDocument.filter(
        { status: { $ne: 'Archived' } },
        { limit: 1000, fields: ['employee_id', 'employee_name', 'document_type', 'status', 'expiry_date'] },
      );
      setDocs(docPage.items || []);
      setNewStatus('');
      setNewExpiry('');
    } finally {
      setBusy(false);
    }
  };

  const assignTask = async () => {
    if (!taskTitle.trim()) { toast({ title: 'Task title is required', variant: 'destructive' }); return; }
    setBusy(true);
    try {
      await base44.entities.TodoTask.bulkCreate(
        chosenStaff.map((s) => ({
          title: taskTitle.trim(),
          task_type: 'Compliance',
          module: 'Compliance Hub',
          due_date: taskDue || undefined,
          priority: taskPriority,
          assigned_to: s.full_name,
          assigned_email: s.email || undefined,
          responsible: [s.full_name],
          responsible_emails: s.email ? [s.email] : [],
          status: 'Pending',
          notes: taskNotes.trim() || undefined,
        })),
      );
      toast({ title: 'Tasks assigned', description: `${taskTitle.trim()} sent to ${chosenStaff.length} staff member${chosenStaff.length === 1 ? '' : 's'}` });
      setTaskTitle(''); setTaskDue(''); setTaskPriority('Medium'); setTaskNotes('');
    } finally {
      setBusy(false);
    }
  };

  if (staff === null) {
    return <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
      <Loader2 className="h-4 w-4 animate-spin" />Loading staff and documents...
    </CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card className="shadow-panel">
        <CardContent className="p-5">
          <div className="mb-1 flex items-center gap-2 font-display text-base font-bold"><Users className="h-4 w-4 text-indigo-500" />Staff bulk actions</div>
          <p className="text-xs font-medium text-muted-foreground">Tick the staff members below, then update their document renewal statuses or assign each of them a new task — all in one action.</p>

          {staff.length === 0 ? (
            <p className="py-8 text-center text-sm text-foreground/60">No staff profiles found.</p>
          ) : (
            <>
              <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2">
                <Checkbox checked={selected.length === staff.length && staff.length > 0} onCheckedChange={toggleAll} aria-label="Select all staff" />
                <span className="text-xs font-semibold text-foreground/70">Select all ({staff.length})</span>
                <span className="ml-auto text-xs font-semibold text-indigo-600 dark:text-indigo-300">{selected.length} selected</span>
              </div>
              <div className="max-h-72 overflow-y-auto pr-1">
                <div className="grid gap-1.5 sm:grid-cols-2 xl:grid-cols-3">
                  {staff.map((s) => (
                    <label key={s.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm hover:bg-accent/50">
                      <Checkbox checked={selected.includes(s.id)} onCheckedChange={() => toggleRow(s.id)} aria-label={`Select ${s.full_name}`} />
                      <span className="min-w-0 flex-1 truncate font-semibold">{s.full_name}</span>
                      <span className="shrink-0 text-xs tabular-nums text-foreground/40">{docsFor.get(s.id) || 0} docs</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-bold"><RefreshCcw className="h-4 w-4 text-teal" />Update document renewal status</div>
                  <p className="mt-1 text-xs text-muted-foreground">Sets the status of every matching document held by the selected staff.</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="grid gap-1.5">
                      <Label>Document type</Label>
                      <Select value={docType} onValueChange={setDocType}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="All documents">All documents</SelectItem>
                          {DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>New status</Label>
                      <Select value={newStatus} onValueChange={setNewStatus}>
                        <SelectTrigger><SelectValue placeholder="Choose status..." /></SelectTrigger>
                        <SelectContent>{DOC_STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>New expiry date (optional)</Label>
                      <Input type="date" value={newExpiry} onChange={(e) => setNewExpiry(e.target.value)} />
                    </div>
                    <div className="flex items-end">
                      <Button className="w-full" disabled={busy || selected.length === 0} onClick={applyRenewal}>
                        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Update {selected.length || ''} staff
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 text-sm font-bold"><ListPlus className="h-4 w-4 text-brand" />Assign a new task</div>
                  <p className="mt-1 text-xs text-muted-foreground">Creates one task per selected staff member, assigned to each of them.</p>
                  <div className="mt-3 grid gap-3">
                    <div className="grid gap-1.5">
                      <Label>Task title</Label>
                      <Input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="e.g. Renew First Aid Certificate" />
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="grid gap-1.5">
                        <Label>Due date</Label>
                        <Input type="date" value={taskDue} onChange={(e) => setTaskDue(e.target.value)} />
                      </div>
                      <div className="grid gap-1.5">
                        <Label>Priority</Label>
                        <Select value={taskPriority} onValueChange={setTaskPriority}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>{PRIORITIES.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-1.5">
                      <Label>Instructions (optional)</Label>
                      <Textarea value={taskNotes} onChange={(e) => setTaskNotes(e.target.value)} rows={2} placeholder="What exactly needs to happen?" />
                    </div>
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-700" disabled={busy || selected.length === 0} onClick={assignTask}>
                      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Assign to {selected.length || ''} staff
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}