import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, Award, FileCheck2 } from 'lucide-react';
import { Image } from '@/components/ui/image';
import ExecutiveWallScene, { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';
import MustHaveFunctionsReview from '@/components/landing/MustHaveFunctionsReview';
import ScreenByScreenMasterAudit2026 from '@/components/compliance/ScreenByScreenMasterAudit2026';
import PricingSection from '@/components/landing/PricingSection';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import BeachDeepSeaWallShowcase from '@/components/safe/BeachDeepSeaWallShowcase';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

/**
 * Marketing & Sales Suite — ordered after "Why providers choose ComplianceHR":
 * 1. Centered "Why Every Provider Subscribes to ComplianceHR Infinity" with Smart All-In-One Pack AND Outright Audit Doc Pack Side-by-Side
 * 2. Full Review of Must-Have Features
 * 3. One-Click Operations
 * 4. Screen-by-Screen Audit (Compact)
 * 5. Business Health & Compliance Intelligence
 * 6. Core Engines — Risk & Roster & Smart-Fill
 * 7. Unified Oversight
 * 8. Office View & Beach-Before-Deep-Sea Showcase (1 of Each)
 * 9. Price & Packaging
 */
export default function MarketingSafeShowcase({ embedded = false }) {
  return (
    <div className={embedded ? 'w-full space-y-6' : 'w-full bg-white p-3 sm:p-4 space-y-5'}>
      {/* CENTERED "Why Every Provider Subscribes" + Outright Audit Doc Pack Beside Listed Pack */}
      <section
        className="w-full overflow-hidden rounded-3xl border-4 border-[#0A2B6D] p-4 sm:p-6 shadow-2xl ring-2 ring-[#FF2E9A]"
        style={{
          background:
            'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
        }}
      >
        <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 sm:p-7 text-center shadow-xl space-y-5">
          {/* Centered Brand Logo & Identity Header */}
          <div className="flex flex-col items-center justify-center space-y-2 bg-white">
            <div className="flex h-28 w-48 sm:h-32 sm:w-56 items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white p-2 shadow-md">
              <Image
                src={CHR_LOGO}
                alt="ComplianceHR Infinity Logo"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span
                className="inline-flex items-center gap-1.5 rounded-full border border-[#0A2B6D] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm"
                style={{ background: SQUISHED_GRADIENT }}
              >
                <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" /> Executive Marketing &amp; Sales Suite
              </span>
              <span className="rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                NDIS &amp; Aged Care Compliance
              </span>
              <span className="rounded-full border border-[#0A2B6D] bg-[#00C6FF] px-3.5 py-1 text-xs font-extrabold text-[#0A2B6D]">
                14-DAY FREE TRIAL · $0 UPFRONT
              </span>
            </div>

            <h2 className="mx-auto max-w-4xl rounded bg-white font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-[#0A2B6D]">
              Why Every Provider Subscribes to{' '}
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                ComplianceHR Infinity
              </span>
            </h2>

            <p className="mx-auto max-w-4xl rounded bg-white text-xs sm:text-sm font-bold leading-relaxed text-[#0A2B6D]">
              Replace 8 disconnected software subscriptions with one connected super-platform uniting all <strong>46 live modules</strong>, <strong>1-Click Operations</strong>, <strong>Screen-by-Screen 2026 Smart-Fill Audits</strong>, <strong>Business Health Intelligence</strong>, <strong>Core Risk &amp; Roster Engines</strong>, and our <strong>Outright Audit &amp; Compliance Doc Pack</strong>.
            </p>
          </div>

          {/* Centered 4 High-Impact Subscriber Value Pills */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, title: '46 Live Modules', sub: '100% Connected', color: '#0072FF' },
              { icon: Zap, title: '2-Min Audits', sub: 'Instant PDF Pack', color: '#5A00D6' },
              { icon: Award, title: '356 Checkpoints', sub: '98 Master Docs', color: '#A100FF' },
              { icon: Sparkles, title: 'AI Smart-Fill', sub: 'Zero Double-Entry', color: '#FF2E9A' },
            ].map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white p-3 text-center shadow-sm"
                  style={{ borderTopWidth: '4px', borderTopColor: p.color }}
                >
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                    style={{ backgroundColor: p.color }}
                  >
                    <Icon className="h-4 w-4 text-white" />
                  </span>
                  <div className="mt-1.5 text-xs sm:text-sm font-extrabold text-[#0A2B6D]">{p.title}</div>
                  <div className="text-[11px] font-bold text-[#5A00D6]">{p.sub}</div>
                </div>
              );
            })}
          </div>

          {/* TWO PACKAGES SIDE-BY-SIDE: Listed All-In-One Subscription Pack BESIDE Outright Audit Doc Pack */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
            {/* Pack 1: Listed Smart Enhanced All-In-One Subscription */}
            <div
              className="flex flex-col items-center justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 text-center shadow-md"
              style={{ borderTopWidth: '5px', borderTopColor: '#0072FF' }}
            >
              <div className="w-full space-y-2 bg-white">
                <span className="inline-block rounded-full border border-[#0A2B6D] bg-[#0072FF] px-3.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
                  Pack 1 · Smart Enhanced All-In-One Subscription
                </span>
                <div className="flex items-baseline justify-center gap-1.5 bg-white pt-1">
                  <span className="text-xs font-extrabold text-[#0A2B6D]">From</span>
                  <span className="font-editorial text-3xl sm:text-4xl font-extrabold text-[#0A2B6D]">$660</span>
                  <span className="text-xs font-extrabold text-[#5A00D6]">/ month</span>
                </div>
                <p className="text-xs font-bold text-[#0A2B6D]">
                  All 46 live modules + $160/mo Elite Engine Suite + $355 Master Audit Document included
                </p>
                <ul className="mx-auto max-w-md space-y-1.5 pt-1 text-left text-xs font-extrabold text-[#0A2B6D]">
                  <li className="flex items-center gap-2 rounded-lg border border-[#0A2B6D]/25 bg-white px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0072FF]" />
                    <span>Includes +$160/mo Elite Automation &amp; Intelligence Pack</span>
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-[#0A2B6D]/25 bg-white px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5A00D6]" />
                    <span>Includes $355 Master Compliance Audit Checklist (356 Checkpoints)</span>
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-[#0A2B6D]/25 bg-white px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FF2E9A]" />
                    <span>Unlimited Staff, Participant &amp; Auditor Portal Workflows</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-[#0072FF] px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-[#5A00D6]"
                >
                  Start 14-Day Free Trial <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                >
                  View Tier Pricing
                </a>
              </div>
            </div>

            {/* Pack 2: Outright Audit & Compliance Doc Pack (Beside Listed Pack) */}
            <div
              className="flex flex-col items-center justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 text-center shadow-md"
              style={{ borderTopWidth: '5px', borderTopColor: '#FF2E9A' }}
            >
              <div className="w-full space-y-2 bg-white">
                <span className="inline-block rounded-full border border-[#0A2B6D] bg-[#FF2E9A] px-3.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
                  Pack 2 · Outright Audit &amp; Compliance Doc Pack
                </span>
                <div className="flex flex-wrap items-baseline justify-center gap-2 bg-white pt-1">
                  <span className="font-editorial text-3xl sm:text-4xl font-extrabold text-[#0A2B6D]">$999</span>
                  <span className="text-xs font-extrabold uppercase text-[#FF2E9A]">Outright</span>
                  <span className="text-xs font-extrabold text-[#0A2B6D]">or</span>
                  <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#5A00D6]">$125</span>
                  <span className="text-xs font-extrabold text-[#5A00D6]">/ month</span>
                </div>
                <p className="text-xs font-bold text-[#0A2B6D]">
                  Complete 98-Document NDIS &amp; Aged Care Audit Library + $355 Master Audit Checklist
                </p>
                <ul className="mx-auto max-w-md space-y-1.5 pt-1 text-left text-xs font-extrabold text-[#0A2B6D]">
                  <li className="flex items-center gap-2 rounded-lg border border-[#0A2B6D]/25 bg-white px-3 py-1.5">
                    <FileCheck2 className="h-4 w-4 shrink-0 text-[#FF2E9A]" />
                    <span>All 98 NDIS &amp; Aged Care Policies, Registers &amp; Intake Forms</span>
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-[#0A2B6D]/25 bg-white px-3 py-1.5">
                    <FileCheck2 className="h-4 w-4 shrink-0 text-[#5A00D6]" />
                    <span>Includes $355 Master Audit Checklist (CHR-AUD-001 &amp; 002)</span>
                  </li>
                  <li className="flex items-center gap-2 rounded-lg border border-[#0A2B6D]/25 bg-white px-3 py-1.5">
                    <FileCheck2 className="h-4 w-4 shrink-0 text-[#0072FF]" />
                    <span>12 Printable A4 Office Masters + Smart-Fill Auto-Branding</span>
                  </li>
                </ul>
              </div>

              <div className="mt-4 flex w-full flex-wrap items-center justify-center gap-2">
                <a
                  href="#pricing"
                  className="inline-flex items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] bg-[#FF2E9A] px-5 py-2 text-xs font-extrabold text-white shadow-md hover:bg-[#5A00D6]"
                >
                  Select $999 Outright / $125m Pack <ArrowRight className="h-3.5 w-3.5" />
                </a>
                <Link
                  to="/compliance"
                  className="inline-flex items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white px-4 py-2 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                >
                  Preview Audit Docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1. Full Review of Must-Have Features */}
      <MustHaveFunctionsReview />

      {/* 2. One-Click Operations */}
      <div id="infinity-one-click-operations" className="scroll-mt-16">
        <InfinityOneClickOperations />
      </div>

      {/* 3. Screen-by-Screen Audit (Compact) with Master Checklist Featured Small */}
      <ScreenByScreenMasterAudit2026 />

      {/* 4. Business Health & Compliance Intelligence */}
      <div id="business-health-intelligence" className="scroll-mt-16">
        <BusinessHealthComplianceIntelligenceDashboard />
      </div>

      {/* 5. Core Engines — Risk, Roster & Smart-Fill */}
      <div id="infinity-core-engine" className="scroll-mt-16">
        <InfinityCoreEngine />
      </div>

      {/* 6. Unified Oversight with Master Audit Report Displayed Smaller */}
      <div id="infinity-control-centre" className="scroll-mt-16">
        <InfinityControlCentreMasterSuite />
      </div>

      {/* 7. Office View + Beach Scene BEFORE Deep Blue Sea (Only 1 of Each!) */}
      <div id="live-workspace" className="scroll-mt-16 space-y-4">
        <ExecutiveWallScene showAllModulesMinimised={true} />
        <BeachDeepSeaWallShowcase defaultScene="all" compact={true} />
      </div>

      {/* 8. Price and Packaging */}
      <PricingSection />
    </div>
  );
}