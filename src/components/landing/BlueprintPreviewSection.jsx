import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Workflow,
  Lock,
  Layers,
  Search,
  ArrowUpRight,
} from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 28%, #5A00D6 62%, #FF2E9A 100%)';

const EXPANDED_MODULE_DESCRIPTIONS = {
  dashboard:
    'Unified executive & role command hub featuring live compliance score rings, morning shift brief & instant module launcher.',
  'operations-centre':
    'One-click operational command deck with 12 armed compliance, roster & risk sweeps, live execution audit trails and benchmark suites.',
  'my-profile':
    'Personal staff & participant workspace uniting my shifts, my documents, 100-point credential status, personal tasks & printable ID name tags.',
  intake:
    'End-to-end participant & employee onboarding pipeline with online fillable forms, AI resume extraction & 1-click conversion into live profiles.',
  'our-staff':
    'Consolidated employee directory tracking 100-point HR files, NDIS worker screening, Blue Cards, First Aid, contracts & 360° appraisals.',
  'our-participants':
    'Person-centred participant profiles with NDIS plan budgets, locked 3-part consents, support teams, risk assessments & 10-weekly reviews.',
  'visual-boards':
    'Accessible daily visual routines, communication pads, weather boards, Auslan sign prompts & multilingual translation tools.',
  'key-contacts':
    'Centralised register of key management personnel, financial & clinical delegations, authority expiry alerts & email signatures.',
  'volunteering-placements':
    'Complete volunteer & student placement lifecycle covering applications, screening clearances, induction training & supervised buddy shifts.',
  users:
    'Granular role-based access control (RLS) hub with 15 permission levels, 1-click portal invitations, pending approval gates & user audit logs.',
  communications:
    '16-modular communication command centre uniting shift handover notes, branded emails, inbox, broadcasts & team diary.',
  incidents:
    'NDIS reportable incident clinic with statutory 24-hour & 5-day Commission countdown timers, root-cause investigations & photo evidence.',
  'incident-analytics':
    'Real-time incident trend intelligence displaying severity breakdowns, time-of-day heatmaps, category charts & preventative CAPA actions.',
  risks:
    'Enterprise, clinical & home risk matrix applying the ISO 31000 Hierarchy of Controls, pre-shift Take-5 checks & 6-monthly review schedules.',
  rostering:
    'Smart NDIS shift rostering with automated worker screening & fatigue gatekeepers, coverage heatmaps, labour forecasts & calendar sync.',
  goals:
    'Interactive participant & staff goal tracking with 0–100% progress sliders, linked shift notes, NDIS funding outcome charts & AI Goal Coach.',
  tasks:
    'Shared To-Do command board featuring priority Kanban lanes, digital supervisor sign-off, team leaderboards & 30-task PDF batches.',
  'emergency-response':
    '24/7 emergency readiness suite covering Personal Emergency Evacuation Plans (PEEPs), 6-monthly fire drills, safety kit logs & quick-dial.',
  compliance:
    'Master compliance & report centre housing the 17-category / 356-checkpoint audit checklist, 8 NDIS Practice Standards map & 1-click board packs.',
  'auditor-portal':
    'Dedicated read-only external NDIS auditor portal enforcing participant & staff audit consent flags with pre-mapped Practice Standard evidence.',
  documents:
    'Smart document vault with private encrypted storage, version control, staff read-receipt acknowledgements & 90/60/30-day renewal calendars.',
  'company-safe':
    'High-security corporate vault storing business identity credentials, NDIS registration certificates, insurance policies, leases & badge studio.',
  training:
    'Interactive LMS training academy with AI course authoring, competency quiz drills, learner streaks & department skills-gap analytics.',
  certificates:
    'Official accreditation & recognition studio generating signed PDF certificates, tracking credential expiry horizons & celebrating milestones.',
  quality:
    'Continuous Improvement Register (CIR) automatically linking audit findings, incidents & feedback to assigned owners and closure evidence.',
  feedback:
    'Complaints, compliments & survey hub with 24-hour acknowledgement SLAs, procedural fairness workflows & public submission portals.',
  meetings:
    'Governance & team meeting suite with 2026 Smart-Fill agenda & minutes templates, quorum tracking, action item extraction & calendar views.',
  invoicing:
    'NDIS Price Guide invoicing & payroll engine converting completed shifts into compliant claim lines, pay runs, payslips & bank matches.',
  quotes:
    'Branded NDIS Schedule of Supports quote builder with itemised support calculators, live A4 PDF previews & 1-click invoice conversion.',
  receipts:
    'AI-powered expense receipt scanner extracting merchant, amount, GST & NDIS support categories with instant reimbursement & PDF bundling.',
  procurement:
    'Approved supplier & purchase order hub enforcing ABN/insurance checks and automated 3-way matching across POs, receipts & invoices.',
  assets:
    'Fleet, plant & assistive technology register tracking scheduled maintenance, vehicle safety inspections, compliance reviews & disposals.',
  analytics:
    'Executive business intelligence suite aggregating cross-module KPIs, compliance trajectories, revenue vs labour metrics & board exports.',
  'human-resources':
    'Complete HR paperwork studio for digital employment contracts, position descriptions, leave requests, appraisals & 100-point staff files.',
  crm:
    'Provider growth & referrer relationship pipeline managing enquiries, support coordinator contacts, follow-up tasks & intake conversion.',
  projects:
    'Strategic business project & governance delivery tracker with milestone boards, budget oversight, owner assignments & progress logs.',
  'ndis-provider':
    'NDIS registration group & governance control portal tracking Practice Standard compliance, Commission deadlines & provider KPIs.',
  'ndis-news':
    'Live NDIS Quality & Safeguards Commission news feed, Price Guide release tracker, regulatory impact briefings & policy update alerts.',
  'equipment-manuals':
    'Safe operating procedure library for hoists, assistive technology & plant alongside a live Hazardous Chemical MSDS safety register.',
  'community-council':
    'Local council accessibility lookup, inclusive community program directory & venue safety planning for participant outings.',
  'community-referral':
    'Postcode-matched allied health, advocacy & crisis service directory with 1-click warm referral letters and consent transfers.',
  programs:
    'Group programs & accessible events calendar featuring promotional flyer generation, staffing ratio calculators & RSVP invitations.',
  'suggestions-hub':
    'Whole-of-platform AI module auditor scanning all 46 screens for overdue items, expiring records & 1-click continuous improvements.',
  help:
    '24/7 technical support & AI system troubleshooter with live platform health diagnostics, guided fixes & priority help-desk tickets.',
  'user-guides':
    'Step-by-step interactive user manuals and downloadable A4 Standard Operating Procedure (SOP) guides for every module and role.',
  assistant:
    'In-app AI compliance, rostering & documentation copilot answering NDIS policy questions and drafting compliant records in seconds.',
};

