import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users, Sparkles, Compass, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleChipStrip from '@/components/landing/ModuleChipStrip';
import Reveal from '@/components/landing/Reveal';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  getTilePalette,
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
        'Staff, participants, volunteers and key personnel in one place',
        'Intake flows straight into live, kept-current profiles',
        'Consents, screening and certificates tracked automatically',
        'Teams, support workers and supervisors always visible',
      ],
    },
    {
      icon: BarChart3,
      badge: 'PILLAR 2 · ROSTER, COMMS & FINANCE',
      title: 'Operations Connected',
      reasons: [
        'Rosters, shift notes, invoices and payroll in one flow',
        'Registers, alerts and reminders run themselves',
        'Every action and conversation documented as it happens',
        'Quotes, receipts, assets and purchase orders reconciled',
      ],
    },
    {
      icon: ShieldCheck,
      badge: 'PILLAR 3 · NDIS & GOVERNANCE',
      title: 'Audit Confidence',
      reasons: [
        'Two-minute internal audits with branded reports',
        'Evidence attached as you work, ready for your NDIS auditor',
        'Live trackers prove every document is compliant, every day',
        'Corrective actions raised and closed with full history',
      ],
    },
  ];

  return (
    <section className="w-full space-y-4">
      <div
        className="rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-5 sm:px-6 sm:py-6 text-center space-y-5">
          {/* Enlarged Compliance Management Title & Paragraph (3 Software Tiles Above Removed) */}
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center text-center space-y-3">
            <h1 className="font-editorial text-3xl sm:text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
              <span className="text-[#0A2B6D]">Compliance </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                management,
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                simplified end to end.
              </span>
            </h1>

            <p className="mx-auto max-w-5xl text-sm sm:text-base md:text-lg lg:text-xl font-extrabold leading-relaxed text-[#0072FF]">
              ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation.
            </p>
          </div>

          {/* Centred Header Badge with WHITE Symbol + 3 Action Buttons */}
          <div className="mx-auto flex w-full flex-col items-center justify-center gap-2.5 text-center">
            <span
              className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
              style={{ background: getHeaderView(2) }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-center">No credit card required · 14-day free trial · Set up in minutes</span>
            </span>

            <div className="mx-auto grid w-full max-w-2xl grid-cols-1 sm:grid-cols-3 items-center justify-center gap-2.5">
              <Link
                to="/dashboard"
                className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{ background: getHeaderView(0) }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                  <Sparkles className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="whitespace-nowrap text-center">Dashboard</span>
              </Link>

              <Link
                to={authed ? '/dashboard' : '/register'}
                className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{ background: getHeaderView(1) }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                  <UserCheck className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="whitespace-nowrap text-center">Start 14-Day Free Trial</span>
              </Link>

              <a
                href="#quick-start"
                className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{ background: getHeaderView(3) }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                  <Compass className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="whitespace-nowrap text-center">Our Quick 4 Step Start Guide</span>
              </a>
            </div>
          </div>

          {/* 4 Stat Pills in Mixed Full Colours + App-Coloured Symbols */}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => {
              const tile = getTilePalette(index + 3);
              const sym = getSymbolView(index + 3);
              return (
                <Reveal
                  key={stat.label}
                  delay={index * 0.05}
                  className="flex items-center justify-center gap-2.5 rounded-2xl border-2 px-4 py-3 text-center shadow-sm"
                  style={{
                    backgroundColor: tile.bg,
                    color: tile.text,
                    borderColor: getAppBorderView(index + 3),
                  }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-2xs">
                    <Sparkles className="h-4 w-4" style={{ color: sym.iconColor }} />
                  </span>
                  <div className="text-left">
                    <div
                      className="font-editorial text-lg sm:text-xl font-extrabold leading-none"
                      style={{ color: tile.text }}
                    >
                      {stat.value}
                    </div>
                    <div
                      className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider"
                      style={{ color: tile.subtext }}
                    >
                      {stat.label}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* 3 Pillar Cards — Exact Same Unified Design, Filling All Sections Edge-to-Edge */}
          <div className="grid w-full gap-4 text-left sm:grid-cols-3 items-stretch">
            {highlights.map(({ icon: Icon, badge, title, reasons }, index) => (
              <Reveal
                key={title}
                delay={index * 0.07}
                className="flex h-full flex-col justify-between rounded-2xl border-2 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ borderColor: getAppBorderView(index) }}
              >
                <div className="flex flex-1 flex-col justify-between space-y-3">
                  <div className="flex flex-col items-center text-center space-y-1.5">
                    <span
                      className="inline-flex min-h-[36px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
                      style={{ background: getHeaderView(0) }}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                        <Icon className="h-3 w-3 text-white" />
                      </span>
                      <span>{badge}</span>
                    </span>
                    <h3 className="font-editorial text-xl sm:text-2xl font-extrabold">
                      <span className="text-[#0A2B6D]">{title.split(' ')[0]} </span>
                      <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                        {title.split(' ').slice(1).join(' ')}
                      </span>
                    </h3>
                  </div>

                  <ul className="grid flex-1 grid-cols-1 auto-rows-fr gap-2.5">
                    {reasons.map((r, rIdx) => {
                      const tile = getTilePalette(index * 3 + rIdx);
                      const sym = getSymbolView(index * 3 + rIdx);
                      return (
                        <li
                          key={r}
                          className="flex h-full items-center gap-2.5 rounded-2xl border-2 px-3.5 py-2.5 text-xs font-extrabold leading-snug shadow-2xs"
                          style={{
                            backgroundColor: tile.bg,
                            color: tile.text,
                            borderColor: getAppBorderView(index * 3 + rIdx),
                          }}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white">
                            <CheckCircle2 className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                          </span>
                          <span className="flex-1" style={{ color: tile.text }}>{r}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>

                <div className="mt-4 flex justify-center">
                  <Link
                    to="/dashboard"
                    className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                    style={{ background: getHeaderView(0) }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                      <ArrowRight className="h-3 w-3 text-white" />
                    </span>
                    <span>Explore in Dashboard</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* Live App Modules - All modules live */}
      <ModuleChipStrip />
    </section>
  );
}