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
    <section className="relative overflow-hidden border-b border-border/70">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[30rem] w-[72rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-400/60 via-fuchsia-300/55 to-cyan-300/60 blur-3xl dark:from-violet-800/30 dark:via-fuchsia-900/20 dark:to-cyan-800/25" />
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-amber-300/45 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-300/55 blur-3xl dark:bg-cyan-500/10" />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none font-editorial text-[22vw] font-bold leading-none text-slate-900/[0.03] dark:text-white/[0.02]">HR</div>

      <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-14 sm:pb-24 sm:pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <Image src="https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png" alt="ComplianceHR Infinity logo" className="mx-auto h-56 w-72 sm:h-96 sm:w-[36rem]" fittingType="fit" />

          <div className="mx-auto mt-5 max-w-xl rounded-2xl border-2 border-violet-300 bg-white/95 p-3.5 text-center shadow-md space-y-1">
            <div className="text-sm sm:text-base font-extrabold text-blue-950">Software: ComplianceHR Infinity</div>
            <div className="text-xs sm:text-sm font-extrabold text-violet-800">Complete Control. Greater Confidence.</div>
            <div className="text-xs sm:text-sm font-extrabold text-pink-700">Brighter Success</div>
            <div className="pt-1.5 border-t border-violet-200 text-xs font-extrabold text-blue-950">Developer: Kristy Lee Whelan</div>
            <div className="text-xs font-extrabold text-violet-800">Email: kristyleebatkin@live.com.au</div>
          </div>

          <h1 className="mt-6 font-editorial text-[2.6rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-[4.4rem]">
            Compliance management,
            <span className="mt-1 block font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">simplified end to end.</span>
          </h1>

          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] sm:text-[13px]">
            <span className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text text-transparent">Complete Control. Greater Confidence. Brighter Success.</span>
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-foreground/60 md:text-xl">
            ComplianceHR empowers your team to reach the highest standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, plus rostering, shift notes, invoicing, HR and team communications, while documenting every action and conversation. It saves you time, money and effort, and keeps you NDIS audit prepared, every single day.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={authed ? '/dashboard' : '/register'} className="group inline-flex items-center gap-2.5 rounded-full gradient-brand px-7 py-3.5 text-base font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl">
              {authed ? 'Go to Dashboard' : 'Start 14-day free trial'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#quick-start" className="inline-flex items-center gap-2 rounded-full border-2 border-violet-300 bg-white px-6 py-3 text-sm font-bold text-violet-900 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-violet-50">View the quick start guide</a>
          </div>
          <p className="mt-5 text-[13px] font-medium tracking-wide text-foreground/45">No credit card required · 14-day free trial · Set up in minutes</p>

          <ModuleChipStrip />

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STATS.map((stat, index) => (
              <Reveal key={stat.label} delay={index * 0.06} className="rounded-2xl border border-slate-200/80 bg-white/75 px-4 py-3.5 text-center shadow-sm backdrop-blur dark:border-white/10 dark:bg-card/70">
                <div className="bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-500 bg-clip-text font-editorial text-2xl font-semibold text-transparent">{stat.value}</div>
                <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/50">{stat.label}</div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, reasons }, index) => (
              <Reveal key={title} delay={index * 0.08} className="group rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-lg shadow-slate-900/5 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-card/70">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-200 to-cyan-200 text-violet-800 shadow-sm transition-transform group-hover:scale-105 dark:from-violet-500/20 dark:to-cyan-500/20 dark:text-violet-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-editorial text-lg font-semibold text-foreground">{title}</div>
                <ul className="mt-2 space-y-1.5">
                  {reasons.map((r) => (
                    <li key={r} className="flex items-start gap-1.5 text-[13px] leading-snug text-foreground/60">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500 dark:text-violet-400" />
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