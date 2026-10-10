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
const STEP_COLOURS = [
  { gradient: 'from-violet-600 to-fuchsia-500', border: 'border-violet-200', number: 'text-violet-200' },
  { gradient: 'from-blue-600 to-cyan-500', border: 'border-blue-200', number: 'text-blue-200' },
  { gradient: 'from-emerald-600 to-teal-500', border: 'border-emerald-200', number: 'text-emerald-200' },
  { gradient: 'from-orange-500 to-rose-500', border: 'border-orange-200', number: 'text-orange-200' },
];

export default function QuickStartSection() {
  return (
    <section id="quick-start" className="relative overflow-hidden border-y border-violet-200 bg-gradient-to-r from-violet-100 via-pink-50 to-cyan-100 dark:border-violet-900 dark:from-violet-950/35 dark:via-pink-950/15 dark:to-cyan-950/30">
      <div className="absolute -left-24 top-8 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-20">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="mx-auto inline-flex rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white shadow-md">Quick start guide</div>
          <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
            Start using <span className="bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">ComplianceHR</span> in four steps
          </h2>
          <p className="mt-4 text-base text-foreground/60">
            Sign in, open your role-based dashboard and choose the task you need to complete.
          </p>
        </div>

        <ol className="relative mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className={`relative overflow-hidden rounded-2xl border ${STEP_COLOURS[index].border} bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-white/10`}>
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${STEP_COLOURS[index].gradient}`} />
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${STEP_COLOURS[index].gradient} text-white shadow-md`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`font-display text-3xl font-bold ${STEP_COLOURS[index].number}`}>{index + 1}</span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground/60">{step.text}</p>
              </li>
            );
          })}
        </ol>

        <div className="mt-10 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-white shadow-md shadow-brand/15 transition-colors hover:bg-brand/90"
          >
            Sign in to ComplianceHR
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}