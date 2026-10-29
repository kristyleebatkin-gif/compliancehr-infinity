import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DOCUMENT_CATEGORIES, DOCUMENT_STATUSES } from '@/lib/governanceFramework';
import { Loader2, Trash2 } from 'lucide-react';

const EMPTY = {
  title: '', document_id: '', version: 'v1.0', status: 'Draft', document_category: 'Policy',
  business_unit: '', owner: '', approved_by: '', approval_date: '', review_date: '',
  superseded_version: '', change_summary: '', file_url: '', notes: '',
};

export default function DocumentControlForm({ open, onOpenChange, record, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({ ...EMPTY, ...(record || {}) });
  }, [open, record]);

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.title.trim() || !form.document_id.trim()) {
      setError('A document title and document ID are required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        approval_date: form.approval_date || undefined,
        review_date: form.review_date || undefined,
      };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;
      if (record?.id) await base44.entities.DocumentControl.update(record.id, payload);
      else await base44.entities.DocumentControl.create(payload);
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'The document could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!record?.id) return;
    setSaving(true);
    try {
      await base44.entities.DocumentControl.delete(record.id);
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'The document could not be deleted.');
    } finally {
      setSaving(false);
    }
  };

  const field = (label, key, type = 'text') => (
    <div className="space-y-1">
      <Label className="text-xs font-bold">{label}</Label>
      <Input type={type} value={form[key] || ''} onChange={(event) => set(key)(event.target.value)} />
    </div>
  );

  const choice = (label, key, options) => (
    <div className="space-y-1">
      <Label className="text-xs font-bold">{label}</Label>
      <Select value={form[key]} onValueChange={set(key)}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>{options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record?.id ? 'Edit controlled document' : 'New controlled document'}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2.5 sm:grid-cols-2">
          {field('Document Title', 'title')}
          {field('Document ID', 'document_id')}
          {field('Version', 'version')}
          {choice('Status', 'status', DOCUMENT_STATUSES)}
          {choice('Document Category', 'document_category', DOCUMENT_CATEGORIES)}
          {field('Business Unit', 'business_unit')}
          {field('Document Owner', 'owner')}
          {field('Approved By', 'approved_by')}
          {field('Approval Date', 'approval_date', 'date')}
          {field('Review Date', 'review_date', 'date')}
          {field('Superseded Version', 'superseded_version')}
          {field('Document Link', 'file_url')}
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-bold">Change Summary</Label>
            <Textarea rows={2} value={form.change_summary} onChange={(event) => set('change_summary')(event.target.value)} />
          </div>
          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs font-bold">Notes</Label>
            <Textarea rows={2} value={form.notes} onChange={(event) => set('notes')(event.target.value)} />
          </div>
        </div>

        {error && <p className="mt-2 text-sm font-semibold text-[#FF2E9A]">{error}</p>}

        <DialogFooter className="mt-3 flex flex-wrap items-center justify-between gap-2">
          {record?.id
            ? <Button variant="outline" onClick={remove} disabled={saving}><Trash2 className="h-4 w-4" />Delete</Button>
            : <span />}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {record?.id ? 'Save document' : 'Create in draft'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}