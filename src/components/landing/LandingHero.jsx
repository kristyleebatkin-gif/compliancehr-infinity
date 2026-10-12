import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleChipStrip from '@/components/landing/ModuleChipStrip';

export default function LandingHero() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { base44.auth.isAuthenticated().then(setAuthed).catch(() => {}); }, []);

  const highlights = [
    { icon: Users, title: 'People connected', text: 'Staff, participants and volunteers' },
    { icon: BarChart3, title: 'Operations connected', text: 'Rosters, invoices, registers and alerts' },
    { icon: CheckCircle2, title: 'Audit confidence', text: 'Two-minute internal audits, evidence and reports ready' },
  ];

  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[30rem] w-[72rem] -translate-x-1/2 rounded-full bg-gradient-to-r from-violet-300/40 via-fuchsia-200/30 to-cyan-300/40 blur-3xl dark:from-violet-800/30 dark:via-fuchsia-900/20 dark:to-cyan-800/25" />
        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-amber-200/25 blur-3xl dark:bg-amber-500/10" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/10" />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 select-none font-editorial text-[22vw] font-bold leading-none text-slate-900/[0.03] dark:text-white/[0.02]">HR</div>

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-20 md:px-8 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-600 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
            NDIS provider operations and compliance platform
          </div>

          <h1 className="mt-8 font-editorial text-[2.6rem] font-medium leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-[4.4rem]">
            Compliance management,
            <span className="mt-1 block font-editorial-italic bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">simplified end to end.</span>
          </h1>

          <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.16em] sm:text-[13px]">
            <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-orange-500 bg-clip-text text-transparent">The Smartest, Simplest, Easiest and Effortless Business Super Platform</span>
          </p>

          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-foreground/60 md:text-xl">
            ComplianceHR empowers you to achieve an impossible quality and impossible standard of well-organised documentation, full audit compliance, incident management, continuous improvement and extensive risk management, while documenting every action and conversation. It saves you time, money and effort, and keeps you NDIS audit prepared, every single day.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={authed ? '/dashboard' : '/register'} className="group inline-flex items-center gap-2.5 rounded-full bg-slate-950 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl dark:bg-white dark:text-slate-950">
              {authed ? 'Go to Dashboard' : 'Get started free'}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            {authed ? (
              <a href="#quick-start" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-7 py-3.5 text-base font-semibold text-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-slate-400 dark:border-white/15 dark:bg-white/5">View quick start guide</a>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white/80 px-7 py-3.5 text-base font-semibold text-foreground shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:border-slate-400 dark:border-white/15 dark:bg-white/5">Sign in</Link>
            )}
          </div>
          <p className="mt-5 text-[13px] font-medium tracking-wide text-foreground/45">No credit card required · 14-day free trial · Set up in minutes</p>

          <ModuleChipStrip />

          <div className="mt-14 grid gap-4 text-left sm:grid-cols-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <div key={title} className="group rounded-2xl border border-slate-200/80 bg-white/75 p-5 shadow-lg shadow-slate-900/5 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-card/70">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-cyan-100 text-violet-700 shadow-sm transition-transform group-hover:scale-105 dark:from-violet-500/20 dark:to-cyan-500/20 dark:text-violet-300">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-4 font-editorial text-lg font-semibold text-foreground">{title}</div>
                <div className="mt-1 text-sm text-foreground/55">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}