import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, ShieldCheck, Zap, Layers,
  ClipboardCheck, Lock, RefreshCw, Award, PhoneCall,
} from 'lucide-react';

// Exact Pricing Configured Within ComplianceHR Infinity — Preserved Unchanged
export const COMPLIANCE_HR_PACKAGES = [
  {
    id: 'tier-20',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package',
    badge: 'Most Popular · Elite Pack',
    users: 'Up to 20 Users',
    previousMonthly: 600,
    eliteAddon: 160,
    monthly: 760,
    priceLabel: '$760 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    featured: true,
    benefits: [
      'Access to the ComplianceHR app; confirm document template availability with our team',
      'Includes $160/mo Elite Package Tokens in every subscription',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      'Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      '14-Day Free Trial — Test every module live with your team',
    ],
  },
  {
    id: 'tier-30',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package',
    badge: 'Elite Pack Included',
    users: '21–30 Users',
    previousMonthly: 660,
    eliteAddon: 160,
    monthly: 820,
    priceLabel: '$820 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Access to the ComplianceHR app; confirm document template availability with our team',
      'Includes $160/mo Elite Package Tokens in every subscription',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      'Smart Rostering, Shift Notes, NDIS Price Guide Invoicing & Payroll',
      '24h / 5d NDIS Reportable Incident Timers, Risk Matrix & Take-5 Checks',
    ],
  },
  {
    id: 'tier-40',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package',
    badge: 'Elite Pack Included',
    users: '31–40 Users',
    previousMonthly: 760,
    eliteAddon: 160,
    monthly: 920,
    priceLabel: '$920 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Access to the ComplianceHR app; confirm document template availability with our team',
      'Includes $160/mo Elite Package Tokens in every subscription',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      'Automated 30-Action & 30-Completed-Task PDF/CSV Audit Batch Reports',
      'Company Safe, Smart Document Vault, Read-Receipts & Expiry Calendars',
    ],
  },
  {
    id: 'tier-50',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package',
    badge: 'Elite Pack Included',
    users: '41–50 Users',
    previousMonthly: 839,
    eliteAddon: 160,
    monthly: 999,
    priceLabel: '$999 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Access to the ComplianceHR app; confirm document template availability with our team',
      'Includes $160/mo Elite Package Tokens in every subscription',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      'Multi-team Rostering, Labour Forecasting, Coverage Heatmap & Exceptions',
      'Quotes, Receipt Scanner, Bank Reconciliation & 3-Way Procurement Match',
    ],
  },
  {
    id: 'tier-100',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package',
    badge: 'Elite Pack Included',
    users: '51–100 Users',
    previousMonthly: 940,
    eliteAddon: 160,
    monthly: 1100,
    priceLabel: '$1,100 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Access to the ComplianceHR app; confirm document template availability with our team',
      'Includes $160/mo Elite Package Tokens in every subscription',
      '1,200 message credits & 50,000 integration credits per month',
      'Dedicated compliance & technical support included',
      '65+ Live Automated Workflows & 100+ Server Functions running 24/7',
      'Full HR File Completeness Tracking, 360° Appraisals & Volunteer Hub',
    ],
  },
  {
    id: 'tier-101-plus',
    packageName: 'ComplianceHR Subscription',
    name: 'Smart Enhanced All-In-One Elite Package',
    badge: 'Enterprise · Elite Pack',
    users: '101+ Users',
    previousMonthly: 1060,
    eliteAddon: 160,
    monthly: 1220,
    priceLabel: '$1,220 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Access to the ComplianceHR app; confirm document template availability with our team',
      'Includes $160/mo Elite Package Tokens in every subscription',
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
    title: 'Role-Based Access Controls',
    desc: 'Granular permissions across 115+ entities for Admins, Team Leaders, Support Workers, Finance, HR, Participants and Auditors.',
  },
  {
    icon: RefreshCw,
    title: '50,000 Integration & 1,200 Message Credits',
    desc: 'Powers automated 24h/5d NDIS timers, expiry scans, shift alerts, 30-action PDF batch reports, and AI copilots.',
  },
];

const FEATURE_COMPARISON_ROWS = [
  { feature: 'Platform modules', included: 'Confirm availability for your plan' },
  { feature: 'Business document templates', included: 'Availability may vary by plan' },
  { feature: '17 Audit Categories & 356 NDIS Checkpoints', included: 'Included in Every Tier' },
  { feature: 'Elite Package Tokens ($160/mo value)', included: 'Included in Every Tier' },
  { feature: 'Monthly Message Credits', included: '1,200 message credits / mo' },
  { feature: 'Monthly Integration Credits', included: '50,000 integration credits / mo' },
  { feature: 'Auditor Portal access', included: 'Role and record permissions apply' },
  { feature: 'Dedicated Compliance & Technical Support', included: 'Included in Every Tier' },
];

