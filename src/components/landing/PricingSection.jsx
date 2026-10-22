import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, Sparkles, ShieldCheck, Zap, Layers,
  ClipboardCheck, Lock, RefreshCw,
} from 'lucide-react';
import { Image } from '@/components/ui/image';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';
const DEFAULT_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';
const FULL_SLOGAN = 'Complete Control. Greater Confidence. Brighter Success.';

/**
 * ComplianceHR Infinity monthly prices increased by +$160/month across every tier
 * to include the $160/mo Elite Plan Smart Enhanced All-In-One Compliance Pack:
 * - Up to 20 users:  $500 + $160 = $660 / mo ($7,920 / yr)
 * - 21–30 users:     $563 + $160 = $723 / mo ($8,670 / yr)
 * - 31–40 users:     $625 + $160 = $785 / mo ($9,420 / yr)
 * - 41–50 users:     $688 + $160 = $848 / mo ($10,170 / yr)
 * - 51–100 users:    $750 + $160 = $910 / mo ($10,920 / yr)
 * - 101+ users:      $875 + $160 = $1,035 / mo ($12,420 / yr)
 */
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
    color: '#db2777',
    featured: true,
    tagline:
      'Base $500/mo + $160/mo Elite Plan Smart Enhanced All-In-One Compliance Pack included.',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes $355 Master Compliance Audit Doc (17 Categories · 356 Checkpoints)',
      'All 45 ComplianceHR Infinity Modules + Dual Office & Profile Views',
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
    color: '#7c3aed',
    tagline:
      'Base $563/mo + $160/mo Elite Plan Smart Enhanced All-In-One Compliance Pack included.',
    benefits: [
      'Includes $160/mo Elite Plan (2,500 Message & 20,000 Integration Credits)',
      'Includes $355 Master Compliance Audit Doc (CHR-AUD-001 & CHR-AUD-002)',
      'Full 45-Module Smart Enhanced All-In-One Compliance Pack for 21–30 users',
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
    color: '#2563eb',
    tagline:
      'Base $625/mo + $160/mo Elite Plan Smart Enhanced All-In-One Compliance Pack included.',
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
    color: '#0d9488',
    tagline:
      'Base $688/mo + $160/mo Elite Plan Smart Enhanced All-In-One Compliance Pack included.',
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
    color: '#ea580c',
    tagline:
      'Base $750/mo + $160/mo Elite Plan Smart Enhanced All-In-One Compliance Pack included.',
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
    color: '#16a34a',
    tagline:
      'Base $875/mo + $160/mo Elite Plan Smart Enhanced All-In-One Compliance Pack included.',
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
    desc: 'Every tier now includes the $160/mo Elite Plan (2,500 message credits & 20,000 integration credits) plus the $355 Master Compliance Audit Document.',
    color: '#db2777',
  },
  {
    icon: ClipboardCheck,
    title: '$355 Master Compliance Audit Doc Included Free',
    desc: 'Both ComplianceHR Infinity Governance (CHR-AUD-001) & Workforce Operations (CHR-AUD-002) 11-page, 17-category, 356-checkpoint audit documents included.',
    color: '#6d28d9',
  },
  {
    icon: Layers,
    title: 'All 45 Connected Modules + Dual Views',
    desc: 'Switch seamlessly between the Enhanced Executive Office View and General Profile View with custom modular screen selectors.',
    color: '#2563eb',
  },
  {
    icon: Zap,
    title: '14-Day Free Trial ($0 Upfront Test Mode)',
    desc: 'Build and test your application with zero upfront costs, then scale into the Smart Enhanced All-In-One tier that matches your team size.',
    color: '#0d9488',
  },
  {
    icon: Lock,
    title: 'Strict Role-Based NDIS & HR Security',
    desc: 'Granular permissions across 115+ entities for Admins, Team Leaders, Support Workers, Finance, HR, Participants and Auditors.',
    color: '#ea580c',
  },
  {
    icon: RefreshCw,
    title: '65+ Workflows & 100+ Server Functions',
    desc: '20,000 integration credits power automated NDIS timers, expiry scans, shift alerts, 30-action reports, and AI copilots.',
    color: '#16a34a',
  },
];

