import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Layers, Zap, ClipboardCheck,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import ExecutiveWallScene, { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';
import MustHaveFunctionsReview from '@/components/landing/MustHaveFunctionsReview';
import ScreenByScreenMasterAudit2026 from '@/components/compliance/ScreenByScreenMasterAudit2026';
import PricingSection from '@/components/landing/PricingSection';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export default function MarketingSafeShowcase({ embedded = false }) {
  return (
    <div className="w-full bg-white p-1 space-y-1.5">
      {/* Sticky High-Converting Sales Navigation + Pitch Header */}
      <header
        className="sticky top-0 z-40 rounded-xl border-2 border-amber-300 px-3 py-1.5 text-white shadow-md"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Official ComplianceHR Infinity Brand Lockup + Main Headline */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-10 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
              <Image
                src={CHR_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  ComplianceHR Infinity · Smart Enhanced All-In-One Business &amp; NDIS Super-Platform
                </span>
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[8px] font-black text-blue-950">
                  DOCS PACKAGE: $999 OUTRIGHT OR $125/MO (24-MO) · FREE IN APP PLANS
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-black text-white">
                  +$160/MO ELITE INCLUDED ($660–$1,035/MO)
                </span>
              </div>
              <p className="text-[8.5px] font-bold text-amber-100">
                Complete Control. Greater Confidence. Brighter Success. · 45 Connected Modules · 17 Audit Categories · 356 Checkpoints · 14-Day $0 Trial
              </p>
            </div>
          </div>

          {/* Quick Jump Navigation & CTAs */}
          <div className="flex flex-wrap items-center gap-1">
            <a
              href="#infinity-one-click-operations"
              className="rounded-full bg-amber-300 px-2.5 py-1 text-[8px] font-black text-blue-950 hover:bg-amber-200"
            >
              ⚡ 1-Click Executive Operations
            </a>
            <Link
              to="/operations-centre"
              className="rounded-full bg-white px-2.5 py-1 text-[8px] font-black text-purple-950 hover:bg-purple-50"
            >
              ★ Executive Operations Centre
            </Link>
            <a
              href="#infinity-core-engine"
              className="rounded-full bg-white/20 px-2.5 py-1 text-[8px] font-black text-white hover:bg-white/30"
            >
              ⚡ Infinity Core Engine
            </a>
            <a
              href="#business-health-intelligence"
              className="rounded-full bg-white/20 px-2.5 py-1 text-[8px] font-black text-white hover:bg-white/30"
            >
              ★ Business Health &amp; Compliance Intelligence
            </a>
            <a
              href="#live-workspace"
              className="rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-extrabold text-white hover:bg-white/25"
            >
              1. Live Office &amp; Profile Workspace
            </a>
            <a
              href="#screen-by-screen-audit"
              className="rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-extrabold text-white hover:bg-white/25"
            >
              2. 45-Screen 2026 Smart-Fill Audit
            </a>
            <a
              href="#pricing"
              className="rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-extrabold text-white hover:bg-white/25"
            >
              3. Smart Enhanced Plans ($660–$1,035/mo)
            </a>
            <Link
              to="/login"
              className="rounded-full bg-white/20 px-2.5 py-1 text-[8px] font-black text-white hover:bg-white/30"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-1 rounded-full bg-amber-300 px-3 py-1 text-[8.5px] font-black text-blue-950 shadow-sm hover:bg-amber-200"
            >
              Start $0 Free Trial <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </header>

      {/* Flagship Sales Hero Ribbon: Why Every Provider Needs a ComplianceHR Infinity Subscription */}
      <section className="rounded-2xl border-2 border-purple-600 bg-gradient-to-r from-blue-50/90 via-white to-pink-50/90 p-2 sm:p-2.5 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center">
          <div className="lg:col-span-3 flex flex-col items-center justify-center rounded-xl border-2 border-purple-400 bg-white p-2 text-center shadow-sm">
            <div className="h-24 sm:h-28 w-full flex items-center justify-center">
              <Image
                src={CHR_LOGO}
                alt="ComplianceHR Infinity Logo"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="mt-1 text-[10px] font-black text-blue-950">
              Software: ComplianceHR Infinity
            </div>
            <div className="text-[8px] font-extrabold text-purple-800">
              Complete Control. Greater Confidence. Brighter Success.
            </div>
            <div className="mt-0.5 text-[7.5px] font-bold text-pink-700">
              Developer: Kristy Lee Whelan · kristyleebatkin@live.com.au
            </div>
          </div>

          <div className="lg:col-span-6 space-y-1">
            <div className="flex flex-wrap items-center gap-1">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-white"
                style={{ background: SQUISHED_GRADIENT }}
              >
                <Sparkles className="h-2.5 w-2.5 text-amber-200" /> The All-In-One NDIS, HR, Safety &amp; Operations Super-Platform
              </span>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[7.5px] font-black text-white">
                14-DAY FREE TRIAL · $0 UPFRONT
              </span>
            </div>

            <h1 className="font-editorial text-lg sm:text-2xl font-black leading-tight text-blue-950">
              Why Every Provider Needs a{' '}
              <span className="font-editorial-italic bg-gradient-to-r from-blue-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                ComplianceHR Infinity Monthly Subscription
              </span>
            </h1>

            <p className="text-[8.5px] font-bold leading-snug text-blue-950">
              Stop juggling disconnected spreadsheets, HR folders, rostering apps, and last-minute audit panic. **ComplianceHR Infinity** unites **45 live operational modules**, **16 Communication Centre modulars**, **100+ automated server functions**, **65+ 24/7 workflows**, a **Dual Interactive Office &amp; Profile Workspace**, and our **Professional Business Compliance Documents Package ($999 Outright or $125/month on a 24-month plan — 125+ Documents + Master Audit Checklists `CHR-AUD-001` &amp; `CHR-AUD-002`)** into one Smart Enhanced All-In-One Compliance Pack.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 pt-0.5">
              {[
                { label: 'Dual Office + Profile Views', sub: 'Interactive Wall & Modular Picker', color: '#2563eb' },
                { label: '$999 Outright or $125/mo Docs', sub: '125+ Docs · 24-Mo Plan Option', color: '#7c3aed' },
                { label: '+$160/mo Elite Pack Built-In', sub: '2,500 Msg & 20,000 Int. Credits', color: '#db2777' },
                { label: 'Audit-Ready Every Day', sub: '1-Click Evidence & Board PDFs', color: '#16a34a' },
              ].map((pill) => (
                <div
                  key={pill.label}
                  className="rounded-lg border bg-white px-2 py-1 shadow-sm"
                  style={{ borderColor: pill.color, borderLeftWidth: '3px' }}
                >
                  <div className="text-[8px] font-black text-blue-950 leading-tight">{pill.label}</div>
                  <div className="text-[7px] font-bold text-purple-800 leading-tight">{pill.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col justify-between gap-1.5 rounded-xl border-2 border-pink-500 bg-white p-2 shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-pink-600 px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-white">
                  Smart Enhanced All-In-One
                </span>
                <span className="text-[7.5px] font-black text-purple-900">+$160 Elite Included</span>
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-[8px] font-bold text-purple-800">From</span>
                <span className="font-editorial text-2xl font-black text-blue-950">$660</span>
                <span className="text-[8px] font-bold text-purple-800">/ month</span>
              </div>
              <div className="text-[7.2px] font-extrabold text-blue-900">
                ($500 base + $160/mo Elite Pack · Up to 20 users)
              </div>
              <ul className="mt-1 space-y-0.5 text-[7.3px] font-bold text-blue-950">
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                  <span>Includes $999 / $125m Docs Suite Free</span>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-blue-600" />
                  <span>2,500 Message &amp; 20,000 Integration Credits</span>
                </li>
                <li className="flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 shrink-0 text-purple-600" />
                  <span>All 45 Modules + 14-Day $0 Free Trial</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <Link
                to="/register"
                className="flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[8px] font-black text-white shadow-sm"
                style={{ background: SQUISHED_GRADIENT }}
              >
                Start $0 Trial <ArrowRight className="h-2.5 w-2.5" />
              </Link>
              <a
                href="#pricing"
                className="flex items-center justify-center rounded-lg border border-purple-400 bg-purple-50 px-2 py-1.5 text-[8px] font-black text-purple-950 hover:bg-purple-100"
              >
                Compare All 6 Tiers
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Flagship Infinity Control Centre (356 Audit Checkpoints · 98 Docs · Approvals · Role Governance) */}
      <div id="infinity-control-centre" className="scroll-mt-16">
        <InfinityControlCentreMasterSuite />
      </div>

      {/* Flagship Infinity One-Click Operations & Executive Command Deck */}
      <InfinityOneClickOperations />

      {/* Flagship Infinity Core Engine (104 Functions · 65 Workflows · Real-Time Validation & Smart-Fill) */}
      <InfinityCoreEngine />

      {/* Flagship Business Health & Compliance Intelligence Dashboard */}
      <BusinessHealthComplianceIntelligenceDashboard />

      {/* Section 1: Interactive Executive Office + General Profile + Dual Master Compliance Audit Checklists */}
      <div id="live-workspace" className="scroll-mt-14">
        <ExecutiveWallScene showAllModulesMinimised={true} />
      </div>

      {/* Section 2: Full Review of Must-Have Functions, Resources, Features & Master Audit Checklist */}
      <MustHaveFunctionsReview />

      {/* Section 3: Comprehensive 45-Screen 2026 Smart-Fill Audit & 1-Click Task Completion Studio */}
      <ScreenByScreenMasterAudit2026 />

      {!embedded && (
        <>
          {/* Section 4: Smart Enhanced All-In-One Monthly Subscription Packages ($660–$1,035/mo including +$160/mo Elite Plan) */}
          <PricingSection />

          {/* Compact High-Converting Footer Bar */}
          <footer
            className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-10 items-center justify-center overflow-hidden rounded bg-white p-0.5">
                <Image src={CHR_LOGO} alt="ComplianceHR Infinity" fittingType="fit" className="h-full w-full object-contain" />
              </div>
              <div className="text-[8px] font-extrabold">
                <div>Software: ComplianceHR Infinity · Complete Control. Greater Confidence. Brighter Success.</div>
                <div className="text-amber-200">
                  Developer: Kristy Lee Whelan · North QLD · 0402 165 668 · kristyleebatkin@live.com.au
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <Link to="/report-complaint" className="rounded-full bg-white/15 px-2.5 py-0.5 text-[7.5px] font-extrabold text-white hover:bg-white/25">
                Public Complaint Portal
              </Link>
              <Link to="/volunteer-apply" className="rounded-full bg-white/15 px-2.5 py-0.5 text-[7.5px] font-extrabold text-white hover:bg-white/25">
                Volunteer Application
              </Link>
              <Link to="/register" className="rounded-full bg-amber-300 px-3 py-0.5 text-[8px] font-black text-blue-950">
                Start 14-Day Free Trial ($0 Upfront)
              </Link>
            </div>
          </footer>
        </>
      )}
    </div>
  );
}