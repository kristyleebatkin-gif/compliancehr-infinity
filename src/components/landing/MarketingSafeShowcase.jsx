import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
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
 * 1. Full Review of Must-Have Features (with Sales Ribbon)
 * 2. One-Click Operations
 * 3. Screen-by-Screen Audit with Master Checklist featured small
 * 4. Business Health & Compliance Intelligence
 * 5. Core Engines — Risk & Roster & Smart-Fill
 * 6. Unified Oversight (with Master Audit Report displayed smaller)
 * 7. Office View & Beach-Themed Showcase
 * 8. Price & Packaging
 */
export default function MarketingSafeShowcase({ embedded = false }) {
  return (
    <div className={embedded ? 'mx-auto max-w-6xl px-4 md:px-8 space-y-6' : 'w-full bg-white p-3 sm:p-4 space-y-5'}>
      {/* Compact Executive Marketing & Sales Pitch Ribbon */}
      <section
        className="rounded-3xl border-2 border-[#0A2B6D] bg-white p-4 shadow-lg"
        style={{ borderTopWidth: '4px', borderTopColor: '#0072FF' }}
      >
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 items-center">
          <div className="lg:col-span-3 flex flex-col items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3 text-center shadow-sm">
            <div className="h-20 w-full flex items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white p-1.5">
              <Image
                src={CHR_LOGO}
                alt="ComplianceHR Infinity Logo"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-1.5 text-xs font-extrabold text-[#0A2B6D]">
              ComplianceHR Infinity
            </div>
            <div className="text-[10px] font-extrabold text-[#5A00D6]">
              Complete Control. Greater Confidence. Brighter Success.
            </div>
            <div className="text-[9.5px] font-bold text-[#FF2E9A]">
              Kristy Lee Whelan · kristyleebatkin@live.com.au
            </div>
          </div>

          <div className="lg:col-span-6 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                style={{ background: SQUISHED_GRADIENT }}
              >
                <Sparkles className="h-3 w-3 text-[#00C6FF]" /> Executive Marketing &amp; Sales Suite
              </span>
              <span className="rounded-full bg-[#0072FF] px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                14-DAY FREE TRIAL · $0 UPFRONT
              </span>
            </div>

            <h2 className="font-editorial text-xl sm:text-2xl font-extrabold leading-tight text-[#0A2B6D]">
              Why Every Provider Subscribes to{' '}
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                ComplianceHR Infinity
              </span>
            </h2>

            <p className="text-xs font-semibold leading-relaxed text-[#0A2B6D]/90">
              Unite all <strong>46 live modules</strong>, <strong>1-Click Operations</strong>, <strong>Screen-by-Screen 2026 Smart-Fill Audits</strong>, <strong>Business Health Intelligence</strong>, <strong>Core Risk &amp; Roster Engines</strong>, <strong>Unified Oversight</strong>, <strong>Interactive Office &amp; Beach Views</strong>, and our <strong>$999 / $125m Compliance Docs Package</strong> in one platform.
            </p>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-[#FFF0F8] p-3 shadow-sm">
            <div>
              <span className="rounded-full bg-[#FF2E9A] px-2.5 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                Smart Enhanced All-In-One
              </span>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-xs font-bold text-[#5A00D6]">From</span>
                <span className="font-editorial text-2xl font-extrabold text-[#0A2B6D]">$660</span>
                <span className="text-xs font-bold text-[#5A00D6]">/ month</span>
              </div>
              <ul className="mt-1 space-y-0.5 text-[10.5px] font-bold text-[#0A2B6D]">
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                  <span>Includes +$160/mo Elite Pack</span>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#5A00D6]" />
                  <span>Includes $355 Master Audit Doc</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <Link
                to="/register"
                className="flex items-center justify-center gap-1 rounded-xl border-2 border-[#0A2B6D] px-2 py-1.5 text-[10.5px] font-extrabold text-white shadow-sm"
                style={{ background: SQUISHED_GRADIENT }}
              >
                Start Trial <ArrowRight className="h-3 w-3" />
              </Link>
              <a
                href="#pricing"
                className="flex items-center justify-center rounded-xl border-2 border-[#0A2B6D] bg-white px-2 py-1.5 text-[10.5px] font-extrabold text-[#0A2B6D] hover:bg-[#F5F0FF]"
              >
                See Pricing
              </a>
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

      {/* 3. Screen-by-Screen Audit with Master Checklist Featured Small */}
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

      {/* 7. Office View & Beach-Themed Showcase */}
      <div id="live-workspace" className="scroll-mt-16 space-y-4">
        <ExecutiveWallScene showAllModulesMinimised={true} />
        <BeachDeepSeaWallShowcase defaultScene="all" compact={true} />
      </div>

      {/* 8. Price and Packaging */}
      <PricingSection />
    </div>
  );
}