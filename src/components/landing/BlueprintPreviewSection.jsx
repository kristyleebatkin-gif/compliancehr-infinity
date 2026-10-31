import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  LayoutDashboard,
  ShieldCheck,
  Workflow,
  Layers,
  Search,
  Users,
  Calendar,
  AlertTriangle,
  GraduationCap,
  Briefcase,
  DollarSign,
} from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';

const ECOSYSTEM_NODES = [
  {
    id: 'participants',
    title: 'Participants',
    sub: 'Intake · Consents · Plans',
    icon: Users,
    route: '/our-participants',
  },
  {
    id: 'rostering',
    title: 'Smart Rostering',
    sub: 'Screening Gate · Shifts',
    icon: Calendar,
    route: '/roster',
  },
  {
    id: 'compliance',
    title: 'NDIS Compliance',
    sub: '356 Checks · 17 Areas',
    icon: ShieldCheck,
    route: '/compliance',
  },
  {
    id: 'incidents',
    title: 'Incidents & Risk',
    sub: '24h/5d SLA · ISO 31000',
    icon: AlertTriangle,
    route: '/incidents',
  },
  {
    id: 'training',
    title: 'Training & LMS',
    sub: 'AI Courses · Certs',
    icon: GraduationCap,
    route: '/training',
  },
  {
    id: 'hr',
    title: 'HR & 100-Pt Files',
    sub: 'Contracts · Screening',
    icon: Briefcase,
    route: '/hr',
  },
  {
    id: 'invoicing',
    title: 'NDIS Invoicing',
    sub: '3-Way Match · Payroll',
    icon: DollarSign,
    route: '/invoicing',
  },
];

