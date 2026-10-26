import React from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, ClipboardCheck, RefreshCw, Lock } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getTilePalette,
  getHeaderView,
  getSubheaderColourView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

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
          style={{ background: getHeaderView(3) }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
            <ShieldCheck className="h-3.5 w-3.5 text-white" />
          </span>
          <span className="text-center">Built For Better Services · Why Providers Choose Us</span>
        </span>

        <div className="mx-auto max-w-3xl space-y-1.5">
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
            <span className="text-[#0A2B6D]">Why providers choose </span>
            <span className="text-[#0A2B6D]">Compliance</span>
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              HR
            </span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
              Infinity
            </span>
          </h2>
          <p
            className="text-xs sm:text-sm md:text-base font-extrabold"
            style={{ color: getSubheaderColourView(1) }}
          >
            The smartest, simplest, easiest and most effortless way to store, copy, use, audit, share, scan, send, sort, file and report on every document, conversation and outcome, while saving you time, money and effort.
          </p>
        </div>

        {/* 6 Benefits in Mixed Full Colours + App-Coloured Symbols */}
        <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 text-left">
          {BENEFITS.map((b, index) => {
            const tile = getTilePalette(index + 2);
            const sym = getSymbolView(index + 2);
            return (
              <Reveal
                key={b.title}
                delay={(index % 6) * 0.05}
                className="group flex flex-col justify-between rounded-2xl border-2 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  backgroundColor: tile.bg,
                  color: tile.text,
                  borderColor: getAppBorderView(index + 2),
                }}
              >
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white shadow-sm transition-transform group-hover:scale-105">
                    <b.icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                  </span>
                  <h3 className="mt-3 font-editorial text-sm font-extrabold" style={{ color: tile.text }}>
                    {b.title}
                  </h3>
                  <p className="mt-1 text-xs font-bold leading-snug" style={{ color: tile.subtext }}>
                    {b.desc}
                  </p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}