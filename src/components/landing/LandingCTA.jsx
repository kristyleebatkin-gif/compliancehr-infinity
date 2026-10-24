import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

export default function LandingCTA() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { base44.auth.isAuthenticated().then(setAuthed).catch(() => {}); }, []);

  return (
    <section id="why" className="mx-auto max-w-6xl scroll-mt-16 px-4 py-12 sm:py-16 md:px-8">
      <div
        className="relative overflow-hidden rounded-[2.5rem] px-6 py-14 text-center text-white shadow-2xl md:px-16 md:py-16"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none font-editorial text-[14rem] font-bold leading-none text-white/[0.06]">
          HR
        </div>
        <Reveal className="relative">
          <div className="inline-flex rounded-full border border-white/25 bg-white/15 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-amber-200">
            Why ComplianceHR Infinity
          </div>
          <h2 className="mt-5 font-editorial text-3xl font-bold tracking-tight text-white md:text-5xl md:leading-tight">
            Ready to simplify your <span className="font-editorial-italic text-amber-200">compliance?</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-white/95">
            Join providers who trust ComplianceHR Infinity to keep their records, teams, and participants audit-ready every single day.
          </p>
          <Link
            to={authed ? '/dashboard' : '/register'}
            className="group mt-8 inline-flex items-center gap-2.5 rounded-full bg-white px-7 py-3.5 text-base font-extrabold text-violet-950 shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl"
          >
            {authed ? 'Go to Dashboard' : 'Get started free'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}