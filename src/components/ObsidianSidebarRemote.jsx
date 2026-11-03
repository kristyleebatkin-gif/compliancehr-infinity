import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import {
  LogOut, ChevronDown, ChevronRight, LayoutDashboard, ClipboardList,
  Users, ShieldCheck, ShieldAlert, FolderOpen, Megaphone,
  BarChart3, Cpu, Settings, Search,
} from 'lucide-react';

// Permanent 13-Group Architectural Map (Single Source of Truth, Zero Duplicates)
export const PRIMARY_11_OS_NAV = [
  {
    id: 'dashboard-executive',
    label: '1. Executive Command',
    sub: 'Dashboard, Operations, Analytics, Suggestions & AI',
    path: '/dashboard',
    icon: LayoutDashboard,
    status: 'LIVE',
    children: [
      { label: 'Dashboard', path: '/dashboard', sub: 'Executive overview & live KPIs' },
      { label: 'Operations Centre', path: '/operations-centre', sub: 'Master operations & control deck' },
      { label: 'Business Analytics', path: '/analytics', sub: 'Cross-module trends & reports' },
      { label: 'Suggestions Hub', path: '/suggestions', sub: 'Continuous improvement ideas' },
      { label: 'AI Assistant', path: '/assistant', sub: '24/7 compliance & HR copilot' },
      { label: 'Daily Briefing', path: '/briefing', sub: 'Morning operational briefing' },
    ],
  },
  {
    id: 'people-intake-profiles',
    label: '2. People & 360° Profiles',
    sub: 'Profiles, Intake, Visual Boards, Contacts & Users',
    path: '/our-employees',
    icon: Users,
    status: 'READY',
    children: [
      { label: 'My Profile', path: '/my-profile', sub: 'Personal profile, work & docs' },
      { label: 'Intake Centre', path: '/intake', sub: 'Participant & staff onboarding' },
      { label: 'Employee Profiles', path: '/our-employees', sub: '360° staff directory & files' },
      { label: 'Participant Profiles', path: '/our-participants', sub: '360° participant care folders' },
      { label: 'Visual Boards', path: '/visual-boards', sub: 'Accessible visual routines & AAC' },
      { label: 'Key Personnel Contacts', path: '/key-contacts', sub: 'Key personnel & emergency directory' },
      { label: 'Volunteering & Placements', path: '/volunteers', sub: 'Volunteer screening & placements' },
      { label: 'Users & Permissions', path: '/users', sub: 'Role matrix & access control' },
    ],
  },
  {
    id: 'communications-workforce',
    label: '3. Service Delivery & Roster',
    sub: 'Communications, Rostering, Goals, Tasks & Meetings',
    path: '/communications',
    icon: Megaphone,
    status: 'LIVE',
    children: [
      { label: 'Communication Centre', path: '/communications', sub: 'Shift notes, inbox & broadcasts' },
      { label: 'Rostering', path: '/rostering', sub: 'Shifts, coverage & availability' },
      { label: 'Goals', path: '/goals', sub: 'Participant & staff goal tracking' },
      { label: 'Tasks', path: '/tasks', sub: 'Shared to-do & sign-off board' },
      { label: 'Meetings', path: '/meetings', sub: 'Agendas, minutes & action items' },
      { label: 'Programs & Events', path: '/programs', sub: 'Community programs & calendar' },
      { label: 'Frontline Rapid Hub', path: '/frontline-hub', sub: '60-second mobile field actions' },
      { label: 'Workforce Presence Centre', path: '/workforce-presence', sub: 'Live sign-in & emergency roll call' },
    ],
  },
  {
    id: 'incidents-risk-safety',
    label: '4. Incidents, Risk & Safety',
    sub: 'Incidents, Analytics, Risks, Emergency & MSDS',
    path: '/incidents',
    icon: ShieldAlert,
    status: 'GUARDED',
    children: [
      { label: 'Incident Clinic', path: '/incidents', sub: 'NDIS & SIRS reportable triage' },
      { label: 'Incident Analytics', path: '/incident-analytics', sub: 'Root-cause & trend intelligence' },
      { label: 'Risk Reporting', path: '/risks', sub: 'Risk register, hazards & Take-5' },
      { label: 'Emergency Response', path: '/emergency-response', sub: 'Drills, plans & visitor log' },
      { label: 'Equipment Manuals & MSDS', path: '/equipment-manuals', sub: 'Safety data sheets & manuals' },
    ],
  },
  {
    id: 'compliance-quality-evidence',
    label: '5. Compliance & Evidence',
    sub: 'Compliance, Auditor, Vault, Safe, Quality & Evidence',
    path: '/compliance',
    icon: ShieldCheck,
    status: 'VERIFIED',
    children: [
      { label: 'Compliance Centre', path: '/compliance', sub: '356 audit checks & readiness' },
      { label: 'Auditor Portal', path: '/auditor-portal', sub: 'Read-only external auditor view' },
      { label: 'Document Vault', path: '/documents', sub: 'Controlled policies & renewals' },
      { label: 'Company Safe', path: '/company-safe', sub: 'Executive vault & credentials' },
      { label: 'Quality & Improvement', path: '/quality', sub: 'Continuous improvement & CAPA' },
      { label: 'Feedback & Surveys', path: '/feedback', sub: 'Complaints, compliments & surveys' },
      { label: 'Checklists', path: '/checklists', sub: 'Operational & audit checklists' },
      { label: 'Review Due Board', path: '/review-due', sub: 'Upcoming scheduled reviews' },
      { label: 'Universal Storage & Export Hub', path: '/universal-storage', sub: 'Retention, backup & PDF packs' },
      { label: 'Universal Register Hub', path: '/registers', sub: '45 connected master registers' },
      { label: 'Evidence & User Success Hub', path: '/user-success', sub: 'Evidence-first verification' },
      { label: 'Record Intelligence & Routing', path: '/record-intelligence', sub: 'Automated cross-module routing' },
    ],
  },
  {
    id: 'training-capability',
    label: '6. Training & Credentials',
    sub: 'Training Centre, Certificates, LMS & Skills Matrix',
    path: '/training',
    icon: ClipboardList,
    status: 'READY',
    children: [
      { label: 'Training Centre', path: '/training', sub: 'LMS courses, quizzes & matrix' },
      { label: 'Certificates', path: '/certificates', sub: 'Staff credentials & expiry alerts' },
    ],
  },
  {
    id: 'finance-commercial',
    label: '7. Finance & Commercial',
    sub: 'Invoicing, Quotes, Receipts, Procurement & Assets',
    path: '/invoicing',
    icon: BarChart3,
    status: 'READY',
    children: [
      { label: 'Invoicing Centre', path: '/invoicing', sub: 'NDIS claims & bank reconciliation' },
      { label: 'Quote Centre', path: '/quotes', sub: 'Service quotes & agreements' },
      { label: 'Receipt Hub', path: '/receipts', sub: 'Expense scanner & reimbursements' },
      { label: 'Procurement', path: '/procurement', sub: 'Purchase orders & suppliers' },
      { label: 'Asset Management', path: '/assets', sub: 'Fleet, equipment & maintenance' },
    ],
  },
  {
    id: 'human-resources',
    label: '8. Human Resources',
    sub: 'HR Hub, Contracts, Reviews, Leave & Onboarding',
    path: '/hr',
    icon: Users,
    status: 'READY',
    children: [
      { label: 'HR Hub', path: '/hr', sub: 'Contracts, appraisals & payroll' },
    ],
  },
  {
    id: 'crm-growth-relationships',
    label: '9. CRM & Referrals',
    sub: 'CRM & Leads, Referrals & Provider Relationships',
    path: '/crm',
    icon: Megaphone,
    status: 'LIVE',
    children: [
      { label: 'CRM & Leads', path: '/crm', sub: 'Enquiries, leads & partnerships' },
      { label: 'Referrals', path: '/referrals', sub: 'Inbound & outbound referrals' },
    ],
  },
  {
    id: 'governance-strategy',
    label: '10. Governance & Strategy',
    sub: 'Governance Layer, Projects, Board Packs & KPIs',
    path: '/governance',
    icon: Cpu,
    status: 'VERIFIED',
    children: [
      { label: 'Governance Layer', path: '/governance', sub: 'Delegations, lifecycle & board packs' },
      { label: 'Projects Hub', path: '/projects', sub: 'Strategic projects & milestones' },
    ],
  },
  {
    id: 'ndis-regulatory',
    label: '11. NDIS & Regulatory',
    sub: 'NDIS Provider Portal, Practice Standards & News',
    path: '/ndis-portal',
    icon: ShieldCheck,
    status: 'SYNCED',
    children: [
      { label: 'NDIS Provider Portal', path: '/ndis-portal', sub: 'Registration groups & KPIs' },
      { label: 'NDIS Updates & News', path: '/ndis-updates', sub: 'Price guide & regulatory alerts' },
    ],
  },
  {
    id: 'community-support-services',
    label: '12. Community & Council',
    sub: 'Community Council Hub, Networks & Accessibility',
    path: '/community-council',
    icon: FolderOpen,
    status: 'READY',
    children: [
      { label: 'Community Council Hub', path: '/community-council', sub: 'Local council programs & events' },
    ],
  },
  {
    id: 'help-knowledge-support',
    label: '13. Help & Documentation',
    sub: 'Help Centre, User Guides & System Documentation',
    path: '/help',
    icon: Settings,
    status: 'ONLINE',
    children: [
      { label: 'Help Centre', path: '/help', sub: 'AI troubleshooter & support tickets' },
      { label: 'User Guides', path: '/user-guides', sub: 'Step-by-step platform manuals' },
    ],
  },
];

