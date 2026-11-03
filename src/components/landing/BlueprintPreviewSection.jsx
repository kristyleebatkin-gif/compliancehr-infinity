import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ArrowUpDown,
  CheckSquare,
  Download,
  Filter,
  Layers,
  LayoutGrid,
  Search,
  ShieldCheck,
  Table2,
  CheckCircle2,
} from 'lucide-react';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import LandingSectionHeader from '@/components/landing/LandingSectionHeader';

const CONCISE_MODULE_INFO = {
  dashboard: {
    label: 'Dashboard',
    pillar: 'Executive & Governance',
    registers: 5,
    checkpoints: 24,
    rlsTier: 'All Approved Roles',
    blurb: 'Live executive & role hub with 5 governance scorecards, attention monitors & module launcher.',
  },
  'operations-centre': {
    label: 'Operations Centre',
    pillar: 'Executive & Governance',
    registers: 12,
    checkpoints: 36,
    rlsTier: 'Management & Admin',
    blurb: '1-click operational command deck with 12 compliance, roster & risk sweeps and live audit trails.',
  },
  'my-profile': {
    label: 'My Profile',
    pillar: 'People & Profiles',
    registers: 4,
    checkpoints: 14,
    rlsTier: 'Self & HR Scoped',
    blurb: 'Personal staff & participant workspace for shifts, documents, 100-pt credentials & ID badges.',
  },
  intake: {
    label: 'Intake Centre',
    pillar: 'People & Profiles',
    registers: 3,
    checkpoints: 18,
    rlsTier: 'Intake & Admin',
    blurb: 'Participant & employee onboarding with online fillable forms, AI resume extract & 1-click sync.',
  },
  'our-staff': {
    label: 'Employee Profiles',
    pillar: 'People & Profiles',
    registers: 6,
    checkpoints: 28,
    rlsTier: 'HR & Admin',
    blurb: 'Consolidated employee directory tracking 100-pt HR files, NDIS screening, First Aid & appraisals.',
  },
  'our-participants': {
    label: 'Participant Profiles',
    pillar: 'People & Profiles',
    registers: 8,
    checkpoints: 42,
    rlsTier: 'Care Team & Admin',
    blurb: 'Person-centred profiles with NDIS plan budgets, 3-part consents, support teams & 10-weekly reviews.',
  },
  'visual-boards': {
    label: 'Visual Boards',
    pillar: 'People & Profiles',
    registers: 2,
    checkpoints: 8,
    rlsTier: 'All Approved Roles',
    blurb: 'Accessible daily visual routines, communication pads, weather boards, Auslan & translation tools.',
  },
  'key-contacts': {
    label: 'Key Personnel Contacts',
    pillar: 'Executive & Governance',
    registers: 2,
    checkpoints: 12,
    rlsTier: 'Compliance & Admin',
    blurb: 'Register of key management personnel, financial delegations, authority expiry alerts & signatures.',
  },
  'volunteering-placements': {
    label: 'Volunteering & Placements',
    pillar: 'People & Profiles',
    registers: 3,
    checkpoints: 10,
    rlsTier: 'HR & Admin',
    blurb: 'Volunteer & student placement lifecycle covering applications, clearances, induction & buddy shifts.',
  },
  users: {
    label: 'Users & Permissions Hub',
    pillar: 'Executive & Governance',
    registers: 2,
    checkpoints: 16,
    rlsTier: 'Provider Admin Only',
    blurb: 'Role-based access control (RLS) hub with 15 permission levels, portal invites & approval gates.',
  },
  communications: {
    label: 'Communication Centre',
    pillar: 'Service Delivery',
    registers: 4,
    checkpoints: 15,
    rlsTier: 'Role-Scoped RLS',
    blurb: '6-stage communication hub uniting shift handover notes, branded emails, inbox & team diary.',
  },
  incidents: {
    label: 'Incident Clinic',
    pillar: 'Compliance & Risk',
    registers: 3,
    checkpoints: 32,
    rlsTier: 'Clinical & Compliance',
    blurb: 'NDIS reportable incident & Aged Care SIRS clinic with 24h & 5d timers, investigations & CAPA.',
  },
  'incident-analytics': {
    label: 'Incident Analytics',
    pillar: 'Compliance & Risk',
    registers: 2,
    checkpoints: 14,
    rlsTier: 'Compliance & Admin',
    blurb: 'Real-time incident trend intelligence with severity breakdowns, heatmaps & preventative CAPA.',
  },
  risks: {
    label: 'Risk Reporting',
    pillar: 'Compliance & Risk',
    registers: 4,
    checkpoints: 26,
    rlsTier: 'Compliance & Admin',
    blurb: 'Enterprise, clinical & home risk matrix applying ISO 31000 controls, Take-5 checks & 6-mo reviews.',
  },
  rostering: {
    label: 'Rostering',
    pillar: 'Service Delivery',
    registers: 3,
    checkpoints: 22,
    rlsTier: 'Rostering & Staff',
    blurb: 'Smart NDIS shift rostering with automated screening & fatigue gates, heatmaps & calendar sync.',
  },
  goals: {
    label: 'Goal Progress',
    pillar: 'Service Delivery',
    registers: 2,
    checkpoints: 16,
    rlsTier: 'Care Team & Admin',
    blurb: 'Participant & staff goal tracking with 0–100% progress sliders, linked shift notes & AI Goal Coach.',
  },
  tasks: {
    label: 'Task Dashboard',
    pillar: 'Service Delivery',
    registers: 2,
    checkpoints: 12,
    rlsTier: 'Assigned & Admin',
    blurb: 'Shared To-Do command board with priority lanes, supervisor sign-off & 30-task PDF batches.',
  },
  'emergency-response': {
    label: 'Emergency Response',
    pillar: 'Compliance & Risk',
    registers: 4,
    checkpoints: 20,
    rlsTier: 'All Approved Roles',
    blurb: '24/7 readiness suite covering PEEPs, 6-monthly fire drills, visitor roll-call & safety kit logs.',
  },
  compliance: {
    label: 'Compliance & Report Centre',
    pillar: 'Compliance & Risk',
    registers: 8,
    checkpoints: 54,
    rlsTier: 'Compliance & Admin',
    blurb: 'Master compliance hub housing the 17-category / 356-checkpoint audit checklist & board packs.',
  },
  'auditor-portal': {
    label: 'Auditor Portal',
    pillar: 'Compliance & Risk',
    registers: 6,
    checkpoints: 40,
    rlsTier: 'Consent-Gated Auditor',
    blurb: 'Read-only external NDIS auditor portal enforcing audit consent flags & Practice Standard evidence.',
  },
  documents: {
    label: 'Document Vault',
    pillar: 'Compliance & Risk',
    registers: 5,
    checkpoints: 30,
    rlsTier: 'Classification RLS',
    blurb: 'Encrypted document vault with version control, staff read-receipts & 90/60/30-day renewal calendars.',
  },
  'company-safe': {
    label: 'Company Safe',
    pillar: 'Executive & Governance',
    registers: 3,
    checkpoints: 18,
    rlsTier: 'Executive Safe RLS',
    blurb: 'Corporate vault storing business credentials, NDIS registration, insurance policies & leases.',
  },
  training: {
    label: 'Training Centre',
    pillar: 'People & Profiles',
    registers: 3,
    checkpoints: 20,
    rlsTier: 'All Approved Roles',
    blurb: 'Interactive LMS academy with AI course authoring, competency quiz drills & skills-gap analytics.',
  },
  certificates: {
    label: 'Recognition & Certificates',
    pillar: 'People & Profiles',
    registers: 2,
    checkpoints: 14,
    rlsTier: 'HR & Compliance',
    blurb: 'Accreditation studio generating signed PDF certificates, expiry horizons & staff milestones.',
  },
  quality: {
    label: 'Quality & Improvement',
    pillar: 'Compliance & Risk',
    registers: 3,
    checkpoints: 24,
    rlsTier: 'Quality & Admin',
    blurb: 'Continuous Improvement Register (CIR) linking audits, incidents & feedback to closure evidence.',
  },
  feedback: {
    label: 'Feedback & Surveys',
    pillar: 'Compliance & Risk',
    registers: 3,
    checkpoints: 18,
    rlsTier: 'Quality & Admin',
    blurb: 'Complaints, compliments & survey hub with 24h acknowledgement SLAs & public submission portals.',
  },
  meetings: {
    label: 'Meeting Centre',
    pillar: 'Executive & Governance',
    registers: 2,
    checkpoints: 10,
    rlsTier: 'Management & Admin',
    blurb: 'Governance & team meeting suite with structured agendas, minutes, quorum & action tracking.',
  },
  invoicing: {
    label: 'Invoicing Centre',
    pillar: 'Finance & Operations',
    registers: 4,
    checkpoints: 22,
    rlsTier: 'Finance & Admin',
    blurb: 'NDIS Price Guide invoicing & payroll engine converting shifts into claims, pay runs & bank match.',
  },
  quotes: {
    label: 'Quote Centre',
    pillar: 'Finance & Operations',
    registers: 2,
    checkpoints: 10,
    rlsTier: 'Finance & Intake',
    blurb: 'Branded NDIS Schedule of Supports quote builder with itemised calculators & 1-click invoicing.',
  },
  receipts: {
    label: 'Receipt Hub',
    pillar: 'Finance & Operations',
    registers: 2,
    checkpoints: 8,
    rlsTier: 'Finance & Admin',
    blurb: 'AI expense receipt scanner extracting merchant, GST & NDIS categories with PDF bundling.',
  },
  procurement: {
    label: 'Procurement',
    pillar: 'Finance & Operations',
    registers: 3,
    checkpoints: 12,
    rlsTier: 'Finance & Admin',
    blurb: 'Approved supplier & purchase order hub enforcing ABN checks & 3-way PO/receipt/invoice matching.',
  },
  assets: {
    label: 'Asset Management',
    pillar: 'Finance & Operations',
    registers: 3,
    checkpoints: 14,
    rlsTier: 'Operations & Admin',
    blurb: 'Fleet, plant & assistive technology register tracking maintenance, vehicle checks & disposals.',
  },
  analytics: {
    label: 'Business Analytics',
    pillar: 'Executive & Governance',
    registers: 4,
    checkpoints: 16,
    rlsTier: 'Executive & Admin',
    blurb: 'Executive intelligence suite aggregating cross-module KPIs, compliance trajectories & exports.',
  },
  'human-resources': {
    label: 'HR Hub & Volunteering',
    pillar: 'People & Profiles',
    registers: 5,
    checkpoints: 26,
    rlsTier: 'HR & Admin',
    blurb: 'Complete HR studio for employment contracts, position descriptions, leave, appraisals & files.',
  },
  crm: {
    label: 'CRM & Leads',
    pillar: 'Finance & Operations',
    registers: 2,
    checkpoints: 8,
    rlsTier: 'CRM & Intake',
    blurb: 'Provider growth & referrer pipeline managing enquiries, support coordinators & intake conversion.',
  },
  projects: {
    label: 'Projects Hub',
    pillar: 'Executive & Governance',
    registers: 2,
    checkpoints: 8,
    rlsTier: 'Management & Admin',
    blurb: 'Strategic business project & governance tracker with milestone boards, budgets & owner logs.',
  },
  'ndis-provider': {
    label: 'NDIS Provider Portal',
    pillar: 'Compliance & Risk',
    registers: 3,
    checkpoints: 28,
    rlsTier: 'Compliance & Admin',
    blurb: 'NDIS registration group & governance portal tracking Practice Standards, deadlines & KPIs.',
  },
  'ndis-news': {
    label: 'NDIS Updates & News',
    pillar: 'Compliance & Risk',
    registers: 1,
    checkpoints: 6,
    rlsTier: 'All Approved Roles',
    blurb: 'Live NDIS Commission news feed, Price Guide release tracker & regulatory impact briefings.',
  },
  'equipment-manuals': {
    label: 'Equipment & MSDS',
    pillar: 'Compliance & Risk',
    registers: 2,
    checkpoints: 12,
    rlsTier: 'All Approved Roles',
    blurb: 'Safe operating manuals for hoists & assistive tech alongside a Hazardous Chemical MSDS register.',
  },
  'community-council': {
    label: 'Community & Council Hub',
    pillar: 'Service Delivery',
    registers: 1,
    checkpoints: 6,
    rlsTier: 'All Approved Roles',
    blurb: 'Local council accessibility lookup, inclusive community directory & outing safety planning.',
  },
  'community-referral': {
    label: 'Referral & Support',
    pillar: 'Service Delivery',
    registers: 2,
    checkpoints: 8,
    rlsTier: 'Intake & Support',
    blurb: 'Postcode-matched allied health, advocacy & crisis directory with 1-click warm referral letters.',
  },
  programs: {
    label: 'Programs & Events',
    pillar: 'Service Delivery',
    registers: 2,
    checkpoints: 8,
    rlsTier: 'All Approved Roles',
    blurb: 'Group programs & accessible events calendar with flyer generation, ratios & RSVP invitations.',
  },
  'suggestions-hub': {
    label: 'Suggestions Hub',
    pillar: 'Compliance & Risk',
    registers: 2,
    checkpoints: 10,
    rlsTier: 'All Approved Roles',
    blurb: 'Whole-of-platform AI auditor scanning all 46 screens for overdue items & 1-click improvements.',
  },
  help: {
    label: 'Help Centre',
    pillar: 'Executive & Governance',
    registers: 1,
    checkpoints: 6,
    rlsTier: 'All Approved Roles',
    blurb: '24/7 technical support & AI system troubleshooter with live diagnostics & help-desk tickets.',
  },
  'user-guides': {
    label: 'User Guides',
    pillar: 'Executive & Governance',
    registers: 1,
    checkpoints: 6,
    rlsTier: 'All Approved Roles',
    blurb: 'Step-by-step interactive manuals and downloadable A4 SOP guides for every module and role.',
  },
  assistant: {
    label: 'AI Assistant',
    pillar: 'Executive & Governance',
    registers: 1,
    checkpoints: 8,
    rlsTier: 'All Approved Roles',
    blurb: 'In-app AI compliance, rostering & documentation copilot answering NDIS policy questions live.',
  },
};

