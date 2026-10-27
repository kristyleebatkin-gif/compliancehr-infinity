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
  '#FFFFFF';

// Updated Monthly Tier Prices ($760, $820, $920, $999, $1,100, $1,220) — No Yearly Sums, Includes Elite Package Tokens ($160/mo), Full Access to App & All Documents, 1,200 Message Credits, 50,000 Integration Credits & Support
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
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    featured: true,
    benefits: [
      'Includes full access to ComplianceHR app & full access to all documents',
      'Includes Elite Package Tokens, valued at $160 per a month',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      'Includes Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
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
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app & full access to all documents',
      'Includes Elite Package Tokens, valued at $160 per a month',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      'Smart Rostering, Shift Notes, NDIS Price Guide Invoicing & Payroll',
      '24h / 5d NDIS Reportable Incident Timers, Risk Matrix & Take-5 Checks',
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
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app & full access to all documents',
      'Includes Elite Package Tokens, valued at $160 per a month',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      'Automated 30-Action & 30-Completed-Task PDF/CSV Audit Batch Reports',
      'Company Safe, Smart Document Vault, Read-Receipts & Expiry Calendars',
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
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app & full access to all documents',
      'Includes Elite Package Tokens, valued at $160 per a month',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      'Multi-team Rostering, Labour Forecasting, Coverage Heatmap & Exceptions',
      'Quotes, Receipt Scanner, Bank Reconciliation & 3-Way Procurement Match',
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
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app & full access to all documents',
      'Includes Elite Package Tokens, valued at $160 per a month',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      '65+ Live Automated Workflows & 100+ Server Functions running 24/7',
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
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Includes full access to ComplianceHR app & full access to all documents',
      'Includes Elite Package Tokens, valued at $160 per a month',
      '1,200 message credits & 50,000 integration credits per month',
      'Priority onboarding, bulk intake migration & dedicated compliance support',
      'Unlimited Multi-Site Governance, Auditor Portal & Executive Wall Scenes',
      'Custom Modular Screen & Data Selector across all organisational branches',
    ],
  },
];

