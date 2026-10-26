import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users, Sparkles, Award, Mail } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleChipStrip from '@/components/landing/ModuleChipStrip';
import Reveal from '@/components/landing/Reveal';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { Image } from '@/components/ui/image';

const STATS = [
  { value: `${MODULE_DIRECTORY.length}`, label: 'connected modules', color: '#0072FF' },
  { value: '2 min', label: 'express internal audits', color: '#5A00D6' },
  { value: 'Live', label: 'compliance & expiry trackers', color: '#FF2E9A' },
  { value: '24/7', label: 'automated reminders & alerts', color: '#A100FF' },
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
    <section className="relative overflow-hidden border-b-4 border-[#0A2B6D] bg-gradient-to-b from-[#E8DEFF] via-white to-[#FFF0F8]">
      {/* 0.5cm from side of page under Quick App Bar */}
      <div className="relative w-full px-[0.5cm] pb-8 pt-3">
        <div className="w-full text-center">
          {/* Full-Width Logo Filled Right to the Border Size (0.5cm from Side of Page) + Clean Centered Software Section */}
          <div
            className="w-full rounded-3xl border-4 border-[#0A2B6D] p-2.5 shadow-xl ring-2 ring-[#FF2E9A]"
            style={{
              background:
                'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
            }}
          >
            {/* Entire Logo Fitted Inside Square Border + Centered App Name */}
            <div className="mx-auto flex w-full flex-col sm:flex-row items-center justify-center gap-4 rounded-2xl border-2 border-[#0A2B6D] bg-white px-4 py-3 shadow-md">
              <div className="flex h-36 w-36 sm:h-44 sm:w-44 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-3 border-[#0A2B6D] bg-white p-0.5 shadow-sm">
                <Image
                  src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                  alt="ComplianceHR Infinity logo"
                  className="h-full w-full object-contain"
                  fittingType="fit"
                />
              </div>
              <div className="flex flex-col items-center justify-center bg-white px-2 text-center">
                <div className="font-editorial text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-wide text-[#0A2B6D] leading-tight whitespace-nowrap">
                  Compliance
                  <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    HR
                  </span>{' '}
                  <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                    Infinity
                  </span>
                </div>
                <span className="mt-1.5 inline-flex items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-5 py-1 text-xs font-extrabold uppercase tracking-widest text-white shadow-sm">
                  NDIS &amp; Aged Care Compliance
                </span>
              </div>
            </div>

            {/* Fixed, Balanced & Centered Software Section */}
            <div className="mt-2.5 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 shadow-md">
              <div className="grid grid-cols-1 gap-2.5 md:grid-cols-3 items-stretch">
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white px-4 py-2.5 text-center shadow-2xs" style={{ borderTopWidth: '4px', borderTopColor: '#0072FF' }}>
                  <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#0A2B6D] bg-[#0072FF] text-white">
                    <Award className="h-4 w-4 text-white" />
                  </span>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                    Official Software Platform
                  </div>
                  <div className="mt-0.5 text-sm font-extrabold text-[#0A2B6D]">
                    Software: ComplianceHR Infinity
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white px-4 py-2.5 text-center shadow-2xs" style={{ borderTopWidth: '4px', borderTopColor: '#FF2E9A' }}>
                  <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#0A2B6D] bg-[#FF2E9A] text-white">
                    <Sparkles className="h-4 w-4 text-white" />
                  </span>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF2E9A]">
                    Executive Mission &amp; Slogan
                  </div>
                  <div className="mt-0.5 text-sm font-extrabold text-[#0A2B6D]">
                    Complete Control. <span className="text-[#5A00D6]">Greater Confidence.</span>{' '}
                    <span className="text-[#FF2E9A]">Brighter Success.</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white px-4 py-2.5 text-center shadow-2xs" style={{ borderTopWidth: '4px', borderTopColor: '#5A00D6' }}>
                  <span className="mb-1 flex h-8 w-8 items-center justify-center rounded-full border border-[#0A2B6D] bg-[#5A00D6] text-white">
                    <Mail className="h-4 w-4 text-white" />
                  </span>
                  <div className="text-sm font-extrabold text-[#0A2B6D]">
                    Developer: Kristy Lee Whelan
                  </div>
                  <a
                    href="mailto:kristyleebatkin@live.com.au"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs font-extrabold text-[#5A00D6] underline hover:text-[#FF2E9A]"
                  >
                    kristyleebatkin@live.com.au
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Headline & Intro on Crisp White Panel */}
          <div className="mt-4 rounded-2xl border-2 border-[#0A2B6D] bg-white px-4 py-4 shadow-md">
            <h1 className="font-editorial text-3xl font-bold leading-tight tracking-tight text-[#0A2B6D] sm:text-4xl md:text-5xl">
              Compliance management,{' '}
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                simplified end to end.
              </span>
            </h1>

            <p className="mx-auto mt-2 max-w-4xl rounded-xl bg-white px-2 text-sm sm:text-base font-bold leading-relaxed text-[#0A2B6D]">
              ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-6 py-2.5 text-sm font-extrabold text-[#0A2B6D] shadow-lg ring-2 ring-[#0072FF] transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]"
              >
                Open App Dashboard
                <ArrowRight className="h-4 w-4 text-[#0072FF] transition-transform group-hover:translate-x-0.5" />
              </Link>
              {!authed && (
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-5 py-2.5 text-sm font-extrabold text-[#5A00D6] shadow-sm ring-2 ring-[#5A00D6] transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]"
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
            <p className="mt-2 text-xs font-extrabold tracking-wide text-[#0A2B6D]">
              No credit card required · 14-day free trial · Set up in minutes
            </p>
          </div>

          {/* 46 Actual App Modules — Exact Same Size Cards, 6 Per Line */}
          <ModuleChipStrip />

          {/* 4 Small Stat Tiles — White Background Behind Dark Blue Text */}
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.05}
                className="rounded-2xl border-2 border-[#0A2B6D] bg-white px-3 py-3 text-center shadow-md"
                style={{ borderTopWidth: '5px', borderTopColor: stat.color }}
              >
                <div
                  className="font-editorial text-2xl font-extrabold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="mt-0.5 rounded bg-white px-1 text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  {stat.label}
                </div>
              </Reveal>
            ))}
          </div>

          {/* 3 Upgraded Pillar Tiles Under the 4 Small Tiles — White Background Behind All Dark Blue Text */}
          <div className="mt-5 grid gap-4 text-left sm:grid-cols-3">
            {highlights.map(({ icon: Icon, badge, title, color, headerBg, reasons }, index) => (
              <Reveal
                key={title}
                delay={index * 0.07}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div>
                  <div
                    className="gradient-brand flex items-center gap-2.5 border-b-2 border-[#0A2B6D] px-4 py-3 text-white"
                    style={{ background: headerBg }}
                  >
                    <span
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white text-white shadow-sm"
                      style={{ backgroundColor: color }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </span>
                    <div>
                      <div className="text-[10px] font-extrabold uppercase tracking-wider text-white">
                        {badge}
                      </div>
                      <div className="font-editorial text-lg font-extrabold text-white leading-tight">
                        {title}
                      </div>
                    </div>
                  </div>

                  <ul className="space-y-1.5 bg-white p-3.5">
                    {reasons.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-2 rounded-xl border border-[#0A2B6D]/30 bg-white px-2.5 py-1.5 text-xs font-extrabold leading-snug text-[#0A2B6D] shadow-2xs"
                      >
                        <CheckCircle2
                          className="mt-0.5 h-4 w-4 shrink-0"
                          style={{ color }}
                        />
                        <span className="bg-white text-[#0A2B6D]">{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-[#0A2B6D]/20 bg-white px-4 py-2 text-right">
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1 rounded bg-white px-2 py-0.5 text-xs font-extrabold text-[#0A2B6D] hover:underline"
                  >
                    Explore in Dashboard <ArrowRight className="h-3.5 w-3.5" style={{ color }} />
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