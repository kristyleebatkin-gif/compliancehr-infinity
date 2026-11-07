import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, ShieldCheck, Zap, Layers,
  ClipboardCheck, Lock, RefreshCw, Award, PhoneCall, Sparkles,
} from 'lucide-react';

// Exact Pricing Configured Within ComplianceHR Infinity
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
    priceLabel: '$760 per a month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    featured: true,
    benefits: [
      'Full access to ComplianceHR app & all 100+ tailored documents',
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
    priceLabel: '$820 per a month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Full access to ComplianceHR app & all 100+ tailored documents',
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
    priceLabel: '$920 per a month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Full access to ComplianceHR app & all 100+ tailored documents',
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
    priceLabel: '$999 per a month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Full access to ComplianceHR app & all 100+ tailored documents',
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
    priceLabel: '$1,100 per a month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Full access to ComplianceHR app & all 100+ tailored documents',
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
    priceLabel: '$1,220 per a month',
    messageCredits: '1,200 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    benefits: [
      'Full access to ComplianceHR app & all 100+ tailored documents',
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
  const [showComparison, setShowComparison] = useState(false);

  return (
    <section id="pricing" className="w-full scroll-mt-20">
      <div
        className="relative rounded-2xl p-[3px]"
        style={{
          background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #A855F7 62%, #FF2E9A 100%)',
          boxShadow:
            '0 0 16px 3px rgba(255, 255, 255, 0.95), 0 0 28px 6px rgba(0, 198, 255, 0.55), 0 0 42px 8px rgba(168, 85, 247, 0.35)',
        }}
      >
        {/* Top Perimeter Glowing White Light Strip */}
        <div className="flex items-center justify-between px-4 py-1 bg-[#0A2B6D]/95 backdrop-blur-sm rounded-t-[13px] border-b border-[#00C6FF]/60">
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className="h-2 w-2 rounded-full bg-white"
                style={{
                  boxShadow: '0 0 8px 2px #FFFFFF, 0 0 14px 4px #00C6FF',
                }}
              />
            ))}
            <span className="ml-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white">
              Official ComplianceHR Infinity Subscription &amp; Document Packages · Live Pricing
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10.5px] font-extrabold text-[#00C6FF]">
              $760 – $1,220/mo · $999 Outright or $125/mo (24m) Docs
            </span>
            {[0, 1, 2, 3, 4].map((dot) => (
              <span
                key={dot}
                className="h-2 w-2 rounded-full bg-white"
                style={{
                  boxShadow: '0 0 8px 2px #FFFFFF, 0 0 14px 4px #FF2E9A',
                }}
              />
            ))}
          </div>
        </div>

        <div className="rounded-b-[13px] bg-white p-3.5 sm:p-4 space-y-3">
          {/* 1. Header Always First (One Straight Sentence, Slightly Bigger) -> Sentence -> Blue/Purple Badge & Toggle After */}
          <div className="space-y-1 border-b-2 border-[#0072FF]/40 pb-2.5 text-left">
            <h2 className="font-editorial text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-[#0A2B6D] leading-tight">
              Smart Enhanced All-In-One Elite Packages ($760–$1,220/mo) &amp; 100+ Tailored Documents ($999 Outright or $125/mo)
            </h2>

            <p className="text-xs sm:text-[13px] font-semibold leading-snug text-[#0A2B6D]/85">
              Every Smart Enhanced tier includes full access to all 46 connected modules, 100+ tailored Business Details documents, $160/mo Elite Package Tokens, 1,200 message credits, 50,000 integration credits, and dedicated support.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-md border border-[#0072FF]/50 bg-[#0072FF]/10 px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wider text-[#0072FF]">
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded bg-[#0A2B6D]"
                    style={{ boxShadow: '0 0 8px 2px rgba(255,255,255,0.95), 0 0 10px #00C6FF' }}
                  >
                    <Award className="h-2.5 w-2.5 text-white" style={{ filter: 'drop-shadow(0 0 4px #FFFFFF)' }} />
                  </span>
                  <span>Transparent All-In-One NDIS &amp; Aged Care Pricing</span>
                </span>

              </div>

              {/* Compact Billing Switcher */}
              <div className="inline-flex items-center gap-1 rounded-lg border-2 border-[#0072FF]/50 bg-slate-100 p-0.5">
                <button
                  type="button"
                  onClick={() => setBilling('monthly')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold transition ${
                    billing === 'monthly'
                      ? 'bg-[#0A2B6D] text-white shadow-2xs'
                      : 'text-[#0A2B6D] hover:text-[#0072FF]'
                  }`}
                >
                  Monthly Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setBilling('yearly')}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-extrabold transition ${
                    billing === 'yearly'
                      ? 'bg-[#0072FF] text-white shadow-2xs'
                      : 'text-[#0A2B6D] hover:text-[#0072FF]'
                  }`}
                >
                  Annual Billing (Monthly Rate)
                </button>
              </div>
            </div>
          </div>

          {/* 6 Smart Enhanced Subscription Cards Grid — Glowing White Lights Around Every Card */}
          <div className="pricing-card-grid grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 items-stretch">
            {COMPLIANCE_HR_PACKAGES.map((pkg) => {
              const isFeatured = Boolean(pkg.featured);
              return (
                <div
                  key={pkg.id}
                  className="relative flex h-full flex-col justify-between rounded-xl p-[2.5px] transition-all"
                  style={{
                    background: isFeatured
                      ? 'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)'
                      : 'linear-gradient(120deg, #00C6FF 0%, #0072FF 45%, #A855F7 85%, #FF2E9A 100%)',
                    boxShadow: isFeatured
                      ? '0 0 14px 2px rgba(255, 255, 255, 0.95), 0 0 22px 4px rgba(0, 114, 255, 0.45)'
                      : '0 0 10px 1px rgba(255, 255, 255, 0.85), 0 0 16px 2px rgba(0, 198, 255, 0.3)',
                  }}
                >
                  <div className="flex h-full flex-col justify-between rounded-[10px] bg-white p-3">
                    <div className="flex flex-col space-y-2">
                      {/* Header Row Inside Card: Glowing Badge + Users Capacity + Prominent Price */}
                      <div className="flex items-start justify-between gap-2 border-b border-sky-300 pb-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white ${
                                isFeatured ? 'bg-[#0072FF]' : 'bg-[#0A2B6D]'
                              }`}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full bg-white"
                                style={{ boxShadow: '0 0 6px 2px #FFFFFF' }}
                              />
                              <span>{pkg.users}</span>
                            </span>
                            <span className="rounded bg-[#F5F0FF] border border-[#A855F7]/50 px-1.5 py-0.5 text-[9.5px] font-extrabold text-[#5A00D6]">
                              {pkg.badge}
                            </span>
                          </div>
                          <h3 className="mt-1 font-editorial text-xs sm:text-sm font-extrabold text-[#0A2B6D] leading-tight">
                            {pkg.name}
                          </h3>
                        </div>

                        <div className="text-right shrink-0 rounded-lg border border-[#0072FF]/40 bg-[#F0F7FF] px-2.5 py-1">
                          <div className="font-editorial text-xl sm:text-2xl font-black text-[#0A2B6D] leading-none">
                            ${pkg.monthly.toLocaleString()}
                          </div>
                          <div className="text-[10px] font-extrabold text-[#0072FF]">
                            per a month ({billing === 'yearly' ? 'Annual' : 'Monthly'})
                          </div>
                        </div>
                      </div>

                      {/* Exact Price & Credit Breakdown Box */}
                      <div className="rounded-lg border border-sky-300 bg-[#F0F7FF] px-2.5 py-1.5 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-extrabold text-[#0A2B6D]">
                          <span>Base ${pkg.previousMonthly}/mo + ${pkg.eliteAddon}/mo Elite Tokens</span>
                          <span className="text-[#5A00D6]">= ${pkg.monthly}/mo</span>
                        </div>
                        <div className="flex items-center justify-between border-t border-sky-200 pt-1 text-[10.5px] font-bold text-[#0072FF]">
                          <span>⚡ {pkg.messageCredits}</span>
                          <span>🔗 {pkg.integrationCredits}</span>
                        </div>
                      </div>

                      {/* Benefits List */}
                      <ul className="space-y-1 text-left">
                        {pkg.benefits.map((b) => (
                          <li
                            key={b}
                            className="flex items-start gap-1.5 text-[11px] font-semibold leading-snug text-[#0A2B6D]"
                          >
                            <span
                              className="mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-[#0A2B6D]"
                              style={{ boxShadow: '0 0 6px 1px rgba(255,255,255,0.9)' }}
                            >
                              <Check className="h-2.5 w-2.5 text-white" style={{ filter: 'drop-shadow(0 0 2px #FFFFFF)' }} />
                            </span>
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Bottom-Aligned Card CTAs */}
                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 border-t border-sky-200 pt-2">
                      <Link
                        to="/register"
                        className="inline-flex h-7 items-center justify-center gap-1 whitespace-nowrap rounded-lg px-2 text-[11px] font-extrabold text-white shadow-2xs transition hover:opacity-95"
                        style={{
                          background: isFeatured
                            ? 'linear-gradient(115deg, #0072FF 0%, #5A00D6 55%, #FF2E9A 100%)'
                            : '#0A2B6D',
                        }}
                      >
                        <span>Start Free Trial</span>
                        <ArrowRight className="h-3 w-3 shrink-0 text-white" />
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          onContactSales &&
                          onContactSales(`Sales Enquiry — ${pkg.users} (${pkg.priceLabel})`)
                        }
                        className="inline-flex h-7 items-center justify-center gap-1 rounded-lg border-2 border-[#0072FF]/50 bg-white px-2 text-[11px] font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF] hover:text-[#0072FF]"
                      >
                        <PhoneCall className="h-3 w-3 text-[#0072FF]" />
                        <span>Contact Sales</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dedicated $999 Outright / $125 per Month (24 Months) 100+ Tailored Documents Package Strip */}
          <div
            className="rounded-xl p-[2px]"
            style={{
              background: 'linear-gradient(120deg, #00C6FF 0%, #0072FF 35%, #5A00D6 70%, #FF2E9A 100%)',
              boxShadow: '0 0 12px 2px rgba(255,255,255,0.9), 0 0 18px rgba(0,198,255,0.45)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-[10px] bg-[#0A2B6D]/95 backdrop-blur-sm px-3.5 py-2.5 text-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/70 bg-[#0072FF]/35"
                  style={{ boxShadow: '0 0 10px 2px rgba(255,255,255,0.9)' }}
                >
                  <Sparkles className="h-4 w-4 text-white" style={{ filter: 'drop-shadow(0 0 4px #FFFFFF)' }} />
                </span>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-black text-white">
                    100+ Tailored Business Details Documents Package — $999 Outright or $125/mo Over 24 Months
                  </div>
                  <div className="text-[11px] font-semibold text-white/85">
                    Downloadable at any stage &amp; automatically tailored to your Business Details (Policies, Procedures, Plans, Forms, Checklists &amp; Registers).
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/documents"
                  className="inline-flex h-7 items-center gap-1 rounded-lg border border-[#00C6FF] bg-[#0072FF] px-3 text-[11px] font-extrabold text-white shadow-[0_0_10px_rgba(255,255,255,0.6)]"
                >
                  <span>Explore 100+ Documents</span>
                  <ArrowRight className="h-3 w-3 text-white" />
                </Link>
              </div>
            </div>
          </div>

          {/* 6 Core Platform Benefits Included in Every Plan with White Lights in Symbols */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 items-stretch">
            {CORE_PLATFORM_BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="flex items-start gap-2.5 rounded-xl border-2 border-[#0072FF]/50 bg-[#F0F7FF] p-2.5 text-left"
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/80 bg-[#0A2B6D] text-white"
                    style={{ boxShadow: '0 0 10px 2px rgba(255,255,255,0.95), 0 0 12px rgba(0,198,255,0.5)' }}
                  >
                    <Icon className="h-3.5 w-3.5 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-extrabold text-[#0A2B6D] leading-snug">
                      {b.title}
                    </h4>
                    <p className="mt-0.5 text-[11px] leading-snug text-[#0A2B6D]/80">
                      {b.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Compact Collapsible Feature Comparison Bar */}
          <div className="rounded-xl border-2 border-[#0072FF]/50 bg-[#F8FAFC] px-3 py-2 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-left">
                <h3 className="font-editorial text-sm sm:text-base font-black text-[#0A2B6D]">
                  Full Feature Comparison Across All Tiers — Every Tier Unlocks All 46 Connected Modules
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowComparison((v) => !v)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-extrabold text-[#0A2B6D] transition hover:bg-slate-100"
                >
                  {showComparison ? 'Hide Comparison' : 'Show Comparison (8)'}
                </button>
                <button
                  type="button"
                  onClick={() => onContactSales && onContactSales('Enterprise & Multi-Site Sales Enquiry')}
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0A2B6D] px-2.5 py-1 text-[11px] font-extrabold text-white transition hover:bg-[#0072FF]"
                >
                  <PhoneCall className="h-3 w-3 text-white" style={{ filter: 'drop-shadow(0 0 3px #FFFFFF)' }} />
                  <span>Contact Sales</span>
                </button>
              </div>
            </div>

            {showComparison && (
              <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-4 pt-1">
                {FEATURE_COMPARISON_ROWS.map((row) => (
                  <div
                    key={row.feature}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left"
                  >
                    <div className="text-[11px] font-extrabold text-[#0A2B6D]">{row.feature}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[10.5px] font-bold text-[#0072FF]">
                      <Check className="h-3 w-3 shrink-0 text-[#0072FF]" />
                      <span>{row.included}</span>
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