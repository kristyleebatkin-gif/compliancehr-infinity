import React from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, ClipboardCheck, RefreshCw, Lock } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const BENEFITS = [
  { icon: ShieldCheck, title: 'Stay Compliant', desc: 'Live compliance trackers show every document in every area is fully compliant, every day.' },
  { icon: ShieldAlert, title: 'Reduce Risk', desc: 'Identify, assess, and manage risks before they become incidents.' },
  { icon: TrendingUp, title: 'Improve Quality', desc: 'Deliver safe, consistent, and high-quality supports.' },
  { icon: ClipboardCheck, title: 'Audit Ready in Minutes', desc: 'Express internal audits with evidence and corrective actions captured automatically.' },
  { icon: RefreshCw, title: 'Continuous Improvement', desc: 'Use data and feedback to drive better participant outcomes.' },
  { icon: Lock, title: 'Secure & Role-Based', desc: 'Granular access keeps sensitive data protected and private.' },
];
const HAIRLINES = [
  'from-[#0072FF] to-[#0A2B6D]',
  'from-[#0A2B6D] to-[#5A00D6]',
  'from-[#5A00D6] to-[#A100FF]',
  'from-[#A100FF] to-[#FF2E9A]',
  'from-[#FF2E9A] to-[#FF6EDB]',
  'from-[#5A00D6] to-[#0072FF]',
];
const CHIP_STYLES = [
  'from-[#0072FF] to-[#0A2B6D] text-white',
  'from-[#0A2B6D] to-[#5A00D6] text-white',
  'from-[#5A00D6] to-[#A100FF] text-white',
  'from-[#A100FF] to-[#FF2E9A] text-white',
  'from-[#FF2E9A] to-[#FF6EDB] text-white',
  'from-[#5A00D6] to-[#0072FF] text-white',
];

export default function BenefitsSection() {
  return (
    <section id="benefits" className="relative scroll-mt-16 overflow-hidden border-y border-border/70">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-fuchsia-300/50 blur-3xl dark:bg-fuchsia-500/10" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-cyan-300/50 blur-3xl dark:bg-cyan-500/10" />
      </div>
      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:py-20 md:px-8">
        <div className="relative mx-auto max-w-2xl text-center">
          <div className="inline-flex rounded-full border border-violet-200 bg-violet-50/80 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-700 dark:border-violet-500/30 dark:bg-violet-500/10 dark:text-violet-300">Built for better services</div>
          <h2 className="mt-5 font-editorial text-3xl font-medium tracking-tight text-foreground md:text-[2.6rem] md:leading-tight">
            Why providers choose <span className="font-editorial-italic bg-gradient-to-r from-violet-700 via-fuchsia-600 to-cyan-600 bg-clip-text text-transparent">ComplianceHR</span>
          </h2>
          <p className="mt-4 text-lg font-medium text-foreground/65">The smartest, simplest, easiest and most effortless way to store, copy, use, audit, share, scan, send, sort, file and report on every document, conversation and outcome, while saving you time, money and effort.</p>
        </div>
        <div className="relative mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, index) => (
            <Reveal key={b.title} delay={(index % 3) * 0.07} className="group relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
              <span className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${HAIRLINES[index]}`} />
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${CHIP_STYLES[index]} shadow-sm transition-transform group-hover:scale-105`}>
                <b.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-editorial text-lg font-bold text-[#0A2B6D]">{b.title}</h3>
              <p className="mt-1.5 text-xs font-medium leading-relaxed text-[#0A2B6D]/80">{b.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}