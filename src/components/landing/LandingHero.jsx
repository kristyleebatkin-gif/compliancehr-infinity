import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Check, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HeroDashboardMockup from '@/components/landing/HeroDashboardMockup';

const TRUST_BADGES = [
  '✓ Audit Ready',
  '✓ AI Powered',
  '✓ 46 Connected Modules',
  '✓ NDIS Focused',
];

export default function LandingHero({ onBookDemo }) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  return (
    <section className="relative w-full pt-4 pb-8">
      <div
        className="rounded-3xl p-[3px] shadow-xl"
        style={{
          background: 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 25%, #5A00D6 60%, #FF2E9A 100%)',
        }}
      >
        <div className="rounded-[21px] bg-white px-5 py-8 sm:px-10 sm:py-12 lg:py-14">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Left Column: Headline, Subheading, CTAs & Trust Badges */}
            <div className="lg:col-span-6 text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#0072FF]/25 bg-[#0072FF]/8 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                <ShieldCheck className="h-4 w-4 text-[#5A00D6]" />
                <span>Purpose-Built for NDIS &amp; Disability Support Providers</span>
              </div>

              <h1 className="font-editorial text-3xl sm:text-5xl lg:text-[3.25rem] font-extrabold tracking-tight text-[#0A2B6D] leading-[1.12]">
                The Complete{' '}
                <span className="bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  Compliance &amp; Workforce
                </span>{' '}
                Management Platform
              </h1>

              <p className="max-w-xl text-base sm:text-lg font-medium leading-relaxed text-[#0A2B6D]/80">
                Manage participants, staff, compliance, incidents, rostering, HR, invoicing and audit readiness from one connected platform.
              </p>

              {/* Primary Call-To-Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
                <button
                  type="button"
                  onClick={() => onBookDemo && onBookDemo('Book a Live Platform Demo')}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#0A2B6D] bg-[#0A2B6D] px-7 py-4 text-base font-extrabold text-white shadow-lg transition hover:bg-[#0072FF] hover:border-[#0072FF]"
                >
                  <Calendar className="h-5 w-5 text-[#00C6FF]" />
                  <span>Book a Demo</span>
                </button>

                <Link
                  to={authed ? '/dashboard' : '/register'}
                  className="inline-flex items-center justify-center gap-2.5 rounded-2xl px-7 py-4 text-base font-extrabold text-white shadow-lg transition hover:opacity-95"
                  style={{
                    background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)',
                  }}
                >
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-5 w-5 text-white" />
                </Link>
              </div>

              {/* 4 Required Trust Badges */}
              <div className="pt-2">
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                  {TRUST_BADGES.map((badge) => (
                    <div
                      key={badge}
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2.5 text-xs font-extrabold text-[#0A2B6D] shadow-2xs"
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white text-[11px]"
                        style={{
                          background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 60%, #FF2E9A 100%)',
                        }}
                      >
                        <Check className="h-3 w-3 text-white" />
                      </span>
                      <span>{badge.replace(/^✓\s*/, '')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Premium Executive Dashboard Mockup */}
            <div className="lg:col-span-6">
              <HeroDashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}