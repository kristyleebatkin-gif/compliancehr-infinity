import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2, ShieldCheck, Zap, Award } from 'lucide-react';
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
 * 1. BIGGER & BETTER "Why Every Provider Subscribes to ComplianceHR Infinity" + Full Review of Must-Have Features
 * 2. One-Click Operations
 * 3. Screen-by-Screen Audit (Compact) with Master Checklist featured small
 * 4. Business Health & Compliance Intelligence
 * 5. Core Engines — Risk & Roster & Smart-Fill
 * 6. Unified Oversight (with Master Audit Report displayed smaller)
 * 7. Office View & Beach-Before-Deep-Sea Showcase (1 of Each)
 * 8. Price & Packaging
 */
export default function MarketingSafeShowcase({ embedded = false }) {
  return (
    <div className={embedded ? 'w-full space-y-6' : 'w-full bg-white p-3 sm:p-4 space-y-5'}>
      {/* BIGGER & BETTER Executive Marketing & Sales Pitch Section */}
      <section
        className="w-full overflow-hidden rounded-3xl border-4 border-[#0A2B6D] p-4 sm:p-6 shadow-2xl ring-2 ring-[#FF2E9A]"
        style={{
          background:
            'linear-gradient(120deg, #0072FF 0%, #0A2B6D 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
        }}
      >
        <div className="rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 sm:p-6 shadow-xl">
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 items-stretch">
            {/* Left Brand & Identity Showcase Card (3 cols) */}
            <div className="lg:col-span-3 flex flex-col items-center justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 text-center shadow-md" style={{ borderTopWidth: '5px', borderTopColor: '#0072FF' }}>
              <div className="h-32 w-full flex items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white p-2 shadow-sm">
                <Image
                  src={CHR_LOGO}
                  alt="ComplianceHR Infinity Logo"
                  fittingType="fit"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="mt-3 space-y-1 bg-white">
                <div className="font-editorial text-lg font-extrabold text-[#0A2B6D]">
                  ComplianceHR Infinity
                </div>
                <div className="text-xs font-extrabold text-[#5A00D6]">
                  Complete Control. Greater Confidence. <span className="text-[#FF2E9A]">Brighter Success.</span>
                </div>
                <div className="rounded-lg border border-[#0A2B6D] bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D]">
                  Kristy Lee Whelan · kristyleebatkin@live.com.au
                </div>
              </div>
            </div>

            {/* Center Bigger Headline & Value Proposition (6 cols) */}
            <div className="lg:col-span-6 flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 shadow-md" style={{ borderTopWidth: '5px', borderTopColor: '#5A00D6' }}>
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#0A2B6D] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white shadow-sm"
                    style={{ background: SQUISHED_GRADIENT }}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-[#00C6FF]" /> Executive Marketing &amp; Sales Suite
                  </span>
                  <span className="rounded-full border border-[#0A2B6D] bg-[#00C6FF] px-3 py-1 text-xs font-extrabold text-[#0A2B6D]">
                    14-DAY FREE TRIAL · $0 UPFRONT
                  </span>
                </div>

                <h2 className="rounded bg-white font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight text-[#0A2B6D]">
                  Why Every Provider Subscribes to{' '}
                  <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    ComplianceHR Infinity
                  </span>
                </h2>

                <p className="rounded bg-white text-xs sm:text-sm font-bold leading-relaxed text-[#0A2B6D]">
                  Replace 8 disconnected software subscriptions with one connected super-platform uniting all <strong>46 live modules</strong>, <strong>1-Click Operations</strong>, <strong>Screen-by-Screen 2026 Smart-Fill Audits</strong>, <strong>Business Health Intelligence</strong>, <strong>Core Risk &amp; Roster Engines</strong>, <strong>Unified Executive Oversight</strong>, and our <strong>$999 / $125m Compliance Docs Package</strong>.
                </p>
              </div>

              {/* 4 High-Impact Subscriber Value Pills on White */}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
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
                      className="rounded-xl border-2 border-[#0A2B6D] bg-white p-2 text-center shadow-2xs"
                      style={{ borderTopWidth: '3px', borderTopColor: p.color }}
                    >
                      <span
                        className="mx-auto flex h-7 w-7 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: p.color }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </span>
                      <div className="mt-1 text-xs font-extrabold text-[#0A2B6D]">{p.title}</div>
                      <div className="text-[10px] font-bold text-[#5A00D6]">{p.sub}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Subscription Package Highlight Card (3 cols) */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-3 rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-md" style={{ borderTopWidth: '5px', borderTopColor: '#FF2E9A' }}>
              <div className="bg-white">
                <span className="inline-block rounded-full border border-[#0A2B6D] bg-[#FF2E9A] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                  Smart Enhanced All-In-One
                </span>
                <div className="mt-2 flex items-baseline gap-1.5 bg-white">
                  <span className="text-xs font-extrabold text-[#0A2B6D]">From</span>
                  <span className="font-editorial text-3xl sm:text-4xl font-extrabold text-[#0A2B6D]">$660</span>
                  <span className="text-xs font-extrabold text-[#5A00D6]">/ month</span>
                </div>
                <ul className="mt-2.5 space-y-1.5 text-xs font-extrabold text-[#0A2B6D]">
                  <li className="flex items-center gap-1.5 rounded-lg border border-[#0A2B6D]/25 bg-white px-2 py-1">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0072FF]" />
                    <span>Includes +$160/mo Elite Pack</span>
                  </li>
                  <li className="flex items-center gap-1.5 rounded-lg border border-[#0A2B6D]/25 bg-white px-2 py-1">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5A00D6]" />
                    <span>Includes $355 Master Audit Doc</span>
                  </li>
                  <li className="flex items-center gap-1.5 rounded-lg border border-[#0A2B6D]/25 bg-white px-2 py-1">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#FF2E9A]" />
                    <span>$999 / $125m Docs Add-On Ready</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-[#0A2B6D] bg-[#FF2E9A] px-3 py-2 text-xs font-extrabold text-white shadow-md hover:bg-[#5A00D6]"
                >
                  Start 14-Day Free Trial <ArrowRight className="h-3.5 w-3.5" />
                </Link>
                <a
                  href="#pricing"
                  className="flex items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
                >
                  Compare All Packages
                </a>
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