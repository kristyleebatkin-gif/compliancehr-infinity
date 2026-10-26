import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
  getSubheaderColourView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

export default function LandingCTA() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  return (
    <section
      id="why"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <Reveal className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-6 sm:px-8 sm:py-8 text-center space-y-4">
        <span
          className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: getHeaderView(7) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <Sparkles className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">Why ComplianceHR Infinity</span>
        </span>

        <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
          <span className="text-[#0A2B6D]">Ready to </span>
          <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
            simplify
          </span>{' '}
          <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
            your NDIS &amp; Aged Care compliance?
          </span>
        </h2>

        <p
          className="mx-auto max-w-2xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed"
          style={{ color: getSubheaderColourView(1) }}
        >
          Join providers who trust ComplianceHR Infinity to keep their records, teams, and participants audit-ready every single day.
        </p>

        <div className="mx-auto flex flex-wrap items-center justify-center gap-3 pt-1">
          <Link
            to={authed ? '/dashboard' : '/register'}
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
            style={{ background: getHeaderView(0) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </span>
            <span>{authed ? 'Go to Dashboard' : 'Get Started Free'}</span>
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
            style={{ background: getHeaderView(2) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Compass className="h-3.5 w-3.5 text-white" />
            </span>
            <span>Dashboard</span>
          </Link>
        </div>
      </Reveal>
    </section>
  );
}