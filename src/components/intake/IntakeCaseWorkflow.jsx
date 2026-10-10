import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { Field, TextArea, TextInput, Select, DateInput, Checkbox } from '@/components/Field';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import {
  CheckCircle2,
  FileWarning,
  Loader2,
  Plus,
  UploadCloud,
  UserCheck,
} from 'lucide-react';
import {
  INTAKE_FILE_ACCEPT,
  businessDateTime,
  canonicalIntakeDocumentType,
  createProfileId,
  findIntakeDuplicate,
  intakeReadiness,
  validateIntakeFile,
} from '@/lib/intakeCases';

const PARTICIPANT_BLANK = {
  applicant_name: '',
  date_of_birth: '',
  email: '',
  phone: '',
  address: '',
  ndis_number: '',
  preferred_name_pronouns: '',
  primary_contact: '',
  communication_needs: '',
  requested_supports: '',
  reason_for_referral: '',
  current_supports: '',
  goals_preferences: '',
  health_summary: '',
  risk_summary: '',
  emergency_contact: '',
  emergency_contact_1_name: '',
  emergency_contact_1_relationship: '',
  emergency_contact_1_phone: '',
  emergency_contact_2_name: '',
  emergency_contact_2_relationship: '',
  emergency_contact_2_phone: '',
  representative_details: '',
  plan_type: 'Plan Managed',
  plan_start_date: '',
  plan_end_date: '',
  plan_manager: '',
  support_coordinator: '',
  medication_support_required: false,
  mealtime_support_required: false,
  behaviour_support_required: false,
  restrictive_practice_identified: false,
  referral_source: '',
  target_start_date: '',
  service_fit: 'Pending',
  privacy_consent: false,
  notes: '',
};

const EMPLOYEE_BLANK = {
  ...PARTICIPANT_BLANK,
  ndis_number: '',
  employee_role: 'Support Worker (JR)',
  position: '',
  workplace_adjustments: '',
};

const EMPLOYEE_ROLES = [
  'Support Worker (JR)',
  'Support Worker (SR)',
  'Team Leader',
  'Compliance Manager',
  'Administration',
  'Management',
];

const TERMINAL_STATUSES = new Set(['Converted to Profile', 'Declined', 'Withdrawn']);

const STATUS_CLASS = {
  Draft: 'bg-primary/10 text-primary',
  'Information Required': 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  'Ready for Review': 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  Approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  'Converted to Profile': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  Declined: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
  Withdrawn: 'bg-muted text-muted-foreground',
};

function mapStaffRole(employeeRole) {
  const value = String(employeeRole || '');
  if (value.includes('Team Leader')) return 'Team Leader';
  if (value.includes('Compliance')) return 'Compliance Manager';
  if (value.includes('Administration')) return 'Administration';
  if (value.includes('Management')) return 'Management';
  return 'Support Worker';
}

