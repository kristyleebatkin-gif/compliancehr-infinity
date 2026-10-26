import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck,
  Users,
  CalendarClock,
  AlertTriangle,
  GraduationCap,
  MessagesSquare,
  Building2,
  CheckCircle2,
  ArrowRight,
  Cpu,
  TrendingUp,
  BookOpen,
  Layers,
  Sparkles,
  Monitor,
  Tv,
  Radio,
} from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
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

// 4 Merged Package & Document Suite Tiles — All Sections Lined Up & Styled in App Design Colours
export const WHAT_YOU_GET_ITEMS = [
  {
    title: 'Outright Documents · $999 or $125 per a month',
    included: '24 Month Contract · Full Access to Document Suite',
    detail: 'Over 100 documents downloadable at any stage — document access & tailor business details only (no payment plan on $999).',
  },
  {
    title: 'WHS, Risk, Incident, Medication & Waste Suite',
    included: 'Support Plan, Service Delivery & Infection Control',
    detail: 'Includes Continuity, Safe Meal Management, Conflict, Policies, Procedures, Registers & Business Plans.',
  },
  {
    title: 'Intake, Consents, Progress & Training Suite',
    included: 'Intake Employee, Intake Participant & Consents',
    detail: 'Includes Staff Training Modules, Progress, Skill Assessments & Review tailored to your Business Details.',
  },
  {
    title: 'Our Elite Package · $760 per a month',
    included: 'Includes Full Access to Our Application & Support',
    detail: 'Includes 1,200 message credits, 50,000 integration credits & all documents — a resource to complete audits easier, simpler and faster.',
  },
];

