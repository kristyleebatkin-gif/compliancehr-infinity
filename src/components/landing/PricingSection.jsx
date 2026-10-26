import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, Sparkles, ShieldCheck, Zap, Layers,
  ClipboardCheck, Lock, RefreshCw, DollarSign,
} from 'lucide-react';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

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
    color: '#FF2E9A',
    featured: true,
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes $355 Master Compliance Audit Doc (17 Categories · 356 Checkpoints)',
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
    color: '#5A00D6',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes $355 Master Compliance Audit Doc (CHR-AUD-001 & CHR-AUD-002)',
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
    color: '#0072FF',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes $355 Master Compliance Audit Doc (17 Categories · 356 Checkpoints)',
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
    color: '#0A2B6D',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes $355 Master Compliance Audit Doc (CHR-AUD-001 & CHR-AUD-002)',
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
    color: '#A100FF',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes $355 Master Compliance Audit Doc (17 Categories · 356 Checkpoints)',
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
    color: '#00C6FF',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes $355 Master Compliance Audit Doc (CHR-AUD-001 & CHR-AUD-002)',
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
    desc: 'Every tier includes the $160/mo Elite Plan (2,500 message credits & 20,000 integration credits) plus the $355 Master Compliance Audit Document.',
  },
  {
    icon: ClipboardCheck,
    title: '$355 Master Compliance Audit Doc Included Free',
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
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-5">
        {/* Centred Badge */}
        <span
          className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
            <DollarSign className="h-3.5 w-3.5 text-[#FF2E9A]" />
          </span>
          <span className="text-center">Smart Enhanced All-In-One Compliance Pack Pricing</span>
        </span>

        {/* Heading & Subtitle */}
        <div className="mx-auto max-w-4xl space-y-1.5">
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A2B6D]">
            Transparent Pricing with{' '}
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              +$160/mo Elite Plan &amp; $355 Audit Doc Included
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-[#5A00D6]">
            Every user tier includes 2,500 Message Credits, 20,000 Integration Credits, and the $355 Master Compliance Audit Checklist (CHR-AUD-001 &amp; CHR-AUD-002).
          </p>
        </div>

        {/* Monthly vs Annual Toggle Buttons Matching Top Section */}
        <div className="mx-auto flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1.5 text-xs sm:text-[13px] font-extrabold transition-all"
            style={
              billing === 'monthly'
                ? {
                    background:
                      'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                    color: '#ffffff',
                  }
                : { background: '#ffffff', color: '#0A2B6D' }
            }
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0A2B6D] bg-white text-[#0072FF]">
              <Sparkles className="h-3 w-3 text-[#0072FF]" />
            </span>
            <span>Monthly Subscription</span>
          </button>

          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1.5 text-xs sm:text-[13px] font-extrabold transition-all"
            style={
              billing === 'yearly'
                ? {
                    background:
                      'linear-gradient(120deg, #5A00D6 0%, #0072FF 36%, #A100FF 70%, #FF6EDB 100%)',
                    color: '#ffffff',
                  }
                : { background: '#ffffff', color: '#0A2B6D' }
            }
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#0A2B6D] bg-white text-[#5A00D6]">
              <ShieldCheck className="h-3 w-3 text-[#5A00D6]" />
            </span>
            <span>Annual Billing</span>
          </button>
        </div>

        {/* 6 Smart Enhanced Subscription Cards Grid on Crisp White */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch text-left">
          {COMPLIANCE_HR_PACKAGES.map((pkg) => {
            const displayPrice =
              billing === 'monthly'
                ? pkg.monthly.toLocaleString()
                : pkg.yearly.toLocaleString();
            return (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="rounded-full border-2 border-[#0A2B6D] px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white"
                      style={{ background: BADGE_GRADIENT }}
                    >
                      {pkg.badge}
                    </span>
                    <span className="rounded-full border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-xs font-extrabold text-[#0A2B6D]">
                      {pkg.users}
                    </span>
                  </div>

                  <h3 className="font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D] leading-snug">
                    {pkg.name}
                  </h3>

                  <div className="flex items-baseline gap-1.5">
                    <span className="font-editorial text-2xl sm:text-3xl font-extrabold text-[#0A2B6D]">
                      ${displayPrice}
                    </span>
                    <span className="text-xs font-extrabold text-[#5A00D6]">
                      {billing === 'monthly'
                        ? `/ month ($${pkg.yearly.toLocaleString()}/yr)`
                        : `/ year ($${pkg.monthly}/mo)`}
                    </span>
                  </div>

                  <div className="rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1 text-center text-[11px] font-extrabold text-[#0A2B6D]">
                    ${pkg.previousMonthly}/mo Base + ${pkg.eliteAddon}/mo Elite Pack Included
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    <div className="flex items-center gap-2 rounded-full border border-[#0A2B6D] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D]">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                        style={{ background: ICON_GRADIENT }}
                      >
                        <Zap className="h-3 w-3 text-white" />
                      </span>
                      <span>{pkg.messageCredits}</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-[#0A2B6D] bg-white px-3 py-1 text-xs font-extrabold text-[#0A2B6D]">
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                        style={{ background: ICON_GRADIENT }}
                      >
                        <Layers className="h-3 w-3 text-white" />
                      </span>
                      <span>{pkg.integrationCredits}</span>
                    </div>
                  </div>

                  <ul className="space-y-1.5 pt-1">
                    {pkg.benefits.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-xs font-bold leading-snug text-[#0A2B6D]">
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                          style={{ background: ICON_GRADIENT }}
                        >
                          <Check className="h-2.5 w-2.5 text-white" />
                        </span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-3 border-t border-[#0A2B6D]/20">
                  <Link
                    to="/register"
                    className="inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                    style={{
                      background:
                        'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                    }}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
                      <ArrowRight className="h-3 w-3 text-[#0072FF]" />
                    </span>
                    <span>Start 14-Day Free Trial</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Included Platform Benefits Grid */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-left">
          {CORE_PLATFORM_BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex items-start gap-2.5 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 shadow-sm"
              >
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                  style={{ background: ICON_GRADIENT }}
                >
                  <Icon className="h-4 w-4 text-white" />
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#0A2B6D]">{b.title}</div>
                  <p className="mt-0.5 text-[11px] font-bold leading-snug text-[#5A00D6]">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}