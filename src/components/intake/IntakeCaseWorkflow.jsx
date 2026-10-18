import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { Field, TextArea, TextInput, Select, DateInput, Checkbox } from '@/components/Field';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { format } from 'date-fns';
import { Download, ExternalLink, Pencil } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { routeDocument } from '@/lib/documentRouting';
import { buildFilledFormDoc } from '@/lib/participantFormPdf';
import { EMPLOYEE_FORM_DEFINITIONS } from '@/lib/employeeFormDefinitions';
import {
  buildIntakeAutofilledAnswers,
  canCompleteIntakeFormOnline,
  intakeFormDefinition,
} from '@/lib/intakeOnlineForms';
import {
  CheckCircle2,
  FileWarning,
  Loader2,
  Plus,
  UploadCloud,
  UserCheck,
} from 'lucide-react';
import { downloadOriginalDocument } from '@/lib/documentDownloads';
import IntakeCaseForm, { IntakeReadinessPanel, SUPPORT_OPTIONS } from '@/components/intake/IntakeCaseForm';
import IntakeLogPanels from '@/components/intake/IntakeLogPanels';
import { downloadBlankFormPdf } from '@/lib/formsLibraryPdf';
import { SPECIAL_DOCUMENT_BUILDERS } from '@/lib/intakeSpecialDocuments';
import { EMPLOYEE_FORM_CODES, EMPLOYEE_FORM_FILES } from '@/lib/employeeDocuments';
import { PARTICIPANT_FORM_DEFINITIONS, PARTICIPANT_FORM_FILES, PARTICIPANT_FORM_META } from '@/lib/participantDocuments';
import {
  ACK_KEEP_DOWNLOAD_DOC_TYPES,
  DOWNLOAD_ONLY_DOC_TYPES,
  INTAKE_FILE_ACCEPT,
  LEGISLATION_ACK_DOC_TYPES,
  TRAINING_DOC_LINKS,
  TRAINING_REGISTER_DOC_TYPES,
  UPLOAD_ONLY_DOC_TYPES,
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
  ndis_reference_number: '',
  preferred_name: '',
  likes: '',
  dislikes: '',
  support_type_requested: '',
  shift_dates: '',
  shift_times: '',
  shift_contact_phone: '',
  travel_assistance_required: false,
  pets_on_property: false,
  occupational_therapist: '',
  speech_therapist: '',
  physiotherapist: '',
  other_services: '',
  preferred_workers_description: '',
  risks_identified: '',
  control_measures: '',
  medical_diagnosis: '',
  medications_dosage: '',
  special_meals_diets: '',
  advocate_name: '',
  advocate_relationship: '',
  advocate_phone: '',
  advocate_email: '',
  advocate_contact: '',
  consent_to_share_persons: '',
  gender: '',
  language_spoken: '',
  interpreter_required: false,
  cultural_background: '',
  guardian_name: '',
  guardian_contact: '',
  guardian_consent: false,
  gp_name: '',
  gp_contact: '',
  funding_categories: '',
  transport_needs: '',
  ndis_plan_goals: '',
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
  has_representative: 'No',
  representative_name: '',
  representative_relationship: '',
  representative_phone: '',
  representative_email: '',
  medicare_card_number: '',
  medicare_irn: '',
  medicare_expiry: '',
  doctor_name: '',
  doctor_phone: '',
  doctor_email: '',
  doctor_address: '',
  specialist_name: '',
  specialist_phone: '',
  specialist_email: '',
  specialist_address: '',
  current_medications: '',
  meal_plan_management_plan: '',
  information_sharing_consent: 'Consent declined',
  plan_type: 'Plan Managed',
  plan_start_date: '',
  plan_end_date: '',
  plan_manager: '',
  plan_manager_phone: '',
  plan_manager_email: '',
  support_coordinator: '',
  support_coordinator_phone: '',
  support_coordinator_email: '',
  medication_support_required: false,
  mealtime_support_required: false,
  behaviour_support_required: false,
  restrictive_practice_identified: false,
  referral_source: '',
  target_start_date: '',
  service_fit: 'Pending',
  privacy_consent: false,
  audit_consent_agreed: false,
  notes: '',
};

const EMPLOYEE_BLANK = {
  ...PARTICIPANT_BLANK,
  ndis_number: '',
  employee_role: 'Support Worker (JR)',
  employee_id_number: '',
  preferred_name: '',
  workplace_adjustments: '',
  allergies: '',
  medical_conditions: '',
  referee_1_name: '',
  referee_1_phone: '',
  referee_1_email: '',
  referee_2_name: '',
  referee_2_phone: '',
  referee_2_email: '',
  office_use_notes: '',
  buddy_shift_date: '',
  buddy_shift_time: '',
  buddy_shift_other_employee: '',
  current_employment_status: '',
  years_experience: '',
  right_to_work: false,
  drivers_licence: false,
  own_vehicle: false,
  wwcc_number: '',
  ndis_worker_screening_number: '',
  first_aid_current: false,
  previous_employer: '',
  previous_employer_phone: '',
  previous_employer_email: '',
  referees: '',
  availability: '',
  why_apply: '',
  banking_details: '',
  superannuation_details: '',
  tax_file_number: '',
  current_rego: '',
  rego_number: '',
  qualifications_certificates: '',
  weekly_hours_goal: '',
  employment_provider: '',
  hobbies_interests: '',
  supports_to_provide: [],
  has_representative: '',
  information_sharing_consent: '',
};