export default function PricingSection({ onContactSales }) {
  const [showComparison, setShowComparison] = useState(true);

  return (
    <section id="pricing" className="w-full scroll-mt-20">
      <div
        className="rounded-3xl p-[3px] shadow-xl"
        style={{
          background: 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 28%, #5A00D6 62%, #FF2E9A 100%)',
        }}
      >
        <div className="rounded-[21px] bg-white p-5 sm:p-8 lg:p-10 space-y-8">
          {/* Header & Responsive Billing Toggle */}
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#5A00D6]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              <Award className="h-3.5 w-3.5 text-[#FF2E9A]" />
              Transparent All-In-One NDIS &amp; Aged Care Pricing
            </span>

            <h2 className="font-editorial text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
              Smart Enhanced{' '}
              <span className="bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                All-In-One Elite Packages
              </span>
            </h2>

            <p className="text-sm sm:text-base font-medium leading-relaxed text-[#0A2B6D]/80">
              Monthly subscription pricing is shown below. Confirm included modules, document availability, usage allowances, support and any annual billing options with our team before purchase.
            </p>

            {/* Pricing period note; annual rates require a confirmed quote. */}
            <div className="mx-auto w-full max-w-lg pt-1">
              <div className="grid grid-cols-1 gap-1.5 rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setBilling('monthly')}
                  className={`flex min-h-[40px] w-full items-center justify-center rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                    billing === 'monthly'
                      ? 'bg-[#0A2B6D] text-white shadow-sm'
                      : 'bg-white/60 text-[#0A2B6D] hover:text-[#0072FF]'
                  }`}
                >
                  Monthly Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setBilling('yearly')}
                  className={`flex min-h-[40px] w-full items-center justify-center rounded-xl px-4 py-2 text-xs sm:text-sm font-extrabold transition ${
                    billing === 'yearly'
                      ? 'bg-[#5A00D6] text-white shadow-sm'
                      : 'bg-white/60 text-[#0A2B6D] hover:text-[#5A00D6]'
                  }`}
                >
                  Annual Billing (Monthly Rate)
                </button>
              </div>
            </div>
          </div>

          {/* 6 Smart Enhanced Subscription Cards Grid — Centred Users & Fitted Token Info */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {COMPLIANCE_HR_PACKAGES.map((pkg) => {
              const isFeatured = Boolean(pkg.featured);
              return (
                <div
                  key={pkg.id}
                  className={`relative flex h-full flex-col justify-between rounded-3xl p-[2.5px] transition-all hover:-translate-y-0.5 ${
                    isFeatured ? 'shadow-2xl' : 'shadow-md hover:shadow-xl'
                  }`}
                  style={{
                    background: isFeatured
                      ? 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)'
                      : 'linear-gradient(120deg, #cbd5e1 0%, #94a3b8 100%)',
                  }}
                >
                  <div className="flex h-full flex-col justify-between rounded-[21px] bg-white p-5 sm:p-6">
                    <div className="flex flex-col">
                      {/* Centred Top Badge & Centred Users Capacity */}
                      <div className="flex flex-col items-center justify-center text-center space-y-2">
                        <span
                          className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap ${
                            isFeatured ? 'bg-[#FF2E9A]' : 'bg-[#0A2B6D]'
                          }`}
                        >
                          {pkg.badge}
                        </span>

                        <h3 className="font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D] leading-snug text-center">
                          {pkg.name}
                        </h3>

                        {/* Centred Users Pill */}
                        <div className="inline-flex items-center justify-center rounded-full border-2 border-[#0072FF]/35 bg-[#0072FF]/10 px-4 py-1 text-xs font-extrabold text-[#0072FF] whitespace-nowrap">
                          {pkg.users}
                        </div>
                      </div>

                      {/* Exact Configured Price Box — Centred Price & Fitted Token Info */}
                      <div className="mt-3.5 rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-center">
                        <div className="flex items-baseline justify-center gap-1.5 whitespace-nowrap">
                          <span className="font-editorial text-3xl font-extrabold text-[#0A2B6D] leading-none">
                            ${pkg.monthly.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-[#0A2B6D]/80">
                            per month
                          </span>
                          <span className="ml-1 rounded-md bg-[#5A00D6]/10 px-2 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                            Monthly
                          </span>
                        </div>
                        <div className="mt-2 border-t border-slate-200/70 pt-2 text-[10.5px] font-extrabold text-[#5A00D6] whitespace-nowrap">
                          Base ${pkg.previousMonthly}/mo + ${pkg.eliteAddon}/mo Elite Tokens
                        </div>
                      </div>

                      {/* Symmetrical 2-Column Credit Allowances */}
                      <div className="mt-3 grid grid-cols-2 gap-2 items-stretch">
                        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Zap className="h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                            <span className="text-sm font-extrabold text-[#0A2B6D]">1,200</span>
                          </div>
                          <span className="mt-0.5 text-[9.5px] xl:text-[10.5px] font-semibold text-[#0A2B6D]/75 whitespace-nowrap">
                            Message credits / mo
                          </span>
                        </div>
                        <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white px-2 py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Layers className="h-3.5 w-3.5 shrink-0 text-[#5A00D6]" />
                            <span className="text-sm font-extrabold text-[#0A2B6D]">50,000</span>
                          </div>
                          <span className="mt-0.5 text-[9.5px] xl:text-[10.5px] font-semibold text-[#0A2B6D]/75 whitespace-nowrap">
                            Integration credits / mo
                          </span>
                        </div>
                      </div>

                      {/* Benefits List */}
                      <ul className="mt-4 space-y-2 border-t border-slate-100 pt-3.5 text-left">
                        {pkg.benefits.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-2 text-xs font-semibold leading-snug text-[#0A2B6D]"
                          >
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0072FF]" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom-Aligned Card CTAs */}
                    <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                      <Link
                        to="/register"
                        className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs xl:text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
                        style={{
                          background: isFeatured
                            ? 'linear-gradient(115deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)'
                            : '#0A2B6D',
                        }}
                      >
                        <span>Start Free Trial (14 Days)</span>
                        <ArrowRight className="h-4 w-4 shrink-0 text-white" />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          onContactSales &&
                          onContactSales(`Sales Enquiry — ${pkg.users} (${pkg.priceLabel})`)
                        }
                        className="inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF] hover:text-[#0072FF]"
                      >
                        <PhoneCall className="h-3.5 w-3.5 text-[#5A00D6]" />
                        <span>Contact Sales</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 6 Core Platform Benefits Included in Every Plan */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {CORE_PLATFORM_BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 text-left"
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{
                          background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 100%)',
                        }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <h4 className="text-sm font-extrabold text-[#0A2B6D] leading-snug">
                        {b.title}
                      </h4>
                    </div>
                    <p className="mt-2.5 text-xs leading-relaxed text-[#0A2B6D]/75">
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Responsive Feature Comparison Grid */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-left">
                <h3 className="font-editorial text-xl sm:text-2xl font-extrabold text-[#0A2B6D]">
                  Full Feature Comparison Across All Tiers
                </h3>
                <p className="text-xs sm:text-sm text-[#0A2B6D]/75">
                  Every tier unlocks the complete 46-module platform—simply choose your active user capacity.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowComparison((v) => !v)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-slate-100"
                >
                  {showComparison ? 'Hide Comparison' : 'Show Comparison'}
                </button>
                <button
                  type="button"
                  onClick={() => onContactSales && onContactSales('Enterprise & Multi-Site Sales Enquiry')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A2B6D] px-3.5 py-2 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-[#00C6FF]" />
                  <span>Contact Sales</span>
                </button>
              </div>
            </div>

            {showComparison && (
              <div className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200">
                <div className="hidden sm:grid sm:grid-cols-12 bg-slate-50 px-4 py-3 text-left text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                  <div className="sm:col-span-7">Platform Capability</div>
                  <div className="sm:col-span-5">Inclusion Across Tiers (Up to 20 → 101+ Users)</div>
                </div>
                {FEATURE_COMPARISON_ROWS.map((row) => (
                  <div
                    key={row.feature}
                    className="grid grid-cols-1 gap-1.5 px-4 py-3 text-left sm:grid-cols-12 sm:items-center sm:gap-4"
                  >
                    <div className="sm:col-span-7 text-xs sm:text-sm font-bold text-[#0A2B6D]">
                      {row.feature}
                    </div>
                    <div className="sm:col-span-5 text-xs sm:text-sm font-extrabold text-[#0072FF]">
                      <span className="inline-flex items-center gap-1.5">
                        <Check className="h-4 w-4 shrink-0 text-[#0072FF]" />
                        <span>{row.included}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}