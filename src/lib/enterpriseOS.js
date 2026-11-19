// Enterprise vNext architecture model — single source of truth for the Operating System layer.
// Every capability is tagged with what genuinely exists today:
//   live    — source mapping exists; runtime and full requirement acceptance unverified
//   partial — something exists but does not yet cover the full capability
//   gap     — no build yet; listed so it cannot be quietly forgotten
// This file holds no fabricated metrics. Live record counts are read from the database.

import { MODULE_DIRECTORY, NAV_GROUPS } from './moduleDirectory.js';

// Platform audit snapshot (counted from the repository on the audit date).
export const PLATFORM_AUDIT = {
  auditedOn: '15 November 2026',
  pages: 99,
  entitySchemas: 190,
  backendFunctions: 114,
  workflows: 67,
  modules: MODULE_DIRECTORY.length,
  navGroups: NAV_GROUPS.length,
  authPages: ['Login', 'Register', 'Forgot password', 'Reset password', 'MFA'],
};

export const COVERAGE = {
  live: { label: 'Source present', tone: 'live' },
  partial: { label: 'Partial', tone: 'partial' },
  gap: { label: 'Gap', tone: 'gap' },
};

const cap = (label, state, to = null, note = '') => ({ label, state, to, note });

export const OPERATING_SYSTEMS = [
  {
    id: 'executive',
    label: 'Executive OS',
    priority: 1,
    summary: 'Executive dashboards, strategic KPIs, organisation health and board reporting in one command layer.',
    moduleKeys: ['dashboard', 'operations-centre', 'board-ceo', 'analytics', 'daily-briefing'],
    capabilities: [
      cap('Executive dashboards', 'live', '/executive-dashboards'),
      cap('Strategic KPIs and scorecards', 'live', '/analytics'),
      cap('Organisation health scoring', 'live', '/compliance'),
      cap('Board packs and executive reports', 'live', '/operations-centre'),
      cap('Board and CEO copilots over the recorded position', 'live', '/board-ceo'),
      cap('Financial and compliance indicators', 'live', '/analytics'),
      cap('AI executive insights', 'live', '/assistant'),
      cap('Action tracking to sign-off', 'live', '/approvals'),
      cap('Board-level assurance chain export', 'partial', '/governance?tab=board-assurance', 'Assurance chain is assembled from existing evidence; no single board assurance register yet.'),
    ],
    registers: [
      { entity: 'ExecutiveScoreSnapshot', label: 'Executive score snapshots' },
      { entity: 'KPI', label: 'KPIs' },
      { entity: 'BusinessProject', label: 'Strategic projects' },
      { entity: 'BoardResolution', label: 'Board resolutions' },
    ],
    gaps: ['Automatic implementation tracking from each board resolution to its completed actions.'],
  },
  {
    id: 'governance',
    label: 'Governance OS',
    priority: 2,
    summary: 'Board governance, committees, delegations, document control and resolution tracking.',
    moduleKeys: ['governance', 'meetings', 'projects', 'board-ceo', 'documents'],
    capabilities: [
      cap('Governance framework and registers', 'live', '/governance'),
      cap('Board and committee meetings, minutes, decisions', 'live', '/meetings'),
      cap('Authority and delegation declarations', 'live', '/governance'),
      cap('Document control and lifecycle', 'live', '/documents'),
      cap('Record link explorer and evidence chain', 'live', '/governance'),
      cap('Board resolutions register', 'live', '/board-ceo', 'Each resolution records its type, vote, sign-off, evidence link and review date; carrying it through to completed actions stays manual.'),
      cap('Conflict of interest register', 'gap', null, 'No entity records declared interests or conflicts.'),
      cap('Constitution management', 'gap', null, 'Constitution and rules sit as documents only.'),
    ],
    registers: [
      { entity: 'GovernanceObject', label: 'Governance objects' },
      { entity: 'DocumentControl', label: 'Controlled documents' },
      { entity: 'AuthorityDeclaration', label: 'Authority declarations' },
      { entity: 'BoardResolution', label: 'Board resolutions' },
    ],
    gaps: ['Conflict of interest register.', 'Constitution change control.'],
  },
  {
    id: 'compliance',
    label: 'Compliance OS',
    priority: 3,
    summary: 'Obligations, the 356-checkpoint model, evidence collection, registers and remediation.',
    moduleKeys: ['compliance', 'checklists', 'review-due', 'documents', 'quality'],
    capabilities: [
      cap('Compliance registers and obligations', 'live', '/compliance'),
      cap('356-checkpoint audit model', 'live', '/compliance'),
      cap('NDIS and Aged Care standard mapping', 'live', '/evidence', 'NDIS Core Module and the seven strengthened Aged Care Quality Standards are registered as outcome-level standard sets.'),
      cap('Evidence collection and acknowledgement', 'live', '/documents'),
      cap('Compliance calendar and renewals', 'live', '/review-due'),
      cap('Issues, remediation and verification', 'live', '/quality'),
      cap('Compliance scoring and readiness', 'live', '/compliance'),
    ],
    registers: [
      { entity: 'ComplianceIssue', label: 'Compliance issues' },
      { entity: 'ComplianceChecklistEntry', label: 'Checkpoint entries' },
      { entity: 'LegalRequirement', label: 'Legal requirements' },
    ],
    gaps: ['Specialist NDIS practice standards modules (verification, certification, early childhood, specialist behaviour support) as mapped sets.'],
  },
  {
    id: 'audit',
    label: 'Audit OS',
    priority: 4,
    summary: 'Internal and external audit programmes, findings, corrective actions and readiness.',
    moduleKeys: ['compliance', 'checklists', 'auditor-portal', 'review-due'],
    capabilities: [
      cap('Internal and external audit register', 'live', '/compliance'),
      cap('Audit schedules and review calendar', 'live', '/review-due'),
      cap('Findings, non-conformance and corrective actions', 'live', '/quality'),
      cap('Audit evidence and checklist library', 'live', '/checklists'),
      cap('Auditor collaboration portal', 'live', '/auditor-portal'),
      cap('Audit analytics and readiness scoring', 'partial', '/compliance', 'Readiness is scored from existing registers; trend analysis across audit cycles is limited.'),
      cap('Audit programme builder per standard', 'gap', null, 'Audits are created individually rather than generated from a programme.'),
    ],
    registers: [
      { entity: 'Audit', label: 'Audits' },
      { entity: 'InternalAudit', label: 'Internal audits' },
      { entity: 'AuditAction', label: 'Audit actions' },
      { entity: 'AuditEvidenceFile', label: 'Evidence files' },
    ],
    gaps: ['Audit programme builder that generates a cycle of audits from a standard set.'],
  },
  {
    id: 'risk',
    label: 'Risk OS',
    priority: 5,
    summary: 'Risk and control registers, treatments, heatmaps and critical risk monitoring.',
    moduleKeys: ['risks', 'incidents', 'emergency-response', 'equipment-manuals'],
    capabilities: [
      cap('Risk register and assessments', 'live', '/risks'),
      cap('Controls and treatment plans', 'live', '/risks'),
      cap('Heatmaps and residual risk scoring', 'live', '/risk-chemical-dashboard'),
      cap('Critical risk and hazard monitoring', 'live', '/risk-chemical-dashboard'),
      cap('Incident-to-risk linkage', 'live', '/incidents'),
      cap('ISO 31000 alignment', 'partial', '/risks', 'Assessment fields follow the ISO 31000 approach; there is no framework register proving conformance.'),
      cap('Bowtie analysis', 'gap', null, 'No bowtie or barrier analysis capture.'),
    ],
    registers: [
      { entity: 'Risk', label: 'Risks' },
      { entity: 'Chemical', label: 'Chemicals' },
      { entity: 'TakeFive', label: 'Take 5 assessments' },
    ],
    gaps: ['Bowtie and barrier analysis for critical risks.'],
  },
  {
    id: 'quality',
    label: 'Quality OS',
    priority: 6,
    summary: 'Continuous improvement, root cause, CAPA and quality indicators.',
    moduleKeys: ['quality', 'feedback', 'checklists', 'approvals'],
    capabilities: [
      cap('Continuous improvement register', 'live', '/quality'),
      cap('Root cause and approved actions', 'live', '/quality'),
      cap('Quality reviews and effectiveness checks', 'live', '/quality'),
      cap('Feedback, complaints and near misses', 'live', '/feedback'),
      cap('Improvement workflow to sign-off', 'live', '/approvals'),
      cap('Quality indicator dashboards', 'partial', '/quality', 'Indicators are reported per register; there is no consolidated indicator set across services.'),
    ],
    registers: [
      { entity: 'QualityItem', label: 'Quality items' },
      { entity: 'ImprovementAction', label: 'Improvement actions' },
      { entity: 'ImprovementReview', label: 'Improvement reviews' },
    ],
    gaps: ['Consolidated quality indicator set with trend reporting.'],
  },
  {
    id: 'workforce',
    label: 'Workforce OS',
    priority: 7,
    summary: 'Recruitment, screening, credentialing, training compliance and rostering.',
    moduleKeys: ['our-staff', 'human-resources', 'training', 'certificates', 'rostering', 'volunteering-placements'],
    capabilities: [
      cap('Recruitment and onboarding to commencement', 'live', '/intake'),
      cap('Staff records, qualifications and credentialing', 'live', '/our-employees'),
      cap('Screening, clearances and expiry alerts', 'live', '/our-employees'),
      cap('Training compliance and competency matrix', 'live', '/training'),
      cap('Rostering, availability and shift eligibility', 'live', '/rostering'),
      cap('Performance review and supervision', 'live', '/hr'),
      cap('Workforce planning and forecasting', 'partial', '/rostering', 'Labour forecasting exists per week; multi-month workforce planning is not built.'),
      cap('Visa and right-to-work tracking', 'gap', null, 'No field set records visa conditions or expiry.'),
    ],
    registers: [
      { entity: 'StaffProfile', label: 'Staff profiles' },
      { entity: 'WorkforceAssuranceRecord', label: 'Assurance records' },
      { entity: 'TrainingCompletion', label: 'Training completions' },
    ],
    gaps: ['Visa and right-to-work tracking.', 'Multi-period workforce planning.'],
  },
  {
    id: 'clinical',
    label: 'Clinical Governance OS',
    priority: 8,
    summary: 'Clinical incidents, restrictive practices, consent, supervision and clinical audit.',
    moduleKeys: ['clinical-os', 'incidents', 'our-participants', 'goals', 'documents'],
    capabilities: [
      cap('Clinical and safeguarding incidents', 'partial', '/incidents', 'Incidents capture clinical classification; clinical severity review is not a separate workflow.'),
      cap('Care plans with review dates, consent, clinical risk and restrictive practice', 'live', '/clinical-os', 'Every plan carries its review date, consent position and any restrictive practice with the authorisation detail.'),
      cap('Restrictive practice monitoring and reduction planning', 'live', '/clinical-os', 'Restrictive practices register (Clinical OS): every use with category, authorisation status and expiry, behaviour support plan, regulator reporting and reduction actions, with flags. Added 19 Nov 2026; signed-in acceptance pending.'),
      cap('Clinical and allied health copilots over assurance metadata', 'live', '/clinical-os'),
      cap('Consent and information sharing', 'live', '/documents'),
      cap('Clinical supervision and credentialing', 'gap', null, 'No supervision log or clinical credential register.'),
      cap('Outcome measurement', 'partial', '/goals', 'Goal progress provides outcome evidence; standardised outcome measures are not captured.'),
      cap('Clinical audit programme', 'gap', null, 'No clinical-specific audit set.'),
    ],
    registers: [
      { entity: 'ParticipantSafeguardRecord', label: 'Safeguard records' },
      { entity: 'CarePlan', label: 'Care plans' },
      { entity: 'AlliedHealthReferral', label: 'Allied health referrals' },
      { entity: 'InformationSharingConsent', label: 'Information sharing consents' },
      { entity: 'Investigation', label: 'Investigations' },
    ],
    gaps: [
      'Clinical supervision and credentialing log.',
      'Standardised clinical outcome measures.',
      'Clinical audit programme.',
    ],
  },
  {
    id: 'allied-health',
    label: 'Allied Health OS',
    priority: 9,
    summary: 'Discipline workflows, assessments, treatment plans, clinical notes and outcomes.',
    moduleKeys: ['clinical-os', 'our-participants', 'intake', 'goals', 'community-referral'],
    capabilities: [
      cap('Participant therapy records', 'partial', '/our-participants', 'Participant profiles hold plans and documents; discipline-specific case records are not modelled.'),
      cap('Goals and outcome tracking', 'live', '/goals'),
      cap('Assessments and reports', 'partial', '/documents', 'Reports are stored as documents rather than structured assessments.'),
      cap('Allied health referrals with discipline, urgency and outcome', 'live', '/clinical-os', 'Each referral records the discipline, provider, urgency and what came back; a referral completed without an outcome stays visible.'),
      cap('Treatment plans and discipline clinical notes', 'partial', '/clinical-os', 'Care plans capture treatment intent and supports; discipline clinical notes are not modelled.'),
      cap('Discipline caseloads (OT, speech, physio, psychology, social work, exercise physiology)', 'gap', null, 'No discipline or caseload model.'),
      cap('Referral and service coordination', 'live', '/referrals'),
    ],
    registers: [
      { entity: 'AlliedHealthReferral', label: 'Allied health referrals' },
      { entity: 'CarePlan', label: 'Care plans' },
      { entity: 'Goal', label: 'Goals' },
      { entity: 'GoalProgressNote', label: 'Progress notes' },
      { entity: 'ParticipantReview', label: 'Participant reviews' },
    ],
    gaps: ['Discipline clinical notes.', 'Caseload model per discipline.', 'Structured assessment instruments.'],
  },
  {
    id: 'aged-care',
    label: 'Aged Care OS',
    priority: 10,
    summary: 'Strengthened standards, care management, consumer outcomes and clinical indicators.',
    moduleKeys: ['our-participants', 'compliance', 'feedback', 'incidents'],
    capabilities: [
      cap('Strengthened Aged Care Standards mapping', 'gap', null, 'The seven strengthened standards are not yet a mapped standard set with checkpoints.'),
      cap('Care plans and consumer records', 'partial', '/our-participants', 'Participant records serve consumers; aged care specific assessments are not modelled.'),
      cap('Clinical indicators and reporting', 'gap', null, 'No aged care quality indicator capture.'),
      cap('Consumer feedback and complaints', 'live', '/feedback'),
      cap('SIRS-style incident monitoring', 'partial', '/incidents', 'Incidents capture classification and severity; aged care priority timeframes are not enforced as a rule set.'),
      cap('Aged care regulator updates', 'live', '/ndis-updates', 'Daily summaries from the Aged Care Quality and Safety Commission and the Department of Health aged care pages, filterable by sector. Added 19 Nov 2026.'),
      cap('Restrictive practice register', 'live', '/clinical-os', 'Shared NDIS and aged care register in Clinical OS. Added 19 Nov 2026.'),
    ],
    registers: [
      { entity: 'SatisfactionSurvey', label: 'Consumer surveys' },
      { entity: 'Complaint', label: 'Complaints' },
    ],
    gaps: [
      'Strengthened Aged Care Standards as a mapped standard set with checkpoints.',
      'Aged care quality indicator set.',
      'Priority 1 and Priority 2 incident timeframe enforcement.',
    ],
  },
  {
    id: 'ndis',
    label: 'NDIS OS',
    priority: 11,
    summary: 'Practice standards, registration groups, participant plans, funding and provider compliance.',
    moduleKeys: ['ndis-provider', 'ndis-news', 'our-participants', 'rostering', 'compliance'],
    capabilities: [
      cap('Practice standards and registration groups', 'live', '/ndis-portal'),
      cap('Participant plans, goals and funding', 'live', '/our-participants'),
      cap('Service delivery and shift records', 'live', '/rostering'),
      cap('Incident monitoring and reportable incidents', 'live', '/incidents'),
      cap('Provider compliance and audit readiness', 'live', '/compliance'),
      cap('Price guide and NDIS updates', 'partial', '/ndis-updates', 'NDIS updates are live. Price guide import, impact preview and approve-and-apply added 19 Nov 2026; no catalogue has been loaded yet, so shifts cannot be priced automatically.'),
      cap('Restrictive practice monitoring', 'live', '/clinical-os', 'Restrictive practices register: authorisation, expiry, behaviour support plan, reporting and reduction flags. Added 19 Nov 2026.'),
    ],
    registers: [
      { entity: 'NDISRegistrationProfile', label: 'Registration profiles' },
      { entity: 'NDISComplianceDeadline', label: 'Compliance deadlines' },
      { entity: 'NDISRegistrationGroup', label: 'Registration groups' },
    ],
    gaps: ['Load the current NDIS Support Catalogue and record support item numbers on shifts.'],
  },
  {
    id: 'evidence',
    label: 'Evidence OS',
    priority: 12,
    summary: 'One evidence repository with the assurance chain: standard to control to evidence to finding, scored on verified evidence only.',
    moduleKeys: ['evidence', 'documents', 'compliance', 'checklists', 'governance'],
    capabilities: [
      cap('Enterprise evidence repository', 'live', '/documents'),
      cap('Evidence ownership and lifecycle', 'live', '/documents'),
      cap('Evidence routing to obligations', 'live', '/evidence', 'Every evidence item routes to its control, and the control carries the obligation and requirement.'),
      cap('Traceability matrix', 'partial', '/governance', 'The evidence chain map follows linked records; coverage is only as complete as the links.'),
      cap('Assurance chain across standards, controls, evidence and findings', 'live', '/evidence'),
      cap('Evidence coverage scoring on verified evidence only', 'live', '/evidence'),
      cap('Evidence validation and confidence scoring', 'live', '/evidence', 'Each item carries a confidence score, a named verifier and a verification date.'),
      cap('Autonomous gap detection with linked remediation actions', 'live', '/evidence', 'Gaps are detected from the registers and raised as tasks linked back to the control.'),
      cap('Evidence lineage across versions', 'partial', '/evidence', 'Evidence is chained to its control and findings; version-to-version lineage of one evidence item is not modelled.'),
    ],
    registers: [
      { entity: 'RegulatoryStandard', label: 'Regulatory standards' },
      { entity: 'ComplianceControl', label: 'Controls' },
      { entity: 'AssuranceEvidence', label: 'Assurance evidence' },
      { entity: 'AssuranceFinding', label: 'Assurance findings' },
      { entity: 'AuditEvidenceFile', label: 'Evidence files' },
      { entity: 'GovernanceControlRecord', label: 'Control records' },
      { entity: 'DocumentAcknowledgement', label: 'Acknowledgements' },
    ],
    gaps: ['Version lineage for a single evidence item.', 'Evidence reuse across multiple controls without duplication.'],
  },
  {
    id: 'knowledge-graph',
    label: 'Knowledge Graph OS',
    priority: 13,
    summary: 'One graph over every register: typed relationships between objects, and the 14-stage chain from regulation to outcome traced standard by standard.',
    moduleKeys: ['knowledge-graph', 'evidence', 'governance', 'ai-os'],
    capabilities: [
      cap('Typed relationships between records across registers', 'live', '/knowledge-graph'),
      cap('The 23-relationship vocabulary from the enterprise specification', 'live', '/knowledge-graph'),
      cap('Links derived from reference fields already stored on records', 'live', '/knowledge-graph'),
      cap('Recorded links for relationships no field captures', 'live', '/knowledge-graph', 'Each stored link carries a type, a source and a reason, and counts towards chain completeness.'),
      cap('Compliance DNA: regulation to outcome scored at every stage', 'live', '/knowledge-graph'),
      cap('Per-standard chain tracing that names the exact break', 'live', '/knowledge-graph'),
      cap('Orphan detection: objects nothing can trace', 'live', '/knowledge-graph'),
      cap('Graph security inherited from each register\'s own rules', 'partial', '/knowledge-graph', 'The graph only loads records the signed-in role may read, but there is no separate graph-level permission layer.'),
      cap('Record map canvas with a ring per object type and neighbour focus', 'live', '/knowledge-graph', 'The canvas draws every record the signed-in role may read and lets you walk one record\'s relationships without leaving the map.'),
    ],
    registers: [
      { entity: 'KnowledgeLink', label: 'Recorded knowledge links' },
    ],
    gaps: ['Relationship rules from policy, procedure and form to control.'],
  },
  {
    id: 'ai-core',
    label: 'AI Core OS',
    priority: 14,
    summary: 'Domain copilots, authorised retrieval and evidence-aware assistance.',
    moduleKeys: ['ai-os', 'assistant', 'suggestions-hub'],
    capabilities: [
      cap('Enterprise assistant', 'live', '/assistant'),
      cap('Module-by-module suggestion review', 'live', '/suggestions'),
      cap('AI drafting, triage and course authoring', 'live', '/assistant'),
      cap('Domain copilots over the live registers with explainable recommendations', 'live', '/ai-os', 'Compliance, evidence, audit and risk copilots read the tenant registers and return findings, recommendations and a traceability map.'),
      cap('AI governance: agent register, prompt library, confidence scoring, AI audit log', 'live', '/ai-os'),
      cap('Specialist copilots for clinical, allied health, board, CEO and executive', 'live', '/board-ceo', 'Clinical and allied health copilots run from the Clinical & Allied Health OS; board, CEO and executive copilots run from Board & CEO Copilots.'),
      cap('Autonomous agent runtime on a nightly schedule, every draft routed to human review', 'live', '/ai-os', 'Registered autonomous agents run a bounded pass over the assurance registers and file recommendations awaiting review; they never change a record or approve anything.'),
      cap('Cited, permission-filtered answering', 'partial', '/ai-os', 'Answers are grounded in the tenant registers and name the standards and controls used, but each still needs human verification.'),
    ],
    registers: [
      { entity: 'AiAgent', label: 'Agents and copilots' },
      { entity: 'AiPrompt', label: 'Prompt library' },
      { entity: 'AiRecommendation', label: 'Recommendations' },
      { entity: 'AiInteraction', label: 'AI audit log' },
    ],
    gaps: ['Model accuracy measured over time.', 'Agent scheduling controls inside the app; the nightly pass runs as a platform workflow.'],
  },
  {
    id: 'automation',
    label: 'Automation OS',
    priority: 15,
    summary: 'Workflow engine, alerts, escalations, approvals and background processing.',
    moduleKeys: ['operations-centre', 'approvals', 'approval-engine', 'notifications', 'tasks'],
    capabilities: [
      cap('Workflow engine and schedules', 'live', '/connected-workflows'),
      cap('Alerts, reminders and escalations', 'live', '/notifications'),
      cap('Approvals and sign-off routing', 'live', '/approvals'),
      cap('Five-level approval chains set by category, amount and risk', 'live', '/approval-engine', 'The rule set fixes how many levels a decision needs; nobody can approve their own request and every level needs a typed signature.'),
      cap('Background processing and jobs', 'live', '/connected-workflows'),
      cap('Automation rule builder', 'gap', null, 'Automations exist as configured workflows and functions; there is no self-service rule builder.'),
      cap('Automation run history', 'partial', '/connected-workflows', 'Run history is available in the platform workflow dashboard rather than inside the app.'),
    ],
    registers: [
      { entity: 'ApprovalRequest', label: 'Approval requests' },
      { entity: 'ApprovalChain', label: 'Approval chains' },
      { entity: 'Notification', label: 'Notifications' },
      { entity: 'PushLog', label: 'Delivery log' },
    ],
    gaps: ['Self-service automation rule builder.', 'Automation run history inside the app.'],
  },
  {
    id: 'reporting',
    label: 'Reporting OS',
    priority: 16,
    summary: 'Executive, board, compliance, risk, workforce, clinical and regulatory reporting.',
    moduleKeys: ['analytics', 'operations-centre', 'compliance', 'incident-analytics'],
    capabilities: [
      cap('Executive and board reporting', 'live', '/operations-centre'),
      cap('Compliance, audit and risk reporting', 'live', '/compliance'),
      cap('Workforce and financial reporting', 'live', '/analytics'),
      cap('Operational and incident reporting', 'live', '/incident-analytics'),
      cap('PDF and Excel exports', 'live', '/compliance'),
      cap('Scheduled report delivery', 'partial', '/notifications', 'Scheduled scans send reminders; scheduled report packs are not built.'),
      cap('Power BI ready exports', 'partial', '/operations-centre', 'Structured extracts exist; no published data model or connector.'),
    ],
    registers: [
      { entity: 'ActionReport', label: 'Action reports' },
      { entity: 'TaskCompletionReport', label: 'Completion reports' },
      { entity: 'AuditReport', label: 'Audit reports' },
    ],
    gaps: ['Scheduled report packs.', 'Published Power BI data model.'],
  },
];

