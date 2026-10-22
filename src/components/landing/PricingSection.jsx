import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Check, Sparkles, ShieldCheck, Zap, Layers, Users,
  ClipboardCheck, Lock, TrendingUp, RefreshCw, Award, Building2,
} from 'lucide-react';
import { Image } from '@/components/ui/image';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';
const DEFAULT_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';
const FULL_SLOGAN = 'Complete Control. Greater Confidence. Brighter Success.';

export const COMPLIANCE_HR_PACKAGES = [
  {
    id: 'free-test',
    name: 'Free Trial & Test Plan',
    badge: '$0 Upfront · Start Today',
    users: 'Up to 5 test users',
    monthly: 0,
    yearly: 0,
    messageCredits: '100 message credits / mo',
    integrationCredits: '500 integration credits / mo',
    color: '#0ea5e9',
    tagline: 'Test & explore ComplianceHR Infinity with zero upfront costs before scaling up.',
    benefits: [
      '$0 upfront cost — no lock-in contract required',
      'Preview both Enhanced Office View & General Profile View',
      'Test Employee & Participant profile workflows',
      'Explore Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'Upgrade seamlessly to any plan as your organisation grows',
    ],
  },
  {
    id: 'starter',
    name: 'Starter Provider Plan',
    badge: 'Small Teams',
    users: 'Up to 15 users',
    monthly: 79,
    yearly: 790,
    messageCredits: '1,000 message credits / mo',
    integrationCredits: '8,000 integration credits / mo',
    color: '#2563eb',
    tagline: 'Essential NDIS & HR compliance for emerging providers and boutique teams.',
    benefits: [
      'Employee & Participant Profiles with NDIS Screening Alerts',
      'Daily Rostering, Shift Notes & Unified Communication Diary',
      'Master Compliance Audit Checklist (17 Categories · 356 Checkpoints)',
      'Incident Clinic, Risk Register & Take-5 Safety Checks',
      'Company Safe & Smart Document Vault with expiry tracking',
    ],
  },
  {
    id: 'growth',
    name: 'Growth Provider Plan',
    badge: 'Growing Providers',
    users: '16–30 users',
    monthly: 119,
    yearly: 1190,
    messageCredits: '1,750 message credits / mo',
    integrationCredits: '14,000 integration credits / mo',
    color: '#7c3aed',
    tagline: 'Full operational automation, HR academy, invoicing and multi-team workflows.',
    benefits: [
      'Everything in Starter + 16 Communication Centre Modulars',
      'Shared To-Do Command Board, Digital Sign-Offs & Leaderboard',
      'Training Academy, AI Competency Quizzes & Staff Certificates',
      'NDIS Price Guide Invoicing, Quotes, Receipts & Bank Match',
      'Automated 24h / 5d NDIS Reportable Incident & Expiry Workflows',
    ],
  },
  {
    id: 'elite',
    name: 'Elite Plan',
    badge: 'Most Popular · Best Value',
    users: '31–60 users',
    monthly: 160,
    yearly: 1600,
    messageCredits: '2,500 message credits / mo',
    integrationCredits: '20,000 integration credits / mo',
    color: '#db2777',
    featured: true,
    tagline:
      'Complete 45-module power with 2,500 message credits & 20,000 integration credits.',
    benefits: [
      '2,500 Message Credits & 20,000 Integration Credits included monthly',
      'All 45 ComplianceHR Infinity Modules + Dual Office & Profile Views',
      'Master Compliance Audit Forms (17 Audit Categories · 356 Checkpoints)',
      '1-Click NDIS Audit Evidence Pack, Weekly Audit PDF & Board Reports',
      'AI Assistant, AI Compose, Automated Escalations & Staff Badge Studio',
      'No upfront setup fees — flexible month-to-month or annual scaling',
    ],
  },
  {
    id: 'scale',
    name: 'Enterprise Scale Plan',
    badge: 'Multi-Site & 60+ Staff',
    users: '61–150+ users',
    monthly: 240,
    yearly: 2400,
    messageCredits: '5,000 message credits / mo',
    integrationCredits: '50,000 integration credits / mo',
    color: '#16a34a',
    tagline: 'High-volume credits, multi-branch governance & dedicated auditor portal.',
    benefits: [
      'Everything in Elite + 5,000 Message & 50,000 Integration Credits',
      'External NDIS Auditor Portal with granular consent-gated access',
      'Multi-site Roster Labour Forecasting, Payroll & 3-Way Procurement Match',
      'Unlimited Automated 30-Action & 30-Task Compliance Batch Reports',
      'Priority onboarding, data migration & custom branding support',
    ],
  },
];

