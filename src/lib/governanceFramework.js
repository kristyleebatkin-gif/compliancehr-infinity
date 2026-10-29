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