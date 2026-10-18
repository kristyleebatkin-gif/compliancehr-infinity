import React from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, ClipboardCheck, RefreshCw, Lock } from 'lucide-react';

const BENEFITS = [
  { icon: ShieldCheck, title: 'Stay Compliant', desc: 'Live compliance trackers show every document in every area is fully compliant, every day.' },
  { icon: ShieldAlert, title: 'Reduce Risk', desc: 'Identify, assess, and manage risks before they become incidents.' },
  { icon: TrendingUp, title: 'Improve Quality', desc: 'Deliver safe, consistent, and high-quality supports.' },
  { icon: ClipboardCheck, title: 'Audit Ready in Minutes', desc: 'Express internal audits with evidence and corrective actions captured automatically.' },
  { icon: RefreshCw, title: 'Continuous Improvement', desc: 'Use data and feedback to drive better participant outcomes.' },
  { icon: Lock, title: 'Secure & Role-Based', desc: 'Granular access keeps sensitive data protected and private.' },
];
const HAIRLINES = [
  'from-violet-500 to-fuchsia-400',
  'from-rose-500 to-orange-400',
  'from-blue-500 to-cyan-400',
  'from-emerald-500 to-teal-400',
  'from-amber-500 to-orange-400',
  'from-fuchsia-500 to-violet-400',
];
const CHIP_STYLES = [
  'from-violet-100 to-fuchsia-100 text-violet-700 dark:from-violet-500/20 dark:to-fuchsia-500/20 dark:text-violet-300',
  'from-rose-100 to-orange-100 text-rose-700 dark:from-rose-500/20 dark:to-orange-500/20 dark:text-rose-300',
  'from-blue-100 to-cyan-100 text-blue-700 dark:from-blue-500/20 dark:to-cyan-500/20 dark:text-blue-300',
  'from-emerald-100 to-teal-100 text-emerald-700 dark:from-emerald-500/20 dark:to-teal-500/20 dark:text-emerald-300',
  'from-amber-100 to-orange-100 text-amber-700 dark:from-amber-500/20 dark:to-orange-500/20 dark:text-amber-300',
  'from-violet-100 to-fuchsia-100 text-violet-700 dark:from-violet-500/20 dark:to-fuchsia-500/20 dark:text-violet-300',
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="relative scroll-mt-16 overflow-hidden border-y border-border/70 bg-background">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-fuchsia-200/30 blur-3xl dark:bg-fuchsia-500/10" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-200/30 blur-3xl dark:bg-cyan-500/10" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-20 md:px-8">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="inline-flex rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">Built for better services</div>
          <h2 className="mt-5 font-editorial text-3xl font-medium tracking-tight text-foreground md:text-[2.6rem] md:leading-tight">
            Why providers choose <span className="font-editorial-italic bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">ComplianceHR</span>
          </h2>
          <p className="mt-4 text-lg font-medium text-foreground/65">The smartest, simplest, easiest and most effortless way to store, copy, use, audit, share, scan, send, sort, file and report on every document, conversation and outcome, while saving you time, money and effort.</p>
        </div>
        <div className="relative mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, index) => (
            <div key={b.title} className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-card/70">
              <span className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${HAIRLINES[index]}`} />
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${CHIP_STYLES[index]} shadow-sm transition-transform group-hover:scale-105`}>
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-editorial text-lg font-semibold text-foreground">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/60">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}