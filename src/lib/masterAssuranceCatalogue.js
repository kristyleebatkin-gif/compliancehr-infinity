// Master assurance catalogues: indicators, controls, evidence requirements and
// audit checkpoints, each with a fixed code so every register row can be traced
// Standard -> Indicator -> Control -> Audit checkpoint -> Evidence -> Finding.
//
// The catalogues are reference data (the obligation library). Live compliance is
// never stored here — it is resolved from real register records in
// auditMatrixScoring.js, so nothing on screen can claim an unearned score.

export const CRITICALITY = {
  Critical: { score: 5, tone: 'border-danger/50 bg-danger/15 text-danger' },
  High: { score: 4, tone: 'border-warning/50 bg-warning/20 text-warning' },
  Medium: { score: 3, tone: 'border-brand/40 bg-brand/10 text-brand' },
  Low: { score: 2, tone: 'border-border bg-muted text-foreground' },
  Informational: { score: 1, tone: 'border-border bg-muted text-muted-foreground' },
};

export const RATING_BANDS = [
  { min: 95, label: 'Fully Compliant', tone: 'border-safe/40 bg-safe/10 text-safe' },
  { min: 90, label: 'Substantially Compliant', tone: 'border-safe/40 bg-safe/10 text-safe' },
  { min: 80, label: 'Partially Compliant', tone: 'border-brand/40 bg-brand/10 text-brand' },
  { min: 70, label: 'Improvement Required', tone: 'border-warning/50 bg-warning/20 text-warning' },
  { min: 0, label: 'Major Non-Conformance', tone: 'border-danger/50 bg-danger/15 text-danger' },
];

export const AUDIT_TYPES = ['Desktop review', 'Record sampling', 'Interview', 'Observation', 'System test', 'Document review'];
export const REVIEW_FREQUENCIES = ['Monthly', 'Quarterly', 'Six monthly', 'Annually'];
export const EVIDENCE_FREQUENCIES = ['Continuous', 'Monthly', 'Quarterly', 'Event-driven'];

const CHECK_CYCLE = [
  'evidence sighted and current',
  'owner assigned and accountable',
  'sampled records verified',
  'approved by the delegated authority',
  'reviewed on the scheduled cycle',
  'included in the exception log',
];

const CRITICALITY_CYCLE = ['Critical', 'High', 'High', 'Medium', 'Medium', 'Medium', 'Low'];

const SUBJECTS = [
  'all service sites',
  'sampled participant records',
  'sampled employee files',
  'quarterly assurance cycle',
  'executive review pack',
  'frontline delivery teams',
];

const STANDARD = (code, name) => ({ code, name });

