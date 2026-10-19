import { useContext } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ROLES, canAccessNav, isCompliance, isAdmin } from '@/lib/roles';

export { ROLES };

export function useRole() {
  const { user } = useAuth();
  const rawRole = user?.role;
  const role = rawRole === 'admin' ? ROLES.ADMIN
    : rawRole === 'user' ? ROLES.SUPPORT
    : rawRole === 'Team Leader' ? ROLES.TEAM_LEADER
    : (rawRole || ROLES.SUPPORT);
  return {
    user,
    role,
    isAdmin: isAdmin(role),
    isCompliance: isCompliance(role),
    can: (navKey) => canAccessNav(role, navKey),
  };
}