import React from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, ClipboardCheck, RefreshCw, Lock } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

const BENEFITS = [
  { icon: ShieldCheck, title: 'Stay Compliant', desc: 'Live compliance trackers show every document in every area is fully compliant, every day.' },
  { icon: ShieldAlert, title: 'Reduce Risk', desc: 'Identify, assess, and manage risks before they become incidents.' },
  { icon: TrendingUp, title: 'Improve Quality', desc: 'Deliver safe, consistent, and high-quality supports across every shift.' },
  { icon: ClipboardCheck, title: 'Audit Ready in Minutes', desc: 'Express internal audits with evidence and corrective actions captured automatically.' },
  { icon: RefreshCw, title: 'Continuous Improvement', desc: 'Use live data and feedback to drive better participant and workforce outcomes.' },
  { icon: Lock, title: 'Secure & Role-Based', desc: 'Granular access keeps sensitive participant and staff data protected and private.' },
];

export default function BenefitsSection() {
  return (
    <section
      id="benefits"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-5">
        <span
          className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#A100FF]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#A100FF]" />
          </span>
          <span className="text-center">Built For Better Services · Why Providers Choose Us</span>
        </span>

        <div className="mx-auto max-w-3xl space-y-1.5">
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A2B6D]">
            Why providers choose{' '}
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              ComplianceHR Infinity
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-[#5A00D6]">
            The smartest, simplest, easiest and most effortless way to store, copy, use, audit, share, scan, send, sort, file and report on every document, conversation and outcome, while saving you time, money and effort.
          </p>
        </div>

        {/* 6 Benefits — 6 on Each Line on Desktop with Circular App-Gradient Icons & White Cards */}
        <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-left">
          {BENEFITS.map((b, index) => (
            <Reveal
              key={b.title}
              delay={(index % 6) * 0.05}
              className="group flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div>
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0A2B6D] text-white shadow-sm transition-transform group-hover:scale-105"
                  style={{ background: ICON_GRADIENT }}
                >
                  <b.icon className="h-5 w-5 text-white" />
                </span>
                <h3 className="mt-3 font-editorial text-sm font-extrabold text-[#0A2B6D]">
                  {b.title}
                </h3>
                <p className="mt-1 text-xs font-bold leading-snug text-[#0A2B6D]">
                  {b.desc}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}