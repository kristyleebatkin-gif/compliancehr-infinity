import { ClipboardList, FileText, Megaphone, DollarSign, Heart, LogOut } from 'lucide-react';
import { PARTICIPANT_OFFICIAL_FORM_ADDITIONS } from '@/lib/participantOfficialFields';
import { normaliseFormFields } from '@/lib/formQuestionModel';
import { PARTICIPANT_SOURCE_FORMS } from '@/lib/participantSourceForms';
import { NDIS_PARTICIPANT_REVIEW_FIELDS } from '@/lib/ndisFormReview';

/**
 * ComplianceHR Infinity - Participant Forms & Service Documents Register.
 * PARTICIPANT_FORM_DEFINITIONS is the source of truth for intake topics,
 * display codes, fillable fields, and downloadable official templates.
 */
const personalFields = [
  { label: 'Participant full name' },
  { label: 'Participant ID / NDIS number' },
  { label: 'Date of birth' },
  { label: 'Address' },
  { label: 'Phone and email' },
  { label: 'Emergency contact' },
];

const definition = (code, label, fields, extra = {}) => ({ code, label, fields, ...extra });

const BASE_PARTICIPANT_FORM_DEFINITIONS = {
  'Participant Handbook': definition('CM-PRC-002', 'Participant Handbook Acknowledgement', [
    ...personalFields,
    { label: 'Handbook version received' },
    { label: 'Questions or support required', multiline: true },
    { label: 'Participant / representative acknowledgement', multiline: true },
  ]),
  'Participant Easy Read Handbook': definition('CM-PRC-003', 'Participant Easy Read Handbook Acknowledgement', [
    ...personalFields,
    { label: 'Easy Read handbook version received' },
    { label: 'How the information was explained', multiline: true },
    { label: 'Communication support used', multiline: true },
    { label: 'Participant acknowledgement', multiline: true },
  ]),
  'Participant Intake Form': definition('CM-FORM-020', 'Participant Intake Form', [
    ...personalFields,
    { label: 'Primary contact / nominee' },
    { label: 'NDIS plan dates and management type' },
    { label: 'Requested supports', multiline: true },
    { label: 'Communication and accessibility needs', multiline: true },
    { label: 'Health, medication and allergy information', multiline: true },
  ]),
  'Participant Intake Assessment': definition('CM-FORM-021', 'Participant Intake Assessment Form', [
    ...personalFields,
    { label: 'Reason for referral and service request', multiline: true },
    { label: 'Current supports and living arrangements', multiline: true },
    { label: 'Strengths, preferences and goals', multiline: true },
    { label: 'Risks and immediate safeguards', multiline: true },
    { label: 'Assessment outcome and next steps', multiline: true },
  ]),
  'Referral Form': definition('CM-FORM-022', 'Referral Form', [
    { label: 'Referrer name and organisation' },
    { label: 'Referrer contact details' },
    ...personalFields,
    { label: 'Reason for referral', multiline: true },
    { label: 'Requested services and urgency', multiline: true },
    { label: 'Relevant risks and attachments', multiline: true },
  ]),
  'NDIS Plan': definition('CM-FORM-043', 'NDIS Plan Record', [
    ...personalFields,
    { label: 'Plan number and management type' },
    { label: 'Plan start and end dates' },
    { label: 'Plan manager / support coordinator' },
    { label: 'Participant goals', multiline: true },
    { label: 'Funded support categories and budgets', multiline: true },
    { label: 'Implementation actions', multiline: true },
  ]),
  'Service Agreement': definition('CM-FORM-041', 'Service Agreement', [
    ...personalFields,
    { label: 'Provider legal name and ABN' },
    { label: 'Agreement start and end dates' },
    { label: 'Supports, schedule and service locations', multiline: true },
    { label: 'Fees, cancellations and payment arrangements', multiline: true },
    { label: 'Rights, responsibilities and complaint process', multiline: true },
    { label: 'Participant / representative agreement', multiline: true },
  ]),
  'Individual Risk Assessment': definition('CM-FORM-013', 'Individual Risk Assessment Form', [
    ...personalFields,
    { label: 'Hazard / risk description', multiline: true },
    { label: 'Existing controls', multiline: true },
    { label: 'Likelihood, consequence and risk rating' },
    { label: 'Additional controls and responsible person', multiline: true },
    { label: 'Review date and outcome', multiline: true },
  ]),
  'Participant Consent for Audits': definition('CM-FORM-044', 'Participant Consent for Audits Form', [
    ...personalFields,
    { label: 'Audit purpose and organisation' },
    { label: 'Information / records authorised for review', multiline: true },
    { label: 'Consent limitations or conditions', multiline: true },
    { label: 'Consent start and expiry dates' },
    { label: 'Participant / representative consent', multiline: true },
  ]),
  'Consent to Share Information': definition('CM-FORM-049', 'Consent to Share My Information Form', [
    ...personalFields,
    { label: 'Authorised person name and organisation' },
    { label: 'Relationship to participant and contact details' },
    { label: 'Information authorised to share', multiline: true },
    { label: 'Information specifically excluded', multiline: true },
    { label: 'Purpose and approved method of sharing', multiline: true },
    { label: 'Consent start and end dates' },
    { label: 'How consent can be withdrawn', multiline: true },
    { label: 'Participant / representative consent', multiline: true },
  ]),
  'Participant Support Plan': definition('CM-FORM-025', 'Participant Support Plan', [
    ...personalFields,
    { label: 'Strengths, preferences and communication needs', multiline: true },
    { label: 'Goals and desired outcomes', multiline: true },
    { label: 'Daily supports and strategies', multiline: true },
    { label: 'Health, medication and mealtime requirements', multiline: true },
    { label: 'Risks, safeguards and emergency response', multiline: true },
    { label: 'Review schedule and responsible team members', multiline: true },
  ]),
  'Provider Declaration': definition('CM-FORM-040', 'Provider Declaration Form', [
    { label: 'Provider legal name and ABN' },
    { label: 'Participant full name and NDIS number' },
    { label: 'Declaration purpose' },
    { label: 'Provider declaration', multiline: true },
    { label: 'Authorised representative name and position' },
    { label: 'Signature date' },
  ]),
  'Medication Evaluation': definition('CM-FORM-038', 'Medication Evaluation Form', [
    ...personalFields,
    { label: 'Medication name, strength and route' },
    { label: 'Prescriber and pharmacy' },
    { label: 'Purpose and expected outcome', multiline: true },
    { label: 'Observed effectiveness', multiline: true },
    { label: 'Side effects, incidents or concerns', multiline: true },
    { label: 'Actions, review and escalation', multiline: true },
  ]),
  'Progress Reports': definition('CM-FORM-028', 'Progress Report', [
    ...personalFields,
    { label: 'Reporting period' },
    { label: 'Supports delivered', multiline: true },
    { label: 'Progress toward each NDIS goal', multiline: true },
    { label: 'Achievements and participant feedback', multiline: true },
    { label: 'Barriers, risks and incidents', multiline: true },
    { label: 'Recommendations and next steps', multiline: true },
  ]),
  'Progress Notes': definition('CM-FORM-027', 'Progress Notes', [
    { label: 'Participant full name and ID' },
    { label: 'Date, start time and end time' },
    { label: 'Worker name' },
    { label: 'Location and support type' },
    { label: 'Objective observations and supports provided', multiline: true },
    { label: 'Goal progress and participant response', multiline: true },
    { label: 'Incidents, risks or follow-up required', multiline: true },
  ]),
  'Incident Reports': definition('CM-FORM-016', 'Incident Report Form', [
    { label: 'Participant full name and ID' },
    { label: 'Incident date, time and location' },
    { label: 'People involved and witnesses' },
    { label: 'Incident description', multiline: true },
    { label: 'Immediate response and medical attention', multiline: true },
    { label: 'Notifications and reportable incident assessment', multiline: true },
    { label: 'Corrective actions and follow-up', multiline: true },
  ]),
  'Behaviour Support Plan': definition('CM-FORM-045', 'Positive Behaviour Support Plan', [
    ...personalFields,
    { label: 'Behaviours of concern and context', multiline: true },
    { label: 'Known triggers and early warning signs', multiline: true },
    { label: 'Quality-of-life and skill-building goals', multiline: true },
    { label: 'Proactive support strategies', multiline: true },
    { label: 'Response and de-escalation strategies', multiline: true },
    { label: 'Data collection, review and practitioner details', multiline: true },
  ]),
  'Restrictive Practices Record': definition('CM-FORM-046', 'Restrictive Practices in Place Record', [
    ...personalFields,
    { label: 'Regulated restrictive practice type' },
    { label: 'Behaviour / risk addressed', multiline: true },
    { label: 'Authorisation and consent details', multiline: true },
    { label: 'Conditions, duration and implementation instructions', multiline: true },
    { label: 'Least-restrictive alternatives attempted', multiline: true },
    { label: 'Monitoring, reporting and reduction strategy', multiline: true },
  ]),
  'SAM Medication Assessment': definition('CM-FORM-039', 'Self-Assessment of Medication (SAM)', [
    ...personalFields,
    { label: 'Current medicines and dosage schedule', multiline: true },
    { label: 'Understanding of medicine purpose' },
    { label: 'Ability to identify, open and measure medicines' },
    { label: 'Ability to follow timing and storage instructions' },
    { label: 'Risks, prompts or assistance required', multiline: true },
    { label: 'Assessment outcome and review date', multiline: true },
  ]),
  'Satisfaction Survey': definition('CM-FORM-029', 'Participant Satisfaction Survey', [
    { label: 'Participant name or anonymous response' },
    { label: 'Survey date' },
    { label: 'Respect, choice and control rating' },
    { label: 'Reliability and quality of supports rating' },
    { label: 'Communication and safety rating' },
    { label: 'What is working well', multiline: true },
    { label: 'What could be improved', multiline: true },
  ]),
  'Feedback and Complaints': definition('CM-FORM-047', 'Feedback and Complaints Form', [
    { label: 'Person providing feedback' },
    { label: 'Contact details and preferred contact method' },
    { label: 'Participant concerned (if applicable)' },
    { label: 'Feedback type and date' },
    { label: 'Feedback or complaint details', multiline: true },
    { label: 'Preferred outcome', multiline: true },
    { label: 'Consent to contact and acknowledgement', multiline: true },
  ]),
  'Investigation Form': definition('CM-FORM-017', 'Investigation Form', [
    { label: 'Incident / complaint reference' },
    { label: 'Investigator and investigation dates' },
    { label: 'Scope and allegations', multiline: true },
    { label: 'People interviewed and evidence reviewed', multiline: true },
    { label: 'Chronology and findings', multiline: true },
    { label: 'Root cause and contributing factors', multiline: true },
    { label: 'Corrective actions, owners and due dates', multiline: true },
    { label: 'Outcome and approval', multiline: true },
  ]),
  'Participant Money Register': definition('CM-FORM-026', 'Participant Money and Property Register', personalFields, {
    columns: ['Date', 'Description', 'Money In', 'Money Out', 'Balance', 'Receipt', 'Worker', 'Participant'],
    rows: 14,
  }),
  'Medication Administration Record': definition('CM-FORM-036', 'Medication Administration Record', [
    ...personalFields,
    { label: 'Current medicines and dosage schedule', multiline: true },
    { label: 'Known allergies and adverse reactions', multiline: true },
  ], {
    columns: ['Date', 'Time', 'Medication', 'Dose', 'Route', 'Given / Refused', 'Worker Initials', 'Notes'],
    rows: 14,
  }),
  'Medication Consent': definition('CM-FORM-037', 'Medication Consent Form', [
    ...personalFields,
    { label: 'Medication and dosage details', multiline: true },
    { label: 'Administration support authorised', multiline: true },
    { label: 'Known allergies and adverse reactions', multiline: true },
    { label: 'Consent conditions and expiry' },
    { label: 'Participant / representative consent', multiline: true },
  ]),
  'Medication Record Sheet': definition('CM-FORM-048', 'Medication Record Sheet', [
    ...personalFields,
    { label: 'Current medicines and dosage schedule', multiline: true },
    { label: 'Known allergies and adverse reactions', multiline: true },
  ], {
    columns: ['Medication', 'Strength', 'Dose', 'Route', 'Frequency', 'Prescriber', 'Start Date', 'Review Date'],
    rows: 12,
  }),
  'Mealtime Management Plan': definition('CM-FORM-032', 'Mealtime Management Plan', [
    ...personalFields,
    { label: 'Assessment and clinician details' },
    { label: 'Food texture and fluid consistency' },
    { label: 'Positioning, equipment and level of assistance', multiline: true },
    { label: 'Safe mealtime strategies', multiline: true },
    { label: 'Signs of swallowing difficulty and emergency response', multiline: true },
    { label: 'Review date and worker training requirements', multiline: true },
  ]),
  'Authority to Act as Advocate': definition('CM-FORM-024', 'Authority to Act as an Advocate or Representative Form', [
    ...personalFields,
    { label: 'Advocate full name and contact details' },
    { label: 'Representative full name and contact details' },
    { label: 'Relationship to participant' },
    { label: 'Decisions / matters covered by this authority', multiline: true },
    { label: 'Limitations and expiry date', multiline: true },
    { label: 'Participant / representative authorisation', multiline: true },
  ]),
  'Participant Exit Form': definition('CM-FORM-030', 'Participant Exit Form', [
    ...personalFields,
    { label: 'Exit date and reason' },
    { label: 'Final services and outstanding actions', multiline: true },
    { label: 'Records, property and funds returned', multiline: true },
    { label: 'Transition / referral arrangements', multiline: true },
    { label: 'Participant feedback and closure approval', multiline: true },
  ]),
  'Participant File Audit Checklist': definition('CM-FORM-051', 'Participant File Audit Checklist', [
    ...personalFields,
    { label: 'Auditor and audit date' },
    { label: 'Identity documents sighted and current' },
    { label: 'NDIS plan and service agreement current' },
    { label: 'Risk assessments current' },
    { label: 'Support plan and progress notes complete' },
    { label: 'Medication records current' },
    { label: 'Consent forms signed and current' },
    { label: 'Audit outcome', multiline: true },
    { label: 'Actions required', multiline: true },
  ]),
  'Home Risk Assessment': definition('CM-FORM-014', 'Home Risk Assessment Form', [
    ...personalFields,
    { label: 'Assessment address and date' },
    { label: 'Access, exits and emergency equipment', multiline: true },
    { label: 'Environmental, manual handling and infection risks', multiline: true },
    { label: 'Pets, smoking, violence or other household risks', multiline: true },
    { label: 'Controls, responsible person and due date', multiline: true },
    { label: 'Overall rating and review date', multiline: true },
  ]),
  'Fire Drill Form': definition('CM-FORM-052', 'Fire Drill Form', [
    ...personalFields,
    { label: 'Drill date, time and location' },
    { label: 'Assistance and equipment used to evacuate' },
    { label: 'Evacuation route used and assembly point' },
    { label: 'Roll call and participant accounted for' },
    { label: 'Issues identified and improvements required', multiline: true },
    { label: 'Completed by and date' },
  ]),
  'Personal Emergency Form': definition('CM-FORM-018', 'Personal Emergency Management Plan', [
    ...personalFields,
    { label: 'Disability, health and communication needs', multiline: true },
    { label: 'Emergency contacts and treating practitioners', multiline: true },
    { label: 'Medication, equipment and essential supplies', multiline: true },
    { label: 'Evacuation, transport and safe location plan', multiline: true },
    { label: 'Support roles and emergency instructions', multiline: true },
    { label: 'Plan review and drill dates', multiline: true },
  ]),
};

