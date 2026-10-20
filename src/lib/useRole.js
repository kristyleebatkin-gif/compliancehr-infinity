import { useContext } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ROLES, canAccessNav, isCompliance, isAdmin, normalizeRole, hasApprovedAccess } from '@/lib/roles';

export { ROLES };

export function useRole() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  return {
    user,
    role,
    isAdmin: isAdmin(role),
    isCompliance: isCompliance(role),
    can: (navKey) => hasApprovedAccess(user) && canAccessNav(role, navKey),
  };
}