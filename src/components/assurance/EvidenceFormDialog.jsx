import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EVIDENCE_TYPES } from '@/lib/assuranceChain';

const BLANK = {
  control_id: '',
  title: '',
  evidence_type: 'Document',
  owner: '',
  source: '',
  file_url: '',
  valid_from: '',
  valid_to: '',
  confidence: 80,
  notes: '',
};

function Field({ label, children, wide = false }) {
  return (
    <div className={wide ? 'space-y-1.5 sm:col-span-2' : 'space-y-1.5'}>
      <label className="text-xs font-extrabold text-foreground">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  'h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground';

export default function EvidenceFormDialog({ open, onClose, onSave, onDelete, controls, evidence, saving }) {
  const [form, setForm] = useState(BLANK);
  const editing = Boolean(evidence?.id);

  useEffect(() => {
    if (!open) return;
    setForm(evidence ? { ...BLANK, ...evidence } : BLANK);
  }, [open, evidence]);

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    onSave({
      ...form,
      confidence: form.confidence === '' ? null : Number(form.confidence),
    });
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Edit evidence' : 'Add evidence'}</DialogTitle>
          <DialogDescription>
            Evidence only counts toward coverage once it is linked to a control and verified.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
          <Field label="Control this evidence supports" wide>
            <select value={form.control_id || ''} onChange={set('control_id')} className={inputClass} required>
              <option value="">Select a control…</option>
              {controls.map((control) => (
                <option key={control.id} value={control.id}>
                  {control.standard_code ? `${control.standard_code} — ` : ''}
                  {control.control_statement}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Evidence title" wide>
            <input value={form.title || ''} onChange={set('title')} className={inputClass} required placeholder="e.g. Medication competency assessments — Q3" />
          </Field>

          <Field label="Evidence type">
            <select value={form.evidence_type || 'Document'} onChange={set('evidence_type')} className={inputClass}>
              {EVIDENCE_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </Field>

          <Field label="Owner">
            <input value={form.owner || ''} onChange={set('owner')} className={inputClass} placeholder="Who is accountable for this evidence" />
          </Field>

          <Field label="Source system / location">
            <input value={form.source || ''} onChange={set('source')} className={inputClass} placeholder="e.g. Documents & Policies, Rostering, external drive" />
          </Field>

          <Field label="Evidence link">
            <input value={form.file_url || ''} onChange={set('file_url')} className={inputClass} placeholder="https://…" />
          </Field>

          <Field label="Valid from">
            <input type="date" value={form.valid_from || ''} onChange={set('valid_from')} className={inputClass} />
          </Field>

          <Field label="Valid to">
            <input type="date" value={form.valid_to || ''} onChange={set('valid_to')} className={inputClass} />
          </Field>

          <Field label="Confidence score (%)">
            <input
              type="number"
              min="0"
              max="100"
              value={form.confidence ?? ''}
              onChange={set('confidence')}
              className={inputClass}
            />
          </Field>

          <Field label="Notes" wide>
            <textarea
              value={form.notes || ''}
              onChange={set('notes')}
              rows={3}
              className="w-full rounded-md border border-input bg-background px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground"
              placeholder="What an auditor would check, and where it lives"
            />
          </Field>

          <DialogFooter className="sm:col-span-2 gap-2">
            {editing ? (
              <Button type="button" variant="ghost" onClick={() => onDelete(evidence)} className="sm:mr-auto">
                Delete
              </Button>
            ) : null}
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Add evidence'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}