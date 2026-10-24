import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, LayoutDashboard, ShieldCheck, Workflow } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const STEPS = [
  {
    icon: ShieldCheck,
    title: 'Register and get approved',
    text: 'Request the right role. New accounts remain Pending Approval until a Provider Administrator confirms access.',
  },
  {
    icon: LayoutDashboard,
    title: 'Open your dashboard',
    text: 'Your dashboard shows the modules and information available for your role.',
  },
  {
    icon: Workflow,
    title: 'Follow the connected workflow',
    text: 'Use Intake, profiles and rostering for service delivery, or open the relevant safety, HR, finance or governance module.',
  },
  {
    icon: Bell,
    title: 'Stay up to date',
    text: 'Live compliance trackers show what is in date across every module, alerts surface anything due, and the User Guides library holds current instructions.',
  },
];
const ACCENTS = [
  { chip: 'from-[#0072FF] to-[#0A2B6D] text-white', rule: 'from-[#0072FF] to-[#0A2B6D]', ghost: 'text-[#C084FC]/25' },
  { chip: 'from-[#0A2B6D] to-[#5A00D6] text-white', rule: 'from-[#0A2B6D] to-[#5A00D6]', ghost: 'text-[#C084FC]/25' },
  { chip: 'from-[#5A00D6] to-[#A100FF] text-white', rule: 'from-[#5A00D6] to-[#A100FF]', ghost: 'text-[#C084FC]/25' },
  { chip: 'from-[#A100FF] to-[#FF2E9A] text-white', rule: 'from-[#A100FF] to-[#FF2E9A]', ghost: 'text-[#FF6EDB]/25' },
];

export default function QuickStartSection() {
  return (
    <section id="quick-start" className="relative scroll-mt-16 overflow-hidden border-y border-border/70 bg-gradient-to-b from-white via-violet-100/80 to-white dark:from-background dark:via-violet-950/20 dark:to-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-violet-400/45 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-cyan-400/45 blur-3xl dark:bg-cyan-500/10" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="inline-flex rounded-full border border-violet-200 bg-white/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700 shadow-sm dark:border-violet-500/30 dark:bg-white/5 dark:text-violet-300">Quick start guide</div>
          <h2 className="mt-5 font-editorial text-3xl font-medium tracking-tight text-foreground md:text-[2.6rem] md:leading-tight">
            Start using <span className="font-editorial-italic bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">ComplianceHR</span> in four steps
          </h2>
          <p className="mt-4 text-lg text-foreground/60">Sign in, open your role-based dashboard and choose the task you need to complete.</p>
        </div>

        <ol className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} as="li" delay={index * 0.07} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-card/75">
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ACCENTS[index].rule}`} />
                <span className={`pointer-events-none absolute -right-2 -top-3 select-none font-editorial text-7xl font-bold ${ACCENTS[index].ghost}`}>{String(index + 1).padStart(2, '0')}</span>
                <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[index].chip} shadow-sm transition-transform group-hover:scale-105`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="relative mt-5 font-editorial text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-foreground/60">{step.text}</p>
              </Reveal>
            );
          })}
        </ol>

        <div className="mt-10 text-center">
          <Link to="/login" className="group inline-flex items-center gap-2 rounded-full gradient-brand px-7 py-3 text-sm font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 hover:shadow-2xl">
            Sign in to ComplianceHR
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}