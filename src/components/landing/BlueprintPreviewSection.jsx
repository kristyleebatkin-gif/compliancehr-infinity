import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Workflow,
  Lock,
  Layers,
  Search,
  ArrowUpRight,
  Users,
  Calendar,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0A2B6D 0%, #0072FF 34%, #5A00D6 68%, #FF2E9A 100%)';

const ECOSYSTEM_NODES = [
  {
    id: 'participants',
    title: 'Participant Management',
    sub: 'Intake · Consents · Goals · Plans',
    icon: Users,
    color: '#0072FF',
    route: '/our-participants',
  },
  {
    id: 'rostering',
    title: 'Smart Rostering',
    sub: 'Screening Gate · Shifts · Handover',
    icon: Calendar,
    color: '#5A00D6',
    route: '/roster',
  },
  {
    id: 'compliance',
    title: 'NDIS Compliance',
    sub: '356 Checkpoints · 17 Categories',
    icon: ShieldCheck,
    color: '#FF2E9A',
    route: '/compliance',
  },
  {
    id: 'incidents',
    title: 'Incidents & Risk',
    sub: '24h/5d Timers · ISO 31000 Matrix',
    icon: AlertTriangle,
    color: '#0A2B6D',
    route: '/incidents',
  },
  {
    id: 'training',
    title: 'Training & LMS',
    sub: 'AI Courses · Quizzes · Certificates',
    icon: GraduationCap,
    color: '#0072FF',
    route: '/training',
  },
  {
    id: 'hr',
    title: 'HR & 100-Pt Files',
    sub: 'Contracts · Screening · Appraisals',
    icon: Briefcase,
    color: '#5A00D6',
    route: '/hr',
  },
  {
    id: 'invoicing',
    title: 'NDIS Invoicing',
    sub: '3-Way Claim Match · Payroll · Bank',
    icon: DollarSign,
    color: '#FF2E9A',
    route: '/invoicing',
  },
];

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
    label: 'Pipeline 01 · Intake to Invoicing',
    steps: ['Intake Centre', 'Participant & Staff Profiles', 'Smart Rostering', 'Shift Handover Notes', 'NDIS Invoicing'],
  },
  {
    label: 'Pipeline 02 · Vault to NDIS Commission',
    steps: ['Document Vault', 'Company Safe', '90/60/30d Expiry Radar', 'Compliance Hub', 'NDIS Provider Portal'],
  },
  {
    label: 'Pipeline 03 · Safety to Continuous Improvement',
    steps: ['Incident & Risk Report', '24h/5d Commission Timer', 'ISO 31000 Controls', 'Quality & CIR', 'Board Audit Pack'],
  },
  {
    label: 'Pipeline 04 · HR Onboarding to Auditor Portal',
    steps: ['Employee Intake', '100-Pt HR Dossier', 'LMS Training & Certs', 'SCHADS Payroll', 'External Auditor Portal'],
  },
];

