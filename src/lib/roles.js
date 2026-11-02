export const ROLES = {
  GUEST: 'Guest',
  ADMIN: 'Provider Administrator',
  COMPLIANCE_ADMIN: 'Compliance Administrator',
  MANAGEMENT: 'Management',
  COMPLIANCE: 'Compliance Administrator',
  TEAM_LEADER: 'Administration',
  EMPLOYEE: 'Employee',
  SUPPORT: 'Employee',
  PARTICIPANT: 'Participant',
  AUDITOR: 'Auditor',
  PENDING_APPROVAL: 'Pending Approval',
  FINANCE: 'Finance & Accounts Officer',
  HR: 'Human Resources Manager',
  ROSTERING: 'Rostering Coordinator',
  QUALITY: 'Quality & Improvement Manager',
  MARKETING: 'CRM & Marketing Officer',
  INTAKE: 'Intake Officer',
  VOLUNTEER: 'Volunteer',
};
export const ALL_ROLES = [
  'Guest',
  'Participant',
  'Employee',
  'Administration',
  'Compliance Administrator',
  'Provider Administrator',
  'Management',
  'Auditor',
  'Volunteer',
];
// Production access is always governed by approval and role policies.
// Keep this compatibility helper aligned with base44/shared/appAccess.ts.
export function isOpenAccessWindowActive() {
  return false;
}

const FULL_ACCESS = ['admin', ROLES.ADMIN, ROLES.COMPLIANCE_ADMIN, ROLES.MANAGEMENT];
const OPERATIONS = [...FULL_ACCESS, ROLES.TEAM_LEADER];
const PERSONAL = [...OPERATIONS, ROLES.EMPLOYEE, ROLES.PARTICIPANT];
const FINANCIAL_KEYS = ['invoicing', 'quotes', 'receipts', 'insurance-finance', 'procurement', 'analytics', 'my-payroll'];
export function normalizeRole(role) {
  if (role === 'admin') return ROLES.ADMIN;
  if (role === 'Compliance Manager' || role === 'Compliance Administrator') return ROLES.COMPLIANCE_ADMIN;
  if (role === 'Team Leader') return ROLES.TEAM_LEADER;
  if (['user', 'Support Worker', ROLES.FINANCE, ROLES.HR, ROLES.ROSTERING, ROLES.QUALITY, ROLES.MARKETING, ROLES.INTAKE].includes(role)) return ROLES.EMPLOYEE;
  if (!role && isOpenAccessWindowActive()) return ROLES.ADMIN;
  return role || ROLES.PENDING_APPROVAL;
}
export function hasApprovedAccess(user) {
  if (isOpenAccessWindowActive()) return true;
  if (!user || ['Rejected', 'Archived', 'Suspended'].includes(user.account_status)) return false;
  if (['admin', ROLES.ADMIN].includes(user.role)) return true;
  return user.access_approved === true && user.account_status === 'Active' && ALL_ROLES.includes(normalizeRole(user.role));
}
export const NAV_PERMISSIONS = {
  'my-profile': PERSONAL, 'our-staff': [...OPERATIONS, ROLES.EMPLOYEE], 'our-participants': [...OPERATIONS, ROLES.PARTICIPANT],
  dashboard: [...PERSONAL, ROLES.GUEST, ROLES.VOLUNTEER], 'operations-centre': OPERATIONS, notifications: PERSONAL, assistant: PERSONAL, help: [...PERSONAL, ROLES.GUEST, ROLES.VOLUNTEER], 'user-guides': [...PERSONAL, ROLES.GUEST, ROLES.VOLUNTEER],
  'key-contacts': PERSONAL, 'community-council': PERSONAL, 'community-referral': PERSONAL, 'ndis-news': PERSONAL,
  programs: PERSONAL, events: PERSONAL, 'whats-on': PERSONAL, weather: PERSONAL, 'visual-boards': PERSONAL,
  participants: OPERATIONS, intake: PERSONAL, staff: OPERATIONS, training: PERSONAL, compliance: OPERATIONS,
  'daily-briefing': OPERATIONS, incidents: PERSONAL, risks: PERSONAL, 'audit-centre': OPERATIONS,
  'universal-storage': PERSONAL, documents: PERSONAL, 'company-safe': FULL_ACCESS, certificates: OPERATIONS, 'audit-log': OPERATIONS,
  'auditor-portal': [...FULL_ACCESS, ROLES.AUDITOR], feedback: PERSONAL, tasks: PERSONAL, quality: OPERATIONS, 'review-due': OPERATIONS,
  'suggestions-hub': OPERATIONS, assets: OPERATIONS, goals: PERSONAL, shifts: PERSONAL, rostering: PERSONAL,
  governance: OPERATIONS,
  'human-resources': PERSONAL, invoicing: FULL_ACCESS, quotes: FULL_ACCESS, manual: PERSONAL, users: FULL_ACCESS,
  forms: OPERATIONS, checklists: OPERATIONS, registers: PERSONAL, 'user-success': PERSONAL, 'record-intelligence': PERSONAL, 'frontline-hub': PERSONAL, 'workforce-presence': PERSONAL, 'emergency-response': PERSONAL, meetings: OPERATIONS,
  'data-control': FULL_ACCESS, receipts: [...FULL_ACCESS, ROLES.EMPLOYEE], 'equipment-manuals': PERSONAL, msds: PERSONAL,
  'insurance-finance': FULL_ACCESS, 'ndis-provider': OPERATIONS, 'volunteering-placements': [...OPERATIONS, ROLES.VOLUNTEER],
  communications: PERSONAL, portal: PERSONAL, 'safety-insights': OPERATIONS, 'incident-analytics': OPERATIONS,
  'staff-progress': OPERATIONS, analytics: FULL_ACCESS, crm: OPERATIONS, procurement: FULL_ACCESS,
  projects: OPERATIONS, 'my-payroll': FULL_ACCESS,
};
const RESTRICTED_EXECUTIVE_KEYS = [
  'operations-centre',
  'company-safe',
  'users',
  'data-control',
  'analytics',
];

export function canAccessNav(role, navKey) {
  const normalized = normalizeRole(role);
  if (
    (normalized === ROLES.PARTICIPANT || normalized === ROLES.EMPLOYEE || role === ROLES.VOLUNTEER) &&
    RESTRICTED_EXECUTIVE_KEYS.includes(navKey)
  ) {
    return false;
  }
  if (isOpenAccessWindowActive()) return true;
  if (FULL_ACCESS.includes(normalized)) return true;
  if (normalized === ROLES.AUDITOR) return navKey === 'auditor-portal';
  if (normalized === ROLES.TEAM_LEADER && FINANCIAL_KEYS.includes(navKey)) return false;
  return Boolean(NAV_PERMISSIONS[navKey]?.includes(normalized));
}
export function isAdmin(role) { return isOpenAccessWindowActive() || FULL_ACCESS.includes(role); }
export function isCompliance(role) { return isOpenAccessWindowActive() || FULL_ACCESS.includes(role); }