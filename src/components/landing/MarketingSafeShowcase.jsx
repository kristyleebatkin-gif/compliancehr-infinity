import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Award,
  FileCheck2,
  Tv,
  Monitor,
  Radio,
} from 'lucide-react';
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
    tvChannel: 'CHANNEL 7 · LIVE HD',
    nowPlayingLabel: 'Now Playing on Channel 7 (Changes Every 30 Secs):',
    badge: 'Pack 1 · Smart Enhanced All-In-One Subscription',
    pricePrefix: 'From',
    priceMain: '$660',
    priceSuffix: '/ month ($7,920/yr)',
    subtitle: 'Up to 20 Users ($500 Base + $160 Elite Included) · Scales to 101+ Users',
    bullets: [
      '1. Includes +$160/mo Elite Plan (2,500 Message & 20,000 Integration Credits/mo)',
      '2. Includes $355 Master Compliance Audit Doc (17 Categories · 356 Checkpoints)',
      '3. All 46 Connected Modules + Dual Interactive Office & Profile Workspace Views',
      '4. Smart Rostering, NDIS Price-Guide Invoicing, Payroll & 24h/5d Incident Timers',
      '5. 14-Day $0 Upfront Free Trial + Consent-Gated External NDIS Auditor Portal',
    ],
    importantInfoTitle: 'Important Subscription Info & Accurate Tier Pricing',
    importantInfoRows: [
      'Up to 20 Users: $660/mo ($7,920/yr) · 21–30 Users: $723/mo ($8,670/yr)',
      '31–40 Users: $785/mo ($9,420/yr) · 41–50 Users: $848/mo ($10,170/yr)',
      '51–100 Users: $910/mo ($10,920/yr) · 101+ Users: $1,035/mo ($12,420/yr)',
      'Includes 2,500 Message Credits + 20,000 Integration Credits + $355 Audit Doc Free',
    ],
    primaryCta: { label: 'Start 14-Day Free Trial', to: '/register' },
    secondaryCta: { label: 'View All 6 User Tiers', href: '#pricing' },
  },
  {
    id: 'pack-2',
    icon: FileCheck2,
    tvChannel: 'CHANNEL 9 · LIVE HD',
    nowPlayingLabel: 'Now Playing on Channel 9 (Changes Every 30 Secs):',
    badge: 'Pack 2 · Outright Audit & Compliance Doc Pack',
    pricePrefix: 'Outright',
    priceMain: '$999',
    priceSuffix: 'or $125 / month',
    subtitle: 'Complete 125+ Document NDIS & Aged Care Library + $355 Master Audit Doc Free',
    bullets: [
      '1. Complete 125+ NDIS & Aged Care Policies, Procedures, Registers & Intake Forms',
      '2. Includes $355 Master Compliance Audit Doc (CHR-AUD-001 & CHR-AUD-002)',
      '3. 6 Structured Compliance Binders + 12 Printable A4 Executive Office Masters',
      '4. Smart-Fill Auto-Branding with Organisation Logo, ABN, NDIS Number & Signatories',
      '5. Instant 1-Click PDF & CSV Audit Evidence Packs Ready for NDIS Commission Audits',
    ],
    importantInfoTitle: 'Important Outright Package Info & Inclusions',
    importantInfoRows: [
      'One-Off Outright Purchase: $999 Total · Or Flexible $125/mo Payment Plan',
      'Includes Both CHR-AUD-001 (Governance) & CHR-AUD-002 (Workforce) ($355 Value)',
      'Covers All 17 NDIS Audit Categories & 356 Mandatory Verification Checkpoints',
      '100% Editable, Printable & Downloadable PDF/CSV Audit Packs with Lifetime Updates',
    ],
    primaryCta: { label: 'Select $999 Outright / $125m Pack', href: '#pricing' },
    secondaryCta: { label: 'Preview 125+ Audit Docs', to: '/compliance' },
  },
];

