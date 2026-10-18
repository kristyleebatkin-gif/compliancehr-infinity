// Source: original staff information/onboarding/induction documents and current Commission Code.
const f = (label, optional = false) => ({ label, optional });
const note = (label, optional = true) => ({ label, multiline: true, optional });
const yes = (label, optional = false) => ({ label, type: 'single', options: ['Yes', 'No', 'Not applicable'], optional });
const checklist = (items) => items.map((label) => ({ label, type: 'single', options: ['Complete', 'Pending', 'Not applicable'] }));
const person = [f('Employee full name', false), f('Preferred name', true), f('Date of birth'), f('Residential address'), f('Residential state'), f('Residential postcode'), f('Postal address (if different)', true), f('Phone'), f('Mobile'), f('Email')];
const contacts = (prefix) => ['name', 'relationship', 'phone', 'email'].map((part) => f(`${prefix} ${part}`, true));
export const EMPLOYEE_SOURCE_FORMS = {
  'Staff Information Form': [
    ...person, f('Title', true), f('Gender (optional)', true), ...contacts('Emergency contact 1'), ...contacts('Emergency contact 2'),
    f('Bank account name'), f('Bank name'), f('Bank branch', true), f('Bank BSB'), f('Bank account number'),
    f('Superannuation fund name'), f('Fund USI'), f('Member number'), f('Tax file number (ATO declaration required)', true), f('Contractor ABN', true),
    yes('Australian citizen'), yes('Permanent resident', true), yes('Working visa held', true), f('Visa expiry date', true), note('Work restrictions'),
    ...contacts('Next of kin'), f('Next of kin address', true),
    ...['legal name', 'trading name', 'address', 'phone', 'email', 'ABN', 'ACN', 'position title'].map((part) => f(`Secondary employer ${part}`, true)), note('Secondary employment duties'),
    ...['Epilepsy', 'Diabetes', 'Heart condition', 'Allergies', 'Other health condition'].flatMap((label) => [yes(`${label} (optional)`, true), note(`${label} details (optional)`)]),
    note('Reasonable adjustments requested (optional)'),
  ],
  'Staff Onboarding Form': [
    f('Employee full name'), f('Position title'), f('Commencement date'), f('Supervisor name'),
    ...checklist(['Job application received', 'Superannuation details received', 'Resume received', 'Interview record completed', 'Position description issued', 'National police check verified', 'Working with children check verified where required', 'NDIS worker screening verified for risk-assessed role', 'Qualifications and licences verified', 'NDIS worker orientation completed', 'Infection prevention training completed', 'Employment agreement issued', '100 points of ID sighted', 'Staff commitment declaration received', 'Contractor ABN verified where applicable']),
    f('Probation review date'), f('Post-probation review date'), note('Onboarding outstanding actions'), f('Completed by'), f('Completion date'),
  ],
  'Staff Induction Form': [
    f('Employee full name'), f('Position title'), f('Commencement date'), f('Supervisor name'), f('Induction date'), f('Inducted by'),
    ...checklist([
      'Organisation mission and values explained', 'Organisation structure explained', 'Reporting requirements explained', 'Compliance responsibilities explained', 'Staff Code of Conduct explained', 'Communication and supervision arrangements explained', 'Position responsibilities explained', 'Delegations of authority explained',
      'HR employment forms completed', 'Position description explained', 'Employment contract returned', 'Pay and leave arrangements explained', 'Timesheet process explained', 'Worker screening requirements explained', 'Police check requirements explained', 'Working with children requirements explained', 'Petty cash process explained', 'Equal opportunity and harassment procedures explained',
      'NDIS Code of Conduct explained', 'NDIS worker orientation completed', 'New worker induction completed', 'Effective communication training addressed', 'Safe mealtime training addressed', 'Infection prevention training addressed',
      'Workplace amenities and exits shown', 'Sign-in and supplies locations shown', 'Computer and equipment issued', 'System access established', 'Phone issued where applicable', 'Credit card issued where applicable', 'Keys issued where applicable', 'Vehicle access addressed',
      'Participant rights explained', 'Informed choice and consent explained', 'Privacy and confidentiality explained', 'Individual risk assessment explained', 'Cultural competency addressed', 'Support assessment and review explained', 'Risk management system explained', 'Complaints process explained', 'Incident process explained', 'Service delivery procedures explained', 'Interpreter access explained', 'Service access and exit explained', 'Violence and abuse prevention explained', 'Participant money safeguards explained', 'Medication procedures explained', 'Waste procedures explained', 'Standard operating procedures explained', 'Information security explained', 'Conflict of interest process explained', 'Quality management explained',
      'Emergency and disaster plan explained', 'Emergency drills explained', 'Alarm process explained', 'Evacuation procedure explained', 'Evacuation routes shown', 'Assembly area shown', 'Fire equipment locations shown', 'Fire equipment use explained', 'First aid kit location shown', 'Evacuation wardens identified', 'WHS representatives identified', 'WHS duties explained', 'Incident and hazard reporting explained', 'WHS communication explained', 'Contractor processes explained', 'Return to work process explained', 'Chemical storage shown', 'Safety data sheets shown',
    ]), note('Induction questions and clarifications'), note('Outstanding induction actions'), f('Employee signature'), f('Employee signature date'),
  ],
};
export const NDIS_CODE_ACKNOWLEDGEMENTS = [
  'I will respect individual rights to freedom of expression, self-determination and decision-making',
  'I will respect the privacy of people with disability',
  'I will provide supports safely and competently with care and skill',
  'I will act with integrity, honesty and transparency',
  'I will promptly raise and act on quality and safety concerns',
  'I will take all reasonable steps to prevent and respond to violence, exploitation, neglect and abuse',
  'I will take all reasonable steps to prevent and respond to sexual misconduct',
  'I will not charge or represent higher prices for goods supplied to NDIS participants without reasonable justification',
].map((label) => ({ label, type: 'multiple', options: ['Acknowledged'], size: 'long' }));