// All 8 Pillars with uniform length & zero $355 references so Pillars 1&2, 3&4, 5&6, 7&8 line up identically
export const MUST_HAVE_PILLARS = [
  {
    id: 'master-audit-doc',
    badge: 'PILLAR 1 · 356 AUDIT CHECKPOINTS',
    title: '1. Master Compliance Audit Checklist Suite (CHR-AUD-001 & 002)',
    subtitle: '17 Audit Categories · 356 Checkpoints · 11 Interactive & Printable Pages',
    icon: ClipboardCheck,
    items: [
      '17 Audit Categories & 356 Checkpoints across 11 structured pages',
      'Dual Governance (CHR-AUD-001) & Workforce (CHR-AUD-002) editions',
      'Interactive Yes, No & N/A compliance status ticks with evidence notes',
      'Corrective action owner assignment, target dates & closure tracking',
      '1-Click Printable PDF Audit Pack, Weekly Compliance Report & Board Pack',
      'Included free inside every Smart Enhanced subscription & Outright Pack',
    ],
  },
  {
    id: 'dual-workspace',
    badge: 'PILLAR 2 · INTERACTIVE VISUALS',
    title: '2. Dual Interactive Workspace: Office View + Profile View',
    subtitle: 'Executive Wall Scene, Desk Equipment & Custom Modular Data Selector',
    icon: Building2,
    items: [
      'Switch live between Enhanced Office View, Profile View, or Side-by-Side',
      'Interactive Modular Screen & Data Selector: pin up to 6 live modulars',
      'Framed wall art of all 46 modules + 16 Communication Centre modulars',
      'Split Silver Screen with live local weather & NDIS Commission news',
      'Interactive PC Monitor, Secondary Branded Screen & Company Safe Vault',
      'High-contrast Blue-Purple-Pink & 46-module colour architecture',
    ],
  },
  {
    id: 'people-profiles',
    badge: 'PILLAR 3 · UNIFIED DIRECTORY',
    title: '3. Complete Employee & Participant Profile Lifecycle',
    subtitle: 'Intake-to-Profile Automation, Screening Alerts & 3-Part Consents',
    icon: Users,
    items: [
      'Consolidated People Directory with 1-click Intake-to-Profile onboarding',
      'NDIS Worker Screening, Blue Card, Police Check, First Aid & CPR alerts',
      'Participant NDIS plans, budgets, goals, 10-weekly & 3-monthly trackers',
      'Service-role protected 3-Part Consents (Sharing, Advocacy, Medication)',
      'Instant Staff ID Badge & Name Tag Studio with printable PDF export',
      'Consent-gated External NDIS Auditor Portal for read-only inspections',
    ],
  },
  {
    id: 'comms-command',
    badge: 'PILLAR 4 · 16 COMMS MODULARS',
    title: '4. 16-Modular Communication Centre & Shared To-Do Command',
    subtitle: 'Diaries, Shift Notes, Branded Email, Video Calls & Gamified Tasks',
    icon: MessagesSquare,
    items: [
      'Unified Communication Diary, Shift Handover Notes & Employee Logs',
      'Shared To-Do Command Board with digital signature sign-off verification',
      'Task Competition Leaderboard, Team Banter, Shoutouts & Birthday Alerts',
      'Professional Branded HTML Emails with auto-attached business contacts',
      'AI Compose Assistant & ready-to-send NDIS & HR communication templates',
      'Automated 30-Completed-Task & 30-Action Batch PDF & CSV audit reports',
    ],
  },
  {
    id: 'rostering-finance',
    badge: 'PILLAR 5 · NDIS OPERATIONS',
    title: '5. NDIS Rostering, Timesheets, Price-Guide Invoicing & Payroll',
    subtitle: 'End-to-End Shift Planning, PRODA Claims, Quotes & Bank Match',
    icon: CalendarClock,
    items: [
      'Smart Roster Board with worker screening checks & coverage heatmap',
      'Roster validation rules, public holiday rates, forecast & sign-off',
      'Shift-to-Invoice generator mapped to current NDIS Price Guide items',
      'Quotes Centre, AI Receipt Scanner, Bank Match & 3-Way Procurement',
      'Automated Staff Payslips, Pay Runs & Payroll Change Audit Logs',
      'Participant funding utilisation charts & aged receivables tracking',
    ],
  },
  {
    id: 'safety-incidents',
    badge: 'PILLAR 6 · SAFEGUARDING & WHS',
    title: '6. Incident Clinic, Risk Matrix & Emergency Readiness',
    subtitle: '24h / 5-Day NDIS Commission Timers, Take-5s, Drills & MSDS',
    icon: AlertTriangle,
    items: [
      'NDIS Reportable Incident Clinic with 24-hour & 5-day deadline timers',
      'Root-cause investigation workflows, photo evidence & WHS tracking',
      'Live Risk & Hazard Register with ISO 31000 Hierarchy of Controls',
      '6-Monthly Individual & Home Risk Assessments + Pre-Shift Take-5s',
      'Emergency Evacuation Drills, Smoke Alarm/Kit logs & Visitor Sign-In',
      'Equipment Manuals, Vehicle Safety Checks & Chemical MSDS Register',
    ],
  },
  {
    id: 'hr-training-ai',
    badge: 'PILLAR 7 · HR & AI ACADEMY',
    title: '7. HR Paperwork Hub, LMS Training Academy & Certificates',
    subtitle: 'Digital Contracts, 360° Appraisals, AI Quizzes & Branded Certificates',
    icon: GraduationCap,
    items: [
      'HR Paperwork Hub: Employment Contracts, Position Descriptions & E-Sign',
      '100-Point Staff File Completeness Tracker & Annual Appraisals',
      'Interactive LMS Learner Portal with AI Course Author & AI Quiz Drill',
      'Auto-issued PDF Certificates of Completion signed by Kristy Lee Whelan',
      'Skills Gap Analytics, Training Streaks, Buddy Shifts & Volunteers',
      'Smart Document Vault with version control, read-receipts & calendars',
    ],
  },
  {
    id: 'automation-engine',
    badge: 'PILLAR 8 · 100+ FUNCTIONS',
    title: '8. 24/7 Autonomous Compliance Engine & AI Copilots',
    subtitle: 'Powered by 1,200 Message Credits, 50,000 Integration Credits & Dedicated Support',
    icon: Cpu,
    items: [
      '65+ live automated workflows running scheduled expiry scans & alerts',
      '100+ backend server functions handling audit trails, PDFs & emails',
      'Auto-routing of incidents, risks, complaints, shift notes & drills',
      'Google Calendar & Gmail integration + GitHub repository stats & sync',
      'In-App Personal AI Assistant, AI Goal Coach & Health Troubleshooter',
      'Strict Row-Level Security (RLS) across 115+ NDIS & HR entities',
    ],
  },
];

