import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Calendar, Check, ShieldCheck, Lock, FileCheck2, Building2,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import HeroDashboardMockup from '@/components/landing/HeroDashboardMockup';

const GOVERNANCE_PILLARS = [
  'NDIS Practice Standards (356 Checkpoints)',
  'Strengthened Aged Care Quality Standards',
  '100-Point Worker Screening Gate',
  '24h / 5d Statutory Incident Timers',
];

const EXECUTIVE_METRICS = [
  {
    label: 'Audit Readiness',
    value: '99.2%',
    detail: '17 Categories · 356 Checkpoints',
    icon: ShieldCheck,
  },
  {
    label: 'Workforce Clearance',
    value: '100%',
    detail: 'Automated Roster Screening Gate',
    icon: Lock,
  },
  {
    label: 'Statutory SLA',
    value: '0 Overdue',
    detail: '24h & 5d Commission Reporting',
    icon: FileCheck2,
  },
];

export default function LandingHero({ onBookDemo }) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  return (
    <section className="relative w-full">
      <div
        className="relative overflow-hidden rounded-2xl border border-[#0A2B6D]/20 shadow-xl"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        {/* Top Executive Accent Bar */}
        <div
          className="h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 35%, #5A00D6 70%, #FF2E9A 100%)',
          }}
        />

        <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
            {/* Left Column: Executive Governance Copy & Core Metrics */}
            <div className="flex flex-col justify-between lg:col-span-5 text-left text-white space-y-6">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-md border border-[#00C6FF]/40 bg-[#0072FF]/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#00C6FF]">
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
                  <span>Enterprise Compliance, Governance &amp; Clinical Risk OS</span>
                </div>

                <h1
                  className="font-editorial text-[32px] sm:text-[36px] lg:text-[40px] font-extrabold tracking-tight text-white leading-[1.15]"
                  style={{ color: '#FFFFFF' }}
                >
                  The Complete Compliance &amp; Workforce Operating System
                </h1>

                <p className="text-sm sm:text-base font-normal leading-relaxed text-white/90">
                  Built for NDIS, Aged Care, and Allied Health executives, compliance managers, and auditors. Unify 45 self-maintaining master registers, 356 audit checkpoints, workforce credentials, rostering, and statutory reporting in one system of record.
                </p>

                {/* 4 Structured Regulatory Checkpoints */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {GOVERNANCE_PILLARS.map((pillar) => (
                    <div
                      key={pillar}
                      className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium text-white"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
                      <span>{pillar}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3 Executive Assurance Cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 border-t border-white/15 pt-5">
                {EXECUTIVE_METRICS.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={kpi.label}
                      className="rounded-xl border border-white/15 bg-white/5 p-3.5 text-left"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-xs font-semibold text-white/80">
                          {kpi.label}
                        </span>
                        <Icon className="h-4 w-4 shrink-0 text-[#00C6FF]" />
                      </div>
                      <div className="mt-1.5 font-editorial text-xl font-extrabold text-white leading-none">
                        {kpi.value}
                      </div>
                      <div className="mt-1.5 text-xs font-normal text-white/75 leading-snug">
                        {kpi.detail}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Primary & Secondary Enterprise CTAs Moved to Bottom */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => onBookDemo && onBookDemo('Executive Platform Demo')}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:opacity-95"
                  style={{
                    background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                  }}
                >
                  <Calendar className="h-4 w-4 shrink-0 text-white" />
                  <span>Book Executive Demo</span>
                </button>

                <Link
                  to={authed ? '/dashboard' : '/register'}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-white/35 bg-white px-5 py-2.5 text-sm font-bold text-[#0A2B6D] shadow-sm transition hover:bg-slate-100"
                >
                  <span style={{ color: '#0A2B6D' }}>
                    {authed ? 'Open Command Centre' : 'Start 14-Day Free Trial'}
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0 text-[#0072FF]" />
                </Link>
              </div>
            </div>

            {/* Right Column: 3-Row Enterprise GRC Command Preview */}
            <div className="lg:col-span-7">
              <HeroDashboardMockup />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}