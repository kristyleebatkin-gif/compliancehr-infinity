import React from 'react';
import { ShieldCheck, ShieldAlert, TrendingUp, ClipboardCheck, RefreshCw, Lock } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
  getSubheaderColourView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

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
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* Heading & Subheading First Inside Stretched App Design Coloured Border */}
        <div
          className="w-full rounded-2xl border-2 border-[#0A2B6D] p-3 sm:p-4 shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-white px-5 py-4 sm:px-8 sm:py-5 text-center space-y-2">
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
              className="mx-auto max-w-4xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed"
              style={{ color: getSubheaderColourView(1) }}
            >
              The smartest, simplest, easiest and most effortless way to store, copy, use, audit, share, scan, send, sort, file and report on every document, conversation and outcome, while saving you time, money and effort.
            </p>
          </div>
        </div>

        {/* Stretched Side-to-Side Banner Underneath in App Design Coloured Border */}
        <div
          className="w-full rounded-full p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(3) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <ShieldCheck className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-center">Built For Better Services · Why Providers Choose Us</span>
          </div>
        </div>

        {/* 6 Benefits in Pink, Blue & Purple Spray Background + App Design Coloured Borders */}
        <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 auto-rows-fr text-center">
          {BENEFITS.map((b, index) => {
            const sym = getSymbolView(index + 2);
            const borderCol = getAppBorderView(index + 2);
            const sprayBg = SPRAY_BGS[index % SPRAY_BGS.length];
            return (
              <Reveal
                key={b.title}
                delay={(index % 6) * 0.05}
                className="group flex h-full flex-col rounded-2xl p-[3px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full flex-1 flex-col items-center justify-between rounded-[13px] p-4 text-center space-y-2.5"
                  style={{ background: sprayBg }}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform group-hover:scale-105"
                    style={{ borderColor: borderCol }}
                  >
                    <b.icon className="h-5 w-5" style={{ color: sym.iconColor }} />
                  </span>

                  <div
                    className="w-full rounded-xl p-[2.5px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[40px] w-full items-center justify-center rounded-[9px] bg-white px-2.5 py-1.5 text-center">
                      <h3 className="font-editorial text-xs sm:text-sm font-extrabold text-[#0A2B6D]">
                        {b.title}
                      </h3>
                    </div>
                  </div>

                  <p className="flex-1 flex items-center justify-center text-xs font-bold leading-snug text-[#0A2B6D]">
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