import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { COMPLIANCE_CHECKLISTS } from '@/lib/complianceChecklists';
import { downloadBlankFormPdf } from '@/lib/formsLibraryPdf';
import { buildFilledFormDoc } from '@/lib/participantFormPdf';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { format, addMonths, differenceInCalendarDays } from 'date-fns';
import {
  Download, UploadCloud, Pencil, Loader2, FileDown, CalendarClock, CheckCircle2, AlertTriangle, Clock,
} from 'lucide-react';

const nowParts = () => ({
  date: format(new Date(), 'yyyy-MM-dd'),
  time: format(new Date(), 'HH:mm'),
});

const addSixMonths = (from = new Date()) => format(addMonths(from, 6), 'yyyy-MM-dd');

export default function KitDrillChecklists() {
  const { toast } = useToast();
  const { user } = useRole();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineChecklist, setOnlineChecklist] = useState(null);
  const [checked, setChecked] = useState({});
  const [notes, setNotes] = useState('');
  const [completedBy, setCompletedBy] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ next_due_date: '', notes: '', completed_by: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.ComplianceChecklistEntry.filter({}, { sort: '-created_date', limit: 500 });
      setEntries(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadCompanyBranding().catch(() => {}); }, []);
  useEffect(() => {
    const unsubscribe = base44.entities.ComplianceChecklistEntry.subscribe(() => { load(); });
    return unsubscribe;
  }, [load]);

  const today = format(new Date(), 'yyyy-MM-dd');

  const latestEntry = (checklist) => entries
    .filter((entry) => entry.checklist_key === checklist.key)
    .sort((a, b) => String(b.completed_date || '').localeCompare(String(a.completed_date || '')))[0] || null;

  const statusFor = (entry) => {
    if (!entry) return { label: 'Not completed yet', tone: 'bg-muted text-muted-foreground' };
    if (!entry.next_due_date) return { label: 'Current', tone: 'bg-safe/10 text-safe' };
    const days = differenceInCalendarDays(new Date(`${entry.next_due_date}T00:00:00`), new Date());
    if (days < 0) return { label: 'Overdue', tone: 'bg-red-600/10 text-red-600 dark:text-red-300' };
    if (days <= 30) return { label: 'Due soon', tone: 'bg-warning/10 text-warning' };
    return { label: 'Current', tone: 'bg-safe/10 text-safe' };
  };

  const openOnline = (checklist) => {
    setOnlineChecklist(checklist);
    setChecked(Object.fromEntries(checklist.items.map((item) => [item, false])));
    setNotes('');
    setCompletedBy(user?.full_name || user?.email || '');
  };

  const submitOnline = async () => {
    if (!onlineChecklist) return;
    if (!completedBy.trim()) {
      toast({ title: 'Record who completed the checklist', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const { date, time } = nowParts();
      const values = Object.fromEntries(onlineChecklist.items.map((item) => [item, checked[item] ? 'Yes' : 'No']));
      const doc = buildFilledFormDoc({
        title: onlineChecklist.title,
        code: 'CM-COMP-CHK',
        subtitle: `${onlineChecklist.section} - completed online`,
        fields: onlineChecklist.items.map((item) => ({ label: item })),
        values,
        completedBy: completedBy.trim(),
        completedAt: `${date} at ${time}`,
      });
      const blob = doc.output('blob');
      const file = new File([blob], `${onlineChecklist.title} (completed online).pdf`, { type: 'application/pdf' });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const nextDue = addSixMonths();
      await base44.entities.ComplianceChecklistEntry.create({
        title: onlineChecklist.title,
        checklist_key: onlineChecklist.key,
        section: onlineChecklist.section,
        answers: JSON.stringify({ checked: checked, notes }),
        completed_by: completedBy.trim(),
        completed_date: date,
        completed_time: time,
        next_due_date: nextDue,
        file_uri,
        file_name: file.name,
        notes,
      });
      if (onlineChecklist.safety_check_type) {
        await base44.entities.SafetyCheck.create({
          title: `${onlineChecklist.title} - ${format(new Date(), 'd MMM yyyy')}`,
          check_type: onlineChecklist.safety_check_type,
          location: notes.trim(),
          date_completed: date,
          next_due_date: nextDue,
          completed_by: completedBy.trim(),
          result: notes.trim() ? 'Issues Found' : 'Pass',
          file_uri,
          file_name: file.name,
          notes,
        });
      }
      if (onlineChecklist.drill_type) {
        await base44.entities.EmergencyDrill.create({
          title: `${onlineChecklist.title} - ${format(new Date(), 'd MMM yyyy')}`,
          drill_type: onlineChecklist.drill_type,
          date,
          outcome: notes.trim() ? 'Issues Found' : 'Completed',
          notes,
        });
      }
      await load();
      setOnlineChecklist(null);
      toast({ title: `${onlineChecklist.title} completed and logged`, description: `Next check due ${format(new Date(nextDue), 'd MMM yyyy')}` });
    } catch (error) {
      toast({ title: 'Could not save the checklist', description: error.message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const uploadCompleted = async (checklist, file) => {
    if (!file) return;
    setUploading(checklist.key);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const { date, time } = nowParts();
      const nextDue = addSixMonths();
      await base44.entities.ComplianceChecklistEntry.create({
        title: checklist.title,
        checklist_key: checklist.key,
        section: checklist.section,
        answers: '',
        completed_by: user?.full_name || user?.email || 'Uploaded',
        completed_date: date,
        completed_time: time,
        next_due_date: nextDue,
        file_uri,
        file_name: file.name,
        notes: 'Completed checklist uploaded',
      });
      if (checklist.safety_check_type) {
        await base44.entities.SafetyCheck.create({
          title: `${checklist.title} - ${format(new Date(), 'd MMM yyyy')}`,
          check_type: checklist.safety_check_type,
          date_completed: date,
          next_due_date: nextDue,
          completed_by: user?.full_name || user?.email || '',
          result: 'Pass',
          file_uri,
          file_name: file.name,
        });
      }
      if (checklist.drill_type) {
        await base44.entities.EmergencyDrill.create({
          title: `${checklist.title} - ${format(new Date(), 'd MMM yyyy')}`,
          drill_type: checklist.drill_type,
          date,
          outcome: 'Completed',
          notes: 'Uploaded fire drill record',
        });
      }
      await load();
      toast({ title: `${checklist.title} uploaded and logged (stored privately)` });
    } catch (error) {
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploading('');
    }
  };

  const viewFile = async (entry) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: entry.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Unable to open file', description: error.message, variant: 'destructive' });
    }
  };

  const openEdit = (entry) => {
    setEditing(entry);
    setEditForm({ next_due_date: entry.next_due_date || '', notes: entry.notes || '', completed_by: entry.completed_by || '' });
  };

  const saveEdit = async () => {
    if (!editing) return;
    await base44.entities.ComplianceChecklistEntry.update(editing.id, {
      next_due_date: editForm.next_due_date || '',
      notes: editForm.notes,
      completed_by: editForm.completed_by,
    });
    setEditing(null);
    await load();
    toast({ title: 'Checklist record updated' });
  };

  const removeEntry = async (entry) => {
    if (!confirm(`Remove the record for "${entry.title}"?`)) return;
    await base44.entities.ComplianceChecklistEntry.delete(entry.id);
    await load();
    toast({ title: 'Record removed' });
  };

  const downloadBlank = (checklist) => {
    downloadBlankFormPdf({
      title: checklist.title,
      code: 'CM-COMP-CHK',
      subtitle: `${checklist.section} | 6-monthly compliance checklist`,
      fields: checklist.items.map((item) => ({ label: item })),
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Every checklist below can be downloaded as a branded blank form, completed online (a branded PDF is generated and filed automatically), or a completed copy can be uploaded. Kit, drill and checklist checks run on a 6-month cycle and administrators are emailed when they fall due.
      </p>
      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {COMPLIANCE_CHECKLISTS.map((checklist) => {
            const latest = latestEntry(checklist);
            const status = statusFor(latest);
            return (
              <Card key={checklist.key}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{checklist.title}</p>
                      <p className="text-xs text-muted-foreground">{checklist.section} · {checklist.items.length} items · 6-month cycle</p>
                    </div>
                    <Badge className={status.tone}>{status.label}</Badge>
                  </div>
                  {latest ? (
                    <div className="mt-2 rounded-lg bg-muted/40 p-2.5 text-xs">
                      <p className="font-medium">Last completed: {latest.completed_date ? format(new Date(latest.completed_date), 'd MMM yyyy') : '-'} by {latest.completed_by || 'unrecorded'}</p>
                      <p className="text-foreground/60">Next due: {latest.next_due_date ? format(new Date(`${latest.next_due_date}T00:00:00`), 'd MMM yyyy') : 'not set'}</p>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                      <CalendarClock className="h-3.5 w-3.5" /> No completion recorded yet.
                    </div>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => downloadBlank(checklist)}>
                      <Download className="h-3.5 w-3.5" /> Download
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openOnline(checklist)}>
                      <Pencil className="h-3.5 w-3.5" /> Complete online
                    </Button>
                    <label className="cursor-pointer">
                      <input type="file" className="hidden" onChange={(e) => { uploadCompleted(checklist, e.target.files?.[0]); e.target.value = ''; }} />
                      <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-medium hover:bg-accent">
                        {uploading === checklist.key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />} Upload
                      </span>
                    </label>
                    {latest?.file_uri && (
                      <Button variant="ghost" size="sm" onClick={() => viewFile(latest)}><FileDown className="h-3.5 w-3.5" /> View</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent className="p-4">
          <p className="mb-3 font-semibold">Completed compliance reports (log)</p>
          {entries.length === 0 ? (
            <p className="text-sm text-muted-foreground">No completed checklists recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="py-2 pr-3">Checklist</th><th className="py-2 pr-3">Section</th><th className="py-2 pr-3">Completed by</th>
                    <th className="py-2 pr-3">Date</th><th className="py-2 pr-3">Next due</th><th className="py-2">File</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry) => (
                    <tr key={entry.id} className="border-b last:border-0">
                      <td className="py-2 pr-3 font-medium">{entry.title}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{entry.section || '-'}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{entry.completed_by || '-'}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{entry.completed_date ? format(new Date(entry.completed_date), 'd MMM yyyy') : '-'}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{entry.next_due_date ? format(new Date(`${entry.next_due_date}T00:00:00`), 'd MMM yyyy') : '-'}</td>
                      <td className="py-2">
                        {entry.file_uri && (
                          <Button variant="ghost" size="sm" onClick={() => viewFile(entry)}><FileDown className="h-3.5 w-3.5" /> View</Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => openEdit(entry)}>Edit</Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeEntry(entry)}>Remove</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(onlineChecklist)} onOpenChange={(open) => { if (!open) setOnlineChecklist(null); }}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete {onlineChecklist?.title} online</DialogTitle>
          </DialogHeader>
          {onlineChecklist && (
            <form onSubmit={(e) => { e.preventDefault(); submitOnline(); }} className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Tick every item that passes. A branded PDF with the company name and logo is generated, filed to this checklist and logged with a 6-month next-due date.
              </p>
              <div className="space-y-1.5 rounded-xl border border-border p-3">
                {onlineChecklist.items.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      id={`${onlineChecklist.key}-${item}`}
                      checked={Boolean(checked[item])}
                      onCheckedChange={(value) => setChecked({ ...checked, [item]: Boolean(value) })}
                    />
                    <label htmlFor={`${onlineChecklist.key}-${item}`}>{item}</label>
                  </div>
                ))}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5"><Label>Completed by *</Label><Input value={completedBy} onChange={(e) => setCompletedBy(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Issues or notes</Label><Textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOnlineChecklist(null)}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin" />} Save &amp; file</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(editing)} onOpenChange={(open) => { if (!open) setEditing(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit checklist record</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Next due date</Label><Input type="date" value={editForm.next_due_date} onChange={(e) => setEditForm({ ...editForm, next_due_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Completed by</Label><Input value={editForm.completed_by} onChange={(e) => setEditForm({ ...editForm, completed_by: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={3} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
            <Button onClick={saveEdit}>Save changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}