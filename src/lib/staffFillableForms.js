/**
 * Compliance HR - Staff fillable forms library.
 * Identity, payroll, screening and audit forms that pre-fill from the
 * staff profile and download as branded PDFs. Field sets follow current
 * Australian employment, ATO and NDIS screening practice.
 */
const field = (label, multiline = false) => ({ label, multiline });

export const STAFF_FILLABLE_FORMS = [
  {
    key: "Driver's Licence Details", code: 'CM-SF-001',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Licence number'), field('Licence class (e.g. open, provisional)'),
      field('State of issue'), field('Expiry date'),
      field('Conditions or restrictions (e.g. glasses, automatic only)'),
      field('Verified by and date'),
    ],
  },
  {
    key: 'Medicare Card Details', code: 'CM-SF-002',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Medicare card number'), field('Individual reference number'),
      field('Card colour (green, blue, yellow)'), field('Expiry date'),
      field('Medicare position on card'),
    ],
  },
  {
    key: 'Passport Details', code: 'CM-SF-003',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Passport number'), field('Country of issue'),
      field('Date of issue'), field('Expiry date'),
      field('Citizenship status confirmed for right to work'),
    ],
  },
  {
    key: 'Birth Certificate or Visa Details', code: 'CM-SF-004',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Document type (birth certificate or visa)'),
      field('Document number'), field('Country of issue'),
      field('Visa subclass and work conditions', true),
      field('Visa expiry date'),
      field('Vevo check completed and reference'),
    ],
  },
  {
    key: 'Blue Card Details', code: 'CM-SF-005',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Blue card number'), field('Expiry date'),
      field('Card status (positive notice / application in progress / cancelled)'),
      field('Linked services and exemptions declared'),
      field('Renewal reminder date'),
    ],
  },
  {
    key: 'NDIS Worker Screening Clearance', code: 'CM-SF-006',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Application reference number'),
      field('Screening check number'), field('State or territory of issue'),
      field('Date of issue'), field('Expiry date'),
      field('Clearance status (cleared / interim / excluded)'),
      field('Safeguarding obligations acknowledged'),
    ],
  },
  {
    key: 'Tax File Number Declaration', code: 'CM-SF-007',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Tax file number (TFN)'),
      field('Employment type (full time / part time / casual)'),
      field('Australian resident for tax purposes'),
      field('Claim tax-free threshold'),
      field('Higher education loan program (HELP) or other study debt'),
      field('Claim tax offsets'),
      field('Annual uplift factor election'),
      field('Date form completed'),
    ],
  },
  {
    key: 'Banking Details Form', code: 'CM-SF-008',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Account name'), field('Bank name'),
      field('BSB'), field('Account number'),
      field('Payroll split across accounts (if applicable)'),
      field('Declaration: details are correct and I authorise payment to this account'),
    ],
  },
  {
    key: 'Superannuation Details Form', code: 'CM-SF-009',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Acknowledgement: ATO Superannuation standard choice form (NAT 71651) provided'),
      field('Superannuation fund name'), field('Fund USI'),
      field('Fund ABN'), field('Member number'),
      field('Fund phone and address'),
      field('Choice of fund acknowledged'),
      field('Declaration: details are correct and contributions may be made to this fund'),
    ],
  },
  {
    key: 'Car Registration Details', code: 'CM-SF-010',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Vehicle make and model'),
      field('Car registration (rego)'), field('State of registration'),
      field('Expiry date'),
      field('Compulsory third party insurer'),
      field('Business use declared and insurer notified'),
    ],
  },
  {
    key: 'Staff File Audit Checklist', code: 'CM-SF-011',
    fields: [
      field('Employee full name'), field('Employee number'),
      field('Auditor'), field('Audit date'),
      field('Identity documents sighted and current'),
      field('Right to work evidence verified'),
      field('NDIS worker screening current'),
      field('Blue card / police check current'),
      field('Qualifications verified'),
      field('First aid and CPR current'),
      field('Training records current'),
      field('Banking, superannuation and tax details current'),
      field('Vehicle and insurance details current (if driving)'),
      field('Audit outcome', true),
      field('Actions required', true),
    ],
  },
  {
    key: 'Complaint Form', code: 'CM-SF-012',
    fields: [
      field('Complainant name'),
      field('Contact details and preferred contact method'),
      field('Employee concerned (if applicable)'),
      field('Complaint date and date raised'),
      field('Complaint category (conduct, safety, discrimination, other)'),
      field('Complaint details', true),
      field('Witnesses or supporting evidence', true),
      field('Preferred outcome', true),
      field('Acknowledgement and consent to contact', true),
      field('Received by and date'),
    ],
  },
];