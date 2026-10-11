import { PARTICIPANT_FORM_DEFINITIONS } from '@/lib/participantDocuments';
import { EMPLOYEE_FORM_DEFINITIONS } from '@/lib/employeeFormDefinitions';

/**
 * Fillable definitions for every intake document that can be completed
 * online. Participant definitions come from the shared participant form
 * register; employee definitions mirror the official intake forms.
 */
export const INTAKE_FORM_DEFINITIONS = {
  Participant: PARTICIPANT_FORM_DEFINITIONS,
  Employee: EMPLOYEE_FORM_DEFINITIONS,
};

export function intakeFormDefinition(intakeType, docType) {
  return INTAKE_FORM_DEFINITIONS[intakeType]?.[docType] || null;
}

export function canCompleteIntakeFormOnline(intakeType, docType) {
  const definition = intakeFormDefinition(intakeType, docType);
  return Boolean(definition && ((definition.fields || []).length || definition.columns));
}

function autofillIntakeValue(label, intakeCase = {}) {
  const l = String(label).toLowerCase();
  const join = (...parts) => parts
    .filter((part) => part !== undefined && part !== null && String(part).trim() !== '')
    .join(' | ');

  if (l.includes('full name')) return intakeCase.applicant_name || '';
  if (l.includes('date of birth')) return intakeCase.date_of_birth || '';
  if (l.includes('address')) return intakeCase.address || '';
  if (l.includes('phone and email') || l.includes('contact details and preferred contact method')) {
    return join(intakeCase.email, intakeCase.phone);
  }
  if (l === 'email' || l === 'phone') return intakeCase[l] || '';
  if (l.includes('primary contact')) return intakeCase.primary_contact || '';
  if (l.includes('emergency contact')) {
    return join(
      intakeCase.emergency_contact_1_name,
      intakeCase.emergency_contact_1_relationship,
      intakeCase.emergency_contact_1_phone,
    );
  }
  if (l.includes('ndis number')) return intakeCase.ndis_number || '';
  if (l.includes('position')) return intakeCase.position || '';
  if (l.includes('commencement date') || l.includes('start date')) return intakeCase.target_start_date || '';
  if (l.includes('primary support') || l.includes('requested supports') || l.includes('requested services')) {
    return intakeCase.requested_supports || '';
  }
  if (l.includes('reason for')) return intakeCase.reason_for_referral || '';
  if (l.includes('communication')) return intakeCase.communication_needs || '';
  if (l.includes('health')) return intakeCase.health_summary || '';
  if (l.includes('risk')) return intakeCase.risk_summary || '';
  if (l.includes('goals') || l.includes('strengths')) return intakeCase.goals_preferences || intakeCase.ndis_plan_goals || '';
  if (l.includes('plan type') || l.includes('management type')) return intakeCase.plan_type || '';
  if (l.includes('plan manager')) return intakeCase.plan_manager || '';
  if (l.includes('support coordinator')) return intakeCase.support_coordinator || '';
  if (l.includes('referral source')) return intakeCase.referral_source || '';
  return '';
}

export function buildIntakeAutofilledAnswers(fields, intakeCase = {}) {
  return Object.fromEntries(
    (fields || []).map((field) => [field.label, autofillIntakeValue(field.label, intakeCase)]),
  );
}