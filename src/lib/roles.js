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
];
// Open-access window: allows any visitor or user full access to browse the app.
const OPEN_ACCESS_DURATION_MS = 365 * 24 * 60 * 60 * 1000;
const OPEN_ACCESS_STORAGE_KEY = 'chr_open_access_window_start_v5';
// Extended cutoff so ongoing testing, browsing and verification remains uninterrupted
const OPEN_ACCESS_ABSOLUTE_UNTIL_MS = Date.parse('2027-12-31T23:59:59Z');

export function isOpenAccessWindowActive() {
  const now = Date.now();
  if (now <= OPEN_ACCESS_ABSOLUTE_UNTIL_MS) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        let start = Number(window.localStorage.getItem(OPEN_ACCESS_STORAGE_KEY));
        if (!start || Number.isNaN(start)) {
          start = now;
          window.localStorage.setItem(OPEN_ACCESS_STORAGE_KEY, String(start));
        }
        return now - start <= OPEN_ACCESS_DURATION_MS;
      }
    } catch {
      return true;
    }
    return true;
  }
  return false;
}

const FULL_ACCESS = ['admin', ROLES.ADMIN, ROLES.COMPLIANCE_ADMIN, ROLES.MANAGEMENT];
const OPERATIONS = [...FULL_ACCESS, ROLES.TEAM_LEADER];
const PERSONAL = [...OPERATIONS, ROLES.EMPLOYEE, ROLES.PARTICIPANT, ROLES.GUEST];
const FINANCIAL_KEYS = ['invoicing', 'quotes', 'receipts', 'insurance-finance', 'procurement', 'analytics', 'my-payroll'];
export function normalizeRole(role) {
  if (role === 'admin') return ROLES.ADMIN;
  if (role === 'Compliance Manager' || role === 'Compliance Administrator') return ROLES.COMPLIANCE_ADMIN;
  if (role === 'Team Leader') return ROLES.TEAM_LEADER;
  if (['user', 'Support Worker', ROLES.FINANCE, ROLES.HR, ROLES.ROSTERING, ROLES.QUALITY, ROLES.MARKETING, ROLES.INTAKE, ROLES.VOLUNTEER].includes(role)) return ROLES.EMPLOYEE;
  if (!role && isOpenAccessWindowActive()) return ROLES.ADMIN;
  return role || ROLES.PENDING_APPROVAL;
}
export function hasApprovedAccess(user) {
  if (isOpenAccessWindowActive()) return true;
  if (!user || ['Rejected', 'Archived', 'Suspended'].includes(user.account_status)) return false;
  if (['admin', ROLES.ADMIN].includes(user.role)) return true;
  return user.access_approved === true && user.account_status === 'Active' && ALL_ROLES.includes(user.role);
}
export const NAV_PERMISSIONS = {
  'my-profile': PERSONAL, 'our-staff': [...OPERATIONS, ROLES.EMPLOYEE], 'our-participants': [...OPERATIONS, ROLES.PARTICIPANT],
  dashboard: PERSONAL, 'operations-centre': OPERATIONS, notifications: PERSONAL, assistant: PERSONAL, help: PERSONAL, 'user-guides': PERSONAL,
  'key-contacts': PERSONAL, 'community-council': PERSONAL, 'community-referral': PERSONAL, 'ndis-news': PERSONAL,
  programs: PERSONAL, events: PERSONAL, 'whats-on': PERSONAL, weather: PERSONAL, 'visual-boards': PERSONAL,
  participants: OPERATIONS, intake: PERSONAL, staff: OPERATIONS, training: PERSONAL, compliance: OPERATIONS,
  'daily-briefing': OPERATIONS, incidents: PERSONAL, risks: PERSONAL, 'audit-centre': OPERATIONS,
  'universal-storage': PERSONAL, documents: PERSONAL, 'company-safe': FULL_ACCESS, certificates: OPERATIONS, 'audit-log': OPERATIONS,
  'auditor-portal': [...FULL_ACCESS, ROLES.AUDITOR], feedback: PERSONAL, tasks: PERSONAL, quality: OPERATIONS,
  'suggestions-hub': OPERATIONS, assets: OPERATIONS, goals: PERSONAL, shifts: PERSONAL, rostering: PERSONAL,
  'human-resources': PERSONAL, invoicing: FULL_ACCESS, quotes: FULL_ACCESS, manual: PERSONAL, users: FULL_ACCESS,
  forms: OPERATIONS, checklists: OPERATIONS, 'workforce-presence': PERSONAL, 'emergency-response': PERSONAL, meetings: OPERATIONS,
  'data-control': FULL_ACCESS, receipts: [...FULL_ACCESS, ROLES.EMPLOYEE], 'equipment-manuals': PERSONAL, msds: PERSONAL,
  'insurance-finance': FULL_ACCESS, 'ndis-provider': OPERATIONS, 'volunteering-placements': OPERATIONS,
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