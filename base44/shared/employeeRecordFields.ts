// Explicit shared fields only: never infer identity from generic names or expiry dates.
export const employeeFields = [
  ['full_name', 'applicant_name', ['Employee full name', 'Employee name', 'Staff full name']],
  ['date_of_birth', 'date_of_birth', ['Date of birth']],
  ['address', 'address', ['Address', 'Residential address']],
  ['phone', 'phone', ['Phone', 'Mobile phone']],
  ['email', 'email', ['Email']],
  ['employee_number', 'employee_id_number', ['Employee ID number', 'Employee number']],
  ['position', 'position', ['Position', 'Position title']],
  ['start_date', 'target_start_date', ['Commencement date', 'Start date']],
  ['emergency_contact', 'emergency_contact_1_name', ['Emergency contact name', 'Emergency contact 1 name']],
  ['emergency_contact_phone', 'emergency_contact_1_phone', ['Emergency contact phone', 'Emergency contact 1 phone']],
  ['banking_details', 'banking_details', ['Banking details', 'Banking details (BSB, account number, account name)']],
  ['superannuation_details', 'superannuation_details', ['Superannuation details']],
  ['tax_file_number', 'tax_file_number', ['Tax file number', 'Tax file number (ATO Tax file number declaration to be completed)']],
  ['car_rego', 'rego_number', ['Rego number', 'Registration number']],
  ['skills', 'qualifications_certificates', ['Qualifications and certificates']],
];
export const canonicalEmployeeForm = (title) => ({ "Driver's License": "Driver's Licence Details", 'Car Registration': 'Car Registration Details', 'Medicare Card': 'Medicare Card Details' }[title] || title);
export const parseAnswers = (value) => typeof value === 'string' ? JSON.parse(value || '{}') : value || {};
export async function eachPage(entity, query, visit) {
  let cursor;
  do {
    const page = await entity.filter(query, { sort: '-updated_date', limit: 100, ...(cursor ? { cursor } : {}) });
    for (const item of page.items) await visit(item);
    cursor = page.has_more ? page.next_cursor : null;
  } while (cursor);
}
export async function updateChanged(entity, record, values) {
  const changed = Object.fromEntries(Object.entries(values).filter(([key, value]) => value !== undefined && JSON.stringify(record[key]) !== JSON.stringify(value)));
  if (Object.keys(changed).length) await entity.update(record.id, changed);
}