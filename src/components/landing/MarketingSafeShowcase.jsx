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
  getHeaderView,
  getTitleGradientView,
  getSubheaderColourView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

const PACKS = [
  {
    id: 'pack-1',
    icon: Sparkles,
    badge: 'Pack 1 · Smart Enhanced All-In-One Subscription',
    pricePrefix: 'From',
    priceMain: '$660',
    priceSuffix: '/ month',
    subtitle: 'All 46 live modules + $160/mo Elite Engine Suite + $355 Master Audit Document included',
    bullets: [
      'Includes +$160/mo Elite Automation & Intelligence Pack',
      'Includes $355 Master Compliance Audit Checklist (356 Checkpoints)',
      'Unlimited Staff, Participant & Auditor Portal Workflows',
    ],
    primaryCta: { label: 'Start 14-Day Free Trial', to: '/register' },
    secondaryCta: { label: 'View Tier Pricing', href: '#pricing' },
  },
  {
    id: 'pack-2',
    icon: FileCheck2,
    badge: 'Pack 2 · Outright Audit & Compliance Doc Pack',
    pricePrefix: 'Outright',
    priceMain: '$999',
    priceSuffix: 'or $125 / month',
    subtitle: 'Complete 98-Document NDIS & Aged Care Audit Library + $355 Master Audit Checklist',
    bullets: [
      'All 98 NDIS & Aged Care Policies, Registers & Intake Forms',
      'Includes $355 Master Audit Checklist (CHR-AUD-001 & 002)',
      '12 Printable A4 Office Masters + Smart-Fill Auto-Branding',
    ],
    primaryCta: { label: 'Select $999 Outright / $125m Pack', href: '#pricing' },
    secondaryCta: { label: 'Preview Audit Docs', to: '/compliance' },
  },
];

