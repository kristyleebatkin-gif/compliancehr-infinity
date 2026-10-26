import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, Sparkles, ShieldCheck, Zap, Layers,
  ClipboardCheck, Lock, RefreshCw, DollarSign,
} from 'lucide-react';
import {
  getHeaderView,
  getTitleGradientView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const UNIFORM_SPRAY_BG =
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF';

// All $355 price points removed & equalized length for horizontal alignment
export const COMPLIANCE_HR_PACKAGES = [
  {
    id: 'tier-20',
    name: 'Smart Enhanced Elite · Up to 20 Users',
    badge: 'Most Popular · +$160 Elite Included',
    users: 'Up to 20 users',
    previousMonthly: 500,
    eliteAddon: 160,
    monthly: 660,
    yearly: 7920,
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    featured: true,
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'All 46 ComplianceHR Infinity Modules + Dual Office & Profile Views',
      'Employee & Participant Profiles, NDIS Screening & 3-Part Consents',
      '16 Communication Modulars, Shared To-Do Command & 1-Click Audit Packs',
      '14-day $0 upfront free trial — test everything before scaling',
    ],
  },
  {
    id: 'tier-30',
    name: 'Smart Enhanced Elite · 21–30 Users',
    badge: '+$160 Elite Pack Included',
    users: '21–30 users',
    previousMonthly: 563,
    eliteAddon: 160,
    monthly: 723,
    yearly: 8670,
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002)',
      'Full 46-Module Smart Enhanced All-In-One Compliance Pack for 21–30 users',
      'Smart Rostering, Shift Notes, NDIS Price Guide Invoicing & Payroll',
      '24h / 5d NDIS Reportable Incident Timers, Risk Matrix & Take-5 Checks',
      'HR Paperwork Hub, LMS Training Academy & AI Course/Quiz Builder',
    ],
  },
  {
    id: 'tier-40',
    name: 'Smart Enhanced Elite · 31–40 Users',
    badge: '+$160 Elite Pack Included',
    users: '31–40 users',
    previousMonthly: 625,
    eliteAddon: 160,
    monthly: 785,
    yearly: 9420,
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'Complete Smart Enhanced All-In-One Compliance Pack for 31–40 users',
      'Automated 30-Action & 30-Completed-Task PDF/CSV Audit Batch Reports',
      'Company Safe, Smart Document Vault, Read-Receipts & Expiry Calendars',
      'Staff ID Badge Studio, Key Contacts & Automated Compliance Reminders',
    ],
  },
  {
    id: 'tier-50',
    name: 'Smart Enhanced Elite · 41–50 Users',
    badge: '+$160 Elite Pack Included',
    users: '41–50 users',
    previousMonthly: 688,
    eliteAddon: 160,
    monthly: 848,
    yearly: 10170,
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002)',
      'Complete Smart Enhanced All-In-One Compliance Pack for 41–50 users',
      'Multi-team Rostering, Labour Forecasting, Coverage Heatmap & Exceptions',
      'Quotes, Receipt Scanner, Bank Reconciliation & 3-Way Procurement Match',
      'Consent-gated External NDIS Auditor Portal & Weekly Board Reports',
    ],
  },
  {
    id: 'tier-100',
    name: 'Smart Enhanced Elite · 51–100 Users',
    badge: '+$160 Elite Pack Included',
    users: '51–100 users',
    previousMonthly: 750,
    eliteAddon: 160,
    monthly: 910,
    yearly: 10920,
    messageCredits: '2,500+ message credits / mo',
    integrationCredits: '20,000+ integration credits / mo',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'Complete Smart Enhanced All-In-One Compliance Pack for 51–100 users',
      '65+ Live Automated Workflows & 100+ Server Functions running 24/7',
      'Departmental Compliance Dashboards, KPI Auto-Calc & Risk Heatmaps',
      'Full HR File Completeness Tracking, 360° Appraisals & Volunteer Hub',
    ],
  },
  {
    id: 'tier-101-plus',
    name: 'Smart Enhanced Elite · 101+ Users',
    badge: 'Enterprise · +$160 Elite Included',
    users: '101+ users',
    previousMonthly: 875,
    eliteAddon: 160,
    monthly: 1035,
    yearly: 12420,
    messageCredits: '2,500+ message credits / mo',
    integrationCredits: '20,000+ integration credits / mo',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002)',
      'Enterprise Smart Enhanced All-In-One Compliance Pack for 101+ users',
      'Unlimited Multi-Site Governance, Auditor Portal & Executive Wall Scenes',
      'Custom Modular Screen & Data Selector across all organisational branches',
      'Priority onboarding, bulk intake migration & dedicated compliance support',
    ],
  },
];

