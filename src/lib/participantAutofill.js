/**
 * Auto-fill helper: maps known participant profile data onto matching
 * participant form field labels so forms start pre-filled.
 */
export function autofillParticipantValue(label, participant = {}) {
  const l = String(label).toLowerCase();
  const p = participant;
  const join = (...parts) => parts.filter((part) => part !== undefined && part !== null && String(part).trim() !== '').join(' | ');

  if (l.includes('full name and id')) return join(p.full_name, p.ndis_number && `NDIS ${p.ndis_number}`);
  if (l.includes('participant full name')) return p.full_name || '';
  if (l.includes('participant name or anonymous')) return p.full_name || '';
  if (l.includes('participant id / ndis') || (l.includes('ndis number') && !l.includes('plan'))) return p.ndis_number || '';
  if (l.includes('date of birth')) return p.date_of_birth || '';
  if (l === 'address' || l.startsWith('address') || l.includes('assessment address')) return p.address || '';
  if (l.includes('phone and email')) return join(p.phone, p.email);
  if (l.includes('emergency contact')) return join(p.emergency_contact, p.emergency_contact_phone);
  if (l.includes('plan manager')) return join(p.plan_manager, p.plan_manager_email);
  if (l.includes('support coordinator')) return p.support_coordinator || '';
  if (l.includes('current medicines') || l.includes('medication name, strength')) return p.medications_dosage || '';
  if (l.includes('advocate full name') || l.includes('representative full name')) return p.advocate_representative || '';
  if (l.includes('disability, health and communication')) return p.medical_diagnosis || '';
  if (l.includes('assessment address and date')) return p.address || '';
  return '';
}

/**
 * Builds the initial answer set for a form: every field gets its
 * auto-filled value where a mapping exists, otherwise blank.
 */
export function buildAutofilledAnswers(fields, participant = {}) {
  return Object.fromEntries(fields.map((field) => [field.label, autofillParticipantValue(field.label, participant)]));
}