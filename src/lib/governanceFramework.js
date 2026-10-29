import {
  ScrollText, Workflow, ClipboardList, FileText, BookOpen, FolderOpen,
  ListChecks, Paperclip, CalendarClock, ShieldCheck, Lightbulb,
} from 'lucide-react';

// The single lifecycle chain every object in the platform follows.
// Nothing in ComplianceHR Infinity exists independently of this chain.
export const LIFECYCLE_STAGES = [
  { key: 'Policy', icon: ScrollText, blurb: 'The governing statement of intent and legal obligation.' },
  { key: 'Procedure', icon: Workflow, blurb: 'The documented steps that put the policy into practice.' },
  { key: 'Plan', icon: ClipboardList, blurb: 'The scheduled plan that delivers the procedure.' },
  { key: 'Form', icon: FileText, blurb: 'The instrument used to capture the work.' },
  { key: 'Register', icon: BookOpen, blurb: 'The master list that indexes every completed form.' },
  { key: 'Record', icon: FolderOpen, blurb: 'The completed, dated, attributable record.' },
  { key: 'Task', icon: ListChecks, blurb: 'The action raised when a record needs something done.' },
  { key: 'Evidence', icon: Paperclip, blurb: 'The proof attached to the record and the task.' },
  { key: 'Review', icon: CalendarClock, blurb: 'The scheduled re-check of the record and its evidence.' },
  { key: 'Audit', icon: ShieldCheck, blurb: 'The independent verification of the whole chain.' },
  { key: 'Improvement', icon: Lightbulb, blurb: 'The corrective action that closes the loop and restarts it.' },
];

const REGISTER = (label, entity, query = {}) => ({ label, entity, query });

// Every source record type automatically feeds these master registers.
export const REGISTER_AUTOMATION = [
  {
    source: 'Participant Intake Form',
    entity: 'ParticipantDocument',
    query: { document_type: 'Participant Intake Form' },
    registers: ['Participant Register', 'Assessment Register', 'Intake Register', 'Compliance Register'],
  },
  {
    source: 'Incident Report',
    entity: 'Incident',
    query: {},
    registers: ['Incident Register', 'Risk Register', 'Notifications Register', 'Audit Register'],
  },
  {
    source: 'Staff Training Completion',
    entity: 'TrainingCompletion',
    query: {},
    registers: ['Training Register', 'Competency Register', 'Compliance Register'],
  },
  {
    source: 'Risk & Hazard Report',
    entity: 'Risk',
    query: {},
    registers: ['Risk Register', 'Hazard Register', 'Audit Register'],
  },
  {
    source: 'Service Agreement',
    entity: 'ParticipantDocument',
    query: { document_type: 'Service Agreement' },
    registers: ['Participant Register', 'Agreement Register', 'Compliance Register'],
  },
  {
    source: 'Policy Acknowledgement',
    entity: 'PolicyAcknowledgement',
    query: {},
    registers: ['Acknowledgement Register', 'Training Register', 'Compliance Register'],
  },
  {
    source: 'Shift / Progress Note',
    entity: 'CommunicationEntry',
    query: { entry_kind: 'Shift Note' },
    registers: ['Progress Note Register', 'Participant Register'],
  },
  {
    source: 'Quality Improvement',
    entity: 'QualityItem',
    query: {},
    registers: ['Continuous Improvement Register', 'CAPA Register', 'Audit Register'],
  },
];

export const registerSourcesFor = (entityName) =>
  REGISTER_AUTOMATION.filter((row) => row.entity === entityName);

export { REGISTER };

