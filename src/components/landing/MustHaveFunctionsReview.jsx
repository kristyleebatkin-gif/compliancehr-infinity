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

const SPRAY_BGS = [
  'radial-gradient(circle at 14% 18%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 86% 24%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 50% 86%, rgba(192, 132, 252, 0.62) 0%, transparent 52%), #FFFFFF',
  'radial-gradient(circle at 18% 82%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 20%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 36%, rgba(255, 133, 224, 0.56) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 16% 28%, rgba(192, 132, 252, 0.62) 0%, transparent 48%), radial-gradient(circle at 84% 78%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 54% 18%, rgba(56, 189, 248, 0.58) 0%, transparent 50%), #FFFFFF',
  'radial-gradient(circle at 84% 22%, rgba(255, 133, 224, 0.62) 0%, transparent 48%), radial-gradient(circle at 16% 78%, rgba(56, 189, 248, 0.62) 0%, transparent 48%), radial-gradient(circle at 48% 52%, rgba(192, 132, 252, 0.58) 0%, transparent 52%), #FFFFFF',
];

// What You Get in the $999 Outright & Smart Enhanced Packages (No $355 references)
export const WHAT_YOU_GET_ITEMS = [
  {
    title: '125+ NDIS & Aged Care Policies & Forms',
    included: 'Included in $999 Outright & All Plans',
    detail: 'Every mandatory policy, procedure, intake form & register ready to use',
  },
  {
    title: 'Dual Audit Checklists (CHR-AUD-001 & 002)',
    included: '17 Categories · 356 Checkpoints Included',
    detail: 'Governance & Workforce 11-page interactive & printable audit suites',
  },
  {
    title: '6 Structured Compliance Binders',
    included: 'Complete Audit-Ready Binder Volumes',
    detail: 'Pre-indexed across Governance, HR, Participants, Safety, Rostering & Finance',
  },
  {
    title: '12 Printable A4 Executive Office Masters',
    included: '2026 Standard Ruled & Smart-Fill A4 Pack',
    detail: 'Service Agreements, 24h/5d Incidents, Risk Matrix, Screening & Consents',
  },
  {
    title: 'Up to 20 Users ($660/mo) to 101+ Users',
    included: 'Replaces $4,080+/mo of Separate Tools',
    detail: 'All 46 live modules + $160/mo Elite AI tier (2,500 msgs & 20k credits)',
  },
  {
    title: '1-Click Smart-Fill Auto-Branding',
    included: 'Logo, ABN, NDIS ID & Signatories',
    detail: 'Stamps your organisation details across every PDF & CSV export automatically',
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
    subtitle: 'Powered by 2,500 Message Credits & 20,000 Integration Credits on Elite Pack',
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
      className="w-full scroll-mt-16 rounded-3xl p-[12px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-4">
        {/* Heading & Black Subheading Inside Stretched App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-[12px] bg-white px-4 py-3.5 sm:px-6 sm:py-4 text-center space-y-1.5">
            <h2 className="font-editorial text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
              <span className="text-[#0A2B6D]">Complete Review of Every </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Must-Have Function,
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Resource &amp; Feature
              </span>
            </h2>
            <p
              className="mx-auto w-full text-center text-xs sm:text-sm font-extrabold leading-relaxed text-black"
              style={{ color: '#000000' }}
            >
              {MODULE_DIRECTORY.length} Modules · 17 Audit Categories · 356 Checkpoints · 100+ Functions · 65+ Workflows · From $660/mo or $999 Outright Docs
            </p>
          </div>
        </div>

        {/* Stretched Side-to-Side "Full Review..." Banner Fitted Cleanly (No $355 Reference) */}
        <div
          className="w-full rounded-full p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="gradient-brand flex min-h-[42px] w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(0), color: '#FFFFFF' }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <BookOpen className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
            </span>
            <span className="text-center leading-snug" style={{ color: '#FFFFFF' }}>
              Full Review of Every Must-Have Function · 8 Core Pillars &amp; 356 Checkpoints
            </span>
          </div>
        </div>

        {/* Executive KPI & Accurate Price Counter Pills (No $355 Reference) */}
        <div className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { val: `${MODULE_DIRECTORY.length} Modules`, label: 'From $660/mo' },
            { val: '17 Categories', label: '356 Checkpoints' },
            { val: '2 Editions', label: 'CHR-AUD 001 & 002' },
            { val: '$999 / $125m', label: '125+ Docs Suite' },
            { val: '+$160/mo', label: 'Elite Included' },
            { val: '100+ Functions', label: '20k Credits/mo' },
            { val: '65+ Workflows', label: '2,500 Msgs/mo' },
            { val: '14-Day Trial', label: '$0 Upfront' },
          ].map((stat, idx) => {
            const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
            return (
              <div
                key={stat.label}
                className="rounded-2xl p-[3px] shadow-sm"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full flex-col items-center justify-center rounded-[13px] px-2 py-2.5 text-center text-[#0A2B6D]"
                  style={{ background: sprayBg }}
                >
                  <div className="font-editorial text-sm sm:text-base font-extrabold text-[#0A2B6D]">
                    {stat.val}
                  </div>
                  <div
                    className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-black"
                    style={{ color: '#000000' }}
                  >
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* LEFT: $999 Outright Docs Package TV Screen · RIGHT: What You Get in the Package & Subscription */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="grid w-full grid-cols-1 lg:grid-cols-12 gap-4 items-stretch rounded-[12px] bg-white p-4 text-center">
            {/* LEFT COLUMN: $999 Outright Docs Package on a Constantly Lit TV Screen */}
            <div className="lg:col-span-5 flex flex-col items-center justify-between">
              <div
                className="flex w-full flex-1 flex-col justify-between rounded-[22px] border-[4px] bg-[#0072FF] p-3 ring-4 ring-[#00C6FF]/75 shadow-lg"
                style={{ borderColor: '#00C6FF' }}
              >
                {/* Top TV Screen Bar */}
                <div className="mb-2 flex items-center justify-between px-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
                    <Tv className="h-3.5 w-3.5 text-[#FFF3FA]" />
                    $999 OUTRIGHT TV · LIT UP ✦
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[9px] font-extrabold text-white">
                    <Radio className="h-2.5 w-2.5 text-[#FF2E9A]" />
                    LIVE HD
                  </span>
                </div>

                {/* Inner TV Screen — All Writing Centered */}
                <div
                  className="flex flex-1 rounded-2xl p-[3px]"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div
                    className="flex w-full flex-col items-center justify-between gap-2.5 rounded-[13px] p-4 text-center"
                    style={{ background: SPRAY_BGS[2] }}
                  >
                    <span
                      className="gradient-brand inline-flex w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-2xs"
                      style={{ background: getHeaderView(0), color: '#FFFFFF' }}
                    >
                      <Sparkles className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                      <span style={{ color: '#FFFFFF' }}>Outright Docs &amp; Subscription Value</span>
                    </span>

                    <div
                      className="w-full rounded-xl p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div className="flex flex-col items-center justify-center rounded-[9px] bg-white px-3.5 py-3 text-center">
                        <div className="font-editorial text-2xl sm:text-3xl font-extrabold leading-tight">
                          <span className="text-[#0A2B6D]">$999 </span>
                          <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                            Outright
                          </span>
                        </div>
                        <div className="mt-0.5 text-xs font-extrabold text-[#5A00D6]">
                          or $125 per month · Full 125+ Document Suite
                        </div>
                        <p
                          className="mt-1.5 text-center text-xs font-bold leading-snug text-black"
                          style={{ color: '#000000' }}
                        >
                          Or subscribe to the full 46-Module Super-Platform from $660/mo ($7,920/yr) and replace $4,080+/mo of disconnected tools.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] font-extrabold">
                      <span className="rounded-full border border-[#0A2B6D] bg-white px-3 py-0.5 text-[#0072FF]">
                        125+ Master Docs
                      </span>
                      <span className="rounded-full border border-[#0A2B6D] bg-white px-3 py-0.5 text-[#5A00D6]">
                        6 Binders
                      </span>
                      <span className="rounded-full border border-[#0A2B6D] bg-white px-3 py-0.5 text-[#FF2E9A]">
                        356 Checkpoints
                      </span>
                    </div>

                    <a
                      href="#pricing"
                      className="gradient-brand inline-flex min-h-[38px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1.5 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                      style={{ background: getHeaderView(2), color: '#FFFFFF' }}
                    >
                      <span style={{ color: '#FFFFFF' }}>View Outright &amp; Subscription Plans</span>
                      <ArrowRight className="h-3.5 w-3.5 text-white" style={{ color: '#FFFFFF' }} />
                    </a>
                  </div>
                </div>

                {/* Bottom TV Controls Bar */}
                <div className="mt-2 flex items-center justify-between px-2">
                  <span className="text-[8.5px] font-extrabold tracking-widest text-white">
                    CHR-DOC-TV · LIVE HD
                  </span>
                  <span className="h-2 w-2 rounded-full bg-[#FF2E9A]" />
                </div>
              </div>

              {/* TV Stand Legs & Base */}
              <div className="h-2.5 w-10 bg-[#0A2B6D]" />
              <div
                className="h-2 w-24 rounded-full border-2 border-[#0A2B6D]"
                style={{ background: TOP_BORDER_GRADIENT }}
              />
            </div>

            {/* RIGHT COLUMN: List What You Get (6 Centered Inclusion Tiles) */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-2.5">
              <div
                className="w-full rounded-full p-[2.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="gradient-brand flex min-h-[40px] w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(1), color: '#FFFFFF' }}
                >
                  <TrendingUp className="h-4 w-4 text-white" style={{ color: '#FFFFFF' }} />
                  <span style={{ color: '#FFFFFF' }}>What You Get in the $999 Outright &amp; Monthly Packages</span>
                </div>
              </div>

              <div className="grid flex-1 grid-cols-1 sm:grid-cols-2 gap-2.5 items-stretch">
                {WHAT_YOU_GET_ITEMS.map((item, idx) => {
                  const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                  return (
                    <div
                      key={item.title}
                      className="flex h-full rounded-2xl p-[2.5px] shadow-2xs"
                      style={{ background: TOP_BORDER_GRADIENT }}
                    >
                      <div
                        className="flex h-full w-full flex-col items-center justify-between gap-1.5 rounded-[13px] px-3 py-2.5 text-center"
                        style={{ background: sprayBg }}
                      >
                        <div className="w-full rounded-lg border border-[#0A2B6D]/20 bg-white px-2.5 py-1 text-center text-xs font-extrabold text-[#0A2B6D]">
                          {item.title}
                        </div>
                        <span className="rounded-full border border-[#0A2B6D] bg-white px-2.5 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                          {item.included}
                        </span>
                        <p
                          className="text-center text-[10.5px] font-bold leading-snug text-black"
                          style={{ color: '#000000' }}
                        >
                          {item.detail}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Centered Pillar Number Tiles */}
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <div
            className="rounded-full p-[2.5px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <button
              type="button"
              onClick={() => setSelectedPillar('all')}
              className="inline-flex min-h-[38px] min-w-[128px] items-center justify-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold transition-all"
              style={
                selectedPillar === 'all'
                  ? { background: getHeaderView(0), color: '#ffffff' }
                  : { background: SPRAY_BGS[0], color: '#0A2B6D' }
              }
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                <Layers className="h-3 w-3 text-[#0072FF]" />
              </span>
              <span className="whitespace-nowrap">All 8 Pillars</span>
            </button>
          </div>

          {MUST_HAVE_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            const sym = getSymbolView(idx + 1);
            const active = selectedPillar === p.id;
            return (
              <div
                key={p.id}
                className="rounded-full p-[2.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <button
                  type="button"
                  onClick={() => setSelectedPillar(p.id)}
                  className="inline-flex min-h-[38px] min-w-[112px] items-center justify-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold transition-all"
                  style={
                    active
                      ? { background: getHeaderView(idx + 1), color: '#ffffff' }
                      : { background: SPRAY_BGS[(idx + 1) % SPRAY_BGS.length], color: '#0A2B6D' }
                  }
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] bg-white">
                    <Icon className="h-3 w-3" style={{ color: sym.iconColor }} />
                  </span>
                  <span className="whitespace-nowrap">Pillar {idx + 1}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* 8 Must-Have Pillars Grid — Fixed Section Heights so Pillars 1&2, 3&4, 5&6, 7&8 Line Up Horizontally */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-center items-stretch">
          {visiblePillars.map((pillar, pIdx) => {
            const Icon = pillar.icon;
            const ipadBorder = getAppBorderView(pIdx);
            return (
              <div
                key={pillar.id}
                className="flex h-full flex-col justify-between rounded-[26px] border-[4px] bg-[#0A2B6D] p-3 shadow-lg"
                style={{ borderColor: ipadBorder }}
              >
                {/* Top iPad Camera & Status Bar */}
                <div className="mb-2 flex h-[20px] items-center justify-between px-2.5">
                  <span className="flex items-center gap-1.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                    <span className="h-2 w-2 rounded-full bg-[#00C6FF]" />
                    iPad Pro · Pillar 0{pIdx + 1}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-extrabold text-white/85">5G · 100%</span>
                    <span className="h-2 w-3.5 rounded-xs border border-white bg-[#10B981]" />
                  </div>
                </div>

                {/* Inner iPad Retina Screen — Fixed Heights for Badge, Title Box, 6 Bullet Rows & Footer */}
                <div
                  className="flex flex-1 rounded-[18px] p-[3px] shadow-inner"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex h-full w-full flex-col justify-between rounded-[15px] bg-white p-3.5">
                    <div className="flex flex-1 flex-col justify-between space-y-2.5">
                      <div className="space-y-2">
                        {/* Fixed-Height Stretched Pillar Header Badge */}
                        <div
                          className="w-full rounded-full p-[2.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <span
                            className="gradient-brand inline-flex h-[36px] w-full items-center justify-center gap-2 rounded-full px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white"
                            style={{ background: getHeaderView(pIdx), color: '#FFFFFF' }}
                          >
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                              <Icon className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                            </span>
                            <span className="truncate" style={{ color: '#FFFFFF' }}>{pillar.badge}</span>
                          </span>
                        </div>

                        {/* Fixed-Height Heading & Subtitle Box so Pillars 1&2, 3&4, 5&6, 7&8 Line Up */}
                        <div
                          className="w-full rounded-xl p-[2.5px] shadow-2xs"
                          style={{ background: TOP_BORDER_GRADIENT }}
                        >
                          <div className="flex min-h-[84px] flex-col items-center justify-center rounded-[9px] bg-white px-3 py-2 text-center">
                            <h4
                              className="font-editorial text-xs sm:text-sm font-extrabold leading-snug bg-clip-text text-transparent"
                              style={{ backgroundImage: getTitleGradientView(pIdx) }}
                            >
                              {pillar.title}
                            </h4>
                            <p
                              className="mt-1 text-[11px] font-bold leading-snug text-black"
                              style={{ color: '#000000' }}
                            >
                              {pillar.subtitle}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* 6 Equal-Height Bullet Rows Lined Up Across Every Pillar Pair */}
                      <ul className="grid flex-1 grid-cols-1 grid-rows-6 gap-1.5 pt-1">
                        {pillar.items.map((item, iIdx) => {
                          const idx = pIdx * 3 + iIdx;
                          const sym = getSymbolView(idx);
                          const borderCol = getAppBorderView(idx);
                          const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                          return (
                            <li
                              key={item}
                              className="flex h-full min-h-[54px] rounded-xl p-[2px] shadow-2xs"
                              style={{ background: TOP_BORDER_GRADIENT }}
                            >
                              <div
                                className="flex h-full w-full items-center justify-center gap-2 rounded-[10px] px-2.5 py-1.5 text-center text-[11px] font-extrabold leading-snug text-[#0A2B6D]"
                                style={{ background: sprayBg }}
                              >
                                <span
                                  className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full border bg-white"
                                  style={{ borderColor: borderCol }}
                                >
                                  <CheckCircle2 className="h-3 w-3" style={{ color: sym.iconColor }} />
                                </span>
                                <span className="flex-1 text-center text-[#0A2B6D]">{item}</span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Fixed-Height Footer Bar */}
                    <div className="mt-3 pt-2.5 border-t border-[#0A2B6D]/20 flex h-[42px] items-center justify-between">
                      <span className="text-[10.5px] font-extrabold text-[#0A2B6D]">
                        From $660/mo Plan
                      </span>
                      <Link
                        to="/register"
                        className="gradient-brand inline-flex items-center gap-1 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white"
                        style={{ background: getHeaderView(pIdx + 2), color: '#FFFFFF' }}
                      >
                        <span style={{ color: '#FFFFFF' }}>Activate</span>
                        <ArrowRight className="h-3 w-3 text-white" style={{ color: '#FFFFFF' }} />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Bottom iPad Home Indicator Bar */}
                <div className="mt-2 flex h-[10px] items-center justify-center gap-2">
                  <span className="h-1.5 w-16 rounded-full bg-white/80" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}