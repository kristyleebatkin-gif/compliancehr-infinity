/**
 * Compliance HR - fillable definitions for the employee intake document set.
 * Each entry mirrors the questions on the official form so the same form can
 * be downloaded blank or completed online in the intake workflow.
 */
const field = (label, multiline = false) => ({ label, multiline });

const personal = [
  field('Employee full name'),
  field('Date of birth'),
  field('Address'),
  field('Phone and email'),
  field('Emergency contact name and phone'),
];

export const EMPLOYEE_FORM_DEFINITIONS = {
  'Staff Information Form': {
    fields: [
      ...personal,
      field('Preferred name'),
      field('Position and employment type'),
      field('Tax file number'),
      field('Superannuation fund and member number'),
      field('Banking details (BSB, account number, account name)'),
      field('Right to work evidence or visa details'),
    ],
  },
  'Staff Onboarding Form': {
    fields: [
      ...personal,
      field('Commencement date'),
      field('Position and supervisor'),
      field('Onboarding checklist items completed', true),
      field('Accounts, keys and equipment issued', true),
      field('Completed by and date'),
    ],
  },
  'Staff Induction Form': {
    fields: [
      ...personal,
      field('Induction date'),
      field('Inducted by'),
      field('Topics covered (policies, safety, NDIS Practice Standards)', true),
      field('Questions answered and acknowledgement'),
      field('Signature date'),
    ],
  },
  'Employment Contract': {
    fields: [
      field('Employee full name'),
      field('Position and classification'),
      field('Commencement date'),
      field('Employment type (full time / part time / casual)'),
      field('Hours of work'),
      field('Hourly rate and allowances'),
      field('Key terms, duties and notice period', true),
      field('Employee signature and date'),
      field('Employer signature and date'),
    ],
  },
  'Position Description': {
    fields: [
      field('Position title'),
      field('Department / service'),
      field('Reports to'),
      field('Award and classification'),
      field('Key responsibilities and duties', true),
      field('Qualifications and experience required', true),
      field('Approved by and date'),
    ],
  },
  '100 Points of Identification Checklist': {
    fields: [
      field('Employee full name'),
      field('Date of birth'),
      field('Documents sighted by'),
      field('Total points'),
      field('Sighting date'),
    ],
    columns: ['Document type', 'Reference number', 'Expiry date', 'Points'],
    rows: 10,
  },
  'NDIS Code of Conduct Acknowledgement': {
    fields: [
      ...personal,
      field('Acknowledgement: I have read and agree to act in accordance with the NDIS Code of Conduct', true),
      field('Signature date'),
    ],
  },
  'NDIS Act 2013 Acknowledgement': {
    fields: [
      ...personal,
      field('Acknowledgement: I have read and understand my obligations under the NDIS Act 2013', true),
      field('Signature date'),
    ],
  },
  'NDIS Practice Standards Acknowledgement': {
    fields: [
      ...personal,
      field('Acknowledgement: I understand the NDIS Practice Standards relevant to my role', true),
      field('Signature date'),
    ],
  },
  'Work Health and Safety Act 2011 (Qld) Acknowledgement': {
    fields: [
      ...personal,
      field('Acknowledgement: I understand my work health and safety obligations under the WHS Act 2011 (Qld)', true),
      field('Signature date'),
    ],
  },
  'Secondary Employment Form': {
    fields: [
      ...personal,
      field('Secondary employer name'),
      field('Role and hours worked'),
      field('Conflict of interest assessment', true),
      field('Approved by and date'),
    ],
  },
  'Staff Commitment Declaration Form': {
    fields: [
      ...personal,
      field('Declaration statements agreed', true),
      field('Signature and date'),
    ],
  },
  'Training Record': {
    fields: [
      field('Employee full name'),
      field('Employee number'),
      field('Record completed by'),
    ],
    columns: ['Date', 'Training or module', 'Provider', 'Completed', 'Expiry', 'Trainer initials'],
    rows: 12,
  },
  'Performance Review Schedule': {
    fields: [
      field('Employee full name'),
      field('Employee number'),
      field('Reviewer'),
    ],
    columns: ['Review period', 'Review date', 'Reviewer', 'Completed'],
    rows: 8,
  },
  'Performance Review Form': {
    fields: [
      ...personal,
      field('Review period'),
      field('Reviewer and review date'),
      field('Key achievements', true),
      field('Areas for development', true),
      field('Goals for next period', true),
      field('Overall rating'),
      field('Employee comments', true),
    ],
  },
  'Skill Assessment Form': {
    fields: [
      field('Employee full name'),
      field('Employee number'),
      field('Assessor'),
      field('Assessment date'),
      field('Overall competency outcome', true),
    ],
    columns: ['Skill or task', 'Level achieved', 'Assessor initials', 'Date'],
    rows: 12,
  },
  'Staff Exit Form': {
    fields: [
      ...personal,
      field('Exit date'),
      field('Reason for leaving', true),
      field('Exit interview summary', true),
      field('Property, records and access returned'),
      field('Final pay and entitlements confirmed'),
      field('Completed by and date'),
    ],
  },
  'Car Safety Check Form': {
    fields: [
      field('Vehicle make, model and registration'),
      field('Driver'),
      field('Weekly odometer reading'),
    ],
    columns: ['Date', 'Odometer', 'Item checked', 'Result', 'Comments'],
    rows: 14,
  },
  'NDIS Worker Screening Clearance': {
    fields: [
      ...personal,
      field('Screening check number'),
      field('State of issue'),
      field('Expiry date'),
      field('Clearance status'),
      field('Verified by and date'),
    ],
  },
  'Blue Card and/or Police Check': {
    fields: [
      ...personal,
      field('Blue card number and expiry (if applicable)'),
      field('Police check reference and issue date'),
      field('Outcome'),
      field('Verified by and date'),
    ],
  },
  'Car Registration': {
    fields: [
      ...personal,
      field('Vehicle make and model'),
      field('Registration number'),
      field('State of registration'),
      field('Expiry date'),
      field('Compulsory third party insurer'),
      field('Verified by and date'),
    ],
  },
  'Immunisation Record': {
    fields: [
      ...personal,
      field('Record provided by (GP or immunisation provider)'),
      field('Record date'),
    ],
    columns: ['Vaccine', 'Date given', 'Provider', 'Next due'],
    rows: 10,
  },
  'Super Details Declaration Form': {
    fields: [
      ...personal,
      field('Superannuation fund name'),
      field('Fund USI'),
      field('Member number'),
      field('Fund phone and address'),
      field('Declaration: I declare the superannuation details above are correct and I consent to my employer making contributions to this fund', true),
      field('Employee signature and date'),
      field('Office use: processed by and date'),
    ],
  },
  'Disability Discrimination Act 1992': {
    fields: [
      ...personal,
      field('Acknowledgement: I understand my obligations under the Disability Discrimination Act 1992 and will support inclusive, non-discriminatory practice', true),
      field('Signature date'),
    ],
  },
  'Mandatory Reporting Information': {
    fields: [
      field('Employee full name'),
      field('Information acknowledged: reportable incidents, allegations, serious injury and abuse must be reported to the NDIS Commission, and child protection and WHS notifications to the relevant authority', true),
      field('Acknowledged by and date'),
    ],
  },
  'Fire Drill Form': {
    fields: [
      ...personal,
      field('Drill date, time and location'),
      field('Alarm sounded and evacuation start time'),
      field('Evacuation route used and assembly point'),
      field('Roll call completed and all staff accounted for'),
      field('Issues identified and improvements required', true),
      field('Completed by and signature date'),
    ],
  },
  'Staff Handbook': {
    fields: [
      ...personal,
      field('Handbook version received'),
      field('Topics acknowledged: conduct, safety, privacy, incident reporting and employment conditions', true),
      field('Acknowledgement: I have read and understood the Staff Handbook', true),
      field('Signature date'),
    ],
  },
  'Staff File Checklist': {
    fields: [
      field('Employee full name'),
      field('File completed by and date'),
    ],
    columns: ['Document', 'On file', 'Date sighted', 'Expiry', 'Verified by'],
    rows: 20,
  },
};