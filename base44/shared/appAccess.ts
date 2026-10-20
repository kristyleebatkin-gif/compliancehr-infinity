export const ACCESS_ROLES = ['Provider Administrator', 'Management', 'Administration', 'Employee', 'Participant', 'Auditor'];
export function hasApprovedAccess(user) {
  if (!user || ['Rejected', 'Archived', 'Suspended'].includes(user.account_status)) return false;
  if (['admin', 'Provider Administrator'].includes(user.role)) return true;
  return user.access_approved === true && user.account_status === 'Active' && ACCESS_ROLES.includes(user.role);
}
export function canManageAccess(user) {
  return hasApprovedAccess(user) && ['admin', 'Provider Administrator', 'Management'].includes(user.role);
}