const byKey = Object.fromEntries(MODULE_DIRECTORY.map((m) => [m.key, m]));
const pick = (...keys) =>
  keys
    .map((k) => byKey[k])
    .filter(Boolean)
    .map((m) => ({
      label: m.label,
      blurb: EXPANDED_MODULE_DESCRIPTIONS[m.key] || m.blurb,
      key: m.key,
      path: m.key === 'dashboard' ? '/dashboard' : m.path,
      icon: m.icon,
    }));

const APP_MODULE_GROUPS = [
  {
    title: 'People, Intake & Profiles',
    accent: '#0072FF',
    modules: pick(
      'dashboard',
      'operations-centre',
      'my-profile',
      'intake',
      'our-staff',
      'our-participants',
      'visual-boards',
      'key-contacts',
      'volunteering-placements',
      'users'
    ),
  },
  {
    title: 'Service Delivery & Workforce',
    accent: '#5A00D6',
    modules: pick(
      'communications',
      'incidents',
      'incident-analytics',
      'risks',
      'rostering',
      'goals',
      'tasks',
      'emergency-response'
    ),
  },
  {
    title: 'Compliance, Safety & Evidence',
    accent: '#FF2E9A',
    modules: pick(
      'compliance',
      'auditor-portal',
      'documents',
      'company-safe',
      'training',
      'certificates',
      'quality',
      'feedback',
      'meetings'
    ),
  },
  {
    title: 'Business, Finance & Growth',
    accent: '#0A2B6D',
    modules: pick(
      'invoicing',
      'quotes',
      'receipts',
      'procurement',
      'assets',
      'analytics',
      'human-resources',
      'crm',
      'projects'
    ),
  },
  {
    title: 'Information, Providers & Access',
    accent: '#0072FF',
    modules: pick(
      'ndis-provider',
      'ndis-news',
      'equipment-manuals',
      'community-council',
      'community-referral',
      'programs',
      'suggestions-hub',
      'help',
      'user-guides',
      'assistant'
    ),
  },
];