export default function MarketingSafeShowcase({ embedded = false }) {
  return (
    <div className={embedded ? 'w-full space-y-4' : 'w-full bg-white p-3 sm:p-4 space-y-4'}>
      {/* CENTERED "Why Every Provider Subscribes" */}
      <section
        className="w-full rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
          {/* Heading & Subtitle Inside Stretched App Design Coloured Border */}
          <div
            className="w-full rounded-2xl border-2 border-[#0A2B6D] p-3 sm:p-4 shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-white px-5 py-4 sm:px-8 sm:py-5 text-center space-y-2">
              <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight">
                <span className="text-[#0A2B6D]">Why Every Provider Subscribes to </span>
                <span className="text-[#0A2B6D]">Compliance</span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  HR
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </h2>

              <p
                className="mx-auto max-w-4xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed"
                style={{ color: getSubheaderColourView(1) }}
              >
                Replace 8 disconnected software subscriptions with one connected super-platform uniting all 46 live modules, 1-Click Operations, Screen-by-Screen 2026 Smart-Fill Audits, Business Health Intelligence, Core Risk &amp; Roster Engines, and our Outright Audit &amp; Compliance Doc Pack.
              </p>
            </div>
          </div>

          {/* Stretched Side-to-Side Banner Underneath in App Design Coloured Border */}
          <div
            className="w-full rounded-full p-[3px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(1) }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </span>
              <span className="text-center">Executive Marketing &amp; Sales Suite · 14-Day Free Trial</span>
            </div>
          </div>

          {/* 4 High-Impact Subscriber Value Pills in Pink, Blue & Purple Spray + App Design Coloured Borders */}
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: ShieldCheck, title: '46 Live Modules', sub: '100% Connected' },
              { icon: Zap, title: '2-Min Audits', sub: 'Instant PDF Pack' },
              { icon: Award, title: '356 Checkpoints', sub: '98 Master Docs' },
              { icon: Sparkles, title: 'AI Smart-Fill', sub: 'Zero Double-Entry' },
            ].map((p, idx) => {
              const Icon = p.icon;
              const sym = getSymbolView(idx + 1);
              const borderCol = getAppBorderView(idx + 1);
              const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
              return (
                <div
                  key={p.title}
                  className="rounded-2xl p-[3px] shadow-sm"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex h-full items-center justify-center gap-2.5 rounded-[13px] px-4 py-3 text-left text-[#0A2B6D]"
                    style={{ background: sprayBg }}
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                      style={{ borderColor: borderCol }}
                    >
                      <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-extrabold leading-tight text-[#0A2B6D]">
                        {p.title}
                      </div>
                      <div className="text-[11px] font-bold leading-tight text-[#0A2B6D]">
                        {p.sub}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pack 1 and Pack 2 — App Design Coloured Borders & Spray Bullet Tiles */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
            {PACKS.map((pack, pIdx) => {
              const PackIcon = pack.icon;
              return (
                <div
                  key={pack.id}
                  className="flex h-full rounded-2xl p-[4px] shadow-sm"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex h-full w-full flex-col items-center justify-between rounded-[12px] bg-white p-5 text-center">
                    <div className="flex flex-1 flex-col items-center justify-between w-full space-y-3">
                      <div
                        className="w-full rounded-full p-[2.5px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <span
                          className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full px-5 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                          style={{ background: getHeaderView(pIdx * 2 + 2) }}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                            <PackIcon className="h-3 w-3 text-white" />
                          </span>
                          <span>{pack.badge}</span>
                        </span>
                      </div>

                      <div className="flex items-baseline justify-center gap-2 pt-1">
                        <span className="text-xs font-extrabold uppercase text-[#0072FF]">
                          {pack.pricePrefix}
                        </span>
                        <span
                          className="font-editorial text-3xl sm:text-4xl font-extrabold bg-clip-text text-transparent"
                          style={{ backgroundImage: getTitleGradientView(pIdx) }}
                        >
                          {pack.priceMain}
                        </span>
                        <span className="text-xs font-extrabold text-[#5A00D6]">
                          {pack.priceSuffix}
                        </span>
                      </div>

                      <p className="text-xs font-extrabold text-[#0A2B6D]">
                        {pack.subtitle}
                      </p>

                      <ul className="grid w-full grid-cols-1 auto-rows-fr gap-2 pt-1 text-left text-xs font-extrabold">
                        {pack.bullets.map((line, idx) => {
                          const sym = getSymbolView(pIdx * 3 + idx);
                          const borderCol = getAppBorderView(pIdx * 3 + idx);
                          const sprayBg = SPRAY_BGS[(pIdx * 3 + idx) % SPRAY_BGS.length];
                          return (
                            <li
                              key={line}
                              className="flex h-full rounded-2xl p-[2.5px] shadow-2xs"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            >
                              <div
                                className="flex h-full w-full items-center gap-2.5 rounded-[13px] px-3.5 py-2 text-[#0A2B6D]"
                                style={{ background: sprayBg }}
                              >
                                <span
                                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white"
                                  style={{ borderColor: borderCol }}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                                </span>
                                <span className="text-[#0A2B6D]">{line}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="mt-4 grid w-full grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {pack.primaryCta.to ? (
                        <Link
                          to={pack.primaryCta.to}
                          className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                          style={{ background: getHeaderView(0) }}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <ArrowRight className="h-3 w-3 text-white" />
                          </span>
                          <span>{pack.primaryCta.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={pack.primaryCta.href}
                          className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                          style={{ background: getHeaderView(0) }}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <ArrowRight className="h-3 w-3 text-white" />
                          </span>
                          <span>{pack.primaryCta.label}</span>
                        </a>
                      )}

                      {pack.secondaryCta.to ? (
                        <Link
                          to={pack.secondaryCta.to}
                          className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                          style={{ background: getHeaderView(3) }}
                        >
                          <span>{pack.secondaryCta.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={pack.secondaryCta.href}
                          className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                          style={{ background: getHeaderView(3) }}
                        >
                          <span>{pack.secondaryCta.label}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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