import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, ShieldCheck, Zap, Layers,
  ClipboardCheck, Lock, RefreshCw, Award, PhoneCall, Users,
} from 'lucide-react';

// Shared inclusions across every tier — displayed once above the tier grid
export const SHARED_PLAN_INCLUSIONS = [
  'Full access to the ComplianceHR platform & all 46 connected modules',
  '100+ tailored Business Details compliance, NDIS & HR documents',
  'Includes $160/month Elite Package Tokens in every subscription',
  '1,200 message credits & 50,000 integration credits per month',
  'Dedicated compliance & technical support + 14-day free trial',
];

// Each tier has a distinct clear name based on user capacity and 2 differentiating feature lines
export const COMPLIANCE_HR_PACKAGES = [
  {
    id: 'tier-20',
    packageName: 'Smart Enhanced All-In-One Elite Package',
    name: 'Up to 20 Users',
    badge: 'Most Popular',
    users: 'Up to 20 Users',
    previousMonthly: 600,
    eliteAddon: 160,
    monthly: 760,
    priceLabel: '$760 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    featured: true,
    differentiators: [
      'Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'Complete operational foundation for teams up to 20 active staff & managers',
    ],
    benefits: [
      'Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'Complete operational foundation for teams up to 20 active staff & managers',
    ],
  },
  {
    id: 'tier-30',
    packageName: 'Smart Enhanced All-In-One Elite Package',
    name: '21–30 Users',
    badge: 'Growth Tier',
    users: '21–30 Users',
    previousMonthly: 660,
    eliteAddon: 160,
    monthly: 820,
    priceLabel: '$820 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    differentiators: [
      'Smart Rostering, Shift Notes, NDIS Price Guide Invoicing & Payroll',
      '24h / 5d NDIS Reportable Incident Timers, Risk Matrix & Take-5 Checks',
    ],
    benefits: [
      'Smart Rostering, Shift Notes, NDIS Price Guide Invoicing & Payroll',
      '24h / 5d NDIS Reportable Incident Timers, Risk Matrix & Take-5 Checks',
    ],
  },
  {
    id: 'tier-40',
    packageName: 'Smart Enhanced All-In-One Elite Package',
    name: '31–40 Users',
    badge: 'Mid-Size Tier',
    users: '31–40 Users',
    previousMonthly: 760,
    eliteAddon: 160,
    monthly: 920,
    priceLabel: '$920 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    differentiators: [
      'Automated 30-Action & 30-Completed-Task PDF/CSV Audit Batch Reports',
      'Company Safe, Smart Document Vault, Read-Receipts & Expiry Calendars',
    ],
    benefits: [
      'Automated 30-Action & 30-Completed-Task PDF/CSV Audit Batch Reports',
      'Company Safe, Smart Document Vault, Read-Receipts & Expiry Calendars',
    ],
  },
  {
    id: 'tier-50',
    packageName: 'Smart Enhanced All-In-One Elite Package',
    name: '41–50 Users',
    badge: 'Scale Tier',
    users: '41–50 Users',
    previousMonthly: 839,
    eliteAddon: 160,
    monthly: 999,
    priceLabel: '$999 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    differentiators: [
      'Multi-Team Rostering, Labour Forecasting, Coverage Heatmap & Exceptions',
      'Quotes, Receipt Scanner, Bank Reconciliation & 3-Way Procurement Match',
    ],
    benefits: [
      'Multi-Team Rostering, Labour Forecasting, Coverage Heatmap & Exceptions',
      'Quotes, Receipt Scanner, Bank Reconciliation & 3-Way Procurement Match',
    ],
  },
  {
    id: 'tier-100',
    packageName: 'Smart Enhanced All-In-One Elite Package',
    name: '51–100 Users',
    badge: 'Organisation Tier',
    users: '51–100 Users',
    previousMonthly: 940,
    eliteAddon: 160,
    monthly: 1100,
    priceLabel: '$1,100 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    differentiators: [
      '65+ Live Automated Workflows & 100+ Server Functions running 24/7',
      'Full HR File Completeness Tracking, 360° Appraisals & Volunteer Hub',
    ],
    benefits: [
      '65+ Live Automated Workflows & 100+ Server Functions running 24/7',
      'Full HR File Completeness Tracking, 360° Appraisals & Volunteer Hub',
    ],
  },
  {
    id: 'tier-101-plus',
    packageName: 'Smart Enhanced All-In-One Elite Package',
    name: '101+ Users',
    badge: 'Enterprise Tier',
    users: '101+ Users',
    previousMonthly: 1060,
    eliteAddon: 160,
    monthly: 1220,
    priceLabel: '$1,220 per month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    differentiators: [
      'Unlimited Multi-Site Governance, Auditor Portal & Executive Dashboards',
      'Priority onboarding, bulk intake migration & multi-branch data controls',
    ],
    benefits: [
      'Unlimited Multi-Site Governance, Auditor Portal & Executive Dashboards',
      'Priority onboarding, bulk intake migration & multi-branch data controls',
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
    <section id="pricing" className="w-full scroll-mt-20">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10 space-y-8">
        {/* Header & Package Subtitle Shown Once */}
        <div className="mx-auto max-w-3xl text-center space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-600">
            <Award className="h-3.5 w-3.5 text-indigo-600" />
            Transparent All-In-One NDIS &amp; Aged Care Pricing
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Choose Your Active User Capacity
          </h2>

          <p className="text-sm sm:text-base font-semibold text-indigo-600">
            Smart Enhanced All-In-One Elite Package
          </p>

          <p className="text-sm leading-relaxed text-slate-600">
            Every tier unlocks the complete 46-module platform — simply select the tier that matches your team size.
          </p>

          {/* Monthly / Annual Billing Toggle */}
          <div className="mx-auto w-full max-w-md pt-2">
            <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-slate-200 bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setBilling('monthly')}
                className={`flex min-h-[38px] w-full items-center justify-center rounded-lg px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
                  billing === 'monthly'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Monthly Subscription
              </button>
              <button
                type="button"
                onClick={() => setBilling('yearly')}
                className={`flex min-h-[38px] w-full items-center justify-center rounded-lg px-4 py-1.5 text-xs sm:text-sm font-semibold transition ${
                  billing === 'yearly'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Annual Billing (Monthly Rate)
              </button>
            </div>
          </div>
        </div>

        {/* Shared Inclusions Banner — Shown Once Above the Tier Grid */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-indigo-100">
            <div className="text-left">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Included in Every Plan
              </h3>
              <p className="text-xs text-slate-600">
                All six user tiers include the full ComplianceHR Infinity suite with no feature gates:
              </p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              All 46 Modules Included
            </span>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-left">
            {SHARED_PLAN_INCLUSIONS.map((item) => (
              <div key={item} className="flex items-start gap-2.5 text-xs sm:text-sm font-medium text-slate-800">
                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
                  <Check className="h-2.5 w-2.5 stroke-[3]" />
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 6 User Capacity Tier Cards — Distinct Headings, Clean Pricing, and 2 Differentiating Lines */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {COMPLIANCE_HR_PACKAGES.map((pkg) => {
            const isFeatured = Boolean(pkg.featured);
            return (
              <div
                key={pkg.id}
                className={`relative flex h-full flex-col justify-between rounded-2xl border bg-white p-6 transition-all hover:-translate-y-0.5 ${
                  isFeatured
                    ? 'border-2 border-indigo-600 shadow-lg ring-1 ring-indigo-600/10'
                    : 'border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Users className="h-3.5 w-3.5 text-indigo-600" />
                      <span>User Capacity</span>
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        isFeatured
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {pkg.badge}
                    </span>
                  </div>

                  {/* Distinct Card Heading Based on User Capacity */}
                  <h3 className="mt-2 text-xl sm:text-2xl font-extrabold text-slate-900 text-left">
                    {pkg.name}
                  </h3>

                  {/* Price Box */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-slate-900 leading-none">
                        ${pkg.monthly.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold text-slate-600">
                        per month
                      </span>
                      <span className="ml-auto rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                        {billing === 'yearly' ? 'Annual' : 'Monthly'}
                      </span>
                    </div>
                    <div className="mt-2 border-t border-slate-200/80 pt-2 text-xs font-medium text-slate-600">
                      Base ${pkg.previousMonthly}/mo + ${pkg.eliteAddon}/mo Elite Tokens
                    </div>
                  </div>

                  {/* Only the 2 Differentiating Feature Lines for This Tier */}
                  <div className="mt-4 border-t border-slate-100 pt-4 text-left">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Tier Highlights
                    </p>
                    <ul className="mt-2.5 space-y-2.5">
                      {pkg.differentiators.map((line) => (
                        <li
                          key={line}
                          className="flex items-start gap-2 text-xs sm:text-sm font-medium leading-snug text-slate-700"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600" />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card CTAs — Consistent Primary Brand Colour */}
                <div className="mt-6 space-y-2 border-t border-slate-100 pt-4">
                  <Link
                    to="/register"
                    className="inline-flex min-h-[42px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-700"
                  >
                    <span>Start Free Trial</span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-white" />
                  </Link>

                  <button
                    type="button"
                    onClick={() =>
                      onContactSales &&
                      onContactSales(`Sales Enquiry — ${pkg.users} (${pkg.priceLabel})`)
                    }
                    className="inline-flex min-h-[38px] w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 transition hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600"
                  >
                    <PhoneCall className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Contact Sales</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 6 Core Platform Benefits */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
          {CORE_PLATFORM_BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-left"
              >
                <div>
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">
                      {b.title}
                    </h4>
                  </div>
                  <p className="mt-2.5 text-xs leading-relaxed text-slate-600">
                    {b.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-left">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                Full Feature Comparison Across All Tiers
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Every tier unlocks the complete 46-module platform — simply choose your active user capacity.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowComparison((v) => !v)}
                className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {showComparison ? 'Hide Comparison' : 'Show Comparison'}
              </button>
              <button
                type="button"
                onClick={() => onContactSales && onContactSales('Enterprise & Multi-Site Sales Enquiry')}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                <PhoneCall className="h-3.5 w-3.5 text-white" />
                <span>Contact Sales</span>
              </button>
            </div>
          </div>

          {showComparison && (
            <div className="overflow-hidden rounded-xl border border-slate-200 divide-y divide-slate-200">
              <div className="hidden sm:grid sm:grid-cols-12 bg-slate-50 px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-700">
                <div className="sm:col-span-7">Platform Capability</div>
                <div className="sm:col-span-5">Inclusion Across Tiers (Up to 20 → 101+ Users)</div>
              </div>
              {FEATURE_COMPARISON_ROWS.map((row) => (
                <div
                  key={row.feature}
                  className="grid grid-cols-1 gap-1.5 px-4 py-3 text-left sm:grid-cols-12 sm:items-center sm:gap-4"
                >
                  <div className="sm:col-span-7 text-xs sm:text-sm font-semibold text-slate-900">
                    {row.feature}
                  </div>
                  <div className="sm:col-span-5 text-xs sm:text-sm font-semibold text-indigo-600">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="h-4 w-4 shrink-0 text-indigo-600" />
                      <span>{row.included}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}