// Full intake questionnaire: every intake case question not already on the
// reconstructed source document, appended so the online form covers them all.
const PARTICIPANT_INTAKE_CASE_QUESTIONS = [
  { label: 'Preferred name and pronouns' },
  { label: 'Has representative / nominee', type: 'single', options: ['Yes', 'No', 'Not applicable'] },
  { label: 'Guardian / nominee name' },
  { label: 'Guardian / nominee contact' },
  { label: 'Medicare card number' },
  { label: 'Medicare individual reference number' },
  { label: 'Medicare expiry' },
  { label: 'NDIS funding categories' },
  { label: 'Plan manager phone' },
  { label: 'Plan manager email' },
  { label: 'Support coordinator phone' },
  { label: 'Support coordinator email' },
  { label: 'Doctor name' },
  { label: 'Doctor phone' },
  { label: 'Doctor email' },
  { label: 'Doctor address' },
  { label: 'Specialist name' },
  { label: 'Specialist phone' },
  { label: 'Specialist email' },
  { label: 'Specialist address' },
  { label: 'Occupational therapist' },
  { label: 'Speech therapist' },
  { label: 'Physiotherapist' },
  { label: 'Other services' },
  { label: 'Advocate name' },
  { label: 'Advocate relationship' },
  { label: 'Advocate phone' },
  { label: 'Advocate email' },
  { label: 'Transport needs' },
  { label: 'NDIS plan goals', multiline: true },
  { label: 'Medical diagnosis' },
  { label: 'Special meals or diets' },
  { label: 'Mealtime management plan' },
  { label: 'Medication support required', type: 'single', options: ['Yes', 'No', 'Not applicable'] },
  { label: 'Behaviour support required', type: 'single', options: ['Yes', 'No', 'Not applicable'] },
  { label: 'Restrictive practice identified', type: 'single', options: ['Yes', 'No', 'Not applicable'] },
  { label: 'Risks identified', multiline: true },
  { label: 'Control measures', multiline: true },
  { label: 'Preferred workers description' },
  { label: 'Shift dates requested' },
  { label: 'Shift times requested' },
  { label: 'Phone number for shifts requested' },
  { label: 'Support type requested' },
  { label: 'Travel assistance required', type: 'single', options: ['Yes', 'No', 'Not applicable'] },
  { label: 'Pets on property', type: 'single', options: ['Yes', 'No', 'Not applicable'] },
  { label: 'Likes' },
  { label: 'Dislikes' },
  { label: 'Referral source' },
  { label: 'Proposed start date' },
  { label: 'Names of persons for consent to share information' },
];

