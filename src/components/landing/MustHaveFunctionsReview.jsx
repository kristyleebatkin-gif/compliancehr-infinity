import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardCheck, Users, CalendarClock,
  AlertTriangle, GraduationCap, MessagesSquare, Building2,
  CheckCircle2, ArrowRight, Cpu, Sparkles, TrendingUp, BookOpen,
} from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';
const ICON_GRADIENT =
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 28%, #5A00D6 60%, #A100FF 80%, #FF2E9A 100%)';
const BADGE_GRADIENT =
  'linear-gradient(120deg, #FF2E9A 0%, #A100FF 42%, #5A00D6 74%, #0072FF 100%)';

export const REPLACED_SOFTWARE_STACK = [
  { tool: 'Standalone NDIS Audit Consultant & Templates', typicalCost: '$1,200/mo', color: '#0072FF' },
  { tool: 'HR Information System & Digital Contracts', typicalCost: '$450/mo', color: '#0A2B6D' },
  { tool: 'Shift Rostering & Award/Timesheet Software', typicalCost: '$550/mo', color: '#5A00D6' },
  { tool: 'NDIS Price Guide Invoicing & Claiming Tool', typicalCost: '$400/mo', color: '#A100FF' },
  { tool: 'Incident, Risk & WHS Compliance Software', typicalCost: '$480/mo', color: '#FF2E9A' },
  { tool: 'LMS Staff Training & Certificate Generator', typicalCost: '$390/mo', color: '#A100FF' },
  { tool: 'Team Messaging, Diary & Task Boards', typicalCost: '$320/mo', color: '#5A00D6' },
  { tool: 'Document Vault, Read-Receipts & E-Sign', typicalCost: '$290/mo', color: '#00C6FF' },
];

