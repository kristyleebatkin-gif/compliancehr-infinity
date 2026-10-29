export const ACCESS_ROLES = ['Guest', 'Participant', 'Employee', 'Administration', 'Compliance Administrator', 'Provider Administrator', 'Management', 'Auditor', 'Volunteer'];
export function isOpenAccessWindowActive() {
  return false;
}

const LEGACY_ROLE_MAP = {
  'user': 'Employee',
  'Support Worker': 'Employee',
  'Finance & Accounts Officer': 'Employee',
  'Human Resources Manager': 'Employee',
  'Rostering Coordinator': 'Employee',
  'Quality & Improvement Manager': 'Employee',
  'CRM & Marketing Officer': 'Employee',
  'Intake Officer': 'Employee',
  'Compliance Manager': 'Compliance Administrator',
  'Team Leader': 'Administration',
};
const normalizeAccessRole = (role) => LEGACY_ROLE_MAP[role] || role;
export function hasApprovedAccess(user) {
  if (isOpenAccessWindowActive()) return true;
  if (!user || ['Rejected', 'Archived', 'Suspended'].includes(user.account_status)) return false;
  if (['admin', 'Provider Administrator'].includes(user.role)) return true;
  return user.access_approved === true && user.account_status === 'Active' && ACCESS_ROLES.includes(normalizeAccessRole(user.role));
}
export function canManageAccess(user) {
  if (isOpenAccessWindowActive()) return true;
  return hasApprovedAccess(user) && ['admin', 'Provider Administrator', 'Management'].includes(user.role);
}