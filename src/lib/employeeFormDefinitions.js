/**
 * Compliance HR - fillable definitions for the employee intake document set.
 * Each entry mirrors the questions on the official form so the same form can
 * be downloaded blank or completed online in the intake workflow. Field sets
 * follow current Australian employment and NDIS provider practice.
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
      field('Preferred name and pronouns'),
      field('Position and employment type'),
      field('Right to work evidence or visa details'),
      field('Tax file number (ATO Tax file number declaration to be completed)'),
      field('Superannuation fund name, USI and member number'),
      field('Banking details (BSB, account number, account name)'),
      field('Next of kin relationship'),
      field('Existing injuries or conditions affecting work (to be recorded in return-to-work plan)'),
    ],
  },
  'Staff Onboarding Form': {
    fields: [
      ...personal,
      field('Commencement date'),
      field('Position and supervisor'),
      field('Employment documents received (contract, position description, handbook)', true),
      field('Payroll details lodged (TFN declaration, super choice, banking)'),
      field('Accounts, keys, badge and equipment issued', true),
      field('Systems access created (app, email, rostering)', true),
      field('Onboarding checklist items completed', true),
      field('Completed by and date'),
    ],
  },
  'Staff Induction Form': {
    fields: [
      ...personal,
      field('Induction date'),
      field('Inducted by'),
      field('Topics covered: policies and procedures', true),
      field('Topics covered: work health and safety and emergency procedures', true),
      field('Topics covered: NDIS Code of Conduct and Practice Standards', true),
      field('Topics covered: privacy, dignity of risk and incident reporting', true),
      field('Questions answered and clarification requested', true),
      field('Employee acknowledgement and signature date'),
    ],
  },
  'Employment Contract': {
    fields: [
      field('Employee full name'),
      field('Position and classification'),
      field('Commencement date'),
      field('Employment type (full time / part time / casual / fixed term)'),
      field('Award or agreement (e.g. SCHADS Award)'),
      field('Ordinary hours of work and rostering arrangements'),
      field('Hourly rate and allowances'),
      field('Probation period'),
      field('Key terms, duties and notice period', true),
      field('Policies incorporated into the contract', true),
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
      field('Position purpose', true),
      field('Key responsibilities and duties', true),
      field('Qualifications and experience required', true),
      field('Screening and clearance requirements (NDIS worker screening, first aid, CPR)'),
      field('Performance measures and review schedule', true),
      field('Approved by and date'),
    ],
  },
  '100 Points of Identification Checklist': {
    fields: [
      field('Employee full name'),
      field('Date of birth'),
      field('Residential address verified'),
      field('Documents sighted by'),
      field('Total points'),
      field('Certified copies held on file'),
      field('Sighting date'),
    ],
    columns: ['Document type', 'Reference number', 'Expiry date', 'Points'],
    rows: 12,
  },
  'NDIS Code of Conduct Acknowledgement': {
    fields: [
      ...personal,
      field('Role and service type'),
      field('Acknowledgement: I will act with respect for individual rights to freedom of expression, self-determination and decision-making', true),
      field('Acknowledgement: I will respect the privacy of people with disability', true),
      field('Acknowledgement: I will provide supports and services in a safe and competent manner with care and skill', true),
      field('Acknowledgement: I will act with integrity, honesty and transparency', true),
      field('Acknowledgement: I will promptly raise concerns about quality and safety of supports', true),
      field('Signature date'),
    ],
  },
  'NDIS Act 2013 Acknowledgement': {
    fields: [
      ...personal,
      field('Acknowledgement: I have read and understand my obligations under the National Disability Insurance Scheme Act 2013', true),
      field('Acknowledgement: I understand the consequences of non-compliance including provider and worker obligations', true),
      field('Signature date'),
    ],
  },
  'NDIS Practice Standards Acknowledgement': {
    fields: [
      ...personal,
      field('Acknowledgement: I understand the NDIS Practice Standards relevant to my role (Core Module and applicable Supplementary Modules)', true),
      field('Acknowledgement: I understand my duty to report incidents and comply with the NDIS (Incident Management and Reportable Incidents) Rules 2018', true),
      field('Signature date'),
    ],
  },
  'Work Health and Safety Act 2011 (Qld) Acknowledgement': {
    fields: [
      ...personal,
      field('Acknowledgement: I understand my work health and safety duties under the Work Health and Safety Act 2011 (Qld)', true),
      field('Acknowledgement: I will take reasonable care of my own safety and the safety of others, and report hazards promptly', true),
      field('Signature date'),
    ],
  },
  'Secondary Employment Form': {
    fields: [
      ...personal,
      field('Secondary employer name and contact'),
      field('Role and hours worked'),
      field('Overlap or conflict with rostered shifts'),
      field('Conflict of interest assessment', true),
      field('Management decision (approved / declined / conditions)', true),
      field('Approved by and date'),
    ],
  },
  'Staff Commitment Declaration Form': {
    fields: [
      ...personal,
      field('Declaration: I will uphold the values, policies and Code of Conduct of the organisation', true),
      field('Declaration: I will disclose any conflict of interest and maintain professional boundaries', true),
      field('Declaration: I consent to verification of my screening, qualifications and references', true),
      field('Declaration: I will report all incidents, hazards and concerns promptly', true),
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
    rows: 14,
  },
  'Performance Review Schedule': {
    fields: [
      field('Employee full name'),
      field('Employee number'),
      field('Reviewer'),
      field('Review cycle (e.g. annual, probation, mid-cycle)'),
    ],
    columns: ['Review period', 'Review date', 'Reviewer', 'Completed'],
    rows: 8,
  },
  'Performance Review Form': {
    fields: [
      ...personal,
      field('Review period and review type'),
      field('Reviewer and review date'),
      field('Key achievements', true),
      field('Areas for development', true),
      field('Goals for next period', true),
      field('Training and development actions agreed', true),
      field('Overall rating'),
      field('Employee comments', true),
      field('Reviewer signature and employee signature date'),
    ],
  },
  'Skill Assessment Form': {
    fields: [
      field('Employee full name'),
      field('Employee number'),
      field('Assessor'),
      field('Assessment date'),
      field('Assessment method (observation, workbook, third-party report)'),
      field('Overall competency outcome', true),
      field('Refresher or follow-up required', true),
    ],
    columns: ['Skill or task', 'Level achieved', 'Assessor initials', 'Date'],
    rows: 14,
  },
  'Staff Exit Form': {
    fields: [
      ...personal,
      field('Exit date'),
      field('Reason for leaving', true),
      field('Exit interview summary', true),
      field('Property, records, keys and access returned'),
      field('Final pay and entitlements confirmed'),
      field('Customer and team handover completed', true),
      field('Records retained in line with policy'),
      field('Completed by and date'),
    ],
  },
  'Car Safety Check Form': {
    fields: [
      field('Vehicle make, model and registration'),
      field('Driver'),
      field('Compulsory third party insurer'),
      field('Weekly odometer reading'),
      field('Roadworthy issues identified', true),
    ],
    columns: ['Date', 'Odometer', 'Item checked', 'Result', 'Comments'],
    rows: 14,
  },
  'NDIS Worker Screening Clearance': {
    fields: [
      ...personal,
      field('Application reference number'),
      field('Screening check number'),
      field('State or territory of issue'),
      field('Date of issue'),
      field('Expiry date'),
      field('Clearance status (cleared / interim / excluded)'),
      field('Safeguarding obligations acknowledged'),
      field('Verified by and date'),
    ],
  },
  'Blue Card and/or Police Check': {
    fields: [
      ...personal,
      field('Blue card number and expiry (if applicable)'),
      field('Police check reference and issue date'),
      field('Police check disclosure outcome (none / disclosed)'),
      field('Risk assessment completed and outcome', true),
      field('Renewal due date'),
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
      field('Business use declared and insurer notified'),
      field('Verified by and date'),
    ],
  },
  'Immunisation Record': {
    fields: [
      ...personal,
      field('Record provided by (GP or immunisation provider)'),
      field('Record date'),
      field('Vaccination objections or medical contraindications declared', true),
    ],
    columns: ['Vaccine', 'Date given', 'Provider', 'Next due'],
    rows: 12,
  },
  'Super Details Declaration Form': {
    fields: [
      ...personal,
      field('Acknowledgement: I have received the ATO Superannuation standard choice form (NAT 71651)'),
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
      field('Acknowledgement: I will make reasonable adjustments to enable equitable participation', true),
      field('Signature date'),
    ],
  },
  'Mandatory Reporting Information': {
    fields: [
      field('Employee full name'),
      field('Acknowledgement: reportable incidents, allegations, serious injury and abuse must be reported to the NDIS Quality and Safeguards Commission', true),
      field('Acknowledgement: child protection and work health and safety notifications must be made to the relevant authority', true),
      field('Acknowledgement: I understand the timeframes and process for reporting', true),
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
      field('Time to full evacuation'),
      field('Issues identified and improvements required', true),
      field('Completed by and signature date'),
    ],
  },
  'Staff Handbook': {
    fields: [
      ...personal,
      field('Handbook version received'),
      field('Topics acknowledged: conduct, safety, privacy, incident reporting and employment conditions', true),
      field('Questions asked and answers provided', true),
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
    rows: 22,
  },
};