export const OS_BY_ID = Object.fromEntries(OPERATING_SYSTEMS.map((os) => [os.id, os]));

/** Status is derived from capabilities, never asserted. */
export function osCoverage(os) {
  const total = os.capabilities.length;
  const live = os.capabilities.filter((item) => item.state === 'live').length;
  const partial = os.capabilities.filter((item) => item.state === 'partial').length;
  const gap = os.capabilities.filter((item) => item.state === 'gap').length;
  const percent = total ? Math.round(((live + partial * 0.5) / total) * 100) : 0;
  return { total, live, partial, gap, percent };
}

export function osStatus(os) {
  const { live, partial } = osCoverage(os);
  if (!live && !partial) return 'gap';
  if (os.capabilities.some((item) => item.state !== 'live')) return 'partial';
  return 'live';
}

export const PLATFORM_COVERAGE = OPERATING_SYSTEMS.reduce(
  (totals, os) => {
    const { live, partial, gap } = osCoverage(os);
    return { live: totals.live + live, partial: totals.partial + partial, gap: totals.gap + gap };
  },
  { live: 0, partial: 0, gap: 0 }
);

export const ENTERPRISE_GAPS = OPERATING_SYSTEMS.flatMap((os) =>
  os.gaps.map((gap) => ({ os: os.label, osId: os.id, priority: os.priority, gap }))
).sort((a, b) => a.priority - b.priority);

