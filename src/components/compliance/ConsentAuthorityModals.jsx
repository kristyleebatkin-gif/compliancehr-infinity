import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UploadCloud } from 'lucide-react';

export function ParticipantConsentDialog({
  open,
  onOpenChange,
  editingId,
  form,
  setForm,
  participants,
  consentTypes,
  uploadingFile,
  onUploadEvidence,
  onSave,
  saving,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Update Participant Consent & Authority' : 'Record Participant Consent (18 Standard Types)'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Participant *</Label>
              <select
                value={form.participant_id}
                onChange={(e) => {
                  const p = participants.find((x) => x.id === e.target.value);
                  setForm((f) => ({
                    ...f,
                    participant_id: e.target.value,
                    participant_name: p?.full_name || f.participant_name,
                    participant_signatory_name: p?.full_name || f.participant_signatory_name,
                  }));
                }}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="">Select participant or type below</option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Participant Name *</Label>
              <Input
                value={form.participant_name}
                onChange={(e) => setForm({ ...form, participant_name: e.target.value })}
                placeholder="Full name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Consent Type (18 Standard Categories) *</Label>
              <select
                value={form.consent_type}
                onChange={(e) => setForm({ ...form, consent_type: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
              >
                {consentTypes.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Consent Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="Active">Active</option>
                <option value="Renewed">Renewed</option>
                <option value="Withdrawn">Withdrawn</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Consent Description &amp; Scope of Authority</Label>
            <Textarea
              rows={2}
              value={form.consent_description}
              onChange={(e) => setForm({ ...form, consent_description: e.target.value })}
              placeholder="Describe specific authority, scope and any exclusions..."
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Signed By</Label>
              <Input
                value={form.participant_signatory_name}
                onChange={(e) => setForm({ ...form, participant_signatory_name: e.target.value })}
              />
            </div>
            <div>
              <Label>Relationship to Participant</Label>
              <Input
                value={form.relationship}
                onChange={(e) => setForm({ ...form, relationship: e.target.value })}
                placeholder="Self, Guardian, Nominee..."
              />
            </div>
            <div>
              <Label>Authorised Recipient / Body</Label>
              <Input
                value={form.recipient_name}
                onChange={(e) => setForm({ ...form, recipient_name: e.target.value })}
                placeholder="GP, NDIS Auditor, Family..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Date Signed</Label>
              <Input
                type="date"
                value={form.participant_signed_date}
                onChange={(e) => setForm({ ...form, participant_signed_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Review Date</Label>
              <Input
                type="date"
                value={form.review_date}
                onChange={(e) => setForm({ ...form, review_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.consent_end_date}
                onChange={(e) => setForm({ ...form, consent_end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="rounded-xl border border-[#C084FC] bg-[#F5F0FF] p-3 space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Date-Stamped, Time-Stamped &amp; User-Linked Digital Signatures
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div>
                <Label>Participant Digital Signature</Label>
                <Input
                  value={form.participant_signature}
                  onChange={(e) => setForm({ ...form, participant_signature: e.target.value })}
                  placeholder="Typed digital signature"
                />
              </div>
              <div>
                <Label>Guardian / Representative Signature</Label>
                <Input
                  value={form.guardian_signature}
                  onChange={(e) => setForm({ ...form, guardian_signature: e.target.value })}
                  placeholder="If signed by guardian/nominee"
                />
              </div>
              <div>
                <Label>Witness Name &amp; Signature</Label>
                <Input
                  value={form.witness_name}
                  onChange={(e) =>
                    setForm({ ...form, witness_name: e.target.value, witness_signature: e.target.value })
                  }
                  placeholder="Witness full name"
                />
              </div>
              <div>
                <Label>Provider Approval Signature</Label>
                <Input
                  value={form.approval_signature}
                  onChange={(e) => setForm({ ...form, approval_signature: e.target.value })}
                  placeholder="Approving manager signature"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5">
            <div>
              <div className="font-bold text-[#0A2B6D]">Supporting Document / Signed Consent Evidence</div>
              <div className="text-[11px] text-muted-foreground">
                {form.signed_form_name || 'Upload signed PDF or image evidence (stored privately)'}
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold text-white">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>{uploadingFile ? 'Uploading...' : 'Attach Evidence'}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => onUploadEvidence(e.target.files?.[0], 'participant')}
              />
            </label>
          </div>

          <Button onClick={onSave} disabled={saving}>
            {editingId ? 'Save Updated Consent' : 'Record & Stamp Participant Consent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EmployeeConsentDialog({
  open,
  onOpenChange,
  editingId,
  form,
  setForm,
  employees,
  consentTypes,
  uploadingFile,
  onUploadEvidence,
  onSave,
  saving,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingId ? 'Update Employee Consent' : 'Record Employee Consent (12 Workforce Categories)'}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 text-xs">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Select Staff Member</Label>
              <select
                value={form.employee_id}
                onChange={(e) => {
                  const emp = employees.find((x) => x.id === e.target.value);
                  setForm((f) => ({
                    ...f,
                    employee_id: e.target.value,
                    employee_name: emp?.full_name || f.employee_name,
                    employee_email: emp?.email || f.employee_email,
                    signed_by: emp?.full_name || f.signed_by,
                  }));
                }}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="">Select employee or type below</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Employee Name *</Label>
              <Input
                value={form.employee_name}
                onChange={(e) => setForm({ ...form, employee_name: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <Label>Employee Consent Type (12 Categories) *</Label>
              <select
                value={form.consent_type}
                onChange={(e) => setForm({ ...form, consent_type: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
              >
                {consentTypes.map((ct) => (
                  <option key={ct} value={ct}>
                    {ct}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Auditor Visibility Permission</Label>
              <select
                value={form.audit_consent}
                onChange={(e) => setForm({ ...form, audit_consent: e.target.value })}
                className="mt-1 w-full rounded-md border border-input bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="Audit consent received">Audit consent received</option>
                <option value="Audit declined">Audit declined (Restricted)</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Consent Description</Label>
            <Textarea
              rows={2}
              value={form.consent_description}
              onChange={(e) => setForm({ ...form, consent_description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <Label>Date Signed</Label>
              <Input
                type="date"
                value={form.date_signed}
                onChange={(e) => setForm({ ...form, date_signed: e.target.value })}
              />
            </div>
            <div>
              <Label>Review Date</Label>
              <Input
                type="date"
                value={form.review_date}
                onChange={(e) => setForm({ ...form, review_date: e.target.value })}
              />
            </div>
            <div>
              <Label>Expiry Date</Label>
              <Input
                type="date"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 rounded-xl border border-[#C084FC] bg-[#F5F0FF] p-3">
            <div>
              <Label>Employee Signature</Label>
              <Input
                value={form.employee_signature}
                onChange={(e) => setForm({ ...form, employee_signature: e.target.value })}
                placeholder="Typed signature"
              />
            </div>
            <div>
              <Label>Witness Signature</Label>
              <Input
                value={form.witness_name}
                onChange={(e) =>
                  setForm({ ...form, witness_name: e.target.value, witness_signature: e.target.value })
                }
                placeholder="Witness name"
              />
            </div>
            <div>
              <Label>Approval Signature</Label>
              <Input
                value={form.approval_signature}
                onChange={(e) => setForm({ ...form, approval_signature: e.target.value })}
                placeholder="HR / Manager approval"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5">
            <div>
              <div className="font-bold text-[#0A2B6D]">Supporting Evidence</div>
              <div className="text-[11px] text-muted-foreground">
                {form.supporting_evidence_name || 'Upload signed employee consent form (stored privately)'}
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold text-white">
              <UploadCloud className="h-3.5 w-3.5" />
              <span>{uploadingFile ? 'Uploading...' : 'Attach Evidence'}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => onUploadEvidence(e.target.files?.[0], 'employee')}
              />
            </label>
          </div>

          <Button onClick={onSave} disabled={saving}>
            {editingId ? 'Save Employee Consent' : 'Record & Stamp Employee Consent'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}