export const MUST_HAVE_PILLARS = [
  {
    id: 'master-audit-doc',
    badge: 'NEW · VALUED AT $355',
    title: '1. $355 Master Compliance Audit Checklist Suite (CHR-AUD-001 & 002)',
    subtitle: '17 Audit Categories · 356 Checkpoints · 11 Interactive & Printable Pages',
    color: '#0072FF',
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
    badge: 'INTERACTIVE VISUALS',
    title: '2. Dual Interactive Workspace: Office View + Profile View',
    subtitle: 'Executive Wall Scene, Desk Equipment & Custom Modular Data Selector',
    color: '#0A2B6D',
    icon: Building2,
    items: [
      'Switch live between Enhanced Office View, General Profile View, or Side-by-Side',
      'Interactive Modular Screen & Data Selector: pin up to 6 live modulars at once',
      'Framed wall art of all 45 modules + 16 Communication Centre modulars',
      'Split Silver Screen with live local weather & NDIS Commission news',
      'Interactive PC Monitor, Secondary Branded Screen & Company Safe Vault',
      'Zero-gap, high-contrast Blue-Purple-Pink & 45-module colour architecture',
    ],
  },
  {
    id: 'people-profiles',
    badge: 'UNIFIED DIRECTORY',
    title: '3. Complete Employee & Participant Profile Lifecycle',
    subtitle: 'Intake-to-Profile Automation, Screening Alerts & 3-Part Consents',
    color: '#5A00D6',
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
    badge: '16 COMMS MODULARS',
    title: '4. 16-Modular Communication Centre & Shared To-Do Command',
    subtitle: 'Diaries, Shift Notes, Branded Email, Video Calls & Gamified Tasks',
    color: '#A100FF',
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
    badge: 'NDIS OPERATIONS',
    title: '5. NDIS Rostering, Timesheets, Price-Guide Invoicing & Payroll',
    subtitle: 'End-to-End Shift Planning, PRODA Claims, Quotes & Bank Match',
    color: '#FF2E9A',
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
    badge: 'SAFEGUARDING & WHS',
    title: '6. Incident Clinic, Risk Matrix & Emergency Readiness',
    subtitle: '24h / 5-Day NDIS Commission Timers, Take-5s, Drills & MSDS',
    color: '#A100FF',
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
    badge: 'HR & AI ACADEMY',
    title: '7. HR Paperwork Hub, LMS Training Academy & Certificates',
    subtitle: 'Digital Contracts, 360° Appraisals, AI Quizzes & Branded Certificates',
    color: '#5A00D6',
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
    badge: '100+ FUNCTIONS · 65+ WORKFLOWS',
    title: '8. 24/7 Autonomous Compliance Engine & AI Copilots',
    subtitle: 'Powered by 2,500 Message Credits & 20,000 Integration Credits on Elite Pack',
    color: '#00C6FF',
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
      <div className="flex w-full flex-col items-center justify-center rounded-[16px] bg-white px-4 py-5 sm:px-6 sm:py-6 text-center space-y-5">
        {/* Centred Badge */}
        <span
          className="mx-auto inline-flex min-h-[42px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm md:text-base font-extrabold tracking-wide text-white shadow-sm"
          style={{ background: BADGE_GRADIENT }}
        >
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white bg-white text-[#0072FF]">
            <BookOpen className="h-3.5 w-3.5 text-[#0072FF]" />
          </span>
          <span className="text-center">Full Review of Every Must-Have Function · Includes $355 Audit Doc Free</span>
        </span>

        {/* Heading & Subheading */}
        <div className="mx-auto max-w-4xl space-y-1.5">
          <h2 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-[#0A2B6D]">
            Complete Review of Every{' '}
            <span className="font-editorial-italic bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              Must-Have Function, Resource &amp; Feature
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base font-extrabold text-[#5A00D6]">
            {MODULE_DIRECTORY.length} Modules · 17 Audit Categories · 356 Checkpoints · 100+ Functions · 65+ Workflows
          </p>
        </div>

        {/* Executive KPI Counter Pills */}
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
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white px-2.5 py-2.5 text-center shadow-sm"
            >
              <div className="font-editorial text-base sm:text-lg font-extrabold text-[#5A00D6]">
                {stat.val}
              </div>
              <div className="mt-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Replace 8 Disconnected Subscriptions Card on Crisp White */}
        <div className="grid w-full grid-cols-1 lg:grid-cols-12 gap-4 items-center rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 text-left shadow-sm">
          <div className="lg:col-span-4 space-y-2">
            <span
              className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-white"
              style={{ background: BADGE_GRADIENT }}
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white text-[#FF2E9A]">
                <TrendingUp className="h-3 w-3 text-[#FF2E9A]" />
              </span>
              <span>Why Providers Subscribe Monthly</span>
            </span>
            <h3 className="font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D]">
              Replace $4,080+/Month of Disconnected Software &amp; Consultants With One Subscription
            </h3>
            <p className="text-xs font-bold leading-relaxed text-[#0A2B6D]">
              Instead of paying for 8 separate HR, rostering, invoicing, LMS, incident, vault, messaging and audit tools, ComplianceHR Infinity unifies all {MODULE_DIRECTORY.length} modules + the $160/mo Elite Plan + the $355 Master Compliance Audit Checklist starting at $660/month.
            </p>
          </div>

          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {REPLACED_SOFTWARE_STACK.map((item) => (
              <div
                key={item.tool}
                className="flex items-center justify-between gap-2 rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] shadow-2xs"
              >
                <span className="min-w-0 leading-tight">{item.tool}</span>
                <span className="shrink-0 rounded-full border border-[#0A2B6D] bg-white px-2 py-0.5 text-[10px] font-extrabold text-[#FF2E9A] line-through">
                  {item.typicalCost}
                </span>
              </div>
            ))}
          </div>

          <div className="lg:col-span-3 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3.5 text-center shadow-2xs">
            <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Outright Docs Package
            </div>
            <div className="flex items-baseline justify-center gap-1.5">
              <span className="font-editorial text-xl font-extrabold text-[#0A2B6D]">$999 Outright</span>
              <span className="text-xs font-bold text-[#5A00D6]">or $125/mo</span>
            </div>
            <div className="rounded-full border border-[#0A2B6D] bg-white px-3 py-0.5 text-[10px] font-extrabold text-[#0A2B6D]">
              125+ Docs · 6 Binders · CHR-AUD-001 &amp; 002
            </div>
            <a
              href="#pricing"
              className="inline-flex min-h-[36px] w-full items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold text-white shadow-sm"
              style={{
                background:
                  'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
              }}
            >
              <span>View Plans</span>
              <ArrowRight className="h-3.5 w-3.5 text-white" />
            </a>
          </div>
        </div>

        {/* Filter Bar for the 8 Must-Have Pillars */}
        <div className="flex w-full flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedPillar('all')}
            className="inline-flex min-h-[36px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold transition-all"
            style={
              selectedPillar === 'all'
                ? { background: BADGE_GRADIENT, color: '#ffffff' }
                : { background: '#ffffff', color: '#0A2B6D' }
            }
          >
            Show All 8 Pillars
          </button>
          {MUST_HAVE_PILLARS.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPillar(p.id)}
              className="inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-xs font-extrabold transition-all"
              style={
                selectedPillar === p.id
                  ? { background: BADGE_GRADIENT, color: '#ffffff' }
                  : { background: '#ffffff', color: '#0A2B6D' }
              }
            >
              Pillar {idx + 1}
            </button>
          ))}
        </div>

        {/* 8 Must-Have Pillars Grid */}
        <div className="grid w-full grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          {visiblePillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="flex flex-col justify-between rounded-2xl border-2 border-[#0A2B6D] bg-white p-4 shadow-sm"
              >
                <div>
                  <span
                    className="inline-flex items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white"
                    style={{ background: BADGE_GRADIENT }}
                  >
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white bg-white text-[#5A00D6]">
                      <Icon className="h-3 w-3 text-[#5A00D6]" />
                    </span>
                    <span>{pillar.badge}</span>
                  </span>

                  <h4 className="mt-2.5 font-editorial text-sm font-extrabold leading-snug text-[#0A2B6D]">
                    {pillar.title}
                  </h4>
                  <p className="mt-0.5 text-xs font-bold text-[#5A00D6]">{pillar.subtitle}</p>

                  <ul className="mt-2.5 space-y-1.5">
                    {pillar.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2 text-xs font-bold leading-snug text-[#0A2B6D]"
                      >
                        <span
                          className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[#0A2B6D] text-white"
                          style={{ background: ICON_GRADIENT }}
                        >
                          <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-4 pt-2.5 border-t border-[#0A2B6D]/20 flex items-center justify-between">
                  <span className="text-[10.5px] font-extrabold text-[#5A00D6]">
                    Included in Plan
                  </span>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 rounded-full border-2 border-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white"
                    style={{
                      background:
                        'linear-gradient(120deg, #00C6FF 0%, #0072FF 32%, #5A00D6 68%, #FF2E9A 100%)',
                    }}
                  >
                    Activate <ArrowRight className="h-3 w-3 text-white" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}