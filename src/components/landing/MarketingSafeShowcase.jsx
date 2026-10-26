import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Award,
  FileCheck2,
  Tv,
  Monitor,
  Radio,
} from 'lucide-react';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import MustHaveFunctionsReview from '@/components/landing/MustHaveFunctionsReview';
import ScreenByScreenMasterAudit2026 from '@/components/compliance/ScreenByScreenMasterAudit2026';
import PricingSection from '@/components/landing/PricingSection';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import BeachDeepSeaWallShowcase from '@/components/safe/BeachDeepSeaWallShowcase';
import {
  getHeaderView,
  getTitleGradientView,
  getSymbolView,
  getAppBorderView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

const SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

// Pack 1 (zero slashes, no master doc mention) & Pack 2 (aligned & identical button sizing)
const PACKS = [
  {
    id: 'pack-1',
    icon: Sparkles,
    tvChannel: 'CHANNEL 7 · LIVE HD',
    nowPlayingLabel: 'Now Playing on Channel 7 (Changes Every 30 Secs):',
    badge: 'Pack 1 · Smart Enhanced All-In-One Subscription',
    pricePrefix: 'From',
    priceMain: '$660',
    priceSuffix: 'per month ($7,920 per year)',
    subtitle: 'Up to 20 Users ($500 Base + $160 Elite Included) · Scales to 101+ Users',
    bullets: [
      '1. Includes +$160 per month Elite Plan (2,500 Message & 20,000 Integration Credits)',
      '2. Includes 17 Audit Categories & 356 Mandatory Verification Checkpoints',
      '3. All 46 Connected Modules + Dual Interactive Office & Profile Workspace Views',
      '4. Smart Rostering, NDIS Price-Guide Invoicing, Payroll & 24h & 5d Incident Timers',
      '5. 14-Day $0 Upfront Free Trial + Consent-Gated External NDIS Auditor Portal',
    ],
    importantInfoTitle: 'Important Subscription Info & Accurate Tier Pricing',
    importantInfoRows: [
      'Up to 20 Users: $660 per month ($7,920 per year) · 21–30 Users: $723 per month',
      '31–40 Users: $785 per month ($9,420 per year) · 41–50 Users: $848 per month',
      '51–100 Users: $910 per month ($10,920 per year) · 101+ Users: $1,035 per month',
      'Includes 2,500 Message Credits + 20,000 Integration Credits + 356 Audit Checkpoints',
    ],
    primaryCta: { label: 'Start 14-Day Free Trial', to: '/register' },
    secondaryCta: { label: 'View All 6 User Tiers', href: '#pricing' },
  },
  {
    id: 'pack-2',
    icon: FileCheck2,
    tvChannel: 'CHANNEL 9 · LIVE HD',
    nowPlayingLabel: 'Now Playing on Channel 9 (Changes Every 30 Secs):',
    badge: 'Pack 2 · Outright Audit & Compliance Doc Pack',
    pricePrefix: 'Outright',
    priceMain: '$999',
    priceSuffix: 'or $125 per month',
    subtitle: 'Complete 125+ Document NDIS & Aged Care Library + 6 Structured Binders',
    bullets: [
      '1. Complete 125+ NDIS & Aged Care Policies, Procedures, Registers & Intake Forms',
      '2. Includes Governance (CHR-AUD-001) & Workforce (CHR-AUD-002) Checklists',
      '3. 6 Structured Compliance Binders + 12 Printable A4 Executive Office Templates',
      '4. Smart-Fill Auto-Branding with Organisation Logo, ABN, NDIS Number & Signatories',
      '5. Instant 1-Click PDF & CSV Audit Evidence Packs Ready for NDIS Commission Audits',
    ],
    importantInfoTitle: 'Important Outright Package Info & Inclusions',
    importantInfoRows: [
      'One-Off Outright Purchase: $999 Total · Or Flexible $125 per month Payment Plan',
      'Includes Both Governance (CHR-AUD-001) & Workforce (CHR-AUD-002) Checklists',
      'Covers All 17 NDIS Audit Categories & 356 Mandatory Verification Checkpoints',
      '100% Editable, Printable & Downloadable PDF & CSV Packs with Lifetime Updates',
    ],
    primaryCta: { label: 'Select $999 Outright', href: '#pricing' },
    secondaryCta: { label: 'Preview 125+ Docs', to: '/compliance' },
  },
];

export default function MarketingSafeShowcase({ embedded = false }) {
  const [activeBenefitIdx, setActiveBenefitIdx] = useState(0);
  const [litScreenIdx, setLitScreenIdx] = useState(0);

  // Light up Flat Screens one at a time every 2 seconds
  useEffect(() => {
    const lightTimer = setInterval(() => {
      setLitScreenIdx((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(lightTimer);
  }, []);

  // Changes every 30 seconds to cycle through the 5 reasons & package benefits
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBenefitIdx((prev) => (prev + 1) % 5);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={embedded ? 'w-full space-y-4' : 'w-full bg-white p-3 sm:p-4 space-y-4'}>
      {/* CENTERED "Why Every Provider Subscribes" */}
      <section
        className="w-full rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
          {/* Heading & Centered Black Subtitle Inside Stretched App Design Coloured Border */}
          <div
            className="w-full rounded-2xl p-[4px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="flex flex-col items-center justify-center w-full rounded-[12px] bg-white px-4 py-4 sm:px-6 sm:py-5 text-center space-y-2">
              <h2 className="mx-auto text-center font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug">
                <span className="text-[#0A2B6D]">Why Every Provider Subscribes to </span>
                <span className="text-[#0A2B6D]">Compliance</span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  HR
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </h2>

              <p
                className="mx-auto max-w-4xl text-center text-xs sm:text-sm font-extrabold leading-relaxed text-black"
                style={{ color: '#000000' }}
              >
                Replace 8 disconnected software subscriptions with one connected super-platform uniting all 46 live modules, 1-Click Operations, Screen-by-Screen 2026 Smart-Fill Audits, Business Health Intelligence, Core Risk &amp; Roster Engines, and our Outright Audit &amp; Compliance Doc Pack.
              </p>
            </div>
          </div>

          {/* Stretched Side-to-Side Banner Underneath in App Design Coloured Border */}
          <div
            className="w-full rounded-full p-[3px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="gradient-brand flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(1), color: '#FFFFFF' }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Sparkles className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>
                Executive Marketing &amp; Sales Suite · 14-Day Free Trial
              </span>
            </div>
          </div>

          {/* 4 High-Impact Subscriber Flat Screens — Lighting Up One at a Time & Changing Every 30 Secs (Centered Info, No Master Doc Mention) */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {[
              {
                screenLabel: 'FLAT SCREEN 01 · PLATFORM VALUE',
                icon: ShieldCheck,
                reasons: [
                  {
                    title: '46 Live Modules in One Subscription',
                    sub: '100% Connected Super-Platform · From $660 per month',
                    detail: 'Replaces 8 separate HR, Roster, CRM, LMS, Risk, Finance & Audit subscriptions.',
                    points: [
                      'Saves $1,400+ per month vs separate tools',
                      'Single login across Staff, Participants & Admins',
                      'Dual Executive Office & Profile Workspace views',
                    ],
                  },
                  {
                    title: 'Zero Double-Entry Across Every Shift',
                    sub: 'Intake → Profile → Roster → Note → Invoice',
                    detail: 'Enter a participant or employee once and auto-populate every connected register.',
                    points: [
                      '1-Click Intake-to-Profile onboarding engine',
                      'Rostered shifts flow straight into NDIS invoices',
                      'Shift notes automatically update Goal Progress',
                    ],
                  },
                  {
                    title: 'Strict Role-Based Security & Privacy',
                    sub: '115+ Protected Entities · Live RLS Locks',
                    detail: 'Every staff member, participant, manager and auditor sees only what their role permits.',
                    points: [
                      'Service-role locked 3-Part Participant Consents',
                      'Admin approval gate for new user registrations',
                      'Full tamper-evident user action & status logs',
                    ],
                  },
                  {
                    title: '100-Point Staff & Participant Readiness',
                    sub: 'Automated 90, 60 & 30-Day Expiry Protection',
                    detail: 'Never miss an NDIS Worker Screening, Blue Card, First Aid, CPR or Plan Review date.',
                    points: [
                      'Daily automated compliance expiry scanner',
                      'Roster gatekeeper blocks expired worker shifts',
                      'Instant email & in-app renewal alerts',
                    ],
                  },
                  {
                    title: '14-Day $0 Upfront Full-Access Trial',
                    sub: 'Try Every Module Live with Your Team',
                    detail: 'Experience all 46 connected modules, AI tools and printable packs before paying a cent.',
                    points: [
                      'Instant setup with pre-built NDIS templates',
                      'Includes +$160 per month Elite AI & Integration tier',
                      'Full access to all 356 audit verification checkpoints',
                    ],
                  },
                ],
              },
              {
                screenLabel: 'FLAT SCREEN 02 · EXPRESS AUDITS',
                icon: Zap,
                reasons: [
                  {
                    title: '2-Minute Express Internal Audits',
                    sub: 'Instant Branded PDF Pack · Audit Ready',
                    detail: 'Complete internal audits in minutes with attached evidence and auto-logged actions.',
                    points: [
                      'Covers Staff, Participant, Safety & Governance',
                      'Non-compliant items auto-create corrective tasks',
                      '1-Click PDF & CSV export for NDIS auditors',
                    ],
                  },
                  {
                    title: 'Consent-Gated External Auditor Portal',
                    sub: 'Dedicated Read-Only NDIS Auditor Workspace',
                    detail: 'Give external NDIS Commission auditors secure, consent-verified access in one click.',
                    points: [
                      'Enforces Participant & Staff Audit Consent flags',
                      'Maps live evidence to 8 NDIS Practice Standards',
                      'Eliminates weeks of manual folder preparation',
                    ],
                  },
                  {
                    title: '24-Hour & 5-Day NDIS Incident Timers',
                    sub: 'Automated Reportable Incident Compliance',
                    detail: 'Built-in countdown clocks ensure mandatory NDIS Commission timeframes are never breached.',
                    points: [
                      '24h initial notification & 5-day follow-up alerts',
                      'Guided root-cause investigation & photo evidence',
                      'Auto-links to Continuous Improvement Register',
                    ],
                  },
                  {
                    title: 'ISO 31000 Risk & Take-5 Safety Suite',
                    sub: 'Proactive Hazard & Home Risk Controls',
                    detail: 'Identify, rate and treat operational, clinical and WHS risks before incidents happen.',
                    points: [
                      'Eliminate, Minimise & Isolate control hierarchy',
                      '6-monthly Individual & Home Risk schedules',
                      'Mobile Pre-Shift Take-5 & vehicle safety checks',
                    ],
                  },
                  {
                    title: 'Automated 30-Action & 30-Task Batch Packs',
                    sub: 'Continuous Executive Oversight Reports',
                    detail: 'Every 30 actions or completed tasks automatically compiles a signed PDF & CSV audit batch.',
                    points: [
                      'Zero manual report writing for board meetings',
                      'Stored permanently in Data Control & Vault',
                      'Real-time compliance health score ring',
                    ],
                  },
                ],
              },
              {
                screenLabel: 'FLAT SCREEN 03 · 356 CHECKPOINTS',
                icon: Award,
                reasons: [
                  {
                    title: '356 Mandatory Audit Checkpoints',
                    sub: '17 Audit Categories · 125+ Compliance Docs',
                    detail: 'Every single NDIS & Aged Care verification checkpoint pre-mapped with live status.',
                    points: [
                      'Includes CHR-AUD-001 (Governance & Operations)',
                      'Includes CHR-AUD-002 (Workforce & Clinical)',
                      'Available in Subscription or $999 Outright Pack',
                    ],
                  },
                  {
                    title: '6 Structured Binders + 12 A4 Templates',
                    sub: '2026 Standard Printable Templates Suite',
                    detail: 'Print or download courtroom-grade A4 policies, registers, contracts and intake forms.',
                    points: [
                      'Auto-stamped with your Logo, ABN & NDIS ID',
                      'Digital signature pads & version acknowledgements',
                      'Ready for mid-term & renewal certification audits',
                    ],
                  },
                  {
                    title: 'Smart Rostering & SCHADS Gatekeeper',
                    sub: 'Fatigue, Qualification & Budget Protection',
                    detail: 'Match the right support worker to every participant shift with live compliance checks.',
                    points: [
                      'Flags unscreened or fatigued workers automatically',
                      'Live coverage heatmaps & labour cost forecasting',
                      '2-way Google Calendar & iCal shift sync',
                    ],
                  },
                  {
                    title: 'NDIS Price-Guide Invoicing & Payroll',
                    sub: 'End-to-End Financial & Claim Accuracy',
                    detail: 'Generate NDIS-compliant invoices, quotes, pay runs and payslips without spreadsheets.',
                    points: [
                      'Built-in NDIS Support Item & Price Guide lookup',
                      'AI Receipt Scanner with GST & NDIS categorisation',
                      '3-Way Procurement Match & Bank Reconciliation',
                    ],
                  },
                  {
                    title: 'Complete HR, LMS Training & Appraisals',
                    sub: 'Retain & Upskill Your Support Workforce',
                    detail: 'Manage recruitment, digital contracts, competency quizzes, certificates and appraisals.',
                    points: [
                      'Interactive LMS with AI Course & Quiz Generator',
                      'Auto-issued PDF Training Certificates on pass',
                      'Gamified Task Leaderboard & Staff Recognition',
                    ],
                  },
                ],
              },
              {
                screenLabel: 'FLAT SCREEN 04 · AI & AUTOMATION',
                icon: Sparkles,
                reasons: [
                  {
                    title: 'AI Smart-Fill & +$160 Elite Included',
                    sub: '2,500 Message + 20,000 Integration Credits',
                    detail: 'Every subscription tier includes the Elite AI & Automation plan built right into the price.',
                    points: [
                      '1-Click Smart-Fill across forms, audits & letters',
                      'AI Assistant for instant policy & NDIS answers',
                      '65+ live automated workflows running 24/7',
                    ],
                  },
                  {
                    title: '1-Click Executive Operations Centre',
                    sub: '12 Armed Instant Compliance & Roster Sweeps',
                    detail: 'Run a full organisation-wide compliance, expiry, risk and roster sweep in one click.',
                    points: [
                      'Instant Master Sweep across all 46 modules',
                      'Auto-dispatches reminders to staff & managers',
                      'Live execution log with timestamped proof',
                    ],
                  },
                  {
                    title: 'Accessible Visual Boards & Goal Coach',
                    sub: 'Built for Participant Empowerment & Choice',
                    detail: 'Empower participants with interactive visual routines, speech pads and AI goal coaching.',
                    points: [
                      'Text-to-Speech Communication & Weather Boards',
                      'Multilingual Translator & Auslan Sign Prompts',
                      'NDIS Funding Utilisation & Goal Outcome charts',
                    ],
                  },
                  {
                    title: 'Unified Communication & Shift Diary',
                    sub: 'Zero Lost Messages or Handover Gaps',
                    detail: 'Keep shift notes, broadcasts, complaints, video calls and emails in one audited hub.',
                    points: [
                      'AI Compose for professional letters & shift notes',
                      '5-Day Complaint SLA tracker & escalation alerts',
                      'Daily AI Briefing & Weather bar for every shift',
                    ],
                  },
                  {
                    title: 'Seamless CSV & Excel Data Exchange',
                    sub: 'Migrate & Export Any Register in Seconds',
                    detail: 'Bring your existing staff, participants and documents over effortlessly with guided imports.',
                    points: [
                      'Bulk intake & resume upload with AI extraction',
                      '1-Click CSV & PDF export on every register',
                      'Bi-directional GitHub & calendar integrations',
                    ],
                  },
                ],
              },
            ].map((screen, idx) => {
              const Icon = screen.icon;
              const isLit = litScreenIdx === idx;
              const sym = getSymbolView(idx + 1);
              const borderCol = isLit ? '#00C6FF' : getAppBorderView(idx + 1);
              const activeReason = screen.reasons[activeBenefitIdx % screen.reasons.length];
              return (
                <div key={screen.screenLabel} className="flex h-full flex-col items-center justify-between">
                  {/* Flat Screen Monitor Frame — Lights Up One at a Time */}
                  <div
                    className={`flex h-full w-full flex-1 flex-col justify-between rounded-2xl border-[3px] p-2.5 transition-all duration-300 ${
                      isLit
                        ? 'bg-[#0072FF] -translate-y-0.5 ring-4 ring-[#00C6FF]/75 shadow-xl'
                        : 'bg-[#0A2B6D] shadow-md'
                    }`}
                    style={{ borderColor: borderCol }}
                  >
                    {/* Top Monitor Bezel Bar */}
                    <div className="mb-1.5 flex items-center justify-between gap-1 px-1.5">
                      <span className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-white">
                        <Monitor className="h-3 w-3 text-[#00C6FF]" />
                        {isLit ? `SCREEN 0${idx + 1} · LIT UP ✦` : screen.screenLabel}
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[8.5px] font-extrabold text-white">
                        <Radio className="h-2.5 w-2.5 text-[#FF2E9A]" />
                        30s · {(activeBenefitIdx % 5) + 1}/5
                      </span>
                    </div>

                    {/* Inner Monitor Display — All Info Centered */}
                    <div
                      className="flex flex-1 rounded-xl p-[2.5px]"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="flex h-full w-full flex-col items-center justify-between gap-2 rounded-[10px] p-3 text-center text-[#0A2B6D]"
                        style={{ background: SPRAY_BGS[idx % SPRAY_BGS.length] }}
                      >
                        {/* Live 30s Reason Banner */}
                        <div className="flex w-full items-center justify-between gap-1 rounded-full border border-[#0A2B6D]/20 bg-white px-2.5 py-0.5">
                          <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                            Reason #{(activeBenefitIdx % 5) + 1} of 5
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveBenefitIdx((prev) => (prev + 1) % 5)}
                            className="rounded-full bg-[#5A00D6] px-2.5 py-0.5 text-[8.5px] font-extrabold text-white hover:opacity-90"
                            style={{ color: '#FFFFFF' }}
                          >
                            Next ▸
                          </button>
                        </div>

                        {/* Centered Icon + Title Box */}
                        <div
                          className="w-full rounded-xl p-[2px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-[9px] bg-white px-2.5 py-2 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <span
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-white shadow-2xs"
                                style={{ borderColor: getAppBorderView(idx + 1) }}
                              >
                                <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                              </span>
                              <div className="text-center text-xs sm:text-[13px] font-extrabold leading-tight text-[#0A2B6D]">
                                {activeReason.title}
                              </div>
                            </div>
                            <div className="text-center text-[10.5px] font-extrabold text-[#5A00D6]">
                              {activeReason.sub}
                            </div>
                          </div>
                        </div>

                        {/* Centered Summary Explanation */}
                        <div className="flex min-h-[52px] w-full items-center justify-center rounded-xl border border-[#0A2B6D]/15 bg-white/95 px-2.5 py-1.5 text-center">
                          <p
                            className="text-center text-[11px] font-extrabold leading-snug text-black"
                            style={{ color: '#000000' }}
                          >
                            {activeReason.detail}
                          </p>
                        </div>

                        {/* 3 Centered Subscriber Proof Points */}
                        <ul className="w-full space-y-1 text-center">
                          {activeReason.points.map((pt) => (
                            <li
                              key={pt}
                              className="flex min-h-[34px] items-center justify-center gap-1.5 rounded-lg border border-[#0A2B6D]/20 bg-white/95 px-2 py-1 text-center text-[10px] font-extrabold leading-tight text-[#0A2B6D]"
                            >
                              <CheckCircle2 className="h-3 w-3 shrink-0 text-[#FF2E9A]" />
                              <span className="text-center">{pt}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Monitor Channel Dots */}
                    <div className="mt-1.5 flex items-center justify-between px-2">
                      <span className="text-[8.5px] font-extrabold uppercase tracking-wider text-white/90">
                        CHANGES EVERY 30 SECS
                      </span>
                      <div className="flex items-center gap-1">
                        {[0, 1, 2, 3, 4].map((dot) => (
                          <button
                            key={dot}
                            type="button"
                            aria-label={`Show subscriber reason ${dot + 1}`}
                            onClick={() => setActiveBenefitIdx(dot)}
                            className={`h-1.5 w-1.5 rounded-full transition-all ${
                              activeBenefitIdx % 5 === dot ? 'bg-[#FF2E9A] scale-125' : 'bg-white/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Flat Screen Monitor Stand Neck & Base */}
                  <div className="h-2 w-6 bg-[#0A2B6D]" />
                  <div
                    className="h-1.5 w-16 rounded-full border border-[#0A2B6D]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  />
                </div>
              );
            })}
          </div>

          {/* Pack 1 (Channel 7 TV) & Pack 2 (Channel 9 TV) — Lined Up, Constantly Lit Up, Centered Writing & Identical Button Sizes */}
          <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
            {PACKS.map((pack, pIdx) => {
              const PackIcon = pack.icon;
              const currentSpotlight = pack.bullets[activeBenefitIdx % pack.bullets.length];
              return (
                <div
                  key={pack.id}
                  className="flex h-full rounded-2xl p-[4px] shadow-sm"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex h-full w-full flex-col justify-between rounded-[12px] bg-white p-4 sm:p-5 text-center space-y-3.5">
                    {/* Top Aligned Header Badge */}
                    <div
                      className="w-full rounded-full p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <span
                        className="gradient-brand inline-flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
                        style={{ background: getHeaderView(pIdx * 2 + 2), color: '#FFFFFF' }}
                      >
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                          <PackIcon className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                        </span>
                        <span className="text-center" style={{ color: '#FFFFFF' }}>{pack.badge}</span>
                      </span>
                    </div>

                    {/* Constantly Lit Live HD Widescreen TV Screen: Channel 7 on TV 1, Channel 9 on TV 2 */}
                    <div className="flex w-full flex-col items-center">
                      <div
                        className="flex w-full flex-col justify-between rounded-[22px] border-[4px] bg-[#0072FF] p-3 ring-4 ring-[#00C6FF]/75 shadow-xl"
                        style={{ borderColor: '#00C6FF' }}
                      >
                        {/* Top TV Bezel Status Bar — Constantly Lit */}
                        <div className="mb-2 flex items-center justify-between px-2">
                          <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                            <Tv className="h-3.5 w-3.5 text-[#FFF3FA]" />
                            {pack.tvChannel} · LIT UP ✦
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[9px] font-extrabold text-white">
                            <Radio className="h-2.5 w-2.5 text-[#FF2E9A]" />
                            30s Auto-Cycle · Benefit {(activeBenefitIdx % 5) + 1} of 5
                          </span>
                        </div>

                        {/* Inner TV Screen */}
                        <div
                          className="flex flex-col justify-between rounded-2xl p-[3px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div
                            className="flex flex-col justify-between rounded-[13px] p-3 text-center space-y-2.5"
                            style={{ background: SPRAY_BGS[pIdx % SPRAY_BGS.length] }}
                          >
                            {/* Strict Fixed-Height 30-Second Spotlight Banner */}
                            <div
                              className="w-full rounded-xl p-[2px] shadow-2xs"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            >
                              <div
                                className="gradient-brand flex min-h-[68px] flex-col items-center justify-center gap-1 rounded-[9px] px-3 py-1.5 text-center text-white sm:flex-row sm:justify-between"
                                style={{ background: getHeaderView((activeBenefitIdx + pIdx) % 8), color: '#FFFFFF' }}
                              >
                                <div className="min-w-0 flex-1 text-center">
                                  <div
                                    className="text-[9.5px] font-extrabold uppercase tracking-wider text-white"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    {pack.nowPlayingLabel}
                                  </div>
                                  <div
                                    className="text-[11px] font-extrabold leading-tight text-white"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    {currentSpotlight}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setActiveBenefitIdx((prev) => (prev + 1) % 5)}
                                  className="shrink-0 rounded-full border border-white bg-white/20 px-2.5 py-0.5 text-[9.5px] font-extrabold text-white hover:bg-white/30"
                                  style={{ color: '#FFFFFF' }}
                                >
                                  Next ▸
                                </button>
                              </div>
                            </div>

                            {/* All 5 Package Benefits with Equal Row Heights So Pack 1 & Pack 2 Line Up */}
                            <ul className="grid w-full grid-cols-1 grid-rows-5 gap-1.5 text-center text-xs font-extrabold">
                              {pack.bullets.map((line, idx) => {
                                const sym = getSymbolView(pIdx * 3 + idx);
                                const borderCol = getAppBorderView(pIdx * 3 + idx);
                                const isCurrent = idx === activeBenefitIdx % 5;
                                return (
                                  <li
                                    key={line}
                                    onClick={() => setActiveBenefitIdx(idx)}
                                    className="flex min-h-[48px] cursor-pointer rounded-xl p-[2px] shadow-2xs transition-all"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <div
                                      className={`flex h-full w-full items-center justify-center gap-2 rounded-[9px] px-2.5 py-1 text-center ${
                                        isCurrent ? 'bg-white ring-2 ring-[#FF2E9A]' : 'bg-white/95'
                                      }`}
                                    >
                                      <span
                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white"
                                        style={{ borderColor: borderCol }}
                                      >
                                        <CheckCircle2 className="h-3 w-3" style={{ color: sym.iconColor }} />
                                      </span>
                                      <span className="flex-1 text-center text-[10.5px] font-extrabold leading-tight text-[#0A2B6D]">
                                        {line}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>

                        {/* Bottom TV Speaker Bar & Channel Dots */}
                        <div className="mt-2 flex h-[20px] items-center justify-between px-3">
                          <span className="text-[9px] font-extrabold tracking-widest text-white">
                            {pack.tvChannel} · CONSTANTLY LIT HD
                          </span>
                          <div className="flex items-center gap-1.5">
                            {[0, 1, 2, 3, 4].map((dot) => (
                              <button
                                key={dot}
                                type="button"
                                aria-label={`Show benefit ${dot + 1}`}
                                onClick={() => setActiveBenefitIdx(dot)}
                                className={`h-2 w-2 rounded-full transition-all ${
                                  activeBenefitIdx % 5 === dot ? 'bg-[#FF2E9A] scale-125' : 'bg-white/60'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* TV Pedestal Neck & Stand Base */}
                      <div className="h-2.5 w-12 bg-[#0A2B6D]" />
                      <div
                        className="h-2 w-28 rounded-full border-2 border-[#0A2B6D] shadow-sm"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      />
                    </div>

                    {/* Important Package Info & Accurate Prices Below TV — Strict Fixed Heights So Pack 1 & Pack 2 Line Up */}
                    <div
                      className="flex w-full flex-1 flex-col justify-between rounded-2xl p-[3px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="flex h-full flex-col justify-between rounded-[13px] p-3.5 text-center space-y-2.5"
                        style={{ background: SPRAY_BGS[(pIdx + 1) % SPRAY_BGS.length] }}
                      >
                        {/* Strict Fixed-Height Price Box */}
                        <div
                          className="w-full rounded-xl p-[2.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[90px] flex-col items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center">
                            <div className="flex flex-wrap items-baseline justify-center gap-2">
                              <span className="text-xs font-extrabold uppercase text-[#0072FF]">
                                {pack.pricePrefix}
                              </span>
                              <span
                                className="font-editorial text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent"
                                style={{ backgroundImage: getTitleGradientView(pIdx) }}
                              >
                                {pack.priceMain}
                              </span>
                              <span className="text-xs font-extrabold text-[#5A00D6]">
                                {pack.priceSuffix}
                              </span>
                            </div>
                            <p
                              className="mt-1 text-center text-[10.5px] font-extrabold leading-tight text-black"
                              style={{ color: '#000000' }}
                            >
                              {pack.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Important Info Header & 4 Equal Rows */}
                        <div className="space-y-1.5 text-center">
                          <div
                            className="w-full rounded-lg p-[2px]"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          >
                            <div
                              className="gradient-brand flex min-h-[34px] items-center justify-center rounded-[6px] px-3 py-1 text-center text-[10.5px] font-extrabold uppercase tracking-wider text-white"
                              style={{ background: getHeaderView(pIdx + 4), color: '#FFFFFF' }}
                            >
                              <span style={{ color: '#FFFFFF' }}>{pack.importantInfoTitle}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 grid-rows-4 gap-1">
                            {pack.importantInfoRows.map((info) => (
                              <div
                                key={info}
                                className="flex min-h-[38px] items-center justify-center gap-1.5 rounded-lg border border-[#0A2B6D]/25 bg-white px-2.5 py-1 text-center text-[10px] font-extrabold leading-tight text-black"
                                style={{ color: '#000000' }}
                              >
                                <CheckCircle2 className="h-3 w-3 shrink-0 text-[#5A00D6]" />
                                <span className="text-center text-black" style={{ color: '#000000' }}>{info}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package Action Buttons — Compact & Identical Height Across Pack 1 & Pack 2 */}
                    <div className="grid w-full grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {pack.primaryCta.to ? (
                        <Link
                          to={pack.primaryCta.to}
                          className="gradient-brand inline-flex h-[38px] w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 whitespace-nowrap"
                          style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                          <span style={{ color: '#FFFFFF' }}>{pack.primaryCta.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={pack.primaryCta.href}
                          className="gradient-brand inline-flex h-[38px] w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 whitespace-nowrap"
                          style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                        >
                          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                          </span>
                          <span style={{ color: '#FFFFFF' }}>{pack.primaryCta.label}</span>
                        </a>
                      )}

                      {pack.secondaryCta.to ? (
                        <Link
                          to={pack.secondaryCta.to}
                          className="gradient-brand inline-flex h-[38px] w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 whitespace-nowrap"
                          style={{ background: getHeaderView(3), color: '#FFFFFF' }}
                        >
                          <span style={{ color: '#FFFFFF' }}>{pack.secondaryCta.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={pack.secondaryCta.href}
                          className="gradient-brand inline-flex h-[38px] w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5 whitespace-nowrap"
                          style={{ background: getHeaderView(3), color: '#FFFFFF' }}
                        >
                          <span style={{ color: '#FFFFFF' }}>{pack.secondaryCta.label}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1. Full Review of Must-Have Features */}
      <MustHaveFunctionsReview />

      {/* 2. One-Click Operations */}
      <div
        id="infinity-one-click-operations"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <InfinityOneClickOperations />
        </div>
      </div>

      {/* 3. Screen-by-Screen Audit */}
      <div
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <ScreenByScreenMasterAudit2026 />
        </div>
      </div>

      {/* 4. Business Health & Compliance Intelligence */}
      <div
        id="business-health-intelligence"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <BusinessHealthComplianceIntelligenceDashboard />
        </div>
      </div>

      {/* 5. Core Engines */}
      <div
        id="infinity-core-engine"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <InfinityCoreEngine />
        </div>
      </div>

      {/* 6. Unified Oversight */}
      <div
        id="infinity-control-centre"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4">
          <InfinityControlCentreMasterSuite />
        </div>
      </div>

      {/* 7. Office View + Beach Scene */}
      <div
        id="live-workspace"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] bg-white p-3 sm:p-4 space-y-4">
          <ExecutiveWallScene showAllModulesMinimised={true} />
          <BeachDeepSeaWallShowcase defaultScene="all" compact={true} />
        </div>
      </div>

      {/* 8. Price and Packaging */}
      <PricingSection />
    </div>
  );
}