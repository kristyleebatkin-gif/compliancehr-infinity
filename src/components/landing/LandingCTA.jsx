import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
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
      <Reveal className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-6 sm:px-6 sm:py-7 text-center space-y-4">
        {/* Enlarged Ready Header Fitted Cleanly Inside App Design Border + Black Writing Underneath */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex w-full flex-col items-center justify-center rounded-[12px] bg-white px-5 py-5 sm:px-8 sm:py-6 text-center space-y-2.5">
            <h2 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#0A2B6D]">Ready to </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                simplify
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                your NDIS &amp; Aged Care compliance?
              </span>
            </h2>

            <p
              className="mx-auto max-w-3xl text-center text-xs sm:text-sm md:text-base font-extrabold leading-relaxed text-black"
              style={{ color: '#000000' }}
            >
              Join providers who trust ComplianceHR Infinity to keep their records, teams, and participants audit-ready every single day.
            </p>
          </div>
        </div>

        {/* Why ComplianceHR Infinity Stretched Banner + Moved Go to Dashboard & Dashboard Lined Up Side-by-Side Underneath */}
        <div className="w-full space-y-2">
          <div
            className="w-full rounded-full p-[2.5px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="gradient-brand flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(7), color: '#FFFFFF' }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Sparkles className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>Why ComplianceHR Infinity</span>
            </div>
          </div>

          <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2">
            <div
              className="rounded-full p-[2.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <Link
                to={authed ? '/dashboard' : '/register'}
                className="gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-6 py-1.5 text-xs sm:text-sm font-extrabold text-white transition-all hover:opacity-95"
                style={{ background: getHeaderView(0), color: '#FFFFFF' }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                  <ArrowRight className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>{authed ? 'Go to Dashboard' : 'Get Started Free'}</span>
              </Link>
            </div>

            <div
              className="rounded-full p-[2.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <Link
                to="/dashboard"
                className="gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-6 py-1.5 text-xs sm:text-sm font-extrabold text-white transition-all hover:opacity-95"
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                  <Compass className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>Dashboard</span>
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}