export const CORE_PLATFORM_BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Smart Enhanced All-In-One Pack (+$160/mo Elite Included)',
    desc: 'Every tier includes the $160/mo Elite Plan (2,500 message credits & 20,000 integration credits) plus the Master Compliance Audit Suite.',
  },
  {
    icon: ClipboardCheck,
    title: 'Master Compliance Audit Suite Included Free',
    desc: 'Both ComplianceHR Infinity Governance (CHR-AUD-001) & Workforce Operations (CHR-AUD-002) 11-page, 17-category, 356-checkpoint audit documents included.',
  },
  {
    icon: Layers,
    title: 'All 46 Connected Modules + Dual Views',
    desc: 'Switch seamlessly between the Enhanced Executive Office View and General Profile View with custom modular screen selectors.',
  },
  {
    icon: Zap,
    title: '14-Day Free Trial ($0 Upfront Test Mode)',
    desc: 'Build and test your application with zero upfront costs, then scale into the Smart Enhanced All-In-One tier that matches your team size.',
  },
  {
    icon: Lock,
    title: 'Strict Role-Based NDIS & HR Security',
    desc: 'Granular permissions across 115+ entities for Admins, Team Leaders, Support Workers, Finance, HR, Participants and Auditors.',
  },
  {
    icon: RefreshCw,
    title: '65+ Workflows & 100+ Server Functions',
    desc: '20,000 integration credits power automated NDIS timers, expiry scans, shift alerts, 30-action reports, and AI copilots.',
  },
];