// ---------------------------------------------------------------------------
// Indicator catalogue — IND-001 to IND-150
// ---------------------------------------------------------------------------
const INDICATOR_BANDS = [
  {
    key: 'rights',
    from: 1,
    to: 25,
    domain: 'Rights',
    topics: [
      'Access to supports is equitable', 'Privacy of personal information is maintained', 'Informed consent is recorded',
      'Freedom from abuse and neglect', 'Freedom from unlawful restrictive practice', 'Cultural safety is respected',
      'Communication access is provided', 'Advocacy is available on request', 'Complaints are acknowledged and resolved',
      'Service agreements are explained', 'Choice and control are exercised daily', 'Dignity is maintained in personal care',
      'People participate in decisions about them', 'People can access their own records', 'Financial consent is informed',
      'Support for decision making is available', 'Complaint outcomes are recorded', 'Identity is recognised and respected',
      'Information is provided in accessible formats', 'Interpreter access is arranged', 'Advance care preferences are documented',
      'Contact with family and chosen people is supported', 'Complaint escalation paths are known', 'Rights charter is acknowledged',
      'Restrictive practice consent is documented',
    ],
  },
  {
    key: 'governance',
    from: 26,
    to: 50,
    domain: 'Governance',
    topics: [
      'Governing body accountability is demonstrated', 'Strategic plan is approved and current', 'Delegations of authority are documented',
      'Risk appetite statement is in force', 'Board reporting cadence is met', 'Regulatory obligations register is complete',
      'Policy lifecycle is controlled', 'Conflicts of interest are managed', 'Executive performance is reviewed',
      'Succession plan exists', 'Business continuity plan is tested', 'Insurance cover is adequate',
      'Financial delegations are enforced', 'Internal audit programme is delivered', 'Complaints governance is exercised',
      'Incident governance is exercised', 'Quality committee functions', 'Consumer participation is resourced',
      'Information governance is defined', 'Cyber security governance is defined', 'Vendor governance is defined',
      'Subsidiary governance is defined', 'Board evaluation is completed', 'Regulatory change is managed',
      'Whistleblower protections operate',
    ],
  },
  {
    key: 'environment',
    from: 51,
    to: 65,
    domain: 'Environment',
    topics: [
      'Safe physical environment', 'Fire safety compliance', 'Infection control environment', 'Equipment maintenance',
      'Chemical safety and MSDS', 'Emergency evacuation drills', 'Accessible facilities', 'Hygiene standards',
      'Water and air quality', 'Waste management', 'Vehicle safety', 'Security of premises',
      'Lone worker safety', 'Hazard identification', 'Environmental inspections',
    ],
  },
  {
    key: 'workforce',
    from: 66,
    to: 95,
    domain: 'Workforce',
    topics: [
      'Worker screening', 'Qualification verification', 'Induction completion', 'Mandatory training currency',
      'Supervision frequency', 'Appraisal completion', 'Code of conduct acknowledgement', 'Worker right to be safe',
      'Casual worker induction', 'Volunteer screening', 'Student placement supervision', 'Roster coverage',
      'Workforce planning', 'Lone worker checking', 'Performance management', 'Disciplinary process',
      'Exit process', 'Safe recruitment', 'Position descriptions', 'Delegation of clinical tasks',
      'Training needs analysis', 'Competency assessment', 'Cultural competency', 'First aid currency',
      'Manual handling training', 'Medication competency', 'Worker wellbeing', 'Whistleblower awareness',
      'Agency staff induction', 'Secondment records',
    ],
  },
  {
    key: 'restrictive',
    from: 96,
    to: 100,
    domain: 'Restrictive practices',
    topics: [
      'Restrictive practice authorisation', 'Least restrictive alternative is demonstrated', 'Behaviour support plan currency',
      'Chemical restraint monitoring', 'Restrictive practice reporting',
    ],
  },
  {
    key: 'advancedGov',
    from: 101,
    to: 115,
    domain: 'Advanced governance',
    topics: [
      'Enterprise risk framework', 'Compliance attestation', 'Fraud control', 'Modern slavery statement',
      'Data breach response', 'Cyber incident response', 'Third party assurance', 'Business continuity testing',
      'Scenario testing', 'Executive assurance statements', 'Board assurance statement', 'Internal control certification',
      'Policy exception management', 'Regulatory correspondence', 'Subsidiary assurance',
    ],
  },
  {
    key: 'riskQuality',
    from: 116,
    to: 125,
    domain: 'Risk and quality',
    topics: [
      'Risk register currency', 'Risk treatment effectiveness', 'KRI monitoring', 'Near miss reporting',
      'Root cause analysis', 'Corrective action closure', 'Preventive action effectiveness', 'Quality audit schedule',
      'Consumer feedback is used', 'Improvement reporting',
    ],
  },
  {
    key: 'clinical',
    from: 126,
    to: 135,
    domain: 'Clinical governance',
    topics: [
      'Clinical assessment on entry', 'Care plan review', 'Medication management', 'Clinical supervision',
      'Hospital transfer protocol', 'Deterioration recognition', 'Allied health referral', 'Consent to clinical care',
      'Clinical incident review', 'Clinical data accuracy',
    ],
  },
  {
    key: 'alliedHealth',
    from: 136,
    to: 145,
    domain: 'Allied health',
    topics: [
      'Discipline credentialing', 'Referral triage', 'Outcome measurement', 'Report timeliness',
      'Multidisciplinary case conference', 'Assistive technology prescription', 'Delegation to support staff',
      'Infection control in therapy', 'Telehealth governance', 'Discharge and transition',
    ],
  },
  {
    key: 'outcomes',
    from: 146,
    to: 150,
    domain: 'Outcomes',
    topics: [
      'Participant goal achievement', 'Reduction in restrictive practice', 'Complaint resolution timeliness',
      'Incident recurrence reduction', 'Consumer reported experience',
    ],
  },
];