export default function MarketingSafeShowcase({ embedded = false }) {
  const [activeBenefitIdx, setActiveBenefitIdx] = useState(0);

  // Changes every 30 seconds to cycle through the 5 package benefits on Channel 7 & Channel 9
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBenefitIdx((prev) => (prev + 1) % 5);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={embedded ? 'w-full space-y-4' : 'w-full bg-white p-3 sm:p-4 space-y-4'}>
      {/* CENTERED "Why Every Provider Subscribes" */}
      <section
        className="w-full rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
          {/* Heading & Black Subtitle Inside Stretched App Design Coloured Border */}
          <div
            className="w-full rounded-2xl p-[4px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="w-full rounded-[12px] bg-white px-4 py-4 sm:px-6 sm:py-5 text-center space-y-2">
              <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug">
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
                className="mx-auto max-w-4xl text-center text-xs sm:text-sm font-extrabold leading-relaxed text-black"
                style={{ color: '#000000' }}
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
              className="gradient-brand flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(1), color: '#FFFFFF' }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Sparkles className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>
                Executive Marketing &amp; Sales Suite · 14-Day Free Trial
              </span>
            </div>
          </div>

          {/* 4 High-Impact Subscriber Value Tiles Inside Small Flat Screen Monitors */}
          <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: '46 Live Modules', sub: '100% Connected · From $660/mo' },
              { icon: Zap, title: '2-Min Audits', sub: 'Instant PDF Pack · $355 Doc Free' },
              { icon: Award, title: '356 Checkpoints', sub: '125+ Master Docs · $999 Outright' },
              { icon: Sparkles, title: 'AI Smart-Fill', sub: 'Zero Double-Entry · +$160/m Elite' },
            ].map((p, idx) => {
              const Icon = p.icon;
              const sym = getSymbolView(idx + 1);
              const borderCol = getAppBorderView(idx + 1);
              const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
              return (
                <div key={p.title} className="flex flex-col items-center">
                  {/* Small Flat Screen Monitor Frame */}
                  <div
                    className="w-full rounded-2xl border-[3px] bg-[#0A2B6D] p-2 shadow-md"
                    style={{ borderColor: borderCol }}
                  >
                    {/* Top Monitor Bezel Bar */}
                    <div className="mb-1.5 flex items-center justify-between px-2">
                      <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                        <Monitor className="h-2.5 w-2.5 text-[#00C6FF]" />
                        FLAT SCREEN 0{idx + 1}
                      </span>
                      <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                    </div>

                    {/* Inner Monitor Display */}
                    <div
                      className="rounded-xl p-[2.5px]"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="flex items-center justify-center gap-2.5 rounded-[10px] px-3 py-2.5 text-left text-[#0A2B6D]"
                        style={{ background: sprayBg }}
                      >
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                          style={{ borderColor: borderCol }}
                        >
                          <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs sm:text-sm font-extrabold leading-tight text-[#0A2B6D]">
                            {p.title}
                          </div>
                          <div className="text-[11px] font-bold leading-tight text-black" style={{ color: '#000000' }}>
                            {p.sub}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Flat Screen Monitor Stand Neck & Base */}
                  <div className="h-2 w-6 bg-[#0A2B6D]" />
                  <div
                    className="h-1.5 w-16 rounded-full border border-[#0A2B6D]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  />
                </div>
              );
            })}
          </div>

          {/* Pack 1 (Channel 7 TV) & Pack 2 (Channel 9 TV) — Lined Up & Designed the Exact Same with Important Info Below Screen */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
            {PACKS.map((pack, pIdx) => {
              const PackIcon = pack.icon;
              const currentSpotlight = pack.bullets[activeBenefitIdx % pack.bullets.length];
              return (
                <div
                  key={pack.id}
                  className="flex h-full rounded-2xl p-[4px] shadow-sm"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex h-full w-full flex-col justify-between rounded-[12px] bg-white p-4 sm:p-5 text-center space-y-3.5">
                    {/* Top Aligned Header Badge */}
                    <div
                      className="w-full rounded-full p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <span
                        className="gradient-brand inline-flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                        style={{ background: getHeaderView(pIdx * 2 + 2), color: '#FFFFFF' }}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                          <PackIcon className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                        </span>
                        <span style={{ color: '#FFFFFF' }}>{pack.badge}</span>
                      </span>
                    </div>

                    {/* Widescreen TV Screen: Channel 7 on TV 1, Channel 9 on TV 2 */}
                    <div className="flex w-full flex-col items-center">
                      <div
                        className="flex w-full flex-col justify-between rounded-[22px] border-[4px] bg-[#0A2B6D] p-3 shadow-lg"
                        style={{ borderColor: getAppBorderView(pIdx) }}
                      >
                        {/* Top TV Bezel Status Bar */}
                        <div className="mb-2 flex items-center justify-between px-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                            <Tv className="h-3.5 w-3.5 text-[#00C6FF]" />
                            {pack.tvChannel}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-0.5 text-[9px] font-extrabold text-white">
                            <Radio className="h-2.5 w-2.5 text-[#FF2E9A]" />
                            30s Auto-Cycle · Benefit {(activeBenefitIdx % 5) + 1} of 5
                          </span>
                        </div>

                        {/* Inner TV Screen */}
                        <div
                          className="flex flex-col justify-between rounded-2xl p-[3px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div
                            className="flex flex-col justify-between rounded-[13px] p-3 text-left space-y-2.5"
                            style={{ background: SPRAY_BGS[pIdx % SPRAY_BGS.length] }}
                          >
                            {/* 30-Second Changing Spotlight Banner on Channel 7 / Channel 9 */}
                            <div
                              className="w-full rounded-xl p-[2px] shadow-2xs"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            >
                              <div
                                className="gradient-brand flex min-h-[58px] items-center justify-between gap-2 rounded-[9px] px-3 py-2 text-white"
                                style={{ background: getHeaderView((activeBenefitIdx + pIdx) % 8), color: '#FFFFFF' }}
                              >
                                <div className="min-w-0 flex-1">
                                  <div
                                    className="text-[9.5px] font-extrabold uppercase tracking-wider text-white"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    {pack.nowPlayingLabel}
                                  </div>
                                  <div
                                    className="text-xs font-extrabold leading-snug text-white"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    {currentSpotlight}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveBenefitIdx((prev) => (prev + 1) % 5)}
                                  className="shrink-0 rounded-full border border-white bg-white/20 px-2.5 py-0.5 text-[9.5px] font-extrabold text-white hover:bg-white/30"
                                  style={{ color: '#FFFFFF' }}
                                >
                                  Next ▸
                                </button>
                              </div>
                            </div>

                            {/* All 5 Package Benefits Listed on the TV Screen */}
                            <ul className="grid w-full grid-cols-1 gap-1.5 text-left text-xs font-extrabold">
                              {pack.bullets.map((line, idx) => {
                                const sym = getSymbolView(pIdx * 3 + idx);
                                const borderCol = getAppBorderView(pIdx * 3 + idx);
                                const isCurrent = idx === activeBenefitIdx % 5;
                                return (
                                  <li
                                    key={line}
                                    onClick={() => setActiveBenefitIdx(idx)}
                                    className="cursor-pointer rounded-xl p-[2px] shadow-2xs transition-all"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <div
                                      className={`flex min-h-[38px] items-center gap-2 rounded-[9px] px-2.5 py-1.5 ${
                                        isCurrent ? 'bg-white ring-2 ring-[#FF2E9A]' : 'bg-white/95'
                                      }`}
                                    >
                                      <span
                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white"
                                        style={{ borderColor: borderCol }}
                                      >
                                        <CheckCircle2 className="h-3 w-3" style={{ color: sym.iconColor }} />
                                      </span>
                                      <span className="flex-1 text-[11px] font-extrabold leading-snug text-[#0A2B6D]">
                                        {line}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>

                        {/* Bottom TV Speaker Bar & Channel Dots */}
                        <div className="mt-2 flex items-center justify-between px-3">
                          <span className="text-[9px] font-extrabold tracking-widest text-white/80">
                            {pack.tvChannel} · COMPLIANCEHR TV
                          </span>
                          <div className="flex items-center gap-1.5">
                            {[0, 1, 2, 3, 4].map((dot) => (
                              <button
                                key={dot}
                                type="button"
                                aria-label={`Show benefit ${dot + 1}`}
                                onClick={() => setActiveBenefitIdx(dot)}
                                className={`h-2 w-2 rounded-full transition-all ${
                                  activeBenefitIdx % 5 === dot ? 'bg-[#FF2E9A] scale-125' : 'bg-white/40'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* TV Pedestal Neck & Stand Base */}
                      <div className="h-2.5 w-12 bg-[#0A2B6D]" />
                      <div
                        className="h-2 w-28 rounded-full border-2 border-[#0A2B6D] shadow-sm"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      />
                    </div>

                    {/* Important Package Info & Accurate Prices Placed Directly BELOW the TV Screen */}
                    <div
                      className="flex w-full flex-1 flex-col justify-between rounded-2xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="flex h-full flex-col justify-between rounded-[13px] p-3.5 text-center space-y-2.5"
                        style={{ background: SPRAY_BGS[(pIdx + 1) % SPRAY_BGS.length] }}
                      >
                        {/* Price Box Inside App Design Coloured Border */}
                        <div
                          className="w-full rounded-xl p-[2.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[76px] flex-col items-center justify-center rounded-[9px] bg-white px-3 py-2">
                            <div className="flex flex-wrap items-baseline justify-center gap-2">
                              <span className="text-xs font-extrabold uppercase text-[#0072FF]">
                                {pack.pricePrefix}
                              </span>
                              <span
                                className="font-editorial text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent"
                                style={{ backgroundImage: getTitleGradientView(pIdx) }}
                              >
                                {pack.priceMain}
                              </span>
                              <span className="text-xs font-extrabold text-[#5A00D6]">
                                {pack.priceSuffix}
                              </span>
                            </div>
                            <p
                              className="mt-1 text-center text-[11px] font-extrabold text-black"
                              style={{ color: '#000000' }}
                            >
                              {pack.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Important Info Header & Aligned Bullet Rows Below Screen */}
                        <div className="space-y-1.5 text-left">
                          <div
                            className="w-full rounded-lg p-[2px]"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          >
                            <div
                              className="gradient-brand rounded-[6px] px-3 py-1 text-center text-[10.5px] font-extrabold uppercase tracking-wider text-white"
                              style={{ background: getHeaderView(pIdx + 4), color: '#FFFFFF' }}
                            >
                              {pack.importantInfoTitle}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-1">
                            {pack.importantInfoRows.map((info) => (
                              <div
                                key={info}
                                className="flex min-h-[30px] items-center gap-1.5 rounded-lg border border-[#0A2B6D]/25 bg-white px-2.5 py-1 text-[10.5px] font-extrabold text-black"
                                style={{ color: '#000000' }}
                              >
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-[#5A00D6]" />
                                <span className="text-black" style={{ color: '#000000' }}>{info}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Action Buttons Lined Up at Bottom */}
                    <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {pack.primaryCta.to ? (
                        <Link
                          to={pack.primaryCta.to}
                          className="gradient-brand inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                          style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <ArrowRight className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                          <span style={{ color: '#FFFFFF' }}>{pack.primaryCta.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={pack.primaryCta.href}
                          className="gradient-brand inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                          style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <ArrowRight className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                          <span style={{ color: '#FFFFFF' }}>{pack.primaryCta.label}</span>
                        </a>
                      )}

                      {pack.secondaryCta.to ? (
                        <Link
                          to={pack.secondaryCta.to}
                          className="gradient-brand inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                          style={{ background: getHeaderView(3), color: '#FFFFFF' }}
                        >
                          <span style={{ color: '#FFFFFF' }}>{pack.secondaryCta.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={pack.secondaryCta.href}
                          className="gradient-brand inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                          style={{ background: getHeaderView(3), color: '#FFFFFF' }}
                        >
                          <span style={{ color: '#FFFFFF' }}>{pack.secondaryCta.label}</span>
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