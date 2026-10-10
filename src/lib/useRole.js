import { useContext } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { ROLES, canAccessNav, isCompliance, isAdmin } from '@/lib/roles';

export function useRole() {
  const { user } = useAuth();
  const rawRole = user?.role;
  const role = rawRole === 'admin' ? ROLES.ADMIN
    : rawRole === 'user' ? ROLES.SUPPORT
    : (rawRole || ROLES.SUPPORT);
  return {
    user,
    role,
    isAdmin: isAdmin(role),
    isCompliance: isCompliance(role),
    can: (navKey) => canAccessNav(role, navKey),
  };
}