// ---------------------------------------------------------------------------
// Control catalogue — CTRL-001 to CTRL-050
// ---------------------------------------------------------------------------
const CONTROL_DEFINITIONS = [
  ['Rights and responsibilities', 'Core assurance'],
  ['Informed consent', 'Core assurance'],
  ['Complaints and feedback', 'Core assurance'],
  ['Enterprise risk management', 'Core assurance'],
  ['Incident management', 'Core assurance'],
  ['Workforce screening and competence', 'Core assurance'],
  ['Service delivery and support planning', 'Core assurance'],
  ['Clinical governance', 'Core assurance'],
  ['Restrictive practice governance', 'Core assurance'],
  ['Continuous improvement and CAPA', 'Core assurance'],
  ['Governing body accountability', 'Governance'],
  ['Strategic and business planning', 'Governance'],
  ['Delegations of authority', 'Governance'],
  ['Internal audit programme', 'Governance'],
  ['Regulatory obligations register', 'Governance'],
  ['Policy and procedure lifecycle', 'Governance'],
  ['Conflict of interest management', 'Governance'],
  ['Executive reporting and assurance', 'Governance'],
  ['Business continuity and disaster recovery', 'Governance'],
  ['Insurance and asset protection', 'Governance'],
  ['Financial delegations and expenditure control', 'Finance and procurement'],
  ['Budgeting and variance management', 'Finance and procurement'],
  ['Payroll integrity', 'Finance and procurement'],
  ['Procurement and contract management', 'Finance and procurement'],
  ['Fraud and corruption control', 'Finance and procurement'],
  ['Third party due diligence', 'Finance and procurement'],
  ['Vendor performance monitoring', 'Finance and procurement'],
  ['Supply chain continuity', 'Finance and procurement'],
  ['Modern slavery and ethical sourcing', 'Finance and procurement'],
  ['Board assurance statements', 'Board and executive'],
  ['Board resolution tracking', 'Board and executive'],
  ['Committee effectiveness', 'Board and executive'],
  ['Board evaluation and succession', 'Board and executive'],
  ['Executive assurance declarations', 'Board and executive'],
  ['Subsidiary and entity governance', 'Board and executive'],
  ['Legal and regulatory correspondence', 'Board and executive'],
  ['Whistleblower and speak-up protections', 'Privacy and records'],
  ['Privacy and confidentiality', 'Privacy and records'],
  ['Data classification and retention', 'Privacy and records'],
  ['Access control and identity management', 'Technology and cyber'],
  ['Cyber security operations', 'Technology and cyber'],
  ['Vulnerability and patch management', 'Technology and cyber'],
  ['Backup, recovery and resilience testing', 'Technology and cyber'],
  ['Data quality and integrity', 'Technology and cyber'],
  ['AI model governance', 'Technology and cyber'],
  ['AI human oversight and logging', 'Technology and cyber'],
  ['Enterprise architecture and change control', 'Technology and cyber'],
  ['Technology service continuity', 'Technology and cyber'],
  ['Clinical data and record integrity', 'Clinical and outcomes'],
  ['Consumer outcomes and experience measurement', 'Clinical and outcomes'],
];

