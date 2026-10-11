import { format } from 'date-fns';

export const INTAKE_REQUIREMENTS = {
  Participant: [
    'Participant Intake Assessment',
    'Referral Form',
    'NDIS Plan',
    'Service Agreement',
    'Individual Risk Assessment',
    'Consent to Share Information',
    'Participant Support Plan',
    'Home Risk Assessment',
    'Personal Emergency Form',
    'Provider Declaration',
    'Participant File Audit Checklist',
    'Authority to Act as Advocate',
    'Satisfaction Survey',
    'Feedback and Complaints',
    'Investigation Form',
    'Incident Reports',
    'Medication Record Sheet',
    'Medication Evaluation',
    'Medication Consent',
    'SAM Medication Assessment',
    'Mealtime Management Plan',
    'Behaviour Support Plan',
    'Restrictive Practices Record',
  ],
  Employee: [
    'Staff Information Form',
    'Staff Onboarding Form',
    'Staff Induction Form',
    'Employment Contract',
    'Position Description',
    "Driver's License",
    'Medicare Card',
    'Birth Certificate or Passport',
    'Tax File Number',
    'Resume',
    'Qualifications',
    'Super Details Declaration Form',
    'NDIS Code of Conduct Acknowledgement',
    'NDIS Act 2013 Acknowledgement',
    'NDIS Practice Standards Acknowledgement',
    'Work Health and Safety Act 2011 (Qld) Acknowledgement',
    'Disability Discrimination Act 1992 Acknowledgement',
    'NDIS Worker Screening Clearance',
    'Blue Card and/or Police Check',
    'Secondary Employment Form',
    'Staff Commitment Declaration Form',
    'Training Record',
    'Performance Review Form',
    'Performance Review Schedule',
    'Skill Assessment Form',
    'Staff Exit Form',
    'Car Registration',
    'Car Safety Check Form',
    'Mandatory Reporting Information',
    'Staff File Checklist',
    'NDIS Worker Orientation Module Certificate',
    'NDIS Worker Induction Module Certificate',
    'NDIS Supporting Safe and Enjoyable Meals Certificate',
    'NDIS Supporting Effective Communication Certificate',
    'Australian Commission on Safety and Quality in Health Care Medication Safety Certificate',
    'Australian Commission on Safety and Quality in Health Care Hand Hygiene Certificate',
    'Australian Commission on Safety and Quality in Health Care Infection Control Certificate',
    'Medication Administration Training Certificate',
    'Manual Handling Training Certificate',
    'First Aid Certificate',
    'CPR Certificate',
    'Immunisation Record',
    'Staff Handbook',
  ],
}

export const LEGISLATION_ACK_DOC_TYPES = new Set([
  'NDIS Code of Conduct Acknowledgement',
  'NDIS Act 2013 Acknowledgement',
  'NDIS Practice Standards Acknowledgement',
  'Work Health and Safety Act 2011 (Qld) Acknowledgement',
]);

export const TRAINING_DOC_LINKS = {
  'NDIS Worker Orientation Module Certificate': { label: 'NDIS worker orientation module (free)', url: 'https://training.ndiscommission.gov.au/' },
  'NDIS Worker Induction Module Certificate': { label: 'NDIS Commission worker modules (free)', url: 'https://training.ndiscommission.gov.au/' },
  'NDIS Supporting Safe and Enjoyable Meals Certificate': { label: 'Supporting Safe and Enjoyable Meals e-learning (free)', url: 'https://elearn.nds.org.au/' },
  'NDIS Supporting Effective Communication Certificate': { label: 'Supporting Effective Communication e-learning (free)', url: 'https://elearn.nds.org.au/' },
  'Australian Commission on Safety and Quality in Health Care Medication Safety Certificate': { label: 'Medication Safety education (free)', url: 'https://education.safetyandquality.gov.au/' },
  'Australian Commission on Safety and Quality in Health Care Hand Hygiene Certificate': { label: 'Hand Hygiene education (free)', url: 'https://education.safetyandquality.gov.au/' },
  'Australian Commission on Safety and Quality in Health Care Infection Control Certificate': { label: 'Infection Control education (free)', url: 'https://education.safetyandquality.gov.au/' },
  'Manual Handling Training Certificate': { label: 'Free manual handling training', url: 'https://cloudassess.com/course-library/manual-handling-aged-care/' },
  'Medication Administration Training Certificate': { label: 'Free medication administration training', url: 'https://alison.com/course/medication-management-and-administration' },
};

