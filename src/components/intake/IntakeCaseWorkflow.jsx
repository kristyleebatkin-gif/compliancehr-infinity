import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useToast } from '@/components/ui/use-toast';
import { useRole } from '@/lib/useRole';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Download, Search } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { loadCompanyBranding } from '@/lib/companyBranding';
import { routeDocument } from '@/lib/documentRouting';
import { buildFilledFormDoc } from '@/lib/participantFormPdf';
import { downloadBrandedTemplatePdf, getTemplateMeta } from '@/lib/officialFormTemplates';
import { EMPLOYEE_FORM_DEFINITIONS } from '@/lib/employeeFormDefinitions';
import {
  buildIntakeAutofilledAnswers,
  canCompleteIntakeFormOnline,
  intakeFormDefinition,
} from '@/lib/intakeOnlineForms';
import { Plus } from 'lucide-react';
import { downloadOriginalDocument } from '@/lib/documentDownloads';
import IntakeCaseForm, { SUPPORT_OPTIONS, IntakeReadinessPanel } from '@/components/intake/IntakeCaseForm';
import personalStaffIntakeClient from '@/lib/personalStaffIntakeClient';
import { syncEmployeeRecord } from '@/lib/employeeRecordBridge';
import IntakeLogPanels from '@/components/intake/IntakeLogPanels';
import IntakeCaseHeaderTools from '@/components/intake/IntakeCaseHeaderTools';
import IntakeCaseList from '@/components/intake/IntakeCaseList';
import IntakeBulkImport from '@/components/intake/IntakeBulkImport';
import IntakeCaseDetail from '@/components/intake/IntakeCaseDetail';
import IntakeCaseDocuments from '@/components/intake/IntakeCaseDocuments';
import IntakeResumeUpload from '@/components/intake/IntakeResumeUpload';
import IntakeOnlineFormDialog from '@/components/intake/IntakeOnlineFormDialog';
import IntakeAcknowledgementDialog from '@/components/intake/IntakeAcknowledgementDialog';
import { STATUS_CLASS, STATUS_ORDER, TERMINAL_STATUSES } from '@/components/intake/intakeDisplay';
import { downloadBlankFormPdf } from '@/lib/formsLibraryPdf';
import { SPECIAL_DOCUMENT_BUILDERS } from '@/lib/intakeSpecialDocuments';
import { EMPLOYEE_FORM_CODES, EMPLOYEE_FORM_FILES } from '@/lib/employeeDocuments';
import { PARTICIPANT_FORM_DEFINITIONS, PARTICIPANT_FORM_FILES, PARTICIPANT_FORM_META } from '@/lib/participantDocuments';
import {
  TRAINING_REGISTER_DOC_TYPES,
  businessDateTime,
  canonicalIntakeDocumentType,
  createProfileId,
  findIntakeDuplicate,
  intakeReadiness,
  mirrorIntakeDocumentsToProfile,
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

function mapStaffRole(employeeRole) {
  const value = String(employeeRole || '');
  if (value.includes('Team Leader')) return 'Team Leader';
  if (value.includes('Compliance')) return 'Compliance Manager';
  if (value.includes('Administration')) return 'Administration';
  if (value.includes('Management')) return 'Management';
  return 'Support Worker';
}

export default function IntakeCaseWorkflow({ intakeType, profile, profileView }) {
  const { user } = useRole();
  const personalClient = useMemo(() => profileView ? personalStaffIntakeClient(profile, intakeType) : null, [profileView, profile?.id, intakeType]);
  const caseApi = personalClient?.cases || base44.entities.IntakeCase;
  const documentApi = personalClient?.documents || base44.entities.IntakeDocument;
  const [profileLoading, setProfileLoading] = useState(!!profileView);
  const [profileError, setProfileError] = useState('');
  const { toast } = useToast();
  const [cases, setCases] = useState([]);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const caseQuery = { intake_type: intakeType, ...(profile ? { $or: [{ related_profile_id: profile.id }, ...(profile.email ? [{ email: profile.email }] : [])] } : {}) };

  const exportRegister = async () => {
    setExporting(true);
    try {
      const page = await base44.entities.IntakeCase.filter(
        caseQuery, { sort: '-created_date', limit: 500 },
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
  const [answersBank, setAnswersBank] = useState({});
  const [ackForm, setAckForm] = useState(null);
  const [showAck, setShowAck] = useState(false);
  const [submittingAck, setSubmittingAck] = useState(false);
  const [refereeCheck, setRefereeCheck] = useState({ checked_by: '', date: '', time: '', outcome: '' });
  const [buddyShift, setBuddyShift] = useState({ date: '', time: '', other_employee: '', notes: '' });

  const activeCase = cases.find((record) => record.id === activeCaseId) || null;
  const readiness = useMemo(() => intakeReadiness(activeCase), [activeCase]);
  const activeDocs = documents.filter((doc) => doc.intake_case_id === activeCaseId);

  const statusCounts = useMemo(() => {
    const counts = { All: cases.length };
    cases.forEach((record) => { counts[record.status] = (counts[record.status] || 0) + 1; });
    return counts;
  }, [cases]);

  const visibleCases = useMemo(() => {
    const term = search.trim().toLowerCase();
    return cases.filter((record) =>
      (statusFilter === 'All' || record.status === statusFilter)
      && (!term || `${record.applicant_name} ${record.case_number} ${record.email || ''}`.toLowerCase().includes(term)));
  }, [cases, statusFilter, search]);

  const load = useCallback(async (preferredId = '') => {
    const casePage = await caseApi.filter(caseQuery, { sort: '-created_date', limit: 200 });
    const [profilePage, docPage] = await Promise.all([
      profile ? Promise.resolve({ items: [profile] }) : intakeType === 'Participant'
        ? base44.entities.ParticipantProfile.filter({}, { sort: '-created_date', limit: 200 })
        : base44.entities.StaffProfile.filter({}, { sort: '-created_date', limit: 200 }),
      documentApi.filter({ intake_type: intakeType, ...(profile ? { intake_case_id: { $in: casePage.items.map((record) => record.id) } } : {}) }, { sort: '-created_date', limit: 500 }),
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
      || (profile ? hydrated[0]?.id : '')
      || '';
    setActiveCaseId(nextId);
  }, [intakeType, activeCaseId, profile?.id, profile?.email]);

  useEffect(() => {
    if (!profileView) { load(); return; }
    setProfileLoading(true);
    setProfileError('');
    load().catch((error) => setProfileError(error.message)).finally(() => setProfileLoading(false));
  }, [intakeType, profile?.id, profileView]);

  // Live readiness: the moment the intake case or any of its documents change
  // (from anywhere in the app), the readiness panel re-reads current status.
  useEffect(() => {
    if (!profileView) return undefined;
    const caseUnsub = base44.entities.IntakeCase.subscribe(() => load());
    const docUnsub = base44.entities.IntakeDocument.subscribe(() => load());
    return () => { caseUnsub(); docUnsub(); };
  }, [profileView, load]);

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
      await caseApi.update(activeCase.id, updates);
      if (intakeType === 'Employee') await syncEmployeeRecord('IntakeCase', activeCase.id, Object.keys(updates));
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
      const mirrored = await mirrorIntakeDocumentsToProfile(activeCase, profile);
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
      await caseApi.update(activeCase.id, {
        status: 'Converted to Profile',
        related_profile_id: profile.id,
        converted_date: date,
        outstanding_actions: '',
      });
      if (intakeType === 'Employee') await syncEmployeeRecord('IntakeCase', activeCase.id);
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
      toast({ title: `${activeCase.applicant_name} converted to a profile${mirrored ? `, ${mirrored} document(s) filed to their vault` : ''}` });
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
      const intakeDoc = await documentApi.create({
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
      if (!profileView && TRAINING_REGISTER_DOC_TYPES.has(canonical)) {
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
      await caseApi.update(activeCase.id, { completed_document_types: completed });
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

  const submitOnlineForm = async ({ file_uri, file_name, answers }) => {
    if (!onlineForm || !activeCase) throw new Error('Please reopen the intake case before saving.');
    const canonical = canonicalIntakeDocumentType(onlineForm.docType);
    const onlineDoc = await documentApi.create({
      intake_case_id: activeCase.id,
      intake_case_number: activeCase.case_number,
      intake_type: intakeType,
      document_type: canonical,
      file_name,
      file_uri,
      ...(activeCase.related_profile_id ? { profile_id: activeCase.related_profile_id } : {}),
      uploaded_by: `${user?.full_name || user?.email || 'Intake team'} (completed online)`,
      uploaded_date: businessDateTime().date,
    });
    await routeDocument(onlineDoc, { source: 'IntakeDocument', person_name: activeCase.applicant_name, person_type: intakeType });
    const completed = Array.from(new Set([...(activeCase.completed_document_types || []), canonical]));
    await caseApi.update(activeCase.id, { completed_document_types: completed });
    setAnswersBank((bank) => ({ ...bank, ...answers }));
    await load(activeCase.id);
    toast({ title: `${canonical} completed online and attached` });
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
      const ackDoc = await documentApi.create({
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
      await caseApi.update(activeCase.id, {
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
      await caseApi.update(activeCase.id, {
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
      await caseApi.update(activeCase.id, {
        referee_check_log: [activeCase.referee_check_log || '', entry].filter(Boolean).join('\n'),
      });
      await base44.entities.TrainingCompletion.create({
        learner_type: intakeType,
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
      await documentApi.delete(doc.id);
      const remaining = activeDocs.filter((d) => d.id !== doc.id).map((d) => canonicalIntakeDocumentType(d.document_type));
      await caseApi.update(activeCase.id, { completed_document_types: remaining });
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
      const definition = templateDefinitions[docType] || templateDefinitions['Participant Handbook'] || {};
      const meta = getTemplateMeta(docType);
      if (definition.fields?.length || definition.columns?.length || meta) {
        await downloadBrandedTemplatePdf({
          title: docType,
          code: templateCodes[docType] || templateCodes['Participant Handbook'],
          subtitle: definition.label || 'ComplianceHR Form',
          ...meta,
          fields: definition.fields || [],
          columns: definition.columns,
          rows: definition.rows,
        });
      } else if (templateFiles[docType]) {
        await downloadOriginalDocument(templateFiles[docType], `${docType} - Official Template`);
      } else {
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

  if (profileView && profileLoading) return <div role="status" className="py-8 text-sm text-muted-foreground">Loading {intakeType.toLowerCase()} intake…</div>;
  if (profileView && profileError) return <div role="alert" className="rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{profileError}<Button variant="outline" className="ml-3" onClick={() => { setProfileError(''); setProfileLoading(true); load().catch((error) => setProfileError(error.message)).finally(() => setProfileLoading(false)); }}>Retry</Button></div>;

  if (profileView === 'resume') return activeCase
    ? <IntakeResumeUpload activeCase={activeCase} document={docForCheck('Resume')} uploadingDoc={uploadingDoc} busy={busy} onUpload={uploadDocument} onView={viewDocument} allowUpload />
    : <p className="text-xs text-muted-foreground">No linked employee intake record found.</p>;

  return (
    <div className="space-y-3">
      {!profileView && <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', ...STATUS_ORDER.filter((s) => statusCounts[s] && s !== 'All')].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                statusFilter === s
                  ? `${STATUS_CLASS[s] || 'bg-primary text-primary-foreground'} shadow-sm`
                  : 'border border-border bg-card text-foreground/60 hover:bg-muted'
              }`}
            >
              {s === 'All' ? 'All cases' : s}
              <span className="ml-1.5 tabular-nums opacity-70">{statusCounts[s] || 0}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or case number..."
              className="h-9 w-52 rounded-md border border-input bg-transparent pl-8 pr-3 text-sm shadow-sm outline-none placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
          <Button variant="outline" onClick={exportRegister} disabled={exporting}>
            <Download className="mr-2 h-4 w-4" /> {exporting ? 'Exporting...' : 'Export Register (CSV)'}
          </Button>
          {!profile && <IntakeBulkImport intakeType={intakeType} onImported={() => load()} />}
          {!profile && <Button onClick={() => setShowNew(true)}><Plus className="mr-2 h-4 w-4" /> {intakeType === 'Participant' ? 'Participant Intake' : 'Employee Intake'}</Button>}
        </div>
      </div>}

      {cases.length === 0 && !showNew ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No {intakeType} intake cases yet.</CardContent></Card>
      ) : (
        <div className={profileView ? 'space-y-4' : 'grid gap-4 lg:grid-cols-[19rem_minmax(0,1fr)]'}>
          {!profileView && <IntakeCaseList cases={visibleCases} activeCaseId={activeCaseId} onSelect={setActiveCaseId} />}

          {activeCase && (
            <div className="space-y-4">
              {!profileView && <IntakeCaseDetail
                activeCase={activeCase}
                intakeType={intakeType}
                readiness={readiness}
                busy={busy}
                onMoveToReview={moveToReview}
                onApprove={approve}
                onConvert={convertToProfile}
                onUpdateCase={updateCase}
                underHeader={<IntakeCaseHeaderTools activeCase={activeCase} readiness={readiness} intakeType={intakeType} docs={activeDocs} />}
              />}
              {profileView && <IntakeCaseHeaderTools activeCase={activeCase} readiness={readiness} intakeType={intakeType} docs={activeDocs} showJourney={profileView === 'overview'} journeyFirst={profileView === 'overview'} />}


              {profileView === 'readiness' ? <IntakeReadinessPanel readiness={readiness} activeCase={activeCase} allowResumeUpload={intakeType === 'Employee'} resumeDocument={docForCheck('Resume')} uploadingDoc={uploadingDoc} busy={busy} onUpload={uploadDocument} onView={viewDocument} /> : <IntakeCaseDocuments
                showReadiness={!profileView || profileView === 'documents' || profileView === 'overview'}
                activeCase={profileView ? { ...activeCase, status: 'Draft' } : activeCase}
                intakeType={intakeType}
                readiness={readiness}
                docForCheck={docForCheck}
                busy={busy}
                uploadingDoc={uploadingDoc}
                downloadingTemplate={downloadingTemplate}
                onView={viewDocument}
                onAcknowledge={startAcknowledgement}
                onOnlineForm={startOnlineForm}
                onDownload={downloadTemplate}
                onUpload={uploadDocument}
                onRemove={removeDocument}
                canCompleteOnline={(label) => canCompleteIntakeFormOnline(intakeType, label)}
              />}

              {!profileView && <IntakeLogPanels
                intakeType={intakeType}
                activeCase={activeCase}
                refereeCheck={refereeCheck}
                setRefereeCheck={setRefereeCheck}
                buddyShift={buddyShift}
                setBuddyShift={setBuddyShift}
                busy={busy}
                addRefereeCheck={addRefereeCheck}
                addBuddyShift={addBuddyShift}
              />}
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

      <IntakeOnlineFormDialog
        open={showOnline}
        onOpenChange={(open) => { setShowOnline(open); if (!open) setOnlineForm(null); }}
        onlineForm={onlineForm}
        activeCase={activeCase}
        intakeType={intakeType}
        code={templateCodes[onlineForm?.docType]}
        onSubmit={submitOnlineForm}
      />

      <IntakeAcknowledgementDialog
        open={showAck}
        onOpenChange={(open) => { setShowAck(open); if (!open) setAckForm(null); }}
        ackForm={ackForm}
        setAckForm={setAckForm}
        submitting={submittingAck}
        onSubmit={submitAcknowledgement}
      />
    </div>
  );
}