const ALL_MODULES = MODULE_DIRECTORY.map((m, idx) => {
  const info = CONCISE_MODULE_INFO[m.key] || {};
  return {
    id: m.key,
    code: `MOD-${String(idx + 1).padStart(2, '0')}`,
    label: info.label || m.label,
    pillar: info.pillar || 'Compliance & Risk',
    registers: info.registers || 2,
    checkpoints: info.checkpoints || 8,
    rlsTier: info.rlsTier || 'Role-Scoped RLS',
    blurb: info.blurb || m.blurb,
    path: m.key === 'dashboard' ? '/dashboard' : m.path,
    icon: m.icon || ShieldCheck,
    status: 'Verified · Live',
  };
});

const SAVED_VIEWS = [
  { id: 'ALL', label: 'All 46 Modules', filter: () => true },
  { id: 'COMPLIANCE', label: 'Compliance & Risk (12)', filter: (m) => m.pillar === 'Compliance & Risk' },
  { id: 'PEOPLE', label: 'People & Profiles (8)', filter: (m) => m.pillar === 'People & Profiles' },
  { id: 'SERVICE', label: 'Service Delivery (8)', filter: (m) => m.pillar === 'Service Delivery' },
  { id: 'FINANCE', label: 'Finance & Operations (7)', filter: (m) => m.pillar === 'Finance & Operations' },
  { id: 'EXECUTIVE', label: 'Executive & Governance (11)', filter: (m) => m.pillar === 'Executive & Governance' },
];