export const TRAINING_REGISTER_DOC_TYPES = new Set([
  ...Object.keys(TRAINING_DOC_LINKS),
  'First Aid Certificate',
  'CPR Certificate',
]);

export const UPLOAD_ONLY_DOC_TYPES = new Set([
  "Driver's License",
  'Medicare Card',
  'Birth Certificate or Passport',
  'Tax File Number',
  'Qualifications',
  'NDIS Worker Screening Clearance',
  'Blue Card and/or Police Check',
  'Car Registration',
  'Immunisation Record',
  'Manual Handling Training Certificate',
  'First Aid Certificate',
  'CPR Certificate',
  'Medication Administration Training Certificate',
  'Australian Commission on Safety and Quality in Health Care Medication Safety Certificate',
  'Australian Commission on Safety and Quality in Health Care Hand Hygiene Certificate',
  'Australian Commission on Safety and Quality in Health Care Infection Control Certificate',
  'NDIS Plan',
  'Behaviour Support Plan',
  'Restrictive Practices Record',
]);

// Information sheets and audit checklists: download-only, no upload or online completion.
export const DOWNLOAD_ONLY_DOC_TYPES = new Set([
  'Mandatory Reporting Information',
  'Staff File Checklist',
  'Participant File Audit Checklist',
]);

const INTAKE_DOCUMENT_ALIASES = {
  'Intake Assessment': 'Participant Intake Assessment',
  'Authority to Advocate': 'Authority to Act as Advocate',
  'Personal Emergency Record': 'Personal Emergency Form',
  'Medication Administration Form': 'Medication Administration Record',
  'Medication Record Form': 'Medication Record Sheet',
  Contract: 'Employment Contract',
  'ID Checks': '100 Points of Identification Checklist',
  'Reference Check': 'Referee Checks Form',
  'Employee Reference Check': 'Referee Checks Form',
  'Staff Onboarding Checklist': 'Staff Onboarding Form',
  'Staff Induction Checklist': 'Staff Induction Form',
  'Staff Declaration Form': 'Staff Commitment Declaration Form',
  'Staff Commitment Declaration': 'Staff Commitment Declaration Form',
  'NDIS Worker Screening': 'NDIS Worker Screening Clearance',
  'NDIS Screening': 'NDIS Worker Screening Clearance',
  'Blue Card or Police Check': 'Blue Card and/or Police Check',
  'Police Check or Blue Card': 'Blue Card and/or Police Check',
  'Immunisation History': 'Immunisation Record',
  'Daily Vehicle Safety Check Sheet': 'Car Safety Check Form',
  'NDIS Module 1 Certificate': 'NDIS Worker Orientation Module Certificate',
  'NDIS Module 2 Certificate': 'NDIS Worker Induction Module Certificate',
  'NDIS Module 3 Certificate': 'NDIS Supporting Safe and Enjoyable Meals Certificate',
  'NDIS Module 4 Certificate': 'NDIS Supporting Effective Communication Certificate',
  'Hand Hygiene Certificate': 'Australian Commission on Safety and Quality in Health Care Hand Hygiene Certificate',
  'Infection Control Certificate': 'Australian Commission on Safety and Quality in Health Care Infection Control Certificate',
  'Manual Handling Certificate': 'Manual Handling Training Certificate',
  'Training Record (5 Minute)': 'Training Record',
  'First Aid': 'First Aid Certificate',
  CPR: 'CPR Certificate',
  'Vehicle Registration': 'Car Registration',
  Passport: 'Birth Certificate or Passport',
  'Birth Certificate': 'Birth Certificate or Passport',
  'NDIS Workers Card': 'NDIS Worker Screening Clearance',
  'Medication Administration Training': 'Medication Administration Training Certificate',
};

