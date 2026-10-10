/**
 * Compliance HR - Staff fillable forms library.
 * Identity, payroll, screening and audit forms that pre-fill from the
 * staff profile and download as branded PDFs.
 */
const field = (label, multiline = false) => ({ label, multiline });

export const STAFF_FILLABLE_FORMS = [
  {
    key: "Driver's Licence Details", code: 'CM-SF-001',
    fields: [field('Employee full name'), field('Employee number'), field('Licence number'), field('Licence class'), field('State of issue'), field('Expiry date'), field('Conditions or restrictions')],
  },
  {
    key: 'Medicare Card Details', code: 'CM-SF-002',
    fields: [field('Employee full name'), field('Employee number'), field('Medicare card number'), field('Individual reference number'), field('Card colour'), field('Expiry date')],
  },
  {
    key: 'Passport Details', code: 'CM-SF-003',
    fields: [field('Employee full name'), field('Employee number'), field('Passport number'), field('Country of issue'), field('Expiry date')],
  },
  {
    key: 'Birth Certificate or Visa Details', code: 'CM-SF-004',
    fields: [field('Employee full name'), field('Employee number'), field('Document type (birth certificate or visa)'), field('Document number'), field('Country of issue'), field('Visa subclass and work conditions', true)],
  },
  {
    key: 'Blue Card Details', code: 'CM-SF-005',
    fields: [field('Employee full name'), field('Employee number'), field('Blue card number'), field('Expiry date'), field('Card status')],
  },
  {
    key: 'NDIS Worker Screening Clearance', code: 'CM-SF-006',
    fields: [field('Employee full name'), field('Employee number'), field('Screening check number'), field('State of issue'), field('Expiry date'), field('Clearance status')],
  },
  {
    key: 'Tax File Number Declaration', code: 'CM-SF-007',
    fields: [field('Employee full name'), field('Employee number'), field('Tax file number (TFN)'), field('Employment type'), field('Claim tax-free threshold')],
  },
  {
    key: 'Banking Details Form', code: 'CM-SF-008',
    fields: [field('Employee full name'), field('Employee number'), field('Account name'), field('Banking details on file', true)],
  },
  {
    key: 'Superannuation Details Form', code: 'CM-SF-009',
    fields: [field('Employee full name'), field('Employee number'), field('Superannuation details on file', true), field('Choice of fund acknowledged')],
  },
  {
    key: 'Car Registration Details', code: 'CM-SF-010',
    fields: [field('Employee full name'), field('Employee number'), field('Vehicle make and model'), field('Car registration (rego)'), field('State of registration'), field('Expiry date')],
  },
  {
    key: 'Staff File Audit Checklist', code: 'CM-SF-011',
    fields: [
      field('Employee full name'), field('Employee number'), field('Auditor'), field('Audit date'),
      field('Identity documents sighted and current'), field('NDIS worker screening current'), field('Qualifications verified'),
      field('First aid and CPR current'), field('Training records current'), field('Banking and superannuation details current'),
      field('Audit outcome', true), field('Actions required', true),
    ],
  },
  {
    key: 'Complaint Form', code: 'CM-SF-012',
    fields: [field('Complainant name'), field('Contact details and preferred contact method'), field('Employee concerned (if applicable)'), field('Complaint date'), field('Complaint details', true), field('Preferred outcome', true), field('Acknowledgement and consent to contact', true)],
  },
];