const DATA_FLOWS = [
  {
    label: 'Flow 01 · Intake to Invoicing Pipeline',
    steps: ['Intake Centre', 'Staff & Participant Profiles', 'Rostering', 'Communication Centre', 'Invoicing Centre'],
  },
  {
    label: 'Flow 02 · Vault to NDIS Commission Pipeline',
    steps: ['Document Vault & Forms', 'Company Safe', 'Details Checks & Reminders', 'Compliance Centre', 'NDIS Provider Portal'],
  },
  {
    label: 'Flow 03 · Safety to Continuous Improvement Pipeline',
    steps: ['Incident & Risk Reporting', 'Safety Insights & Controls', 'Quality & Improvement', 'Registers & Reports', 'Continuous Improvement'],
  },
  {
    label: 'Flow 04 · Goals to Business Growth Pipeline',
    steps: ['Tasks & Goal Progress', 'Feedback & Surveys', 'Business Analytics', 'Projects Hub', 'CRM & Growth'],
  },
  {
    label: 'Flow 05 · HR Onboarding to Audit Readiness Pipeline',
    steps: ['Employee Intake', 'HR Hub & Contracts', 'Training & Certificates', 'My Payroll & Payslips', 'External Auditor Portal'],
  },
];

const ACCESS_LEVELS = [
  {
    tier: 'TIER 01 · EXECUTIVE GOVERNANCE',
    title: 'Provider Admin, Compliance Admin & Management',
    scopeBadge: 'FULL ACCESS · All 46 Connected Modules',
    desc: 'Unrestricted access across all 46 modules, Company Safe, Users & Permissions, Invoicing, Quotes, Procurement, My Payroll & Business Analytics.',
  },
  {
    tier: 'TIER 02 · DAILY OPERATIONS',
    title: 'Administration & Team Leaders',
    scopeBadge: 'OPERATIONS · 40 Operational Modules',
    desc: 'Operational access to Staff & Participant Profiles, Compliance Hub, Quality, Meetings, Assets, Volunteers, CRM, Projects & Checklists.',
  },
  {
    tier: 'TIER 03 · FRONTLINE WORKFORCE',
    title: 'Employees, Support Workers & Specialist Officers',
    scopeBadge: 'WORKFORCE · 31 Frontline Modules',
    desc: 'Standardised Employee access to My Profile, Employee Directory, Roster & Shifts, Communications, Incidents, Risks, Training, Documents, Receipts & Tasks.',
  },
  {
    tier: 'TIER 04 · PARTICIPANT PORTAL',
    title: 'Participants & Nominees',
    scopeBadge: 'PARTICIPANT · 22 Personal & Support Modules',
    desc: 'Personal access to My Profile, Participant Profiles, Goal Progress, Visual Boards, Roster & Shifts, Programs & Events, Feedback, Community Hub & NDIS News.',
  },
  {
    tier: 'TIER 05 · EXTERNAL VERIFICATION',
    title: 'External NDIS Auditors & Guests',
    scopeBadge: 'AUDITOR & GUEST · Consent-Gated Access',
    desc: 'Auditors have dedicated, consent-verified read-only access in the External Auditor Portal, while Guests explore public tools and request role approval.',
  },
];

