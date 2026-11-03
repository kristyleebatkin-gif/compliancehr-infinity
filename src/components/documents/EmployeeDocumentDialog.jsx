import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { logUserAction } from '@/lib/actionLog';
import { syncEmployeeRecord } from '@/lib/employeeRecordBridge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadCloud, FileCheck2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const DOC_TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Staff Badge', 'Other'];
const STATUSES = ['Current', 'Expiring Soon', 'Expired', 'Archived'];

const emptyForm = { title: '', employee_name: '', document_type: 'Other', issue_date: '', expiry_date: '', status: 'Current', file_uri: '', notes: '' };

export default function EmployeeDocumentDialog({ open, onOpenChange, staff, me, canPickEmployee, employeeName, initial, onDone }) {
  const editing = !!initial?.id;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    if (editing) {
      setForm({
        title: initial.title || '', employee_name: initial.employee_name || '', document_type: initial.document_type || 'Other',
        issue_date: initial.issue_date || '', expiry_date: initial.expiry_date || '', status: initial.status || 'Current',
        file_uri: initial.file_uri || '', notes: initial.notes || '',
      });
    } else {
      setForm({ ...emptyForm, employee_name: employeeName || (canPickEmployee ? '' : (me?.full_name || '')) });
    }
  }, [open, editing, initial, canPickEmployee, employeeName, me?.full_name]);

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
    if (!form.title.trim()) return;
    setSaving(true); setError('');
    try {
      let savedId = initial?.id || '';
      const matches = await base44.entities.StaffProfile.filter({ full_name: form.employee_name }, { limit: 2 });
      const employeeId = initial?.employee_id && initial.employee_name === form.employee_name ? initial.employee_id : matches.items.length === 1 ? matches.items[0].id : '';
      if (!employeeId) throw new Error('Select an employee with a unique staff profile before filing this document.');
      const payload = { ...form, employee_id: employeeId, employee_email: matches.items[0]?.email || initial?.employee_email || '' };
      if (editing) await base44.entities.EmployeeDocument.update(initial.id, payload);
      else {
        const saved = await base44.entities.EmployeeDocument.create(payload);
        savedId = saved?.id || savedId;
      }
      await syncEmployeeRecord('EmployeeDocument', savedId);
      logUserAction(editing ? 'Document Updated' : 'Document Uploaded', 'Employee Document', { record_title: form.title.trim(), record_id: savedId, person: { profile_type: 'employee', profile_id: form.employee_id, profile_name: form.employee_name } });
      if (!editing && form.file_uri) {
        try {
          const extract = await base44.functions.invoke('consentDocumentExtract', { entity_type: 'staff', profile_id: employeeId, document_id: savedId, file_uri: form.file_uri });
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
    } catch (failure) {
      setError(failure.message);
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
              <span>Employee Document Vault</span>
            </div>
            <DialogTitle className="mt-1 font-editorial text-lg font-extrabold text-white">
              {editing ? 'Edit document' : 'New employee document'}
            </DialogTitle>
          </DialogHeader>
        </div>
        <div className="grid gap-3.5 p-5 bg-white text-[#0A2B6D]">
          <div className="grid gap-1.5 rounded-xl border border-sky-200 bg-[#F0F7FF] p-3">
            <Label className="font-bold text-[#0A2B6D]">Title *</Label>
            <Input className="bg-white border-sky-200" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="grid gap-1.5">
            <Label className="font-bold text-[#0A2B6D]">Employee</Label>
            <Select value={form.employee_name} onValueChange={(v) => setForm({ ...form, employee_name: v })} disabled={!canPickEmployee}>
              <SelectTrigger className="border-sky-200 bg-[#F8FAFC]"><SelectValue placeholder={canPickEmployee ? 'Select staff member' : me?.full_name || ''} /></SelectTrigger>
              <SelectContent>{(canPickEmployee ? staff : [employeeName || me?.full_name].filter(Boolean)).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label className="font-bold text-[#0A2B6D]">Document type</Label>
              <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
                <SelectTrigger className="border-sky-200 bg-[#F8FAFC]"><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label className="font-bold text-[#0A2B6D]">Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger className="border-sky-200 bg-[#F8FAFC]"><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label className="font-bold text-[#0A2B6D]">Issue date</Label><Input type="date" className="border-sky-200 bg-[#F8FAFC]" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label className="font-bold text-[#0A2B6D]">Expiry date</Label><Input type="date" className="border-sky-200 bg-[#F8FAFC]" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
          </div>
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
          {error && <p role="alert" className="text-xs font-semibold text-destructive">{error}</p>}
          <Button onClick={save} disabled={saving || uploading || !form.title.trim()} className="bg-[#0A2B6D] text-white hover:bg-[#0072FF]">
            {editing ? 'Save changes' : 'Save document'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}