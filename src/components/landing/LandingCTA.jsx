import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';

const APP_STATED_FACTS = [
  '46 Connected Modules',
  '45 Self-Maintaining Master Registers',
  '356 NDIS & Aged Care Checkpoints',
];

export default function LandingCTA({ onBookDemo }) {
  return (
    <section id="final-cta" className="w-full scroll-mt-20">
      <Reveal
        className="overflow-hidden rounded-2xl p-[2px] shadow-xl"
        style={{
          background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 38%, #A855F7 70%, #FF2E9A 100%)',
        }}
      >
        <div
          className="rounded-[14px] px-4 py-3.5 sm:px-5 sm:py-4 text-white space-y-2.5"
          style={{
            background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
          }}
        >
          {/* 1. Header Always First (Run In on One Straight Line, Slightly Bigger) + Sentence Under It + Blue/Purple Badges After */}
          <div className="space-y-1 border-b border-white/15 pb-2.5 text-left">
            <h2
              className="font-editorial text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-white leading-tight lg:whitespace-nowrap"
              style={{ color: '#FFFFFF' }}
            >
              Deploy a Unified Compliance, Risk &amp; Workforce Operating System
            </h2>

            <p className="w-full text-xs sm:text-[13px] font-semibold leading-snug text-white/90 lg:whitespace-nowrap">
              Replace disconnected spreadsheets and point tools with one audit-ready platform built for NDIS, Aged Care, and Allied Health governance.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <span className="inline-flex items-center gap-1.5 rounded-md border border-[#00C6FF]/40 bg-[#0072FF]/25 px-2.5 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                <span
                  className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15"
                  style={{ boxShadow: '0 0 8px 1px rgba(255,255,255,0.9)' }}
                >
                  <Building2 className="h-2.5 w-2.5 text-white" />
                </span>
                <span>14-Day Enterprise Evaluation · Full 46-Module Access</span>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#A855F7]/50 bg-[#5A00D6]/30 px-2.5 py-0.5 text-[10.5px] font-extrabold text-white">
                <ShieldCheck className="h-3 w-3 shrink-0 text-white" style={{ filter: 'drop-shadow(0 0 4px #FFFFFF)' }} />
                <span>Role-based access controls · Dedicated Australian compliance support</span>
              </span>
            </div>
          </div>

          {/* 2. Three Stated Facts About the App Next to the Squished Book Demo / Free Trial Tile */}
          <div className="grid grid-cols-1 gap-2.5 lg:grid-cols-12 items-stretch">
            {/* Left: 3 Stated Facts */}
            <div className="lg:col-span-7 grid grid-cols-1 gap-2 sm:grid-cols-3 items-stretch">
              {APP_STATED_FACTS.map((fact, idx) => (
                <div
                  key={fact}
                  className="flex items-center gap-2 rounded-xl border border-white/15 bg-[#16468A]/75 backdrop-blur-sm px-3 py-2.5"
                >
                  <span
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-[#0072FF]/35"
                    style={{ boxShadow: '0 0 8px rgba(255,255,255,0.75)' }}
                  >
                    <CheckCircle2
                      className="h-3.5 w-3.5 text-white"
                      style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }}
                    />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                      Fact 0{idx + 1}
                    </div>
                    <div className="text-xs font-extrabold leading-snug text-white">
                      {fact}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Squished Book Executive Demo & Start 14-Day Free Trial Tile Next to the 3 Facts */}
            <div className="lg:col-span-5 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 rounded-xl border border-white/20 bg-[#16468A]/80 backdrop-blur-sm px-3 py-2">
              <button
                type="button"
                onClick={() => onBookDemo && onBookDemo('Executive Platform Demo')}
                className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-extrabold text-white shadow-md transition hover:opacity-95 whitespace-nowrap"
                style={{
                  background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                }}
              >
                <Calendar className="h-3.5 w-3.5 shrink-0 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                <span>Book Executive Demo</span>
              </button>

              <Link
                to="/register"
                className="inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/30 bg-white px-3 text-xs font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-slate-100 whitespace-nowrap"
              >
                <span style={{ color: '#0A2B6D' }}>Start 14-Day Free Trial</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}