export default function ObsidianSidebarRemote({
  visiblePrimary = [],
  isActive,
  navLabel,
  onLogout,
}) {
  const location = useLocation();
  const [navMode, setNavMode] = useState('os11');
  const [expandedPillar, setExpandedPillar] = useState('dashboard-executive');
  const [filterText, setFilterText] = useState('');

  const modules = visiblePrimary.filter(
    (item) =>
      !(item.key === 'staff-progress' && visiblePrimary.some((entry) => entry.key === 'staff'))
  );

  const q = filterText.trim().toLowerCase();

  return (
    <div className="flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden bg-white text-[#0A2B6D] select-none">
      {/* Compact Brand Header & View Mode Toggle */}
      <div className="shrink-0 border-b border-slate-200 p-3 space-y-2.5">
        <Link
          to="/dashboard"
          aria-label="ComplianceHR Infinity Home"
          className="flex w-full justify-center"
        >
          <BrandLogoLockup size="xs" showSlogan={false} className="w-full" />
        </Link>

        {/* Quick Sidebar Search */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#0A2B6D]/50" />
          <input
            type="search"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Jump to module..."
            aria-label="Filter navigation modules"
            className="h-8 w-full rounded-lg border border-slate-200 bg-[#F8FAFC] pl-8 pr-2.5 text-xs font-medium text-[#0A2B6D] focus:border-[#0072FF] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Navigation Mode Switcher */}
        <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setNavMode('os11')}
            className={`rounded-md py-1 text-xs font-bold transition ${
              navMode === 'os11'
                ? 'bg-white text-[#0A2B6D] shadow-2xs'
                : 'text-[#0A2B6D]/70 hover:text-[#0A2B6D]'
            }`}
          >
            13 Domains
          </button>
          <button
            type="button"
            onClick={() => setNavMode('all')}
            className={`rounded-md py-1 text-xs font-bold transition ${
              navMode === 'all'
                ? 'bg-white text-[#0A2B6D] shadow-2xs'
                : 'text-[#0A2B6D]/70 hover:text-[#0A2B6D]'
            }`}
          >
            All Modules
          </button>
        </div>
      </div>

      {/* Scrollable Navigation Tree */}
      <nav
        aria-label="Primary application navigation"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-1"
      >
        {navMode === 'os11' && !q
          ? PRIMARY_11_OS_NAV.map((pillar) => {
              const Icon = pillar.icon;
              const pillarActive =
                isActive(pillar.path) ||
                pillar.children.some(
                  (c) =>
                    location.pathname === c.path ||
                    location.pathname.startsWith(`${c.path}/`)
                );
              const isExpanded = expandedPillar === pillar.id || pillarActive;

              return (
                <div key={pillar.id} className="space-y-0.5">
                  <div
                    className={`flex items-center justify-between rounded-lg px-2.5 py-2 transition ${
                      pillarActive
                        ? 'bg-[#0A2B6D] text-white'
                        : 'text-[#0A2B6D] hover:bg-slate-100'
                    }`}
                  >
                    <Link
                      to={pillar.path}
                      onClick={() => setExpandedPillar(pillar.id)}
                      className="flex min-w-0 flex-1 items-center gap-2 text-xs font-bold"
                    >
                      <Icon
                        className="h-4 w-4 shrink-0"
                        style={{ color: pillarActive ? '#00C6FF' : '#0072FF' }}
                      />
                      <span className="truncate">{pillar.label}</span>
                    </Link>

                    <button
                      type="button"
                      aria-label={`Toggle ${pillar.label}`}
                      onClick={() =>
                        setExpandedPillar((prev) => (prev === pillar.id ? '' : pillar.id))
                      }
                      className={`rounded p-0.5 ${
                        pillarActive ? 'text-white/80 hover:text-white' : 'text-[#0A2B6D]/60 hover:text-[#0A2B6D]'
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-3 border-l border-slate-200 pl-2 space-y-0.5 py-0.5">
                      {pillar.children.map((child) => {
                        const subActive =
                          location.pathname === child.path ||
                          (child.path !== '/dashboard' &&
                            location.pathname.startsWith(`${child.path}/`));
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs transition ${
                              subActive
                                ? 'bg-[#0072FF]/10 font-bold text-[#0072FF]'
                                : 'font-medium text-[#0A2B6D]/80 hover:bg-slate-50 hover:text-[#0A2B6D]'
                            }`}
                          >
                            <span className="truncate">{child.label}</span>
                            {subActive && (
                              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#0072FF]" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          : modules
              .filter((item) => {
                if (!q) return true;
                const label = navLabel(item).toLowerCase();
                const blurb = (item.blurb || '').toLowerCase();
                return label.includes(q) || blurb.includes(q);
              })
              .map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const label = navLabel(item);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs transition ${
                      active
                        ? 'bg-[#0A2B6D] font-bold text-white shadow-2xs'
                        : 'font-semibold text-[#0A2B6D] hover:bg-slate-100'
                    }`}
                  >
                    <Icon
                      className="h-4 w-4 shrink-0"
                      style={{ color: active ? '#00C6FF' : '#0072FF' }}
                    />
                    <span className="truncate">{label}</span>
                  </Link>
                );
              })}
      </nav>

      {/* Sign-Out Footer */}
      {onLogout && (
        <div className="shrink-0 border-t border-slate-200 p-2.5">
          <button
            type="button"
            onClick={onLogout}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-[#0A2B6D] transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-600" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}