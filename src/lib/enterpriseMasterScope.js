// Owner direction: Enterprise Master AI Build Prompt V2.0, 15 November 2026.
// Number ranges reserve catalogue slots. They do not identify implemented or named modules.
export const MASTER_SCOPE_VERSION = '2.0';
const GROUP_NAMES = [
  'Governance Foundation OS', 'Regulatory Compliance OS', 'Enterprise Risk Management OS',
  'Audit & Assurance OS', 'Workforce Management OS', 'Quality & Continuous Improvement OS',
  'Allied Health OS', 'Clinical Governance OS', 'Clinical Operations OS',
  'Medication & Health Management OS', 'Integrated Care Coordination OS', 'Service Agreements & Funding OS',
  'Finance & Revenue OS', 'Governance Risk Compliance (GRC) OS', 'Enterprise Audit Intelligence OS',
  'Information Security OS', 'Cybersecurity & Privacy OS', 'Incident & Crisis Management OS',
  'Enterprise Asset Management OS', 'Vendor & Contractor Management OS', 'Learning & Competency OS',
  'Policy Management OS', 'Document Control OS', 'Strategic Planning OS', 'Program Management OS',
  'Business Continuity OS', 'Emergency Management OS', 'Corporate Performance OS',
  'ESG & Sustainability OS', 'Executive Intelligence OS',
];
export const MASTER_CATALOGUE = GROUP_NAMES.map((name, index) => ({
  id: index + 1, name, first: index * 50 + 1, last: (index + 1) * 50,
  status: 'Scope definition required',
}));
export const MASTER_ROLES = [
  'Board Chair', 'Board Member', 'CEO', 'Managing Director', 'Executive Manager', 'General Manager',
  'Operations Manager', 'Regional Manager', 'Compliance Manager', 'Quality Manager', 'Risk Manager',
  'Clinical Governance Manager', 'Audit Manager', 'Finance Manager', 'HR Manager', 'Learning Manager',
  'ICT Manager', 'Cyber Security Manager', 'Service Delivery Manager', 'Practice Manager', 'Team Leader',
  'Occupational Therapist', 'Speech Pathologist', 'Physiotherapist', 'Psychologist', 'Social Worker',
  'Exercise Physiologist', 'Behaviour Support Practitioner', 'Registered Nurse', 'Enrolled Nurse',
  'Support Coordinator', 'Recovery Coach', 'Plan Manager', 'Scheduler', 'Roster Coordinator',
  'Support Worker', 'Home Care Worker', 'Participant', 'Guardian', 'Family Member', 'Advocate',
  'Auditor', 'Surveyor', 'System Administrator', 'Platform Administrator', 'Platform Owner',
];
export const MASTER_WORKSPACE_ELEMENTS = [
  'Dashboard', 'KPIs', 'Tasks', 'Approvals', 'Notifications', 'Reports', 'Registers', 'Analytics',
  'Documents', 'Evidence', 'Audits', 'Risks', 'Actions', 'Calendar', 'Workflow Queue', 'AI Assistant',
];
export const MODULE_OUTPUTS = [
  'Executive Summary', 'Business Capability Model', 'Module Objectives', 'User Personas', 'User Stories',
  'Functional Requirements', 'Non-Functional Requirements', 'Business Rules', 'Data Model', 'ERD',
  'Entity Catalogue', 'PostgreSQL DDL', 'Prisma Schema', 'OpenAPI Specification', 'UI Screens',
  'Mobile Screens', 'Dashboards', 'Reports', 'KPIs', 'Workflows', 'Automation Rules', 'Notifications',
  'Permissions Matrix', 'Compliance Mapping', 'Evidence Mapping', 'Risk Mapping', 'Audit Mapping',
  'AI Features', 'Test Cases', 'UAT Scenarios', 'Release Readiness Checklist', 'Executive Reporting Design',
  'Board Reporting Design', 'Data Warehouse Mapping', 'Power BI Model', 'Integration Requirements',
  'Security Requirements', 'Accessibility Requirements', 'Performance Requirements', 'Scalability Requirements',
];
export const MASTER_TRACEABILITY = [
  'Legislation', 'Standard', 'Outcome', 'Practice Standard', 'Module', 'Requirement', 'Obligation',
  'Control', 'Procedure', 'Evidence', 'Audit Test', 'Finding', 'CAPA', 'Verification', 'Attestation', 'Board Reporting',
];
export const MASTER_ENGINES = [
  'Workflow', 'Approval', 'Evidence', 'Audit', 'Task', 'Notification', 'Rules', 'Search', 'Reporting',
  'Analytics', 'Document', 'Automation', 'Role', 'Permission', 'Security', 'Integration', 'Provenance',
  'Traceability', 'Data Governance',
];
export const FOUNDATION_SERVICES = [
  'Authentication', 'Identity', 'Authorisation', 'Audit Logging', 'Version Control', 'Activity Tracking',
  'Document Storage', 'Notification', 'AI', 'Search', 'Reporting', 'Analytics', 'Integration',
];
export const MASTER_COPILOTS = ['Executive', 'Compliance', 'Risk', 'Audit', 'Workforce', 'Quality', 'Governance', 'Clinical', 'Finance', 'Participant'];
export const MODULE_AI_REQUIREMENTS = [
  'AI Summary', 'AI Insights', 'AI Recommendations', 'AI Risk Detection', 'AI Compliance Monitoring',
  'AI Audit Support', 'AI Action Generation', 'AI Report Generation', 'AI Evidence Review', 'AI Executive Briefings',
];
export const MASTER_EVIDENCE_REQUIREMENTS = [
  'Evidence Register', 'Evidence Library', 'Evidence Categories', 'Evidence Types', 'Evidence Sources',
  'Evidence Collection', 'Evidence Validation', 'Evidence Verification', 'Evidence Reviews',
  'Evidence Ownership', 'Evidence Expiry', 'Evidence Quality Ratings', 'Evidence Readiness Scores',
];
export const MASTER_INTEGRATIONS = [
  'Microsoft 365', 'Azure AD', 'Microsoft Teams', 'SharePoint', 'Outlook', 'Power BI', 'Xero', 'MYOB',
  'QuickBooks', 'NDIS', 'My Aged Care', 'Medicare', 'DocuSign', 'Stripe', 'Azure OpenAI', 'OpenAI', 'Anthropic',
];
export const MASTER_FRAMEWORKS = [
  'NDIS Practice Standards', 'Aged Care Quality Standards', 'Human Services Quality Standards',
  'ISO 9001', 'ISO 27001', 'ISO 31000', 'NSQHS Standards', 'Privacy Act', 'Fair Work Act',
  'Work Health and Safety', 'Clinical Governance Framework',
];
export const MASTER_SECURITY_REQUIREMENTS = [
  'Zero Trust', 'RBAC', 'ABAC', 'SSO', 'MFA', 'Encryption at Rest', 'Encryption in Transit',
  'Audit Logging', 'Security Monitoring', 'Data Residency Controls',
];
export const MASTER_ENTITY_FIELDS = [
  'id', 'tenant_id', 'created_at', 'updated_at', 'deleted_at', 'created_by', 'updated_by',
  'status', 'version', 'record_owner', 'record_type',
];
export const MASTER_DATABASE_REQUIREMENTS = [
  'Indexes', 'Foreign Keys', 'Constraints', 'Audit Triggers', 'Soft Deletes', 'Temporal Tracking', 'Row Level Security',
];
export const MASTER_API_REQUIREMENTS = ['REST APIs', 'GraphQL APIs', 'OpenAPI 3.1 Specs', 'Webhook Specifications', 'Integration Contracts'];
export const MASTER_DESIGN_REQUIREMENTS = ['Primary Blue', 'Enterprise Purple', 'Intelligence Pink', 'WCAG 2.2 AA', 'Responsive', 'Mobile First', 'Dark Mode', 'Light Mode'];
export const ARCHITECTURE_DECISIONS = [
  'Continue in the existing Base44 Vite React app and shared engines. Do not replace the runtime or duplicate working modules.',
  'PostgreSQL DDL, Prisma, UUID keys, database triggers and foreign keys are requested target contracts. They are not native Base44 guarantees; deployment needs a separately verified persistence and migration design.',
  'Preserve current record IDs and evidence relationships. No UUID conversion or data migration is authorised by a catalogue target alone.',
  'Reconcile all role names against the canonical permission model before creating workspaces. A proposed role never grants access.',
  'Integrations require verified provider capabilities, credentials, consent, data residency and contract tests. Listing a provider does not connect it.',
  'Every module needs applicability, exact evidence versions, owners, approval authority and acceptance evidence. Draft or unverified records remain identifiable; they never support a verified compliance claim.',
  'Validate live tenant separation, denied access, mobile, keyboard and WCAG 2.2 AA behaviour before release. Test count is not coverage evidence.',
];
export function filterMasterCatalogue(query = '') {
  const term = String(query).trim().toLowerCase();
  return MASTER_CATALOGUE.filter(group =>
    !term || group.name.toLowerCase().includes(term) ||
    (group.first.toString().padStart(3, '0') + '-' + group.last.toString().padStart(3, '0')).includes(term),
  );
}
