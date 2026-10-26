import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, Sparkles, ShieldCheck, Zap, Layers,
  ClipboardCheck, Lock, RefreshCw, Award,
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

// Updated Monthly Tier Prices ($760, $820, $920, $999, $1,100, $1,220) — No Yearly Sums, Includes Elite Package Tokens ($160/mo) & Full Access to ComplianceHR App
export const COMPLIANCE_HR_PACKAGES = [
  {
    id: 'tier-20',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package · Up to 20 Users',
    badge: 'Most Popular · Elite Pack Included',
    users: 'Up to 20 Users',
    previousMonthly: 600,
    eliteAddon: 160,
    monthly: 760,
    priceLabel: '$760 per a month',
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    featured: true,
    benefits: [
      'Includes full access to ComplianceHR app (all 46 live modules)',
      'Includes Elite Package Tokens, valued at $160 per a month',
      'Includes Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'Employee & Participant Profiles, NDIS Screening & 3-Part Consents',
      '16 Communication Modulars, Shared To-Do Command & 1-Click Audit Packs',
      '14-Day Free Trial — Test every module live with your team',
    ],
  },
  {
    id: 'tier-30',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package · 21–30 Users',
    badge: 'Elite Pack Included',
    users: '21–30 Users',
    previousMonthly: 660,
    eliteAddon: 160,
    monthly: 820,
    priceLabel: '$820 per a month',
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app for 21–30 users',
      'Includes Elite Package Tokens, valued at $160 per a month',
      'Includes Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002)',
      'Smart Rostering, Shift Notes, NDIS Price Guide Invoicing & Payroll',
      '24h / 5d NDIS Reportable Incident Timers, Risk Matrix & Take-5 Checks',
      'HR Paperwork Hub, LMS Training Academy & AI Course/Quiz Builder',
    ],
  },
  {
    id: 'tier-40',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package · 31–40 Users',
    badge: 'Elite Pack Included',
    users: '31–40 Users',
    previousMonthly: 760,
    eliteAddon: 160,
    monthly: 920,
    priceLabel: '$920 per a month',
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app for 31–40 users',
      'Includes Elite Package Tokens, valued at $160 per a month',
      'Includes Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'Automated 30-Action & 30-Completed-Task PDF/CSV Audit Batch Reports',
      'Company Safe, Smart Document Vault, Read-Receipts & Expiry Calendars',
      'Staff ID Badge Studio, Key Contacts & Automated Compliance Reminders',
    ],
  },
  {
    id: 'tier-50',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package · 41–50 Users',
    badge: 'Elite Pack Included',
    users: '41–50 Users',
    previousMonthly: 839,
    eliteAddon: 160,
    monthly: 999,
    priceLabel: '$999 per a month',
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app for 41–50 users',
      'Includes Elite Package Tokens, valued at $160 per a month',
      'Includes Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002)',
      'Multi-team Rostering, Labour Forecasting, Coverage Heatmap & Exceptions',
      'Quotes, Receipt Scanner, Bank Reconciliation & 3-Way Procurement Match',
      'Consent-gated External NDIS Auditor Portal & Weekly Board Reports',
    ],
  },
  {
    id: 'tier-100',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package · 51–100 Users',
    badge: 'Elite Pack Included',
    users: '51–100 Users',
    previousMonthly: 940,
    eliteAddon: 160,
    monthly: 1100,
    priceLabel: '$1,100 per a month',
    messageCredits: '2,500+ message credits / mo',
    integrationCredits: '20,000+ integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app for 51–100 users',
      'Includes Elite Package Tokens, valued at $160 per a month',
      'Includes Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      '65+ Live Automated Workflows & 100+ Server Functions running 24/7',
      'Departmental Compliance Dashboards, KPI Auto-Calc & Risk Heatmaps',
      'Full HR File Completeness Tracking, 360° Appraisals & Volunteer Hub',
    ],
  },
  {
    id: 'tier-101-plus',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package · 101+ Users',
    badge: 'Enterprise · Elite Pack Included',
    users: '101+ Users',
    previousMonthly: 1060,
    eliteAddon: 160,
    monthly: 1220,
    priceLabel: '$1,220 per a month',
    messageCredits: '2,500+ message credits / mo',
    integrationCredits: '20,000+ integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app for 101+ users',
      'Includes Elite Package Tokens, valued at $160 per a month',
      'Includes Master Compliance Audit Checklist (CHR-AUD-001 & CHR-AUD-002)',
      'Unlimited Multi-Site Governance, Auditor Portal & Executive Wall Scenes',
      'Custom Modular Screen & Data Selector across all organisational branches',
      'Priority onboarding, bulk intake migration & dedicated compliance support',
    ],
  },
];

