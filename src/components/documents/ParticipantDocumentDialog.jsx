import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logUserAction } from '@/lib/actionLog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadCloud, FileCheck2 } from 'lucide-react';
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
          if (extract.data?.needs_review) {
            toast({ title: 'Please check consent manually', description: `This document may contain ${(extract.data.unconfirmed_consent_types || []).join(', ') || 'a'} consent, but the decision wasn't clear. No consent was recorded — please review the document and record it on the profile.` });
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
      <DialogContent className="overflow-hidden border-2 border-[#0A2B6D] bg-white p-0 sm:rounded-2xl shadow-xl">
        <div className="border-b-4 border-[#0072FF] bg-[#0A2B6D] px-5 py-4 text-white">
          <DialogHeader className="text-left">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-md bg-[#0072FF] px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              <FileCheck2 className="h-3.5 w-3.5 text-[#00C6FF]" />
              <span>Participant Document Vault</span>
            </div>
            <DialogTitle className="mt-1 font-editorial text-lg font-extrabold text-white">
              {editing ? 'Edit document' : 'Upload a document'}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="grid gap-3.5 p-5 bg-white text-[#0A2B6D]">
          <div className="grid gap-1.5 rounded-xl border border-sky-200 bg-[#F0F7FF] p-3">
            <Label className="font-bold text-[#0A2B6D]">Document type</Label>
            <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
              <SelectTrigger className="border-sky-200 bg-white"><SelectValue /></SelectTrigger>
              <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5"><Label className="font-bold text-[#0A2B6D]">Title (optional)</Label><Input className="border-sky-200 bg-[#F8FAFC]" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={form.document_type} /></div>
          <div className="grid gap-1.5"><Label className="font-bold text-[#0A2B6D]">Expiry date (optional)</Label><Input type="date" className="border-sky-200 bg-[#F8FAFC]" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
          <div className="grid gap-1.5">
            <Label className="font-bold text-[#0A2B6D]">Document file</Label>
            <label className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#0072FF] bg-[#F0F7FF] px-3 text-sm font-bold text-[#0A2B6D] hover:bg-[#E0F2FE]">
              {uploading
                ? <span className="block h-4 w-4 animate-spin rounded-full border-2 border-[#0072FF]/30 border-t-[#0072FF]" />
                : <UploadCloud className="h-4 w-4 text-[#0072FF]" />}
              {form.file_uri ? 'File attached' : 'Upload file'}
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.txt"
                className="hidden"
                disabled={uploading}
                onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
              />
            </label>
            {editing && initial?.file_uri && !form.file_uri && <p className="text-xs text-[#0A2B6D]/70">Keeping the existing file.</p>}
          </div>
          <div className="grid gap-1.5"><Label className="font-bold text-[#0A2B6D]">Notes</Label><Input className="border-sky-200 bg-[#F8FAFC]" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <Button onClick={save} disabled={saving || uploading} className="bg-[#0A2B6D] text-white hover:bg-[#0072FF]">
            {editing ? 'Save changes' : 'Upload document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}