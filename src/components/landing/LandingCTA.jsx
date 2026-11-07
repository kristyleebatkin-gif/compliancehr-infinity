import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, ShieldCheck, CheckCircle2, Building2 } from 'lucide-react';
import Reveal from '@/components/landing/Reveal';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

export default function LandingCTA({ onBookDemo }) {
  return (
    <section id="final-cta" className="w-full scroll-mt-20">
      <Reveal
        className="overflow-hidden rounded-2xl border border-[#00C6FF]/40 shadow-xl"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 35%, #5A00D6 70%, #FF2E9A 100%)',
          }}
        />
        <div className="px-6 py-8 sm:px-10 sm:py-10 text-white space-y-6">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 text-left space-y-3">
              <span className="inline-flex items-center gap-2 rounded-md border border-[#00C6FF]/40 bg-[#0072FF]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#00C6FF]">
                <Building2 className="h-3.5 w-3.5 text-[#00C6FF]" />
                <span>14-Day Enterprise Evaluation · Full 46-Module Access</span>
              </span>

              <h2
                className="font-editorial text-2xl sm:text-3xl lg:text-[32px] font-extrabold tracking-tight text-white leading-tight"
                style={{ color: '#FFFFFF' }}
              >
                Deploy a Unified Compliance, Risk &amp; Workforce Operating System
              </h2>

              <p className="max-w-2xl text-sm sm:text-base font-normal leading-relaxed text-white/90">
                Replace disconnected spreadsheets and point tools with one audit-ready platform built for NDIS, Aged Care, and Allied Health governance.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-1 text-xs font-extrabold text-white">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00C6FF]/40 bg-white/10 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00C6FF]" />
                  46 Connected Modules
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00C6FF]/40 bg-white/10 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00C6FF]" />
                  45 Self-Maintaining Master Registers
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#00C6FF]/40 bg-white/10 px-3 py-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#00C6FF]" />
                  356 NDIS &amp; Aged Care Checkpoints
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center gap-3 rounded-xl border border-white/20 bg-white/10 p-5">
              <button
                type="button"
                onClick={() => onBookDemo && onBookDemo('Executive Platform Demo')}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-bold text-white shadow-md transition hover:opacity-95"
                style={{
                  background: 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)',
                }}
              >
                <Calendar className="h-4 w-4 shrink-0 text-white" />
                <span>Book Executive Demo</span>
              </button>

              <Link
                to="/register"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-white/30 bg-white px-5 py-3 text-sm font-bold text-[#0A2B6D] shadow-sm transition hover:bg-slate-100"
              >
                <span style={{ color: '#0A2B6D' }}>Start 14-Day Free Trial</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-[#0072FF]" />
              </Link>

              <div className="flex items-center justify-center gap-1.5 pt-1 text-xs font-medium text-white/90 text-center">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-[#00C6FF]" />
                <span>Role-based access controls · Dedicated Australian compliance support</span>
              </div>
            </div>
          </div>

          {/* Centred Brand Logo & Statement Bar Under Deploy a Unified Tile */}
          <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-white/15 bg-black/50 px-5 py-4 lg:flex-row">
            <Link to="/" className="inline-flex items-center justify-center">
              <BrandLogoLockup size="sm" theme="dark" showSlogan={true} />
            </Link>
            <div className="text-center lg:text-right space-y-1 max-w-xl">
              <div className="text-xs sm:text-sm font-extrabold text-[#00C6FF]">
                Enterprise Compliance, Clinical Governance, Workforce Screening &amp; Operations Platform
              </div>
              <p className="text-xs font-semibold text-white/85">
                Built for Australian NDIS, Strengthened Aged Care, and Allied Health providers — one unified source of truth across every register, profile, and audit checkpoint.
              </p>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}