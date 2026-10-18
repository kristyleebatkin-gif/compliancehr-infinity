/**
 * Auto-fill helper: maps known staff profile data onto matching staff
 * form field labels so forms start pre-filled.
 */
export function autofillStaffValue(label, staff = {}) {
  const l = String(label).toLowerCase();
  const s = staff;
  const join = (...parts) => parts.filter((v) => v !== undefined && v !== null && String(v).trim() !== '').join(' | ');

  if (l.includes('full name')) return s.full_name || '';
  if (l.includes('employee number')) return s.employee_number || '';
  if (l.includes('name of employee') || l.includes('employee name')) return s.full_name || '';
  if (l.includes('date of birth')) return s.date_of_birth || '';
  if (l.includes('position and level')) return join(s.position, s.position_level);
  if (l.includes('position')) return s.position || '';
  if (l.includes('address')) return s.address || '';
  if (l.includes('phone and email')) return join(s.phone, s.email);
  if (l.includes('tax file number')) return s.tax_file_number || '';
  if (l.includes('account name')) return s.full_name || '';
  if (l.includes('banking details')) return s.banking_details || '';
  if (l.includes('superannuation details')) return s.superannuation_details || '';
  if (l.includes('rego')) return s.car_rego || '';
  if (l.includes('hourly rate')) return s.hourly_rate ? `$${s.hourly_rate}` : '';
  if (/^emergency contact(?: 1)? name$/.test(l)) return s.emergency_contact || '';
  if (/^emergency contact(?: 1)? phone$/.test(l)) return s.emergency_contact_phone || '';
  if (l === 'emergency contact') return join(s.emergency_contact, s.emergency_contact_phone);
  if (l.includes('induction date')) return s.induction_date || '';
  if (l.includes('start date')) return s.start_date || '';
  if (l === 'email') return s.email || '';
  if (l === 'phone') return s.phone || '';
  return '';
}

/**
 * Builds the initial answer set for a staff form: every field gets its
 * auto-filled value where a mapping exists, otherwise blank.
 */
export function buildStaffAutofilledAnswers(fields, staff = {}) {
  return Object.fromEntries(fields.map((field) => [field.label, autofillStaffValue(field.label, staff)]));
}