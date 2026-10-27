import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, Sparkles, ShieldCheck, Zap, Layers,
  ClipboardCheck, Lock, RefreshCw, Award, PhoneCall, HelpCircle,
} from 'lucide-react';

// Exact Pricing Configured Within ComplianceHR Infinity — Preserved Unchanged
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

const FEATURE_COMPARISON_ROWS = [
  { feature: 'All 46 Connected Platform Modules', included: 'Included in Every Tier' },
  { feature: '100+ Tailored Business Details Documents', included: 'Included in Every Tier' },
  { feature: '17 Audit Categories & 356 NDIS Checkpoints', included: 'Included in Every Tier' },
  { feature: 'Elite Package Tokens ($160/mo value)', included: 'Included in Every Tier' },
  { feature: 'Monthly Message Credits', included: '1,200 message credits / mo' },
  { feature: 'Monthly Integration Credits', included: '50,000 integration credits / mo' },
  { feature: 'Consent-Gated External NDIS Auditor Portal', included: 'Included in Every Tier' },
  { feature: 'Dedicated Compliance & Technical Support', included: 'Included in Every Tier' },
];

export default function PricingSection({ onContactSales }) {
  const [billing, setBilling] = useState('monthly');
  const [showComparison, setShowComparison] = useState(true);

  return (
    <section id="pricing" className="w-full scroll-mt-20 py-6">
      <div
        className="rounded-3xl p-[3px] shadow-xl"
        style={{
          background: 'linear-gradient(120deg, #0072FF 0%, #0A2B6D 28%, #5A00D6 62%, #FF2E9A 100%)',
        }}
      >
        <div className="rounded-[21px] bg-white p-6 sm:p-10 lg:p-12 space-y-10">
          {/* Header & Billing Toggle */}
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#5A00D6]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              <Award className="h-3.5 w-3.5 text-[#FF2E9A]" />
              Transparent All-In-One NDIS Provider Pricing
            </span>

            <h2 className="font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
              Smart Enhanced{' '}
              <span className="bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                All-In-One Elite Packages
              </span>
            </h2>

            <p className="text-sm sm:text-base font-medium leading-relaxed text-[#0A2B6D]/80">
              Every Smart Enhanced tier includes full access to all 46 connected modules, 100+ tailored Business Details documents, $160/mo Elite Package Tokens, 1,200 message credits, 50,000 integration credits, and dedicated support.
            </p>

            {/* Monthly / Annual Pricing Toggle */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <div className="inline-flex items-center rounded-2xl border border-slate-200 bg-slate-100/80 p-1.5">
                <button
                  type="button"
                  onClick={() => setBilling('monthly')}
                  className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-extrabold transition ${
                    billing === 'monthly'
                      ? 'bg-[#0A2B6D] text-white shadow-sm'
                      : 'text-[#0A2B6D] hover:text-[#0072FF]'
                  }`}
                >
                  Monthly Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setBilling('yearly')}
                  className={`rounded-xl px-5 py-2 text-xs sm:text-sm font-extrabold transition ${
                    billing === 'yearly'
                      ? 'bg-[#5A00D6] text-white shadow-sm'
                      : 'text-[#0A2B6D] hover:text-[#5A00D6]'
                  }`}
                >
                  Annual Billing (Billed Monthly Equivalent)
                </button>
              </div>
            </div>
          </div>

          {/* 6 Smart Enhanced Subscription Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {COMPLIANCE_HR_PACKAGES.map((pkg) => {
              const isFeatured = Boolean(pkg.featured);
              return (
                <div
                  key={pkg.id}
                  className={`relative flex flex-col justify-between rounded-3xl p-[2.5px] transition-all hover:-translate-y-1 ${
                    isFeatured ? 'shadow-2xl' : 'shadow-md hover:shadow-xl'
                  }`}
                  style={{
                    background: isFeatured
                      ? 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)'
                      : 'linear-gradient(120deg, #cbd5e1 0%, #94a3b8 100%)',
                  }}
                >
                  <div className="flex h-full flex-col justify-between rounded-[21px] bg-white p-6 sm:p-7 text-left">
                    <div>
                      {/* Top Badge & User Capacity */}
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white ${
                            isFeatured ? 'bg-[#FF2E9A]' : 'bg-[#0A2B6D]'
                          }`}
                        >
                          {pkg.badge}
                        </span>
                        <span className="rounded-full border border-[#0072FF]/30 bg-[#0072FF]/10 px-3 py-1 text-xs font-extrabold text-[#0072FF]">
                          {pkg.users}
                        </span>
                      </div>

                      <h3 className="mt-4 font-editorial text-xl font-extrabold text-[#0A2B6D] leading-snug">
                        {pkg.name}
                      </h3>

                      {/* Exact Configured Price */}
                      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
                        <div className="flex items-baseline gap-2">
                          <span className="font-editorial text-3xl sm:text-4xl font-extrabold text-[#0A2B6D]">
                            ${pkg.monthly.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-[#0A2B6D]/75">
                            per a month
                          </span>
                        </div>
                        <div className="mt-1 text-xs font-bold text-[#5A00D6]">
                          Base ${pkg.previousMonthly}/mo + ${pkg.eliteAddon}/mo Elite Package Tokens Included
                        </div>
                      </div>

                      {/* Credit Allowances */}
                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]">
                          <Zap className="mb-1 h-3.5 w-3.5 text-[#0072FF]" />
                          {pkg.messageCredits}
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]">
                          <Layers className="mb-1 h-3.5 w-3.5 text-[#5A00D6]" />
                          {pkg.integrationCredits}
                        </div>
                      </div>

                      {/* Benefits List */}
                      <ul className="mt-5 space-y-2.5">
                        {pkg.benefits.map((b) => (
                          <li key={b} className="flex items-start gap-2.5 text-xs font-semibold leading-relaxed text-[#0A2B6D]">
                            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0072FF]" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Card CTAs */}
                    <div className="mt-6 space-y-2.5 border-t border-slate-100 pt-5">
                      <Link
                        to="/register"
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
                        style={{
                          background: isFeatured
                            ? 'linear-gradient(115deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)'
                            : '#0A2B6D',
                        }}
                      >
                        <span>Start 14-Day Free Trial</span>
                        <ArrowRight className="h-4 w-4 text-white" />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          onContactSales &&
                          onContactSales(`Sales Enquiry — ${pkg.users} (${pkg.priceLabel})`)
                        }
                        className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF] hover:text-[#0072FF]"
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CORE_PLATFORM_BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="rounded-2xl border border-slate-200/90 bg-slate-50/60 p-5 text-left"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                      style={{
                        background: 'linear-gradient(135deg, #0072FF 0%, #5A00D6 100%)',
                      }}
                    >
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-sm font-extrabold text-[#0A2B6D]">
                      {b.title}
                    </h4>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-[#0A2B6D]/75">
                    {b.desc}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Feature Comparison Table + Contact Sales Banner */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="text-left">
                <h3 className="font-editorial text-xl sm:text-2xl font-extrabold text-[#0A2B6D]">
                  Full Feature Comparison Across All Tiers
                </h3>
                <p className="text-xs sm:text-sm text-[#0A2B6D]/75">
                  Every tier unlocks the complete 46-module platform—simply choose your active user capacity.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowComparison((v) => !v)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-slate-100"
                >
                  {showComparison ? 'Hide Comparison' : 'Show Feature Comparison'}
                </button>
                <button
                  type="button"
                  onClick={() => onContactSales && onContactSales('Enterprise & Multi-Site Sales Enquiry')}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0A2B6D] px-4 py-2 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
                >
                  <PhoneCall className="h-3.5 w-3.5 text-[#00C6FF]" />
                  <span>Contact Sales</span>
                </button>
              </div>
            </div>

            {showComparison && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                      <th className="py-3 pr-4">Platform Capability</th>
                      <th className="py-3 px-4">Inclusion Across Tiers (Up to 20 → 101+ Users)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                    {FEATURE_COMPARISON_ROWS.map((row) => (
                      <tr key={row.feature}>
                        <td className="py-3 pr-4 font-bold text-[#0A2B6D]">{row.feature}</td>
                        <td className="py-3 px-4 font-extrabold text-[#0072FF]">
                          <span className="inline-flex items-center gap-1.5">
                            <Check className="h-4 w-4 text-[#0072FF]" />
                            {row.included}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}