// ---------------------------------------------------------------------------
// Evidence catalogue — EVD-001 to EVD-350
// ---------------------------------------------------------------------------
const EVIDENCE_BANDS = [
  { key: 'rights', from: 1, to: 25, documents: [
    'Rights charter', 'Consent form', 'Consent register extract', 'Privacy notice', 'Complaint record',
    'Complaint outcome letter', 'Advocacy referral record', 'Service agreement', 'Communication access plan',
    'Advocate meeting minutes', 'Decision-making support record', 'Feedback survey result'] },
  { key: 'governance', from: 26, to: 60, documents: [
    'Board minutes', 'Board pack', 'Strategic plan', 'Delegation schedule', 'Policy register extract',
    'Policy version history', 'Conflict of interest declaration', 'Executive report', 'Regulatory obligations register',
    'Internal audit report', 'Compliance attestation', 'Insurance certificate'] },
  { key: 'supports', from: 61, to: 90, documents: [
    'Support plan', 'Plan review record', 'Daily support note', 'Goal progress note', 'Assessment tool result',
    'Transition plan', 'Medication assistance record', 'Mealtime support plan', 'Community participation record',
    'Assistive technology prescription'] },
  { key: 'environment', from: 91, to: 110, documents: [
    'Fire safety certificate', 'Evacuation drill record', 'Equipment maintenance log', 'Chemical register extract',
    'MSDS', 'Infection control audit', 'Vehicle safety check', 'Hazard inspection report', 'Waste disposal record',
    'Security access log'] },
  { key: 'workforce', from: 111, to: 135, documents: [
    'Worker screening clearance', 'Qualification certificate', 'Induction record', 'Training completion record',
    'Supervision note', 'Appraisal record', 'Code of conduct acknowledgement', 'Volunteer screening record',
    'Agency induction record', 'Competency assessment'] },
  { key: 'clinical', from: 136, to: 150, documents: [
    'Clinical assessment', 'Care plan', 'Medication chart review', 'Clinical supervision record', 'Hospital transfer record',
    'Deterioration response record', 'Restrictive practice authorisation', 'Allied health report', 'Outcome measure score',
    'Case conference minutes'] },
  { key: 'audit', from: 151, to: 175, documents: [
    'Audit programme', 'Audit checklist', 'Audit report', 'Finding record', 'Corrective action plan',
    'Verification record', 'Audit scheduling record', 'Auditor credential', 'Audit sampling plan', 'Closure evidence'] },
  { key: 'risk', from: 176, to: 195, documents: [
    'Risk register extract', 'Risk assessment', 'Treatment plan', 'KRI dashboard', 'Near miss record',
    'Root cause analysis', 'Risk review minutes', 'Control test result', 'Risk appetite statement', 'Risk owner sign-off'] },
  { key: 'compliance', from: 196, to: 215, documents: [
    'Obligations register extract', 'Compliance calendar', 'Attestation record', 'Legislative change log',
    'Compliance test result', 'Regulatory correspondence', 'Licence and registration', 'Compliance committee minutes',
    'Exception approval', 'Remediation plan'] },
  { key: 'quality', from: 216, to: 230, documents: [
    'Improvement register extract', 'Consumer feedback summary', 'Quality committee minutes', 'Improvement action record',
    'Survey result', 'Benchmark comparison', 'Quality audit result', 'Peer review record', 'Evidence of change',
    'Outcome trend report'] },
  { key: 'incident', from: 231, to: 240, documents: [
    'Incident register extract', 'Incident report', 'Investigation report', 'SIRS notification record', 'Debrief record',
    'Corrective action record', 'Incident trend report', 'Witness statement', 'Reportable incident log',
    'Follow-up verification'] },
  { key: 'cyber', from: 241, to: 250, documents: [
    'Security incident log', 'Access review report', 'Vulnerability scan result', 'Patch compliance report',
    'Backup restore test', 'Penetration test report', 'Security awareness completion', 'MFA coverage report',
    'Asset inventory extract', 'Cyber response exercise record'] },
  { key: 'board', from: 251, to: 265, documents: [
    'Board assurance statement', 'Board resolution', 'Board pack', 'Committee terms of reference',
    'Board evaluation report', 'Director declaration', 'Attendance record', 'Strategy review', 'Board risk report',
    'Governance calendar'] },
  { key: 'executive', from: 266, to: 280, documents: [
    'Executive assurance declaration', 'Executive committee minutes', 'Executive KPI pack', 'Delegation compliance report',
    'Executive performance review', 'Strategic initiative status', 'Regulatory assurance statement',
    'Crisis management test', 'Gifts and benefits register', 'Leadership capability review'] },
  { key: 'finance', from: 281, to: 300, documents: [
    'Financial statements', 'Budget variance report', 'Payroll reconciliation', 'Expenditure approval record',
    'Procurement record', 'General ledger extract', 'Bank reconciliation', 'Insurance schedule',
    'Fraud control assessment', 'Statutory lodgement record'] },
  { key: 'vendor', from: 301, to: 315, documents: [
    'Vendor due diligence record', 'Contract', 'Performance review', 'Service level report', 'Vendor risk assessment',
    'Certificate of currency', 'Data sharing agreement', 'Subcontractor register', 'Exit plan', 'Vendor audit report'] },
  { key: 'data', from: 316, to: 330, documents: [
    'Data classification register', 'Retention schedule', 'Disposal certificate', 'Access matrix',
    'Privacy impact assessment', 'Data quality report', 'Consent register extract', 'Data breach record',
    'Information asset register', 'Data sharing agreement'] },
  { key: 'ai', from: 331, to: 340, documents: [
    'AI model register entry', 'AI governance approval', 'Human review record', 'Prompt library entry',
    'AI output log', 'AI risk assessment', 'Model change record', 'AI incident record', 'Bias and fairness review',
    'AI vendor assurance'] },
  { key: 'architecture', from: 341, to: 350, documents: [
    'Architecture decision record', 'Change request', 'System inventory', 'Integration map', 'Capacity plan',
    'Environment register', 'Deployment record', 'Service catalogue extract', 'Technical debt register',
    'Technology roadmap'] },
];

