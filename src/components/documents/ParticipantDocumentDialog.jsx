import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logUserAction } from '@/lib/actionLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadCloud } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DOC_TYPES = [
  'NDIS Plan', 'Service Agreement', 'Participant Support Plan', 'Personal Emergency Form', 'Participant Consent',
  'Consent to Share Information', 'Participant Handbook', 'Participant Easy Read Handbook', 'Progress Notes',
  'Feedback and Complaints', 'Satisfaction Survey', 'Medication Administration Record', 'Invoices', 'Participant Exit Form',
];

const emptyForm = { title: '', document_type: 'NDIS Plan', expiry_date: '', file_uri: '', notes: '' };

export default function ParticipantDocumentDialog({ open, onOpenChange, me, profile, initial, onDone }) {
  const editing = !!initial?.id;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: initial.title || '', document_type: initial.document_type || 'NDIS Plan',
        expiry_date: initial.expiry_date || '', file_uri: initial.file_uri || '', notes: initial.notes || '',
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, editing, initial]);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      setForm((f) => ({ ...f, file_uri }));
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      let savedId = initial?.id || '';
      if (editing) {
        await base44.entities.ParticipantDocument.update(initial.id, form);
      } else {
        // Link the document to the PARTICIPANT's portal account (matched by the
        // profile email) so it appears in their private My Documents, never to
        // the staff member uploading it.
        let participantUserId = '';
        try {
          const users = await base44.entities.User.list();
          participantUserId = users.find((u) => String(u.email || '').toLowerCase() === String(profile?.email || '').toLowerCase())?.id || '';
        } catch (e) { console.error(e); }
        const saved = await base44.entities.ParticipantDocument.create({
          participant_id: profile?.id || '',
          participant_name: profile?.full_name || me?.full_name || '',
          participant_user_id: participantUserId,
          admin_approved: profile?.admin_approved === true,
          document_type: form.document_type,
          title: form.title.trim() || form.document_type,
          expiry_date: form.expiry_date,
          file_uri: form.file_uri,
          notes: form.notes,
          uploaded_date: new Date().toISOString().slice(0, 10),
          submitted_date: new Date().toISOString().slice(0, 10),
          submission_method: 'Upload',
          status: 'Received',
          review_outcome: 'Pending Review',
        });
        savedId = saved?.id || savedId;
      }
      logUserAction(editing ? 'Document Updated' : 'Document Uploaded', 'Participant Document', { record_title: form.title.trim() || form.document_type, record_id: savedId, person: { profile_type: 'participant', profile_id: profile?.id || initial?.participant_id, profile_name: profile?.full_name || me?.full_name } });
      if (!editing && form.file_uri) {
        try {
          const extract = await base44.functions.invoke('consentDocumentExtract', { entity_type: 'participant', profile_id: profile?.id || initial?.participant_id || '', document_id: savedId, file_uri: form.file_uri });
          if (extract.data?.ok && (extract.data.consent_types?.length || extract.data.filled_fields?.length)) {
            toast({ title: 'Uploaded document reviewed', description: `Extracted into the profile: ${[...(extract.data.consent_types || []), ...(extract.data.filled_fields || [])].join(', ')}` });
          }
        } catch (e) { console.error(e); }
      }
      onOpenChange(false);
      onDone?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'Edit document' : 'Upload a document'}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Document type</Label>
            <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label>Title (optional)</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.document_type} /></div>
          <div className="grid gap-1.5"><Label>Expiry date (optional)</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Document file</Label>
            <label className="flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm font-medium hover:bg-accent">
              {uploading
                ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                : <UploadCloud className="h-4 w-4" />}
              {form.file_uri ? 'File attached' : 'Upload file'}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.txt"
                className="hidden"
                disabled={uploading}
                onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
              />
            </label>
            {editing && initial?.file_uri && !form.file_uri && <p className="text-xs text-muted-foreground">Keeping the existing file.</p>}
          </div>
          <div className="grid gap-1.5"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button onClick={save} disabled={saving || uploading}>{editing ? 'Save changes' : 'Upload document'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}