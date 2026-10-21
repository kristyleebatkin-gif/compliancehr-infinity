import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileDown, Loader2, Plus, Trash2, UploadCloud } from 'lucide-react';
import { format, addMonths, isBefore, addDays } from 'date-fns';

const CHECK_TYPES = [
  'Smoke Alarm Test', 'Fire Safety Equipment Check', 'Fire Extinguisher Check', 'Emergency Lighting Test',
  'Natural Disaster Kit Check', 'First Aid Kit Check', 'First Aid Check', 'MSDS Review', 'Evacuation Drill', 'Other',
];
const RESULTS = ['Pass', 'Issues Found', 'Scheduled'];

const ALL_CHECKS = {};
export default function SafetyChecksLog({ scope = ALL_CHECKS }) {
  const { toast } = useToast();
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', check_type: 'Smoke Alarm Test', location: '', date_completed: '', next_due_date: '', completed_by: '', result: 'Pass', issues_found: '', action_taken: '', notes: '' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.SafetyCheck.filter(scope, { sort: '-date_completed', limit: 200 });
      setChecks(page.items);
    } finally {
      setLoading(false);
    }
  }, [scope]);

  useEffect(() => { load(); }, [load]);

  const onDateCompleted = (value) => {
    setForm((prev) => ({
      ...prev,
      date_completed: value,
      next_due_date: value ? format(addMonths(new Date(value), 6), 'yyyy-MM-dd') : prev.next_due_date,
    }));
  };

  const save = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    setUploading(Boolean(file));
    try {
      let file_uri;
      let file_name;
      if (file) {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
        file_uri = uploaded.file_uri;
        file_name = file.name;
      }
      await base44.entities.SafetyCheck.create({ ...form, file_uri, file_name });
      setForm({ title: '', check_type: 'Smoke Alarm Test', location: '', date_completed: '', next_due_date: '', completed_by: '', result: 'Pass', issues_found: '', action_taken: '', notes: '' });
      setFile(null);
      setOpen(false);
      await load();
      toast({ title: 'Check logged', description: 'Next due date set 6 months out.' });
    } catch (error) {
      toast({ title: 'Could not save check', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const downloadRecord = async (check) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: check.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  const dueState = (next_due_date) => {
    if (!next_due_date) return null;
    const due = new Date(next_due_date);
    const today = new Date();
    if (isBefore(due, today)) return { label: 'Overdue', cls: 'bg-danger/10 text-danger' };
    if (isBefore(due, addDays(today, 30))) return { label: 'Due soon', cls: 'bg-warning/10 text-warning' };
    return { label: 'Current', cls: 'bg-safe/10 text-safe' };
  };

  const overdue = checks.filter((c) => c.next_due_date && isBefore(new Date(c.next_due_date), new Date())).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Every check is logged here with its next 6-month due date. {overdue > 0 ? `${overdue} check${overdue === 1 ? '' : 's'} overdue.` : 'All checks within cycle.'}</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus className="mr-2 h-4 w-4" />Log check</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Log safety check</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Smoke alarm test - Ruby Street" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Check type</Label>
                  <Select value={form.check_type} onValueChange={(v) => setForm({ ...form, check_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CHECK_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5"><Label>Location</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Date completed</Label><Input type="date" value={form.date_completed} onChange={(e) => onDateCompleted(e.target.value)} /></div>
                <div className="grid gap-1.5"><Label>Next due (auto 6 months)</Label><Input type="date" value={form.next_due_date} onChange={(e) => setForm({ ...form, next_due_date: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5"><Label>Completed by</Label><Input value={form.completed_by} onChange={(e) => setForm({ ...form, completed_by: e.target.value })} /></div>
                <div className="grid gap-1.5"><Label>Result</Label>
                  <Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{RESULTS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              {form.result === 'Issues Found' && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5"><Label>Issues found</Label><Textarea rows={2} value={form.issues_found} onChange={(e) => setForm({ ...form, issues_found: e.target.value })} /></div>
                  <div className="grid gap-1.5"><Label>Action taken</Label><Textarea rows={2} value={form.action_taken} onChange={(e) => setForm({ ...form, action_taken: e.target.value })} /></div>
                </div>
              )}
              <div className="grid gap-1.5"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <div className="grid gap-1.5">
                <Label>Attach completed record (optional)</Label>
                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-foreground/70 hover:bg-muted">
                  {file ? file.name : <><UploadCloud className="h-4 w-4" />Choose file</>}
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              </div>
              <Button onClick={save} disabled={saving || !form.title.trim()}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Log check</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : checks.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No checks logged yet. Log your first smoke alarm test, kit check or equipment inspection above.</p>
      ) : (
        <div className="space-y-2">
          {checks.map((c) => {
            const state = dueState(c.next_due_date);
            return (
              <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3">
                <div className="min-w-0">
                  <p className="font-medium">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {[c.check_type, c.location, c.date_completed ? `Done ${format(new Date(c.date_completed), 'd MMM yyyy')}` : '', c.completed_by].filter(Boolean).join(' · ')}
                  </p>
                  {c.result === 'Issues Found' && c.issues_found && <p className="mt-1 text-xs text-warning">Issues: {c.issues_found}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {state && <Badge className={state.cls}>{state.label} {c.next_due_date ? format(new Date(c.next_due_date), 'd MMM yyyy') : ''}</Badge>}
                  <Badge variant="outline" className="text-[10px]">{c.result}</Badge>
                  {c.file_uri && <Button variant="ghost" size="icon" className="h-8 w-8" title="Download record" onClick={() => downloadRecord(c)}><Download className="h-4 w-4" /></Button>}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={async () => { await base44.entities.SafetyCheck.delete(c.id); await load(); }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}