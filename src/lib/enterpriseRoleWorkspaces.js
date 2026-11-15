// Enterprise role workspaces — each named role mapped to the workspace that actually serves it today.
// status: live (dedicated workspace exists) | partial (a shared workspace serves the role, with named gaps)
// | gap (no workspace; the role's work has no home yet).
// Routes point at real pages only. Nothing here grants access — the role matrix still decides that.

export const WORKSPACE_ELEMENTS = [
  'Dashboard',
  'Navigation',
  'KPIs',
  'Tasks',
  'Reports',
  'Registers',
  'Approvals',
  'Notifications',
  'AI assistant',
];

export const ROLE_WORKSPACES = [
  { role: 'Platform Owner', group: 'Executive', route: '/users', workspace: 'Users & Permissions', status: 'live', note: 'Accounts, roles, approval of access and audit of changes.' },
  { role: 'Board Member', group: 'Executive', route: '/executive-dashboards', workspace: 'Executive Dashboards', status: 'partial', note: 'Board reporting exists; a board-only assurance view does not.' },
  { role: 'CEO', group: 'Executive', route: '/dashboard', workspace: 'Command Centre', status: 'live', note: 'Organisation, workforce, financial, risk and compliance health.' },
  { role: 'General Manager', group: 'Executive', route: '/operations-centre', workspace: 'Operations Centre', status: 'live', note: 'Executive operations, one-click operations and reports.' },
  { role: 'Operations Manager', group: 'Operations', route: '/operations-centre', workspace: 'Operations Centre', status: 'live', note: 'Service exceptions, shift cover and approvals.' },
  { role: 'Compliance Manager', group: 'Compliance & quality', route: '/compliance', workspace: 'Compliance & Evidence', status: 'live', note: 'Checkpoints, evidence, reviews and issues.' },
  { role: 'Quality Manager', group: 'Compliance & quality', route: '/quality', workspace: 'Quality & Improvement', status: 'live', note: 'Improvements, root cause and CAPA.' },
  { role: 'Risk Manager', group: 'Risk', route: '/risks', workspace: 'Risk Management', status: 'live', note: 'Risks, controls, treatments and heatmaps.' },
  { role: 'Clinical Governance Manager', group: 'Clinical', route: '/incidents', workspace: 'Incidents', status: 'partial', note: 'Safeguarding and incidents; restrictive practice and clinical supervision have no workspace.' },
  { role: 'HR Manager', group: 'Workforce', route: '/hr', workspace: 'HR Hub', status: 'live', note: 'Recruitment, contracts, leave, supervision and performance.' },
  { role: 'Workforce Manager', group: 'Workforce', route: '/our-employees', workspace: 'Employee Profiles', status: 'live', note: 'Employment, screening, qualifications and training history.' },
  { role: 'Finance Manager', group: 'Finance', route: '/invoicing', workspace: 'Invoicing Centre', status: 'live', note: 'Invoicing, quotes, receipts, procurement and payroll.' },
  { role: 'Auditor', group: 'Audit', route: '/auditor-portal', workspace: 'Auditor Portal', status: 'live', note: 'Read-only, scope-based evidence and responses.' },
  { role: 'External Auditor', group: 'Audit', route: '/auditor-portal', workspace: 'Auditor Portal', status: 'live', note: 'Same portal with time-limited scope.' },
  { role: 'Regional Manager', group: 'Operations', route: '/dashboard', workspace: 'Command Centre', status: 'partial', note: 'No regional or site scoping of dashboards yet.' },
  { role: 'Team Leader', group: 'Operations', route: '/team-leader', workspace: 'Team Leader Workspace', status: 'live', note: 'Escalations, shift notes, roster cover and handover.' },
  { role: 'Support Coordinator', group: 'Service delivery', route: '/intake', workspace: 'Intake Centre', status: 'live', note: 'Referral, consent, eligibility and readiness to commence.' },
  { role: 'Case Manager', group: 'Service delivery', route: '/our-participants', workspace: 'Participant Profiles', status: 'live', note: 'Plans, goals, documents, consents and reviews.' },
  { role: 'Practice Manager', group: 'Allied health', route: '/our-employees', workspace: 'Employee Profiles', status: 'partial', note: 'No practice-level caseload, utilisation or billing view.' },
  { role: 'Allied Health Manager', group: 'Allied health', route: '/our-participants', workspace: 'Participant Profiles', status: 'partial', note: 'No discipline caseload or service utilisation view.' },
  { role: 'Occupational Therapist', group: 'Allied health', route: '/frontline-hub', workspace: 'Frontline Rapid Hub', status: 'gap', note: 'No clinical note, assessment or treatment plan workspace.' },
  { role: 'Speech Pathologist', group: 'Allied health', route: '/frontline-hub', workspace: 'Frontline Rapid Hub', status: 'gap', note: 'No clinical note, assessment or treatment plan workspace.' },
  { role: 'Physiotherapist', group: 'Allied health', route: '/frontline-hub', workspace: 'Frontline Rapid Hub', status: 'gap', note: 'No clinical note, assessment or treatment plan workspace.' },
  { role: 'Psychologist', group: 'Allied health', route: '/frontline-hub', workspace: 'Frontline Rapid Hub', status: 'gap', note: 'No clinical note, assessment or treatment plan workspace.' },
  { role: 'Social Worker', group: 'Allied health', route: '/frontline-hub', workspace: 'Frontline Rapid Hub', status: 'gap', note: 'No clinical note, assessment or treatment plan workspace.' },
  { role: 'Exercise Physiologist', group: 'Allied health', route: '/frontline-hub', workspace: 'Frontline Rapid Hub', status: 'gap', note: 'No clinical note, assessment or treatment plan workspace.' },
  { role: 'Support Worker', group: 'Service delivery', route: '/frontline-hub', workspace: 'Frontline Rapid Hub', status: 'live', note: 'Shift start, authorised support information, notes and reporting.' },
  { role: 'Administration Officer', group: 'Operations', route: '/today', workspace: 'Administration Workspace', status: 'live', note: 'Brief, emails, roster, invoices, compliance jobs and to-dos.' },
  { role: 'Participant', group: 'Participant', route: '/', workspace: 'Participant Home', status: 'live', note: 'Own goals, documents, boards and feedback.' },
  { role: 'Family Representative', group: 'Participant', route: '/our-participants', workspace: 'Participant Profiles', status: 'partial', note: 'No representative-scoped view of a participant record.' },
];

export const WORKSPACE_COUNTS = ROLE_WORKSPACES.reduce(
  (totals, item) => ({ ...totals, [item.status]: (totals[item.status] || 0) + 1 }),
  { live: 0, partial: 0, gap: 0 }
);