export const CORE_PLATFORM_BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Smart Enhanced All-In-One Elite Package',
    desc: 'Every tier includes the Elite Plan (2,500 message credits & 20,000 integration credits) plus the Master Compliance Audit Suite.',
  },
  {
    icon: ClipboardCheck,
    title: 'Master Compliance Audit Suite Included',
    desc: 'Both ComplianceHR Infinity Governance (CHR-AUD-001) & Workforce Operations (CHR-AUD-002) 11-page, 17-category, 356-checkpoint audit documents included.',
  },
  {
    icon: Layers,
    title: 'All 46 Connected Modules + Dual Views',
    desc: 'Switch seamlessly between the Enhanced Executive Office View and General Profile View with custom screen selectors.',
  },
  {
    icon: Zap,
    title: '14-Day Free Trial (Full Access Mode)',
    desc: 'Build and test your application with full access, then scale into the Smart Enhanced All-In-One tier that matches your team size.',
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
        {/* Top Package Title Header Without Price + White Subtitle Framed in App-Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex flex-col items-center justify-center rounded-[12px] bg-white px-5 py-5 sm:px-8 sm:py-6 text-center space-y-3">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#0A2B6D]">Smart Enhanced </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                All-In-One Elite Packages
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                &amp; Master Audit Suite
              </span>
            </h2>

            <div
              className="w-full max-w-4xl rounded-xl p-[3px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div className="rounded-[9px] bg-white px-4 py-2.5 text-center">
                <p
                  className="mx-auto text-center text-xs sm:text-sm md:text-base font-extrabold text-black"
                  style={{ color: '#000000' }}
                >
                  Every user tier includes 2,500 Message Credits, 20,000 Integration Credits, and the Master Compliance Audit Checklist (CHR-AUD-001 &amp; CHR-AUD-002).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly & Annual Tiles + Smart Enhanced Banner With App-Design Coloured Symbols */}
        <div className="w-full space-y-2">
          <div className="grid w-full grid-cols-2 gap-1.5">
            <div
              className="rounded-full p-[3px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`gradient-brand flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold text-white transition-all ${
                  billing === 'monthly' ? 'ring-2 ring-[#0A2B6D] shadow-md' : 'opacity-95 hover:opacity-100'
                }`}
                style={{ background: getHeaderView(0), color: '#FFFFFF' }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                  style={{ borderColor: getAppBorderView(0) }}
                >
                  <Sparkles className="h-3.5 w-3.5" style={{ color: getSymbolView(0).iconColor }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>Monthly Subscription</span>
              </button>
            </div>

            <div
              className="rounded-full p-[3px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={() => setBilling('yearly')}
                className={`gradient-brand flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold text-white transition-all ${
                  billing === 'yearly' ? 'ring-2 ring-[#0A2B6D] shadow-md' : 'opacity-95 hover:opacity-100'
                }`}
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                  style={{ borderColor: getAppBorderView(2) }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" style={{ color: getSymbolView(2).iconColor }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>Annual Billing</span>
              </button>
            </div>
          </div>

          <div
            className="w-full rounded-full p-[3px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="gradient-brand flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(6), color: '#FFFFFF' }}
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                style={{ borderColor: getAppBorderView(6) }}
              >
                <Award className="h-4 w-4" style={{ color: getSymbolView(6).iconColor }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>
                Smart Enhanced All-In-One Compliance Packages
              </span>
            </div>
          </div>
        </div>

        {/* 6 Smart Enhanced Subscription Cards Grid — Package Name on Line 1, Users on Line 2, Just Title in White Box, All White Areas Framed & All Symbols Lined Up in App Design Colour */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch text-center">
          {COMPLIANCE_HR_PACKAGES.map((pkg, pIdx) => {
            return (
              <div
                key={pkg.id}
                className="flex h-full rounded-2xl p-[4px] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full w-full flex-col justify-between rounded-[13px] p-4 text-center space-y-3"
                  style={{ background: UNIFORM_SPRAY_BG }}
                >
                  <div className="flex flex-1 flex-col justify-between space-y-2.5">
                    {/* Top Header: Package Name on Top Line & Users on 2nd Line Underneath (No Price) */}
                    <div
                      className="w-full rounded-xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="gradient-brand flex min-h-[64px] w-full flex-col items-center justify-center gap-1.5 rounded-[9px] px-3 py-2 text-center text-white"
                        style={{ background: getHeaderView(pIdx), color: '#FFFFFF' }}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                            style={{ borderColor: getAppBorderView(pIdx) }}
                          >
                            <Award className="h-3.5 w-3.5" style={{ color: getSymbolView(pIdx).iconColor }} />
                          </span>
                          <span
                            className="text-xs sm:text-sm font-extrabold tracking-wide leading-tight text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {pkg.packageName}
                          </span>
                        </div>
                        <span className="rounded-full border-2 border-[#0A2B6D] bg-white px-3.5 py-0.5 text-[11px] font-extrabold leading-none text-[#5A00D6]">
                          {pkg.users}
                        </span>
                      </div>
                    </div>

                    {/* White Area Framed in App-Design Coloured Border: Package Title & Monthly Price (No Yearly Sums) */}
                    <div
                      className="w-full rounded-xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex min-h-[86px] flex-col items-center justify-center gap-1 rounded-[9px] bg-white px-3 py-2.5 text-center">
                        <h3
                          className="font-editorial text-sm sm:text-base font-extrabold leading-snug bg-clip-text text-transparent text-center"
                          style={{ backgroundImage: getTitleGradientView(pIdx) }}
                        >
                          {pkg.name}
                        </h3>
                        <span className="font-editorial text-lg sm:text-xl font-extrabold text-[#5A00D6]">
                          ${pkg.monthly.toLocaleString()} per a month
                        </span>
                      </div>
                    </div>

                    {/* 2-Row Credit Pills With App-Design Coloured Borders & Lined-Up App-Coloured Symbols */}
                    <div className="grid grid-cols-1 grid-rows-2 gap-1.5">
                      <div
                        className="rounded-xl p-[2.5px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex min-h-[38px] items-center gap-2.5 rounded-[9px] bg-white px-3 py-1">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                            style={{ borderColor: getAppBorderView(pIdx) }}
                          >
                            <Zap className="h-3.5 w-3.5" style={{ color: getSymbolView(pIdx).iconColor }} />
                          </span>
                          <span className="flex-1 text-center text-xs font-extrabold text-[#0A2B6D]">
                            {pkg.messageCredits}
                          </span>
                        </div>
                      </div>
                      <div
                        className="rounded-xl p-[2.5px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="flex min-h-[38px] items-center gap-2.5 rounded-[9px] bg-white px-3 py-1">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                            style={{ borderColor: getAppBorderView(pIdx + 1) }}
                          >
                            <Layers className="h-3.5 w-3.5" style={{ color: getSymbolView(pIdx + 1).iconColor }} />
                          </span>
                          <span className="flex-1 text-center text-xs font-extrabold text-[#5A00D6]">
                            {pkg.integrationCredits}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* 6-Row Benefits List — All White Areas Framed in App-Design Colour & All Symbols Lined Up in App-Design Colour */}
                    <ul className="grid flex-1 grid-cols-1 grid-rows-6 gap-1.5 pt-0.5">
                      {pkg.benefits.map((b, bIdx) => {
                        const sym = getSymbolView(pIdx * 2 + bIdx);
                        return (
                          <li
                            key={b}
                            className="flex min-h-[54px] rounded-xl p-[2.5px] shadow-2xs"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          >
                            <div className="flex h-full w-full items-center gap-2.5 rounded-[9px] bg-white px-3 py-1 text-center text-[11px] font-extrabold leading-tight text-[#0A2B6D]">
                              <span
                                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                style={{ borderColor: getAppBorderView(pIdx * 2 + bIdx) }}
                              >
                                <Check className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                              </span>
                              <span className="flex-1 text-center text-[#0A2B6D]">{b}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* Bottom CTA With App-Design Coloured Symbol */}
                  <div className="pt-2.5 border-t border-[#0A2B6D]/20">
                    <div
                      className="rounded-full p-[2.5px] shadow-sm"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <Link
                        to="/register"
                        className="gradient-brand inline-flex h-[40px] w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold text-white transition-all hover:-translate-y-0.5"
                        style={{ background: getHeaderView(pIdx + 1), color: '#FFFFFF' }}
                      >
                        <span
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                          style={{ borderColor: getAppBorderView(pIdx + 1) }}
                        >
                          <ArrowRight className="h-3.5 w-3.5" style={{ color: getSymbolView(pIdx + 1).iconColor }} />
                        </span>
                        <span style={{ color: '#FFFFFF' }}>Start 14-Day Free Trial</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 6 Included Platform Pillar Benefits Styled as iPad Screens — All White Writing Areas Framed in App-Design Colour & App-Coloured Symbols */}
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
                    iPad Screen · Package Pillar 0{idx + 1}
                  </span>
                  <span className="text-[8.5px] font-extrabold text-white/85">5G · 100%</span>
                </div>

                {/* Inner iPad Display — Both White Writing Areas Framed in App-Design Coloured Borders */}
                <div
                  className="flex flex-1 rounded-[16px] p-[2.5px]"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex h-full w-full flex-col items-center justify-between gap-2.5 rounded-[13px] p-3.5 text-center"
                    style={{ background: UNIFORM_SPRAY_BG }}
                  >
                    <div
                      className="w-full rounded-xl p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex min-h-[50px] items-center justify-center gap-2.5 rounded-[9px] bg-white px-3 py-1.5 text-center">
                        <span
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                          style={{ borderColor: borderCol }}
                        >
                          <Icon className="h-4 w-4" style={{ color: sym.iconColor }} />
                        </span>
                        <div
                          className="flex-1 text-center font-editorial text-xs sm:text-sm font-extrabold leading-tight bg-clip-text text-transparent"
                          style={{ backgroundImage: getTitleGradientView(idx) }}
                        >
                          {b.title}
                        </div>
                      </div>
                    </div>

                    <div
                      className="w-full flex-1 rounded-xl p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex h-full min-h-[58px] w-full items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center">
                        <p className="text-center text-[11px] font-extrabold leading-snug text-[#5A00D6]">
                          {b.desc}
                        </p>
                      </div>
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