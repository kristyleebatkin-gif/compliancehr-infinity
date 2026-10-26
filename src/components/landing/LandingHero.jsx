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

          {/* 4 Modules Under Start 14-Day Free Trial in Different App Colour Views with White Writing */}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.05}
                className="flex min-h-[62px] items-center justify-center gap-2 rounded-2xl border-2 px-3 py-2.5 text-center text-white shadow-sm"
                style={{
                  background: getHeaderView(index),
                  borderColor: getAppBorderView(index),
                  color: '#FFFFFF',
                }}
              >
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                  style={{ borderColor: getAppBorderView(index) }}
                >
                  <Sparkles className="h-3.5 w-3.5" style={{ color: getSymbolView(index).iconColor }} />
                </span>
                <div className="text-left min-w-0">
                  <div className="font-editorial text-base sm:text-lg font-extrabold leading-none text-white">
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[9.5px] sm:text-[10px] font-extrabold uppercase tracking-wide leading-tight text-white">
                    {stat.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 3 Pillar Cards — Symbols & Writing in App Design Colour, Fitted Cleanly & Lined Up */}
          <div className="grid w-full gap-4 text-center md:grid-cols-3 items-stretch">
            {highlights.map(({ icon: Icon, badge, title, reasons }, index) => {
              const pSym = getSymbolView(index);
              const PILLAR_SPRAY_BGS = [
                'radial-gradient(circle at 12% 20%, rgba(255, 133, 224, 0.55) 0%, transparent 45%), radial-gradient(circle at 88% 25%, rgba(56, 189, 248, 0.55) 0%, transparent 48%), radial-gradient(circle at 52% 85%, rgba(192, 132, 252, 0.55) 0%, transparent 50%), #FFFFFF',
                'radial-gradient(circle at 18% 80%, rgba(56, 189, 248, 0.58) 0%, transparent 46%), radial-gradient(circle at 82% 20%, rgba(192, 132, 252, 0.55) 0%, transparent 46%), radial-gradient(circle at 50% 35%, rgba(255, 133, 224, 0.5) 0%, transparent 48%), #FFFFFF',
                'radial-gradient(circle at 15% 30%, rgba(192, 132, 252, 0.58) 0%, transparent 46%), radial-gradient(circle at 85% 75%, rgba(255, 133, 224, 0.58) 0%, transparent 46%), radial-gradient(circle at 55% 20%, rgba(56, 189, 248, 0.52) 0%, transparent 48%), #FFFFFF',
                'radial-gradient(circle at 85% 22%, rgba(255, 133, 224, 0.58) 0%, transparent 46%), radial-gradient(circle at 15% 78%, rgba(56, 189, 248, 0.56) 0%, transparent 46%), radial-gradient(circle at 48% 50%, rgba(192, 132, 252, 0.52) 0%, transparent 50%), #FFFFFF',
              ];
              return (
                <Reveal
                  key={title}
                  delay={index * 0.07}
                  className="flex h-full flex-col rounded-3xl p-[6px] shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex h-full flex-1 flex-col justify-between rounded-[18px] bg-white p-3">
                    <div className="flex flex-1 flex-col justify-between space-y-2">
                      {/* Pillar Title & Badge in App Design Colours */}
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div
                          className="w-full rounded-xl p-[2.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[46px] w-full items-center justify-center gap-2 rounded-[9px] bg-white px-2.5 py-1.5 text-center">
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                              style={{ borderColor: getAppBorderView(index) }}
                            >
                              <Icon className="h-3.5 w-3.5" style={{ color: pSym.iconColor }} />
                            </span>
                            <h3 className="font-editorial text-sm sm:text-base lg:text-lg font-extrabold leading-tight bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                              {title}
                            </h3>
                          </div>
                        </div>

                        <div
                          className="w-full rounded-xl p-[2.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-[9px] bg-white px-2 py-1 text-[9.5px] lg:text-[10.5px] font-extrabold uppercase tracking-wide text-center">
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white"
                              style={{ borderColor: getAppBorderView(index + 1) }}
                            >
                              <Icon className="h-3 w-3" style={{ color: pSym.iconColor }} />
                            </span>
                            <span className="text-center leading-tight" style={{ color: pSym.iconColor }}>
                              {badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 4 Equal-Height Rows With App-Design Coloured Symbols & Writing */}
                      <ul className="grid flex-1 grid-cols-1 grid-rows-4 gap-2">
                        {reasons.map((r, rIdx) => {
                          const sym = getSymbolView(index * 3 + rIdx);
                          const sprayBg = PILLAR_SPRAY_BGS[(index + rIdx) % PILLAR_SPRAY_BGS.length];
                          return (
                            <li
                              key={r}
                              className="flex h-full min-h-[54px] rounded-2xl p-[2.5px] shadow-2xs"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            >
                              <div
                                className="flex h-full w-full items-center gap-2 rounded-[13px] px-2.5 py-1.5 text-left text-[10.5px] lg:text-[11px] font-extrabold leading-snug"
                                style={{ background: sprayBg }}
                              >
                                <span
                                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                  style={{ borderColor: getAppBorderView(index * 3 + rIdx) }}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                                </span>
                                <span className="flex-1 text-[#5A00D6]">{r}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="mt-2.5 flex justify-center">
                      <div
                        className="w-full rounded-full p-[2.5px] shadow-sm"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <Link
                          to="/dashboard"
                          className="inline-flex min-h-[36px] w-full items-center justify-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-extrabold transition-all hover:bg-[#F5F0FF]"
                          style={{ color: pSym.iconColor }}
                        >
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white"
                            style={{ borderColor: getAppBorderView(index) }}
                          >
                            <ArrowRight className="h-3 w-3" style={{ color: pSym.iconColor }} />
                          </span>
                          <span style={{ color: pSym.iconColor }}>Explore in Dashboard</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}