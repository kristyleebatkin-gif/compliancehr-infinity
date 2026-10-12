import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bell, LayoutDashboard, ShieldCheck, Workflow } from 'lucide-react';

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
    text: 'Check alerts, expiries, appraisals and audit reminders, and open the Manual Library whenever you need current instructions.',
  },
];
const ACCENTS = [
  { chip: 'from-violet-100 to-fuchsia-100 text-violet-700 dark:from-violet-500/20 dark:to-fuchsia-500/20 dark:text-violet-300', rule: 'from-violet-500 to-fuchsia-400', ghost: 'text-violet-100 dark:text-violet-500/15' },
  { chip: 'from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-300', rule: 'from-blue-500 to-cyan-400', ghost: 'text-blue-100 dark:text-blue-500/15' },
  { chip: 'from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-500/20 dark:to-teal-500/20 dark:text-emerald-300', rule: 'from-emerald-500 to-teal-400', ghost: 'text-emerald-100 dark:text-emerald-500/15' },
  { chip: 'from-orange-100 to-rose-100 text-orange-700 dark:from-orange-500/20 dark:to-rose-500/20 dark:text-orange-300', rule: 'from-orange-500 to-rose-400', ghost: 'text-orange-100 dark:text-orange-500/15' },
];

export default function QuickStartSection() {
  return (
    <section id="quick-start" className="relative overflow-hidden border-y border-border/70 bg-gradient-to-b from-white via-violet-50/60 to-white dark:from-background dark:via-violet-950/20 dark:to-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-violet-300/25 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-cyan-300/25 blur-3xl dark:bg-cyan-500/10" />
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
              <li key={step.title} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-card/75">
                <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${ACCENTS[index].rule}`} />
                <span className={`pointer-events-none absolute -right-2 -top-3 select-none font-editorial text-7xl font-bold ${ACCENTS[index].ghost}`}>{String(index + 1).padStart(2, '0')}</span>
                <div className={`relative flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${ACCENTS[index].chip} shadow-sm transition-transform group-hover:scale-105`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="relative mt-5 font-editorial text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-foreground/60">{step.text}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 text-center">
          <Link to="/login" className="group inline-flex items-center gap-2 rounded-full bg-slate-950 px-7 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:shadow-2xl dark:bg-white dark:text-slate-950">
            Sign in to ComplianceHR
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}