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

const BRIGHT_PINK_WHITE_SPRAY =
  'radial-gradient(circle at 18% 22%, rgba(255, 46, 154, 0.78) 0%, rgba(255, 110, 219, 0.52) 38%, rgba(255, 255, 255, 0.98) 74%), radial-gradient(circle at 82% 78%, rgba(255, 46, 154, 0.74) 0%, rgba(255, 133, 224, 0.48) 42%, #FFFFFF 100%)';

const SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

// Pack 1 & Pack 2 — Updated Tier Pricing ($760, $820, $920, $999, $1,100), No Yearly Sums, Two Price Points Per Tile Line
const PACKS = [
  {
    id: 'pack-1',
    icon: Sparkles,
    tvChannel: 'CHANNEL 7 · LIVE HD',
    nowPlayingLabel: 'Now Playing',
    badgeLine1: 'Pack 1 · Smart Enhanced',
    badgeLine2: '& All-In-One Subscription',
    topPriceHeading: 'ComplianceHR Subscription',
    priceMain: '$760',
    priceSuffix: 'per month',
    subtitle:
      'Per month, up to 20 users · Includes Elite Package Tokens ($160/mo value) · Full access to ComplianceHR app & over 100 downloadable documents tailored to Business Details (WHS, Risk, Incident, Medication, Support Plan, Consents, Intake, Policies, Procedures, Registers & Business Plans)',
    bullets: [
      '1. Includes Elite Package Tokens valued at $160 per a month (1,200 Message Credits & 50,000 Integration Credits)',
      '2. Full access to over 100 documents downloadable at any stage & tailored to Business Details',
      '3. Includes WHS, Risk, Incident, Medication, Waste, Support Plan, Service Delivery, Infection Control & Continuity',
      '4. Includes Staff Training, Consents, Intake (Employee & Participant), Progress, Skills, Review, Policies, Registers & Business Plans',
      '5. All 46 Connected Modules + Smart Rostering, NDIS Invoicing, Payroll & 14-Day Free Trial',
    ],
    importantInfoTitle: 'Important Subscription Info & Included Document Suite',
    importantInfoRows: [
      'Up to 20 Users: $760 per a month · 21–30 Users: $820 per a month',
      '31–40 Users: $920 per a month · 41–50 Users: $999 per a month',
      '51–100 Users: $1,100 per a month · 101+ Users: $1,220 per a month',
      'Includes 100+ tailored documents (WHS, Risk, Incident, Medication, Intake, Policies, Registers & Business Plans) + 1,200 Msg & 50,000 Int. Credits',
    ],
    primaryCta: { label: 'Start 14-Day Free Trial', to: '/register' },
    secondaryCta: { label: 'View All 6 User Tiers', href: '#pricing' },
  },
  {
    id: 'pack-2',
    icon: FileCheck2,
    tvChannel: 'CHANNEL 9 · LIVE HD',
    nowPlayingLabel: 'Now Playing',
    badgeLine1: 'Pack 2 · Outright Audit',
    badgeLine2: '& Compliance Documents Pack',
    topPriceHeading: 'ComplianceHR',
    priceMain: '$999',
    priceSuffix: 'or $125 per a month subscription (24 month contract)',
    subtitle:
      'Full access to document suite · Document access, tailor business details, only · Downloadable at any stage (over 100 documents) · No payment plan on $999',
    bullets: [
      '1. Full access to over 100 documents, downloadable at any stage & tailored to Business Details',
      '2. Includes WHS, Risk, Incident, Medication, Waste, Support Plan & Service Delivery',
      '3. Includes Infection Control, Continuity, Staff Training Modules & Consents',
      '4. Includes Intake Employee, Intake Participant, Progress, Skill Assessments & Review',
      '5. Includes Conflict, Safe Meal Management, Policies, Procedures, Registers & Business Plans',
    ],
    importantInfoTitle: 'Important Document Package Info & Inclusions',
    importantInfoRows: [
      '$999 Outright (no payment plan) · $125 per a month subscription (24 month contract)',
      'Full access to document suite · Document access & tailor business details only',
      'WHS, Risk, Incident, Medication, Waste, Support Plan, Service Delivery, Infection Control & Continuity',
      'Staff Training, Consents, Intake (Employee & Participant), Progress, Skills, Review, Conflict, Safe Meal, Policies, Procedures, Registers & Business Plans',
    ],
    primaryCta: { label: 'Select $999 or $125/mo', href: '#pricing' },
    secondaryCta: { label: 'View 100+ Documents', to: '/compliance' },
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
        <div
          className="flex w-full flex-col items-center justify-center rounded-[16px] px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4"
          style={{ background: SPRAY_BGS[0] }}
        >
          {/* Heading & Subtitle on Clean White Background */}
          <div
            className="w-full rounded-2xl p-[3px] shadow-sm"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="flex flex-col items-center justify-center w-full rounded-[11px] bg-white px-4 py-3 sm:px-6 sm:py-3.5 text-center space-y-1.5">
              <h2 className="mx-auto text-center font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold leading-snug">
                <span className="text-[#0A2B6D]">Why Every Provider Subscribes to </span>
                <span className="bg-gradient-to-r from-[#00C6FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  Compliance
                </span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  HR
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Infinity
                </span>
              </h2>

              <p className="mx-auto max-w-4xl text-center text-xs sm:text-sm font-extrabold leading-relaxed text-[#0A2B6D]">
                Replace 8 disconnected software subscriptions with one connected super-platform uniting all 46 live modules, 1-Click Operations, Screen-by-Screen 2026 Smart-Fill Audits, Business Health Intelligence, Core Risk &amp; Roster Engines, and our Outright Audit &amp; Compliance Doc Pack.
              </p>
            </div>
          </div>

          {/* Minimised Stretched Side-to-Side Executive Marketing Banner */}
          <div
            className="w-full rounded-full p-[2px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div
              className="gradient-brand flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full px-4 py-0.5 text-[10px] sm:text-xs font-extrabold tracking-wide text-white"
              style={{ background: getHeaderView(1), color: '#FFFFFF' }}
            >
              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <Sparkles className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
              </span>
              <span className="text-center" style={{ color: '#FFFFFF' }}>
                Executive Marketing &amp; Sales Suite · 14-Day Free Trial
              </span>
            </div>
          </div>

          {/* 4 High-Impact Subscriber Flat Screens — Halved in Size & Flat Screen Header Tiles in App-Design Colour */}
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {[
              {
                screenLabel: 'FLAT SCREEN 01 · PLATFORM VALUE',
                icon: ShieldCheck,
                reasons: [
                  {
                    title: '46 Live Modules in One Subscription',
                    sub: '100% Connected Super-Platform · From $760 per a month',
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
                    title: 'AI Smart-Fill & $160 Elite Tokens Included',
                    sub: '1,200 Message + 50,000 Integration Credits & Support',
                    detail: 'Every subscription tier includes full access to all documents, Elite Package Tokens ($160/mo value) & support.',
                    points: [
                      'Full access to ComplianceHR app & all documents',
                      '1,200 message credits & 50,000 integration credits',
                      'Dedicated support & 65+ live automated workflows',
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
                  {/* Flat Screen Monitor Frame — App-Design Colour Frame (Zero Black Space) */}
                  <div
                    className={`flex h-full w-full flex-1 flex-col justify-between rounded-xl border-2 p-1.5 transition-all duration-300 ${
                      isLit
                        ? '-translate-y-0.5 ring-2 ring-[#00C6FF]/85 shadow-md'
                        : 'shadow-2xs'
                    }`}
                    style={{
                      borderColor: borderCol,
                      background: getHeaderView(idx),
                    }}
                  >
                    {/* Top Monitor Bezel Header Tile in App-Design Colour With Number & Symbol */}
                    <div
                      className="gradient-brand mb-1 flex min-h-[20px] w-full flex-nowrap items-center justify-between gap-1 rounded-full border border-white px-2 py-0.5 whitespace-nowrap text-white"
                      style={{ background: getHeaderView(idx + 3), color: '#FFFFFF' }}
                    >
                      <span className="inline-flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap">
                        <span
                          className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[6.5px] font-extrabold"
                          style={{ color: sym.iconColor }}
                        >
                          0{idx + 1}
                        </span>
                        <span style={{ color: '#FFFFFF' }}>SCREEN 0{idx + 1}{isLit ? ' · LIT ✦' : ''}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-1.5 py-0 text-[7px] font-extrabold text-white whitespace-nowrap">
                        <Radio className="h-2 w-2 text-white shrink-0" style={{ color: '#FFFFFF' }} />
                        <span style={{ color: '#FFFFFF' }}>30s · {(activeBenefitIdx % 5) + 1}/5</span>
                      </span>
                    </div>

                    {/* Inner Monitor Display — White Outside Border, App-Coloured Headers & Pink/Blue/Purple Spray With Dark Blue Writing Inside */}
                    <div
                      className="flex flex-1 rounded-lg p-[2px]"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="grid h-full w-full grid-cols-1 grid-rows-[20px_42px_36px_1fr] gap-1 rounded-[7px] p-1.5 text-center"
                        style={{ background: SPRAY_BGS[idx % SPRAY_BGS.length] }}
                      >
                        {/* Row 1: App-Design Coloured Flat Screen Reason Header Tile */}
                        <div
                          className="gradient-brand relative flex h-[20px] w-full items-center justify-center rounded-full px-2 text-white"
                          style={{ background: getHeaderView(idx + 1), color: '#FFFFFF' }}
                        >
                          <span className="text-center text-[7.5px] font-extrabold uppercase tracking-wider text-white" style={{ color: '#FFFFFF' }}>
                            Reason #{(activeBenefitIdx % 5) + 1} of 5
                          </span>
                          <button
                            type="button"
                            onClick={() => setActiveBenefitIdx((prev) => (prev + 1) % 5)}
                            className="absolute right-1 rounded-full border border-white bg-white/20 px-1.5 py-0 text-[6.5px] font-extrabold text-white hover:bg-white/30"
                            style={{ color: '#FFFFFF' }}
                          >
                            Next ▸
                          </button>
                        </div>

                        {/* Row 2: App-Design Coloured Flat Screen Title Header Tile (Aligned Height) */}
                        <div
                          className="flex h-[42px] w-full rounded-lg p-[1.5px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex h-full w-full flex-col justify-between overflow-hidden rounded-[6px] bg-white">
                            <div
                              className="gradient-brand flex h-[22px] items-center justify-center gap-1 px-1.5 text-center text-white"
                              style={{ background: getHeaderView(idx + 2), color: '#FFFFFF' }}
                            >
                              <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                              <span className="truncate text-[8px] font-extrabold leading-none text-white" style={{ color: '#FFFFFF' }}>
                                {activeReason.title}
                              </span>
                            </div>
                            <div className="flex h-[17px] items-center justify-center bg-white px-1 text-center text-[7px] font-extrabold text-[#0A2B6D] leading-none truncate">
                              {activeReason.sub}
                            </div>
                          </div>
                        </div>

                        {/* Row 3: Compact Summary Explanation — Pure White Writing Area */}
                        <div
                          className="flex h-[36px] w-full rounded-lg p-[1.5px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex h-full w-full items-center justify-center rounded-[5px] bg-white px-1.5 py-0.5 text-center">
                            <p className="text-center text-[7.5px] font-extrabold leading-tight text-[#0A2B6D] line-clamp-2">
                              {activeReason.detail}
                            </p>
                          </div>
                        </div>

                        {/* Row 4: 3 Lined-Up Subscriber Proof Points — Pure White Writing Area */}
                        <ul className="grid h-full w-full grid-cols-1 grid-rows-3 gap-1 text-center">
                          {activeReason.points.map((pt) => (
                            <li
                              key={pt}
                              className="flex h-[24px] rounded-md p-[1.5px]"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            >
                              <div className="flex h-full w-full items-center justify-center gap-1 rounded-[4px] bg-white px-1.5 text-center text-[7.5px] font-extrabold leading-tight text-[#0A2B6D]">
                                <CheckCircle2 className="h-2 w-2 shrink-0 text-[#0A2B6D]" />
                                <span className="truncate text-center text-[#0A2B6D]">
                                  {pt}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Monitor Channel Dots */}
                    <div className="mt-1 flex items-center justify-between px-1">
                      <span className="text-[6.5px] font-extrabold uppercase tracking-wider text-white/90">
                        30S CYCLE
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
                  {/* Flat Screen Monitor Stand Neck & Base in App-Design Colour (No Black Space) */}
                  <div className="h-1 w-4" style={{ background: getHeaderView(idx) }} />
                  <div
                    className="h-1 w-10 rounded-full"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  />
                </div>
              );
            })}
          </div>

          {/* Pack 1 (Channel 7 TV) & Pack 2 (Channel 9 TV) — Halved in Size, Bright Pink & White Spray, App-Coloured Headers */}
          <div className="grid w-full grid-cols-1 gap-2.5 md:grid-cols-2 items-stretch">
            {PACKS.map((pack, pIdx) => {
              const PackIcon = pack.icon;
              const packSym = getSymbolView(pIdx * 2 + 1);
              const currentSpotlight = pack.bullets[activeBenefitIdx % pack.bullets.length];
              return (
                <div
                  key={pack.id}
                  className="flex h-full rounded-xl p-[3px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex h-full w-full flex-col justify-between gap-2 rounded-[9px] p-2 text-center"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    {/* 1. Compact App-Coloured Header Badge */}
                    <div
                      className="gradient-brand flex min-h-[32px] w-full items-center justify-center gap-2 rounded-lg px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white"
                      style={{ background: getHeaderView(pIdx * 2 + 2), color: '#FFFFFF' }}
                    >
                      <span
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border bg-white"
                        style={{ borderColor: getAppBorderView(pIdx * 2 + 1) }}
                      >
                        <PackIcon className="h-3 w-3" style={{ color: packSym.iconColor }} />
                      </span>
                      <span style={{ color: '#FFFFFF' }}>
                        {pack.badgeLine1} {pack.badgeLine2}
                      </span>
                    </div>

                    {/* 2. 50% Smaller Live HD Widescreen TV Screen: Bright Pink & White Spray Background */}
                    <div className="flex w-full flex-col items-center">
                      <div
                        className="flex w-full flex-col justify-between rounded-[14px] border-2 bg-[#0072FF] p-1.5 ring-2 ring-[#00C6FF]/75 shadow-md"
                        style={{ borderColor: '#00C6FF' }}
                      >
                        {/* Top TV Bezel Status Bar */}
                        <div className="mb-1 flex items-center justify-between px-1.5">
                          <span className="flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-white">
                            <Tv className="h-3 w-3 text-[#FFF3FA]" />
                            {pack.tvChannel} · LIT UP ✦
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0 text-[7.5px] font-extrabold text-white whitespace-nowrap">
                            <Radio className="h-2 w-2 text-[#FF2E9A]" />
                            30s · {(activeBenefitIdx % 5) + 1}/5
                          </span>
                        </div>

                        {/* Inner TV Screen — Spray Between Borders & Pure White Inside Writing Boxes */}
                        <div
                          className="flex flex-col justify-between rounded-xl p-[2px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div
                            className="flex flex-col justify-between rounded-[9px] p-1.5 text-center space-y-1"
                            style={{ background: SPRAY_BGS[pIdx % SPRAY_BGS.length] }}
                          >
                            {/* Outright & Subscription Inside Live HD TV Screen With White Background & ComplianceHR Colours in Name & $ Amounts */}
                            <div
                              className="w-full rounded-lg p-[1.5px] shadow-2xs"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            >
                              <div className="flex flex-col items-center justify-center rounded-[6px] bg-white px-2 py-1 text-center">
                                <div className="font-editorial text-[10.5px] font-extrabold uppercase tracking-wider">
                                  <span className="bg-gradient-to-r from-[#00C6FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                                    Compliance
                                  </span>
                                  <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                                    HR
                                  </span>{' '}
                                  <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                                    {pack.id === 'pack-1' ? 'Infinity Subscription' : 'Infinity Outright'}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-baseline justify-center gap-1 leading-tight">
                                  <span className="font-editorial text-xs sm:text-sm font-extrabold bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                                    {pack.priceMain}
                                  </span>
                                  <span className="text-[8px] font-extrabold bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                                    {pack.id === 'pack-2' ? `Outright · ${pack.priceSuffix}` : pack.priceSuffix}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Compact 30-Second Spotlight Banner */}
                            <div
                              className="gradient-brand flex min-h-[26px] items-center justify-between gap-1.5 rounded-lg px-2 py-0.5 text-center text-white"
                              style={{ background: getHeaderView((activeBenefitIdx + pIdx) % 8), color: '#FFFFFF' }}
                            >
                              <div className="min-w-0 flex-1 text-center">
                                <span className="text-[7.5px] font-extrabold leading-tight text-white line-clamp-1" style={{ color: '#FFFFFF' }}>
                                  {pack.nowPlayingLabel}: {currentSpotlight}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setActiveBenefitIdx((prev) => (prev + 1) % 5)}
                                className="shrink-0 rounded-full border border-white bg-white/20 px-1.5 py-0 text-[7px] font-extrabold text-white"
                                style={{ color: '#FFFFFF' }}
                              >
                                Next ▸
                              </button>
                            </div>

                            {/* All 5 Package Benefits — Pure White Inside Writing Boxes */}
                            <ul className="grid w-full grid-cols-1 grid-rows-5 gap-1 text-center">
                              {pack.bullets.map((line, idx) => {
                                const borderCol = getAppBorderView(pIdx * 3 + idx);
                                const isCurrent = idx === activeBenefitIdx % 5;
                                return (
                                  <li
                                    key={line}
                                    onClick={() => setActiveBenefitIdx(idx)}
                                    className="flex h-[26px] cursor-pointer rounded-lg p-[1.5px] shadow-2xs transition-all"
                                    style={{ background: TOP_BORDER_GRADIENT }}
                                  >
                                    <div
                                      className={`flex h-full w-full items-center justify-center gap-1.5 rounded-[6px] bg-white px-2 text-center ${
                                        isCurrent ? 'ring-1 ring-[#FF2E9A]' : ''
                                      }`}
                                    >
                                      <span
                                        className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border bg-white"
                                        style={{ borderColor: borderCol }}
                                      >
                                        <CheckCircle2 className="h-2.5 w-2.5 text-[#0A2B6D]" />
                                      </span>
                                      <span className="flex-1 truncate text-center text-[8px] font-extrabold leading-tight text-[#0A2B6D]">
                                        {line}
                                      </span>
                                    </div>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>

                        {/* Bottom TV Speaker Bar */}
                        <div className="mt-1 flex h-[14px] items-center justify-between px-2">
                          <span className="text-[7px] font-extrabold tracking-widest text-white">
                            {pack.tvChannel} · CONSTANTLY LIT HD
                          </span>
                          <div className="flex items-center gap-1">
                            {[0, 1, 2, 3, 4].map((dot) => (
                              <button
                                key={dot}
                                type="button"
                                aria-label={`Show benefit ${dot + 1}`}
                                onClick={() => setActiveBenefitIdx(dot)}
                                className={`h-1.5 w-1.5 rounded-full transition-all ${
                                  activeBenefitIdx % 5 === dot ? 'bg-[#FF2E9A] scale-125' : 'bg-white/60'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* TV Pedestal Neck & Stand Base */}
                      <div className="h-1.5 w-8 bg-[#0A2B6D]" />
                      <div
                        className="h-1.5 w-16 rounded-full border border-[#0A2B6D]"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      />
                    </div>

                    {/* 3. Lined-Up Package Info & Prices Below TV — White Outside Border & Pink/Blue/Purple Spray With Dark Blue Writing Inside */}
                    <div
                      className="flex w-full flex-1 flex-col justify-between rounded-xl p-[2px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="grid h-full w-full grid-cols-1 grid-rows-[64px_22px_1fr] gap-1.5 rounded-[9px] p-2 text-center"
                        style={{ background: SPRAY_BGS[pIdx % SPRAY_BGS.length] }}
                      >
                        {/* Row 1: Aligned Price Box — White Background & ComplianceHR Colours in Name and $ Amounts */}
                        <div
                          className="flex min-h-[60px] w-full rounded-lg p-[1.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex h-full w-full flex-col items-center justify-center rounded-[6px] bg-white px-2 py-1 text-center">
                            <div className="font-editorial text-[11px] font-extrabold uppercase tracking-wider">
                              <span className="bg-gradient-to-r from-[#00C6FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                                Compliance
                              </span>
                              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                                HR
                              </span>{' '}
                              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                                {pack.id === 'pack-1' ? 'Infinity Subscription' : 'Infinity Outright'}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-baseline justify-center gap-1 leading-tight">
                              <span className="font-editorial text-sm sm:text-base font-extrabold bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                                {pack.priceMain}
                              </span>
                              <span className="text-[8.5px] font-extrabold bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                                {pack.id === 'pack-2' ? `Outright · ${pack.priceSuffix}` : pack.priceSuffix}
                              </span>
                            </div>
                            <p className="w-full text-center text-[7px] font-extrabold leading-tight text-[#0A2B6D] line-clamp-2">
                              {pack.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Row 2: Aligned Important Info Header */}
                        <div
                          className="gradient-brand flex h-[22px] w-full items-center justify-center gap-1.5 rounded-full px-2.5 text-center text-[8px] font-extrabold uppercase tracking-wider text-white"
                          style={{ background: getHeaderView(pIdx + 4), color: '#FFFFFF' }}
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                          <span style={{ color: '#FFFFFF' }}>{pack.importantInfoTitle}</span>
                        </div>

                        {/* Row 3: 4 Aligned Rows — Pure White Inside Writing Boxes */}
                        <div className="grid grid-cols-1 grid-rows-4 gap-1">
                          {pack.importantInfoRows.map((info) => (
                            <div
                              key={info}
                              className="flex h-[24px] rounded-lg p-[1.5px] shadow-2xs"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            >
                              <div className="flex h-full w-full items-center justify-center gap-1.5 rounded-[6px] bg-white px-2 text-center text-[7.5px] font-extrabold leading-tight text-[#0A2B6D]">
                                <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" />
                                <span className="flex-1 truncate text-center text-[#0A2B6D]">
                                  {info}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 4. Compact Start & View Action Tiles */}
                    <div className="grid w-full grid-cols-2 gap-1.5">
                      {pack.primaryCta.to ? (
                        <Link
                          to={pack.primaryCta.to}
                          className="gradient-brand inline-flex min-h-[26px] w-full items-center justify-center gap-1 rounded-full border border-white px-2.5 py-0.5 text-[9px] font-extrabold text-white whitespace-nowrap"
                          style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                        >
                          <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                          <span style={{ color: '#FFFFFF' }}>{pack.primaryCta.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={pack.primaryCta.href}
                          className="gradient-brand inline-flex min-h-[26px] w-full items-center justify-center gap-1 rounded-full border border-white px-2.5 py-0.5 text-[9px] font-extrabold text-white whitespace-nowrap"
                          style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                        >
                          <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                          <span style={{ color: '#FFFFFF' }}>{pack.primaryCta.label}</span>
                        </a>
                      )}

                      {pack.secondaryCta.to ? (
                        <Link
                          to={pack.secondaryCta.to}
                          className="gradient-brand inline-flex min-h-[26px] w-full items-center justify-center gap-1 rounded-full border border-white px-2.5 py-0.5 text-[9px] font-extrabold text-white whitespace-nowrap"
                          style={{ background: getHeaderView(3), color: '#FFFFFF' }}
                        >
                          <Sparkles className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                          <span style={{ color: '#FFFFFF' }}>{pack.secondaryCta.label}</span>
                        </Link>
                      ) : (
                        <a
                          href={pack.secondaryCta.href}
                          className="gradient-brand inline-flex min-h-[26px] w-full items-center justify-center gap-1 rounded-full border border-white px-2.5 py-0.5 text-[9px] font-extrabold text-white whitespace-nowrap"
                          style={{ background: getHeaderView(3), color: '#FFFFFF' }}
                        >
                          <Sparkles className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
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
        <div className="rounded-[16px] p-3 sm:p-4" style={{ background: SPRAY_BGS[0] }}>
          <InfinityOneClickOperations />
        </div>
      </div>

      {/* 3. Screen-by-Screen Audit */}
      <div
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] p-3 sm:p-4" style={{ background: SPRAY_BGS[0] }}>
          <ScreenByScreenMasterAudit2026 />
        </div>
      </div>

      {/* 4. Business Health & Compliance Intelligence */}
      <div
        id="business-health-intelligence"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] p-3 sm:p-4" style={{ background: SPRAY_BGS[0] }}>
          <BusinessHealthComplianceIntelligenceDashboard />
        </div>
      </div>

      {/* 5. Core Engines — Normal Clean Border With Spray Between Outer Border & Inner Writing Borders */}
      <div
        id="infinity-core-engine"
        className="w-full scroll-mt-16 rounded-2xl border-2 border-[#0A2B6D] p-2 sm:p-3 shadow-sm"
        style={{ background: SPRAY_BGS[0] }}
      >
        <InfinityCoreEngine />
      </div>

      {/* 6. Unified Oversight */}
      <div
        id="infinity-control-centre"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] p-3 sm:p-4" style={{ background: SPRAY_BGS[0] }}>
          <InfinityControlCentreMasterSuite />
        </div>
      </div>

      {/* 7. Office View + Beach Scene */}
      <div
        id="live-workspace"
        className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="rounded-[16px] p-3 sm:p-4 space-y-4" style={{ background: SPRAY_BGS[0] }}>
          <ExecutiveWallScene showAllModulesMinimised={true} />
          <BeachDeepSeaWallShowcase defaultScene="all" compact={true} />
        </div>
      </div>

      {/* 8. Price and Packaging */}
      <PricingSection />
    </div>
  );
}