import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck, Users, CalendarClock,
  AlertTriangle, GraduationCap, MessagesSquare, Building2,
  CheckCircle2, ArrowRight, Cpu, TrendingUp, BookOpen, Layers, Sparkles,
} from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  getHeaderView,
  getTitleGradientView,
  getSubheaderColourView,
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

export const REPLACED_SOFTWARE_STACK = [
  { tool: 'Standalone NDIS Audit Consultant & Templates', typicalCost: '$1,200/mo' },
  { tool: 'HR Information System & Digital Contracts', typicalCost: '$450/mo' },
  { tool: 'Shift Rostering & Award/Timesheet Software', typicalCost: '$550/mo' },
  { tool: 'NDIS Price Guide Invoicing & Claiming Tool', typicalCost: '$400/mo' },
  { tool: 'Incident, Risk & WHS Compliance Software', typicalCost: '$480/mo' },
  { tool: 'LMS Staff Training & Certificate Generator', typicalCost: '$390/mo' },
  { tool: 'Team Messaging, Diary & Task Boards', typicalCost: '$320/mo' },
  { tool: 'Document Vault, Read-Receipts & E-Sign', typicalCost: '$290/mo' },
];

export const MUST_HAVE_PILLARS = [
  {
    id: 'master-audit-doc',
    badge: 'PILLAR 1 · VALUED AT $355',
    title: '1. $355 Master Compliance Audit Checklist Suite (CHR-AUD-001 & 002)',
    subtitle: '17 Audit Categories · 356 Checkpoints · 11 Interactive & Printable Pages',
    icon: ClipboardCheck,
    items: [
      '17 Audit Categories & 356 Checkpoints across 11 structured pages',
      'Dual Executive Gold (CHR-AUD-001) & Infinity Purple (CHR-AUD-002) editions',
      'Interactive Yes / No / N/A compliance status ticks with live evidence notes',
      'Corrective action owner assignment, target dates & completion tracking',
      '1-Click Printable PDF Audit Pack, Weekly Compliance Report & Board Pack',
      'Valued at $355 standalone — INCLUDED FREE in every Smart Enhanced plan',
    ],
  },
  {
    id: 'dual-workspace',
    badge: 'PILLAR 2 · INTERACTIVE VISUALS',
    title: '2. Dual Interactive Workspace: Office View + Profile View',
    subtitle: 'Executive Wall Scene, Desk Equipment & Custom Modular Data Selector',
    icon: Building2,
    items: [
      'Switch live between Enhanced Office View, General Profile View, or Side-by-Side',
      'Interactive Modular Screen & Data Selector: pin up to 6 live modulars at once',
      'Framed wall art of all 46 modules + 16 Communication Centre modulars',
      'Split Silver Screen with live local weather & NDIS Commission news',
      'Interactive PC Monitor, Secondary Branded Screen & Company Safe Vault',
      'Zero-gap, high-contrast Blue-Purple-Pink & 46-module colour architecture',
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
      'NDIS Worker Screening, Blue Card, Police Check, First Aid & CPR expiry alerts',
      'Participant NDIS plans, budgets, goals, 10-weekly & 3-monthly review trackers',
      'Service-role protected 3-Part Consents (Information Sharing, Advocacy, Medication)',
      'Instant Staff ID Badge & Name Tag Studio with printable PDF export',
      'Consent-gated External NDIS Auditor Portal for safe, read-only audit inspections',
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
      'Professional Branded HTML Emails with auto-attached business & key contacts',
      'AI Compose Assistant & ready-to-send NDIS/HR communication templates',
      'Automated 30-Completed-Task & 30-Action Batch PDF/CSV audit reports',
    ],
  },
  {
    id: 'rostering-finance',
    badge: 'PILLAR 5 · NDIS OPERATIONS',
    title: '5. NDIS Rostering, Timesheets, Price-Guide Invoicing & Payroll',
    subtitle: 'End-to-End Shift Planning, PRODA Claims, Quotes & Bank Match',
    icon: CalendarClock,
    items: [
      'Smart Roster Board with worker screening checks, availability & coverage heatmap',
      'Roster validation rules, public holiday rates, labour forecast & weekly sign-off',
      'Shift-to-Invoice generator mapped to current NDIS Price Guide support items',
      'Quotes Centre, AI Receipt Scanner, Bank Reconciliation & 3-Way Procurement Match',
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
      'NDIS Reportable Incident Clinic with 24-hour & 5-day Commission deadline timers',
      'Root-cause investigation workflows, photo evidence & WHS regulator tracking',
      'Live Risk & Hazard Register with Hierarchy of Controls (Eliminate to PPE)',
      '6-Monthly Individual & Home Risk Assessments + Pre-Shift Take-5 Safety Checks',
      'Emergency Evacuation Drills, Smoke Alarm/Extinguisher logs & Visitor Sign-In',
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
      'HR Paperwork Hub: Employment Contracts, Position Descriptions & Digital Signing',
      '100-Point Staff File Completeness Tracker & Annual Performance Appraisals',
      'Interactive LMS Learner Portal with AI Course Author & AI Competency Quiz Drill',
      'Auto-issued PDF Certificates of Completion signed by Kristy Lee Whelan',
      'Skills Gap Analytics, Training Streaks, Buddy Shifts & Volunteer Placements',
      'Smart Document Vault with version control, read-receipts & renewal calendars',
    ],
  },
  {
    id: 'automation-engine',
    badge: 'PILLAR 8 · 100+ FUNCTIONS',
    title: '8. 24/7 Autonomous Compliance Engine & AI Copilots',
    subtitle: 'Powered by 2,500 Message Credits & 20,000 Integration Credits on Elite Pack',
    icon: Cpu,
    items: [
      '65+ live automated workflows running scheduled expiry scans & escalations',
      '100+ backend server functions handling audit trails, PDFs, emails & sync',
      'Auto-routing of incidents, risks, complaints, shift notes & drills to management',
      'Google Calendar & Gmail integration + GitHub repository stats & sync',
      'In-App Personal AI Assistant, AI Goal Coach & System Health Troubleshooter',
      'Strict Row-Level Security (RLS) across 115+ NDIS & HR database entities',
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
        {/* Heading & Subheading Inside Stretched App Design Coloured Border */}
        <div
          className="w-full rounded-2xl border-2 border-[#0A2B6D] p-3 sm:p-4 shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="w-full rounded-xl border-2 border-[#0A2B6D] bg-white px-5 py-4 sm:px-8 sm:py-5 text-center space-y-2">
            <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span className="text-[#0A2B6D]">Complete Review of Every </span>
              <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                Must-Have Function,
              </span>{' '}
              <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent">
                Resource &amp; Feature
              </span>
            </h2>
            <p
              className="mx-auto max-w-4xl text-xs sm:text-sm md:text-base font-extrabold leading-relaxed"
              style={{ color: getSubheaderColourView(1) }}
            >
              {MODULE_DIRECTORY.length} Modules · 17 Audit Categories · 356 Checkpoints · 100+ Functions · 65+ Workflows
            </p>
          </div>
        </div>

        {/* Stretched Side-to-Side Banner Underneath in App Design Coloured Border */}
        <div
          className="w-full rounded-full p-[3px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div
            className="flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-full px-6 py-2 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white"
            style={{ background: getHeaderView(0) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <BookOpen className="h-3.5 w-3.5 text-white" />
            </span>
            <span className="text-center">Full Review of Every Must-Have Function · Includes $355 Audit Doc Free</span>
          </div>
        </div>

        {/* Executive KPI Counter Pills in Pink, Blue & Purple Spray + App Design Coloured Borders */}
        <div className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
          {[
            { val: `${MODULE_DIRECTORY.length}`, label: 'Connected Modules' },
            { val: '17', label: 'Audit Categories' },
            { val: '356', label: 'Audit Checkpoints' },
            { val: '$999 / $125m', label: '125+ Docs Suite' },
            { val: '100+', label: 'Server Functions' },
            { val: '65+', label: 'Live Workflows' },
            { val: '115+', label: 'Secured Entities' },
            { val: '+$160/m', label: 'Elite Pack Included' },
          ].map((stat, idx) => {
            const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
            return (
              <div
                key={stat.label}
                className="rounded-2xl p-[3px] shadow-sm"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div
                  className="flex h-full flex-col items-center justify-center rounded-[13px] px-2.5 py-2.5 text-center text-[#0A2B6D]"
                  style={{ background: sprayBg }}
                >
                  <div className="font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D]">
                    {stat.val}
                  </div>
                  <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                    {stat.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Replace 8 Disconnected Subscriptions Card + Outright Pack in App Design Coloured Border */}
        <div
          className="w-full rounded-2xl p-[4px] shadow-sm"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="grid w-full grid-cols-1 lg:grid-cols-12 gap-4 items-stretch rounded-[12px] bg-white p-4 text-left">
            <div className="lg:col-span-4 flex flex-col justify-center space-y-2.5">
              <div
                className="w-full rounded-full p-[2.5px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <span
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white"
                  style={{ background: getHeaderView(1) }}
                >
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                    <TrendingUp className="h-3 w-3 text-white" />
                  </span>
                  <span>Why Providers Subscribe Monthly</span>
                </span>
              </div>
              <div
                className="w-full rounded-xl p-[3px] shadow-2xs"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div className="rounded-[9px] bg-white px-3.5 py-2">
                  <h3
                    className="font-editorial text-sm sm:text-base font-extrabold bg-clip-text text-transparent"
                    style={{ backgroundImage: getTitleGradientView(2) }}
                  >
                    Replace $4,080+/Month of Disconnected Software &amp; Consultants With One Subscription
                  </h3>
                </div>
              </div>
              <p className="text-xs font-bold leading-relaxed text-[#0A2B6D]">
                Instead of paying for 8 separate HR, rostering, invoicing, LMS, incident, vault, messaging and audit tools, ComplianceHR Infinity unifies all {MODULE_DIRECTORY.length} modules + the $160/mo Elite Plan + the $355 Master Compliance Audit Checklist starting at $660/month.
              </p>
            </div>

            <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2.5 content-center">
              {REPLACED_SOFTWARE_STACK.map((item, idx) => {
                const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                return (
                  <div
                    key={item.tool}
                    className="rounded-2xl p-[2.5px] shadow-2xs"
                    style={{ background: TOP_BORDER_GRADIENT }}
                  >
                    <div
                      className="flex h-full items-center justify-between gap-2 rounded-[13px] px-3 py-2 text-xs font-extrabold text-[#0A2B6D]"
                      style={{ background: sprayBg }}
                    >
                      <span className="min-w-0 leading-tight text-[#0A2B6D]">{item.tool}</span>
                      <span className="shrink-0 rounded-full border border-[#0A2B6D] bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#0072FF] line-through">
                        {item.typicalCost}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Outright Docs Package — Styled to Match Top Section in Colours */}
            <div
              className="lg:col-span-3 rounded-2xl p-[6px] shadow-md flex"
              style={{ background: TOP_BORDER_GRADIENT }}
            >
              <div className="flex w-full flex-col items-center justify-between gap-2.5 rounded-[12px] bg-white p-3.5 text-center">
                <span
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
                  style={{ background: getHeaderView(0) }}
                >
                  <Sparkles className="h-3 w-3 text-white" />
                  <span>Outright Docs Package</span>
                </span>

                <div className="font-editorial text-lg sm:text-xl font-extrabold leading-tight">
                  <span className="text-[#0A2B6D]">$999 </span>
                  <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
                    Outright
                  </span>{' '}
                  <span className="bg-gradient-to-r from-[#5A00D6] via-[#A100FF] to-[#FF2E9A] bg-clip-text text-transparent text-sm">
                    or $125/mo
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1 text-[10.5px] font-extrabold">
                  <span className="text-[#0072FF]">125+ Docs.</span>
                  <span className="text-[#5A00D6]">6 Binders.</span>
                  <span className="text-[#FF2E9A]">CHR-AUD-001 &amp; 002.</span>
                </div>

                <a
                  href="#pricing"
                  className="inline-flex min-h-[36px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold text-white shadow-sm transition-all hover:-translate-y-0.5"
                  style={{ background: getHeaderView(2) }}
                >
                  <span>View Plans</span>
                  <ArrowRight className="h-3.5 w-3.5 text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* All 8 Pillars + All Button with App Design Coloured Borders & Spray Background */}
        <div className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2">
          <div
            className="rounded-full p-[2.5px] shadow-2xs"
            style={{ background: TOP_BORDER_GRADIENT }}
          >
            <button
              type="button"
              onClick={() => setSelectedPillar('all')}
              className="inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-all"
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
                  className="inline-flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition-all"
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

        {/* 8 Must-Have Pillars Grid — App Design Coloured Borders & Spray Tiles */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left items-stretch">
          {visiblePillars.map((pillar, pIdx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="flex h-full rounded-2xl p-[3.5px] shadow-sm"
                style={{ background: TOP_BORDER_GRADIENT }}
              >
                <div className="flex h-full w-full flex-col justify-between rounded-[13px] bg-white p-4">
                  <div className="flex flex-1 flex-col justify-between space-y-2.5">
                    <div className="space-y-2">
                      {/* Stretched Pillar Header Border */}
                      <div
                        className="w-full rounded-full p-[2.5px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <span
                          className="inline-flex min-h-[34px] w-full items-center justify-center gap-2 rounded-full px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white"
                          style={{ background: getHeaderView(pIdx) }}
                        >
                          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                            <Icon className="h-3 w-3 text-white" />
                          </span>
                          <span>{pillar.badge}</span>
                        </span>
                      </div>

                      {/* Heading in Stretched App Design Coloured Border */}
                      <div
                        className="w-full rounded-xl p-[2.5px] shadow-2xs"
                        style={{ background: TOP_BORDER_GRADIENT }}
                      >
                        <div className="rounded-[9px] bg-white px-3 py-2 text-center">
                          <h4
                            className="font-editorial text-xs sm:text-sm font-extrabold leading-snug bg-clip-text text-transparent"
                            style={{ backgroundImage: getTitleGradientView(pIdx) }}
                          >
                            {pillar.title}
                          </h4>
                          <p className="mt-0.5 text-[11px] font-bold text-[#0A2B6D]">
                            {pillar.subtitle}
                          </p>
                        </div>
                      </div>
                    </div>

                    <ul className="grid flex-1 grid-cols-1 auto-rows-fr gap-1.5 pt-1">
                      {pillar.items.map((item, iIdx) => {
                        const idx = pIdx * 3 + iIdx;
                        const sym = getSymbolView(idx);
                        const borderCol = getAppBorderView(idx);
                        const sprayBg = SPRAY_BGS[idx % SPRAY_BGS.length];
                        return (
                          <li
                            key={item}
                            className="flex h-full rounded-xl p-[2px] shadow-2xs"
                            style={{ background: TOP_BORDER_GRADIENT }}
                          >
                            <div
                              className="flex h-full w-full items-center gap-2 rounded-[10px] px-2.5 py-1.5 text-xs font-extrabold leading-snug text-[#0A2B6D]"
                              style={{ background: sprayBg }}
                            >
                              <span
                                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border bg-white"
                                style={{ borderColor: borderCol }}
                              >
                                <CheckCircle2 className="h-2.5 w-2.5" style={{ color: sym.iconColor }} />
                              </span>
                              <span className="text-[#0A2B6D]">{item}</span>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-[#0A2B6D]/20 flex items-center justify-between">
                    <span className="text-[10.5px] font-extrabold text-[#0A2B6D]">
                      Included in Plan
                    </span>
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white"
                      style={{ background: getHeaderView(pIdx + 2) }}
                    >
                      Activate <ArrowRight className="h-3 w-3 text-white" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}