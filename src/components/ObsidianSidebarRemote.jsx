import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import {
  LogOut, ChevronDown, ChevronRight, LayoutDashboard, ClipboardList,
  Users, ShieldCheck, ShieldAlert, FolderOpen, Megaphone,
  BarChart3, Cpu, Settings,
} from 'lucide-react';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

export const PRIMARY_11_OS_NAV = [
  {
    id: 'dashboard-executive',
    label: '1. Dashboard & Executive Command',
    sub: 'Dashboard, Operations, Analytics, Suggestions & AI',
    path: '/dashboard',
    icon: LayoutDashboard,
    children: [
      { label: 'Dashboard', path: '/dashboard' },
      { label: 'Operations Centre', path: '/operations-centre' },
      { label: 'Business Analytics', path: '/analytics' },
      { label: 'Suggestions Hub', path: '/suggestions' },
      { label: 'AI Assistant', path: '/assistant' },
      { label: 'Daily Briefing', path: '/briefing' },
    ],
  },
  {
    id: 'people-intake-profiles',
    label: '2. People, Intake & Profiles',
    sub: 'Profiles, Intake, Visual Boards, Contacts & Users',
    path: '/our-employees',
    icon: Users,
    children: [
      { label: 'My Profile', path: '/my-profile' },
      { label: 'Intake Centre', path: '/intake' },
      { label: 'Employee Profiles', path: '/our-employees' },
      { label: 'Participant Profiles', path: '/our-participants' },
      { label: 'Visual Boards', path: '/visual-boards' },
      { label: 'Key Personnel Contacts', path: '/key-contacts' },
      { label: 'Volunteering & Placements', path: '/volunteers' },
      { label: 'Users & Permissions', path: '/users' },
    ],
  },
  {
    id: 'communications-workforce',
    label: '3. Communications & Workforce',
    sub: 'Communications, Rostering, Goals, Tasks & Meetings',
    path: '/communications',
    icon: Megaphone,
    children: [
      { label: 'Communication Centre', path: '/communications' },
      { label: 'Rostering', path: '/rostering' },
      { label: 'Goals', path: '/goals' },
      { label: 'Tasks', path: '/tasks' },
      { label: 'Meetings', path: '/meetings' },
      { label: 'Programs & Events', path: '/programs' },
      { label: 'Frontline Rapid Hub', path: '/frontline-hub' },
      { label: 'Workforce Presence Centre', path: '/workforce-presence' },
    ],
  },
  {
    id: 'incidents-risk-safety',
    label: '4. Incidents, Risk & Safety',
    sub: 'Incidents, Analytics, Risks, Emergency & MSDS',
    path: '/incidents',
    icon: ShieldAlert,
    children: [
      { label: 'Incident Clinic', path: '/incidents' },
      { label: 'Incident Analytics', path: '/incident-analytics' },
      { label: 'Risk Reporting', path: '/risks' },
      { label: 'Emergency Response', path: '/emergency-response' },
      { label: 'Equipment Manuals & MSDS', path: '/equipment-manuals' },
    ],
  },
  {
    id: 'compliance-quality-evidence',
    label: '5. Compliance, Quality & Evidence',
    sub: 'Compliance, Auditor, Vault, Safe, Quality & Evidence',
    path: '/compliance',
    icon: ShieldCheck,
    children: [
      { label: 'Compliance Centre', path: '/compliance' },
      { label: 'Auditor Portal', path: '/auditor-portal' },
      { label: 'Document Vault', path: '/documents' },
      { label: 'Company Safe', path: '/company-safe' },
      { label: 'Quality & Improvement', path: '/quality' },
      { label: 'Feedback & Surveys', path: '/feedback' },
      { label: 'Checklists', path: '/checklists' },
      { label: 'Review Due Board', path: '/review-due' },
      { label: 'Universal Storage & Export Hub', path: '/universal-storage' },
      { label: 'Universal Register Hub', path: '/registers' },
      { label: 'Evidence & User Success Hub', path: '/user-success' },
      { label: 'Record Intelligence & Routing', path: '/record-intelligence' },
    ],
  },
  {
    id: 'training-capability',
    label: '6. Training & Capability',
    sub: 'Training Centre, Certificates, LMS & Skills Matrix',
    path: '/training',
    icon: ClipboardList,
    children: [
      { label: 'Training Centre', path: '/training' },
      { label: 'Certificates', path: '/certificates' },
    ],
  },
  {
    id: 'finance-commercial',
    label: '7. Finance & Commercial',
    sub: 'Invoicing, Quotes, Receipts, Procurement & Assets',
    path: '/invoicing',
    icon: BarChart3,
    children: [
      { label: 'Invoicing Centre', path: '/invoicing' },
      { label: 'Quote Centre', path: '/quotes' },
      { label: 'Receipt Hub', path: '/receipts' },
      { label: 'Procurement', path: '/procurement' },
      { label: 'Asset Management', path: '/assets' },
    ],
  },
  {
    id: 'human-resources',
    label: '8. Human Resources',
    sub: 'HR Hub, Contracts, Reviews, Leave & Onboarding',
    path: '/hr',
    icon: Users,
    children: [
      { label: 'HR Hub', path: '/hr' },
    ],
  },
  {
    id: 'crm-growth-relationships',
    label: '9. CRM, Growth & Relationships',
    sub: 'CRM & Leads, Referrals & Provider Relationships',
    path: '/crm',
    icon: Megaphone,
    children: [
      { label: 'CRM & Leads', path: '/crm' },
      { label: 'Referrals', path: '/referrals' },
    ],
  },
  {
    id: 'governance-strategy',
    label: '10. Governance & Strategy',
    sub: 'Governance Layer, Projects, Board Packs & KPIs',
    path: '/governance',
    icon: Cpu,
    children: [
      { label: 'Governance Layer', path: '/governance' },
      { label: 'Projects Hub', path: '/projects' },
    ],
  },
  {
    id: 'ndis-regulatory',
    label: '11. NDIS & Regulatory',
    sub: 'NDIS Provider Portal, Practice Standards & News',
    path: '/ndis-portal',
    icon: ShieldCheck,
    children: [
      { label: 'NDIS Provider Portal', path: '/ndis-portal' },
      { label: 'NDIS Updates & News', path: '/ndis-updates' },
    ],
  },
  {
    id: 'community-support-services',
    label: '12. Community & Support Services',
    sub: 'Community Council Hub, Networks & Accessibility',
    path: '/community-council',
    icon: FolderOpen,
    children: [
      { label: 'Community Council Hub', path: '/community-council' },
    ],
  },
  {
    id: 'help-knowledge-support',
    label: '13. Help, Knowledge & Support',
    sub: 'Help Centre, User Guides & System Documentation',
    path: '/help',
    icon: Settings,
    children: [
      { label: 'Help Centre', path: '/help' },
      { label: 'User Guides', path: '/user-guides' },
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

  const modules = visiblePrimary.filter(
    (item) =>
      !(item.key === 'staff-progress' && visiblePrimary.some((entry) => entry.key === 'staff'))
  );

  return (
    <div className="flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden bg-white select-none">
      {/* Brand Lockup */}
      <div className="flex shrink-0 flex-col border-b border-slate-200 bg-white px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <Image
            src={CHR_LOGO}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="h-8 w-8 shrink-0 rounded-lg border border-slate-200 bg-white p-1 shadow-2xs"
          />
          <div className="min-w-0">
            <div className="text-sm font-extrabold leading-tight tracking-tight text-slate-900 whitespace-nowrap">
              Compliance<span className="text-indigo-600">HR Infinity</span>
            </div>
            <div className="mt-0.5 text-[9.5px] font-medium leading-tight text-slate-500">
              Complete Control. Greater Confidence. Brighter Success.
            </div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="mt-3 grid w-full grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-slate-100 p-0.5">
          <button
            type="button"
            onClick={() => setNavMode('os11')}
            className={`rounded-md py-1 text-[10px] font-semibold transition ${
              navMode === 'os11'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            Categories
          </button>
          <button
            type="button"
            onClick={() => setNavMode('all')}
            className={`rounded-md py-1 text-[10px] font-semibold transition ${
              navMode === 'all'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            All Modules
          </button>
        </div>
      </div>

      {/* Navigation List */}
      <nav
        aria-label="Page navigation"
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-1"
      >
        {navMode === 'os11'
          ? PRIMARY_11_OS_NAV.map((pillar) => {
              const Icon = pillar.icon;
              const pillarActive =
                isActive(pillar.path) ||
                pillar.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`));
              const isExpanded = expandedPillar === pillar.id || pillarActive;

              return (
                <div key={pillar.id} className="space-y-1">
                  <div
                    className={`flex items-center justify-between gap-1 rounded-xl border px-2.5 py-2 transition ${
                      pillarActive
                        ? 'border-indigo-200 bg-indigo-50/70 text-indigo-900'
                        : 'border-transparent bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Link
                      to={pillar.path}
                      onClick={() => setExpandedPillar(pillar.id)}
                      className="flex min-w-0 flex-1 items-center gap-2"
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${
                          pillarActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-indigo-600'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 text-xs font-semibold leading-snug">
                        {pillar.label}
                      </span>
                    </Link>
                    <button
                      type="button"
                      aria-label={`Toggle ${pillar.label}`}
                      onClick={() =>
                        setExpandedPillar((prev) => (prev === pillar.id ? '' : pillar.id))
                      }
                      className="rounded p-1 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="ml-3.5 space-y-0.5 border-l border-slate-200 pl-2.5 py-0.5">
                      {pillar.children.map((child) => {
                        const subActive =
                          location.pathname === child.path ||
                          (child.path !== '/dashboard' && location.pathname.startsWith(`${child.path}/`));
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                              subActive
                                ? 'bg-indigo-600 font-semibold text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          : modules.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const label = navLabel(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-indigo-600'}`} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
      </nav>

      {/* Sign-Out Action */}
      {onLogout && (
        <div className="shrink-0 border-t border-slate-200 p-3">
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-500" />
            <span>Sign out</span>
          </button>
        </div>
      )}
    </div>
  );
}