// Canonical module names and concise descriptions across all 46 connected modules
const CONCISE_MODULE_INFO = {
  dashboard: {
    label: 'Dashboard',
    blurb: 'Live executive & role hub with compliance score rings, morning shift brief & instant module launcher.',
  },
  'operations-centre': {
    label: 'Operations Centre',
    blurb: '1-click operational command deck with 12 compliance, roster & risk sweeps and live audit trails.',
  },
  'my-profile': {
    label: 'My Profile',
    blurb: 'Personal staff & participant workspace for shifts, documents, 100-pt credentials & ID name tags.',
  },
  intake: {
    label: 'Intake Centre',
    blurb: 'Participant & employee onboarding with online fillable forms, AI resume extract & 1-click sync.',
  },
  'our-staff': {
    label: 'Employee Profiles',
    blurb: 'Consolidated employee directory tracking 100-pt HR files, NDIS screening, First Aid & appraisals.',
  },
  'our-participants': {
    label: 'Participant Profiles',
    blurb: 'Person-centred profiles with NDIS plan budgets, 3-part consents, support teams & 10-weekly reviews.',
  },
  'visual-boards': {
    label: 'Visual Boards',
    blurb: 'Accessible daily visual routines, communication pads, weather boards, Auslan & translation tools.',
  },
  'key-contacts': {
    label: 'Key Personnel Contacts',
    blurb: 'Register of key management personnel, financial delegations, authority expiry alerts & signatures.',
  },
  'volunteering-placements': {
    label: 'Volunteering & Placements',
    blurb: 'Volunteer & student placement lifecycle covering applications, clearances, induction & buddy shifts.',
  },
  users: {
    label: 'Users & Permissions',
    blurb: 'Role-based access control (RLS) hub with 15 permission levels, portal invites & approval gates.',
  },
  communications: {
    label: 'Communication Centre',
    blurb: '16-tool communication hub uniting shift handover notes, branded emails, inbox & team diary.',
  },
  incidents: {
    label: 'Incident Clinic',
    blurb: 'NDIS reportable incident clinic with 24-hour & 5-day Commission timers, investigations & photos.',
  },
  'incident-analytics': {
    label: 'Incident Analytics',
    blurb: 'Real-time incident trend intelligence with severity breakdowns, heatmaps & preventative CAPA.',
  },
  risks: {
    label: 'Risk Reporting',
    blurb: 'Enterprise, clinical & home risk matrix applying ISO 31000 controls, Take-5 checks & 6-mo reviews.',
  },
  rostering: {
    label: 'Rostering',
    blurb: 'Smart NDIS shift rostering with automated screening & fatigue gates, heatmaps & calendar sync.',
  },
  goals: {
    label: 'Goals',
    blurb: 'Participant & staff goal tracking with 0–100% sliders, linked shift notes & AI Goal Coach.',
  },
  tasks: {
    label: 'Tasks',
    blurb: 'Shared To-Do command board with priority lanes, supervisor sign-off & 30-task PDF batches.',
  },
  'emergency-response': {
    label: 'Emergency Response',
    blurb: '24/7 readiness suite covering PEEPs, 6-monthly fire drills, safety kit logs & quick-dial.',
  },
  compliance: {
    label: 'Compliance Centre',
    blurb: 'Master compliance hub housing the 17-category / 356-checkpoint audit checklist & board packs.',
  },
  'auditor-portal': {
    label: 'Auditor Portal',
    blurb: 'Read-only external NDIS auditor portal enforcing audit consent flags & Practice Standard evidence.',
  },
  documents: {
    label: 'Document Vault',
    blurb: 'Encrypted document vault with version control, staff read-receipts & 90/60/30-day renewal calendars.',
  },
  'company-safe': {
    label: 'Company Safe',
    blurb: 'Corporate vault storing business credentials, NDIS registration, insurance policies & leases.',
  },
  'universal-storage': {
    label: 'Universal Storage & Export Hub',
    blurb: 'Automatic 6-destination storage, 11-attribute search, 9-way record linking, retention & 4-format exports.',
  },
  training: {
    label: 'Training Centre',
    blurb: 'Interactive LMS academy with AI course authoring, competency quiz drills & skills-gap analytics.',
  },
  certificates: {
    label: 'Certificates',
    blurb: 'Accreditation studio generating signed PDF certificates, expiry horizons & staff milestones.',
  },
  quality: {
    label: 'Quality & Improvement',
    blurb: 'Continuous Improvement Register (CIR) linking audits, incidents & feedback to closure evidence.',
  },
  feedback: {
    label: 'Feedback & Surveys',
    blurb: 'Complaints, compliments & survey hub with 24h acknowledgement SLAs & public submission portals.',
  },
  meetings: {
    label: 'Meetings',
    blurb: 'Governance & team meeting suite with Smart-Fill agendas, minutes, quorum & action tracking.',
  },
  invoicing: {
    label: 'Invoicing Centre',
    blurb: 'NDIS Price Guide invoicing & payroll engine converting shifts into claims, pay runs & bank match.',
  },
  quotes: {
    label: 'Quote Centre',
    blurb: 'Branded NDIS Schedule of Supports quote builder with itemised calculators & 1-click invoicing.',
  },
  receipts: {
    label: 'Receipt Hub',
    blurb: 'AI expense receipt scanner extracting merchant, GST & NDIS categories with PDF bundling.',
  },
  procurement: {
    label: 'Procurement',
    blurb: 'Approved supplier & purchase order hub enforcing ABN checks & 3-way PO/receipt/invoice matching.',
  },
  assets: {
    label: 'Asset Management',
    blurb: 'Fleet, plant & assistive technology register tracking maintenance, vehicle checks & disposals.',
  },
  analytics: {
    label: 'Business Analytics',
    blurb: 'Executive intelligence suite aggregating cross-module KPIs, compliance trajectories & exports.',
  },
  'human-resources': {
    label: 'HR Hub',
    blurb: 'Complete HR studio for employment contracts, position descriptions, leave, appraisals & files.',
  },
  crm: {
    label: 'CRM & Leads',
    blurb: 'Provider growth & referrer pipeline managing enquiries, support coordinators & intake conversion.',
  },
  projects: {
    label: 'Projects Hub',
    blurb: 'Strategic business project & governance tracker with milestone boards, budgets & owner logs.',
  },
  'ndis-provider': {
    label: 'NDIS Provider Portal',
    blurb: 'NDIS registration group & governance portal tracking Practice Standards, deadlines & KPIs.',
  },
  'ndis-news': {
    label: 'NDIS Updates & News',
    blurb: 'Live NDIS Commission news feed, Price Guide release tracker & regulatory impact briefings.',
  },
  'equipment-manuals': {
    label: 'Equipment Manuals & MSDS',
    blurb: 'Safe operating manuals for hoists & assistive tech alongside a Hazardous Chemical MSDS register.',
  },
  'community-council': {
    label: 'Community Council Hub',
    blurb: 'Local council accessibility lookup, inclusive community directory & outing safety planning.',
  },
  'community-referral': {
    label: 'Referrals',
    blurb: 'Postcode-matched allied health, advocacy & crisis directory with 1-click warm referral letters.',
  },
  programs: {
    label: 'Programs & Events',
    blurb: 'Group programs & accessible events calendar with flyer generation, ratios & RSVP invitations.',
  },
  'suggestions-hub': {
    label: 'Suggestions Hub',
    blurb: 'Whole-of-platform AI auditor scanning all 46 screens for overdue items & 1-click improvements.',
  },
  help: {
    label: 'Help Centre',
    blurb: '24/7 technical support & AI system troubleshooter with live diagnostics & help-desk tickets.',
  },
  'user-guides': {
    label: 'User Guides',
    blurb: 'Step-by-step interactive manuals and downloadable A4 SOP guides for every module and role.',
  },
  assistant: {
    label: 'AI Assistant',
    blurb: 'In-app AI compliance, rostering & documentation copilot answering NDIS policy questions live.',
  },
};

const byKey = Object.fromEntries(MODULE_DIRECTORY.map((m) => [m.key, m]));
const pick = (...keys) =>
  keys
    .map((k) => byKey[k])
    .filter(Boolean)
    .map((m) => ({
      label: CONCISE_MODULE_INFO[m.key]?.label || m.label,
      blurb: CONCISE_MODULE_INFO[m.key]?.blurb || m.blurb,
      key: m.key,
      path: m.key === 'dashboard' ? '/dashboard' : m.path,
      icon: m.icon,
    }));

