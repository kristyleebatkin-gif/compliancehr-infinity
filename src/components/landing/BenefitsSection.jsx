import React from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, ClipboardCheck, RefreshCw, Lock } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const BENEFITS = [
  { icon: ShieldCheck, title: 'Stay Compliant', desc: 'Live compliance trackers show every document in every area is fully compliant, every day.', color: '#0072FF' },
  { icon: ShieldAlert, title: 'Reduce Risk', desc: 'Identify, assess, and manage risks before they become incidents.', color: '#0A2B6D' },
  { icon: TrendingUp, title: 'Improve Quality', desc: 'Deliver safe, consistent, and high-quality supports across every shift.', color: '#5A00D6' },
  { icon: ClipboardCheck, title: 'Audit Ready in Minutes', desc: 'Express internal audits with evidence and corrective actions captured automatically.', color: '#A100FF' },
  { icon: RefreshCw, title: 'Continuous Improvement', desc: 'Use live data and feedback to drive better participant and workforce outcomes.', color: '#FF2E9A' },
  { icon: Lock, title: 'Secure & Role-Based', desc: 'Granular access keeps sensitive participant and staff data protected and private.', color: '#00C6FF' },
];

export default function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="relative mx-auto max-w-6xl scroll-mt-16 overflow-hidden rounded-3xl border-2 border-[#0A2B6D] bg-gradient-to-br from-[#F5F0FF] via-white to-[#FFF0F8] px-4 py-8 sm:py-10 shadow-xl md:px-8"
      style={{ borderTopWidth: '4px', borderTopColor: '#A100FF' }}
    >
      <div
        className="mx-auto rounded-2xl border-2 border-[#0A2B6D] px-4 py-3.5 text-center text-white shadow-md"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="inline-flex rounded-full border border-white/40 bg-white/20 px-3.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
          Built for better services
        </div>
        <h2 className="mt-2 font-editorial text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
          Why providers choose ComplianceHR
        </h2>
        <p className="mx-auto mt-1 max-w-3xl text-xs sm:text-sm font-semibold text-white/95">
          The smartest, simplest, easiest and most effortless way to store, copy, use, audit, share, scan, send, sort, file and report on every document, conversation and outcome, while saving you time, money and effort.
        </p>
      </div>

      {/* 6 Benefits — 6 on Each Line on Desktop with Full-Colour Icons & App Borders */}
      <div className="relative mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {BENEFITS.map((b, index) => (
          <Reveal
            key={b.title}
            delay={(index % 6) * 0.05}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            style={{
              borderTopWidth: '4px',
              borderTopColor: b.color,
              background: `linear-gradient(155deg, ${b.color}16 0%, #ffffff 82%)`,
            }}
          >
            <div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#0A2B6D] text-white shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: b.color }}
              >
                <b.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="mt-3 font-editorial text-sm font-extrabold text-[#0A2B6D]">
                {b.title}
              </h3>
              <p className="mt-1 text-[11px] font-semibold leading-snug text-[#0A2B6D]/85">
                {b.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}