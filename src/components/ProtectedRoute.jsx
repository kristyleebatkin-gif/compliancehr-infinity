import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import AccountApprovalGate from '@/components/AccountApprovalGate';
import { hasApprovedAccess } from '@/lib/roles';
import { useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { user, isAuthenticated, isLoadingAuth, authChecked, authError, checkUserAuth } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!authChecked && !isLoadingAuth) {
      checkUserAuth();
    }
  }, [authChecked, isLoadingAuth, checkUserAuth]);

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  const loginRedirect = unauthenticatedElement || <Navigate to={'/login?returnTo=' + encodeURIComponent(location.pathname + location.search + location.hash)} replace />;

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
    return loginRedirect;
  }

  if (!isAuthenticated || !user) {
    return loginRedirect;
  }

  if (!hasApprovedAccess(user)) return <AccountApprovalGate />;
  if (user.role === 'Auditor' && location.pathname !== '/auditor-portal') return <Navigate to="/auditor-portal" replace />;
  return <Outlet />;
}