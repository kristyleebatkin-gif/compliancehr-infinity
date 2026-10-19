export const ROLES = {
  ADMIN: 'Provider Administrator',
  COMPLIANCE: 'Compliance Manager',
  TEAM_LEADER: 'Administration',
  SUPPORT: 'Support Worker',
  PARTICIPANT: 'Participant',
  AUDITOR: 'Auditor',
  FINANCE: 'Finance & Accounts Officer',
  HR: 'Human Resources Manager',
  ROSTERING: 'Rostering Coordinator',
  QUALITY: 'Quality & Improvement Manager',
  MARKETING: 'CRM & Marketing Officer',
  INTAKE: 'Intake Officer',
  VOLUNTEER: 'Volunteer',
  PENDING_APPROVAL: 'Pending Approval',
};

// Every assignable role, including the platform built-ins ('admin'/'user')
// and the legacy 'Team Leader' value (normalised to Administration at sign-in).
export const ALL_ROLES = [
  'admin',
  ROLES.ADMIN,
  ROLES.COMPLIANCE,
  ROLES.TEAM_LEADER,
  'Team Leader',
  ROLES.SUPPORT,
  ROLES.FINANCE,
  ROLES.HR,
  ROLES.ROSTERING,
  ROLES.QUALITY,
  ROLES.MARKETING,
  ROLES.INTAKE,
  ROLES.PARTICIPANT,
  ROLES.AUDITOR,
  ROLES.VOLUNTEER,
];

// Roles with organisation-wide management visibility.
const MANAGEMENT_ROLES = ['admin', ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER];
const ADMIN_PROVIDER_ROLES = ['admin', ROLES.ADMIN];
const STAFF_ROLES = [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER, ROLES.SUPPORT];
const EVERYONE = [...ALL_ROLES];

// navKey -> roles allowed to see/use it. Each business role has independent,
// role-appropriate access across every module in the app.
export const NAV_PERMISSIONS = {
  'my-profile': EVERYONE,
  dashboard: EVERYONE,
  notifications: EVERYONE,
  assistant: EVERYONE,
  help: EVERYONE,
  'user-guides': EVERYONE,
  'key-contacts': EVERYONE,
  'community-council': EVERYONE,
  'community-referral': EVERYONE,
  'ndis-news': EVERYONE,
  programs: EVERYONE,
  events: EVERYONE,
  'whats-on': EVERYONE,
  weather: EVERYONE,
  'visual-boards': EVERYONE,

  participants: [...ADMIN_PROVIDER_ROLES, ROLES.COMPLIANCE, ROLES.TEAM_LEADER, ROLES.SUPPORT, ROLES.ROSTERING, ROLES.INTAKE, ROLES.FINANCE, ROLES.AUDITOR, ROLES.PARTICIPANT],
  intake: [...ADMIN_PROVIDER_ROLES, ROLES.COMPLIANCE, ROLES.TEAM_LEADER, ROLES.HR, ROLES.INTAKE, ROLES.SUPPORT, ROLES.PARTICIPANT],
  staff: [...ADMIN_PROVIDER_ROLES, ROLES.COMPLIANCE, ROLES.TEAM_LEADER, ROLES.HR, ROLES.ROSTERING, ROLES.INTAKE, ROLES.AUDITOR],
  training: [...STAFF_ROLES, ROLES.HR, ROLES.AUDITOR, ROLES.VOLUNTEER],
  compliance: [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  'daily-briefing': [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  incidents: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  risks: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  'audit-centre': [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  documents: [...STAFF_ROLES, ROLES.HR, ROLES.INTAKE, ROLES.PARTICIPANT, ROLES.AUDITOR],
  'company-safe': MANAGEMENT_ROLES,
  certificates: [...MANAGEMENT_ROLES, ROLES.HR, ROLES.AUDITOR],
  'audit-log': [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  'auditor-portal': [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  feedback: [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR, ROLES.SUPPORT, ROLES.PARTICIPANT],
  tasks: [...MANAGEMENT_ROLES, ROLES.SUPPORT, ROLES.ROSTERING, ROLES.QUALITY, ROLES.AUDITOR],
  quality: [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  'suggestions-hub': [...MANAGEMENT_ROLES, ROLES.QUALITY],
  assets: [...MANAGEMENT_ROLES, ROLES.FINANCE, ROLES.AUDITOR],
  goals: [...MANAGEMENT_ROLES, ROLES.SUPPORT, ROLES.ROSTERING, ROLES.AUDITOR, ROLES.PARTICIPANT],
  shifts: [...MANAGEMENT_ROLES, ROLES.SUPPORT, ROLES.ROSTERING, ROLES.AUDITOR],
  rostering: [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER, ROLES.ROSTERING, ROLES.SUPPORT, ROLES.PARTICIPANT],
  'human-resources': [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER, ROLES.HR, ROLES.SUPPORT],
  invoicing: [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER, ROLES.FINANCE],
  quotes: [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER, ROLES.FINANCE],
  manual: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  users: MANAGEMENT_ROLES,
  forms: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  checklists: [...STAFF_ROLES, ROLES.QUALITY, ROLES.AUDITOR, ROLES.VOLUNTEER],
  'emergency-response': [...STAFF_ROLES, ROLES.AUDITOR, ROLES.VOLUNTEER, ROLES.PARTICIPANT],
  meetings: [...MANAGEMENT_ROLES, ROLES.HR, ROLES.QUALITY],
  'data-control': [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  receipts: [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER, ROLES.FINANCE, ROLES.SUPPORT],
  'equipment-manuals': [...STAFF_ROLES, ROLES.AUDITOR, ROLES.VOLUNTEER, ROLES.PARTICIPANT],
  msds: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR, ROLES.VOLUNTEER],
  'insurance-finance': [...MANAGEMENT_ROLES, ROLES.FINANCE],
  'ndis-provider': [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  'volunteering-placements': [...MANAGEMENT_ROLES, ROLES.HR],
  communications: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR, ROLES.VOLUNTEER],
  portal: [ROLES.PARTICIPANT, ...STAFF_ROLES, ROLES.AUDITOR],
  'safety-insights': [...MANAGEMENT_ROLES, ROLES.QUALITY, ROLES.AUDITOR],
  'incident-analytics': [...MANAGEMENT_ROLES, ROLES.QUALITY],
  analytics: [...MANAGEMENT_ROLES, ROLES.FINANCE],
  crm: [...MANAGEMENT_ROLES, ROLES.MARKETING],
  procurement: [...MANAGEMENT_ROLES, ROLES.FINANCE],
  projects: [...MANAGEMENT_ROLES, ROLES.MARKETING, ROLES.FINANCE],
};

export function canAccessNav(role, navKey) {
  const allowed = NAV_PERMISSIONS[navKey];
  if (!allowed) return true;
  return allowed.includes(role);
}

export function isAdmin(role) {
  return role === 'admin' || role === ROLES.ADMIN;
}

export function isCompliance(role) {
  return role === 'admin' || role === ROLES.ADMIN || role === ROLES.COMPLIANCE;
}