import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck, ClipboardCheck, Users, Heart, CalendarClock, FileSpreadsheet,
  AlertTriangle, GraduationCap,MessagesSquare, Building2, Sparkles, Lock,
  CheckCircle2, ArrowRight, Layers, Zap, Award, FileText, Globe, Cpu,
} from 'lucide-react';
import { Image } from '@/components/ui/image';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';

const SQUISHED_GRADIENT =
  'linear-gradient(120deg, #2563eb 0%, #2563eb 45%, #7c3aed 50%, #ec4899 55%, #ec4899 100%)';
const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';
const CHOICES_NQ_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/7772df0fa_generated_image.png';
const MASTER_AUDIT_DUAL_IMAGE =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/a4e081538_ChoicesNQMasterComplianceAuditDoc2026.png';

export const MUST_HAVE_PILLARS = [
  {
    id: 'master-audit-doc',
    badge: 'NEW · VALUED AT $355',
    title: '1. $355 Master Compliance Audit Checklist Suite (Both Apps)',
    subtitle: 'Choices NQ (CHN-AUD-001) & ComplianceHR Infinity (CHR-AUD-001)',
    color: '#6d28d9',
    icon: ClipboardCheck,
    items: [
      '17 Audit Categories & 356 Checkpoints across 11 structured pages',
      'Dual-branded visual editions for Choices NQ & ComplianceHR Infinity',
      'Interactive Yes / No / N/A compliance status ticks with live evidence notes',
      'Corrective action owner assignment, target dates & completion tracking',
      '1-Click Printable PDF Audit Pack, Weekly Compliance Report & Board Pack',
      'Valued at $355 standalone — INCLUDED FREE with every monthly subscription',
    ],
  },
  {
    id: 'dual-workspace',
    badge: 'INTERACTIVE VISUALS',
    title: '2. Dual Interactive Workspace: Office View + Profile View',
    subtitle: 'Executive Wall Scene, Desk Equipment & Custom Modular Data Selector',
    color: '#2563eb',
    icon: Building2,
    items: [
      'Switch live between Enhanced Office View, General Profile View, or Side-by-Side',
      'Interactive Modular Screen & Data Selector: pin up to 6 live modulars at once',
      'Framed wall art of all 45 modules + 16 Communication Centre modulars',
      'Split Silver Screen with live Townsville/NQ weather & NDIS Commission news',
      'Interactive PC Monitor, Secondary Branded Screen & Company Safe Vault',
      'Zero-gap, high-contrast Blue-Purple-Pink & 45-module colour architecture',
    ],
  },
  {
    id: 'people-profiles',
    badge: 'UNIFIED DIRECTORY',
    title: '3. Complete Employee & Participant Profile Lifecycle',
    subtitle: 'Intake-to-Profile Automation, Screening Alerts & 3-Part Consents',
    color: '#e11d48',
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
    color: '#0891b2',
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
    color: '#16a34a',
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
    color: '#dc2626',
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
    color: '#0d9488',
    icon: GraduationCap,
    items: [
      'HR Paperwork Hub: Employment Contracts, Position Descriptions & Digital Signing',
      '100-Point Staff File Completeness Tracker & Annual Performance Appraisals',
      'Interactive LMS Learner Portal with AI Course Author & AI Competency Quiz Drill',
      'Auto-issued PDF Certificates of Completion signed by Kristy Whelan',
      'Skills Gap Analytics, Training Streaks, Buddy Shifts & Volunteer Placements',
      'Smart Document Vault with version control, read-receipts & renewal calendars',
    ],
  },
  {
    id: 'automation-engine',
    badge: '100+ FUNCTIONS · 65+ WORKFLOWS',
    title: '8. 24/7 Autonomous Compliance Engine & AI Copilots',
    subtitle: 'Powered by 2,500 Message Credits & 20,000 Integration Credits on Elite',
    color: '#db2777',
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
      className="rounded-2xl border-2 border-purple-600 bg-white p-2 sm:p-3 shadow-md space-y-2"
    >
      {/* Top Banner: Why Every Provider Needs a ComplianceHR Infinity Subscription */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 py-2 text-white shadow-sm"
        style={{ background: SQUISHED_GRADIENT }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <div className="flex h-9 w-12 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
              <Image
                src={CHR_LOGO}
                alt="ComplianceHR Infinity"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex h-9 w-12 items-center justify-center overflow-hidden rounded-lg bg-white p-0.5 shadow">
              <Image
                src={CHOICES_NQ_LOGO}
                alt="Choices NQ"
                fittingType="fit"
                className="h-full w-full object-contain"
              />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                Full Platform Review · Every Must-Have Function, Resource &amp; Feature
              </span>
              <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[8px] font-black text-blue-950">
                INCLUDES $355 MASTER AUDIT DOC
              </span>
            </div>
            <p className="text-[9px] font-bold text-amber-100">
              Now possible with ComplianceHR Infinity &amp; Choices NQ — 45 Modules · 17 Audit Categories · 356 Checkpoints · 100+ Functions · 65+ Workflows
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <a
            href="#audit-master-doc"
            className="rounded-full bg-amber-300 px-2.5 py-1 text-[8.5px] font-black text-blue-950 shadow-sm hover:bg-amber-200"
          >
            View $355 Audit Doc
          </a>
          <Link
            to="/register"
            className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[8.5px] font-black text-blue-950 shadow-sm hover:bg-blue-50"
          >
            Subscribe Now <ArrowRight className="h-2.5 w-2.5 text-pink-600" />
          </Link>
        </div>
      </div>

      {/* Executive KPI Counter Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1">
        {[
          { val: '45', label: 'Connected Modules', color: '#4f46e5' },
          { val: '17', label: 'Audit Categories', color: '#db2777' },
          { val: '356', label: 'Audit Checkpoints', color: '#7c3aed' },
          { val: '$355', label: 'Master Doc Included', color: '#ea580c' },
          { val: '100+', label: 'Server Functions', color: '#0ea5e9' },
          { val: '65+', label: 'Live Workflows', color: '#0d9488' },
          { val: '115+', label: 'Secured Entities', color: '#16a34a' },
          { val: '+$160/m', label: 'Elite Pack Included', color: '#e11d48' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border bg-white px-2 py-1 text-center shadow-sm"
            style={{
              borderColor: stat.color,
              borderTopWidth: '3px',
              background: `linear-gradient(145deg, ${stat.color}14, #ffffff)`,
            }}
          >
            <div className="font-editorial text-sm sm:text-base font-black" style={{ color: stat.color }}>
              {stat.val}
            </div>
            <div className="text-[7px] font-extrabold uppercase tracking-wider text-blue-950">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* $355 Master Compliance Audit Checklist Spotlight Box with Official Dual Visual */}
      <div
        id="audit-doc-value"
        className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-50/90 via-white to-pink-50/80 p-2 shadow-sm"
      >
        <div className="lg:col-span-4 overflow-hidden rounded-xl border-2 border-purple-400 bg-white p-1 shadow-sm">
          <Image
            src={MASTER_AUDIT_DUAL_IMAGE}
            alt="Choices NQ (CHN-AUD-001) & ComplianceHR Infinity (CHR-AUD-001) Master Compliance Audit Checklists"
            fittingType="fit"
            className="h-36 sm:h-44 w-full object-contain"
          />
        </div>
        <div className="lg:col-span-5 space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-white">
              NEW $355 COMPLIANCE MASTER DOCUMENT
            </span>
            <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[7.5px] font-black uppercase tracking-wider text-white">
              INCLUDED FREE IN SMART ENHANCED PLANS
            </span>
          </div>
          <h3 className="text-xs sm:text-sm font-black text-blue-950">
            Master Compliance Audit Checklist (`CHN-AUD-001` &amp; `CHR-AUD-001`) — 17 Audit Categories · 356 Checkpoints · 11 Pages
          </h3>
          <p className="text-[8px] font-semibold leading-snug text-blue-950">
            Built from real NDIS registered provider operations (**Choices NQ** &amp; **ComplianceHR Infinity**), this 11-page, 356-checkpoint Master Compliance Audit Checklist covers Governance, Participant Rights, HR Screening, Reportable Incidents, Complaints, WHS Risk, Emergency Management, Care Planning, Quality Assurance, Privacy &amp; NDIS Financial Claims. Purchase standalone for **$355**, or get it **100% included** inside your Smart Enhanced All-In-One ComplianceHR Infinity subscription ($660–$1,035/mo, which includes the $160/mo Elite Plan)!
          </p>
        </div>



        <div className="lg:col-span-3 flex flex-col gap-1 rounded-xl border-2 border-purple-500 bg-white p-2 text-center shadow-sm">
          <div className="text-[7.5px] font-black uppercase tracking-wider text-purple-800">
            Standalone Document Pack
          </div>
          <div className="flex items-baseline justify-center gap-1">
            <span className="font-editorial text-xl font-black text-blue-950">$355</span>
            <span className="text-[7.5px] font-bold text-purple-700">one-off pack</span>
          </div>
          <div className="rounded-md bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 text-[7.5px] font-black text-emerald-900">
            OR $0 (Included Free) with Monthly Subscription
          </div>
          <div className="grid grid-cols-2 gap-1 pt-0.5">
            <a
              href="#audit-master-doc"
              className="rounded-lg border border-purple-400 bg-purple-50 px-2 py-1 text-[7.5px] font-black text-purple-950 hover:bg-purple-100"
            >
              Preview 11 Pages
            </a>
            <Link
              to="/register"
              className="rounded-lg px-2 py-1 text-[7.5px] font-black text-white shadow-sm"
              style={{ background: SQUISHED_GRADIENT }}
            >
              Get Free in Plan
            </Link>
          </div>
        </div>
      </div>

      {/* Filter Bar for the 8 Must-Have Pillars */}
      <div className="flex flex-wrap items-center justify-between gap-1 rounded-lg border border-purple-200 bg-purple-50/50 px-2 py-1">
        <span className="text-[8px] font-black uppercase tracking-wider text-blue-950">
          Explore the 8 Must-Have Capability Pillars:
        </span>
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => setSelectedPillar('all')}
            className={`rounded-full px-2 py-0.5 text-[7.5px] font-extrabold transition-all ${
              selectedPillar === 'all'
                ? 'bg-blue-950 text-white shadow-sm'
                : 'bg-white text-blue-950 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            Show All 8 Pillars
          </button>
          {MUST_HAVE_PILLARS.map((p, idx) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setSelectedPillar(p.id)}
              className="rounded-full px-2 py-0.5 text-[7.5px] font-extrabold transition-all"
              style={
                selectedPillar === p.id
                  ? { background: p.color, color: '#ffffff' }
                  : { background: '#ffffff', color: p.color, border: `1px solid ${p.color}55` }
              }
            >
              Pillar {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* 8 Must-Have Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1.5">
        {visiblePillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.id}
              className="flex flex-col justify-between rounded-xl border-2 bg-white p-2 shadow-sm"
              style={{
                borderColor: pillar.color,
                borderTopWidth: '4px',
                background: `linear-gradient(155deg, ${pillar.color}12 0%, #ffffff 82%)`,
              }}
            >
              <div>
                <div className="flex items-center justify-between gap-1">
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[7px] font-black uppercase tracking-wider text-white"
                    style={{ background: pillar.color }}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {pillar.badge}
                  </span>
                </div>
                <h4 className="mt-1 text-[10px] font-black leading-snug text-blue-950">
                  {pillar.title}
                </h4>
                <p className="text-[7.5px] font-extrabold text-purple-800">{pillar.subtitle}</p>

                <ul className="mt-1.5 space-y-1">
                  {pillar.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1 text-[7.5px] font-bold leading-tight text-blue-950"
                    >
                      <CheckCircle2
                        className="mt-0.5 h-3 w-3 shrink-0"
                        style={{ color: pillar.color }}
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-2 pt-1 border-t border-purple-100 flex items-center justify-between">
                <span className="text-[7px] font-extrabold text-purple-800">
                  Included in Monthly Plan
                </span>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[7px] font-black text-white"
                  style={{ background: pillar.color }}
                >
                  Activate <ArrowRight className="h-2 w-2" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete 45-Module Directory Matrix — Instant Visual Proof */}
      <div className="rounded-xl border border-purple-300 bg-purple-50/30 p-2 space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-1">
          <span className="text-[8.5px] font-black uppercase tracking-wider text-blue-950">
            All {MODULE_DIRECTORY.length} Live Modules Included in Your ComplianceHR Infinity Ecosystem
          </span>
          <span className="text-[7.5px] font-bold text-purple-800">
            Click any module to launch directly
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1">
          {MODULE_DIRECTORY.map((mod, idx) => {
            const c = moduleKeyColour(mod.key);
            const Icon = mod.icon;
            return (
              <Link
                key={mod.key}
                to={mod.path}
                className="flex items-center gap-1 rounded border bg-white px-1.5 py-0.5 text-[7px] font-extrabold text-blue-950 shadow-sm hover:-translate-y-0.5 transition-transform"
                style={{ borderColor: c, borderLeftWidth: '3px' }}
              >
                <span
                  className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded text-white"
                  style={{ background: c }}
                >
                  {Icon ? <Icon className="h-2 w-2" /> : idx + 1}
                </span>
                <span className="truncate">{mod.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}