export default function PricingSection({ compact = false }) {
  const [billing, setBilling] = useState('monthly'); // 'monthly' | 'yearly'

  return (
    <section
      id="pricing"
      className="rounded-2xl border-2 border-purple-600 bg-white p-2 sm:p-3 shadow-md space-y-2"
    >
      {/* Top Gradient Header Banner */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-8 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
            <Image
              src={DEFAULT_LOGO}
              alt="ComplianceHR Infinity"
              fittingType="fit"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                ComplianceHR Infinity · Smart Enhanced All-In-One Compliance Pack Pricing
              </span>
              <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[8px] font-black text-blue-950">
                INCLUDES +$160/MO ELITE PLAN &amp; $355 AUDIT DOC
              </span>
            </div>
            <p className="text-[9px] font-bold text-amber-100">
              All tiers include the $160/mo Elite Plan (2,500 Message Credits &amp; 20,000 Integration Credits) + $355 Master Compliance Audit Doc · {FULL_SLOGAN}
            </p>
          </div>
        </div>

        {/* Monthly vs Annual Toggle */}
        <div className="flex items-center gap-1 rounded-full bg-white/20 p-0.5">
          <button
            type="button"
            onClick={() => setBilling('monthly')}
            className={`rounded-full px-2.5 py-0.5 text-[8.5px] font-extrabold transition-all ${
              billing === 'monthly' ? 'bg-white text-blue-950 shadow-sm' : 'text-white hover:bg-white/15'
            }`}
          >
            Monthly Subscription
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={`rounded-full px-2.5 py-0.5 text-[8.5px] font-extrabold transition-all ${
              billing === 'yearly' ? 'bg-white text-blue-950 shadow-sm' : 'text-white hover:bg-white/15'
            }`}
          >
            Annual Billing
          </button>
        </div>
      </div>

      {/* Transparent Price Breakdown Strip: Original Tier + $160/mo Elite Plan + $355 Doc */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center rounded-xl border-2 border-pink-500 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 p-2">
        <div className="lg:col-span-8 flex items-start sm:items-center gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white shadow"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[10.5px] font-black text-blue-950">
              Smart Enhanced All-In-One Compliance Pack — Every Plan Includes the $160/mo Elite Plan + $355 Master Audit Checklist
            </div>
            <div className="text-[8px] font-bold text-purple-900">
              Each user tier combines our standard ComplianceHR Infinity platform rate ($500–$875/mo) + <span className="font-black text-pink-700">$160/mo Elite Plan</span> (2,500 Message Credits &amp; 20,000 Integration Credits) + the <span className="font-black text-purple-950">$355 Master Compliance Audit Checklist (`CHR-AUD-001` &amp; `CHR-AUD-002`)</span>. Start with a <span className="font-black text-blue-950">14-Day Free Trial ($0 upfront)</span>!
            </div>
          </div>
        </div>
        <div className="lg:col-span-4 flex flex-wrap items-center justify-end gap-1.5">
          <a
            href="#audit-master-doc"
            className="rounded-full border border-purple-400 bg-white px-2.5 py-1 text-[8px] font-black text-purple-950 shadow-sm hover:bg-purple-50"
          >
            $355 Audit Doc Standalone or Free in Plan
          </a>
          <Link
            to="/register"
            className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[8.5px] font-black text-white shadow-sm"
            style={{ background: SQUISHED_GRADIENT }}
          >
            Start 14-Day Free Trial ($0) <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* 6 Smart Enhanced Subscription Cards Grid — Zero Wasted Space */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-1.5 items-stretch">
        {COMPLIANCE_HR_PACKAGES.map((pkg) => {
          const displayPrice =
            billing === 'monthly'
              ? pkg.monthly.toLocaleString()
              : pkg.yearly.toLocaleString();
          return (
            <div
              key={pkg.id}
              className={`flex flex-col justify-between rounded-xl border-2 bg-white p-2 shadow-sm transition-all ${
                pkg.featured ? 'ring-2 ring-pink-500 shadow-md' : ''
              }`}
              style={{
                borderColor: pkg.color,
                borderTopWidth: '4px',
                background: pkg.featured
                  ? 'linear-gradient(155deg, rgba(219,39,119,0.12) 0%, rgba(124,58,237,0.08) 45%, #ffffff 90%)'
                  : `linear-gradient(155deg, ${pkg.color}12 0%, #ffffff 80%)`,
              }}
            >
              <div>
                {/* Top Badge & User Band */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[6.8px] font-black uppercase tracking-wider text-white"
                    style={{ background: pkg.featured ? SQUISHED_GRADIENT : pkg.color }}
                  >
                    {pkg.badge}
                  </span>
                  <span className="text-[7.5px] font-black text-blue-950">{pkg.users}</span>
                </div>

                <h3 className="mt-1 text-[10.5px] font-black text-blue-950 leading-tight">
                  {pkg.name}
                </h3>

                {/* Price Display with Base + $160 Elite Breakdown */}
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-editorial text-xl sm:text-2xl font-black text-blue-950">
                    ${displayPrice}
                  </span>
                  <span className="text-[7.5px] font-bold text-purple-800">
                    {billing === 'monthly'
                      ? `/ month ($${pkg.yearly.toLocaleString()}/yr)`
                      : `/ year ($${pkg.monthly}/mo)`}
                  </span>
                </div>

                <div className="mt-0.5 rounded bg-amber-50 border border-amber-300 px-1.5 py-0.5 text-[7px] font-black text-blue-950">
                  ${pkg.previousMonthly}/mo Base + ${pkg.eliteAddon}/mo Elite Pack Included
                </div>

                {/* Credits Allowance Pills */}
                <div className="mt-1 space-y-0.5 rounded-lg border border-purple-200 bg-white/95 p-1">
                  <div className="flex items-center gap-1 text-[7px] font-extrabold text-blue-950">
                    <Zap className="h-2.5 w-2.5 shrink-0 text-pink-600" />
                    <span>{pkg.messageCredits}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[7px] font-extrabold text-purple-900">
                    <Layers className="h-2.5 w-2.5 shrink-0 text-purple-600" />
                    <span>{pkg.integrationCredits}</span>
                  </div>
                </div>

                {/* Listed Benefits */}
                <ul className="mt-1.5 space-y-1">
                  {pkg.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-1 text-[7.3px] font-bold leading-tight text-blue-950">
                      <span
                        className="mt-0.5 flex h-3 w-3 shrink-0 items-center justify-center rounded-full text-white"
                        style={{ background: pkg.color }}
                      >
                        <Check className="h-2 w-2" />
                      </span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-2 pt-1 border-t border-purple-100">
                <Link
                  to="/register"
                  className="flex w-full items-center justify-center gap-1 rounded-lg px-2 py-1 text-[8px] font-black text-white shadow-sm transition-transform hover:-translate-y-0.5"
                  style={{ background: pkg.featured ? SQUISHED_GRADIENT : pkg.color }}
                >
                  Start 14-Day Free Trial
                  <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Standalone $355 Master Compliance Audit Checklist Option vs Free in Subscription */}
      {!compact && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50 via-white to-purple-50 p-2 shadow-sm">
          <div className="lg:col-span-3 flex items-center justify-center overflow-hidden rounded-lg border border-purple-300 bg-white p-2 shadow-sm">
            <Image
              src={DEFAULT_LOGO}
              alt="ComplianceHR Infinity Master Compliance Audit Checklists"
              fittingType="fit"
              className="h-24 sm:h-28 w-full object-contain"
            />
          </div>
          <div className="lg:col-span-9 space-y-1.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full bg-amber-400 px-2 py-0.5 text-[7.5px] font-black text-blue-950">
                $355 STANDALONE COMPLIANCE DOCUMENT PACK
              </span>
              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[7.5px] font-black text-white">
                100% INCLUDED IN EVERY SMART ENHANCED MONTHLY PLAN ABOVE
              </span>
            </div>
            <h4 className="text-xs sm:text-sm font-black text-blue-950">
              2026 ComplianceHR Infinity Master Compliance Audit Checklist Pack (`CHR-AUD-001` &amp; `CHR-AUD-002`) — 17 Audit Categories · 356 Checkpoints · 11 Pages
            </h4>
            <p className="text-[8px] font-semibold leading-snug text-blue-950">
              Need the official 11-page Master Compliance Audit Checklist on its own? Get both the **Governance &amp; NDIS Edition (`CHR-AUD-001`)** and **Workforce &amp; Operations Edition (`CHR-AUD-002`)** 356-checkpoint audit documents for **$355 standalone** — or subscribe to any **Smart Enhanced All-In-One Compliance Pack** ($660–$1,035/mo, including the $160/mo Elite Plan) and receive the interactive + printable PDF checklists **100% included**!
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <a
                href="#audit-master-doc"
                className="rounded-lg border-2 border-purple-600 bg-white px-2.5 py-1 text-[8px] font-black text-purple-950 hover:bg-purple-50"
              >
                Inspect Interactive 11-Page Checklists Above
              </a>
              <Link
                to="/register"
                className="inline-flex items-center gap-1 rounded-lg px-3 py-1 text-[8px] font-black text-white shadow-sm"
                style={{ background: SQUISHED_GRADIENT }}
              >
                Claim Free in 14-Day Trial <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Listed Platform-Wide Benefits Grid */}
      <div className="rounded-xl border border-purple-300 bg-purple-50/40 p-2 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-blue-950">
            Included Platform Benefits Across All Smart Enhanced ComplianceHR Infinity Packages
          </span>
          <span className="text-[7.5px] font-extrabold text-purple-800">
            +$160/mo Elite Plan Included · $355 Audit Doc Included · 14-Day Free Trial
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
          {CORE_PLATFORM_BENEFITS.map((b) => {
            const Icon = b.icon;
            return (
              <div
                key={b.title}
                className="flex items-start gap-2 rounded-lg border bg-white p-1.5 shadow-sm"
                style={{ borderColor: b.color, borderLeftWidth: '3px' }}
              >
                <span
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-white"
                  style={{ background: b.color }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <div className="text-[8.5px] font-black text-blue-950">{b.title}</div>
                  <p className="text-[7.5px] font-semibold leading-tight text-blue-900/85">{b.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}