// One Click NDIS Audit Pack — the six evidence domains an auditor asks for.
export const AUDIT_PACK_SECTIONS = [
  {
    key: 'Governance',
    blurb: 'Policies, procedures, registers and governance declarations.',
    sources: [
      { label: 'Policies & procedures', entity: 'Policy', title: 'document_name', meta: 'category' },
      { label: 'Policy acknowledgements', entity: 'PolicyAcknowledgement', title: 'policy_name', meta: 'staff_name' },
      { label: 'Master register entries', entity: 'Register', title: 'entry_title', meta: 'register_type' },
      { label: 'Governance objects', entity: 'GovernanceObject', title: 'title', meta: 'lifecycle_stage' },
    ],
  },
  {
    key: 'Staff',
    blurb: 'Qualifications, screening, training and competencies.',
    sources: [
      { label: 'Staff profiles', entity: 'StaffProfile', title: 'full_name', meta: 'position' },
      { label: 'Credentials & screening', entity: 'EmployeeDocument', title: 'title', meta: 'document_type' },
      { label: 'Training completions', entity: 'TrainingCompletion', title: 'module_title', meta: 'employee_name' },
      { label: 'Certificates', entity: 'Certificate', title: 'module_title', meta: 'staff_name' },
    ],
  },
  {
    key: 'Participants',
    blurb: 'Intake, assessments, support plans, goals and progress notes.',
    sources: [
      { label: 'Participant profiles', entity: 'ParticipantProfile', title: 'full_name', meta: 'ndis_number' },
      { label: 'Participant documents', entity: 'ParticipantDocument', title: 'title', meta: 'document_type' },
      { label: 'Assessment records', entity: 'ParticipantFormEntry', title: 'form_type', meta: 'participant_name' },
      { label: 'Goals', entity: 'Goal', title: 'goal', meta: 'participant_name' },
    ],
  },
  {
    key: 'Safety',
    blurb: 'Risks, incidents, emergency plans and drills.',
    sources: [
      { label: 'Risks & hazards', entity: 'Risk', title: 'title', meta: 'category' },
      { label: 'Incidents', entity: 'Incident', title: 'title', meta: 'category' },
      { label: 'Emergency plans', entity: 'EmergencyDocument', title: 'title', meta: 'doc_type' },
      { label: 'Emergency drills', entity: 'EmergencyDrill', title: 'title', meta: 'drill_type' },
    ],
  },
  {
    key: 'Quality',
    blurb: 'Feedback, complaints, improvements and CAPA.',
    sources: [
      { label: 'Feedback', entity: 'Feedback', title: 'subject', meta: 'type' },
      { label: 'Complaints', entity: 'Complaint', title: 'title', meta: 'category' },
      { label: 'Improvement register', entity: 'QualityItem', title: 'title', meta: 'type' },
      { label: 'Improvement actions', entity: 'ImprovementAction', title: 'title', meta: 'area_department' },
    ],
  },
  {
    key: 'Evidence',
    blurb: 'Linked records, signatures and acknowledgements.',
    sources: [
      { label: 'Audit evidence files', entity: 'AuditEvidenceFile', title: 'title', meta: 'standard' },
      { label: 'Document acknowledgements', entity: 'DocumentAcknowledgement', title: 'document_title', meta: 'acknowledged_by_name' },
      { label: 'Corrective actions', entity: 'AuditAction', title: 'title', meta: 'allocated_to' },
      { label: 'Internal audits', entity: 'InternalAudit', title: 'register_audited', meta: 'auditor' },
    ],
  },
];

export const AUDIT_PACK_COLUMNS = [
  { key: 'section', label: 'Pack Section' },
  { key: 'category', label: 'Evidence Category' },
  { key: 'record', label: 'Record' },
  { key: 'detail', label: 'Detail' },
  { key: 'status', label: 'Status' },
  { key: 'created', label: 'Recorded' },
];

// Controlled document categories used by the Document Control Register.
export const DOCUMENT_CATEGORIES = [
  'Governance', 'Policy', 'Procedure', 'Clinical', 'Human Resources', 'WHS',
  'Child Safety', 'Quality', 'Risk', 'Finance', 'IT & Cyber', 'Contracts',
  'Training', 'Operations',
];

export const DOCUMENT_STATUSES = ['Draft', 'Review', 'Approved', 'Archived', 'Superseded'];

export const DECLARATION_TYPES = [
  'Delegation of Authority',
  'Conflict of Interest',
  'Child Safety Declaration',
  'Governance Declaration',
];

