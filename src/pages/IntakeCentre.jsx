import React from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/PageHeader';
import { Heart, Users, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

const OPTIONS = [
  {
    title: 'Participant Intake',
    desc: 'Complete participant details, collect required forms, review readiness and create an approved participant profile.',
    to: '/intake/participant',
    icon: Heart,
    color: '#be185d',
    gradient: 'from-pink-100 via-rose-50 to-orange-50',
    border: 'border-pink-200',
    badge: 'Participant onboarding',
  },
  {
    title: 'Employee Intake',
    desc: 'Manage applicants, collect onboarding evidence, complete approvals and create an employee profile.',
    to: '/intake/employee',
    icon: Users,
    color: '#6d28d9',
    gradient: 'from-violet-100 via-purple-50 to-blue-50',
    border: 'border-violet-200',
    badge: 'Workforce onboarding',
  },
];

export default function IntakeCentre() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-8">
      <PageHeader title="Intake Centre" subtitle="Choose an intake stream to open cases, collect evidence, review readiness and create approved profiles." />

      <div className="relative overflow-hidden rounded-3xl border border-cyan-200 bg-gradient-to-r from-violet-100 via-white to-cyan-100 p-6 shadow-lg shadow-violet-500/5 dark:border-cyan-900 dark:from-violet-950/30 dark:via-card dark:to-cyan-950/25">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-400/15 blur-2xl" />
        <div className="relative flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-lg font-bold"><Sparkles className="h-4 w-4 text-fuchsia-600" />Secure, guided onboarding</div>
            <p className="mt-1 text-sm leading-6 text-foreground/60">Select the appropriate intake pathway below. Each stream keeps identity details, evidence, forms and approval steps together.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          return (
            <Link
              key={o.to}
              to={o.to}
              className={`group relative flex min-h-80 flex-col overflow-hidden rounded-3xl border bg-gradient-to-br ${o.gradient} ${o.border} p-7 shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl dark:border-white/10 dark:from-card dark:via-card dark:to-card`}
            >
              <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: o.color }} />
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-10 transition-transform group-hover:scale-125" style={{ backgroundColor: o.color }} />
              <div className="relative mb-5 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${o.color}, ${o.color}bb)` }}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-bold shadow-sm dark:bg-white/10" style={{ color: o.color }}>{o.badge}</span>
              </div>
              <div className="relative font-display text-2xl font-extrabold">{o.title}</div>
              <div className="relative mt-3 flex-1 text-sm leading-6 text-foreground/65">{o.desc}</div>
              <span className="relative mt-6 inline-flex items-center justify-center gap-2 self-start rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition-all group-hover:gap-3" style={{ backgroundColor: o.color }}>
                Open {o.title} <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}