// ---------------------------------------------------------------------------
// Audit checkpoint catalogue — AUD-001 to AUD-356, grouped into nine domains
// ---------------------------------------------------------------------------
const AUDIT_BANDS = [
  {
    from: 1, to: 25, domain: 'Rights & Responsibilities', category: 'Rights',
    subdomains: ['Consumer rights', 'Privacy', 'Consent', 'Complaints', 'Advocacy'],
    topics: [
      'Rights charter acknowledgement', 'Privacy of personal information', 'Informed consent records',
      'Freedom from abuse and neglect', 'Advocacy access', 'Complaint intake and resolution',
      'Service agreement clarity', 'Choice and control in daily life', 'Communication access', 'Cultural safety',
      'Restrictive practice consent', 'Access to own records',
    ],
    controls: ['CTRL-001', 'CTRL-002', 'CTRL-003', 'CTRL-009'],
    indicators: ['rights', 'restrictive'], evidence: ['rights', 'incident'],
    standards: [
      STANDARD('NDIS Core 1.1', 'Person-centred supports'),
      STANDARD('NDIS Core 1.3', 'Privacy and dignity'),
      STANDARD('NDIS Core 2.1', 'Complaints'),
      STANDARD('ACQS 1', 'The Person'),
      STANDARD('ACQS 2', 'The Organisation'),
    ],
    owner: 'Compliance Manager', reviewer: 'Quality Manager', approver: 'Provider Administrator',
  },
  {
    from: 26, to: 75, domain: 'Governance & Leadership', category: 'Governance',
    subdomains: ['Board governance', 'Policy lifecycle', 'Regulatory obligations', 'Delegations', 'Executive reporting'],
    topics: [
      'Governing body accountability', 'Strategic plan approval', 'Delegation of authority schedule',
      'Regulatory obligations register', 'Policy lifecycle control', 'Conflict of interest declarations',
      'Executive performance review', 'Internal audit programme', 'Consumer participation governance',
      'Compliance attestation', 'Business continuity plan', 'Insurance adequacy',
    ],
    controls: ['CTRL-011', 'CTRL-012', 'CTRL-013', 'CTRL-014', 'CTRL-015', 'CTRL-016', 'CTRL-004', 'CTRL-010'],
    indicators: ['governance', 'advancedGov'], evidence: ['governance', 'compliance', 'board'],
    standards: [
      STANDARD('NDIS Core 2', 'Governance and operational management'),
      STANDARD('ACQS 2', 'The Organisation'),
      STANDARD('ACQS 8', 'Organisational governance'),
      STANDARD('ISO 9001:2015 5', 'Leadership'),
      STANDARD('ISO/IEC 27001:2022 5', 'Leadership'),
    ],
    owner: 'Compliance Manager', reviewer: 'General Manager', approver: 'Provider Administrator',
  },
  {
    from: 76, to: 125, domain: 'Provision of Supports', category: 'Service delivery',
    subdomains: ['Assessment', 'Planning', 'Delivery', 'Transitions', 'Outcomes'],
    topics: [
      'Entry assessment', 'Support plan development', 'Plan review cycle', 'Daily support records',
      'Goal progress notes', 'Transitions and exits', 'Communication supports', 'Medication assistance',
      'Mealtime support', 'Community participation', 'Assistive technology provision', 'Practice standards alignment',
    ],
    controls: ['CTRL-007', 'CTRL-001', 'CTRL-008', 'CTRL-050'],
    indicators: ['outcomes', 'rights', 'alliedHealth'], evidence: ['supports', 'quality'],
    standards: [
      STANDARD('NDIS Core 1.1', 'Person-centred supports'),
      STANDARD('NDIS Core 1.2', 'Individual values and beliefs'),
      STANDARD('ACQS 3', 'Care and services'),
      STANDARD('ACQS 5', 'Clinical care'),
      STANDARD('HSQF 6', 'Service delivery'),
    ],
    owner: 'Service Delivery Manager', reviewer: 'Quality Manager', approver: 'General Manager',
  },
  {
    from: 126, to: 165, domain: 'Workforce Governance', category: 'Workforce',
    subdomains: ['Recruitment', 'Screening', 'Training', 'Supervision', 'Performance'],
    topics: [
      'Worker screening clearance', 'Qualification verification', 'Induction completion', 'Mandatory training currency',
      'Supervision frequency', 'Appraisal completion', 'Code of conduct acknowledgement', 'Volunteer screening',
      'Casual and agency induction', 'Competency assessment', 'Delegation of clinical tasks', 'Exit and offboarding process',
    ],
    controls: ['CTRL-006', 'CTRL-008'],
    indicators: ['workforce'], evidence: ['workforce'],
    standards: [
      STANDARD('NDIS Core 3.1', 'Human resource management'),
      STANDARD('ACQS 7', 'The Workforce'),
      STANDARD('ISO 9001:2015 7.2', 'Competence'),
      STANDARD('NSQHS 1', 'Clinical governance'),
    ],
    owner: 'HR Manager', reviewer: 'Compliance Manager', approver: 'General Manager',
  },
  {
    from: 166, to: 195, domain: 'Environment & Safety', category: 'Environment',
    subdomains: ['Physical environment', 'Fire safety', 'Hygiene', 'Equipment', 'Vehicles'],
    topics: [
      'Safe physical environment', 'Fire safety compliance', 'Infection control environment', 'Equipment maintenance',
      'Chemical safety and MSDS', 'Emergency evacuation drills', 'Accessible facilities', 'Waste management',
      'Vehicle safety checks', 'Lone worker safety', 'Security of premises', 'Hazard identification',
    ],
    controls: ['CTRL-004', 'CTRL-005', 'CTRL-043'],
    indicators: ['environment'], evidence: ['environment', 'incident'],
    standards: [
      STANDARD('NDIS Core 3.2', 'Environment'),
      STANDARD('ACQS 4', 'The Environment'),
      STANDARD('WHS Act 2011', 'Work health and safety'),
      STANDARD('NSQHS 3', 'Preventing and controlling infection'),
    ],
    owner: 'Operations Manager', reviewer: 'Risk Manager', approver: 'General Manager',
  },
  {
    from: 196, to: 235, domain: 'Risk, Compliance & Audit', category: 'Risk and audit',
    subdomains: ['Risk register', 'KRIs', 'Internal audit', 'Findings', 'CAPA'],
    topics: [
      'Risk register currency', 'Risk treatment effectiveness', 'KRI monitoring', 'Near miss reporting',
      'Root cause analysis', 'Corrective action closure', 'Preventive action effectiveness', 'Internal audit scheduling',
      'Finding verification', 'Compliance obligations testing', 'Incident trend analysis', 'Assurance reporting',
    ],
    controls: ['CTRL-004', 'CTRL-005', 'CTRL-010', 'CTRL-014', 'CTRL-021'],
    indicators: ['riskQuality'], evidence: ['risk', 'audit', 'incident'],
    standards: [
      STANDARD('NDIS Core 2', 'Governance and operational management'),
      STANDARD('ACQS 8', 'Organisational governance'),
      STANDARD('ISO 9001:2015 9', 'Performance evaluation'),
      STANDARD('ISO/IEC 27001:2022 9', 'Performance evaluation'),
    ],
    owner: 'Risk Manager', reviewer: 'Compliance Manager', approver: 'General Manager',
  },
  {
    from: 236, to: 275, domain: 'Clinical Governance & Allied Health', category: 'Clinical',
    subdomains: ['Assessment', 'Care planning', 'Medication', 'Clinical supervision', 'Allied health'],
    topics: [
      'Clinical assessment on entry', 'Care plan review', 'Medication management', 'Clinical supervision',
      'Deterioration recognition', 'Hospital transfer protocol', 'Restrictive practice authorisation',
      'Allied health referral triage', 'Outcome measurement', 'Discipline credentialing',
      'Multidisciplinary case conference', 'Discharge and transition',
    ],
    controls: ['CTRL-008', 'CTRL-009', 'CTRL-049', 'CTRL-050'],
    indicators: ['clinical', 'alliedHealth', 'restrictive'], evidence: ['clinical', 'supports'],
    standards: [
      STANDARD('ACQS 5', 'Clinical care'),
      STANDARD('NSQHS 1', 'Clinical governance'),
      STANDARD('NDIS Core 2', 'Governance and operational management'),
      STANDARD('ACQS 3', 'Care and services'),
    ],
    owner: 'Clinical Governance Lead', reviewer: 'Allied Health Manager', approver: 'CEO',
  },
  {
    from: 276, to: 325, domain: 'Board, Executive & Finance', category: 'Board and finance',
    subdomains: ['Board assurance', 'Executive assurance', 'Financial control', 'Insurance', 'Reporting'],
    topics: [
      'Board assurance statement', 'Board pack completeness', 'Resolution tracking', 'Executive assurance declaration',
      'Delegated financial limits', 'Budget variance review', 'Procurement policy compliance', 'Payroll accuracy',
      'Insurance currency', 'Statutory financial reporting', 'Fraud control', 'Subsidiary reporting',
    ],
    controls: ['CTRL-030', 'CTRL-031', 'CTRL-034', 'CTRL-021', 'CTRL-022', 'CTRL-023', 'CTRL-025'],
    indicators: ['governance', 'advancedGov'], evidence: ['board', 'executive', 'finance'],
    standards: [
      STANDARD('ACQS 8', 'Organisational governance'),
      STANDARD('NDIS Core 2', 'Governance and operational management'),
      STANDARD('ISO 9001:2015 9', 'Performance evaluation'),
      STANDARD('Corporations Act 2001', 'Director duties'),
    ],
    owner: 'CEO', reviewer: 'Board Member', approver: 'Board Member',
  },
  {
    from: 326, to: 356, domain: 'Vendor, Data, AI & Technology Governance', category: 'Technology',
    subdomains: ['Vendor governance', 'Data governance', 'Cyber security', 'AI governance', 'Enterprise architecture'],
    topics: [
      'Vendor due diligence', 'Contract performance review', 'Data classification', 'Retention and disposal',
      'Access review', 'Cyber incident response', 'Vulnerability management', 'Backup and recovery testing',
      'AI model register', 'AI human review', 'Prompt and output logging', 'Enterprise architecture standards',
      'Privacy impact assessment', 'Third party data sharing',
    ],
    controls: ['CTRL-026', 'CTRL-027', 'CTRL-038', 'CTRL-039', 'CTRL-040', 'CTRL-041', 'CTRL-042', 'CTRL-045', 'CTRL-046', 'CTRL-047'],
    indicators: ['advancedGov', 'riskQuality'], evidence: ['vendor', 'data', 'cyber', 'ai', 'architecture'],
    standards: [
      STANDARD('ISO/IEC 27001:2022 5.19', 'Supplier relationships'),
      STANDARD('Privacy Act 1988', 'Australian Privacy Principles'),
      STANDARD('ISO/IEC 27001:2022 8', 'Operation'),
      STANDARD('NDIS Core 2', 'Governance and operational management'),
    ],
    owner: 'IT Manager', reviewer: 'Cyber Security Officer', approver: 'CEO',
  },
];

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------
const pad = (value) => String(value).padStart(3, '0');

