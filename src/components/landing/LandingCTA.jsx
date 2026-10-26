import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 13%, #5A00D6 26%, #A100FF 39%, #FF2E9A 50%, #A100FF 61%, #5A00D6 74%, #0A2B6D 87%, #0072FF 100%)';

export default function LandingCTA() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  return (
    <section id="why" className="w-full scroll-mt-16 py-4">
      <div
        className="relative overflow-hidden rounded-3xl border-4 border-[#0A2B6D] p-4 sm:p-6 shadow-2xl ring-2 ring-[#FF2E9A]"
        style={{ background: SQUISHED_GRADIENT }}
      >
        {/* Crisp White Inner Card So Every Word is 100% Readable & Never Jammed */}
        <Reveal className="relative rounded-2xl border-2 border-[#0A2B6D] bg-white px-6 py-8 text-center shadow-lg md:px-12 md:py-10">
          <div className="inline-flex items-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-4 py-1 text-xs font-extrabold uppercase tracking-widest text-white shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            Why ComplianceHR Infinity
          </div>
          <h2 className="mt-3 rounded bg-white font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A2B6D]">
            Ready to simplify your{' '}
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              NDIS &amp; Aged Care compliance?
            </span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl rounded bg-white text-sm sm:text-base font-bold leading-relaxed text-[#0A2B6D]">
            Join providers who trust ComplianceHR Infinity to keep their records, teams, and participants audit-ready every single day.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to={authed ? '/dashboard' : '/register'}
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-7 py-3 text-sm sm:text-base font-extrabold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-[#5A00D6]"
            >
              {authed ? 'Go to Dashboard' : 'Get started free'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-6 py-3 text-sm sm:text-base font-extrabold text-[#0A2B6D] shadow-sm hover:bg-[#F5F0FF]"
            >
              Open Live Dashboard
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}