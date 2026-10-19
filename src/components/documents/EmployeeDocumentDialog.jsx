import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadCloud } from 'lucide-react';

const DOC_TYPES = ['Resume', 'Contract', 'Police Check', 'Blue Card', 'First Aid Certificate', 'CPR Certificate', 'NDIS Worker Screening', "Driver's License", 'Qualifications', 'Reference Check', 'Staff Badge', 'Other'];
const STATUSES = ['Current', 'Expiring Soon', 'Expired', 'Archived'];

const emptyForm = { title: '', employee_name: '', document_type: 'Other', issue_date: '', expiry_date: '', status: 'Current', file_uri: '', notes: '' };

export default function EmployeeDocumentDialog({ open, onOpenChange, staff, me, canPickEmployee, initial, onDone }) {
  const editing = !!initial?.id;
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        title: initial.title || '', employee_name: initial.employee_name || '', document_type: initial.document_type || 'Other',
        issue_date: initial.issue_date || '', expiry_date: initial.expiry_date || '', status: initial.status || 'Current',
        file_uri: initial.file_uri || '', notes: initial.notes || '',
      });
    } else {
      setForm({ ...emptyForm, employee_name: canPickEmployee ? '' : (me?.full_name || '') });
    }
  }, [open, editing, initial, canPickEmployee, me?.full_name]);

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
    setSaving(true);
    try {
      if (editing) await base44.entities.EmployeeDocument.update(initial.id, form);
      else await base44.entities.EmployeeDocument.create(form);
      onOpenChange(false);
      onDone?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{editing ? 'Edit document' : 'New employee document'}</DialogTitle></DialogHeader>
        <div className="grid gap-3">
          <div className="grid gap-1.5"><Label>Title *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label>Employee</Label>
            <Select value={form.employee_name} onValueChange={(v) => setForm({ ...form, employee_name: v })} disabled={!canPickEmployee}>
              <SelectTrigger><SelectValue placeholder={canPickEmployee ? 'Select staff member' : me?.full_name || ''} /></SelectTrigger>
              <SelectContent>{(canPickEmployee ? staff : [me?.full_name].filter(Boolean)).map((n) => <SelectItem key={n} value={n}>{n}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Document type</Label>
              <Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5"><Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label>Issue date</Label><Input type="date" value={form.issue_date} onChange={(e) => setForm({ ...form, issue_date: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label>Expiry date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
          </div>
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
          <Button onClick={save} disabled={saving || !form.title.trim()}>{editing ? 'Save changes' : 'Save document'}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}