export const INDICATORS = INDICATOR_BANDS.flatMap((band) =>
  band.topics.map((name, index) => ({
    id: `ind-${pad(band.from + index)}`,
    code: `IND-${pad(band.from + index)}`,
    name,
    band: band.key,
    domain: band.domain,
  }))
);

export const CONTROLS = CONTROL_DEFINITIONS.map(([name, group], index) => {
  const code = `CTRL-${pad(index + 1)}`;
  return { id: `ctrl-${pad(index + 1)}`, code, name, group };
});

export const EVIDENCE_REQUIREMENTS = EVIDENCE_BANDS.flatMap((band) => {
  const size = band.to - band.from + 1;
  return Array.from({ length: size }, (_, offset) => {
    const document = band.documents[offset % band.documents.length];
    const subject = SUBJECTS[Math.floor(offset / band.documents.length) % SUBJECTS.length];
    const code = `EVD-${pad(band.from + offset)}`;
    return { id: `evd-${pad(band.from + offset)}`, code, name: `${document} — ${subject}`, band: band.key };
  });
});

const INDICATORS_BY_BAND = new Map();
INDICATORS.forEach((indicator) => {
  const list = INDICATORS_BY_BAND.get(indicator.band) || [];
  list.push(indicator);
  INDICATORS_BY_BAND.set(indicator.band, list);
});

