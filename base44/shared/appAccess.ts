export const ACCESS_ROLES = ['Provider Administrator', 'Management', 'Administration', 'Employee', 'Participant', 'Auditor'];
const OPEN_ACCESS_ABSOLUTE_UNTIL_MS = Date.parse('2026-10-24T16:08:00Z');
export function isOpenAccessWindowActive() {
  return Date.now() <= OPEN_ACCESS_ABSOLUTE_UNTIL_MS;
}
export function hasApprovedAccess(user) {
  if (isOpenAccessWindowActive()) return true;
  if (!user || ['Rejected', 'Archived', 'Suspended'].includes(user.account_status)) return false;
  if (['admin', 'Provider Administrator'].includes(user.role)) return true;
  return user.access_approved === true && user.account_status === 'Active' && ACCESS_ROLES.includes(user.role);
}
export function canManageAccess(user) {
  if (isOpenAccessWindowActive()) return true;
  return hasApprovedAccess(user) && ['admin', 'Provider Administrator', 'Management'].includes(user.role);
}