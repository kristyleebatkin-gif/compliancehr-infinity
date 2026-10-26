import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users, Sparkles, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';
import LiveSuperPlatformPulseBar from '@/components/landing/LiveSuperPlatformPulseBar';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const PINK_BLUE_PURPLE_SPRAY =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.68) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.68) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.68) 0%, transparent 52%), #FFFFFF';

const STATS = [
  { value: `${MODULE_DIRECTORY.length}`, label: 'Connected Modules' },
  { value: '2 min', label: 'Express Internal Audits' },
  { value: 'Live', label: 'Compliance & Expiry Trackers' },
  { value: '24/7', label: 'Automated Reminders & Alerts' },
];

export default function LandingHero() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => {
    base44.auth.isAuthenticated().then(setAuthed).catch(() => {});
  }, []);

  const highlights = [
    {
      icon: Users,
      badge: 'PILLAR 1 · PEOPLE & ROSTER',
      title: 'People & Shifts',
      reasons: [
        'Staff, participants & volunteers in one hub',
        'Intake flows straight into live profiles',
        'Consents, screening & certs auto-tracked',
        'Rosters, shift notes & teams synced live',
      ],
    },
    {
      icon: BarChart3,
      badge: 'PILLAR 2 · FINANCE & OPS',
      title: 'Ops Connected',
      reasons: [
        'NDIS invoices, payroll & claim matching',
        'Registers, alerts & reminders run 24/7',
        'Quotes, receipts, assets & POs reconciled',
        'Every shift note & action logged live',
      ],
    },
    {
      icon: ShieldCheck,
      badge: 'PILLAR 3 · NDIS & AUDIT',
      title: 'Audit Ready',
      reasons: [
        '2-min audits & 30-action PDF batch packs',
        'Evidence attached ready for NDIS auditors',
        'Live trackers prove daily full compliance',
        'Corrective actions & risks tracked live',
      ],
    },
  ];

  return (
    <section className="w-full space-y-4">
      <div
        className="rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-5 sm:px-6 sm:py-6 text-center space-y-4">
          {/* Enlarged Compliance Management Title & Dark Blue Paragraph + App-Coloured Outline Under Words */}
          <div
            className="w-full rounded-2xl p-[4px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="flex w-full flex-col items-center justify-center rounded-[12px] bg-white px-4 py-4 text-center space-y-3">
              {/* 3 Words / Parts Fitted Cleanly on Two Lines at the Top */}
              <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight pb-1">
                <span className="block">
                  <span className="text-[#0A2B6D]">Compliance </span>
                  <span className="bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    management,
                  </span>
                </span>
                <span className="block bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  simplified end to end.
                </span>
              </h1>

              {/* Governance Sentence Inside Border With White Background */}
              <div
                className="w-full rounded-xl p-[2px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <p className="mx-auto w-full rounded-[10px] bg-white px-4 py-2 text-xs sm:text-sm md:text-base font-extrabold leading-relaxed text-[#0A2B6D]">
                  ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation.
                </p>
              </div>

              {/* Live Compliance Tracker */}
              <div
                className="w-full rounded-2xl p-[2px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div className="flex flex-col items-center justify-center rounded-[12px] bg-white px-3 py-1.5 text-center">
                  <div className="flex w-full flex-wrap items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full bg-[#10B981]"
                        style={{ boxShadow: '0 0 8px 2px #10B981' }}
                      />
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                        Live Compliance Tracker
                      </span>
                      <span className="rounded-full bg-[#10B981] px-2 py-0 text-[8.5px] font-extrabold text-white">
                        100% LIVE
                      </span>
                    </div>
                    <div className="w-full max-w-md h-1.5 rounded-full bg-[#F5F0FF] border border-[#0A2B6D]/20 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: '100%',
                          background: 'linear-gradient(90deg, #0072FF 0%, #10B981 50%, #FF2E9A 100%)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Smaller Credit Card Bar + Smaller Start 14-Day Free Trial Tiles */}
          <div className="mx-auto flex w-full flex-col items-center justify-center gap-1.5 text-center">
            <div
              className="flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-3 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold tracking-wide text-white shadow-2xs"
              style={{ background: getHeaderView(2) }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <ShieldCheck className="h-2.5 w-2.5 text-white" />
              </span>
              <span className="text-center">Credit card required · 14-day free trial · Set up in minutes</span>
            </div>

            <Link
              to={authed ? '/dashboard' : '/register'}
              className="flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-3 py-0.5 text-[9.5px] sm:text-[10.5px] font-extrabold tracking-wide text-white shadow-2xs transition-all hover:-translate-y-0.5"
              style={{ background: getHeaderView(1) }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <UserCheck className="h-2.5 w-2.5 text-white" />
              </span>
              <span className="text-center">Start 14-Day Free Trial — No obligation to stay</span>
            </Link>
          </div>

          {/* 4 Small Stat Tiles — White Outside Border & Pink/Blue/Purple Spray With Dark Blue Writing Inside */}
          <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-4 items-stretch">
            {STATS.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.05}
                className="flex h-full rounded-xl p-[2px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div className="grid h-full w-full grid-cols-1 grid-rows-[20px_24px] gap-1 rounded-[9px] bg-white p-1 text-center">
                  <div
                    className="gradient-brand flex h-[20px] w-full items-center justify-center gap-1 rounded-md px-2 text-white"
                    style={{ background: getHeaderView(index), color: '#FFFFFF' }}
                  >
                    <Sparkles className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span className="font-editorial text-[11px] font-extrabold leading-none text-white" style={{ color: '#FFFFFF' }}>
                      {stat.value}
                    </span>
                  </div>
                  <div
                    className="flex h-[24px] w-full rounded-md p-[1.5px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="flex h-full w-full items-center justify-center rounded-[4px] px-1 text-center text-[7px] font-extrabold uppercase tracking-wide text-[#0A2B6D] whitespace-nowrap"
                      style={{ background: PINK_BLUE_PURPLE_SPRAY }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 3 Minimised Pillar Tiles — White Outside Border & Pink/Blue/Purple Spray With Dark Blue Writing Inside */}
          <div className="grid w-full gap-1.5 text-center md:grid-cols-3 items-stretch">
            {highlights.map(({ icon: Icon, badge, title, reasons }, index) => (
              <Reveal
                key={title}
                delay={index * 0.07}
                className="flex h-full flex-col rounded-xl p-[2px] shadow-sm transition-all hover:-translate-y-0.5"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div className="flex h-full flex-1 flex-col justify-between rounded-[9px] bg-white p-1 space-y-1">
                  {/* App-Coloured Pillar Header Tile */}
                  <div
                    className="gradient-brand flex h-[20px] w-full items-center justify-center gap-1 rounded-md px-1.5 text-center text-white whitespace-nowrap"
                    style={{ background: getHeaderView(index), color: '#FFFFFF' }}
                  >
                    <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span className="text-[7px] font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                      {badge} · {title}
                    </span>
                  </div>

                  {/* 4 Compact Rows: Pink/Blue/Purple Spray & Dark Blue Writing */}
                  <ul className="grid flex-1 grid-cols-1 grid-rows-4 gap-0.5">
                    {reasons.map((r) => (
                      <li
                        key={r}
                        className="flex h-[20px] rounded p-[1px]"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div
                          className="flex h-full w-full items-center justify-center gap-1 rounded-[3px] px-1.5 text-center text-[7px] font-extrabold leading-none text-[#0A2B6D] whitespace-nowrap"
                          style={{ background: PINK_BLUE_PURPLE_SPRAY }}
                        >
                          <CheckCircle2 className="h-2 w-2 shrink-0 text-[#0A2B6D]" />
                          <span className="text-[#0A2B6D]">{r}</span>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to="/dashboard"
                    className="gradient-brand inline-flex h-[18px] w-full items-center justify-center gap-1 rounded-full border border-white px-2 text-[7px] font-extrabold text-white"
                    style={{ background: getHeaderView(index + 2), color: '#FFFFFF' }}
                  >
                    <span style={{ color: '#FFFFFF' }}>Explore in Dashboard</span>
                    <ArrowRight className="h-2 w-2 text-white" style={{ color: '#FFFFFF' }} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          {/* Cool & Functional Live Super-Platform Command & Instant Module Launcher */}
          <LiveSuperPlatformPulseBar />
        </div>
      </div>
    </section>
  );
}