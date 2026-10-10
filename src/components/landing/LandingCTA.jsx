import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LandingCTA() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { base44.auth.isAuthenticated().then(setAuthed).catch(() => {}); }, []);

  return (
    <section id="why" className="mx-auto max-w-6xl px-4 py-20 md:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-800 via-indigo-700 to-cyan-600 px-8 py-16 text-center shadow-2xl shadow-indigo-500/20 md:px-16">
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-fuchsia-300/20 blur-2xl" />
        <div className="absolute left-1/2 top-0 h-40 w-40 rounded-full bg-amber-300/15 blur-2xl" />
        <div className="absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-cyan-200/20 blur-2xl" />
        <div className="relative">
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">Ready to simplify your compliance?</h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">Join providers who trust ComplianceHR to keep their records, teams, and participants audit-ready.</p>
          <Link to={authed ? '/dashboard' : '/register'} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-base font-semibold text-brand shadow-lg transition-all hover:shadow-xl">
            {authed ? 'Go to Dashboard' : 'Get started free'}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}