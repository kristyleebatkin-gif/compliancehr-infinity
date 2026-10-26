import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleChipStrip from '@/components/landing/ModuleChipStrip';
import Reveal from '@/components/landing/Reveal';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { Image } from '@/components/ui/image';

const STATS = [
  { value: `${MODULE_DIRECTORY.length}`, label: 'connected modules', color: '#0072FF', bg: 'rgba(0,114,255,0.08)' },
  { value: '2 min', label: 'express internal audits', color: '#5A00D6', bg: 'rgba(90,0,214,0.08)' },
  { value: 'Live', label: 'compliance & expiry trackers', color: '#A100FF', bg: 'rgba(161,0,255,0.08)' },
  { value: '24/7', label: 'automated reminders & alerts', color: '#FF2E9A', bg: 'rgba(255,46,154,0.08)' },
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
    <section className="relative overflow-hidden border-b-2 border-[#0A2B6D] bg-white">
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-6 sm:pb-12 sm:pt-8 md:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* ComplianceHR Logo with App-Themed Colour Border + Minimised Software Name & Details Box */}
          <div className="mx-auto flex flex-col items-center gap-2.5">
            <div
              className="inline-flex items-center justify-center rounded-2xl border-4 border-[#0A2B6D] bg-white p-2 shadow-lg ring-2 ring-[#FF2E9A]"
              style={{
                background:
                  'linear-gradient(135deg, #ffffff 0%, #F5F0FF 65%, #FFF0F8 100%)',
              }}
            >
              <Image
                src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png"
                alt="ComplianceHR Infinity logo"
                className="h-36 w-52 sm:h-44 sm:w-72 rounded-xl"
                fittingType="fit"
              />
            </div>

            {/* Minimised Software Name & Developer Details with App-Coloured Border */}
            <div
              className="mx-auto inline-flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-xl border-2 border-[#0A2B6D] bg-gradient-to-r from-[#F5F0FF] via-white to-[#FFF0F8] px-3.5 py-1.5 text-center shadow-sm ring-1 ring-[#5A00D6]"
              style={{ borderTopWidth: '3px', borderTopColor: '#5A00D6' }}
            >
              <span className="text-xs font-extrabold text-[#0A2B6D]">
                Software: ComplianceHR Infinity
              </span>
              <span className="text-[#5A00D6]">·</span>
              <span className="text-[11px] font-extrabold text-[#5A00D6]">
                Complete Control. Greater Confidence. <span className="text-[#FF2E9A]">Brighter Success.</span>
              </span>
              <span className="text-[#5A00D6]">·</span>
              <span className="text-[11px] font-extrabold text-[#0A2B6D]">
                Developer: Kristy Lee Whelan (<span className="text-[#5A00D6]">kristyleebatkin@live.com.au</span>)
              </span>
            </div>
          </div>

          <h1 className="mt-5 font-editorial text-3xl font-bold leading-tight tracking-tight text-[#0A2B6D] sm:text-4xl md:text-5xl">
            Compliance management,{' '}
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              simplified end to end.
            </span>
          </h1>

          <p className="mx-auto mt-3 max-w-3xl text-sm sm:text-base font-semibold leading-relaxed text-[#0A2B6D]/90">
            ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation.
          </p>

          {/* Primary Action Buttons — App Border around Open App Dashboard + Bright Pink Quick Start Guide */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
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
                className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] bg-[#F5F0FF] px-5 py-2.5 text-sm font-extrabold text-[#5A00D6] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-white"
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
          <p className="mt-2.5 text-xs font-bold tracking-wide text-[#5A00D6]">
            No credit card required · 14-day free trial · Set up in minutes
          </p>

          {/* 46 Actual App Modules — 6 Per Line with Full-Colour Icons & App-Themed Border */}
          <ModuleChipStrip />

          {/* 4 Small Stat Tiles */}
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal
                key={stat.label}
                delay={index * 0.05}
                className="rounded-2xl border-2 border-[#0A2B6D] px-3 py-3 text-center shadow-sm"
                style={{
                  borderTopWidth: '4px',
                  borderTopColor: stat.color,
                  background: `linear-gradient(135deg, ${stat.bg} 0%, #ffffff 90%)`,
                }}
              >
                <div
                  className="font-editorial text-2xl font-extrabold"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </div>
                <div className="mt-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  {stat.label}
                </div>
              </Reveal>
            ))}
          </div>

          {/* 3 Upgraded Pillar Tiles Under the 4 Small Tiles */}
          <div className="mt-6 grid gap-4 text-left sm:grid-cols-3">
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

                  <ul className="space-y-2 p-4">
                    {reasons.map((r) => (
                      <li
                        key={r}
                        className="flex items-start gap-2 rounded-xl border border-[#C084FC]/50 bg-[#F5F0FF]/60 px-2.5 py-1.5 text-xs font-bold leading-snug text-[#0A2B6D]"
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