export default function MustHaveFunctionsReview() {
  const [selectedPillar, setSelectedPillar] = useState('all');

  const visiblePillars =
    selectedPillar === 'all'
      ? MUST_HAVE_PILLARS
      : MUST_HAVE_PILLARS.filter((p) => p.id === selectedPillar);

  return (
    <section
      id="must-haves"
      className="w-full scroll-mt-16 rounded-2xl p-[6px] shadow-md"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[12px] bg-white px-2.5 py-3 sm:px-3.5 sm:py-3.5 text-center space-y-2">
        {/* 50% Smaller Heading & 2-Line Subtitle With Outright on 2nd Line + App-Coloured Frame Around Writing */}
        <div
          className="w-full rounded-xl p-[3px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="w-full rounded-[9px] p-2 text-center space-y-1"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="rounded-lg bg-white px-3 py-2 text-center space-y-1">
              <h2 className="font-editorial text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight leading-tight">
                <span className="text-[#0A2B6D]">Complete Review of Every </span>
                <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  Must-Have Function,
                </span>{' '}
                <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                  Resource &amp; Feature
                </span>
              </h2>
              <p
                className="mx-auto w-full text-center text-[10px] sm:text-xs font-extrabold leading-snug text-black"
                style={{ color: '#000000' }}
              >
                <span className="block">
                  {MODULE_DIRECTORY.length} Modules · 17 Audit Categories · 356 Checkpoints · 100+ Functions · 65+ Workflows
                </span>
                <span className="block bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                  $760 per a month or $999 Outright Documents
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* 50% Smaller Stretched Side-to-Side "Full Review..." App-Coloured Header */}
        <div
          className="w-full rounded-full p-[2px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[26px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[10px] sm:text-xs font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(0), color: '#FFFFFF' }}
          >
            <BookOpen className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
            <span className="text-center leading-tight" style={{ color: '#FFFFFF' }}>
              Full Review of Every Must-Have Function · 8 Core Pillars &amp; 356 Checkpoints
            </span>
          </div>
        </div>

        {/* 50% Smaller 8 Executive KPI Tiles — Pink/Blue/Purple Spray Between Outer & Title Border, App-Coloured Header, White Box & Dark Blue Writing */}
        <div className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 items-stretch">
          {[
            { category: 'Platform', icon: Layers, val: `${MODULE_DIRECTORY.length} Modules`, label: '$760 per a month' },
            { category: 'Documents', icon: BookOpen, val: 'All Documents', label: 'Full Access Incl.' },
            { category: 'Suite', icon: ClipboardCheck, val: '100+ Documents', label: 'Tailored to Business' },
            { category: 'Outright', icon: Sparkles, val: '$999 / $125m', label: 'Outright Documents' },
            { category: 'Tokens', icon: Cpu, val: '$160/mo Value', label: 'Elite Tokens Incl.' },
            { category: 'Integrations', icon: TrendingUp, val: '50,000 Credits', label: 'Integration / mo' },
            { category: 'Messages', icon: MessagesSquare, val: '1,200 Credits', label: 'Message / mo' },
            { category: 'Support', icon: Users, val: 'Full Support', label: '& 14-Day Trial' },
          ].map((stat, idx) => {
            const StatIcon = stat.icon;
            const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
            return (
              <div
                key={stat.label}
                className="flex h-full rounded-xl p-[2px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full w-full flex-col items-center justify-between gap-1 rounded-[9px] p-1 text-center"
                  style={{ background: sprayBg }}
                >
                  {/* App-Coloured Header Bar for Title */}
                  <div
                    className="gradient-brand flex min-h-[20px] w-full items-center justify-center gap-1 rounded-full px-1.5 py-0.5 text-[7.5px] font-extrabold uppercase tracking-wider text-white whitespace-nowrap"
                    style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                  >
                    <StatIcon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    <span style={{ color: '#FFFFFF' }}>{stat.category}</span>
                  </div>

                  {/* Writing Area Framed in Title Border With White Background & Dark Blue Writing */}
                  <div
                    className="w-full rounded-md p-[1.5px]"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div className="flex min-h-[28px] w-full flex-col items-center justify-center rounded-[4px] bg-white px-1.5 py-0.5 text-center">
                      <div className="font-editorial text-[9.5px] font-extrabold leading-tight text-[#0A2B6D] whitespace-nowrap">
                        {stat.val}
                      </div>
                      <div className="text-[7px] font-extrabold uppercase tracking-tight leading-tight text-[#0A2B6D] whitespace-nowrap">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 50% Smaller LEFT: $999 Outright Documents TV Screen (Bright Pink & White Spray + Compliance in Logo Colour + Outright on 2nd Line) · RIGHT: 4 Merged Tiles With App-Coloured Headers */}
        <div
          className="w-full rounded-xl p-[3px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="grid w-full grid-cols-1 lg:grid-cols-12 gap-2 items-stretch rounded-[9px] p-2 text-center"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            {/* LEFT COLUMN: 50% Smaller $999 Outright Documents TV Screen With Bright Pink & White Spray Background */}
            <div className="lg:col-span-5 flex flex-col items-center justify-between">
              <div
                className="flex w-full flex-1 flex-col justify-between rounded-[16px] border-[3px] bg-[#0072FF] p-2 ring-2 ring-[#00C6FF]/75 shadow-md"
                style={{ borderColor: '#00C6FF' }}
              >
                {/* Top TV Screen Bar */}
                <div className="mb-1 flex items-center justify-between px-1.5">
                  <span className="flex items-center gap-1 text-[8px] font-extrabold uppercase tracking-wider text-white">
                    <Tv className="h-3 w-3 text-[#FFF3FA]" />
                    $999 OUTRIGHT DOCUMENTS TV · LIT UP ✦
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2 py-0 text-[7.5px] font-extrabold text-white">
                    <Radio className="h-2 w-2 text-[#FF2E9A]" />
                    LIVE HD
                  </span>
                </div>

                {/* Inner TV Screen — Bright Pink & White Spray Background + App-Design Colour Around All Writing */}
                <div
                  className="flex flex-1 rounded-xl p-[2.5px]"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex w-full flex-col items-center justify-between gap-1.5 rounded-[9px] p-2 text-center"
                    style={{ background: BRIGHT_PINK_WHITE_SPRAY }}
                  >
                    <span
                      className="gradient-brand inline-flex w-full items-center justify-center gap-1 rounded-full border border-[#0A2B6D] px-2.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
                      style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                    >
                      <Sparkles className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>Outright Documents &amp; Subscription Value</span>
                    </span>

                    <div
                      className="flex-1 w-full rounded-lg p-[2px] shadow-2xs flex"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-[7px] bg-white px-2.5 py-1.5 text-center">
                        {/* ComplianceHR Styled in Exact Logo Gradient Colour */}
                        <div className="font-editorial text-xs sm:text-sm font-extrabold uppercase tracking-wider">
                          <span className="bg-gradient-to-r from-[#00C6FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                            Compliance
                          </span>
                          <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                            HR
                          </span>{' '}
                          <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                            Infinity
                          </span>
                        </div>

                        {/* Line 1: $760 per a month · Line 2: or $999 Outright Documents */}
                        <div className="font-editorial text-sm sm:text-base font-extrabold leading-tight">
                          <span className="block bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                            $760 per a month
                          </span>
                          <span className="block bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                            or $999 Outright Documents
                          </span>
                        </div>

                        <div className="text-[9px] font-extrabold text-[#FF2E9A]">
                          or $125 per a month subscription, 24 month contract
                        </div>

                        <div
                          className="w-full rounded-lg p-[1.5px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <p className="rounded-[6px] bg-white px-2 py-0.5 text-center text-[8.5px] font-extrabold leading-tight text-[#0072FF]">
                            Full access to document suite, Document access, tailor business details, only.
                          </p>
                        </div>

                        <div
                          className="w-full rounded-lg p-[1.5px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <p className="rounded-[6px] bg-white px-2 py-0.5 text-center text-[8.5px] font-extrabold leading-tight text-[#5A00D6]">
                            Our Elite package includes full access to our application, a resource to complete audits easier, simpler and faster.
                          </p>
                        </div>
                      </div>
                    </div>

                    <a
                      href="#pricing"
                      className="gradient-brand inline-flex min-h-[24px] w-full items-center justify-center gap-1.5 rounded-full border border-[#0A2B6D] px-3 py-0.5 text-[9.5px] font-extrabold text-white shadow-2xs transition-all hover:-translate-y-0.5"
                      style={{ background: getHeaderView(2), color: '#FFFFFF' }}
                    >
                      <span style={{ color: '#FFFFFF' }}>View Outright Documents &amp; Subscription Plans</span>
                      <ArrowRight className="h-2.5 w-2.5 text-white" style={{ color: '#FFFFFF' }} />
                    </a>
                  </div>
                </div>

                {/* Bottom TV Controls Bar */}
                <div className="mt-1 flex items-center justify-between px-1.5">
                  <span className="text-[7.5px] font-extrabold tracking-widest text-white">
                    CHR-DOC-TV · LIVE HD
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#FF2E9A]" />
                </div>
              </div>

              {/* TV Stand Legs & Base */}
              <div className="h-1.5 w-8 bg-[#0A2B6D]" />
              <div
                className="h-1.5 w-16 rounded-full border border-[#0A2B6D]"
                style={{ background: TOP_BORDER_GRADIENT }}
              />
            </div>

            {/* RIGHT COLUMN: 50% Smaller 4 Merged Tiles With App-Coloured Headers for All Titles & App-Design Colour Around All Writing */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-1.5">
              <div
                className="w-full rounded-full p-[2px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[26px] w-full items-center justify-center gap-1.5 rounded-full px-3 py-0.5 text-[9.5px] sm:text-xs font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(1), color: '#FFFFFF' }}
                >
                  <TrendingUp className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>
                    What You Get in the $999 Outright Documents &amp; $760/mo Elite Packages
                  </span>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-1.5 items-stretch">
                {WHAT_YOU_GET_ITEMS.map((item, idx) => {
                  const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                  return (
                    <div
                      key={item.title}
                      className="flex h-full rounded-xl p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="grid h-full w-full grid-cols-1 grid-rows-[26px_22px_1fr] gap-1 rounded-[9px] p-1.5 text-center"
                        style={{ background: sprayBg }}
                      >
                        {/* Section 1: App-Coloured Header Bar for Title */}
                        <div
                          className="gradient-brand flex h-[26px] w-full items-center justify-center rounded-md px-2 py-0.5 text-center text-[9px] font-extrabold leading-tight text-white"
                          style={{ background: getHeaderView(idx), color: '#FFFFFF' }}
                        >
                          <span style={{ color: '#FFFFFF' }}>{item.title}</span>
                        </div>

                        {/* Section 2: App-Coloured Sub-Header Pill */}
                        <div
                          className="gradient-brand flex h-[22px] w-full items-center justify-center rounded-full px-2 py-0.5 text-center text-[8px] font-extrabold leading-tight text-white"
                          style={{ background: getHeaderView(idx + 2), color: '#FFFFFF' }}
                        >
                          <span style={{ color: '#FFFFFF' }}>{item.included}</span>
                        </div>

                        {/* Section 3: Writing Area Framed in Title Border With White Background & Dark Blue Writing */}
                        <div
                          className="flex h-full min-h-[36px] w-full rounded-md p-[1.5px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex h-full w-full items-center justify-center rounded-[4px] bg-white px-2 py-1 text-center">
                            <p className="text-center text-[8.5px] font-extrabold leading-tight text-[#0A2B6D]">
                              {item.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 50% Smaller Selected Pillar Bar With Pink/Blue/Purple Spray, App-Coloured Headers & White Dark-Blue Writing Boxes */}
        <div
          className="w-full rounded-xl p-[2.5px] shadow-2xs"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="grid w-full grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5 rounded-[9px] p-1.5"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <div className="rounded-lg p-[2px] shadow-2xs" style={{ background: getHeaderView(0) }}>
              <button
                type="button"
                onClick={() => setSelectedPillar('all')}
                className={`flex h-full min-h-[28px] w-full flex-col items-center justify-between gap-0.5 rounded-[6px] p-1 text-center text-[8px] font-extrabold transition-all ${
                  selectedPillar === 'all' ? 'ring-2 ring-white' : ''
                }`}
                style={{ background: SPRAY_BGS[0] }}
              >
                <div
                  className="gradient-brand flex w-full items-center justify-center gap-0.5 rounded px-1 py-0.5 text-[7.5px] font-extrabold text-white"
                  style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                >
                  <Layers className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>All 8 Pillars</span>
                </div>
                <span className="w-full rounded border border-[#0A2B6D]/25 bg-white px-1 py-0 text-[7px] font-extrabold text-[#0A2B6D]">
                  All Categories
                </span>
              </button>
            </div>

            {MUST_HAVE_PILLARS.map((p, idx) => {
              const Icon = p.icon;
              const active = selectedPillar === p.id;
              const shortCategories = [
                'Master Audit',
                'Dual Workspace',
                'People Directory',
                '16 Comms Hub',
                'Roster & Billing',
                'Safety & WHS',
                'HR & Academy',
                'AI & Workflows',
              ];
              return (
                <div
                  key={p.id}
                  className="rounded-lg p-[2px] shadow-2xs"
                  style={{ background: getHeaderView(idx + 1) }}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedPillar(p.id)}
                    className={`flex h-full min-h-[28px] w-full flex-col items-center justify-between gap-0.5 rounded-[6px] p-1 text-center text-[8px] font-extrabold transition-all ${
                      active ? 'ring-2 ring-white' : ''
                    }`}
                    style={{ background: SPRAY_BGS[(idx + 1) % SPRAY_BGS.length] }}
                  >
                    <div
                      className="gradient-brand flex w-full items-center justify-center gap-0.5 rounded px-1 py-0.5 text-[7.5px] font-extrabold text-white"
                      style={{ background: getHeaderView(idx + 1), color: '#FFFFFF' }}
                    >
                      <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>Pillar {idx + 1}</span>
                    </div>
                    <span className="w-full rounded border border-[#0A2B6D]/25 bg-white px-1 py-0 text-[7px] font-extrabold text-[#0A2B6D]">
                      {shortCategories[idx]}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 50% Smaller 8 Must-Have Pillars Grid — Pink/Blue/Purple Spray Between Outer & Title Border, App-Coloured Headers, White Box & Dark Blue Writing */}
        <div className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-center items-stretch">
          {visiblePillars.map((pillar, pIdx) => {
            const Icon = pillar.icon;
            const ipadBorder = getAppBorderView(pIdx);
            const sprayBg = SPRAY_BGS[pIdx % SPRAY_BGS.length];
            return (
              <div
                key={pillar.id}
                className="flex h-full flex-col justify-between rounded-[16px] border-[3px] bg-[#0A2B6D] p-1.5 shadow-md"
                style={{ borderColor: ipadBorder }}
              >
                {/* Top iPad Camera & Status Bar */}
                <div className="mb-1 flex h-[14px] items-center justify-between px-1.5">
                  <span className="flex items-center gap-1 text-[7.5px] font-extrabold uppercase tracking-wider text-white">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
                    iPad Pro · Pillar 0{pIdx + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[7px] font-extrabold text-white/85">5G · 100%</span>
                    <span className="h-1.5 w-2.5 rounded-xs border border-white bg-[#10B981]" />
                  </div>
                </div>

                {/* Inner iPad Retina Screen — Pink/Blue/Purple Spray Between Outer & Title Borders */}
                <div
                  className="flex flex-1 rounded-[12px] p-[2px] shadow-inner"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex h-full w-full flex-col justify-between rounded-[10px] p-1.5 space-y-1"
                    style={{ background: sprayBg }}
                  >
                    <div className="flex flex-1 flex-col justify-between space-y-1">
                      <div className="space-y-1">
                        {/* App-Coloured Pillar Badge Bar */}
                        <span
                          className="gradient-brand inline-flex min-h-[22px] w-full items-center justify-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-wider leading-tight text-center text-white"
                          style={{ background: getHeaderView(pIdx), color: '#FFFFFF' }}
                        >
                          <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                          <span style={{ color: '#FFFFFF' }}>{pillar.badge}</span>
                        </span>

                        {/* App-Coloured Header for Pillar Title + White Dark-Blue Subtitle Box */}
                        <div
                          className="w-full rounded-lg p-[1.5px]"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="overflow-hidden rounded-[6px] bg-white">
                            <div
                              className="gradient-brand px-2 py-1 text-center text-[9px] font-extrabold leading-tight text-white"
                              style={{ background: getHeaderView(pIdx + 1), color: '#FFFFFF' }}
                            >
                              <span style={{ color: '#FFFFFF' }}>{pillar.title}</span>
                            </div>
                            <div className="bg-white px-2 py-0.5 text-center text-[8px] font-extrabold leading-tight text-[#0A2B6D]">
                              {pillar.subtitle}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 6 Compact Bullet Rows Framed in App-Design Border With White Background & Dark Blue Writing */}
                      <ul className="grid flex-1 grid-cols-1 grid-rows-6 gap-1">
                        {pillar.items.map((item, iIdx) => {
                          const idx = pIdx * 3 + iIdx;
                          return (
                            <li
                              key={item}
                              className="flex min-h-[26px] rounded-lg p-[1.5px] shadow-2xs"
                              style={{ background: getHeaderView(idx) }}
                            >
                              <div className="flex h-full w-full items-center justify-center gap-1 rounded-[5px] bg-white px-1.5 py-0.5 text-center text-[8px] font-extrabold leading-tight text-[#0A2B6D]">
                                <CheckCircle2 className="h-2.5 w-2.5 shrink-0 text-[#0A2B6D]" />
                                <span className="flex-1 text-center text-[#0A2B6D]">
                                  {item}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* 50% Smaller Footer Bar Framed in App-Design Colour */}
                    <div
                      className="rounded-full p-[1.5px]"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex h-[22px] items-center justify-between rounded-full bg-white px-2 py-0.5">
                        <span className="text-[8px] font-extrabold text-[#0A2B6D]">
                          From $760/mo Plan
                        </span>
                        <Link
                          to="/register"
                          className="gradient-brand inline-flex items-center gap-0.5 rounded-full border border-[#0A2B6D] px-2 py-0 text-[8px] font-extrabold text-white"
                          style={{ background: getHeaderView(pIdx + 2), color: '#FFFFFF' }}
                        >
                          <span style={{ color: '#FFFFFF' }}>Activate</span>
                          <ArrowRight className="h-2 w-2 text-white" style={{ color: '#FFFFFF' }} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom iPad Home Indicator Bar */}
                <div className="mt-1 flex h-[6px] items-center justify-center">
                  <span className="h-1 w-10 rounded-full bg-white/80" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}