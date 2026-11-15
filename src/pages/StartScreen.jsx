import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { navigationHome } from '@/lib/navigationHome';
import Landing from '@/pages/Landing';

export default function StartScreen() {
  const { user, isAuthenticated, isLoadingAuth, authChecked } = useAuth();
  if (isLoadingAuth || !authChecked) return <p role="status" className="p-6">Loading workspace…</p>;
  return isAuthenticated && user ? <Navigate to={navigationHome(user)} replace /> : <Landing />;
}
