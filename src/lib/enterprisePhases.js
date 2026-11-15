// Owner-directed implementation sequence, 15 November 2026.
// Requirements describe target scope; source mappings never establish acceptance.
export const EVIDENCE_CHAIN = ['Standard', 'Requirement', 'Obligation', 'Control', 'Policy', 'Procedure', 'Evidence', 'Audit', 'Finding', 'Action', 'Improvement', 'Report', 'Executive Dashboard', 'Board Oversight'];
export const PLATFORM_REQUIREMENTS = ['Multi-tenant architecture', 'Organisation management', 'Service management', 'Location management', 'User management', 'Role-based permissions', 'Attribute-based permissions', 'Session management', 'Encryption', 'Audit logging', 'Enterprise reporting', 'AI Core', 'Authentication and SSO', 'MFA', 'Global search', 'Notification centre', 'Mobile framework', 'Router Remote navigation', 'Enterprise design system'];
export const SHARED_ENGINES = ['Workflow', 'Task', 'Approval', 'Evidence', 'Audit', 'Reporting', 'Automation', 'AI', 'Search', 'Security', 'Notification', 'Provenance', 'Versioning', 'Document Management', 'Relationship', 'Data Warehouse'];
export const REQUIRED_WORKSPACES = ['Platform Owner', 'Board Member', 'CEO', 'General Manager', 'Compliance Manager', 'Quality Manager', 'Risk Manager', 'Audit Manager', 'Learning Manager', 'Allied Health Manager', 'Clinical Governance Lead', 'HR Manager', 'Service Manager', 'Team Leader', 'Practitioner', 'Support Coordinator', 'Finance Manager', 'IT Manager', 'Participant', 'External Auditor'];
export const WORKSPACE_ELEMENTS = ['Dashboard', 'Notifications', 'Tasks', 'Reports', 'Registers', 'KPIs', 'AI Assistant', 'Actions', 'Mobile Experience'];
export const AI_ASSISTANTS = ['Compliance', 'Audit', 'Risk', 'Policy', 'Workforce', 'Clinical', 'Board', 'Quality', 'Incident', 'Strategic Planning'];
export const CLINICAL_DISCIPLINES = ['Occupational Therapy', 'Speech Pathology', 'Physiotherapy', 'Psychology', 'Social Work', 'Exercise Physiology'];
export const DIGITAL_TWIN_RECORDS = ['Standards', 'Obligations', 'Controls', 'Policies', 'Procedures', 'Risks', 'Audits', 'Findings', 'Incidents', 'Complaints', 'Workforce Records', 'Clinical Records', 'Strategic Objectives', 'Contracts', 'Vendors', 'Accreditation Requirements', 'Evidence'];
export const RELEASE_GATES = ['Reconcile existing entities, routes and evidence links before adding resources.', 'Verify approved-role access and tenant isolation on the server, including denied access.', 'Verify a complete workflow with exact evidence versions, provenance and approval authority.', 'Test loading, empty, error, export, mobile and keyboard behaviour.', 'Record acceptance evidence and a restorable checkpoint; record publication separately.'];
const system = (name, sourceIds, registers, features, frameworks = []) => ({ name, sourceIds, registers, features, frameworks });
const PREVIOUS_ENTERPRISE_PHASES = [
  { id: 1, title: 'Compliance Foundation', dependsOn: [], gate: 'Reconcile obligation–control–evidence relationships, scoring denominators, evidence versions and policy approval lifecycle. Verify the five executive indicators with authorised real records.',
    systems: [
      system('Compliance OS', ['compliance'], ['Standards', 'Practice Standards', 'Compliance Obligations', 'Legislative', 'Regulatory', 'Control', 'Compliance Assessments'], ['Standards mapping', 'Obligation management', 'Compliance monitoring', 'Control management', 'Compliance scoring', 'Compliance dashboards', 'AI compliance guidance']),
      system('Evidence Intelligence OS', ['evidence'], ['Evidence', 'Evidence Ownership', 'Evidence Relationship', 'Evidence Collection'], ['Central evidence repository', 'Evidence scoring', 'Evidence confidence ratings', 'Evidence traceability', 'Evidence expiry monitoring', 'Evidence lineage mapping', 'Evidence relationships']),
      system('Policy & Document Intelligence OS', ['governance', 'evidence'], ['Policy', 'Procedure', 'Form', 'Template', 'Guidelines'], ['Version control', 'Approval workflows', 'Review scheduling', 'Policy acknowledgements', 'AI content generation', 'Policy mapping to standards', 'Automatic review reminders']),
    ], indicators: ['Compliance Score', 'Evidence Score', 'Obligations Status', 'Policy Review Status', 'Risk Exposure Summary'] },
  { id: 2, title: 'Assurance & Governance', dependsOn: [1], gate: 'Verify the 356-checkpoint catalogue and applicability, audit findings through verified CAPA, defined risk scales and evidence-backed control effectiveness.',
    systems: [
      system('Audit OS', ['audit'], ['Audit Program', 'Audit', 'Audit Findings', 'Recommendations', 'Audit Evidence'], ['Audit planning', 'Audit execution', 'Findings management', 'Recommendations tracking', 'Audit scoring', '356-checkpoint audit framework', 'Evidence verification']),
      system('Enterprise Risk Intelligence OS', ['risk'], ['Strategic Risk', 'Operational Risk', 'Clinical Risk', 'Financial Risk', 'Cyber Risk'], ['Risk assessments', 'Dynamic risk scoring', 'Heat maps', 'Bow-tie analysis', 'Risk treatment plans', 'Scenario modelling']),
      system('Quality Improvement OS', ['quality'], ['Improvement', 'CAPA', 'Lessons Learned'], ['Continuous improvement', 'Corrective actions', 'Preventative actions', 'PDSA cycles', 'Improvement analytics']),
    ] },
  { id: 3, title: 'Workforce & HR Governance', dependsOn: [1, 2], gate: 'Verify worker identity, restricted HR access, credential expiry and competency evidence, supervision and development plan workflows.',
    systems: [
      system('Workforce Intelligence OS', ['workforce'], ['Worker', 'Credential', 'Competency', 'Training', 'Supervision'], ['Workforce compliance', 'Skills matrix', 'Competency assessments', 'Credential expiry tracking', 'Training management', 'Workforce analytics']),
      system('HR Governance OS', ['workforce'], [], ['Position management', 'Performance management', 'Workforce planning', 'Recruitment governance', 'Succession planning']),
      system('Learning & Development OS', ['workforce'], [], ['Learning pathways', 'Course management', 'Competency frameworks', 'Development plans', 'Training dashboards']),
    ] },
  { id: 4, title: 'Operational Governance', dependsOn: [1, 2, 3], gate: 'Verify incident and complaint investigation, escalation and CAPA links; validate restrictive-practice authorisation, consent and reporting rules before activation.',
    systems: [
      system('Incident Intelligence OS', ['clinical', 'risk'], ['Incident', 'Near Miss', 'Serious Incident', 'Behaviour Incident'], ['Incident capture', 'Investigations', 'Root cause analysis', 'Trend analysis', 'CAPA integration', 'Regulatory reporting']),
      system('Complaints & Feedback OS', ['quality'], ['Complaint', 'Compliment', 'Feedback'], ['Complaint investigations', 'Resolution workflows', 'Satisfaction monitoring', 'Service improvement integration']),
      system('Restrictive Practices OS', ['clinical', 'ndis'], [], ['Restrictive practice tracking', 'Authorisation management', 'Monitoring', 'Reporting', 'Compliance assessments']),
    ] },
  { id: 5, title: 'Board & Executive Governance', dependsOn: [1, 2, 4], gate: 'Verify declarations, decision authority, board evidence versions, action closure and the strategy-to-KPI chain in the four executive workspaces.',
    systems: [
      system('Board Governance OS', ['governance'], ['Board', 'Director', 'Meeting', 'Action', 'Conflict'], ['Board papers', 'Board packs', 'Governance calendar', 'Director declarations', 'Decision tracking']),
      system('Strategic Planning OS', ['governance', 'executive'], [], ['Strategic plans', 'Strategic pillars', 'Objectives', 'Initiatives', 'KPIs', 'Benefits tracking', 'Vision → Strategic Pillar → Strategic Goal → Objective → Initiative → KPI']),
      system('Executive Intelligence Layer', ['executive'], [], ['Board Workspace', 'CEO Workspace', 'General Manager Workspace', 'Executive Leadership Workspace', 'Organisation Health', 'Risk Exposure', 'Compliance Performance', 'Strategic Progress']),
    ] },
  { id: 6, title: 'Clinical & Allied Health Governance', dependsOn: [1, 2, 3, 4], gate: 'Verify consent and clinical record boundaries, practitioner scope, assessment provenance, supervision and outcome measures for all six disciplines.',
    systems: [
      system('Allied Health OS', ['allied-health'], [], ['Assessments', 'Treatment plans', 'Goal tracking', 'Outcome measurement', 'Clinical documentation', ...CLINICAL_DISCIPLINES]),
      system('Clinical Governance OS', ['clinical'], ['Clinical Risk', 'Clinical Incident', 'Clinical Audit', 'Outcome Measures'], ['Clinical supervision', 'Peer review', 'Case conferencing', 'Clinical audits', 'Care planning', 'Service effectiveness reviews'], ['Queensland Health', 'NSQHS', 'AHPRA']),
      system('Participant Experience OS', ['allied-health', 'ndis'], [], ['Goals management', 'Outcomes tracking', 'Satisfaction measurement', 'Participant journey analytics', 'Experience dashboards']),
    ] },
  { id: 7, title: 'Financial & Commercial Governance', dependsOn: [1, 2, 5], gate: 'Reconcile existing finance, contracts and suppliers before extending them. Verify budget and funding provenance, approval authority, renewals and vendor evidence.',
    systems: [
      system('Financial Governance OS', ['executive'], [], ['Budget management', 'Funding management', 'Grant management', 'Financial risk monitoring', 'Financial governance reporting']),
      system('Contract Governance OS', ['governance'], [], ['Contract lifecycle management', 'Contract approvals', 'Contract reviews', 'Renewal monitoring']),
      system('Vendor Governance OS', ['governance', 'risk'], [], ['Vendor risk management', 'Vendor performance reviews', 'Insurance tracking', 'Procurement governance']),
    ] },
  { id: 8, title: 'Cyber Security & Privacy', dependsOn: [1, 2], gate: 'Security and privacy enforcement are foundation prerequisites from the start. This phase expands their specialist registers, access reviews, breach response and framework assessments.',
    systems: [
      system('Cyber Security OS', ['risk'], ['Security Asset', 'Vulnerability', 'Security Incident'], ['Security assessments', 'Security controls', 'Access reviews', 'Vulnerability management'], ['ISO 27001', 'Essential Eight', 'NIST']),
      system('Privacy Governance OS', ['clinical', 'governance'], [], ['Privacy impact assessments', 'Consent management', 'Data breach management', 'Privacy compliance monitoring']),
    ] },
  { id: 9, title: 'Enterprise Intelligence', dependsOn: [1, 2, 3, 4, 5, 6, 7, 8], gate: 'Verify authorised indexing and retrieval, KPI definitions, lineage, freshness, report schedules and warehouse reconciliation; no unauthorised data enters search or AI context.',
    systems: [
      system('Enterprise Reporting OS', ['reporting', 'executive'], [], ['Enterprise dashboards', 'KPI warehouse', 'Regulatory reporting', 'Compliance reporting', 'Executive reporting', 'Board reporting']),
      system('Knowledge Management OS', ['ai-core', 'evidence'], [], ['Knowledge repository', 'SOP library', 'AI knowledge assistants', 'Enterprise learning hub']),
      system('Enterprise Search OS', ['ai-core'], [], ['Cross-module search', 'Semantic AI search', 'Evidence discovery', 'Enterprise-wide indexing']),
    ] },
  { id: 10, title: 'Advanced Governance & Accreditation', dependsOn: [1, 2, 5, 6, 8, 9], gate: 'Verify AI inventory, risk review, approvals and audit trail. Accreditation readiness requires applicable requirements, exact evidence and authorised auditor consent; framework naming is not certification.',
    systems: [
      system('AI Governance OS', ['ai-core', 'governance'], ['AI', 'AI Risk', 'AI Assessment'], ['AI approvals', 'AI monitoring', 'Responsible AI controls', 'AI audit trails'], ['ISO 42001', 'NIST AI RMF', 'Microsoft Responsible AI']),
      system('Accreditation OS', ['compliance', 'audit', 'aged-care', 'ndis'], [], ['Accreditation workspaces', 'Gap assessments', 'Evidence mapping', 'Auditor portals', 'Accreditation readiness scoring'], ['NDIS Practice Standards', 'Aged Care Quality Standards', 'ISO 9001', 'ISO 27001', 'HSQF', 'NSQHS']),
    ] },
];
// Latest owner master prompt supersedes the earlier ten-phase sequence.
// Previous capabilities remain in their matching phase; planned scope is never marked delivered.
const previous = id => PREVIOUS_ENTERPRISE_PHASES.find(phase => phase.id === id);
const move = (id, title, oldId, dependsOn) => ({ ...previous(oldId), id, title, dependsOn });
export const ENTERPRISE_PHASES = [
  { ...move(1, 'Platform Foundation', 8, []),
    gate: 'Verify multi-tenant identity, RBAC and ABAC, MFA/SSO, session controls, encryption, audit logging, authorised search, shared engines and responsive accessibility before dependent workflows are accepted. Reconcile existing entity fields and SDK contracts; do not generate duplicate schemas to meet a target count.' },
  move(2, 'Compliance Foundation', 1, [1]),
  move(3, 'Audit & Risk', 2, [1, 2]),
  move(4, 'Workforce Governance', 3, [1, 2, 3]),
  move(5, 'Operational Governance', 4, [1, 2, 3, 4]),
  move(6, 'Board & Strategy', 5, [1, 2, 3, 5]),
  move(7, 'Clinical Governance', 6, [1, 2, 3, 4, 5]),
  move(8, 'Commercial Governance', 7, [1, 2, 3, 6]),
  move(9, 'Enterprise Intelligence', 9, [1, 2, 3, 4, 5, 6, 7, 8]),
  { id: 10, title: 'AI Governance', dependsOn: [1, 2, 6, 9],
    gate: 'Verify model, prompt and AI risk inventories, versioned approvals, authorised retrieval, responsible AI monitoring and audit logs. Framework names do not establish certification.',
    systems: [{ ...previous(10).systems[0], registers: ['AI', 'Prompt', 'Model', 'AI Risk', 'AI Assessment'],
      features: [...previous(10).systems[0].features, 'Prompt versioning', 'Model register', 'AI audit logs'] }] },
  { id: 11, title: 'Accreditation', dependsOn: [1, 2, 3, 7, 9, 10],
    gate: 'Verify applicable standards, gap assessments, accreditation plans, exact evidence versions and consent-scoped auditor access before reporting readiness.',
    systems: [previous(10).systems[1]] },
  { id: 12, title: 'Enterprise Digital Twin', dependsOn: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    gate: 'Verify typed, authorised relationships across all operating systems, evidence versions, provenance, warehouse reconciliation and scenario assumptions. Record links and source mappings alone are not a digital twin.',
    systems: [system('Digital Twin OS', ['evidence', 'reporting', 'executive'], [],
      ['Unified evidence graph', 'Enterprise relationship model', 'Versioned provenance', 'Enterprise data warehouse', 'Scenario analysis', 'Complete standard-to-board traceability'])] },
];
export function enterprisePhaseMarkdown() {
  return '# Enterprise Master Build — Twelve-Phase Implementation Plan\n\nOwner direction: 15 November 2026. Target requirements, not delivery claims.\n\n' +
    EVIDENCE_CHAIN.join(' → ') + '\n\n## Enterprise foundation\n' + PLATFORM_REQUIREMENTS.map(x => '- ' + x).join('\n') +
    '\n\n## Shared engines\n' + SHARED_ENGINES.join(', ') +
    '\n\n' + ENTERPRISE_PHASES.map(p => '## Phase ' + p.id + ' — ' + p.title + '\nDependencies: ' + (p.dependsOn.join(', ') || 'Foundation acceptance') + '\n\n' + p.systems.map(s => '### ' + s.name + '\nRegisters: ' + (s.registers.join(', ') || 'Reconcile existing registers') + '\nFeatures: ' + s.features.join('; ') + (s.frameworks.length ? '\nFramework targets: ' + s.frameworks.join(', ') : '')).join('\n\n') + (p.indicators ? '\n\nExecutive indicators: ' + p.indicators.join(', ') : '') + '\n\nAcceptance: ' + p.gate).join('\n\n') +
    '\n\n## Cross-platform workspaces\n' + REQUIRED_WORKSPACES.join(', ') + '\nEach requires: ' + WORKSPACE_ELEMENTS.join(', ') +
    '\n\n## Specialised AI assistants\n' + AI_ASSISTANTS.join(', ') +
    '\n\n## Digital twin relationship scope\n' + DIGITAL_TWIN_RECORDS.join(', ') +
    '\n\n## Release gates\n' + RELEASE_GATES.map(x => '- ' + x).join('\n') +
    '\n\n## Target end state\n25+ enterprise operating systems, 350+ core entity models, unified evidence graph, enterprise data warehouse, 356-checkpoint audit framework, multi-tenant architecture and enterprise AI. Counts are targets; create no duplicate entities to reach a number. Security, privacy, audit logging and AI governance begin in the foundation. Framework editions and regulatory obligations require authoritative validation before implementation. Router Remote is an unresolved navigation requirement; preserve the existing React Router until its contract is clarified.\n';
}