export const DELIVERABLES = [
  { label: 'Platform audit report', where: 'Platform audit tab', state: 'live' },
  { label: 'Gap analysis report', where: 'Platform audit tab', state: 'live' },
  { label: 'Architecture report', where: 'This console and docs/history/ENTERPRISE_VNEXT_AUDIT.md', state: 'live' },
  { label: 'Database expansion plan', where: 'Platform audit tab — schema plan', state: 'partial' },
  { label: 'API expansion plan', where: 'Platform audit tab — API plan', state: 'partial' },
  { label: 'Missing screens list', where: 'Gap register', state: 'live' },
  { label: 'Missing modules list', where: 'Gap register', state: 'live' },
  { label: 'Missing workspaces list', where: 'Role workspaces tab', state: 'live' },
  { label: 'Implementation roadmap', where: 'Roadmap tab', state: 'live' },
  { label: 'Enterprise upgrade package', where: 'Download review package (ZIP); full implementation remains open', state: 'partial' },
];

export const SCHEMA_PLAN = [
  { scheme: 'Governance', entities: ['BoardResolution', 'ConflictDeclaration'], state: 'gap' },
  { scheme: 'Clinical', entities: ['RestrictivePractice', 'ClinicalSupervision', 'ClinicalOutcomeMeasure'], state: 'gap' },
  { scheme: 'Allied health', entities: ['AlliedHealthEpisode', 'ClinicalNote', 'TreatmentPlan'], state: 'gap' },
  { scheme: 'Aged care', entities: ['AgedCareAssessment', 'AgedCareIndicator'], state: 'gap' },
  { scheme: 'Evidence', entities: ['EvidenceLink', 'EvidenceScore'], state: 'gap' },
  { scheme: 'Workforce', entities: ['RightToWorkRecord'], state: 'gap' },
  { scheme: 'Automation', entities: ['AutomationRule', 'AutomationRun'], state: 'gap' },
  { scheme: 'AI', entities: ['AiCopilot', 'AiRecommendation'], state: 'gap' },
  { scheme: 'Reporting', entities: ['ReportDefinition', 'ScheduledReport'], state: 'gap' },
  { scheme: 'Security', entities: ['SecurityIncident', 'AccessReview'], state: 'gap' },
];

export const API_PLAN = [
  { domain: 'Governance', contract: '/api/governance', state: 'gap' },
  { domain: 'Compliance', contract: '/api/compliance', state: 'partial' },
  { domain: 'Risk', contract: '/api/risk', state: 'gap' },
  { domain: 'Audit', contract: '/api/audit', state: 'gap' },
  { domain: 'Workforce', contract: '/api/workforce', state: 'gap' },
  { domain: 'Clinical', contract: '/api/clinical', state: 'gap' },
  { domain: 'AI', contract: '/api/ai', state: 'gap' },
];