const EVIDENCE_BY_BAND = new Map();
EVIDENCE_REQUIREMENTS.forEach((item) => {
  const list = EVIDENCE_BY_BAND.get(item.band) || [];
  list.push(item);
  EVIDENCE_BY_BAND.set(item.band, list);
});

const CONTROLS_BY_CODE = new Map(CONTROLS.map((control) => [control.code, control]));

function pickFromBand(bandKeys, offset, index) {
  const key = bandKeys[offset % bandKeys.length];
  const list = index.get(key) || [];
  if (!list.length) return null;
  return list[(offset * 7 + 3) % list.length];
}

export const AUDIT_CHECKPOINTS = AUDIT_BANDS.flatMap((band) => {
  const size = band.to - band.from + 1;
  return Array.from({ length: size }, (_, offset) => {
    const number = band.from + offset;
    const topic = band.topics[offset % band.topics.length];
    const check = CHECK_CYCLE[Math.floor(offset / band.topics.length) % CHECK_CYCLE.length];
    const criticality = CRITICALITY_CYCLE[offset % CRITICALITY_CYCLE.length];
    const weighting = CRITICALITY[criticality].score;
    const inherent = Math.min(100, 40 + weighting * 10 + (offset % 4) * 3);
    const residual = Math.max(8, inherent - 15 - (offset % 5) * 4);
    const indicator = pickFromBand(band.indicators, offset, INDICATORS_BY_BAND);
    const evidence = pickFromBand(band.evidence, offset, EVIDENCE_BY_BAND);
    const controlCode = band.controls[offset % band.controls.length];
    const control = CONTROLS_BY_CODE.get(controlCode);
    const standard = band.standards[offset % band.standards.length];
    const code = `AUD-${pad(number)}`;
    const maxScore = weighting * 20;

    return {
      audit_id: `aud-${pad(number)}`,
      audit_code: code,
      audit_name: `${topic} — ${check}`,
      audit_domain: band.domain,
      audit_subdomain: band.subdomains[offset % band.subdomains.length],
      audit_category: band.category,
      audit_type: AUDIT_TYPES[offset % AUDIT_TYPES.length],
      indicator_id: indicator?.id || '',
      indicator_code: indicator?.code || '',
      indicator_name: indicator?.name || '',
      control_id: control?.id || '',
      control_code: controlCode,
      control_name: control?.name || '',
      evidence_id: evidence?.id || '',
      evidence_code: evidence?.code || '',
      evidence_name: evidence?.name || '',
      standard_code: standard.code,
      standard_name: standard.name,
      risk_id: `RSK-${pad(number)}`,
      risk_rating: criticality,
      criticality,
      inherent_risk_score: inherent,
      residual_risk_score: residual,
      weighting,
      max_score: maxScore,
      pass_score: Math.round(maxScore * 0.9),
      review_frequency: REVIEW_FREQUENCIES[offset % REVIEW_FREQUENCIES.length],
      evidence_frequency: EVIDENCE_FREQUENCIES[offset % EVIDENCE_FREQUENCIES.length],
      owner_role: band.owner,
      reviewer_role: band.reviewer,
      approver_role: band.approver,
      audit_status: 'Scheduled',
      compliance_status: 'Not assessed',
    };
  });
});

export const AUDIT_DOMAINS = AUDIT_BANDS.map((band) => ({
  domain: band.domain,
  from: band.from,
  to: band.to,
  count: band.to - band.from + 1,
  first: `AUD-${pad(band.from)}`,
  last: `AUD-${pad(band.to)}`,
}));

export const AUDIT_CHECKPOINTS_BY_CODE = new Map(AUDIT_CHECKPOINTS.map((row) => [row.audit_code, row]));

export function getCheckpoint(code) {
  return AUDIT_CHECKPOINTS_BY_CODE.get(code) || null;
}

export function catalogueSummary() {
  return {
    audits: AUDIT_CHECKPOINTS.length,
    indicators: INDICATORS.length,
    controls: CONTROLS.length,
    evidence: EVIDENCE_REQUIREMENTS.length,
    domains: AUDIT_DOMAINS.length,
  };
}