export default function IntakeCaseWorkflow({ intakeType }) {
  const { user } = useRole();
  const { toast } = useToast();
  const [cases, setCases] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(intakeType === 'Participant' ? PARTICIPANT_BLANK : EMPLOYEE_BLANK);
  const [busy, setBusy] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');

  const activeCase = cases.find((record) => record.id === activeCaseId) || null;
  const readiness = useMemo(() => intakeReadiness(activeCase), [activeCase]);
  const activeDocs = documents.filter((doc) => doc.intake_case_id === activeCaseId);

  const load = useCallback(async (preferredId = '') => {
    const [casePage, profilePage, docPage] = await Promise.all([
      base44.entities.IntakeCase.filter({ intake_type: intakeType }, { sort: '-created_date', limit: 200 }),
      intakeType === 'Participant'
        ? base44.entities.ParticipantProfile.filter({}, { sort: '-created_date', limit: 200 })
        : base44.entities.StaffProfile.filter({}, { sort: '-created_date', limit: 200 }),
      base44.entities.IntakeDocument.filter({ intake_type: intakeType }, { sort: '-created_date', limit: 500 }),
    ]);
    const docsByCase = new Map();
    docPage.items.forEach((doc) => {
      if (!doc.intake_case_id || !doc.document_type) return;
      if (!docsByCase.has(doc.intake_case_id)) docsByCase.set(doc.intake_case_id, new Set());
      docsByCase.get(doc.intake_case_id).add(canonicalIntakeDocumentType(doc.document_type));
    });
    const hydrated = casePage.items.map((record) => ({
      ...record,
      completed_document_types: Array.from(new Set([
        ...(record.completed_document_types || []),
        ...(docsByCase.get(record.id) || []),
      ])),
    }));
    setCases(hydrated);
    setProfiles(profilePage.items);
    setDocuments(docPage.items);
    const nextId = preferredId
      || (hydrated.some((record) => record.id === activeCaseId) ? activeCaseId : '')
      || hydrated.find((record) => !TERMINAL_STATUSES.has(record.status))?.id
      || '';
    setActiveCaseId(nextId);
  }, [intakeType, activeCaseId]);

  useEffect(() => { load(); }, [intakeType]);

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const createCase = async () => {
    if (!form.applicant_name.trim() || !form.date_of_birth) {
      toast({ title: 'Name and date of birth are required', variant: 'destructive' });
      return;
    }
    if (!form.email.trim() && !form.phone.trim()) {
      toast({ title: 'Email or phone is required', variant: 'destructive' });
      return;
    }
    if (!form.privacy_consent) {
      toast({ title: 'Privacy consent is required before collecting intake records', variant: 'destructive' });
      return;
    }
    const duplicate = findIntakeDuplicate(form, profiles, cases);
    if (duplicate) {
      toast({ title: 'Possible duplicate stopped', description: duplicate, variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const { date } = businessDateTime();
      const intakeDetails = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== '' && value !== undefined),
      );
      const created = await base44.entities.IntakeCase.create({
        ...intakeDetails,
        applicant_name: form.applicant_name.trim(),
        case_number: createProfileId(cases, 'case_number', intakeType === 'Participant' ? 'PIC' : 'EIC'),
        intake_type: intakeType,
        referral_date: date,
        assigned_to: user?.full_name || user?.email || 'Intake team',
        status: 'Draft',
        completed_document_types: [],
        ...(intakeType === 'Employee' && form.recognition_dashboard_consent
          ? { recognition_dashboard_consent_date: date }
          : {}),
      });
      setCases((current) => [created, ...current]);
      setActiveCaseId(created.id);
      setForm(intakeType === 'Participant' ? PARTICIPANT_BLANK : EMPLOYEE_BLANK);
      setShowNew(false);
      try {
        await base44.entities.AuditLog.create({
          action: 'Create',
          entity_type: 'IntakeCase',
          record_id: created.id,
          record_title: created.applicant_name,
          performed_by: user?.full_name || user?.email || 'ComplianceHR user',
          details: `${intakeType} intake case ${created.case_number} opened`,
        });
      } catch (auditError) {
        console.error('Intake audit logging failed', auditError);
      }
      toast({ title: `Intake case ${created.case_number} opened` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to create intake case', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const updateCase = async (updates, message) => {
    if (!activeCase) return;
    setBusy(true);
    try {
      await base44.entities.IntakeCase.update(activeCase.id, updates);
      setCases((current) => current.map((record) => (
        record.id === activeCase.id ? { ...record, ...updates } : record
      )));
      if (message) toast({ title: message });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to update intake case', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const moveToReview = async () => {
    if (!readiness.ready) {
      await updateCase({
        status: 'Information Required',
        outstanding_actions: `Missing: ${readiness.missing.join(', ')}`,
      }, 'Case marked as information required');
      return;
    }
    await updateCase({ status: 'Ready for Review', outstanding_actions: '' }, 'Case is ready for review');
  };

  const approve = async () => {
    if (!readiness.ready) {
      toast({ title: 'Intake is not ready', description: readiness.missing.join(', '), variant: 'destructive' });
      return;
    }
    const { date } = businessDateTime();
    await updateCase({
      status: 'Approved',
      reviewer: user?.full_name || user?.email || 'ComplianceHR reviewer',
      reviewed_date: date,
    }, 'Intake approved');
  };

  const convertToProfile = async () => {
    if (!activeCase || activeCase.status !== 'Approved') return;
    const duplicate = findIntakeDuplicate(activeCase, profiles, cases);
    if (duplicate) {
      toast({ title: 'Conversion stopped', description: duplicate, variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const { date } = businessDateTime();
      let profile;
      if (intakeType === 'Participant') {
        profile = await base44.entities.ParticipantProfile.create({
          full_name: activeCase.applicant_name,
          date_of_birth: activeCase.date_of_birth || '',
          email: activeCase.email || '',
          phone: activeCase.phone || '',
          address: activeCase.address || '',
          ndis_number: activeCase.ndis_number || '',
          support_coordinator: activeCase.support_coordinator || '',
          status: 'Active',
          notes: [
            activeCase.notes,
            activeCase.referral_source ? `Referral source: ${activeCase.referral_source}` : '',
            activeCase.primary_contact ? `Primary contact: ${activeCase.primary_contact}` : '',
            activeCase.emergency_contact_1_name
              ? `Emergency contact 1: ${activeCase.emergency_contact_1_name} (${activeCase.emergency_contact_1_relationship || ''}) ${activeCase.emergency_contact_1_phone || ''}`
              : '',
            activeCase.emergency_contact_2_name
              ? `Emergency contact 2: ${activeCase.emergency_contact_2_name} (${activeCase.emergency_contact_2_relationship || ''}) ${activeCase.emergency_contact_2_phone || ''}`
              : '',
            activeCase.plan_type ? `Plan type: ${activeCase.plan_type}${activeCase.plan_manager ? `, managed by ${activeCase.plan_manager}` : ''}` : '',
            activeCase.requested_supports ? `Requested supports: ${activeCase.requested_supports}` : '',
            activeCase.communication_needs ? `Communication needs: ${activeCase.communication_needs}` : '',
            activeCase.health_summary ? `Health summary: ${activeCase.health_summary}` : '',
            activeCase.risk_summary ? `Risks and safeguards: ${activeCase.risk_summary}` : '',
            activeCase.representative_details ? `Representative / advocate: ${activeCase.representative_details}` : '',
          ].filter(Boolean).join('\n'),
        });
      } else {
        profile = await base44.entities.StaffProfile.create({
          full_name: activeCase.applicant_name,
          email: activeCase.email || '',
          phone: activeCase.phone || '',
          address: activeCase.address || '',
          date_of_birth: activeCase.date_of_birth || '',
          role: mapStaffRole(activeCase.employee_role),
          position: activeCase.position || '',
          start_date: activeCase.target_start_date || date,
          status: 'Active',
          supervisor: '',
          emergency_contact: [
            activeCase.emergency_contact_1_name || activeCase.emergency_contact,
            activeCase.emergency_contact_1_phone,
          ].filter(Boolean).join(' - '),
          notes: [
            activeCase.notes,
            activeCase.workplace_adjustments ? `Workplace adjustments: ${activeCase.workplace_adjustments}` : '',
          ].filter(Boolean).join('\n'),
        });
      }
      await base44.entities.IntakeDocument.updateMany(
        { intake_case_id: activeCase.id },
        { $set: { profile_id: profile.id } },
      );
      await base44.entities.IntakeCase.update(activeCase.id, {
        status: 'Converted to Profile',
        related_profile_id: profile.id,
        converted_date: date,
        outstanding_actions: '',
      });
      try {
        await base44.entities.AuditLog.create({
          action: 'Create',
          entity_type: intakeType === 'Participant' ? 'ParticipantProfile' : 'StaffProfile',
          record_id: profile.id,
          record_title: activeCase.applicant_name,
          performed_by: user?.full_name || user?.email || 'ComplianceHR user',
          details: `Created from intake case ${activeCase.case_number}`,
        });
      } catch (auditError) {
        console.error('Conversion audit logging failed', auditError);
      }
      await load(activeCase.id);
      toast({ title: `${activeCase.applicant_name} converted to a profile` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to convert intake case', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const uploadDocument = async (docType, file) => {
    if (!activeCase || !file) return;
    const validationError = validateIntakeFile(file);
    if (validationError) {
      toast({ title: 'File not accepted', description: validationError, variant: 'destructive' });
      return;
    }
    setUploadingDoc(docType);
    try {
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const canonical = canonicalIntakeDocumentType(docType);
      await base44.entities.IntakeDocument.create({
        intake_case_id: activeCase.id,
        intake_case_number: activeCase.case_number,
        intake_type: intakeType,
        document_type: canonical,
        file_name: file.name,
        file_uri,
        uploaded_by: user?.full_name || user?.email || 'Intake team',
        uploaded_date: businessDateTime().date,
      });
      const completed = Array.from(new Set([
        ...(activeCase.completed_document_types || []),
        canonical,
      ]));
      await base44.entities.IntakeCase.update(activeCase.id, { completed_document_types: completed });
      await load(activeCase.id);
      toast({ title: `${canonical} uploaded to ${activeCase.case_number}` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Upload failed', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingDoc('');
    }
  };

  const viewDocument = async (doc) => {
    try {
      const { signed_url } = await base44.integrations.Core.CreateFileSignedUrl({ file_uri: doc.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      toast({ title: 'Unable to open document', description: error.message, variant: 'destructive' });
    }
  };

  const removeDocument = async (doc) => {
    if (!activeCase) return;
    setBusy(true);
    try {
      await base44.entities.IntakeDocument.delete(doc.id);
      const remaining = activeDocs.filter((d) => d.id !== doc.id).map((d) => canonicalIntakeDocumentType(d.document_type));
      await base44.entities.IntakeCase.update(activeCase.id, { completed_document_types: remaining });
      await load(activeCase.id);
      toast({ title: `${doc.document_type} removed from ${activeCase.case_number}` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to remove document', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const docForCheck = (label) => activeDocs.find(
    (doc) => canonicalIntakeDocumentType(doc.document_type) === label,
  );

  const newForm = (
    <form
      onSubmit={(event) => { event.preventDefault(); createCase(); }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <Field label="Applicant full name *" className="sm:col-span-2">
        <TextInput required value={form.applicant_name} onChange={(e) => setValue('applicant_name', e.target.value)} />
      </Field>
      <Field label="Date of birth *"><DateInput required value={form.date_of_birth} onChange={(e) => setValue('date_of_birth', e.target.value)} /></Field>
      <Field label="Email"><TextInput type="email" value={form.email} onChange={(e) => setValue('email', e.target.value)} /></Field>
      <Field label="Phone"><TextInput type="tel" value={form.phone} onChange={(e) => setValue('phone', e.target.value)} /></Field>
      <Field label="Address"><TextInput value={form.address} onChange={(e) => setValue('address', e.target.value)} /></Field>
      {intakeType === 'Participant' ? (
        <>
          <Field label="NDIS number"><TextInput value={form.ndis_number} onChange={(e) => setValue('ndis_number', e.target.value)} /></Field>
          <Field label="Preferred name and pronouns"><TextInput value={form.preferred_name_pronouns} onChange={(e) => setValue('preferred_name_pronouns', e.target.value)} /></Field>
          <Field label="Primary contact / nominee"><TextInput value={form.primary_contact} onChange={(e) => setValue('primary_contact', e.target.value)} /></Field>
          <Field label="Representative / advocate"><TextInput value={form.representative_details} onChange={(e) => setValue('representative_details', e.target.value)} /></Field>
        </>
      ) : (
        <>
          <Field label="Employee role">
            <Select value={form.employee_role} onChange={(e) => setValue('employee_role', e.target.value)}>
              {EMPLOYEE_ROLES.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <Field label="Position"><TextInput value={form.position} onChange={(e) => setValue('position', e.target.value)} /></Field>
          <Field label="Medical alerts, allergies or workplace adjustments" className="sm:col-span-2">
            <TextArea value={form.workplace_adjustments} onChange={(e) => setValue('workplace_adjustments', e.target.value)} />
          </Field>
          <Field label="Employee recognition dashboard consent" className="sm:col-span-2">
            <Checkbox
              checked={form.recognition_dashboard_consent}
              onChange={(e) => setValue('recognition_dashboard_consent', e.target.checked)}
              label="Yes - the employee consents to being displayed on the recognition dashboard"
            />
          </Field>
        </>
      )}
      <div className="rounded-xl border border-border bg-muted/30 p-3 sm:col-span-2">
        <h4 className="mb-3 text-sm font-bold">Emergency Contact 1</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Full name"><TextInput value={form.emergency_contact_1_name} onChange={(e) => setValue('emergency_contact_1_name', e.target.value)} /></Field>
          <Field label="Relationship"><TextInput value={form.emergency_contact_1_relationship} onChange={(e) => setValue('emergency_contact_1_relationship', e.target.value)} /></Field>
          <Field label="Phone number"><TextInput type="tel" value={form.emergency_contact_1_phone} onChange={(e) => setValue('emergency_contact_1_phone', e.target.value)} /></Field>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-muted/30 p-3 sm:col-span-2">
        <h4 className="mb-3 text-sm font-bold">Emergency Contact 2</h4>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Full name"><TextInput value={form.emergency_contact_2_name} onChange={(e) => setValue('emergency_contact_2_name', e.target.value)} /></Field>
          <Field label="Relationship"><TextInput value={form.emergency_contact_2_relationship} onChange={(e) => setValue('emergency_contact_2_relationship', e.target.value)} /></Field>
          <Field label="Phone number"><TextInput type="tel" value={form.emergency_contact_2_phone} onChange={(e) => setValue('emergency_contact_2_phone', e.target.value)} /></Field>
        </div>
      </div>
      {intakeType === 'Participant' && (
        <>
          <Field label="Communication and accessibility needs" className="sm:col-span-2">
            <TextArea value={form.communication_needs} onChange={(e) => setValue('communication_needs', e.target.value)} />
          </Field>
          <Field label="Requested supports" className="sm:col-span-2">
            <TextArea value={form.requested_supports} onChange={(e) => setValue('requested_supports', e.target.value)} />
          </Field>
          <Field label="Reason for referral"><TextArea value={form.reason_for_referral} onChange={(e) => setValue('reason_for_referral', e.target.value)} /></Field>
          <Field label="Current supports and living arrangements"><TextArea value={form.current_supports} onChange={(e) => setValue('current_supports', e.target.value)} /></Field>
          <Field label="Strengths, preferences and goals"><TextArea value={form.goals_preferences} onChange={(e) => setValue('goals_preferences', e.target.value)} /></Field>
          <Field label="Health, medication and allergies"><TextArea value={form.health_summary} onChange={(e) => setValue('health_summary', e.target.value)} /></Field>
          <Field label="Risks and immediate safeguards" className="sm:col-span-2">
            <TextArea value={form.risk_summary} onChange={(e) => setValue('risk_summary', e.target.value)} />
          </Field>
          <Field label="Plan type">
            <Select value={form.plan_type} onChange={(e) => setValue('plan_type', e.target.value)}>
              <option>Plan Managed</option>
              <option>Self Managed</option>
              <option>NDIA Managed</option>
            </Select>
          </Field>
          <Field label="Plan manager"><TextInput value={form.plan_manager} onChange={(e) => setValue('plan_manager', e.target.value)} /></Field>
          <Field label="NDIS plan start"><DateInput value={form.plan_start_date} onChange={(e) => setValue('plan_start_date', e.target.value)} /></Field>
          <Field label="NDIS plan end"><DateInput value={form.plan_end_date} onChange={(e) => setValue('plan_end_date', e.target.value)} /></Field>
          <div className="grid gap-2 rounded-lg border border-border p-3 sm:col-span-2 sm:grid-cols-2">
            <Checkbox checked={form.medication_support_required} onChange={(e) => setValue('medication_support_required', e.target.checked)} label="Medication support required" />
            <Checkbox checked={form.mealtime_support_required} onChange={(e) => setValue('mealtime_support_required', e.target.checked)} label="Mealtime support required" />
            <Checkbox checked={form.behaviour_support_required} onChange={(e) => setValue('behaviour_support_required', e.target.checked)} label="Behaviour support required" />
            <Checkbox checked={form.restrictive_practice_identified} onChange={(e) => setValue('restrictive_practice_identified', e.target.checked)} label="Restrictive practice identified" />
          </div>
        </>
      )}
      <Field label="Referral source"><TextInput value={form.referral_source} onChange={(e) => setValue('referral_source', e.target.value)} /></Field>
      <Field label="Target start date"><DateInput value={form.target_start_date} onChange={(e) => setValue('target_start_date', e.target.value)} /></Field>
      <Field label="Eligibility / service fit">
        <Select value={form.service_fit} onChange={(e) => setValue('service_fit', e.target.value)}>
          <option>Pending</option>
          <option>Eligible</option>
          <option>Waitlist</option>
          <option>Not Suitable</option>
        </Select>
      </Field>
      <Field label="Notes"><TextArea value={form.notes} onChange={(e) => setValue('notes', e.target.value)} /></Field>
      <div className="sm:col-span-2">
        <Checkbox
          checked={form.privacy_consent}
          onChange={(e) => setValue('privacy_consent', e.target.checked)}
          label="Consent to collect and store intake information (required)"
        />
      </div>
      <div className="flex items-center justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
        <Button type="submit" disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Submit intake
        </Button>
      </div>
    </form>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <span className="font-semibold text-foreground">{cases.length}</span> {intakeType.toLowerCase()} intake cases
        </div>
        <Button onClick={() => setShowNew(true)}><Plus className="mr-2 h-4 w-4" /> New {intakeType.toLowerCase()} intake case</Button>
      </div>

      {cases.length === 0 && !showNew ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No {intakeType.toLowerCase()} intake cases yet.</CardContent></Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
          <div className="space-y-2">
            {cases.map((record) => {
              const score = intakeReadiness(record).score;
              return (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => setActiveCaseId(record.id)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors ${
                    record.id === activeCaseId ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold">{record.applicant_name}</span>
                    <span className="shrink-0 text-xs font-bold text-primary">{score}%</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="text-xs text-foreground/50">{record.case_number}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[record.status] || 'bg-muted text-muted-foreground'}`}>
                      {record.status}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {activeCase && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold">{activeCase.applicant_name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[activeCase.status]}`}>{activeCase.status}</span>
                <span className="text-xs text-foreground/50">{activeCase.case_number}</span>
              </div>

              <div className="grid gap-3 rounded-xl border border-border p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div><span className="text-foreground/45">DOB</span><div className="font-medium">{activeCase.date_of_birth ? format(new Date(activeCase.date_of_birth), 'd MMM yyyy') : 'Not provided'}</div></div>
                <div><span className="text-foreground/45">Email</span><div className="font-medium">{activeCase.email || 'Not provided'}</div></div>
                <div><span className="text-foreground/45">Phone</span><div className="font-medium">{activeCase.phone || 'Not provided'}</div></div>
                <div><span className="text-foreground/45">Address</span><div className="font-medium">{activeCase.address || 'Not provided'}</div></div>
                {intakeType === 'Participant' ? (
                  <>
                    <div><span className="text-foreground/45">NDIS number</span><div className="font-medium">{activeCase.ndis_number || 'Not provided'}</div></div>
                    <div><span className="text-foreground/45">Plan type</span><div className="font-medium">{activeCase.plan_type || 'Not set'}</div></div>
                  </>
                ) : (
                  <>
                    <div><span className="text-foreground/45">Role</span><div className="font-medium">{activeCase.employee_role || 'Not set'}</div></div>
                    <div><span className="text-foreground/45">Position</span><div className="font-medium">{activeCase.position || 'Not set'}</div></div>
                  </>
                )}
                <div><span className="text-foreground/45">Eligibility / service fit</span><div className="font-medium">{activeCase.service_fit || 'Pending'}</div></div>
                <div><span className="text-foreground/45">Referral source</span><div className="font-medium">{activeCase.referral_source || 'Not provided'}</div></div>
                <div><span className="text-foreground/45">Intake owner</span><div className="font-medium">{activeCase.assigned_to || 'Unassigned'}</div></div>
              </div>

              {activeCase.outstanding_actions && (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
                  {activeCase.outstanding_actions}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {!TERMINAL_STATUSES.has(activeCase.status) && activeCase.status !== 'Approved' && (
                  <Button variant="outline" size="sm" onClick={moveToReview} disabled={busy}>
                    {readiness.ready ? 'Mark ready for review' : 'Record missing information'}
                  </Button>
                )}
                {activeCase.status === 'Ready for Review' && (
                  <Button size="sm" onClick={approve} disabled={busy}>Approve intake</Button>
                )}
                {activeCase.status === 'Approved' && (
                  <Button size="sm" onClick={convertToProfile} disabled={busy}>
                    <UserCheck className="mr-1.5 h-4 w-4" /> Convert to {intakeType.toLowerCase()} profile
                  </Button>
                )}
                {!TERMINAL_STATUSES.has(activeCase.status) && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-900 dark:text-rose-300 dark:hover:bg-rose-950/30"
                      onClick={() => updateCase({ status: 'Declined', decision_reason: activeCase.outstanding_actions || 'Service fit decision recorded' }, 'Intake declined')}
                      disabled={busy}
                    >
                      Decline
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => updateCase({ status: 'Withdrawn' }, 'Intake withdrawn')} disabled={busy}>
                      Withdraw
                    </Button>
                  </>
                )}
              </div>

              <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wide text-foreground/45">Required documents</div>
                  {readiness.documentChecks.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No document requirements for this case.</p>
                  ) : (
                    readiness.documentChecks.map((check) => {
                      const doc = docForCheck(check.label);
                      return (
                        <div key={check.label} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-0 items-start gap-2">
                            {check.complete
                              ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              : <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />}
                            <div className="min-w-0">
                              <div className={`text-sm ${check.complete ? 'text-foreground/70' : 'font-medium'}`}>{check.label}</div>
                              {doc && <div className="text-xs text-foreground/45">{doc.file_name}</div>}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            {doc && (
                              <Button variant="outline" size="sm" onClick={() => viewDocument(doc)}>View</Button>
                            )}
                            {!TERMINAL_STATUSES.has(activeCase.status) && (
                              <label className="cursor-pointer">
                                <input
                                  type="file"
                                  accept={INTAKE_FILE_ACCEPT}
                                  className="hidden"
                                  onChange={async (event) => {
                                    await uploadDocument(check.label, event.target.files?.[0]);
                                    event.target.value = '';
                                  }}
                                  disabled={uploadingDoc === check.label || busy}
                                />
                                <span className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-medium hover:bg-accent">
                                  {uploadingDoc === check.label
                                    ? <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                    : <UploadCloud className="h-3.5 w-3.5" />}
                                  Upload
                                </span>
                              </label>
                            )}
                            {doc && !TERMINAL_STATUSES.has(activeCase.status) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive"
                                onClick={() => removeDocument(doc)}
                                disabled={busy}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <aside className="h-fit rounded-xl border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold">Intake readiness</span>
                    <span className="text-lg font-bold text-primary">{readiness.score}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${readiness.score}%` }} />
                  </div>
                  <p className="mt-3 text-[10px] leading-relaxed text-foreground/45">
                    Readiness supports NDIS onboarding controls and conditional safeguards. It does not replace provider-specific legal advice or an external certification audit.
                  </p>
                  {[
                    ['Required information', readiness.informationChecks],
                    ['Required documents', readiness.documentChecks],
                  ].map(([heading, checks]) => (
                    <div key={heading} className="mt-4 space-y-1.5">
                      <div className="text-[10px] font-bold uppercase tracking-wide text-foreground/45">{heading}</div>
                      {checks.map((check) => (
                        <div key={check.label} className="flex items-start gap-2 text-xs">
                          {check.complete
                            ? <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            : <FileWarning className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />}
                          <span className={check.complete ? 'text-foreground/65' : 'font-medium'}>{check.label}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </aside>
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New {intakeType.toLowerCase()} intake case</DialogTitle>
          </DialogHeader>
          {newForm}
        </DialogContent>
      </Dialog>
    </div>
  );
}