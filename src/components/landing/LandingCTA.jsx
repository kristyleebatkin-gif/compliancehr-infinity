import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';

export default function LandingCTA() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { base44.auth.isAuthenticated().then(setAuthed).catch(() => {}); }, []);

  return (
    <section id="why" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-14 sm:py-20 md:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-16 text-center shadow-2xl shadow-slate-900/30 md:px-16 md:py-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-600/25 blur-3xl" />
          <div className="absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        </div>
        <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none font-editorial text-[16rem] font-bold leading-none text-white/[0.03]">HR</div>
        <Reveal className="relative">
          <div className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-200">Why ComplianceHR</div>
          <h2 className="mt-6 font-editorial text-3xl font-medium tracking-tight text-white md:text-5xl md:leading-tight">
            Ready to simplify your <span className="font-editorial-italic bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">compliance?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">Join providers who trust ComplianceHR to keep their records, teams, and participants audit-ready.</p>
          <Link to={authed ? '/dashboard' : '/register'} className="group mt-9 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-base font-semibold text-slate-950 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl">
            {authed ? 'Go to Dashboard' : 'Get started free'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}