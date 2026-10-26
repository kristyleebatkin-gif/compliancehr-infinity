import React from 'react';
import { Sparkles } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import {
  getHeaderView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

export default function LandingCTA() {
  const sym = getSymbolView(0);

  return (
    <section
      id="why"
      className="w-full scroll-mt-16 rounded-3xl p-[9px] shadow-md"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <Reveal className="flex w-full flex-col items-center justify-center rounded-[14px] bg-white px-3 py-4 sm:px-4 sm:py-5 text-center space-y-3">
        {/* 1. "Why ComplianceHR Infinity" 25% Smaller */}
        <div
          className="w-full rounded-full p-[2.5px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[34px] w-full items-center justify-center gap-2 rounded-full px-4 py-1 text-xs sm:text-sm font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(7), color: '#FFFFFF' }}
          >
            <span
              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
              style={{ borderColor: getAppBorderView(0) }}
            >
              <Sparkles className="h-3 w-3" style={{ color: sym.iconColor }} />
            </span>
            <span className="text-center" style={{ color: '#FFFFFF' }}>
              Why ComplianceHR Infinity
            </span>
          </div>
        </div>

        {/* 2. "Ready to simplify your NDIS & Aged Care compliance?" on One Line With Clean White Background + Join Sentence on Two Even Rows */}
        <div
          className="w-full rounded-2xl p-[3px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-white px-4 py-3 sm:px-6 sm:py-4 text-center space-y-2">
            <div className="w-full rounded-xl bg-white px-3 py-1.5 text-center">
              <h2 className="mx-auto text-center font-editorial text-sm sm:text-xl md:text-2xl lg:text-3xl font-extrabold tracking-tight leading-snug whitespace-nowrap">
                <span className="text-[#0A2B6D]">Ready to </span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  simplify
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  your NDIS &amp; Aged Care compliance?
                </span>
              </h2>
            </div>

            <div className="mx-auto w-full max-w-3xl rounded-xl bg-white px-3 py-1 text-center">
              <p className="text-center text-[10.5px] sm:text-xs md:text-sm font-extrabold leading-snug text-[#0A2B6D]">
                <span className="block">
                  Join providers who trust ComplianceHR Infinity to keep their records,
                </span>
                <span className="block">
                  teams, and participants audit-ready every single day.
                </span>
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}