import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ShieldCheck, ClipboardCheck, Layers, ArrowRight, CheckCircle2, Building2, Users,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import ExecutiveWallScene, { SQUISHED_GRADIENT } from '@/components/safe/ExecutiveWallScene';
import MustHaveFunctionsReview from '@/components/landing/MustHaveFunctionsReview';
import PricingSection from '@/components/landing/PricingSection';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';
const CHOICES_NQ_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/7772df0fa_generated_image.png';

export default function MarketingSafeShowcase() {
  return (
    <div className="w-full bg-white p-1 space-y-1.5">
      {/* Sticky High-Converting Sales Navigation + Pitch Header */}
      <header
        className="sticky top-0 z-40 rounded-xl border-2 border-amber-300 px-3 py-1.5 text-white shadow-md"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Dual Brand Logos + Main Headline */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
                <Image
                  src={CHR_LOGO}
                  alt="ComplianceHR Infinity"
                  fittingType="fit"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex h-10 w-14 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
                <Image
                  src={CHOICES_NQ_LOGO}
                  alt="Choices NQ"
                  fittingType="fit"
                  className="h-full w-full object-contain"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  ComplianceHR Infinity &amp; Choices NQ · Super-Platform
                </span>
                <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[8px] font-black text-blue-950">
                  $355 MASTER AUDIT DOC INCLUDED FREE IN PLANS
                </span>
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-black text-white">
                  ELITE PLAN: $160 / MO
                </span>
              </div>
              <p className="text-[8.5px] font-bold text-amber-100">
                Complete Control. Greater Confidence. Brighter Success. · 45 Connected Modules · 17 Audit Categories · 356 Checkpoints · $0 Upfront Trial
              </p>
            </div>
          </div>

          {/* Quick Jump Navigation & CTAs */}
          <div className="flex flex-wrap items-center gap-1">
            <a
              href="#live-workspace"
              className="rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-extrabold text-white hover:bg-white/25"
            >
              1. Live Office &amp; Profile Workspace
            </a>
            <a
              href="#must-haves"
              className="rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-extrabold text-white hover:bg-white/25"
            >
              2. Must-Have Functions &amp; $355 Doc
            </a>
            <a
              href="#pricing"
              className="rounded-full bg-white/15 px-2.5 py-1 text-[8px] font-extrabold text-white hover:bg-white/25"
            >
              3. Monthly Subscriptions ($160 Elite)
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

      {/* Section 1: Interactive Executive Office + General Profile + $355 Dual Master Compliance Audit Checklists */}
      <div id="live-workspace" className="scroll-mt-14">
        <ExecutiveWallScene showAllModulesMinimised={true} />
      </div>

      {/* Section 2: Full Review of Must-Have Functions, Resources, Features & $355 Master Audit Checklist */}
      <MustHaveFunctionsReview />

      {/* Section 3: Fair Monthly Subscription Packages & Listed Benefits (Anchored on $160/mo Elite Plan & $355 Doc) */}
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
    </div>
  );
}