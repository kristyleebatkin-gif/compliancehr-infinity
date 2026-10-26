import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users, Sparkles, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Reveal from '@/components/landing/Reveal';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

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
      badge: 'PILLAR 1 · PEOPLE & PROFILES',
      title: 'People Connected',
      reasons: [
        'Staff, participants & volunteers in one hub',
        'Intake flows straight into live profiles',
        'Consents, screening & certs auto-tracked',
        'Teams, workers & supervisors visible live',
      ],
    },
    {
      icon: BarChart3,
      badge: 'PILLAR 2 · ROSTER & FINANCE',
      title: 'Operations Connected',
      reasons: [
        'Rosters, shift notes, invoices & payroll',
        'Registers, alerts & reminders run 24/7',
        'Every action & shift note logged live',
        'Quotes, receipts, assets & POs reconciled',
      ],
    },
    {
      icon: ShieldCheck,
      badge: 'PILLAR 3 · NDIS & GOVERNANCE',
      title: 'Audit Confidence',
      reasons: [
        'Two-minute audits with branded PDF packs',
        'Evidence attached ready for NDIS auditors',
        'Live trackers prove daily full compliance',
        'Corrective actions tracked to completion',
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

              {/* Governance Sentence Kept */}
              <p className="mx-auto max-w-5xl text-xs sm:text-sm md:text-base lg:text-lg font-extrabold leading-relaxed text-[#0A2B6D]">
                ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation.
              </p>

              {/* Live Maintenance Tracker Underneath the Governance Sentence */}
              <div
                className="w-full rounded-2xl p-[3px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-[13px] bg-white px-4 py-2 text-center">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full bg-[#10B981]"
                      style={{ boxShadow: '0 0 10px 3px #10B981' }}
                    />
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      Live Maintenance Tracker
                    </span>
                    <span className="rounded-full bg-[#10B981] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                      100% LIVE
                    </span>
                  </div>
                  <div className="flex-1 min-w-[140px] max-w-md h-2.5 rounded-full bg-[#F5F0FF] border border-[#0A2B6D]/20 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: '100%',
                        background: 'linear-gradient(90deg, #0072FF 0%, #10B981 50%, #FF2E9A 100%)',
                      }}
                    />
                  </div>
                  <Link
                    to="/assets"
                    className="gradient-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold text-white"
                    style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                  >
                    <span style={{ color: '#FFFFFF' }}>Assets, Fleet &amp; Safety Kits Current</span>
                    <ArrowRight className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width Side-to-Side Credit Card Bar + Full-Width Start 14-Day Free Trial — No obligation to stay */}
          <div className="mx-auto flex w-full flex-col items-center justify-center gap-2.5 text-center">
            <div
              className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
              style={{ background: getHeaderView(2) }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-center">Credit card required · 14-day free trial · Set up in minutes</span>
            </div>

            <Link
              to={authed ? '/dashboard' : '/register'}
              className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm transition-all hover:-translate-y-0.5"
              style={{ background: getHeaderView(1) }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <UserCheck className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-center">Start 14-Day Free Trial — No obligation to stay</span>
            </Link>
          </div>

          {/* 4 Modules Under Start 14-Day Free Trial — Halved in Size in App-Design Colour */}
          <div className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.05}
                className="flex min-h-[34px] items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-1 text-center text-white shadow-2xs"
                style={{
                  background: getHeaderView(index),
                  borderColor: getAppBorderView(index),
                  color: '#FFFFFF',
                }}
              >
                <span
                  className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white shadow-2xs"
                  style={{ borderColor: getAppBorderView(index) }}
                >
                  <Sparkles className="h-2.5 w-2.5" style={{ color: getSymbolView(index).iconColor }} />
                </span>
                <div className="text-left min-w-0">
                  <div className="font-editorial text-xs sm:text-sm font-extrabold leading-none text-white" style={{ color: '#FFFFFF' }}>
                    {stat.value}
                  </div>
                  <div className="text-[7.5px] sm:text-[8.5px] font-extrabold uppercase tracking-wide leading-tight text-white" style={{ color: '#FFFFFF' }}>
                    {stat.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 3 Pillar Tiles — Halved in Size & Styled in App-Design Colour */}
          <div className="grid w-full gap-2 text-center md:grid-cols-3 items-stretch">
            {highlights.map(({ icon: Icon, badge, title, reasons }, index) => (
              <Reveal
                key={title}
                delay={index * 0.07}
                className="flex h-full flex-col rounded-2xl border-2 border-[#0A2B6D] p-[3px] shadow-sm transition-all hover:-translate-y-0.5"
                style={{ background: getHeaderView(index) }}
              >
                <div
                  className="flex h-full flex-1 flex-col justify-between rounded-[12px] p-1.5 space-y-1"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  {/* App-Coloured Pillar Header Tile */}
                  <div
                    className="gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-0.5 text-center text-white"
                    style={{ background: getHeaderView(index), color: '#FFFFFF' }}
                  >
                    <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                      {badge} · {title}
                    </span>
                  </div>

                  {/* 4 Compact Rows Framed in App-Design Colour */}
                  <ul className="grid flex-1 grid-cols-1 grid-rows-4 gap-1">
                    {reasons.map((r, rIdx) => {
                      const sym = getSymbolView(index * 3 + rIdx);
                      return (
                        <li
                          key={r}
                          className="flex min-h-[24px] items-center gap-1.5 rounded-lg bg-white px-2 py-0.5 text-left text-[8.5px] font-extrabold leading-tight"
                        >
                          <CheckCircle2 className="h-3 w-3 shrink-0" style={{ color: sym.iconColor }} />
                          <span className="flex-1" style={{ color: sym.iconColor }}>{r}</span>
                        </li>
                      );
                    })}
                  </ul>

                  <Link
                    to="/dashboard"
                    className="gradient-brand inline-flex min-h-[22px] w-full items-center justify-center gap-1 rounded-full border border-white px-2.5 py-0.5 text-[8.5px] font-extrabold text-white"
                    style={{ background: getHeaderView(index + 2), color: '#FFFFFF' }}
                  >
                    <span style={{ color: '#FFFFFF' }}>Explore in Dashboard</span>
                    <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}