export function canonicalIntakeDocumentType(documentType) {
  return INTAKE_DOCUMENT_ALIASES[documentType] || documentType;
}

export function intakeRequiredDocuments(intakeCase) {
  const requiredDocuments = [...(INTAKE_REQUIREMENTS[intakeCase?.intake_type] || [])];
  if (intakeCase?.intake_type === 'Participant') {
    if (intakeCase.representative_details?.trim()) requiredDocuments.push('Authority to Act as Advocate');
    if (intakeCase.medication_support_required) {
      requiredDocuments.push('Medication Evaluation', 'Medication Consent');
    }
    if (intakeCase.mealtime_support_required) requiredDocuments.push('Mealtime Management Plan');
    if (intakeCase.behaviour_support_required || intakeCase.restrictive_practice_identified) {
      requiredDocuments.push('Behaviour Support Plan');
    }
    if (intakeCase.restrictive_practice_identified) requiredDocuments.push('Restrictive Practices Record');
  }
  if (intakeCase?.intake_type === 'Employee' && String(intakeCase.employee_role || '').includes('Support Worker')) {
    requiredDocuments.push(
      'Manual Handling Training Certificate',
      'First Aid Certificate',
      'CPR Certificate',
    );
  }
  return [...new Set(requiredDocuments)];
}

export const OPEN_INTAKE_STATUSES = [
  'Draft',
  'Information Required',
  'Ready for Review',
  'Approved',
];

export const INTAKE_FILE_ACCEPT = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.csv';

const ALLOWED_FILE_EXTENSIONS = new Set(INTAKE_FILE_ACCEPT.split(','));
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateIntakeFile(file) {
  if (!file) return 'Select a file to upload.';
  const extension = `.${file.name.split('.').pop()?.toLowerCase() || ''}`;
  if (!ALLOWED_FILE_EXTENSIONS.has(extension)) {
    return 'Use a PDF, Word, image, Excel, or CSV file.';
  }
  if (file.size > MAX_FILE_SIZE) return 'The file must be 10 MB or smaller.';
  return '';
}