export const PARTICIPANT_FORM_DEFINITIONS = Object.fromEntries(
  Object.entries(BASE_PARTICIPANT_FORM_DEFINITIONS).map(([docType, baseDefinition]) => {
    const official = PARTICIPANT_OFFICIAL_FORM_ADDITIONS[docType] || {};
    const appendedColumns = [
      ...(baseDefinition.columns || []),
      ...(official.appendColumns || []),
    ];
    return [
      docType,
      {
        ...baseDefinition,
        fields: normaliseFormFields([
          ...(PARTICIPANT_SOURCE_FORMS[docType] || [...(baseDefinition.fields || []), ...(official.fields || [])]),
          ...(docType === 'Participant Intake Form' ? PARTICIPANT_INTAKE_CASE_QUESTIONS : []),
          ...(NDIS_PARTICIPANT_REVIEW_FIELDS[docType] || []),
        ]),
        columns: official.columns || (appendedColumns.length ? appendedColumns : undefined),
        rows: official.rows || baseDefinition.rows,
      },
    ];
  }),
);

export const PARTICIPANT_FILE_SECTIONS = [
  { name: '1. Handbooks, Intake & Lifecycle', icon: ClipboardList, docs: ['Participant Handbook', 'Participant Easy Read Handbook', 'Participant Intake Form', 'Participant Intake Assessment', 'Referral Form', 'Authority to Act as Advocate', 'Home Risk Assessment', 'Participant Exit Form'] },
  { name: '2. NDIS, Agreements & Planning', icon: FileText, docs: ['NDIS Plan', 'Service Agreement', 'Individual Risk Assessment', 'Participant Consent for Audits', 'Consent to Share Information', 'Participant Support Plan', 'Participant File Audit Checklist', 'Provider Declaration'] },
  { name: '3. Service Delivery & Safeguards', icon: Megaphone, docs: ['Progress Reports', 'Progress Notes', 'Incident Reports', 'Behaviour Support Plan', 'Restrictive Practices Record'] },
  { name: '4. Medication & Mealtime Support', icon: Heart, docs: ['Medication Evaluation', 'SAM Medication Assessment', 'Medication Administration Record', 'Medication Consent', 'Medication Record Sheet', 'Mealtime Management Plan'] },
  { name: '5. Feedback, Investigations & Finance', icon: DollarSign, docs: ['Satisfaction Survey', 'Feedback and Complaints', 'Investigation Form', 'Participant Money Register'] },
  { name: '6. Emergency Management', icon: LogOut, docs: ['Personal Emergency Form', 'Fire Drill Form'] },
];

