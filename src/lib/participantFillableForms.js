import { PARTICIPANT_FORM_DEFINITIONS } from '@/lib/participantDocuments';

/**
 * Participant fillable forms available on the participant profile.
 * Most definitions come from the shared participant document register;
 * the general Participant Consent Form is defined here.
 */
const PARTICIPANT_CONSENT_FORM = {
  code: 'CM-FORM-055',
  label: 'Participant Consent Form',
  fields: [
    { label: 'Participant full name' },
    { label: 'Participant ID / NDIS number' },
    { label: 'Date of birth' },
    { label: 'Address' },
    { label: 'Phone and email' },
    { label: 'Emergency contact' },
    { label: 'Consent given for (supports, services or information)', multiline: true },
    { label: 'Consent limitations or conditions', multiline: true },
    { label: 'How consent can be withdrawn', multiline: true },
    { label: 'Consent start and expiry dates' },
    { label: 'Participant / representative consent', multiline: true },
  ],
};

export const PARTICIPANT_FILLABLE_FORMS = [
  'Participant Consent Form',
  'Authority to Act as Advocate',
  'Participant Money Register',
  'Progress Reports',
  'Progress Notes',
  'Satisfaction Survey',
  'Participant Exit Form',
  'Medication Administration Record',
  'Medication Consent',
  'Mealtime Management Plan',
  'SAM Medication Assessment',
  'Medication Evaluation',
  'Incident Reports',
  'Feedback and Complaints',
  'Participant File Audit Checklist',
].map((key) => ({
  key,
  code: key === 'Participant Consent Form' ? PARTICIPANT_CONSENT_FORM.code : (PARTICIPANT_FORM_DEFINITIONS[key]?.code || ''),
  label: key === 'Participant Consent Form' ? PARTICIPANT_CONSENT_FORM.label : (PARTICIPANT_FORM_DEFINITIONS[key]?.label || key),
  fields: key === 'Participant Consent Form' ? PARTICIPANT_CONSENT_FORM.fields : (PARTICIPANT_FORM_DEFINITIONS[key]?.fields || []),
  columns: PARTICIPANT_FORM_DEFINITIONS[key]?.columns,
  rows: PARTICIPANT_FORM_DEFINITIONS[key]?.rows,
}));