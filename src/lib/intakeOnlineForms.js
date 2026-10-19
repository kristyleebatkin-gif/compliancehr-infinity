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

  if (['participant full name', 'employee full name'].includes(l)) return intakeCase.applicant_name || '';
  if (l === 'date of birth') return intakeCase.date_of_birth || '';
  if (['address', 'residential address'].includes(l)) return intakeCase.address || '';
  if (l.includes('phone and email') || l.includes('contact details and preferred contact method')) {
    return join(intakeCase.email, intakeCase.phone);
  }
  if (l === 'email' || l === 'phone') return intakeCase[l] || '';
  if (l.includes('primary contact')) return intakeCase.primary_contact || '';
  if (l.startsWith('emergency contact')) {
    const contact = l.match(/^emergency contact(?: ([12]))? (name|relationship|phone|email)$/);
    if (contact) return intakeCase[`emergency_contact_${contact[1] || '1'}_${contact[2]}`] || '';
    if (l === 'emergency contact') return join(intakeCase.emergency_contact_1_name, intakeCase.emergency_contact_1_phone);
    return '';
  }
  if (l === 'preferred name and pronouns') return intakeCase.preferred_name_pronouns || '';
  if (l === 'has representative / nominee') return intakeCase.has_representative || '';
  if (l.includes('guardian')) return l.includes('name') ? (intakeCase.guardian_name || '') : (intakeCase.guardian_contact || '');
  if (l.includes('medicare individual reference')) return intakeCase.medicare_irn || '';
  if (l.includes('medicare expiry')) return intakeCase.medicare_expiry || '';
  if (l.includes('medicare')) return intakeCase.medicare_card_number || '';
  if (l.includes('funding categories')) return intakeCase.funding_categories || '';
  if (l.includes('plan manager phone')) return intakeCase.plan_manager_phone || '';
  if (l.includes('plan manager email')) return intakeCase.plan_manager_email || '';
  if (l.includes('support coordinator phone')) return intakeCase.support_coordinator_phone || '';
  if (l.includes('support coordinator email')) return intakeCase.support_coordinator_email || '';
  if (l.includes('doctor')) return l.includes('name') ? (intakeCase.doctor_name || '') : l.includes('email') ? (intakeCase.doctor_email || '') : l.includes('address') ? (intakeCase.doctor_address || '') : (intakeCase.doctor_phone || '');
  if (l.includes('specialist')) return l.includes('name') ? (intakeCase.specialist_name || '') : l.includes('email') ? (intakeCase.specialist_email || '') : l.includes('address') ? (intakeCase.specialist_address || '') : (intakeCase.specialist_phone || '');
  if (l === 'advocate name') return intakeCase.advocate_name || '';
  if (l === 'advocate relationship') return intakeCase.advocate_relationship || '';
  if (l === 'advocate phone') return intakeCase.advocate_phone || '';
  if (l === 'advocate email') return intakeCase.advocate_email || '';
  if (l === 'ndis plan goals') return intakeCase.ndis_plan_goals || '';
  if (l.includes('risks identified')) return intakeCase.risks_identified || intakeCase.risk_summary || '';
  if (l.includes('medication support required')) return intakeCase.medication_support_required ? 'Yes' : 'No';
  if (l.includes('behaviour support required')) return intakeCase.behaviour_support_required ? 'Yes' : 'No';
  if (l.includes('restrictive practice')) return intakeCase.restrictive_practice_identified ? 'Yes' : 'No';
  if (l.includes('mealtime management plan')) return intakeCase.meal_plan_management_plan || '';
  if (l.includes('transport needs')) return intakeCase.transport_needs || '';
  if (l.includes('travel assistance')) return intakeCase.travel_assistance_required ? 'Yes' : 'No';
  if (l === 'employee role') return intakeCase.employee_role || '';
  if (l.includes('why do you want') || l.includes('why apply')) return intakeCase.why_apply || '';
  if (l.includes('right to work')) return intakeCase.right_to_work ? 'Yes' : 'No';
  if (l.includes('driver licence')) return intakeCase.drivers_licence ? 'Yes' : 'No';
  if (l.includes('own vehicle')) return intakeCase.own_vehicle ? 'Yes' : 'No';
  if (l.includes('working with children') || l.includes('wwcc')) return intakeCase.wwcc_number || '';
  if (l.includes('worker screening')) return intakeCase.ndis_worker_screening_number || '';
  if (l.includes('first aid')) return intakeCase.first_aid_current ? 'Yes' : 'No';
  if (l.includes('ndis number')) return intakeCase.ndis_number || '';
  if (l.includes('employee number') || l.includes('employee id')) return intakeCase.employee_id_number || '';
  if (l.includes('medical conditions')) return intakeCase.medical_conditions || '';
  if (l.includes('allerg') || l.includes('anaphylaxis')) return intakeCase.allergies || intakeCase.workplace_adjustments || '';
  if (l.includes('referee 1 name')) return intakeCase.referee_1_name || '';
  if (l.includes('referee 1 phone') || l.includes('referee 1 contact')) return join(intakeCase.referee_1_phone, intakeCase.referee_1_email);
  if (l.includes('referee 2 name')) return intakeCase.referee_2_name || '';
  if (l.includes('referee 2 phone') || l.includes('referee 2 contact')) return join(intakeCase.referee_2_phone, intakeCase.referee_2_email);
  if (l.includes('referees')) return join(intakeCase.referee_1_name, intakeCase.referee_1_phone, intakeCase.referee_2_name, intakeCase.referee_2_phone);
  if (l.includes('availability')) return intakeCase.availability || '';
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
  if (l.includes('rego number')) return intakeCase.rego_number || '';
  if (l.includes('rego')) return intakeCase.current_rego || '';
  if (l.includes('banking details')) return intakeCase.banking_details || '';
  if (l.includes('superannuation')) return intakeCase.superannuation_details || '';
  if (l.includes('tax file number')) return intakeCase.tax_file_number || '';
  if (l.includes('preferred name')) return intakeCase.preferred_name || '';
  if (l.includes('previous employer phone')) return intakeCase.previous_employer_phone || '';
  if (l.includes('previous employer email')) return intakeCase.previous_employer_email || '';
  if (l.includes('previous employer')) return intakeCase.previous_employer || '';
  if (l.includes('qualifications')) return intakeCase.qualifications_certificates || '';
  if (l.includes('hobbies')) return intakeCase.hobbies_interests || '';
  if (l.includes('weekly hours')) return intakeCase.weekly_hours_goal || '';
  if (l.includes('employment provider')) return intakeCase.employment_provider || '';
  if (l.includes('to provide')) return (intakeCase.supports_to_provide || []).join(', ');
  if (l.includes('risks identified')) return intakeCase.risks_identified || intakeCase.risk_summary || '';
  if (l.includes('control measures')) return intakeCase.control_measures || '';
  if (l.includes('medical diagnosis')) return intakeCase.medical_diagnosis || '';
  if (l.includes('medication') || l.includes('current medicines')) return intakeCase.medications_dosage || intakeCase.health_summary || '';
  if (l.includes('special meals') || l.includes('diet')) return intakeCase.special_meals_diets || '';
  if (l.includes('likes')) return intakeCase.likes || '';
  if (l.includes('dislikes')) return intakeCase.dislikes || '';
  if (l.includes('shift dates')) return intakeCase.shift_dates || '';
  if (l.includes('shift times')) return intakeCase.shift_times || '';
  if (l.includes('shifts requested') || l.includes('phone number for shifts')) return intakeCase.shift_contact_phone || '';
  if (l.includes('support type')) return intakeCase.support_type_requested || intakeCase.requested_supports || '';
  if (l.includes('occupational therapist')) return intakeCase.occupational_therapist || '';
  if (l.includes('speech')) return intakeCase.speech_therapist || '';
  if (l.includes('physio')) return intakeCase.physiotherapist || '';
  if (l.includes('other services')) return intakeCase.other_services || '';
  if (l.includes('preferred worker')) return intakeCase.preferred_workers_description || '';
  if (l.includes('advocate')) return join(intakeCase.advocate_name, intakeCase.advocate_contact);
  if (l.includes('consent to share') && l.includes('person')) return intakeCase.consent_to_share_persons || '';
  if (l.includes('pets')) return intakeCase.pets_on_property ? 'Yes' : 'No';
  return '';
}

export function buildIntakeAutofilledAnswers(fields, intakeCase = {}) {
  return Object.fromEntries(
    (fields || []).map((field) => [field.label, autofillIntakeValue(field.label, intakeCase)]),
  );
}