export default function BlueprintPreviewSection() {
  const [activeGroup, setActiveGroup] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFlows, setShowFlows] = useState(true);

  const filteredGroups = APP_MODULE_GROUPS.map((g) => ({
    ...g,
    modules: g.modules.filter((m) => {
      if (activeGroup !== 'ALL' && g.title !== activeGroup) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        m.label.toLowerCase().includes(q) ||
        m.blurb.toLowerCase().includes(q)
      );
    }),
  })).filter((g) => g.modules.length > 0);

  return (
    <section id="blueprint" className="w-full scroll-mt-20 py-6">
      <div
        className="rounded-3xl p-[3px] shadow-xl"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="rounded-[21px] bg-white p-6 sm:p-10 space-y-8">
          {/* Header */}
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-[#0072FF]/10 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
              <Layers className="h-3.5 w-3.5 text-[#5A00D6]" />
              ComplianceHR Infinity Blueprint Explorer
            </span>
            <h2 className="mt-3 font-editorial text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#0A2B6D]">
              Explore All 46 Modules
            </h2>
            <p className="mt-3 text-base sm:text-lg text-[#0A2B6D]/75">
              See how information flows throughout your entire organisation.
            </p>
          </div>

          {/* Information Flows & Role-Based Access Architecture */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-left">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Workflow className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-[#0A2B6D]">
                    Automated Cross-Module Pipelines &amp; Role-Based Security
                  </h3>
                  <p className="text-xs font-medium text-[#0A2B6D]/70">
                    5 end-to-end data pipelines paired with 5 strict NDIS role permission tiers
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowFlows((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-slate-100"
              >
                <span>{showFlows ? 'Hide Architecture Map' : 'Show Architecture Map'}</span>
                {showFlows ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            {showFlows && (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* 5 Information Flow Pipelines */}
                <div className="space-y-3 text-left">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#0072FF]">
                    How Information Connects Automatically (5 Pipelines)
                  </div>
                  {DATA_FLOWS.map((flow, fIdx) => (
                    <div
                      key={flow.label}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                    >
                      <div className="text-xs font-extrabold text-[#0A2B6D]">
                        {flow.label}
                      </div>
                      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                        {flow.steps.map((step, sIdx) => (
                          <React.Fragment key={step}>
                            <span
                              className="rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
                              style={{
                                backgroundColor:
                                  (fIdx + sIdx) % 3 === 0
                                    ? '#0072FF'
                                    : (fIdx + sIdx) % 3 === 1
                                      ? '#5A00D6'
                                      : '#0A2B6D',
                              }}
                            >
                              {step}
                            </span>
                            {sIdx < flow.steps.length - 1 && (
                              <ArrowRight className="h-3.5 w-3.5 text-[#FF2E9A]" />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* 5 Enterprise Role-Based Access Levels */}
                <div className="space-y-3 text-left">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
                    Role-Based Access Control (5 Permission Tiers)
                  </div>
                  {ACCESS_LEVELS.map((lvl) => (
                    <div
                      key={lvl.title}
                      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#0A2B6D]">
                          <Lock className="h-3.5 w-3.5 text-[#5A00D6]" />
                          {lvl.title}
                        </span>
                        <span className="rounded-full bg-[#5A00D6]/10 px-2.5 py-0.5 text-[10px] font-extrabold text-[#5A00D6]">
                          {lvl.scopeBadge}
                        </span>
                      </div>
                      <p className="mt-1.5 text-xs leading-relaxed text-[#0A2B6D]/75">
                        {lvl.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Filter & Search Bar for All 46 Modules */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveGroup('ALL')}
                className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                  activeGroup === 'ALL'
                    ? 'bg-[#0A2B6D] text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-[#0A2B6D] hover:bg-slate-50'
                }`}
              >
                All 46 Modules
              </button>
              {APP_MODULE_GROUPS.map((g) => (
                <button
                  key={g.title}
                  type="button"
                  onClick={() => setActiveGroup(g.title)}
                  className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                    activeGroup === g.title
                      ? 'bg-[#0072FF] text-white shadow-xs'
                      : 'border border-slate-200 bg-white text-[#0A2B6D] hover:bg-slate-50'
                  }`}
                >
                  {g.title} ({g.modules.length})
                </button>
              ))}
            </div>

            <div className="relative min-w-[240px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A2B6D]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 46 modules..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-semibold text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
              />
            </div>
          </div>

          {/* Grouped 46-Module Directory Grid */}
          <div className="space-y-8">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-4 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-5 w-5" style={{ color: group.accent }} />
                    <h3 className="font-editorial text-xl font-extrabold text-[#0A2B6D]">
                      {group.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-[#0A2B6D]">
                    {group.modules.length} Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                  {group.modules.map((mod) => {
                    const Icon = mod.icon || ShieldCheck;
                    return (
                      <Link
                        key={mod.key}
                        to={mod.path}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-4 text-left shadow-2xs transition-all hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white"
                              style={{ background: BRAND_GRADIENT }}
                            >
                              <Icon className="h-4 w-4 text-white" />
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-slate-400 transition group-hover:text-[#0072FF]" />
                          </div>
                          <h4 className="mt-3 text-sm font-extrabold text-[#0A2B6D] group-hover:text-[#0072FF]">
                            {mod.label}
                          </h4>
                          <p className="mt-1.5 text-xs leading-relaxed text-[#0A2B6D]/75 line-clamp-3">
                            {mod.blurb}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#0072FF]">
                          <span>Open Module</span>
                          <span>→</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}