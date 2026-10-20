import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function DashboardWelcome({ firstName, heading }) {
  return <section className="relative isolate overflow-hidden rounded-2xl border border-primary/20 gradient-brand p-4 shadow-panel sm:p-5" aria-label="Workspace welcome">
    <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full border-[32px] border-primary-foreground/10" />
    <div className="pointer-events-none absolute -bottom-20 right-28 h-40 w-40 rounded-full bg-primary-foreground/10" />
    <div className="relative flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-primary-foreground/80"><Sparkles className="h-3.5 w-3.5" />ComplianceHR Infinity</p>
        <h1 className="font-display text-2xl font-bold tracking-tight text-primary-foreground sm:text-3xl">{firstName ? `Welcome, ${firstName}` : heading.title}</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-primary-foreground/90">{heading.sub}</p>
      </div>
      <span className="relative inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground"><ShieldCheck className="h-3.5 w-3.5 shrink-0" />{heading.title}</span>
    </div>
  </section>;
}