const APP_MODULE_GROUPS = [
  {
    title: 'People, Intake & Profiles',
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
    modules: pick(
      'compliance',
      'auditor-portal',
      'documents',
      'company-safe',
      'universal-storage',
      'training',
      'certificates',
      'quality',
      'feedback',
      'meetings'
    ),
  },
  {
    title: 'Business, Finance & Growth',
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
    steps: ['Document Vault', 'Company Safe', '90/60/30d Expiry Radar', 'Compliance Centre', 'NDIS Provider Portal'],
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
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10 space-y-7">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-5 text-left">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-indigo-600">
              <Layers className="h-3.5 w-3.5 text-indigo-600" />
              Software Ecosystem Architecture Map
            </span>
            <h2 className="mt-2.5 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Explore All Connected Modules
            </h2>
            <p className="mt-1 text-sm sm:text-base font-medium text-slate-600">
              See how information flows seamlessly throughout your entire organisation.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 text-xs font-semibold shrink-0">
            <span className="whitespace-nowrap rounded-xl bg-indigo-50 px-3 py-1.5 text-indigo-700">
              46 Connected Modules
            </span>
            <span className="whitespace-nowrap rounded-xl bg-slate-100 px-3 py-1.5 text-slate-700">
              15 Role Permission Tiers
            </span>
            <span className="whitespace-nowrap rounded-xl bg-indigo-50 px-3 py-1.5 text-indigo-700">
              5 Architectural Pillars
            </span>
          </div>
        </div>

        {/* Connected 7-Core Hub Architecture Visualisation */}
        <div
          className="rounded-2xl p-5 sm:p-6 text-white shadow-sm"
          style={{
            background: 'linear-gradient(135deg, #0F172A 0%, #1E1B4B 50%, #312E81 100%)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-white/15">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
              <Workflow className="h-4 w-4 text-indigo-300" />
              <span>Live Connected Workflow Bus — Enter Once, Sync Across All Modules</span>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-0.5 text-[11px] font-semibold text-indigo-200 whitespace-nowrap">
              REAL-TIME DATA PIPELINES
            </span>
          </div>

          <div className="relative mt-4">
            <div className="relative z-10 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 items-stretch">
              {ECOSYSTEM_NODES.map((node, idx) => {
                const Icon = node.icon;
                return (
                  <Link
                    key={node.id}
                    to={node.route}
                    className="flex h-full w-full flex-col justify-between rounded-xl border border-white/15 bg-white/10 p-3 text-left backdrop-blur-md transition hover:-translate-y-0.5 hover:bg-white/15"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-xs">
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-indigo-200">
                        0{idx + 1}
                      </span>
                    </div>
                    <div className="mt-2 text-xs font-bold text-white leading-snug">
                      {node.title}
                    </div>
                    <div className="mt-0.5 text-[10px] font-medium text-slate-300 leading-tight">
                      {node.sub}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2.5 md:grid-cols-2">
            {DATA_FLOWS.map((flow) => (
              <div
                key={flow.label}
                className="rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-left"
              >
                <div className="text-[10.5px] font-bold uppercase tracking-wider text-indigo-300">
                  {flow.label}
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-1">
                  {flow.steps.map((step, sIdx) => (
                    <React.Fragment key={step}>
                      <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10.5px] font-medium text-white whitespace-nowrap">
                        {step}
                      </span>
                      {sIdx < flow.steps.length - 1 && (
                        <ArrowRight className="h-3 w-3 shrink-0 text-indigo-300" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveGroup('ALL')}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                activeGroup === 'ALL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              All Modules
            </button>
            {APP_MODULE_GROUPS.map((g) => (
              <button
                key={g.title}
                type="button"
                onClick={() => setActiveGroup(g.title)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                  activeGroup === g.title
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {g.title} ({g.modules.length})
              </button>
            ))}
          </div>

          <div className="relative min-w-[210px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter modules..."
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Grouped Module Directory Grid */}
        <div className="space-y-6">
          {filteredGroups.map((group) => (
            <div key={group.title} className="space-y-3 text-left">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                    {group.title}
                  </h3>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 whitespace-nowrap">
                  {group.modules.length} Connected Modules
                </span>
              </div>

              <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-stretch">
                {group.modules.map((mod) => {
                  const Icon = mod.icon || ShieldCheck;
                  return (
                    <Link
                      key={mod.key}
                      to={mod.path}
                      title={`${mod.label} — ${mod.blurb}`}
                      className="group flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-3.5 text-left shadow-2xs transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span className="text-xs font-bold leading-snug text-slate-900 group-hover:text-indigo-600">
                            {mod.label}
                          </span>
                        </div>
                        <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-600">
                          {mod.blurb}
                        </p>
                      </div>
                      <div className="mt-3 flex items-center justify-end text-[11px] font-semibold text-indigo-600">
                        <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}