export default function PricingSection() {
  const [billing, setBilling] = useState('monthly');

  return (
    <section
      id="pricing"
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* Enlarged Transparent Pricing Header Fitted Cleanly in App Design Border + Black Writing Underneath (No $355 Reference) */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex flex-col items-center justify-center rounded-[12px] bg-white px-5 py-5 sm:px-8 sm:py-6 text-center space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#0A2B6D]">Transparent Pricing with </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                +$160/mo Elite Plan
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                &amp; Master Audit Suite Included
              </span>
            </h2>
            <p
              className="mx-auto max-w-4xl text-center text-xs sm:text-sm md:text-base font-extrabold text-black"
              style={{ color: '#000000' }}
            >
              Every user tier includes 2,500 Message Credits, 20,000 Integration Credits, and the Master Compliance Audit Checklist (CHR-AUD-001 &amp; CHR-AUD-002).
            </p>
          </div>
        </div>

        {/* Monthly & Annual Tiles With Minimised Gap & Matched Design, Lined Up Together With Side-to-Side Smart Enhanced Tile */}
        <div className="w-full space-y-2">
          <div className="grid w-full grid-cols-2 gap-1.5">
            <div
              className="rounded-full p-[2.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold text-white transition-all ${
                  billing === 'monthly' ? 'ring-2 ring-[#0A2B6D] shadow-md' : 'opacity-95 hover:opacity-100'
                }`}
                style={{ background: getHeaderView(0), color: '#FFFFFF' }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                  <Sparkles className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>Monthly Subscription</span>
              </button>
            </div>

            <div
              className="rounded-full p-[2.5px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={() => setBilling('yearly')}
                className={`gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold text-white transition-all ${
                  billing === 'yearly' ? 'ring-2 ring-[#0A2B6D] shadow-md' : 'opacity-95 hover:opacity-100'
                }`}
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                  <ShieldCheck className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>Annual Billing</span>
              </button>
            </div>
          </div>

          {/* Smart Enhanced Tile Stretched Side-to-Side & Lined Up with Monthly + Annual */}
          <div
            className="w-full rounded-full p-[2.5px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="gradient-brand flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(6), color: '#FFFFFF' }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <DollarSign className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>
                Smart Enhanced All-In-One Compliance Pack Pricing
              </span>
            </div>
          </div>
        </div>

        {/* 6 Smart Enhanced Subscription Cards Grid — Lined Up in All Sections, Price & Headers in App Design Colours, Centered Writing */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch text-center">
          {COMPLIANCE_HR_PACKAGES.map((pkg, pIdx) => {
            const displayPrice =
              billing === 'monthly'
                ? pkg.monthly.toLocaleString()
                : pkg.yearly.toLocaleString();
            return (
              <div
                key={pkg.id}
                className="flex h-full rounded-2xl p-[3.5px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full w-full flex-col justify-between rounded-[13px] p-4 text-center space-y-3"
                  style={{ background: UNIFORM_SPRAY_BG }}
                >
                  <div className="flex flex-1 flex-col justify-between space-y-2.5">
                    {/* Fixed-Height Top Badges Row */}
                    <div className="flex h-[32px] items-center justify-between gap-2">
                      <span
                        className="gradient-brand rounded-full border border-[#0A2B6D] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                        style={{ background: getHeaderView(pIdx), color: '#FFFFFF' }}
                      >
                        {pkg.badge}
                      </span>
                      <span className="rounded-full border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#5A00D6]">
                        {pkg.users}
                      </span>
                    </div>

                    {/* Strict Fixed-Height Title & Price Box in App Design Colours So Every Card Lines Up */}
                    <div
                      className="w-full rounded-xl p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex h-[112px] flex-col items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center space-y-1">
                        <h3
                          className="font-editorial text-sm sm:text-base font-extrabold leading-tight bg-clip-text text-transparent text-center"
                          style={{ backgroundImage: getTitleGradientView(pIdx) }}
                        >
                          {pkg.name}
                        </h3>

                        <div className="flex flex-wrap items-baseline justify-center gap-1.5">
                          <span
                            className="font-editorial text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent"
                            style={{ backgroundImage: getTitleGradientView(pIdx + 1) }}
                          >
                            ${displayPrice}
                          </span>
                          <span className="text-xs font-extrabold text-[#0072FF]">
                            {billing === 'monthly'
                              ? `/ month ($${pkg.yearly.toLocaleString()}/yr)`
                              : `/ year ($${pkg.monthly}/mo)`}
                          </span>
                        </div>

                        <div className="text-[10.5px] font-extrabold text-[#5A00D6]">
                          ${pkg.previousMonthly}/mo Base + ${pkg.eliteAddon}/mo Elite Pack Included
                        </div>
                      </div>
                    </div>

                    {/* Strict Fixed-Height 2-Row Credit Pills */}
                    <div className="grid grid-cols-1 grid-rows-2 gap-1.5">
                      <div
                        className="rounded-full p-[2px]"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex h-[34px] items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-extrabold text-[#0A2B6D]">
                          <Zap className="h-3.5 w-3.5 text-[#0072FF]" />
                          <span>{pkg.messageCredits}</span>
                        </div>
                      </div>
                      <div
                        className="rounded-full p-[2px]"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex h-[34px] items-center justify-center gap-2 rounded-full bg-white px-3 text-xs font-extrabold text-[#5A00D6]">
                          <Layers className="h-3.5 w-3.5 text-[#FF2E9A]" />
                          <span>{pkg.integrationCredits}</span>
                        </div>
                      </div>
                    </div>

                    {/* Strict Fixed-Height 6-Row Benefits List So Every Package Card Lines Up Horizontally */}
                    <ul className="grid flex-1 grid-cols-1 grid-rows-6 gap-1.5 pt-0.5">
                      {pkg.benefits.map((b, bIdx) => {
                        const sym = getSymbolView(pIdx * 2 + bIdx);
                        return (
                          <li
                            key={b}
                            className="flex h-[54px] rounded-xl p-[2px] shadow-2xs"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          >
                            <div className="flex h-full w-full items-center justify-center gap-2 rounded-[9px] bg-white px-2.5 py-1 text-center text-[11px] font-extrabold leading-tight text-[#0A2B6D]">
                              <span
                                className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border bg-white"
                                style={{ borderColor: getAppBorderView(pIdx * 2 + bIdx) }}
                              >
                                <Check className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                              </span>
                              <span className="flex-1 text-center text-[#0A2B6D]">{b}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Fixed-Height Bottom CTA */}
                  <div className="pt-2.5 border-t border-[#0A2B6D]/20">
                    <Link
                      to="/register"
                      className="gradient-brand inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                      style={{ background: getHeaderView(pIdx + 1), color: '#FFFFFF' }}
                    >
                      <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                        <ArrowRight className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      </span>
                      <span style={{ color: '#FFFFFF' }}>Start 14-Day Free Trial</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 6 Included Platform Pillar Benefits Styled as iPad Screens with App-Design Coloured Writing & Spray Background */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-center items-stretch">
          {CORE_PLATFORM_BENEFITS.map((b, idx) => {
            const Icon = b.icon;
            const sym = getSymbolView(idx + 3);
            const borderCol = getAppBorderView(idx + 3);
            return (
              <div
                key={b.title}
                className="flex h-full flex-col justify-between rounded-[24px] border-[4px] bg-[#0A2B6D] p-2.5 shadow-md"
                style={{ borderColor: borderCol }}
              >
                {/* Top iPad Bezel */}
                <div className="mb-1.5 flex items-center justify-between px-2">
                  <span className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                    <span className="h-2 w-2 rounded-full bg-[#00C6FF]" />
                    iPad Screen · Price Pillar 0{idx + 1}
                  </span>
                  <span className="text-[8.5px] font-extrabold text-white/85">5G · 100%</span>
                </div>

                {/* Inner iPad Display — App-Design Coloured Writing & Spray Background */}
                <div
                  className="flex flex-1 rounded-[16px] p-[2.5px]"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-between gap-2 rounded-[13px] p-3.5 text-center"
                    style={{ background: UNIFORM_SPRAY_BG }}
                  >
                    <div
                      className="w-full rounded-xl p-[2px]"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex min-h-[48px] items-center justify-center gap-2 rounded-[9px] bg-white px-3 py-1.5 text-center">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                          style={{ borderColor: borderCol }}
                        >
                          <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                        </span>
                        <div
                          className="font-editorial text-xs sm:text-sm font-extrabold leading-tight bg-clip-text text-transparent"
                          style={{ backgroundImage: getTitleGradientView(idx) }}
                        >
                          {b.title}
                        </div>
                      </div>
                    </div>

                    <div className="flex min-h-[58px] w-full flex-1 items-center justify-center rounded-xl border border-[#0A2B6D]/20 bg-white/95 px-3 py-2 text-center">
                      <p className="text-center text-[11px] font-extrabold leading-snug text-[#5A00D6]">
                        {b.desc}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom iPad Home Bar */}
                <div className="mt-1.5 flex items-center justify-center">
                  <span className="h-1 w-14 rounded-full bg-white/80" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}