import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, CheckCircle2, ShieldCheck, Sparkles, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function LandingHero() {
  const [authed, setAuthed] = useState(false);
  useEffect(() => { base44.auth.isAuthenticated().then(setAuthed).catch(() => {}); }, []);

  return (
    <section className="relative overflow-hidden border-b border-violet-100 dark:border-violet-950">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-100 via-white to-cyan-100 dark:from-violet-950/40 dark:via-background dark:to-cyan-950/30" />
      <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />
      <div className="absolute left-[40%] top-8 h-72 w-72 rounded-full bg-amber-300/15 blur-3xl" />
      <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-xs font-semibold text-violet-700 shadow-sm backdrop-blur dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            NDIS provider operations and compliance platform
          </div>
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
            Compliance management,<br />
            <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">simplified end to end</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-foreground/60 md:text-xl">
            Connect intake, people, rostering, shift notes, HR, invoicing, safety, provider registration and audit evidence in one secure platform built for disability and community service providers.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to={authed ? '/dashboard' : '/register'} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-700 via-indigo-600 to-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl">
              {authed ? 'Go to Dashboard' : 'Get started free'}
              <ArrowRight className="h-4 w-4" />
            </Link>
            {authed ? <a href="#quick-start" className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white/80 px-6 py-3.5 text-base font-semibold text-cyan-800 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white">View quick start guide</a> : <Link to="/login" className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-white/80 px-6 py-3.5 text-base font-semibold text-cyan-800 shadow-sm backdrop-blur transition-all hover:-translate-y-0.5 hover:bg-white">Sign in</Link>}
          </div>
          <p className="mt-5 text-sm font-medium text-foreground/50">No credit card required • Set up in minutes</p>

          <div className="mt-12 grid gap-3 text-left sm:grid-cols-3">
            {[
              [Users, 'People connected', 'Staff, participants and volunteers', 'from-violet-600 to-fuchsia-500'],
              [BarChart3, 'Operations connected', 'Rosters, invoices, registers and alerts', 'from-blue-600 to-cyan-500'],
              [CheckCircle2, 'Audit confidence', 'Registration, evidence and reminders ready', 'from-emerald-600 to-teal-500'],
            ].map(([Icon, title, text, colour]) => (
              <div key={title} className="rounded-2xl border border-white/80 bg-white/75 p-4 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-card/70">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${colour} text-white`}><Icon className="h-4 w-4" /></div>
                <div className="text-sm font-bold text-foreground">{title}</div>
                <div className="mt-1 text-xs text-foreground/55">{text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Sparkles className="absolute bottom-10 right-[8%] h-8 w-8 text-amber-400/60" />
    </section>
  );
}