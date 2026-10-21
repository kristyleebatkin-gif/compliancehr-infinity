// Master Documentation & Compliance checklist definition.
// Every item the provider must log and record for both staff and participants,
// grouped into sections with their review cadence.
export const CADENCE_MONTHS = {
  'On intake': 0,
  'Monthly': 1,
  '3-monthly': 3,
  '6-monthly': 6,
  '12-monthly': 12,
  'Ongoing': 0,
  'On exit': 0,
};

export const DOCUMENTATION_SECTIONS = [
  // ===== Shared by both employee and participant =====
  {
    key: 'registers',
    title: 'Registers (Logged & Recorded)',
    applies: 'both',
    tone: 'blue',
    items: [
      { key: 'reg-incidents', title: 'Incidents register', cadence: 'Ongoing', note: 'Every incident logged and recorded for both staff and participants.' },
      { key: 'reg-risks', title: 'Risk register', cadence: 'Ongoing', note: 'Every risk, hazard and near miss logged and recorded.' },
      { key: 'reg-feedback', title: 'Feedback register', cadence: 'Ongoing', note: 'All feedback logged and recorded.' },
      { key: 'reg-complaints', title: 'Complaints register', cadence: 'Ongoing', note: 'All complaints logged, recorded and actioned.' },
      { key: 'reg-tasks', title: 'To-do tasks completed checklist', cadence: 'Monthly', note: 'Tasks allocated, completed and signed off.' },
    ],
  },
  {
    key: 'internal-audit',
    title: 'Internal Audit',
    applies: 'both',
    tone: 'violet',
    items: [
      { key: 'audit-checklist', title: 'Internal audit checklist completed', cadence: '3-monthly', note: 'Full internal audit with all items checked.' },
      { key: 'audit-corrective', title: 'Corrective actions checklist', cadence: '3-monthly', note: 'Corrective actions raised from each audit.' },
      { key: 'audit-followup', title: 'Follow-up checklist', cadence: '3-monthly', note: 'Follow-ups closed out and verified.' },
      { key: 'audit-report', title: 'Internal audit report compiled', cadence: '3-monthly', note: 'Report of all internal audits completed, with checklist and corrective/follow-up record attached.' },
    ],
  },
  {
    key: 'compliance-master',
    title: 'Compliance Checklist',
    applies: 'both',
    tone: 'teal',
    items: [
      { key: 'comp-master', title: 'Master compliance checklist reviewed', cadence: '12-monthly', note: 'Whole checklist walked through end to end.' },
    ],
  },
  {
    key: 'business-docs',
    title: 'Business Insurance, Documents & Plans',
    applies: 'both',
    tone: 'pink',
    items: [
      { key: 'biz-insurance', title: 'Business insurance register current', cadence: '12-monthly', note: 'Public liability, professional indemnity and vehicle insurance valid, with certificates of currency filed.' },
      { key: 'biz-docs', title: 'Business documents register current', cadence: '12-monthly', note: 'Business documents structured, filed and kept current for continuity.' },
      { key: 'biz-strategic', title: 'Strategic plan reviewed', cadence: '12-monthly', note: 'Strategic plan kept current and available to managers.' },
      { key: 'biz-plan', title: 'Business plan reviewed', cadence: '12-monthly', note: 'Business plan kept current and available to managers.' },
      { key: 'biz-operational', title: 'Operational plan reviewed', cadence: '12-monthly', note: 'Operational plan kept current and available to managers.' },
    ],
  },

  // ===== Employee (staff) =====
  {
    key: 'staff-files',
    title: 'File Checklist',
    applies: 'employee',
    tone: 'purple',
    items: [
      { key: 'file-checklist', title: 'File checklist reviewed & current', cadence: '12-monthly', note: 'All required staff files present and current.' },
      { key: 'file-vault', title: 'All documents filed & linked', cadence: '12-monthly', note: 'Policies, procedures, forms and plans filed to the vault.' },
    ],
  },
  {
    key: 'staff-intake',
    title: 'Intake & Induction Checklist',
    applies: 'employee',
    tone: 'pink',
    items: [
      { key: 'intake-forms', title: 'Intake/induction checklist completed', cadence: 'On intake', note: 'Full employee intake paperwork completed.' },
      { key: 'intake-buddy', title: 'Buddy shift & skill assessment completed', cadence: 'On intake', note: 'Buddy shifts and skill assessments signed off.' },
      { key: 'intake-ack', title: 'Handbook & policy acknowledgements signed', cadence: 'On intake', note: 'All required acknowledgements recorded.' },
      { key: 'intake-contract', title: 'Employment contract signed & filed', cadence: 'On intake', note: 'Contract on file and linked to the employee.' },
    ],
  },
  {
    key: 'staff-training',
    title: 'Staff Training & Skill Assessment',
    applies: 'employee',
    tone: 'teal',
    items: [
      { key: 'trn-mandatory', title: 'Mandatory training checklist current', cadence: '12-monthly', note: 'All mandatory modules completed and recorded.' },
      { key: 'trn-firstaid', title: 'First aid & CPR certificates current', cadence: '12-monthly', note: 'Certificates valid and on file.' },
      { key: 'trn-screening', title: 'NDIS worker screening current', cadence: '12-monthly', note: 'Screening check valid and on file.' },
      { key: 'trn-police', title: 'Police check current', cadence: '12-monthly', note: 'Check valid and on file.' },
      { key: 'trn-wwcc', title: 'Working with children check current', cadence: '12-monthly', note: 'Check valid and on file.' },
      { key: 'trn-skills', title: 'Skill assessment checklist current', cadence: '12-monthly', note: 'Competencies assessed and recorded.' },
    ],
  },
  {
    key: 'staff-performance',
    title: 'Staff Performance & Appraisals',
    applies: 'employee',
    tone: 'yellow',
    items: [
      { key: 'perf-appraisal', title: 'Performance & appraisal checklist completed', cadence: '12-monthly', note: 'Annual appraisal recorded.' },
      { key: 'perf-supervision', title: 'Supervision & development review completed', cadence: '12-monthly', note: 'Development goals set and reviewed.' },
    ],
  },
  {
    key: 'staff-qualifications',
    title: 'Staff Qualifications Checklist',
    applies: 'employee',
    tone: 'blue',
    items: [
      { key: 'qual-verified', title: 'Qualifications verified & filed', cadence: '12-monthly', note: 'Certificates verified against originals.' },
      { key: 'qual-licences', title: 'Certificates & licences current', cadence: '12-monthly', note: 'All licences within expiry.' },
    ],
  },
  {
    key: 'staff-legal',
    title: 'Legal Requirements Checklist',
    applies: 'employee',
    tone: 'red',
    items: [
      { key: 'legal-review', title: 'Legal requirements checklist reviewed', cadence: '12-monthly', note: 'Organisational legal obligations checked.' },
      { key: 'legal-right-to-work', title: 'Right to work verified', cadence: 'On intake', note: 'Evidence sighted and recorded.' },
      { key: 'legal-screening', title: 'Worker screening & checks valid', cadence: '12-monthly', note: 'NDIS screening, police, WWCC within expiry.' },
    ],
  },
  {
    key: 'staff-whs',
    title: 'WHS Checklist',
    applies: 'employee',
    tone: 'orange',
    items: [
      { key: 'whs-checklist', title: 'WHS checklist completed', cadence: '6-monthly', note: 'Work health and safety checks recorded.' },
      { key: 'whs-drills', title: 'Fire/evacuation drills completed', cadence: '6-monthly', note: 'Drills logged with outcomes.' },
      { key: 'whs-kits', title: 'First aid & emergency equipment checked', cadence: '6-monthly', note: 'Kits, alarms and extinguishers tested.' },
      { key: 'whs-hazards', title: 'Hazards & near misses reported', cadence: 'Ongoing', note: 'All hazards logged in the risk register.' },
    ],
  },
  {
    key: 'staff-car',
    title: 'Car Safety Check Checklist',
    applies: 'employee',
    tone: 'orange',
    items: [
      { key: 'car-check', title: 'Car safety check completed', cadence: '6-monthly', note: 'Vehicle used for support checked and logged.' },
      { key: 'car-rego', title: 'Registration, insurance & licence current', cadence: '12-monthly', note: 'Documents valid and on file.' },
    ],
  },
  {
    key: 'staff-governance',
    title: 'Commitments, Secondary Employment & Conflict of Interest',
    applies: 'employee',
    tone: 'pink',
    items: [
      { key: 'gov-commitments', title: 'Commitments register reviewed', cadence: '12-monthly', note: 'External commitments declared.' },
      { key: 'gov-secondary', title: 'Secondary employment declared', cadence: '12-monthly', note: 'Any other employment recorded and assessed.' },
      { key: 'gov-coi', title: 'Conflict of interest declaration signed', cadence: '12-monthly', note: 'Declarations current and managed.' },
    ],
  },
  {
    key: 'staff-exits',
    title: 'Exits & Offboarding',
    applies: 'employee',
    tone: 'slate',
    items: [
      { key: 'exit-staff', title: 'Exit/offboarding checklist completed', cadence: 'On exit', note: 'Exits recorded with all items returned and closed.' },
    ],
  },

  // ===== Participant =====
  {
    key: 'part-goals',
    title: 'Participant Goals & Support Plan',
    applies: 'participant',
    tone: 'green',
    items: [
      { key: 'goal-review', title: 'Participant goals reviewed', cadence: '3-monthly', note: 'Goals and steps reviewed each quarter.' },
      { key: 'plan-review', title: 'Support plan review completed', cadence: '3-monthly', note: 'Support plan reviewed and updated.' },
    ],
  },
  {
    key: 'part-risk',
    title: 'Participant Risk Assessments',
    applies: 'participant',
    tone: 'red',
    items: [
      { key: 'risk-home', title: 'Home risk assessment completed', cadence: 'Monthly', note: 'Home environment assessed each month.' },
      { key: 'risk-individual', title: 'Individual risk assessment completed', cadence: '3-monthly', note: 'Individual risk management reviewed each quarter.' },
    ],
  },
  {
    key: 'part-consents',
    title: 'Consent Forms',
    applies: 'participant',
    tone: 'pink',
    items: [
      { key: 'consent-audit', title: 'Audit consent confirmed', cadence: '12-monthly', note: 'Audit consent recorded with evidence.' },
      { key: 'consent-sharing', title: 'Information sharing consent', cadence: '12-monthly', note: 'Consent to share information recorded.' },
      { key: 'consent-medication', title: 'Medication consent', cadence: '12-monthly', note: 'Consent to administer medication recorded.' },
      { key: 'consent-money', title: 'Money & financial handling consent', cadence: '12-monthly', note: 'Consent for money handling recorded.' },
      { key: 'consent-advocate', title: 'Advocate authorisation', cadence: '12-monthly', note: 'Advocate/representative authorisation recorded.' },
    ],
  },
  {
    key: 'part-medication',
    title: 'Medication',
    applies: 'participant',
    tone: 'yellow',
    items: [
      { key: 'med-records', title: 'Medication records & dosage current', cadence: 'Monthly', note: 'Medication chart checked each month.' },
      { key: 'med-admin', title: 'Medication administration checked', cadence: 'Monthly', note: 'Administration records verified.' },
    ],
  },
  {
    key: 'part-emergency',
    title: 'Emergency Response Checklist',
    applies: 'participant',
    tone: 'orange',
    items: [
      { key: 'emg-checklist', title: 'Emergency response checklist completed', cadence: '3-monthly', note: 'Emergency response plan walked through.' },
      { key: 'emg-contacts', title: 'Emergency contacts & plan current', cadence: '3-monthly', note: 'Contacts, doctors and plan up to date.' },
    ],
  },
  {
    key: 'part-feedback',
    title: 'Feedback, Complaints & Surveys Checklist',
    applies: 'participant',
    tone: 'blue',
    items: [
      { key: 'fb-feedback', title: 'Feedback register current', cadence: 'Ongoing', note: 'Participant feedback logged and recorded.' },
      { key: 'fb-complaints', title: 'Complaints register current', cadence: 'Ongoing', note: 'Complaints logged, resolved and recorded.' },
      { key: 'fb-surveys', title: 'Surveys checklist completed', cadence: '3-monthly', note: 'Satisfaction surveys completed and reviewed.' },
    ],
  },
  {
    key: 'part-exits',
    title: 'Exits & Transitions',
    applies: 'participant',
    tone: 'slate',
    items: [
      { key: 'exit-participant', title: 'Exit/transition checklist completed', cadence: 'On exit', note: 'Exits and service transitions recorded.' },
    ],
  },
];

export function sectionsFor(kind) {
  const target = kind === 'participant' ? 'participant' : 'employee';
  return DOCUMENTATION_SECTIONS.filter((s) => s.applies === 'both' || s.applies === target);
}

export function addMonths(dateStr, months) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

export function itemStatus(entry) {
  if (!entry) return { label: 'Not logged', className: 'bg-muted text-muted-foreground' };
  const today = new Date().toISOString().slice(0, 10);
  if (entry.next_due_date && entry.next_due_date < today) return { label: 'Overdue', className: 'bg-danger/15 text-danger' };
  return { label: 'Current', className: 'bg-safe/15 text-safe' };
}