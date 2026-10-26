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
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <Reveal className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-6 sm:px-6 sm:py-7 text-center space-y-4">
        {/* 1. "Why ComplianceHR Infinity" Moved ABOVE "Ready to simplify..." */}
        <div
          className="w-full rounded-full p-[3.5px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(7), color: '#FFFFFF' }}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
              style={{ borderColor: getAppBorderView(0) }}
            >
              <Sparkles className="h-4 w-4" style={{ color: sym.iconColor }} />
            </span>
            <span className="text-center" style={{ color: '#FFFFFF' }}>
              Why ComplianceHR Infinity
            </span>
          </div>
        </div>

        {/* 2. "Ready to simplify" + Space Before "your NDIS & Aged Care compliance?" (f & y Unclipped) + Framed Sentence Underneath */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex w-full flex-col items-center justify-center rounded-[12px] bg-white px-5 py-6 sm:px-8 sm:py-7 text-center space-y-4">
            <h2 className="flex flex-col items-center justify-center gap-2.5 font-editorial text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
              <span className="flex flex-wrap items-baseline justify-center gap-x-2.5 leading-[1.35] py-0.5">
                <span className="text-[#0A2B6D]">Ready to</span>
                <span className="font-editorial-italic inline-block px-2.5 py-0.5 leading-[1.35] bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  simplify
                </span>
              </span>
              <span className="block pt-1 leading-[1.25] bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                your NDIS &amp; Aged Care compliance?
              </span>
            </h2>

            {/* Sentence Underneath Framed in App Design Coloured Border so It Fits & Displays Better */}
            <div
              className="mx-auto w-full max-w-4xl rounded-2xl p-[3.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div className="flex min-h-[52px] w-full items-center justify-center rounded-[13px] bg-white px-4 py-3 text-center">
                <p
                  className="text-center text-xs sm:text-sm md:text-base font-extrabold leading-relaxed text-[#0A2B6D]"
                >
                  Join providers who trust ComplianceHR Infinity to keep their records, teams, and participants audit-ready every single day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}