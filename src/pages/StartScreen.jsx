import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import Landing from '@/pages/Landing';

// Signed-in teams start in the Communication Dashboard; visitors still get the
// public landing page.
export default function StartScreen() {
  const [authed, setAuthed] = useState(null);

  useEffect(() => {
    base44.auth
      .isAuthenticated()
      .then(setAuthed)
      .catch(() => setAuthed(false));
  }, []);

  if (authed === null) return null;
  return authed ? <Navigate to="/communications" replace /> : <Landing />;
}