// NDIS Practice Standards → the modules, registers and evidence that prove each one.
export const NDIS_PRACTICE_STANDARDS = [
  {
    key: 'Rights & Responsibilities',
    modules: ['/compliance', '/documents'],
    sources: [
      { label: 'Rights policies', entity: 'Policy', query: { category: 'Rights & Responsibilities' } },
      { label: 'Information sharing consents', entity: 'InformationSharingConsent', query: {} },
      { label: 'Complaints', entity: 'Complaint', query: {} },
    ],
  },
  {
    key: 'Provider Governance',
    modules: ['/governance', '/projects'],
    sources: [
      { label: 'Governance policies', entity: 'Policy', query: { category: 'Governance' } },
      { label: 'Controlled documents', entity: 'DocumentControl', query: {} },
      { label: 'Governance controls', entity: 'GovernanceControlRecord', query: {} },
    ],
  },
  {
    key: 'Operational Management',
    modules: ['/registers', '/compliance'],
    sources: [
      { label: 'Master register entries', entity: 'Register', query: {} },
      { label: 'Governance objects', entity: 'GovernanceObject', query: {} },
      { label: 'Staff credentials', entity: 'EmployeeDocument', query: {} },
    ],
  },
  {
    key: 'Provision of Supports',
    modules: ['/our-participants', '/goals'],
    sources: [
      { label: 'Participant documents', entity: 'ParticipantDocument', query: {} },
      { label: 'Goals', entity: 'Goal', query: {} },
      { label: 'Shift notes', entity: 'CommunicationEntry', query: { entry_kind: 'Shift Note' } },
    ],
  },
  {
    key: 'Support Provision Environment',
    modules: ['/risks', '/emergency-response'],
    sources: [
      { label: 'Risks', entity: 'Risk', query: {} },
      { label: 'Incidents', entity: 'Incident', query: {} },
      { label: 'Emergency drills', entity: 'EmergencyDrill', query: {} },
    ],
  },
  {
    key: 'Support Planning',
    modules: ['/our-participants', '/goals'],
    sources: [
      { label: 'Support plans', entity: 'ParticipantDocument', query: { document_type: 'Participant Support Plan' } },
      { label: 'Participant goals', entity: 'Goal', query: {} },
      { label: 'Participant reviews', entity: 'ParticipantReview', query: {} },
    ],
  },
  {
    key: 'Human Resource Management',
    modules: ['/our-employees', '/hr', '/training'],
    sources: [
      { label: 'Staff profiles', entity: 'StaffProfile', query: {} },
      { label: 'Training completions', entity: 'TrainingCompletion', query: {} },
      { label: 'Employee consents', entity: 'EmployeeConsent', query: {} },
    ],
  },
  {
    key: 'Incident Management',
    modules: ['/incidents', '/incident-analytics'],
    sources: [
      { label: 'Incidents', entity: 'Incident', query: {} },
      { label: 'Investigations', entity: 'Investigation', query: {} },
      { label: 'Corrective actions', entity: 'AuditAction', query: {} },
    ],
  },
  {
    key: 'Feedback & Complaints',
    modules: ['/feedback'],
    sources: [
      { label: 'Feedback', entity: 'Feedback', query: {} },
      { label: 'Complaints', entity: 'Complaint', query: {} },
      { label: 'Surveys', entity: 'SatisfactionSurvey', query: {} },
    ],
  },
  {
    key: 'Information Management',
    modules: ['/documents', '/governance'],
    sources: [
      { label: 'Controlled documents', entity: 'DocumentControl', query: {} },
      { label: 'Acknowledgements', entity: 'DocumentAcknowledgement', query: {} },
      { label: 'Data breaches', entity: 'DataBreach', query: {} },
    ],
  },
  {
    key: 'Risk Management',
    modules: ['/risks'],
    sources: [
      { label: 'Risk reports', entity: 'Risk', query: {} },
      { label: 'Governance controls', entity: 'GovernanceControlRecord', query: {} },
      { label: 'Internal audits', entity: 'InternalAudit', query: {} },
    ],
  },
  {
    key: 'Emergency & Disaster Management',
    modules: ['/emergency-response'],
    sources: [
      { label: 'Emergency plans', entity: 'EmergencyDocument', query: {} },
      { label: 'Emergency drills', entity: 'EmergencyDrill', query: {} },
      { label: 'Safety checks', entity: 'SafetyCheck', query: {} },
    ],
  },
  {
    key: 'Restrictive Practices',
    modules: ['/our-participants', '/incidents'],
    sources: [
      { label: 'Restrictive practice records', entity: 'ParticipantSafeguardRecord', query: { record_type: 'Restrictive Practice' } },
      { label: 'Restrictive practice plans', entity: 'ParticipantDocument', query: { document_type: 'Restrictive Practices Record' } },
      { label: 'Related incidents', entity: 'Incident', query: { category: 'Other' } },
    ],
  },
  {
    key: 'High Intensity Supports',
    modules: ['/our-participants', '/training'],
    sources: [
      { label: 'Medication administration records', entity: 'ParticipantSafeguardRecord', query: { record_type: 'Medication Administration' } },
      { label: 'Medication consents', entity: 'ParticipantDocument', query: { document_type: 'Medication Consent' } },
      { label: 'Training completions', entity: 'TrainingCompletion', query: {} },
    ],
  },
  {
    key: 'Specialist Support Coordination',
    modules: ['/our-participants', '/meetings'],
    sources: [
      { label: 'Participant profiles', entity: 'ParticipantProfile', query: {} },
      { label: 'Progress notes', entity: 'CommunicationEntry', query: { entry_kind: 'Shift Note' } },
      { label: 'Meetings', entity: 'Meeting', query: {} },
    ],
  },
];

