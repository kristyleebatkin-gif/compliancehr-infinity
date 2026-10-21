import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileText, Loader2, Plus, Trash2, UploadCloud } from 'lucide-react';
import { format } from 'date-fns';

const TYPES = ['Progress Note', 'Progress Report'];

export default function GoalNotes({ goal, participantName, readOnly = false, api = base44.entities.GoalProgressNote }) {
  const { toast } = useToast();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ entry_type: 'Progress Note', notes: '' });

  const load = useCallback(async () => {
    if (!goal?.id) return;
    setLoading(true);
    try {
      const page = await api.filter({ goal_id: goal.id }, { sort: '-created_date', limit: 50 });
      setEntries(page.items);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [goal?.id, api]);

  useEffect(() => { load(); }, [load]);

  // Participants see their own note history read-only; staff record the notes.
  const resolveParticipantUserId = async (name) => {
    if (!name) return '';
    try {
      const page = await base44.entities.ParticipantProfile.filter({ full_name: name }, { limit: 1, fields: ['email'] });
      const email = page.items?.[0]?.email;
      if (!email) return '';
      const users = await base44.entities.User.list();
      return users.find((u) => String(u.email || '').toLowerCase() === String(email).toLowerCase())?.id || '';
    } catch {
      return '';
    }
  };

  const save = async () => {
    if (!form.notes.trim() && !file) return;
    setSaving(true);
    try {
      let file_uri;
      let file_name;
      if (file) {
        const uploaded = await base44.integrations.Core.UploadPrivateFile({ file });
        file_uri = uploaded.file_uri;
        file_name = file.name;
      }
      const me = await base44.auth.me().catch(() => null);
      const participant_user_id = api === base44.entities.GoalProgressNote ? await resolveParticipantUserId(participantName) : '';
      await api.create({
        goal_id: goal.id,
        participant_name: participantName,
        participant_user_id,
        entry_type: form.entry_type,
        notes: form.notes,
        file_uri,
        file_name,
        recorded_by: me?.full_name || me?.email || '',
        recorded_date: new Date().toISOString().slice(0, 10),
      });
      setForm({ entry_type: 'Progress Note', notes: '' });
      setFile(null);
      setOpen(false);
      await load();
      toast({ title: `${form.entry_type} saved` });
    } catch (error) {
      toast({ title: 'Could not save entry', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const download = async (entry) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: entry.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    }
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-muted-foreground">
          <FileText className="h-3.5 w-3.5" /> Progress notes &amp; reports ({entries.length})
        </div>
        {!readOnly && (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setOpen(true)}>
            <Plus className="mr-1 h-3 w-3" />Add
          </Button>
        )}
      </div>

      {loading ? (
        <div className="py-3 text-center"><Loader2 className="mx-auto h-4 w-4 animate-spin text-muted-foreground" /></div>
      ) : entries.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">No progress notes or reports recorded yet.</p>
      ) : (
        <div className="mt-2 space-y-2">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-border/60 bg-card p-2.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{entry.entry_type}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {entry.recorded_date ? format(new Date(entry.recorded_date), 'd MMM yyyy') : ''}
                    {entry.recorded_by ? ` · ${entry.recorded_by}` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  {entry.file_uri && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" title={`Download ${entry.file_name || 'file'}`} onClick={() => download(entry)}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {!readOnly && api.delete && (
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={async () => { await api.delete(entry.id); await load(); }}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
              {entry.file_name && <p className="mt-1 flex items-center gap-1 text-xs text-teal"><FileText className="h-3 w-3" />{entry.file_name}</p>}
              {entry.notes && <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{entry.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add progress entry</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Entry type</Label>
              <Select value={form.entry_type} onValueChange={(v) => setForm({ ...form, entry_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Notes</Label><Textarea rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Progress observed, barriers, next steps..." /></div>
            <div className="grid gap-1.5">
              <Label>Attach report or note (optional)</Label>
              <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-3 py-2.5 text-sm font-medium text-foreground/70 hover:bg-muted">
                {file ? file.name : <><UploadCloud className="h-4 w-4" />Choose file (PDF, Word, image...)</>}
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            <Button onClick={save} disabled={saving || (!form.notes.trim() && !file)}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Save entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}