export const PARTICIPANT_DOC_TYPES = PARTICIPANT_FILE_SECTIONS.flatMap((section) => section.docs);

export const PARTICIPANT_FORM_META = Object.fromEntries(
  PARTICIPANT_DOC_TYPES.map((key, index) => [
    key,
    {
      code: String(index + 1).padStart(3, '0'),
      label: PARTICIPANT_FORM_DEFINITIONS[key].label,
    },
  ]),
);

export function participantFormInfo(key) {
  return PARTICIPANT_FORM_META[key] || { code: '', label: key };
}

export function participantFormLabel(key) {
  const { code, label } = participantFormInfo(key);
  return code ? `${code} - ${label}` : label;
}

// Official attached templates from the previous app; missing entries fall back to a generated blank form.
const FORM_BASE = 'https://media.base44.com/files/public/6a776de48a60f37fdc68021d/';
export const PARTICIPANT_FORM_FILES = {
  'Participant Intake Form': FORM_BASE + '6070150ee_CM-FORM-056-ParticipantIntakeForm31-10-2024_Cleaned.docx',
  'Participant Intake Assessment': FORM_BASE + '9e56b3272_CM-FORM-057-IntakeAssessmentForm31-10-2024_Cleaned.docx',
  'Referral Form': FORM_BASE + '8c0850dbc_CM-FORM-058-ReferralForm31-10-2024_Cleaned.docx',
  'Authority to Act as Advocate': FORM_BASE + '63556826e_CM-FORM-060-AuthoritytoActasanAdvocateForm31-10-2024_Cleaned.docx',
  'Provider Declaration': FORM_BASE + '0925f278e_ProviderDeclarationForm31-10-2024_REDACTED.docx',
  'Participant Handbook': FORM_BASE + 'ef7d3b294_CM-PRC-002-ParticipantHandbook31-10-2024.docx',
  'Participant Support Plan': FORM_BASE + '73720b35a_CM-FORM-061-ParticipantAssessmentandSupportPlan31-10-2024_Cleaned.docx',
  'Individual Risk Assessment': FORM_BASE + '59ec5c736_CM-FORM-034-IndividualRiskAssessmentForm31-10-2024_Cleaned.docx',
  'Home Risk Assessment': FORM_BASE + 'b2072749f_CM-FORM-035-HomeRiskAssessmentForm31-10-2024_Cleaned.docx',
  'Personal Emergency Form': FORM_BASE + '67072d9bf_CM-FORM-050-PersonalEmergencyManagementPlan31-10-20241_Cleaned.docx',
  'Progress Notes': FORM_BASE + 'df5bde95c_CM-FORM-064-ProgressNotes31-10-2024_Cleaned.docx',
  'Progress Reports': FORM_BASE + '6e5e29602_CM-FORM-065-ProgressReport31-10-20242_Cleaned.docx',
  'Satisfaction Survey': FORM_BASE + '80706488a_CM-FORM-066-ParticipantSatisfactionSurvey31-10-2024_Cleaned.docx',
  'Participant Money Register': FORM_BASE + 'de10dfb57_CM-FORM-063-ParticipantMoneyandPropertyRegister31-10-2024_Cleaned.docx',
  'Incident Reports': FORM_BASE + '80fd61a87_CM-FORM-040-IncidentReportForm31-10-20242_Cleaned.docx',
  'Mealtime Management Plan': FORM_BASE + '9e9a54c22_CM-FORM-070-MealtimeManagementPlan31-10-2024_Cleaned.docx',
  'Medication Administration Record': FORM_BASE + 'e94da4d9b_CM-FORM-074-MedicationAdministrationRecord31-10-2024_Cleaned.docx',
  'Medication Consent': FORM_BASE + 'c2f12f32f_CM-FORM-075-MedicationAdministrationConsentForm31-10-2024_Cleaned.docx',
  'SAM Medication Assessment': FORM_BASE + '527884385_CM-FORM-077-Self-AssessmentofMedicationSAMAssessmentTool31-10-2024_NAME_REMOVED.docx',
  'Participant Exit Form': FORM_BASE + 'afb8d6ca3_CM-FORM-068-ParticipantExitForm31-10-2024_Cleaned.docx',
};