export default function BlueprintPreviewSection() {
  const [savedView, setSavedView] = useState('ALL');
  const [pillarFilter, setPillarFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('code');
  const [sortDir, setSortDir] = useState('asc');
  const [selectedIds, setSelectedIds] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'

  const filteredModules = useMemo(() => {
    const viewObj = SAVED_VIEWS.find((v) => v.id === savedView) || SAVED_VIEWS[0];
    return ALL_MODULES.filter((m) => {
      if (!viewObj.filter(m)) return false;
      if (pillarFilter !== 'ALL' && m.pillar !== pillarFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          m.label.toLowerCase().includes(q) ||
          m.code.toLowerCase().includes(q) ||
          m.pillar.toLowerCase().includes(q) ||
          m.blurb.toLowerCase().includes(q) ||
          m.rlsTier.toLowerCase().includes(q)
        );
      }
      return true;
    }).sort((a, b) => {
      const av = a[sortField];
      const bv = b[sortField];
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [savedView, pillarFilter, searchQuery, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredModules.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedModules = filteredModules.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const toggleSelectAllOnPage = () => {
    const pageIds = pagedModules.map((m) => m.id);
    const allSelected = pageIds.every((id) => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const exportModulesCsv = (rowsToExport) => {
    const headers = ['Code', 'Module', 'Architectural Pillar', 'Master Registers', 'Audit Checkpoints', 'RLS Access Tier', 'Status', 'Route'];
    const csvRows = [
      headers.join(','),
      ...rowsToExport.map((r) =>
        [
          r.code,
          `"${r.label.replace(/"/g, '""')}"`,
          `"${r.pillar}"`,
          r.registers,
          r.checkpoints,
          `"${r.rlsTier}"`,
          `"${r.status}"`,
          r.path,
        ].join(',')
      ),
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ComplianceHR-Infinity-46-Modules-Register.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section id="blueprint" className="w-full scroll-mt-20">
      <div className="enterprise-surface rounded-2xl p-6 sm:p-8 lg:p-10 space-y-6">
        <LandingSectionHeader
          badge="46-Module Enterprise Architecture Register"
          tone="navy"
          icon={Layers}
          title="Explore All 46 Connected Modules & Governance Scopes"
          description="Inspect every module across the platform using Saved Views, multi-column sorting, domain filtering, bulk selection, and CSV architecture export."
        />

        {/* Saved Views Bar (Microsoft Purview / ServiceNow GRC Standard) */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Saved module views">
            {SAVED_VIEWS.map((view) => {
              const active = savedView === view.id;
              return (
                <button
                  key={view.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => {
                    setSavedView(view.id);
                    setPage(1);
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? 'bg-[#0A2B6D] text-white shadow-2xs'
                      : 'border border-slate-200 bg-slate-50 text-[#0A2B6D] hover:bg-white hover:border-[#0072FF]'
                  }`}
                >
                  {view.label}
                </button>
              );
            })}
          </div>

          {/* View Mode Toggle */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition ${
                viewMode === 'table' ? 'bg-white text-[#0A2B6D] shadow-2xs' : 'text-[#0A2B6D]/70'
              }`}
            >
              <Table2 className="h-3.5 w-3.5 text-[#0072FF]" />
              <span>Enterprise Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold transition ${
                viewMode === 'cards' ? 'bg-white text-[#0A2B6D] shadow-2xs' : 'text-[#0A2B6D]/70'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5 text-[#5A00D6]" />
              <span>Module Cards</span>
            </button>
          </div>
        </div>

        {/* Enterprise Table Toolbar: Search, Domain Filter, Bulk Actions, CSV Export */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-wrap items-center gap-2.5">
            <div className="relative min-w-[240px] flex-1 max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#0A2B6D]/50" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search modules, pillars, RLS scopes..."
                aria-label="Search 46 modules"
                className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm font-medium text-[#0A2B6D] focus:border-[#0072FF] focus:outline-none"
              />
            </div>

            <div className="inline-flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-[#5A00D6]" />
              <select
                aria-label="Filter by architectural pillar"
                value={pillarFilter}
                onChange={(e) => {
                  setPillarFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0A2B6D]"
              >
                <option value="ALL">All Pillars</option>
                <option value="Executive & Governance">Executive &amp; Governance</option>
                <option value="People & Profiles">People &amp; Profiles</option>
                <option value="Service Delivery">Service Delivery</option>
                <option value="Compliance & Risk">Compliance &amp; Risk</option>
                <option value="Finance & Operations">Finance &amp; Operations</option>
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedIds.length > 0 && (
              <div className="inline-flex items-center gap-2 rounded-lg border border-[#0072FF]/30 bg-[#0072FF]/5 px-3 py-1.5 text-xs font-bold text-[#0A2B6D]">
                <CheckSquare className="h-3.5 w-3.5 text-[#0072FF]" />
                <span>{selectedIds.length} selected</span>
                <button
                  type="button"
                  onClick={() =>
                    exportModulesCsv(ALL_MODULES.filter((m) => selectedIds.includes(m.id)))
                  }
                  className="text-[#0072FF] underline hover:text-[#5A00D6]"
                >
                  Export Selected
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="text-[#0A2B6D]/70 hover:text-[#0A2B6D]"
                >
                  Clear
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => exportModulesCsv(filteredModules)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#0A2B6D] transition hover:border-[#0072FF] hover:text-[#0072FF]"
            >
              <Download className="h-3.5 w-3.5 text-[#0072FF]" />
              <span>Export CSV ({filteredModules.length})</span>
            </button>
          </div>
        </div>

        {viewMode === 'table' ? (
          /* Salesforce Lightning / Microsoft Purview Enterprise Data Table */
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-200 bg-[#F8FAFC] text-xs font-bold uppercase tracking-wider text-[#0A2B6D]">
                    <th className="w-10 px-3.5 py-3">
                      <input
                        type="checkbox"
                        aria-label="Select all modules on current page"
                        checked={
                          pagedModules.length > 0 &&
                          pagedModules.every((m) => selectedIds.includes(m.id))
                        }
                        onChange={toggleSelectAllOnPage}
                        className="h-4 w-4 rounded border-slate-300 text-[#0072FF]"
                      />
                    </th>
                    <th className="px-3.5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('code')}
                        className="inline-flex items-center gap-1 font-bold text-[#0A2B6D] hover:text-[#0072FF]"
                      >
                        <span>Code</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3.5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('label')}
                        className="inline-flex items-center gap-1 font-bold text-[#0A2B6D] hover:text-[#0072FF]"
                      >
                        <span>Module Name</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3.5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('pillar')}
                        className="inline-flex items-center gap-1 font-bold text-[#0A2B6D] hover:text-[#0072FF]"
                      >
                        <span>Architectural Pillar</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3.5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('registers')}
                        className="inline-flex items-center gap-1 font-bold text-[#0A2B6D] hover:text-[#0072FF]"
                      >
                        <span>Registers</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3.5 py-3">
                      <button
                        type="button"
                        onClick={() => toggleSort('checkpoints')}
                        className="inline-flex items-center gap-1 font-bold text-[#0A2B6D] hover:text-[#0072FF]"
                      >
                        <span>Checkpoints</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3.5 py-3">RLS Scope</th>
                    <th className="px-3.5 py-3">Status</th>
                    <th className="px-3.5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {pagedModules.map((mod) => {
                    const Icon = mod.icon;
                    const isSelected = selectedIds.includes(mod.id);
                    return (
                      <tr
                        key={mod.id}
                        className={`transition hover:bg-slate-50/90 ${
                          isSelected ? 'bg-[#0072FF]/5' : ''
                        }`}
                      >
                        <td className="px-3.5 py-3 align-middle">
                          <input
                            type="checkbox"
                            aria-label={`Select ${mod.label}`}
                            checked={isSelected}
                            onChange={() => toggleSelectOne(mod.id)}
                            className="h-4 w-4 rounded border-slate-300 text-[#0072FF]"
                          />
                        </td>
                        <td className="px-3.5 py-3 align-middle font-mono text-xs font-bold text-[#5A00D6]">
                          {mod.code}
                        </td>
                        <td className="px-3.5 py-3 align-middle">
                          <div className="flex items-start gap-2.5">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[#0A2B6D] text-white">
                              <Icon className="h-3.5 w-3.5 text-[#00C6FF]" />
                            </div>
                            <div>
                              <div className="font-bold text-[#0A2B6D]">{mod.label}</div>
                              <div className="text-xs font-normal text-[#0A2B6D]/70 max-w-md">
                                {mod.blurb}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 align-middle text-xs font-semibold text-[#0A2B6D]">
                          {mod.pillar}
                        </td>
                        <td className="px-3.5 py-3 align-middle text-xs font-bold text-[#0072FF]">
                          {mod.registers} Linked
                        </td>
                        <td className="px-3.5 py-3 align-middle text-xs font-bold text-[#5A00D6]">
                          {mod.checkpoints} Verified
                        </td>
                        <td className="px-3.5 py-3 align-middle text-xs font-medium text-[#0A2B6D]/80">
                          {mod.rlsTier}
                        </td>
                        <td className="px-3.5 py-3 align-middle">
                          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{mod.status}</span>
                          </span>
                        </td>
                        <td className="px-3.5 py-3 align-middle text-right">
                          <Link
                            to={mod.path}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-[#0A2B6D] transition hover:border-[#0072FF] hover:text-[#0072FF]"
                          >
                            <span>Open</span>
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Enterprise Table Pagination Footer */}
            <div className="flex flex-col gap-3 border-t border-slate-200 bg-[#F8FAFC] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 text-xs font-semibold text-[#0A2B6D]/80">
                <span>
                  Showing {(currentPage - 1) * pageSize + 1}–
                  {Math.min(currentPage * pageSize, filteredModules.length)} of {filteredModules.length} modules
                </span>
                <label className="inline-flex items-center gap-1.5">
                  <span>Rows:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                    className="rounded border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-[#0A2B6D]"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={46}>All 46</option>
                  </select>
                </label>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-[#0A2B6D] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="px-2 text-xs font-bold text-[#0A2B6D]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-[#0A2B6D] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Clean Enterprise Module Cards Grid */
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredModules.map((mod) => {
              const Icon = mod.icon;
              return (
                <Link
                  key={mod.id}
                  to={mod.path}
                  className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-[#0072FF] hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-bold text-[#5A00D6]">{mod.code}</span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-[#0A2B6D]">
                        {mod.pillar}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0A2B6D] text-white">
                        <Icon className="h-4 w-4 text-[#00C6FF]" />
                      </div>
                      <h3 className="text-base font-extrabold text-[#0A2B6D] group-hover:text-[#0072FF]">
                        {mod.label}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm font-normal leading-relaxed text-[#0A2B6D]/75">
                      {mod.blurb}
                    </p>
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs font-semibold text-[#0072FF]">
                    <span>{mod.registers} Registers · {mod.checkpoints} Checks</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}