// Evidence Mapping Engine — the two chains every audit follows.
export const EVIDENCE_CHAINS = [
  {
    key: 'participant',
    title: 'Participant Evidence Chain',
    steps: [
      { label: 'Participant', entity: 'ParticipantProfile', query: {} },
      { label: 'Support Plan', entity: 'ParticipantDocument', query: { document_type: 'Participant Support Plan' } },
      { label: 'Goal', entity: 'Goal', query: {} },
      { label: 'Progress Note', entity: 'CommunicationEntry', query: { entry_kind: 'Shift Note' } },
      { label: 'Outcome', entity: 'GoalProgressNote', query: {} },
      { label: 'Evidence', entity: 'DocumentAcknowledgement', query: {} },
      { label: 'Audit', entity: 'AuditEvidenceFile', query: {} },
    ],
  },
  {
    key: 'staff',
    title: 'Staff Evidence Chain',
    steps: [
      { label: 'Staff', entity: 'StaffProfile', query: {} },
      { label: 'Training', entity: 'TrainingCompletion', query: {} },
      { label: 'Competency', entity: 'Certificate', query: {} },
      { label: 'Roster', entity: 'Shift', query: {} },
      { label: 'Participant Support', entity: 'CommunicationEntry', query: { entry_kind: 'Shift Note' } },
      { label: 'Evidence', entity: 'EmployeeDocument', query: {} },
      { label: 'Audit', entity: 'AuditEvidenceFile', query: {} },
    ],
  },
];

