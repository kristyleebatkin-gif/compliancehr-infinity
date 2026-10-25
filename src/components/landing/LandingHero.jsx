import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleChipStrip from '@/components/landing/ModuleChipStrip';
import Reveal from '@/components/landing/Reveal';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { Image } from '@/components/ui/image';

const STATS = [
  { value: `${MODULE_DIRECTORY.length}`, label: 'connected modules' },
  { value: '2 min', label: 'express internal audits' },
  { value: 'Live', label: 'compliance & expiry trackers' },
  { value: '24/7', label: 'automated reminders & alerts' },
];

export default function LandingHero() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { base44.auth.isAuthenticated().then(setAuthed).catch(() => {}); }, []);

  const highlights = [
    {
      icon: Users,
      title: 'People connected',
      reasons: [
        'Staff, participants, volunteers and key personnel in one place',
        'Intake flows straight into live, kept-current profiles',
        'Consents, screening and certificates tracked automatically',
        'Teams, support workers and supervisors always visible',
      ],
    },
    {
      icon: BarChart3,
      title: 'Operations connected',
      reasons: [
        'Rosters, shift notes, invoices and payroll in one flow',
        'Registers, alerts and reminders run themselves',
        'Every action and conversation documented as it happens',
        'Quotes, receipts, assets and purchase orders reconciled',
      ],
    },
    {
      icon: CheckCircle2,
      title: 'Audit confidence',
      reasons: [
        'Two-minute internal audits with branded reports',
        'Evidence attached as you work, ready for your NDIS auditor',
        'Live trackers prove every document is compliant, every day',
        'Corrective actions raised and closed with full history',
      ],
    },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-white">
      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:pb-24 sm:pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Image src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png" alt="ComplianceHR Infinity logo" className="mx-auto h-56 w-72 sm:h-96 sm:w-[36rem]" fittingType="fit" />

          <div className="mx-auto mt-5 max-w-xl rounded-2xl border border-[#C084FC]/60 bg-white p-4 text-center shadow-sm space-y-1">
            <div className="text-sm sm:text-base font-extrabold text-[#0A2B6D]">Software: ComplianceHR Infinity</div>
            <div className="text-xs sm:text-sm font-extrabold text-[#5A00D6]">Complete Control. Greater Confidence.</div>
            <div className="text-xs sm:text-sm font-extrabold text-[#FF2E9A]">Brighter Success</div>
            <div className="pt-1.5 border-t border-[#C084FC]/40 text-xs font-extrabold text-[#0A2B6D]">Developer: Kristy Lee Whelan</div>
            <div className="text-xs font-extrabold text-[#5A00D6]">Email: kristyleebatkin@live.com.au</div>
          </div>

          <h1 className="mt-6 font-editorial text-[2.25rem] font-medium leading-[1.08] tracking-tight text-[#0A2B6D] sm:text-5xl md:text-6xl">
            Compliance management,
            <span className="mt-1 block font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">simplified end to end.</span>
          </h1>

          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] sm:text-[13px]">
            <span className="bg-gradient-to-r from-[#0072FF] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">Complete Control. Greater Confidence. Brighter Success.</span>
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[#0A2B6D]/80 md:text-xl">
            ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation. It saves you time, money and effort, and keeps you NDIS audit prepared, every single day.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={authed ? '/dashboard' : '/register'} className="group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#A100FF] px-7 py-3.5 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl">
              {authed ? 'Go to Dashboard' : 'Start 14-day free trial'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#quick-start" className="inline-flex items-center gap-2 rounded-full border border-[#5A00D6]/50 bg-white px-6 py-3 text-sm font-bold text-[#0A2B6D] shadow-sm transition-all hover:-translate-y-0.5 hover:bg-[#F5F0FF]">View the quick start guide</a>
          </div>
          <p className="mt-5 text-[13px] font-medium tracking-wide text-[#0A2B6D]/65">No credit card required · 14-day free trial · Set up in minutes</p>

          <ModuleChipStrip />

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.06} className="rounded-2xl border border-[#C084FC]/50 bg-white px-4 py-3.5 text-center shadow-sm">
                <div className="bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text font-editorial text-2xl font-semibold text-transparent">{stat.value}</div>
                <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#0A2B6D]/70">{stat.label}</div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-3">
            {highlights.map(({ icon: Icon, title, reasons }, index) => (
              <Reveal key={title} delay={index * 0.08} className="group rounded-2xl border border-[#C084FC]/50 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0072FF] to-[#5A00D6] text-white shadow-sm transition-transform group-hover:scale-105">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-editorial text-lg font-semibold text-[#0A2B6D]">{title}</div>
                <ul className="mt-2 space-y-1.5">
                  {reasons.map((r) => (
                    <li key={r} className="flex items-start gap-1.5 text-[13px] leading-snug text-[#0A2B6D]/80">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FF2E9A]" />
                      {r}
                    </li>
                  ))}
                </ul>
                </Reveal>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}