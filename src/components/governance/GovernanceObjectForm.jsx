import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LIFECYCLE_STAGES } from '@/lib/governanceFramework';
import { Loader2, Trash2 } from 'lucide-react';

const EMPTY = {
  title: '', object_code: '', lifecycle_stage: 'Policy', record_type: '', module: '',
  document_category: 'Record', business_owner: '', status: 'Draft', version: 'v1.0',
  version_state: 'Current', review_date: '', assigned_to_type: 'Organisation-wide', assigned_to_name: '',
  related_policy: '', related_procedure: '', related_plan: '', related_form: '', related_register: '',
  risk_link: '', incident_link: '', feedback_link: '', audit_link: '', capa_link: '',
  evidence_documents: '', signatures: '', acknowledgements: '', evidence_notes: '',
  retention_period: '7 Years', archive_date: '', destruction_date: '', notes: '',
};

const CATEGORIES = ['Policy', 'Procedure', 'Plan', 'Form', 'Register', 'Evidence', 'Record'];
const STATUSES = ['Draft', 'Active', 'Under Review', 'Expired', 'Archived'];
const VERSION_STATES = ['Current', 'Archived', 'Future'];
const ASSIGNED_TYPES = ['Organisation-wide', 'Participant', 'Employee', 'Volunteer', 'Contractor', 'Asset', 'Vehicle', 'Business'];
const RETENTION = ['1 Year', '3 Years', '7 Years', '10 Years', '25 Years', 'Permanent'];

function TextField({ label, value, onChange, type = 'text' }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-bold">{label}</Label>
      <Input type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-bold">{label}</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
      <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-[#5A00D6]">{title}</p>
      <div className="grid gap-2 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export default function GovernanceObjectForm({ open, onOpenChange, record, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setError('');
    setForm({ ...EMPTY, ...(record || {}), evidence_documents: (record?.evidence_documents || []).join('\n') });
  }, [open, record]);

  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.title.trim()) { setError('A title is required.'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        evidence_documents: form.evidence_documents.split('\n').map((row) => row.trim()).filter(Boolean),
        review_date: form.review_date || undefined,
        archive_date: form.archive_date || undefined,
        destruction_date: form.destruction_date || undefined,
      };
      delete payload.id;
      delete payload.created_date;
      delete payload.updated_date;
      delete payload.created_by_id;
      if (record?.id) await base44.entities.GovernanceObject.update(record.id, payload);
      else await base44.entities.GovernanceObject.create(payload);
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'The governance object could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!record?.id) return;
    setSaving(true);
    try {
      await base44.entities.GovernanceObject.delete(record.id);
      await onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err?.message || 'The governance object could not be deleted.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{record?.id ? 'Edit governance object' : 'New governance object'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2.5">
          <Section title="Core Information">
            <TextField label="Object Title" value={form.title} onChange={set('title')} />
            <TextField label="Unique ID / Code" value={form.object_code} onChange={set('object_code')} />
            <SelectField label="Lifecycle Stage" value={form.lifecycle_stage} onChange={set('lifecycle_stage')} options={LIFECYCLE_STAGES.map((stage) => stage.key)} />
            <TextField label="Record Type" value={form.record_type} onChange={set('record_type')} />
            <TextField label="Module" value={form.module} onChange={set('module')} />
            <TextField label="Business Owner" value={form.business_owner} onChange={set('business_owner')} />
            <SelectField label="Status" value={form.status} onChange={set('status')} options={STATUSES} />
            <TextField label="Version" value={form.version} onChange={set('version')} />
            <SelectField label="Version State" value={form.version_state} onChange={set('version_state')} options={VERSION_STATES} />
            <TextField label="Review Date" type="date" value={form.review_date} onChange={set('review_date')} />
            <SelectField label="Document Category" value={form.document_category} onChange={set('document_category')} options={CATEGORIES} />
            <SelectField label="Assigned To" value={form.assigned_to_type} onChange={set('assigned_to_type')} options={ASSIGNED_TYPES} />
            <TextField label="Assigned To (Name)" value={form.assigned_to_name} onChange={set('assigned_to_name')} />
          </Section>

          <Section title="Governance Links">
            <TextField label="Related Policy" value={form.related_policy} onChange={set('related_policy')} />
            <TextField label="Related Procedure" value={form.related_procedure} onChange={set('related_procedure')} />
            <TextField label="Related Plan" value={form.related_plan} onChange={set('related_plan')} />
            <TextField label="Related Form" value={form.related_form} onChange={set('related_form')} />
            <TextField label="Related Register" value={form.related_register} onChange={set('related_register')} />
          </Section>

          <Section title="Compliance Links">
            <TextField label="Risk Link" value={form.risk_link} onChange={set('risk_link')} />
            <TextField label="Incident Link" value={form.incident_link} onChange={set('incident_link')} />
            <TextField label="Feedback Link" value={form.feedback_link} onChange={set('feedback_link')} />
            <TextField label="Audit Link" value={form.audit_link} onChange={set('audit_link')} />
            <TextField label="CAPA Link" value={form.capa_link} onChange={set('capa_link')} />
          </Section>

          <Section title="Evidence">
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-bold">Supporting Documents (one per line)</Label>
              <Textarea rows={3} value={form.evidence_documents} onChange={(event) => set('evidence_documents')(event.target.value)} />
            </div>
            <TextField label="Signatures" value={form.signatures} onChange={set('signatures')} />
            <TextField label="Acknowledgements" value={form.acknowledgements} onChange={set('acknowledgements')} />
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-bold">Evidence Notes</Label>
              <Textarea rows={2} value={form.evidence_notes} onChange={(event) => set('evidence_notes')(event.target.value)} />
            </div>
          </Section>

          <Section title="Retention">
            <SelectField label="Retention Period" value={form.retention_period} onChange={set('retention_period')} options={RETENTION} />
            <TextField label="Archive Date" type="date" value={form.archive_date} onChange={set('archive_date')} />
            <TextField label="Destruction Date" type="date" value={form.destruction_date} onChange={set('destruction_date')} />
            <div className="space-y-1 sm:col-span-2">
              <Label className="text-xs font-bold">Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(event) => set('notes')(event.target.value)} />
            </div>
          </Section>

          {error && <p className="text-sm font-semibold text-[#FF2E9A]">{error}</p>}

          <DialogFooter className="flex flex-wrap items-center justify-between gap-2">
            {record?.id ? (
              <Button variant="outline" onClick={remove} disabled={saving}>
                <Trash2 className="h-4 w-4" />Delete
              </Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={saving}>Cancel</Button>
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {record?.id ? 'Save changes' : 'Create object'}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}