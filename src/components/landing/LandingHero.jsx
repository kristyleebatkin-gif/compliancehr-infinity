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
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 35%, #5A00D6 70%, #FF2E9A 100%)',
          }}
        />

        <div className="relative z-10 p-3.5 sm:p-4 text-white space-y-3">
          {/* 1. Header Always First (One Straight Sentence, Slightly Bigger) -> Sentence -> Blue/Purple Badges After */}
          <div className="space-y-1 border-b border-white/15 pb-2.5 text-left">
            <h1
              className="font-editorial text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-white leading-tight lg:whitespace-nowrap"
              style={{ color: '#FFFFFF' }}
            >
              The Complete Compliance &amp; Workforce Operating System
            </h1>

            <p className="text-xs sm:text-[13px] font-semibold leading-snug text-white/90">
              Built for NDIS, Aged Care, and Allied Health executives, compliance managers, and auditors — unifying 45 self-maintaining master registers, 356 audit checkpoints, workforce credentials, rostering, and statutory reporting in one system of record.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="inline-flex items-center gap-1.5 rounded-md border border-[#00C6FF]/40 bg-[#0072FF]/25 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15"
                  style={{ boxShadow: '0 0 8px 1px rgba(255,255,255,0.9)' }}
                >
                  <Building2 className="h-2.5 w-2.5 text-white" />
                </span>
                <span>Enterprise Compliance, Governance &amp; Clinical Risk OS</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onBookDemo && onBookDemo('Executive Platform Demo')}
                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg px-3 text-[11px] font-extrabold text-white shadow-md transition hover:opacity-95"
                  style={{
                    background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                  }}
                >
                  <Calendar className="h-3.5 w-3.5 shrink-0 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                  <span>Book Executive Demo</span>
                </button>

                <Link
                  to={authed ? '/dashboard' : '/register'}
                  className="inline-flex h-7 items-center justify-center gap-1.5 rounded-lg border border-white/35 bg-white px-3 text-[11px] font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-slate-100"
                >
                  <span style={{ color: '#0A2B6D' }}>
                    {authed ? 'Open Command Centre' : 'Start 14-Day Free Trial'}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-3 lg:grid-cols-12">
            {/* Left Column: Compact Checkpoints & 3 Executive Assurance Cards */}
            <div className="flex flex-col justify-between lg:col-span-5 text-left text-white space-y-2.5">
              {/* 4 Structured Regulatory Checkpoints with White Lights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {GOVERNANCE_PILLARS.map((pillar) => (
                  <div
                    key={pillar}
                    className="flex items-center gap-2 rounded-lg border border-white/15 bg-[#081018]/80 px-2.5 py-2 text-[11px] font-bold text-white"
                  >
                    <span
                      className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md border border-white/50 bg-[#0072FF]/35"
                      style={{ boxShadow: '0 0 7px rgba(255,255,255,0.85)' }}
                    >
                      <Check className="h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                    </span>
                    <span className="leading-snug">{pillar}</span>
                  </div>
                ))}
              </div>

              {/* 3 Executive Assurance Cards with White Lights */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {EXECUTIVE_METRICS.map((kpi) => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={kpi.label}
                      className="rounded-xl border border-white/15 bg-[#081018]/85 p-2.5 text-left"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[11px] font-bold text-[#00C6FF]">
                          {kpi.label}
                        </span>
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-white/50 bg-[#0072FF]/30"
                          style={{ boxShadow: '0 0 7px rgba(255,255,255,0.85)' }}
                        >
                          <Icon className="h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                        </span>
                      </div>
                      <div className="mt-1 font-editorial text-lg font-black text-white leading-none">
                        {kpi.value}
                      </div>
                      <div className="mt-1 text-[10.5px] font-semibold text-white/80 leading-snug">
                        {kpi.detail}
                      </div>
                    </div>
                  );
                })}
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