// Enterprise assurance areas — each one backed by its real register or controlled document.
export const ASSURANCE_AREAS = [
  { key: 'Document Control', standard: 'Provider Governance', entity: 'DocumentControl', query: {}, path: '/governance', tab: 'document-control', blurb: 'Version control, approval and review of every controlled document.' },
  { key: 'Delegations of Authority', standard: 'Provider Governance', entity: 'AuthorityDeclaration', query: { declaration_type: 'Delegation of Authority' }, path: '/governance', tab: 'delegations', blurb: 'Who may approve, sign, close and accept on the provider’s behalf.' },
  { key: 'Conflict of Interest', standard: 'Provider Governance', entity: 'AuthorityDeclaration', query: { declaration_type: 'Conflict of Interest' }, path: '/governance', tab: 'delegations', blurb: 'Declarations, management plans and reviews for directors and key personnel.' },
  { key: 'Participant Safeguarding', standard: 'Rights & Responsibilities', entity: 'Incident', query: { category: 'Abuse/Neglect' }, path: '/incidents', blurb: 'Abuse, neglect and exploitation allegations and human rights concerns.' },
  { key: 'Child Safety', standard: 'Rights & Responsibilities', entity: 'DocumentControl', query: { document_category: 'Child Safety' }, path: '/governance', tab: 'document-control', blurb: 'Child safety policy, code of conduct and child safe risk assessments.' },
  { key: 'Restrictive Practices', standard: 'Restrictive Practices', entity: 'ParticipantSafeguardRecord', query: { record_type: 'Restrictive Practice' }, path: '/our-participants', blurb: 'Type, authorisation, practitioner, review dates and reduction strategy.' },
  { key: 'Clinical Governance', standard: 'High Intensity Supports', entity: 'ParticipantSafeguardRecord', query: { record_type: 'Medication Administration' }, path: '/our-participants', blurb: 'Clinical risks, medication, high intensity supports and clinical reviews.' },
  { key: 'Business Continuity & Recovery', standard: 'Emergency & Disaster Management', entity: 'EmergencyDocument', query: {}, path: '/emergency-response', blurb: 'Continuity, disaster recovery, cyber response and outage procedures.' },
  { key: 'Cyber Security', standard: 'Information Management', entity: 'DataBreach', query: {}, path: '/documents', blurb: 'Data breaches, cyber incidents and access audit trails.' },
  { key: 'Contractor Management', standard: 'Human Resource Management', entity: 'VisitorLog', query: { attendance_type: 'Contractor' }, path: '/workforce-presence', blurb: 'Contractor checks, qualifications, insurance and expiry monitoring.' },
  { key: 'Insurance', standard: 'Provider Governance', entity: 'InsurancePolicy', query: {}, path: '/quotes', blurb: 'Public liability, professional indemnity, workers compensation, vehicle and cyber.' },
  { key: 'Asset & Equipment Compliance', standard: 'Support Provision Environment', entity: 'AssetMaintenance', query: {}, path: '/assets', blurb: 'Test and tag, maintenance, calibration, servicing and safety checks.' },
  { key: 'Continuous Improvement', standard: 'Feedback & Complaints', entity: 'ImprovementAction', query: {}, path: '/quality', blurb: 'Complaint, incident, audit or feedback → action → review → effectiveness → closed.' },
  { key: 'Board & Governance', standard: 'Provider Governance', entity: 'GovernanceControlRecord', query: {}, path: '/projects', blurb: 'Board meetings, governance decisions, strategic plan and risk appetite.' },
  { key: 'Vendor & Supplier Management', standard: 'Operational Management', entity: 'Supplier', query: {}, path: '/procurement', blurb: 'Supplier register, assessment, reviews, agreements and performance.' },
  { key: 'Visitor Management', standard: 'Support Provision Environment', entity: 'VisitorLog', query: { attendance_type: 'Visitor' }, path: '/workforce-presence', blurb: 'Visitor register, contractor sign-in and emergency roll call.' },
  { key: 'Participant Funding Governance', standard: 'Provision of Supports', entity: 'ParticipantDocument', query: { document_type: 'NDIS Plan' }, path: '/invoicing', blurb: 'Plan budget, utilisation, remaining funding and overspend risk.' },
  { key: 'Staff Wellbeing', standard: 'Human Resource Management', entity: 'StaffMedicalProfile', query: {}, path: '/hr', blurb: 'Wellness checks, EAP, burnout monitoring, injury and return to work.' },
  { key: 'Evidence Mapping', standard: 'Operational Management', entity: 'AuditEvidenceFile', query: {}, path: '/governance', tab: 'evidence-chain', blurb: 'The participant and staff chains from record to audit evidence.' },
];