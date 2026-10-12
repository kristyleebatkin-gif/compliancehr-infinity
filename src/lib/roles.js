export const ROLES = {
  ADMIN: 'Provider Administrator',
  COMPLIANCE: 'Compliance Manager',
  TEAM_LEADER: 'Administration',
  SUPPORT: 'Support Worker',
  PARTICIPANT: 'Participant',
  AUDITOR: 'Auditor',
  PENDING_APPROVAL: 'Pending Approval',
};

export const ALL_ROLES = [
  'admin',
  ROLES.ADMIN,
  ROLES.COMPLIANCE,
  ROLES.TEAM_LEADER,
  ROLES.SUPPORT,
  ROLES.PARTICIPANT,
  ROLES.AUDITOR,
];

// Participant role is scoped to their portal, documents, communications, incidents and risks.
const STAFF_ROLES = [ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER, ROLES.SUPPORT];
const MANAGEMENT_ROLES = ['admin', ROLES.ADMIN, ROLES.COMPLIANCE, ROLES.TEAM_LEADER];
const ADMIN_PROVIDER_ROLES = ['admin', ROLES.ADMIN];

// navKey -> roles allowed to see/use it
export const NAV_PERMISSIONS = {
  dashboard: ALL_ROLES,
  participants: [...ADMIN_PROVIDER_ROLES, ROLES.COMPLIANCE, ROLES.TEAM_LEADER, ROLES.SUPPORT, ROLES.AUDITOR],
  'visual-boards': ALL_ROLES,
  intake: ADMIN_PROVIDER_ROLES,
  staff: [...ADMIN_PROVIDER_ROLES, ROLES.AUDITOR],
  training: [...STAFF_ROLES, ROLES.AUDITOR],
  compliance: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  incidents: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  risks: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  'audit-centre': [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  documents: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  'company-safe': MANAGEMENT_ROLES,
  assistant: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  certificates: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  complaints: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  surveys: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  'audit-log': [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  feedback: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  tasks: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  notifications: ALL_ROLES,
  quality: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  assets: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  goals: [...MANAGEMENT_ROLES, ROLES.SUPPORT, ROLES.AUDITOR],
  shifts: [...MANAGEMENT_ROLES, ROLES.SUPPORT, ROLES.AUDITOR],
  rostering: [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER],
  'human-resources': [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER],
  invoicing: [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER],
  manual: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  users: MANAGEMENT_ROLES,
  forms: [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  checklists: [...STAFF_ROLES, ROLES.AUDITOR],
  'emergency-response': [...STAFF_ROLES, ROLES.AUDITOR],
  meetings: MANAGEMENT_ROLES,
  'data-control': [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  receipts: [...ADMIN_PROVIDER_ROLES, ROLES.TEAM_LEADER],
  'equipment-manuals': [...STAFF_ROLES, ROLES.AUDITOR],
  msds: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  'community-council': [...ALL_ROLES],
  'insurance-finance': MANAGEMENT_ROLES,
  programs: [...ALL_ROLES],
  events: [...ALL_ROLES],
  'ndis-news': [...ALL_ROLES],
  weather: [...ALL_ROLES],
  'key-contacts': [...ALL_ROLES],
  'community-referral': [...ALL_ROLES],
  'ndis-provider': [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  'volunteering-placements': MANAGEMENT_ROLES,
  'whats-on': [...ALL_ROLES],
  communications: [...STAFF_ROLES, ROLES.PARTICIPANT, ROLES.AUDITOR],
  portal: [ROLES.PARTICIPANT, ...STAFF_ROLES, ROLES.AUDITOR],
  'safety-insights': [...MANAGEMENT_ROLES, ROLES.AUDITOR],
  analytics: MANAGEMENT_ROLES,
  crm: MANAGEMENT_ROLES,
  procurement: MANAGEMENT_ROLES,
  projects: MANAGEMENT_ROLES,
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