export function intakeReadiness(intakeCase) {
  const requiredDocuments = intakeRequiredDocuments(intakeCase);
  const completed = new Set((intakeCase?.completed_document_types || []).map(canonicalIntakeDocumentType));
  const identityChecks = [
    { label: 'Applicant name', complete: Boolean(intakeCase?.applicant_name?.trim()) },
    { label: 'Date of birth', complete: Boolean(intakeCase?.date_of_birth) },
    { label: 'Email or phone', complete: Boolean(intakeCase?.email?.trim() || intakeCase?.phone?.trim()) },
    { label: 'Privacy consent', complete: intakeCase?.privacy_consent === true },
    { label: 'Eligibility / service fit', complete: intakeCase?.service_fit === 'Eligible' },
  ];
  if (intakeCase?.intake_type === 'Participant') {
    identityChecks.splice(2, 0,
      { label: 'NDIS number', complete: Boolean(intakeCase?.ndis_number?.trim()) },
      { label: 'Requested supports', complete: Boolean(intakeCase?.requested_supports?.trim()) },
      { label: 'Communication needs considered', complete: Boolean(intakeCase?.communication_needs?.trim()) },
      { label: 'Risks and safeguards considered', complete: Boolean(intakeCase?.risk_summary?.trim()) },
    );
  } else {
    identityChecks.splice(2, 0,
      { label: 'Employee role', complete: Boolean(intakeCase?.employee_role?.trim()) },
      { label: 'Qualifications', complete: Boolean(intakeCase?.qualifications_certificates?.trim()) },
      { label: 'Tax file number', complete: Boolean(intakeCase?.tax_file_number?.trim()) },
      { label: 'Banking details', complete: Boolean(intakeCase?.banking_details?.trim()) },
      { label: 'Superannuation details', complete: Boolean(intakeCase?.superannuation_details?.trim()) },
      { label: 'Availability', complete: Boolean(intakeCase?.availability?.trim()) },
      { label: 'Weekly hours goal', complete: Boolean(intakeCase?.weekly_hours_goal?.trim()) },
      { label: 'Referees provided', complete: Boolean((intakeCase?.referee_1_name?.trim() && intakeCase?.referee_2_name?.trim()) || intakeCase?.referees?.trim()) },
      { label: 'Supports to provide selected', complete: (intakeCase?.supports_to_provide || []).length > 0 },
      { label: 'Allergies', complete: Boolean(intakeCase?.allergies?.trim()) },
      { label: 'Medical conditions', complete: Boolean(intakeCase?.medical_conditions?.trim()) },
      {
        label: 'Emergency contact',
        complete: Boolean(
          intakeCase?.emergency_contact?.trim()
          || (intakeCase?.emergency_contact_1_name?.trim() && intakeCase?.emergency_contact_1_phone?.trim()),
        ),
      },
    );
  }
  const documentChecks = requiredDocuments.map((label) => ({
    label,
    complete: completed.has(label),
    kind: 'document',
  }));
  if (intakeCase?.intake_type === 'Participant') {
    documentChecks.unshift({
      label: 'Participant handbook or Easy Read handbook',
      complete: completed.has('Participant Handbook') || completed.has('Participant Easy Read Handbook'),
      kind: 'document',
    });
    documentChecks.unshift({
      label: 'Participant Intake Form',
      complete: completed.has('Participant Intake Form'),
      kind: 'document',
    });
  }
  const checks = [...identityChecks, ...documentChecks];
  const completeCount = checks.filter((check) => check.complete).length;
  return {
    checks,
    informationChecks: identityChecks,
    documentChecks,
    missing: checks.filter((check) => !check.complete).map((check) => check.label),
    score: checks.length ? Math.round((completeCount / checks.length) * 100) : 0,
    ready: completeCount === checks.length,
  };
}

export function findIntakeDuplicate(intakeCase, profiles, cases = []) {
  const normalize = (value) => String(value || '').trim().toLowerCase();
  const digits = (value) => String(value || '').replace(/\D/g, '');
  const name = normalize(intakeCase.applicant_name);
  const dob = intakeCase.date_of_birth || '';
  const email = normalize(intakeCase.email);
  const ndisNumber = digits(intakeCase.ndis_number);

  const profile = profiles.find((record) => (
    (ndisNumber && digits(record.ndis_number) === ndisNumber)
    || (email && normalize(record.email) === email)
    || (name && dob && normalize(record.full_name) === name && record.date_of_birth === dob)
  ));
  if (profile) return `An existing profile already matches ${profile.full_name}.`;

  const otherCase = cases.find((record) => (
    record.id !== intakeCase.id
    && record.status !== 'Declined'
    && record.status !== 'Withdrawn'
    && record.status !== 'Converted to Profile'
    && (
      (ndisNumber && digits(record.ndis_number) === ndisNumber)
      || (email && normalize(record.email) === email)
      || (name && dob && normalize(record.applicant_name) === name && record.date_of_birth === dob)
    )
  ));
  return otherCase ? `Open intake case ${otherCase.case_number} already matches this applicant.` : '';
}

export function createProfileId(records, key, prefix) {
  const pattern = new RegExp(`^${prefix}-(\\d+)$`);
  const max = (records || []).reduce((acc, record) => {
    const match = pattern.exec(String(record?.[key] || ''));
    return match ? Math.max(acc, parseInt(match[1], 10)) : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, '0')}`;
}

export function businessDateTime() {
  const now = new Date();
  return { date: format(now, 'yyyy-MM-dd'), time: format(now, 'HH:mm') };
}