const generateEmployeeNumber = () => `EMP${Math.floor(100000 + Math.random() * 900000)}`;

const TERMINAL_STATUSES = new Set(['Converted to Profile', 'Declined', 'Withdrawn']);

const initials = (name) => String(name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
const scoreTone = (score) => (score >= 90 ? 'text-emerald-600' : score >= 50 ? 'text-amber-500' : 'text-rose-500');

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
  const [exporting, setExporting] = useState(false);

  const exportRegister = async () => {
    setExporting(true);
    try {
      const page = await base44.entities.IntakeCase.filter(
        { intake_type: intakeType }, { sort: '-created_date', limit: 500 },
      );
      const columns = [
        { key: 'case_number', label: 'Case Number' },
        { key: 'applicant_name', label: 'Applicant Name' },
        { key: 'intake_type', label: 'Intake Type' },
        { key: 'status', label: 'Status' },
        { key: 'service_fit', label: 'Eligibility / Service Fit' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'assigned_to', label: 'Intake Owner' },
        { key: 'reviewer', label: 'Reviewer' },
        { key: 'referral_date', label: 'Referral Date' },
        { key: 'target_start_date', label: 'Proposed Start Date' },
        { key: 'date_completed', label: 'Date Completed' },
        { key: 'converted_date', label: 'Converted Date' },
        { key: 'privacy_consent', label: 'Privacy Consent' },
        { key: 'audit_consent', label: 'Audit Consent' },
        { key: 'decision_reason', label: 'Decision Reason' },
        { key: 'created_date', label: 'Created' },
      ];
      const rows = page.items.map((c) => ({
        ...c,
        privacy_consent: c.privacy_consent ? 'Yes' : 'No',
      }));
      downloadCsv(`${intakeType.toLowerCase()}-intake-register.csv`, columns, rows);
      toast({ title: 'Register exported', description: `${rows.length} intake case(s) downloaded as CSV.` });
    } catch (error) {
      toast({ title: 'Export failed', description: error.message, variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };
  const [profiles, setProfiles] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [activeCaseId, setActiveCaseId] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState(intakeType === 'Participant' ? PARTICIPANT_BLANK : EMPLOYEE_BLANK);
  const [busy, setBusy] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState('');
  const [downloadingTemplate, setDownloadingTemplate] = useState('');
  const [onlineForm, setOnlineForm] = useState(null);
  const [showOnline, setShowOnline] = useState(false);
  const [submittingOnline, setSubmittingOnline] = useState(false);
  const [answersBank, setAnswersBank] = useState({});
  const [ackForm, setAckForm] = useState(null);
  const [showAck, setShowAck] = useState(false);
  const [submittingAck, setSubmittingAck] = useState(false);
  const [refereeCheck, setRefereeCheck] = useState({ checked_by: '', date: '', time: '', outcome: '' });
  const [buddyShift, setBuddyShift] = useState({ date: '', time: '', other_employee: '', notes: '' });

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

  // Load the company name and logo from Company Safe so generated
  // intake forms are branded in the header.
  useEffect(() => { loadCompanyBranding().catch(() => {}); }, []);

  const setValue = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const toggleSupport = (option) => setForm((current) => {
    const selected = new Set(current.supports_to_provide || []);
    if (selected.has(option)) {
      selected.delete(option);
    } else {
      selected.add(option);
      if (option === 'All supports') SUPPORT_OPTIONS.forEach((support) => selected.add(support));
    }
    return { ...current, supports_to_provide: Array.from(selected) };
  });

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
      const { date, time } = businessDateTime();
      const consentBy = user?.full_name || user?.email || 'Intake team';
      const intakeDetails = Object.fromEntries(
        Object.entries(form).filter(([, value]) => value !== '' && value !== undefined),
      );
      delete intakeDetails.audit_consent_agreed;
      const created = await base44.entities.IntakeCase.create({
        ...intakeDetails,
        applicant_name: form.applicant_name.trim(),
        audit_consent: form.audit_consent_agreed ? 'Audit consent received' : 'Audit declined',
        audit_consent_by: consentBy,
        audit_consent_date: date,
        audit_consent_time: time,
        date_completed: date,
        privacy_consent_by: form.privacy_consent ? consentBy : '',
        privacy_consent_date: form.privacy_consent ? date : '',
        privacy_consent_time: form.privacy_consent ? time : '',
        case_number: createProfileId(cases, 'case_number', intakeType === 'Participant' ? 'PIC' : 'EIC'),
        ...(intakeType === 'Employee'
          ? { employee_id_number: String(form.employee_id_number || '').trim() || generateEmployeeNumber() }
          : {}),
        intake_type: intakeType,
        referral_date: date,
        assigned_to: user?.full_name || user?.email || 'Intake team',
        status: 'Draft',
        completed_document_types: [],
        ...(intakeType === 'Employee' && form.recognition_dashboard_consent
          ? {
              recognition_dashboard_consent_date: date,
              recognition_dashboard_consent_by: consentBy,
              recognition_dashboard_consent_time: time,
            }
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
          ndis_reference_number: activeCase.ndis_reference_number || '',
          support_coordinator: activeCase.support_coordinator || '',
          support_coordinator_phone: activeCase.support_coordinator_phone || '',
          support_coordinator_email: activeCase.support_coordinator_email || '',
          occupational_therapist: activeCase.occupational_therapist || '',
          support_type: activeCase.support_type_requested || '',
          support_shifts: [
            activeCase.shift_dates ? `Dates: ${activeCase.shift_dates}` : '',
            activeCase.shift_times ? `Times: ${activeCase.shift_times}` : '',
            activeCase.shift_contact_phone ? `Phone: ${activeCase.shift_contact_phone}` : '',
          ].filter(Boolean).join(' | '),
          medical_diagnosis: activeCase.medical_diagnosis || '',
          medications_dosage: activeCase.medications_dosage || '',
          risks: activeCase.risks_identified || '',
          control_measures: activeCase.control_measures || '',
          likes: activeCase.likes || '',
          dislikes: activeCase.dislikes || '',
          plan_manager: activeCase.plan_manager || '',
          plan_manager_phone: activeCase.plan_manager_phone || '',
          plan_manager_email: activeCase.plan_manager_email || '',
          current_medications: activeCase.medications_dosage || '',
          meal_plan_management_plan: activeCase.meal_plan_management_plan || '',
          medicare_card_number: activeCase.medicare_card_number || '',
          medicare_irn: activeCase.medicare_irn || '',
          medicare_expiry: activeCase.medicare_expiry || '',
          doctor_name: activeCase.doctor_name || '',
          doctor_phone: activeCase.doctor_phone || '',
          doctor_email: activeCase.doctor_email || '',
          doctor_address: activeCase.doctor_address || '',
          specialist_name: activeCase.specialist_name || '',
          specialist_phone: activeCase.specialist_phone || '',
          specialist_email: activeCase.specialist_email || '',
          specialist_address: activeCase.specialist_address || '',
          has_representative: activeCase.has_representative || 'No',
          representative_name: activeCase.representative_name || '',
          representative_relationship: activeCase.representative_relationship || '',
          representative_phone: activeCase.representative_phone || '',
          representative_email: activeCase.representative_email || '',
          information_sharing_consent_status: activeCase.information_sharing_consent || 'Consent declined',
          has_advocate: activeCase.advocate_name ? 'Yes' : 'No',
          advocate_name: activeCase.advocate_name || '',
          advocate_relationship: activeCase.advocate_relationship || '',
          advocate_phone: activeCase.advocate_phone || '',
          advocate_email: activeCase.advocate_email || '',
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
            activeCase.advocate_name ? `Advocate: ${activeCase.advocate_name} (${activeCase.advocate_contact || 'no contact details'})` : '',
            activeCase.speech_therapist ? `Speech therapist: ${activeCase.speech_therapist}` : '',
            activeCase.physiotherapist ? `Physiotherapist: ${activeCase.physiotherapist}` : '',
            activeCase.other_services ? `Other services: ${activeCase.other_services}` : '',
            activeCase.plan_manager ? `Plan manager: ${activeCase.plan_manager}` : '',
            activeCase.preferred_workers_description ? `Preferred workers: ${activeCase.preferred_workers_description}` : '',
            activeCase.special_meals_diets ? `Special meals or diets: ${activeCase.special_meals_diets}` : '',
            activeCase.consent_to_share_persons ? `Consent to share with: ${activeCase.consent_to_share_persons}` : '',
            activeCase.travel_assistance_required ? 'Wants assistance with travel' : '',
            `Pets on property: ${activeCase.pets_on_property ? 'Yes' : 'No'}`,
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
          employee_number: activeCase.employee_id_number || generateEmployeeNumber(),
          start_date: activeCase.target_start_date || date,
          status: 'Active',
          supervisor: '',
          emergency_contact: [
            activeCase.emergency_contact_1_name || activeCase.emergency_contact,
            activeCase.emergency_contact_1_phone,
          ].filter(Boolean).join(' - '),
          emergency_contact_phone: activeCase.emergency_contact_1_phone || '',
          banking_details: activeCase.banking_details || '',
          superannuation_details: activeCase.superannuation_details || '',
          tax_file_number: activeCase.tax_file_number || '',
          car_rego: [
            activeCase.current_rego,
            activeCase.rego_number,
          ].filter(Boolean).join(' - '),
          notes: [
            activeCase.notes,
            activeCase.workplace_adjustments ? `Workplace adjustments: ${activeCase.workplace_adjustments}` : '',
            activeCase.allergies ? `Allergies: ${activeCase.allergies}` : '',
            activeCase.medical_conditions ? `Medical conditions: ${activeCase.medical_conditions}` : '',
            activeCase.hobbies_interests ? `Hobbies and interests: ${activeCase.hobbies_interests}` : '',
            activeCase.qualifications_certificates ? `Qualifications: ${activeCase.qualifications_certificates}` : '',
            activeCase.supports_to_provide?.length ? `Supports they want to provide: ${activeCase.supports_to_provide.join(', ')}` : '',
            activeCase.availability ? `Availability: ${activeCase.availability}` : '',
            activeCase.weekly_hours_goal ? `Weekly hours goal: ${activeCase.weekly_hours_goal}` : '',
            activeCase.current_employment_status ? `Current/previous employment status: ${activeCase.current_employment_status}` : '',
            activeCase.previous_employer ? `Previous employer: ${activeCase.previous_employer} (phone: ${activeCase.previous_employer_phone || 'n/a'}, email: ${activeCase.previous_employer_email || 'n/a'})` : '',
            activeCase.referee_1_name ? `Referee 1: ${activeCase.referee_1_name} (phone: ${activeCase.referee_1_phone || 'n/a'}, email: ${activeCase.referee_1_email || 'n/a'})` : '',
            activeCase.referee_2_name ? `Referee 2: ${activeCase.referee_2_name} (phone: ${activeCase.referee_2_phone || 'n/a'}, email: ${activeCase.referee_2_email || 'n/a'})` : '',
            activeCase.why_apply ? `Why they applied: ${activeCase.why_apply}` : '',
            activeCase.office_use_notes ? `Office use notes: ${activeCase.office_use_notes}` : '',
            activeCase.acknowledgement_log ? `Acknowledgements:\n${activeCase.acknowledgement_log}` : '',
            activeCase.referee_check_log ? `Referee checks (office):\n${activeCase.referee_check_log}` : '',
            activeCase.buddy_shift_log ? `Buddy shifts:\n${activeCase.buddy_shift_log}` : '',
          ].filter(Boolean).join('\n'),
        });
      }
      if (activeCase.audit_consent === 'Audit consent received') {
        try {
          await base44.functions.invoke(
            intakeType === 'Participant' ? 'participantAuditConsent' : 'staffAuditConsent',
            {
              ...(intakeType === 'Participant' ? { participant_id: profile.id } : { staff_id: profile.id }),
              consent: 'Audit consent received',
              reason: `Carried from intake case ${activeCase.case_number}`,
              recorded_by: activeCase.audit_consent_by || user?.full_name || '',
              recorded_date: activeCase.audit_consent_date || '',
              recorded_time: activeCase.audit_consent_time || '',
            },
          );
        } catch (consentError) {
          console.error('Audit consent carry-over failed', consentError);
        }
      }
      await base44.entities.IntakeDocument.updateMany(
        { intake_case_id: activeCase.id },
        { $set: { profile_id: profile.id } },
      );
      if (intakeType === 'Employee') {
        await base44.entities.TrainingCompletion.updateMany(
          { learner_name: activeCase.applicant_name, learner_type: 'Employee' },
          { $set: { learner_id: profile.id, employee_id: profile.id } },
        );
        await base44.entities.BuddyShift.updateMany(
          { staff_name: activeCase.applicant_name, staff_id: '' },
          { $set: { staff_id: profile.id } },
        );
      }
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
      const intakeDoc = await base44.entities.IntakeDocument.create({
        intake_case_id: activeCase.id,
        intake_case_number: activeCase.case_number,
        intake_type: intakeType,
        document_type: canonical,
        file_name: file.name,
        file_uri,
        ...(activeCase.related_profile_id ? { profile_id: activeCase.related_profile_id } : {}),
        uploaded_by: user?.full_name || user?.email || 'Intake team',
        uploaded_date: businessDateTime().date,
      });
      routeDocument(intakeDoc, { source: 'IntakeDocument', person_name: activeCase.applicant_name, person_type: intakeType });
      if (TRAINING_REGISTER_DOC_TYPES.has(canonical)) {
        await base44.entities.TrainingCompletion.create({
          learner_type: 'Employee',
          learner_name: activeCase.applicant_name,
          employee_name: activeCase.applicant_name,
          module_title: canonical,
          completed_date: businessDateTime().date,
          status: 'Completed',
          training_notes: `Training certificate uploaded via intake case ${activeCase.case_number}`,
        });
      }
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

  const startOnlineForm = (docType) => {
    if (!activeCase) return;
    const definition = intakeFormDefinition(intakeType, docType);
    if (!definition) return;
    setOnlineForm({
      docType,
      definition,
      answers: {
        ...answersBank,
        ...buildIntakeAutofilledAnswers(definition.fields || [], activeCase),
      },
    });
    setShowOnline(true);
  };

  const submitOnlineForm = async () => {
    if (!onlineForm || !activeCase) return;
    const fields = onlineForm.definition.fields || [];
    const missing = fields.filter((f) => !String(onlineForm.answers[f.label] || '').trim());
    if (missing.length) {
      toast({
        title: 'Please answer every question before submitting',
        description: `Still needed: ${missing.slice(0, 3).map((f) => f.label).join(', ')}${missing.length > 3 ? ' and more' : ''}`,
        variant: 'destructive',
      });
      return;
    }
    setSubmittingOnline(true);
    try {
      const { date, time } = businessDateTime();
      const doc = await buildFilledFormDoc({
        title: onlineForm.docType,
        code: templateCodes[onlineForm.docType],
        subtitle: `${onlineForm.docType} - ${activeCase.applicant_name}`,
        fields,
        values: onlineForm.answers,
        columns: onlineForm.definition.columns,
        rows: onlineForm.definition.rows,
        completedBy: user?.full_name || user?.email || '',
        completedAt: `${date} at ${time}`,
      });
      const blob = doc.output('blob');
      const file = new File([blob], `${onlineForm.docType} (completed online).pdf`, { type: 'application/pdf' });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const canonical = canonicalIntakeDocumentType(onlineForm.docType);
      const onlineDoc = await base44.entities.IntakeDocument.create({
        intake_case_id: activeCase.id,
        intake_case_number: activeCase.case_number,
        intake_type: intakeType,
        document_type: canonical,
        file_name: file.name,
        file_uri,
        ...(activeCase.related_profile_id ? { profile_id: activeCase.related_profile_id } : {}),
        uploaded_by: `${user?.full_name || user?.email || 'Intake team'} (completed online)`,
        uploaded_date: businessDateTime().date,
      });
      routeDocument(onlineDoc, { source: 'IntakeDocument', person_name: activeCase.applicant_name, person_type: intakeType });
      const completed = Array.from(new Set([
        ...(activeCase.completed_document_types || []),
        canonical,
      ]));
      await base44.entities.IntakeCase.update(activeCase.id, { completed_document_types: completed });
      setAnswersBank((bank) => ({ ...bank, ...onlineForm.answers }));
      await load(activeCase.id);
      setShowOnline(false);
      setOnlineForm(null);
      toast({ title: `${canonical} completed online and attached` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to save the completed form', description: error.message, variant: 'destructive' });
    } finally {
      setSubmittingOnline(false);
    }
  };

  const startAcknowledgement = (docType) => {
    if (!activeCase) return;
    const definition = intakeFormDefinition(intakeType, docType);
    if (!definition) return;
    setAckForm({
      docType,
      definition,
      answers: {
        ...answersBank,
        ...buildIntakeAutofilledAnswers(definition.fields || [], activeCase),
      },
    });
    setShowAck(true);
  };

  const submitAcknowledgement = async () => {
    if (!ackForm || !activeCase) return;
    const fields = ackForm.definition.fields || [];
    const missing = fields.filter((f) => !String(ackForm.answers[f.label] || '').trim());
    if (missing.length) {
      toast({
        title: 'Please answer every question before submitting',
        description: `Still needed: ${missing.slice(0, 3).map((f) => f.label).join(', ')}${missing.length > 3 ? ' and more' : ''}`,
        variant: 'destructive',
      });
      return;
    }
    setSubmittingAck(true);
    try {
      const { date, time } = businessDateTime();
      const acknowledgedBy = user?.full_name || user?.email || 'Intake team';
      const doc = await buildFilledFormDoc({
        title: ackForm.docType,
        code: templateCodes[ackForm.docType],
        subtitle: `${ackForm.docType} - ${activeCase.applicant_name}`,
        fields,
        values: ackForm.answers,
        completedBy: acknowledgedBy,
        completedAt: `${date} at ${time}`,
      });
      const blob = doc.output('blob');
      const file = new File([blob], `${ackForm.docType} (acknowledged).pdf`, { type: 'application/pdf' });
      const { file_uri } = await base44.integrations.Core.UploadPrivateFile({ file });
      const canonical = canonicalIntakeDocumentType(ackForm.docType);
      const ackDoc = await base44.entities.IntakeDocument.create({
        intake_case_id: activeCase.id,
        intake_case_number: activeCase.case_number,
        intake_type: intakeType,
        document_type: canonical,
        file_name: file.name,
        file_uri,
        ...(activeCase.related_profile_id ? { profile_id: activeCase.related_profile_id } : {}),
        uploaded_by: `${acknowledgedBy} (acknowledgement)`,
        uploaded_date: date,
      });
      routeDocument(ackDoc, { source: 'IntakeDocument', person_name: activeCase.applicant_name, person_type: intakeType });
      const completed = Array.from(new Set([
        ...(activeCase.completed_document_types || []),
        canonical,
      ]));
      await base44.entities.IntakeCase.update(activeCase.id, {
        completed_document_types: completed,
        acknowledgement_log: [
          activeCase.acknowledgement_log || '',
          `${canonical} acknowledged by ${acknowledgedBy} on ${date} at ${time}`,
        ].filter(Boolean).join('\n'),
      });
      setAnswersBank((bank) => ({ ...bank, ...ackForm.answers }));
      await load(activeCase.id);
      setShowAck(false);
      setAckForm(null);
      toast({ title: `${canonical} acknowledgement recorded` });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to record the acknowledgement', description: error.message, variant: 'destructive' });
    } finally {
      setSubmittingAck(false);
    }
  };

  const addBuddyShift = async () => {
    if (!activeCase) return;
    if (!buddyShift.date || !buddyShift.other_employee.trim()) {
      toast({ title: 'Record the date and the other employee present', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const entry = [
        `${buddyShift.date}${buddyShift.time ? ` ${buddyShift.time}` : ''}`,
        `Other employee present: ${buddyShift.other_employee.trim()}`,
        buddyShift.notes.trim(),
      ].filter(Boolean).join(' - ');
      await base44.entities.IntakeCase.update(activeCase.id, {
        buddy_shift_log: [activeCase.buddy_shift_log || '', entry].filter(Boolean).join('\n'),
      });
      await base44.entities.BuddyShift.create({
        date: buddyShift.date,
        shift: buddyShift.time ? `Buddy shift ${buddyShift.time}` : 'Buddy shift',
        buddy_supervisor: buddyShift.other_employee.trim(),
        comments: buddyShift.notes.trim(),
        staff_id: '',
        staff_name: activeCase.applicant_name,
      });
      await base44.entities.TrainingCompletion.create({
        learner_type: 'Employee',
        learner_name: activeCase.applicant_name,
        employee_name: activeCase.applicant_name,
        module_title: 'Buddy Shift (Skill Assessment)',
        completed_date: buddyShift.date,
        status: 'Completed',
        training_notes: `Buddy shift on ${buddyShift.date}${buddyShift.time ? ` at ${buddyShift.time}` : ''} with ${buddyShift.other_employee.trim()}. ${buddyShift.notes.trim()}`.trim(),
      });
      await load(activeCase.id);
      setBuddyShift({ date: '', time: '', other_employee: '', notes: '' });
      toast({ title: 'Buddy shift recorded' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to record the buddy shift', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const addRefereeCheck = async () => {
    if (!activeCase) return;
    if (!refereeCheck.checked_by.trim() || !refereeCheck.date || !refereeCheck.time) {
      toast({ title: 'Record the person, date and time of the check', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const entry = [
        `${refereeCheck.date} ${refereeCheck.time}`,
        refereeCheck.checked_by.trim(),
        refereeCheck.outcome.trim(),
      ].filter(Boolean).join(' - ');
      await base44.entities.IntakeCase.update(activeCase.id, {
        referee_check_log: [activeCase.referee_check_log || '', entry].filter(Boolean).join('\n'),
      });
      await base44.entities.TrainingCompletion.create({
        learner_type: 'Employee',
        learner_name: activeCase.applicant_name,
        employee_name: activeCase.applicant_name,
        module_title: 'Referee Check',
        completed_date: refereeCheck.date,
        status: 'Completed',
        training_notes: `Referee check completed by ${refereeCheck.checked_by.trim()} at ${refereeCheck.time}. ${refereeCheck.outcome.trim()}`.trim(),
      });
      await load(activeCase.id);
      setRefereeCheck({ checked_by: '', date: '', time: '', outcome: '' });
      toast({ title: 'Referee check recorded' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Unable to record the referee check', description: error.message, variant: 'destructive' });
    } finally {
      setBusy(false);
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

  const templateFiles = intakeType === 'Participant' ? PARTICIPANT_FORM_FILES : EMPLOYEE_FORM_FILES;
  const templateCodes = intakeType === 'Participant'
    ? Object.fromEntries(Object.entries(PARTICIPANT_FORM_META).map(([key, meta]) => [key, meta.code]))
    : EMPLOYEE_FORM_CODES;
  const templateDefinitions = intakeType === 'Participant'
    ? PARTICIPANT_FORM_DEFINITIONS
    : { ...EMPLOYEE_FORM_DEFINITIONS };

  const downloadTemplate = async (docType) => {
    setDownloadingTemplate(docType);
    try {
      const specialBuilder = SPECIAL_DOCUMENT_BUILDERS[docType];
      if (specialBuilder) {
        specialBuilder(templateCodes[docType] || '');
        return;
      }
      const officialUrl = templateFiles[docType];
      if (officialUrl) {
        await downloadOriginalDocument(officialUrl, `${docType} - Official Template`);
      } else {
        const definition = templateDefinitions[docType] || templateDefinitions['Participant Handbook'] || {};
        downloadBlankFormPdf({
          title: docType,
          code: templateCodes[docType] || templateCodes['Participant Handbook'],
          subtitle: definition.label || 'ComplianceHR Form',
          fields: definition.fields || [],
          columns: definition.columns,
          rows: definition.rows,
        });
      }
    } catch (error) {
      toast({ title: 'Download failed', description: error.message, variant: 'destructive' });
    } finally {
      setDownloadingTemplate('');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-foreground/60">
          <span className="font-semibold text-foreground">{cases.length}</span> {intakeType} intake cases
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={exportRegister} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" /> {exporting ? 'Exporting...' : 'Export Register (CSV)'}
          </Button>
          <Button onClick={() => setShowNew(true)}><Plus className="mr-2 h-4 w-4" /> {intakeType === 'Participant' ? 'Participant Intake' : 'Employee Intake'}</Button>
        </div>
      </div>

      {cases.length === 0 && !showNew ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No {intakeType} intake cases yet.</CardContent></Card>
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
                  className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                    record.id === activeCaseId ? 'border-primary bg-primary/5 shadow-panel' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <span className="gradient-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                    {initials(record.applicant_name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{record.applicant_name}</span>
                    <span className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-foreground/50">{record.case_number}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_CLASS[record.status] || 'bg-muted text-muted-foreground'}`}>
                        {record.status}
                      </span>
                    </span>
                  </span>
                  <span className={`shrink-0 text-xs font-bold ${scoreTone(score)}`}>{score}%</span>
                </button>
              );
            })}
          </div>

          {activeCase && (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel">
                <div className="gradient-brand relative flex flex-wrap items-center gap-3 px-5 py-4 text-white">
                  <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(circle at 88% 15%, rgba(255,255,255,0.22), transparent 55%)' }} />
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white/50 bg-white/20 text-sm font-bold">
                    {initials(activeCase.applicant_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-bold">{activeCase.applicant_name}</h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-[11px] font-medium">
                      <span className="rounded-full bg-white/20 px-2.5 py-0.5">{activeCase.case_number}</span>
                      {intakeType === 'Employee' && (
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5">Employee ID: {activeCase.employee_id_number || 'Generated at conversion'}</span>
                      )}
                      {activeCase.date_of_birth && (
                        <span className="rounded-full bg-white/20 px-2.5 py-0.5">DOB {format(new Date(activeCase.date_of_birth), 'd MMM yyyy')}</span>
                      )}
                    </div>
                  </div>
                  <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-semibold">{activeCase.status}</span>
                </div>
              </div>

              <div className="grid gap-3 rounded-xl border border-border/60 bg-card p-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
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
                    <div><span className="text-foreground/45">Preferred name</span><div className="font-medium">{activeCase.preferred_name || 'Not provided'}</div></div>
                    <div><span className="text-foreground/45">Proposed start date</span><div className="font-medium">{activeCase.target_start_date ? format(new Date(activeCase.target_start_date), 'd MMM yyyy') : 'Not set'}</div></div>
                  </>
                )}
                <div><span className="text-foreground/45">Eligibility / service fit</span><div className="font-medium">{activeCase.service_fit || 'Pending'}</div></div>
                <div><span className="text-foreground/45">Referral source</span><div className="font-medium">{activeCase.referral_source || 'Not provided'}</div></div>
                <div><span className="text-foreground/45">Intake owner</span><div className="font-medium">{activeCase.assigned_to || 'Unassigned'}</div></div>
                <div><span className="text-foreground/45">Date completed</span><div className="font-medium">{activeCase.date_completed ? format(new Date(activeCase.date_completed), 'd MMM yyyy') : 'Not recorded'}</div></div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <span className="text-foreground/45">Consent and acknowledgement log</span>
                  <div className="font-medium">
                    Privacy consent: {activeCase.privacy_consent_by
                      ? `${activeCase.privacy_consent_by}, ${activeCase.privacy_consent_date || ''}${activeCase.privacy_consent_time ? ` ${activeCase.privacy_consent_time}` : ''}`
                      : 'Not recorded'}
                  </div>
                  <div className="font-medium">
                    NDIS audit: {activeCase.audit_consent || 'Audit declined'}
                    {activeCase.audit_consent_by ? ` · ${activeCase.audit_consent_by}${activeCase.audit_consent_date ? `, ${activeCase.audit_consent_date}${activeCase.audit_consent_time ? ` ${activeCase.audit_consent_time}` : ''}` : ''}` : ''}
                  </div>
                  {(activeCase.acknowledgement_log || '').split('\n').filter(Boolean).map((entry, index) => (
                    <div key={index} className="text-xs text-foreground/60">{entry}</div>
                  ))}
                </div>
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
                    <UserCheck className="mr-1.5 h-4 w-4" /> Convert to {intakeType} profile
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
                              {UPLOAD_ONLY_DOC_TYPES.has(check.label) && !check.complete && (
                                <p className="text-[10px] text-muted-foreground">please upload</p>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                            {doc && (
                              <Button variant="outline" size="sm" onClick={() => viewDocument(doc)}>View</Button>
                            )}
                            {LEGISLATION_ACK_DOC_TYPES.has(check.label) && !TERMINAL_STATUSES.has(activeCase.status) && (
                              <Button variant="outline" size="sm" onClick={() => startAcknowledgement(check.label)} disabled={busy}>
                                <CheckCircle2 className="h-3.5 w-3.5" /> Acknowledgement
                              </Button>
                            )}
                            {!LEGISLATION_ACK_DOC_TYPES.has(check.label) && !UPLOAD_ONLY_DOC_TYPES.has(check.label)
                              && !DOWNLOAD_ONLY_DOC_TYPES.has(check.label)
                              && canCompleteIntakeFormOnline(intakeType, check.label) && !TERMINAL_STATUSES.has(activeCase.status) && (
                              <Button variant="outline" size="sm" onClick={() => startOnlineForm(check.label)} disabled={busy}>
                                <Pencil className="h-3.5 w-3.5" /> Complete online
                              </Button>
                            )}
                            {(!LEGISLATION_ACK_DOC_TYPES.has(check.label) || ACK_KEEP_DOWNLOAD_DOC_TYPES.has(check.label)) && !UPLOAD_ONLY_DOC_TYPES.has(check.label) && (
                              <Button variant="outline" size="sm" onClick={() => downloadTemplate(check.label)} disabled={downloadingTemplate === check.label}>
                                {downloadingTemplate === check.label
                                  ? <span className="block h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
                                  : <Download className="h-3.5 w-3.5" />}
                                Download
                              </Button>
                            )}
                            {TRAINING_DOC_LINKS[check.label] && (
                              <a
                                href={TRAINING_DOC_LINKS[check.label].url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-transparent px-3 text-xs font-medium hover:bg-accent"
                              >
                                <ExternalLink className="h-3.5 w-3.5" /> Free training
                              </a>
                            )}
                            {!LEGISLATION_ACK_DOC_TYPES.has(check.label) && !DOWNLOAD_ONLY_DOC_TYPES.has(check.label) && !TERMINAL_STATUSES.has(activeCase.status) && (
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

                <IntakeReadinessPanel readiness={readiness} />
              </div>

              {intakeType === 'Employee' && (
                <IntakeLogPanels
                  activeCase={activeCase}
                  refereeCheck={refereeCheck}
                  setRefereeCheck={setRefereeCheck}
                  buddyShift={buddyShift}
                  setBuddyShift={setBuddyShift}
                  busy={busy}
                  addRefereeCheck={addRefereeCheck}
                  addBuddyShift={addBuddyShift}
                />
              )}
            </div>
          )}
        </div>
      )}

      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{intakeType === 'Participant' ? 'Participant Intake' : 'Employee Intake'}</DialogTitle>
          </DialogHeader>
          <IntakeCaseForm
            intakeType={intakeType}
            form={form}
            setValue={setValue}
            toggleSupport={toggleSupport}
            busy={busy}
            onCancel={() => setShowNew(false)}
            onSubmit={createCase}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showOnline} onOpenChange={(open) => { setShowOnline(open); if (!open) setOnlineForm(null); }}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Complete {onlineForm?.docType} online</DialogTitle>
          </DialogHeader>
          {onlineForm && (
            <form
              onSubmit={(event) => { event.preventDefault(); submitOnlineForm(); }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <p className="text-xs text-muted-foreground sm:col-span-2">
                Same questions as the official form, with the company name and logo in the header. Known details are filled in automatically and the finished PDF is attached to this intake case and, after conversion, to the profile.
              </p>
              {onlineForm.definition.fields.map((field) => (
                <Field key={field.label} label={field.label} className={field.multiline ? 'sm:col-span-2' : ''}>
                  {field.multiline
                    ? (
                      <TextArea
                        rows={3}
                        value={onlineForm.answers[field.label] || ''}
                        onChange={(e) => setOnlineForm({ ...onlineForm, answers: { ...onlineForm.answers, [field.label]: e.target.value } })}
                      />
                    )
                    : (
                      <TextInput
                        value={onlineForm.answers[field.label] || ''}
                        onChange={(e) => setOnlineForm({ ...onlineForm, answers: { ...onlineForm.answers, [field.label]: e.target.value } })}
                      />
                    )}
                </Field>
              ))}
              <div className="flex items-center justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => { setShowOnline(false); setOnlineForm(null); }}>Cancel</Button>
                <Button type="submit" disabled={submittingOnline}>
                  {submittingOnline && <Loader2 className="h-4 w-4 animate-spin" />} Save &amp; attach to case
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showAck} onOpenChange={(open) => { setShowAck(open); if (!open) setAckForm(null); }}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Record acknowledgement - {ackForm?.docType}</DialogTitle>
          </DialogHeader>
          {ackForm && (
            <form
              onSubmit={(event) => { event.preventDefault(); submitAcknowledgement(); }}
              className="grid gap-3 sm:grid-cols-2"
            >
              <p className="text-xs text-muted-foreground sm:col-span-2">
                The applicant reads and acknowledges this legislation or standard. The acknowledgement PDF is saved to this intake case with the person, date and time recorded, and follows them onto their profile after conversion.
              </p>
              {ackForm.definition.fields.map((field) => (
                <Field key={field.label} label={field.label} className={field.multiline ? 'sm:col-span-2' : ''}>
                  {field.multiline
                    ? (
                      <TextArea
                        rows={3}
                        value={ackForm.answers[field.label] || ''}
                        onChange={(e) => setAckForm({ ...ackForm, answers: { ...ackForm.answers, [field.label]: e.target.value } })}
                      />
                    )
                    : (
                      <TextInput
                        value={ackForm.answers[field.label] || ''}
                        onChange={(e) => setAckForm({ ...ackForm, answers: { ...ackForm.answers, [field.label]: e.target.value } })}
                      />
                    )}
                </Field>
              ))}
              <div className="flex items-center justify-end gap-2 sm:col-span-2">
                <Button type="button" variant="outline" onClick={() => { setShowAck(false); setAckForm(null); }}>Cancel</Button>
                <Button type="submit" disabled={submittingAck}>
                  {submittingAck && <Loader2 className="h-4 w-4 animate-spin" />} Record acknowledgement
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}