export const CORE_PLATFORM_BENEFITS = [
  {
    icon: ShieldCheck,
    title: '100% Audit-Ready Every Day',
    desc: '17 Audit Categories & 356 Checkpoints mapped live across all 8 NDIS Practice Standards with 1-click PDF evidence packs.',
    color: '#6d28d9',
  },
  {
    icon: Zap,
    title: '$0 Upfront · Scale As You Grow',
    desc: 'Start and test with zero upfront costs. Scale smoothly to the $160/mo Elite Plan (2,500 message & 20,000 integration credits).',
    color: '#db2777',
  },
  {
    icon: Layers,
    title: 'All 45 Connected Modules',
    desc: 'People, Intake, Roster, Comms, Incidents, Risks, HR, Training, Invoicing, Company Safe and Smart Vault in one platform.',
    color: '#2563eb',
  },
  {
    icon: ClipboardCheck,
    title: 'Express 2-Minute Audits',
    desc: 'Auto-linked employee credentials, participant consents, fire drills, vehicle checks and corrective actions.',
    color: '#0d9488',
  },
  {
    icon: Lock,
    title: 'Strict Role-Based Security',
    desc: 'Granular role permissions for Admins, Team Leaders, Support Workers, Finance, HR, Participants and External Auditors.',
    color: '#ea580c',
  },
  {
    icon: RefreshCw,
    title: 'Automated Reminders & AI',
    desc: '20,000 integration credits power scheduled expiry scans, shift alerts, overdue task reminders, and AI document tools.',
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
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
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
                ComplianceHR Infinity · Fair Packages &amp; Listed Benefits
              </span>
              <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[8px] font-black text-blue-950">
                ELITE PLAN: $160 / MONTH
              </span>
            </div>
            <p className="text-[9px] font-bold text-amber-100">
              Build and test without any upfront costs, with the option to scale up as your needs grow · {FULL_SLOGAN}
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
            Monthly Plan
          </button>
          <button
            type="button"
            onClick={() => setBilling('yearly')}
            className={`rounded-full px-2.5 py-0.5 text-[8.5px] font-extrabold transition-all ${
              billing === 'yearly' ? 'bg-white text-blue-950 shadow-sm' : 'text-white hover:bg-white/15'
            }`}
          >
            Annual (2 Months Free)
          </button>
        </div>
      </div>

      {/* Highlighted Elite Plan Benchmark Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-pink-500 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow"
            style={{ background: SQUISHED_GRADIENT }}
          >
            <Sparkles className="h-4 w-4" />
          </span>
          <div>
            <div className="text-[11px] font-black text-blue-950">
              Featured Benchmark — Elite Plan: $160 per month (2,500 Message Credits &amp; 20,000 Integration Credits)
            </div>
            <div className="text-[8.5px] font-bold text-purple-900">
              Start free with $0 upfront cost, test every workflow with your team, and scale fairly as your participant and staff numbers grow.
            </div>
          </div>
        </div>
        <Link
          to="/register"
          className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[9px] font-black text-white shadow-sm"
          style={{ background: SQUISHED_GRADIENT }}
        >
          Start $0 Free Trial <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Package Cards Grid — Zero Wasted Space */}
      <div className={`grid grid-cols-1 md:grid-cols-3 ${compact ? 'lg:grid-cols-5' : 'lg:grid-cols-5'} gap-1.5 items-stretch`}>
        {COMPLIANCE_HR_PACKAGES.map((pkg) => {
          const price = billing === 'monthly' ? pkg.monthly : Math.round(pkg.yearly / 12);
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
                {/* Top Badge & Plan Name */}
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-white"
                    style={{ background: pkg.featured ? SQUISHED_GRADIENT : pkg.color }}
                  >
                    {pkg.badge}
                  </span>
                  <span className="text-[7.5px] font-extrabold text-purple-900">{pkg.users}</span>
                </div>

                <h3 className="mt-1 text-xs font-black text-blue-950">{pkg.name}</h3>

                {/* Price Display */}
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="font-editorial text-xl sm:text-2xl font-black text-blue-950">
                    ${price}
                  </span>
                  <span className="text-[8px] font-bold text-purple-800">
                    / month {billing === 'yearly' && pkg.yearly > 0 ? `($${pkg.yearly}/yr)` : ''}
                  </span>
                </div>

                <p className="mt-0.5 text-[7.8px] font-semibold leading-tight text-blue-900">
                  {pkg.tagline}
                </p>

                {/* Credits Allowance Pills */}
                <div className="mt-1.5 space-y-0.5 rounded-lg border border-purple-200 bg-white/90 p-1">
                  <div className="flex items-center gap-1 text-[7.5px] font-extrabold text-blue-950">
                    <Zap className="h-2.5 w-2.5 shrink-0 text-pink-600" />
                    <span>{pkg.messageCredits}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[7.5px] font-extrabold text-purple-900">
                    <Layers className="h-2.5 w-2.5 shrink-0 text-purple-600" />
                    <span>{pkg.integrationCredits}</span>
                  </div>
                </div>

                {/* Listed Benefits */}
                <ul className="mt-1.5 space-y-1">
                  {pkg.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-1 text-[7.5px] font-bold leading-tight text-blue-950">
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
                  {pkg.monthly === 0 ? 'Start Free ($0 Upfront)' : `Choose ${pkg.name}`}
                  <ArrowRight className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Listed Platform-Wide Benefits Grid */}
      <div className="rounded-xl border border-purple-300 bg-purple-50/40 p-2 space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="text-[9px] font-black uppercase tracking-wider text-blue-950">
            Included Platform Benefits Across All ComplianceHR Infinity Packages
          </span>
          <span className="text-[7.5px] font-extrabold text-purple-800">
            No upfront setup fees · Cancel or scale tier anytime · Full NDIS &amp; HR compliance
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