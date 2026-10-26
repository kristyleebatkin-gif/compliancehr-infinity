import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users, Sparkles, Award, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleChipStrip from '@/components/landing/ModuleChipStrip';
import Reveal from '@/components/landing/Reveal';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { Image } from '@/components/ui/image';

const STATS = [
  { value: `${MODULE_DIRECTORY.length}`, label: 'connected modules', bg: 'linear-gradient(135deg, #0072FF 0%, #0A2B6D 100%)', text: '#ffffff' },
  { value: '2 min', label: 'express internal audits', bg: 'linear-gradient(135deg, #5A00D6 0%, #A100FF 100%)', text: '#ffffff' },
  { value: 'Live', label: 'compliance & expiry trackers', bg: 'linear-gradient(135deg, #FF2E9A 0%, #5A00D6 100%)', text: '#ffffff' },
  { value: '24/7', label: 'automated reminders & alerts', bg: 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)', text: '#0A2B6D' },
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
      title: 'People connected',
      color: '#0072FF',
      headerBg: 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 55%, #5A00D6 100%)',
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
      title: 'Operations connected',
      color: '#5A00D6',
      headerBg: 'linear-gradient(120deg, #0A2B6D 0%, #5A00D6 55%, #A100FF 100%)',
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
      title: 'Audit confidence',
      color: '#FF2E9A',
      headerBg: 'linear-gradient(120deg, #5A00D6 0%, #A100FF 50%, #FF2E9A 100%)',
      reasons: [
        'Two-minute internal audits with branded reports',
        'Evidence attached as you work, ready for your NDIS auditor',
        'Live trackers prove every document is compliant, every day',
        'Corrective actions raised and closed with full history',
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden border-b-4 border-[#0A2B6D] bg-gradient-to-b from-[#F5F0FF] via-white to-[#FFF0F8]">
      <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-5 sm:pb-10 sm:pt-7 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Larger ComplianceHR Infinity Logo with App-Coloured Border + Redesigned Software Banner */}
          <div className="mx-auto flex flex-col items-center gap-3.5">
            <div
              className="inline-flex items-center justify-center rounded-3xl border-4 border-[#0A2B6D] p-3 shadow-xl ring-4 ring-[#FF2E9A]/80"
              style={{
                background:
                  'linear-gradient(135deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
              }}
            >
              <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white px-5 py-3 shadow-inner">
                <Image
                  src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                  alt="ComplianceHR Infinity logo"
                  className="h-52 w-80 sm:h-64 sm:w-[28rem] md:h-72 md:w-[34rem] rounded-xl"
                  fittingType="fit"
                />
              </div>
            </div>

            {/* Upgraded Software ("Soft") Section — Sleek App-Coloured Executive Identity Card */}
            <div
              className="mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md ring-2 ring-[#5A00D6]/50"
            >
              <div
                className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D] px-4 py-1.5 text-white"
                style={{ background: 'var(--header-gradient)' }}
              >
                <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
                  <Award className="h-3.5 w-3.5 text-[#00C6FF]" />
                  Software: ComplianceHR Infinity
                </span>
                <span className="rounded-full border border-white/50 bg-[#FF2E9A] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                  Official NDIS &amp; Workforce Platform
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 bg-gradient-to-r from-[#F5F0FF] via-white to-[#FFF0F8] px-4 py-2">
                <div className="text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
                  Complete Control. <span className="text-[#5A00D6]">Greater Confidence.</span>{' '}
                  <span className="text-[#FF2E9A]">Brighter Success.</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-extrabold text-[#0A2B6D]">
                  <span className="rounded-lg border border-[#0A2B6D] bg-[#0072FF] px-2.5 py-0.5 text-white">
                    Developer: Kristy Lee Whelan
                  </span>
                  <a
                    href="mailto:kristyleebatkin@live.com.au"
                    className="inline-flex items-center gap-1 rounded-lg border border-[#0A2B6D] bg-[#5A00D6] px-2.5 py-0.5 text-white hover:bg-[#FF2E9A]"
                  >
                    <Mail className="h-3 w-3 text-[#00C6FF]" />
                    kristyleebatkin@live.com.au
                  </a>
                </div>
              </div>
            </div>
          </div>

          <h1 className="mt-5 font-editorial text-3xl font-bold leading-tight tracking-tight text-[#0A2B6D] sm:text-4xl md:text-5xl">
            Compliance management,{' '}
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              simplified end to end.
            </span>
          </h1>

          <p className="mx-auto mt-2.5 max-w-3xl text-sm sm:text-base font-semibold leading-relaxed text-[#0A2B6D]/90">
            ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation.
          </p>

          {/* Primary Action Buttons — App Border around Open App Dashboard + Bright Pink Quick Start Guide */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/dashboard"
              className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#A100FF] px-6 py-2.5 text-sm font-extrabold text-white shadow-lg ring-2 ring-[#00C6FF] transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Open App Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {!authed && (
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-[#00C6FF] px-5 py-2.5 text-sm font-extrabold text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white"
              >
                Start 14-day free trial
              </Link>
            )}
            <a
              href="#quick-start"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-6 py-2.5 text-sm font-extrabold text-white shadow-lg ring-2 ring-[#FF6EDB] transition-all hover:-translate-y-0.5 hover:bg-[#A100FF]"
            >
              <Sparkles className="h-4 w-4 text-white" />
              View the quick start guide
            </a>
          </div>
          <p className="mt-2 text-xs font-extrabold tracking-wide text-[#5A00D6]">
            No credit card required · 14-day free trial · Set up in minutes
          </p>

          {/* 46 Actual App Modules — 6 Per Line in Full Mixed App Colours */}
          <ModuleChipStrip />

          {/* 4 Small Full-Colour Stat Tiles */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.05}
                className="rounded-2xl border-2 border-[#0A2B6D] px-3 py-3 text-center shadow-md"
                style={{ background: stat.bg, color: stat.text }}
              >
                <div
                  className="font-editorial text-2xl font-extrabold"
                  style={{ color: stat.text }}
                >
                  {stat.value}
                </div>
                <div
                  className="mt-0.5 text-[11px] font-extrabold uppercase tracking-wider"
                  style={{ color: stat.text }}
                >
                  {stat.label}
                </div>
              </Reveal>
            ))}
          </div>

          {/* 3 Upgraded Pillar Tiles Under the 4 Small Tiles */}
          <div className="mt-5 grid gap-4 text-left sm:grid-cols-3">
            {highlights.map(({ icon: Icon, badge, title, color, headerBg, reasons }, index) => (
              <Reveal
                key={title}
                delay={index * 0.07}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div
                    className="flex items-center gap-2.5 border-b-2 border-[#0A2B6D] px-4 py-3 text-white"
                    style={{ background: headerBg }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-2 border-white text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                        {badge}
                      </div>
                      <div className="font-editorial text-lg font-extrabold text-white leading-tight">
                        {title}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-1.5 p-3.5">
                    {reasons.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-2 rounded-xl border border-[#C084FC]/60 bg-[#F5F0FF]/80 px-2.5 py-1.5 text-xs font-bold leading-snug text-[#0A2B6D]"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color }}
                        />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#C084FC]/50 bg-white px-4 py-2 text-right">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 text-xs font-extrabold"
                    style={{ color }}
                  >
                    Explore in Dashboard <ArrowRight className="h-3.5 w-3.5" />
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