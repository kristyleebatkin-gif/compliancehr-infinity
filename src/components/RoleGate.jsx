import React from 'react';
import { Navigate } from 'react-router-dom';
import { useRole } from '@/lib/useRole';

export default function RoleGate({ navKey, children, fallback }) {
  const { can, role } = useRole();
  if (!can(navKey)) {
    if (fallback) return fallback;
    return <Navigate to={role === 'Auditor' ? '/auditor-portal' : '/dashboard'} replace />;
  }
  return children;
}