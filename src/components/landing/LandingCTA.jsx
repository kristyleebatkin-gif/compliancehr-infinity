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

        {/* 2. "Ready to simplify" — White Outside Border & Pink/Blue/Purple Spray With Dark Blue Writing Inside */}
        <div
          className="w-full rounded-2xl p-[3px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex w-full flex-col items-center justify-center rounded-[10px] bg-white px-4 py-4 sm:px-6 sm:py-5 text-center space-y-2.5">
            <div
              className="w-full rounded-xl p-[2px]"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="rounded-[9px] px-4 py-3 text-center"
                style={{
                  background:
                    'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.65) 0%, transparent 52%), #FFFFFF',
                }}
              >
                <h2 className="flex flex-col items-center justify-center gap-1 font-editorial text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                  <span className="flex flex-wrap items-baseline justify-center gap-x-2 leading-[1.3] py-0.5">
                    <span className="text-[#0A2B6D]">Ready to</span>
                    <span className="font-editorial-italic inline-block px-2 py-0.5 leading-[1.3] bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                      simplify
                    </span>
                  </span>
                  <span className="block pt-0.5 leading-[1.2] bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                    your NDIS &amp; Aged Care compliance?
                  </span>
                </h2>
              </div>
            </div>

            <div
              className="mx-auto w-full max-w-3xl rounded-xl p-[2.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div
                className="flex min-h-[38px] w-full items-center justify-center rounded-[9px] px-3 py-2 text-center"
                style={{
                  background:
                    'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.65) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.65) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.65) 0%, transparent 52%), #FFFFFF',
                }}
              >
                <p className="text-center text-[11px] sm:text-xs md:text-sm font-extrabold leading-snug text-[#0A2B6D]">
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