export const CORE_PLATFORM_BENEFITS = [
  {
    icon: ShieldCheck,
    title: 'Smart Enhanced Elite Pack & Safety Docs',
    desc: 'Includes $160/mo Elite Tokens, 1,200 message & 50,000 integration credits, plus WHS, Risk, Incident, Medication, Waste, Support Plan & Infection Control docs.',
  },
  {
    icon: ClipboardCheck,
    title: '$999 Outright or $125/mo (24m) · 100+ Docs',
    desc: 'Full access to 100+ documents downloadable at any stage & tailored to Business Details (no payment plan on $999): Continuity, Service Delivery & Safe Meal Management.',
  },
  {
    icon: Layers,
    title: '46 Live Modules + HR, Intake & Policy Docs',
    desc: 'Dual Office & Profile Views plus Staff Training, Consents, Employee & Participant Intake, Progress, Skills, Review, Policies, Procedures, Registers & Business Plans.',
  },
  {
    icon: Zap,
    title: '14-Day Free Trial & Dedicated Support',
    desc: 'Experience full access to the ComplianceHR app, all 100+ tailored documents, and dedicated compliance support from day one.',
  },
  {
    icon: Lock,
    title: 'Strict Role-Based NDIS & HR Security',
    desc: 'Granular permissions across 115+ entities for Admins, Team Leaders, Support Workers, Finance, HR, Participants and Auditors.',
  },
  {
    icon: RefreshCw,
    title: '50,000 Integration & 1,200 Message Credits',
    desc: 'Powers automated 24h/5d NDIS timers, expiry scans, shift alerts, 30-action PDF batch reports, and AI copilots.',
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
      <div
        className="flex w-full flex-col items-center justify-center rounded-[16px] px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4"
        style={{ background: UNIFORM_SPRAY_BG }}
      >
        {/* Top Package Title Header on One Line + Border & Colour Removed From Writing Underneath */}
        <div
          className="w-full rounded-2xl p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="flex flex-col items-center justify-center rounded-[11px] bg-white px-3 py-2 sm:px-5 sm:py-2.5 text-center space-y-1.5">
            {/* Smart Enhanced Sentence on 2 Balanced Lines */}
            <h2 className="font-editorial text-lg sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-tight text-center">
              <span className="block">
                <span className="text-[#0A2B6D]">Smart Enhanced </span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  All-In-One
                </span>
              </span>
              <span className="block bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Elite Packages &amp; Master Audit Suite
              </span>
            </h2>

            {/* Dark Writing Reduced to Exactly Four Lines */}
            <p className="mx-auto text-center text-[8.5px] sm:text-[9.5px] font-extrabold leading-snug text-[#0A2B6D] bg-white">
              <span className="block text-[#0A2B6D]">
                Every Smart Enhanced tier includes full access to the ComplianceHR app &amp; 100+ tailored Business Details documents:
              </span>
              <span className="block text-[#0A2B6D]">
                WHS, Risk, Incident, Medication, Waste, Support Plan, Service Delivery, Infection Control &amp; Continuity,
              </span>
              <span className="block text-[#0A2B6D]">
                Staff Training, Consents, Intake, Progress, Skills, Review, Policies, Procedures, Registers &amp; Business Plans,
              </span>
              <span className="block text-[#0A2B6D]">
                plus 1,200 Message Credits, 50,000 Integration Credits, dedicated support &amp; $160/mo Elite Tokens.
              </span>
            </p>
          </div>
        </div>

        {/* Smaller Monthly, Annual & Smart Enhanced Tiles */}
        <div className="w-full space-y-1.5">
          <div className="grid w-full grid-cols-2 gap-1.5">
            <div
              className="rounded-full p-[2px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-white transition-all ${
                  billing === 'monthly' ? 'ring-2 ring-[#0A2B6D] shadow-sm' : 'opacity-95 hover:opacity-100'
                }`}
                style={{ background: getHeaderView(0), color: '#FFFFFF' }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white shadow-2xs"
                  style={{ borderColor: getAppBorderView(0) }}
                >
                  <Sparkles className="h-2.5 w-2.5" style={{ color: getSymbolView(0).iconColor }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>Monthly Subscription</span>
              </button>
            </div>

            <div
              className="rounded-full p-[2px] shadow-2xs"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <button
                type="button"
                onClick={() => setBilling('yearly')}
                className={`gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] sm:text-[11px] font-extrabold text-white transition-all ${
                  billing === 'yearly' ? 'ring-2 ring-[#0A2B6D] shadow-sm' : 'opacity-95 hover:opacity-100'
                }`}
                style={{ background: getHeaderView(2), color: '#FFFFFF' }}
              >
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white shadow-2xs"
                  style={{ borderColor: getAppBorderView(2) }}
                >
                  <ShieldCheck className="h-2.5 w-2.5" style={{ color: getSymbolView(2).iconColor }} />
                </span>
                <span style={{ color: '#FFFFFF' }}>Annual Billing</span>
              </button>
            </div>
          </div>

          <div
            className="w-full rounded-full p-[2px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="gradient-brand flex min-h-[26px] w-full items-center justify-center gap-1.5 rounded-full px-4 py-0.5 text-[10.5px] sm:text-xs font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(6), color: '#FFFFFF' }}
            >
              <span
                className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border bg-white shadow-2xs"
                style={{ borderColor: getAppBorderView(6) }}
              >
                <Award className="h-2.5 w-2.5" style={{ color: getSymbolView(6).iconColor }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>
                Smart Enhanced All-In-One Compliance Packages
              </span>
            </div>
          </div>
        </div>

        {/* 6 Smart Enhanced Subscription Cards Grid — 50% Smaller & Lit Up in Glowing White Lights + Includes $999 Document Suite Words */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 items-stretch text-center">
          {COMPLIANCE_HR_PACKAGES.map((pkg, pIdx) => {
            return (
              <div
                key={pkg.id}
                className="flex h-full rounded-2xl p-[3px] transition-all hover:-translate-y-0.5"
                style={{
                  background: TOP_BORDER_GRADIENT,
                  boxShadow:
                    '0 0 18px 4px rgba(255, 255, 255, 0.98), 0 0 12px 2px rgba(0, 198, 255, 0.55)',
                }}
              >
                <div className="flex h-full w-full flex-col justify-between rounded-[12px] bg-white p-2 text-center space-y-1.5">
                  <div className="flex flex-1 flex-col justify-between space-y-1.5">
                    {/* Glowing White Lights Bar at Top of Subscription Card */}
                    <div className="flex items-center justify-center gap-1.5">
                      {[0, 1, 2].map((b) => (
                        <span
                          key={b}
                          className="h-2 w-2 rounded-full border border-[#0A2B6D]/30 bg-white"
                          style={{ boxShadow: '0 0 8px 3px #FFFFFF, 0 0 12px 2px #00C6FF' }}
                        />
                      ))}
                      <span className="rounded-full border border-[#0A2B6D]/25 bg-white px-2 py-0 text-[7.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                        WHITE LIGHTS ON
                      </span>
                    </div>

                    {/* 50% Smaller Top Header */}
                    <div
                      className="gradient-brand flex min-h-[34px] w-full flex-col items-center justify-center gap-0.5 rounded-[7px] px-2 py-1 text-center text-white"
                      style={{ background: getHeaderView(pIdx), color: '#FFFFFF' }}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border bg-white shadow-2xs"
                          style={{ borderColor: getAppBorderView(pIdx) }}
                        >
                          <Award className="h-2.5 w-2.5" style={{ color: getSymbolView(pIdx).iconColor }} />
                        </span>
                        <span
                          className="text-[10.5px] font-extrabold tracking-wide leading-tight text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          {pkg.packageName}
                        </span>
                      </div>
                      <span className="rounded-full border border-[#0A2B6D] bg-white px-2.5 py-0 text-[9px] font-extrabold leading-none text-[#0A2B6D]">
                        {pkg.users}
                      </span>
                    </div>

                    {/* Package Title & Monthly Price — Pure White Inside Text Box */}
                    <div className="flex min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-[7px] border border-[#0A2B6D]/25 bg-white px-2 py-1 text-center">
                      <h3 className="font-editorial text-xs font-extrabold leading-tight text-[#0A2B6D] text-center">
                        {pkg.name}
                      </h3>
                      <span className="font-editorial text-sm font-extrabold text-[#0A2B6D]">
                        ${pkg.monthly.toLocaleString()} per a month
                      </span>
                      <span className="text-[8px] font-extrabold text-[#0A2B6D] leading-tight">
                        Includes 100+ Tailored Docs (WHS, Risk, Incident, Medication, Intake, Policies &amp; Registers)
                      </span>
                    </div>

                    {/* Credit Pills — Pure White Inside Text Boxes */}
                    <div className="grid grid-cols-2 gap-1">
                      <div className="flex min-h-[24px] items-center justify-center gap-1 rounded-[6px] border border-[#0A2B6D]/25 bg-white px-1.5 py-0.5">
                        <Zap className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" />
                        <span className="text-[8.5px] font-extrabold text-[#0A2B6D] leading-tight">
                          {pkg.messageCredits}
                        </span>
                      </div>
                      <div className="flex min-h-[24px] items-center justify-center gap-1 rounded-[6px] border border-[#0A2B6D]/25 bg-white px-1.5 py-0.5">
                        <Layers className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" />
                        <span className="text-[8.5px] font-extrabold text-[#0A2B6D] leading-tight">
                          {pkg.integrationCredits}
                        </span>
                      </div>
                    </div>

                    {/* Benefits List — Pure White Inside Text Boxes */}
                    <ul className="grid flex-1 grid-cols-1 gap-1 pt-0.5">
                      {pkg.benefits.slice(0, 4).map((b) => (
                        <li
                          key={b}
                          className="flex min-h-[26px] items-center gap-1.5 rounded-[6px] border border-[#0A2B6D]/25 bg-white px-2 py-0.5 text-center text-[8.5px] font-extrabold leading-tight text-[#0A2B6D]"
                        >
                          <Check className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" />
                          <span className="flex-1 text-center text-[#0A2B6D]">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 50% Smaller Bottom CTA */}
                  <div className="pt-1 border-t border-[#0A2B6D]/20">
                    <div
                      className="rounded-full p-[1.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <Link
                        to="/register"
                        className="gradient-brand inline-flex h-[26px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[9.5px] font-extrabold text-white transition-all hover:-translate-y-0.5"
                        style={{ background: getHeaderView(pIdx + 1), color: '#FFFFFF' }}
                      >
                        <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                        <span style={{ color: '#FFFFFF' }}>Start 14-Day Free Trial</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 6 Included Platform Pillar Benefits — White Background & App-Design Coloured Borders */}
        <div className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center items-stretch">
          {CORE_PLATFORM_BENEFITS.map((b, idx) => {
            const Icon = b.icon;
            const sym = getSymbolView(idx);
            return (
              <div
                key={b.title}
                className="flex h-full rounded-2xl p-[3px] shadow-2xs"
                style={{ background: getHeaderView(idx) }}
              >
                <div className="flex h-full w-full flex-col items-center justify-between gap-1 rounded-[12px] bg-white p-1.5 text-center">
                  {/* App-Design Coloured Pillar Header Bar With Number & Symbol */}
                  <div
                    className="gradient-brand flex min-h-[22px] w-full items-center justify-between gap-1 rounded-full px-2 py-0.5 text-white"
                    style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                  >
                    <span className="inline-flex items-center gap-1">
                      <span
                        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white text-[6.5px] font-extrabold"
                        style={{ color: sym.iconColor }}
                      >
                        0{idx + 1}
                      </span>
                      <span className="text-[7px] font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                        Pillar 0{idx + 1}
                      </span>
                    </span>
                    <span className="text-[6.5px] font-extrabold text-white" style={{ color: '#FFFFFF' }}>
                      100%
                    </span>
                  </div>

                  {/* App-Design Coloured Title Bar */}
                  <div
                    className="gradient-brand flex min-h-[22px] w-full items-center justify-center gap-1 rounded-md px-1.5 py-0.5 text-center text-white"
                    style={{ background: getHeaderView(idx + 1), color: '#FFFFFF' }}
                  >
                    <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white">
                      <Icon className="h-2 w-2" style={{ color: sym.iconColor }} />
                    </span>
                    <span className="text-[7.5px] font-extrabold leading-tight text-white" style={{ color: '#FFFFFF' }}>
                      {b.title}
                    </span>
                  </div>

                  {/* Pure White Inside Writing Box */}
                  <div className="flex w-full flex-1 items-center justify-center rounded-[6px] border border-[#0A2B6D]/25 bg-white px-1.5 py-1 text-center">
                    <p className="text-center text-[7.5px] font-extrabold leading-tight text-[#0A2B6D]">
                      {b.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}