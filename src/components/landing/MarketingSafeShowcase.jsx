import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, Award, FileCheck2 } from 'lucide-react';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import MustHaveFunctionsReview from '@/components/landing/MustHaveFunctionsReview';
import ScreenByScreenMasterAudit2026 from '@/components/compliance/ScreenByScreenMasterAudit2026';
import PricingSection from '@/components/landing/PricingSection';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import BeachDeepSeaWallShowcase from '@/components/safe/BeachDeepSeaWallShowcase';
import {
  getTilePalette,
  getHeaderView,
  getTitleGradientView,
  getSubheaderColourView,
  getSymbolView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

export default function MarketingSafeShowcase({ embedded = false }) {
  return (
    <div className={embedded ? 'w-full space-y-4' : 'w-full bg-white p-3 sm:p-4 space-y-4'}>
      {/* CENTERED "Why Every Provider Subscribes" */}
      <section
        className="w-full rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-5">
          {/* Centred Badge Pill with White Symbol */}
          <span
            className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
            style={{ background: getHeaderView(1) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-center">Executive Marketing &amp; Sales Suite · 14-Day Free Trial</span>
          </span>

          {/* Heading & Subtitle */}
          <div className="mx-auto max-w-4xl space-y-1.5">
            <h2
              className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight bg-clip-text text-transparent"
              style={{ backgroundImage: getTitleGradientView(1) }}
            >
              Why Every Provider Subscribes to ComplianceHR Infinity
            </h2>

            <p
              className="mx-auto max-w-4xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed"
              style={{ color: getSubheaderColourView(1) }}
            >
              Replace 8 disconnected software subscriptions with one connected super-platform uniting all 46 live modules, 1-Click Operations, Screen-by-Screen 2026 Smart-Fill Audits, Business Health Intelligence, Core Risk &amp; Roster Engines, and our Outright Audit &amp; Compliance Doc Pack.
            </p>
          </div>

          {/* 4 High-Impact Subscriber Value Pills in Mixed Full Colours */}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, title: '46 Live Modules', sub: '100% Connected' },
              { icon: Zap, title: '2-Min Audits', sub: 'Instant PDF Pack' },
              { icon: Award, title: '356 Checkpoints', sub: '98 Master Docs' },
              { icon: Sparkles, title: 'AI Smart-Fill', sub: 'Zero Double-Entry' },
            ].map((p, idx) => {
              const Icon = p.icon;
              const tile = getTilePalette(idx + 1);
              const sym = getSymbolView(idx + 1);
              return (
                <div
                  key={p.title}
                  className="flex items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-4 py-2.5 text-left shadow-sm"
                  style={{ backgroundColor: tile.bg, color: tile.text }}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white">
                    <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                  </span>
                  <div>
                    <div className="text-xs sm:text-sm font-extrabold leading-tight" style={{ color: tile.text }}>
                      {p.title}
                    </div>
                    <div className="text-[11px] font-bold leading-tight" style={{ color: tile.subtext }}>
                      {p.sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Two Packages Side-by-Side */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
            {/* Pack 1 */}
            <div className="flex flex-col items-center justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 text-center shadow-sm">
              <div className="w-full space-y-2.5">
                <span
                  className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(2) }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                    <Sparkles className="h-3 w-3 text-white" />
                  </span>
                  <span>Pack 1 · Smart Enhanced All-In-One Subscription</span>
                </span>
                <div className="flex items-baseline justify-center gap-1.5 pt-1">
                  <span className="text-xs font-extrabold text-[#5A00D6]">From</span>
                  <span
                    className="font-editorial text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent"
                    style={{ backgroundImage: getTitleGradientView(0) }}
                  >
                    $660
                  </span>
                  <span className="text-xs font-extrabold text-[#5A00D6]">/ month</span>
                </div>
                <p className="text-xs font-bold" style={{ color: getSubheaderColourView(2) }}>
                  All 46 live modules + $160/mo Elite Engine Suite + $355 Master Audit Document included
                </p>
                <ul className="mx-auto max-w-md space-y-2 pt-1 text-left text-xs font-extrabold">
                  {[
                    'Includes +$160/mo Elite Automation & Intelligence Pack',
                    'Includes $355 Master Compliance Audit Checklist (356 Checkpoints)',
                    'Unlimited Staff, Participant & Auditor Portal Workflows',
                  ].map((line, idx) => {
                    const tile = getTilePalette(idx);
                    const sym = getSymbolView(idx);
                    return (
                      <li
                        key={line}
                        className="flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1.5"
                        style={{ backgroundColor: tile.bg, color: tile.text }}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                          <CheckCircle2 className="h-3 w-3" style={{ color: sym.iconColor }} />
                        </span>
                        <span style={{ color: tile.text }}>{line}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2.5">
                <Link
                  to="/register"
                  className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{ background: getHeaderView(0) }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </span>
                  <span>Start 14-Day Free Trial</span>
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{ background: getHeaderView(3) }}
                >
                  <span>View Tier Pricing</span>
                </a>
              </div>
            </div>

            {/* Pack 2 */}
            <div className="flex flex-col items-center justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 text-center shadow-sm">
              <div className="w-full space-y-2.5">
                <span
                  className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(4) }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                    <FileCheck2 className="h-3 w-3 text-white" />
                  </span>
                  <span>Pack 2 · Outright Audit &amp; Compliance Doc Pack</span>
                </span>
                <div className="flex flex-wrap items-baseline justify-center gap-2 pt-1">
                  <span
                    className="font-editorial text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent"
                    style={{ backgroundImage: getTitleGradientView(2) }}
                  >
                    $999
                  </span>
                  <span className="text-xs font-extrabold uppercase text-[#FF2E9A]">Outright</span>
                  <span className="text-xs font-extrabold text-[#0A2B6D]">or</span>
                  <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#5A00D6]">$125</span>
                  <span className="text-xs font-extrabold text-[#5A00D6]">/ month</span>
                </div>
                <p className="text-xs font-bold" style={{ color: getSubheaderColourView(3) }}>
                  Complete 98-Document NDIS &amp; Aged Care Audit Library + $355 Master Audit Checklist
                </p>
                <ul className="mx-auto max-w-md space-y-2 pt-1 text-left text-xs font-extrabold">
                  {[
                    'All 98 NDIS & Aged Care Policies, Registers & Intake Forms',
                    'Includes $355 Master Audit Checklist (CHR-AUD-001 & 002)',
                    '12 Printable A4 Office Masters + Smart-Fill Auto-Branding',
                  ].map((line, idx) => {
                    const tile = getTilePalette(idx + 4);
                    const sym = getSymbolView(idx + 4);
                    return (
                      <li
                        key={line}
                        className="flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1.5"
                        style={{ backgroundColor: tile.bg, color: tile.text }}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                          <FileCheck2 className="h-3 w-3" style={{ color: sym.iconColor }} />
                        </span>
                        <span style={{ color: tile.text }}>{line}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2.5">
                <a
                  href="#pricing"
                  className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{ background: getHeaderView(5) }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                    <ArrowRight className="h-3 w-3 text-white" />
                  </span>
                  <span>Select $999 Outright / $125m Pack</span>
                </a>
                <Link
                  to="/compliance"
                  className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{ background: getHeaderView(6) }}
                >
                  <span>Preview Audit Docs</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Full Review of Must-Have Features */}
      <MustHaveFunctionsReview />

      {/* 2. One-Click Operations */}
      <div
        id="infinity-one-click-operations"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <InfinityOneClickOperations />
        </div>
      </div>

      {/* 3. Screen-by-Screen Audit */}
      <div
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <ScreenByScreenMasterAudit2026 />
        </div>
      </div>

      {/* 4. Business Health & Compliance Intelligence */}
      <div
        id="business-health-intelligence"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <BusinessHealthComplianceIntelligenceDashboard />
        </div>
      </div>

      {/* 5. Core Engines */}
      <div
        id="infinity-core-engine"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <InfinityCoreEngine />
        </div>
      </div>

      {/* 6. Unified Oversight */}
      <div
        id="infinity-control-centre"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <InfinityControlCentreMasterSuite />
        </div>
      </div>

      {/* 7. Office View + Beach Scene */}
      <div
        id="live-workspace"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4 space-y-4">
          <ExecutiveWallScene showAllModulesMinimised={true} />
          <BeachDeepSeaWallShowcase defaultScene="all" compact={true} />
        </div>
      </div>

      {/* 8. Price and Packaging */}
      <PricingSection />
    </div>
  );
}