export default function BlueprintPreviewSection() {
  const [activeGroup, setActiveGroup] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

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
    <section id="blueprint" className="w-full scroll-mt-20">
      <div
        className="rounded-3xl p-[3px] shadow-2xl"
        style={{ background: BRAND_GRADIENT }}
      >
        <div className="rounded-[21px] bg-white p-6 sm:p-8 lg:p-10 space-y-8">
          {/* Executive Blueprint Header */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-100 pb-5 text-left">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0A2B6D] px-3.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                <Layers className="h-3.5 w-3.5 text-[#00C6FF]" />
                Software Ecosystem Architecture Map
              </span>
              <h2 className="mt-2.5 font-editorial text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0A2B6D]">
                Explore All 46 Modules
              </h2>
              <p className="mt-1 text-sm sm:text-base font-medium text-[#0A2B6D]/75">
                See how information flows throughout your entire organisation.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
              <span className="rounded-xl bg-[#0072FF]/10 px-3.5 py-2 text-[#0072FF]">
                46 Connected Modules
              </span>
              <span className="rounded-xl bg-[#5A00D6]/10 px-3.5 py-2 text-[#5A00D6]">
                5 Architectural Pillars
              </span>
              <span className="rounded-xl bg-[#FF2E9A]/10 px-3.5 py-2 text-[#FF2E9A]">
                15 Role Permission Tiers
              </span>
            </div>
          </div>

          {/* Connected 7-Core Hub Architecture Visualisation (With Workflow Lines) */}
          <div
            className="rounded-2xl p-5 sm:p-6 text-white shadow-inner"
            style={{
              background: 'linear-gradient(125deg, #0A2B6D 0%, #0072FF 42%, #5A00D6 80%, #FF2E9A 100%)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                <Workflow className="h-4 w-4 text-[#00C6FF]" />
                <span>Live Connected Workflow Bus — Enter Once, Sync Across All 46 Modules</span>
              </div>
              <span className="rounded-full bg-white/15 px-3 py-0.5 text-[11px] font-bold text-white">
                REAL-TIME DATA PIPELINES
              </span>
            </div>

            {/* 7 Connected Core Nodes Linked by Workflow Lines (Uniform Width & Alignment) */}
            <div className="relative mt-5">
              <div
                aria-hidden="true"
                className="pointer-events-none hidden lg:block absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-[#00C6FF] via-white/60 to-[#FF6EDB]"
              />
              <div className="relative z-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 items-stretch">
                {ECOSYSTEM_NODES.map((node, idx) => {
                  const Icon = node.icon;
                  return (
                    <Link
                      key={node.id}
                      to={node.route}
                      className="flex h-full w-full flex-col justify-between rounded-xl border border-white/30 bg-[#0A2B6D]/80 p-3.5 text-left backdrop-blur-md shadow-md transition hover:-translate-y-0.5 hover:bg-[#0A2B6D]"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-[#0A2B6D] shadow-xs">
                          <Icon className="h-4 w-4" style={{ color: node.color }} />
                        </span>
                        <span className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-extrabold text-[#00C6FF]">
                          0{idx + 1}
                        </span>
                      </div>
                      <div className="mt-2.5 text-xs font-extrabold text-white leading-snug">
                        {node.title}
                      </div>
                      <div className="mt-1 text-[10px] font-medium text-white/80 leading-tight">
                        {node.sub}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 4 Cross-Module Pipeline Strips */}
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              {DATA_FLOWS.map((flow) => (
                <div
                  key={flow.label}
                  className="rounded-xl border border-white/20 bg-[#0A2B6D]/55 px-4 py-3 text-left backdrop-blur-xs"
                >
                  <div className="text-[11px] font-extrabold uppercase tracking-wider text-[#00C6FF]">
                    {flow.label}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    {flow.steps.map((step, sIdx) => (
                      <React.Fragment key={step}>
                        <span className="rounded-md bg-white/15 px-2 py-0.5 text-[11px] font-bold text-white">
                          {step}
                        </span>
                        {sIdx < flow.steps.length - 1 && (
                          <ArrowRight className="h-3 w-3 text-[#FF6EDB]" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter & Search Bar for All 46 Modules */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
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

            <div className="relative min-w-[230px]">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A2B6D]/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter 46 modules..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs font-semibold text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
              />
            </div>
          </div>

          {/* Grouped 46-Module Directory Grid */}
          <div className="space-y-7">
            {filteredGroups.map((group) => (
              <div key={group.title} className="space-y-3.5 text-left">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2.5">
                    <LayoutDashboard className="h-5 w-5" style={{ color: group.accent }} />
                    <h3 className="font-editorial text-lg sm:text-xl font-extrabold text-[#0A2B6D]">
                      {group.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-[#0A2B6D]">
                    {group.modules.length} Connected Modules
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                  {group.modules.map((mod) => {
                    const Icon = mod.icon || ShieldCheck;
                    return (
                      <Link
                        key={mod.key}
                        to={mod.path}
                        className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-slate-50/40 p-4 text-left shadow-2xs transition-all hover:-translate-y-0.5 hover:bg-white hover:border-[#0072FF] hover:shadow-md"
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
                          <p className="mt-1 text-xs leading-relaxed text-[#0A2B6D]/75 line-clamp-3">
                            {mod.blurb}
                          </p>
                        </div>
                        <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold text-[#0072FF]">
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