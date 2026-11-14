import { useContext } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ROLES, canAccessNav, isCompliance, isAdmin, normalizeRole, hasApprovedAccess } from '@/lib/roles';

export { ROLES };

export function useRole() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role);
  // The person's actual role, so specialist roles (HR, Finance...) open their own modules.
  const navRole = user?.role || role;
  return {
    user,
    role,
    navRole,
    isAdmin: isAdmin(role),
    isCompliance: isCompliance(role),
    can: (navKey) => hasApprovedAccess(user) && canAccessNav(navRole, navKey),
  };
}