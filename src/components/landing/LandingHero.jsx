import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users, Sparkles, Award, Mail, Compass, UserCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleChipStrip from '@/components/landing/ModuleChipStrip';
import Reveal from '@/components/landing/Reveal';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

const STATS = [
  { value: `${MODULE_DIRECTORY.length}`, label: 'Connected Modules', color: '#0072FF' },
  { value: '2 min', label: 'Express Internal Audits', color: '#5A00D6' },
  { value: 'Live', label: 'Compliance & Expiry Trackers', color: '#FF2E9A' },
  { value: '24/7', label: 'Automated Reminders & Alerts', color: '#A100FF' },
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
      color: '#0072FF',
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
      color: '#5A00D6',
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
      color: '#FF2E9A',
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
      {/* Hero Main Card — Exact Top Section Template (12px Gradient Frame + Crisp White Inner Canvas) */}
      <div
        className="rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-3 py-5 sm:px-6 sm:py-6 text-center space-y-5">
          {/* Software, Slogan & Developer Attribution Pills */}
          <div className="grid w-full grid-cols-1 gap-3 md:grid-cols-3 items-stretch">
            <div className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center shadow-sm">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                style={{ background: ICON_GRADIENT }}
              >
                <Award className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
                Software: <span className="text-[#0072FF]">ComplianceHR Infinity</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center shadow-sm">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                style={{ background: ICON_GRADIENT }}
              >
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
                <span className="text-[#0072FF]">Complete Control.</span>{' '}
                <span className="text-[#5A00D6]">Greater Confidence.</span>{' '}
                <span className="text-[#FF2E9A]">Brighter Success.</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center shadow-sm">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                style={{ background: ICON_GRADIENT }}
              >
                <Mail className="h-3.5 w-3.5 text-white" />
              </span>
              <div className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
                Developer: Kristy Lee Whelan ·{' '}
                <a
                  href="mailto:kristyleebatkin@live.com.au"
                  className="text-[#5A00D6] underline hover:text-[#FF2E9A]"
                >
                  kristyleebatkin@live.com.au
                </a>
              </div>
            </div>
          </div>

          {/* Centred Title & Slogan Matching Top Section Typography */}
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center text-center space-y-2.5">
            <h1 className="font-editorial text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight tracking-tight text-[#0A2B6D]">
              Compliance management,{' '}
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                simplified end to end.
              </span>
            </h1>

            <p className="mx-auto max-w-4xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed text-[#0A2B6D]">
              ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation.
            </p>
          </div>

          {/* Centred Badge + 3 Gradient Action Buttons Matching Top Section */}
          <div className="mx-auto flex w-full flex-col items-center justify-center gap-2.5 text-center">
            <span
              className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
              style={{ background: BADGE_GRADIENT }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#FF2E9A]" />
              </span>
              <span className="text-center">No credit card required · 14-day free trial · Set up in minutes</span>
            </span>

            <div className="mx-auto grid w-full max-w-2xl grid-cols-1 sm:grid-cols-3 items-center justify-center gap-2.5">
              <Link
                to="/dashboard"
                className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                  <Sparkles className="h-3.5 w-3.5 text-[#0072FF]" />
                </span>
                <span className="whitespace-nowrap text-center">Open App Dashboard</span>
              </Link>

              <Link
                to={authed ? '/dashboard' : '/register'}
                className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #5A00D6 0%, #0072FF 36%, #A100FF 70%, #FF6EDB 100%)',
                }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                  <UserCheck className="h-3.5 w-3.5 text-[#5A00D6]" />
                </span>
                <span className="whitespace-nowrap text-center">Start 14-Day Free Trial</span>
              </Link>

              <a
                href="#quick-start"
                className="mx-auto inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs sm:text-[13px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                style={{
                  background:
                    'linear-gradient(120deg, #0072FF 0%, #A100FF 48%, #FF2E9A 82%, #00C6FF 100%)',
                }}
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#A100FF]">
                  <Compass className="h-3.5 w-3.5 text-[#A100FF]" />
                </span>
                <span className="whitespace-nowrap text-center">Quick Start Guide</span>
              </a>
            </div>
          </div>

          {/* 4 Stat Pills on Crisp White with Circular App-Gradient Icons */}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.05}
                className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2.5 text-center shadow-sm"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white shadow-2xs"
                  style={{ background: ICON_GRADIENT }}
                >
                  <Sparkles className="h-4 w-4 text-white" />
                </span>
                <div className="text-left">
                  <div
                    className="font-editorial text-lg sm:text-xl font-extrabold leading-none"
                    style={{ color: stat.color }}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    {stat.label}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* 3 Pillar Cards Styled with Top Section Design */}
          <div className="grid w-full gap-4 text-left sm:grid-cols-3">
            {highlights.map(({ icon: Icon, badge, title, color, reasons }, index) => (
              <Reveal
                key={title}
                delay={index * 0.07}
                className="flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex flex-col items-center text-center space-y-1.5">
                    <span
                      className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
                      style={{ background: BADGE_GRADIENT }}
                    >
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                        <Icon className="h-3 w-3 text-[#5A00D6]" />
                      </span>
                      <span>{badge}</span>
                    </span>
                    <h3 className="font-editorial text-xl font-extrabold text-[#0A2B6D]">
                      {title}
                    </h3>
                  </div>

                  <ul className="space-y-2">
                    {reasons.map((r) => (
                      <li
                        key={r}
                        className="flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-xs font-extrabold leading-snug text-[#0A2B6D] shadow-2xs"
                      >
                        <span
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                          style={{ background: ICON_GRADIENT }}
                        >
                          <CheckCircle2 className="h-3 w-3 text-white" />
                        </span>
                        <span className="flex-1">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 flex justify-center">
                  <Link
                    to="/dashboard"
                    className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                    style={{
                      background:
                        'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                    }}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                      <ArrowRight className="h-3 w-3" style={{ color }} />
                    </span>
                    <span>Explore in Dashboard</span>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* 46 Actual App Modules — Top Section Template */}
      <ModuleChipStrip />
    </section>
  );
}