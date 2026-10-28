import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getHeaderView } from '@/lib/fullColourTiles';
import { Image } from '@/components/ui/image';
import {
  LogOut, ArrowRight, ChevronDown, ChevronRight, LayoutDashboard, ClipboardList,
  Users, CalendarClock, ShieldCheck, ShieldAlert, FolderOpen, Megaphone,
  BarChart3, Cpu, Settings,
} from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #0A2B6D 18%, #5A00D6 42%, #A100FF 68%, #FF2E9A 100%)';

const CHR_LOGO =
  'https://media.base44.com/images/public/6ac9f91f0d82b1f80ec6a25f/3196f8f22_generated_image.png';

// Permanent 13-Group Architectural Map (Single Source of Truth, Zero Duplicates)
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
    sub: 'Projects Hub, Governance, Board Packs & KPIs',
    path: '/projects',
    icon: Cpu,
    children: [
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
  const [navMode, setNavMode] = useState('os11'); // 'os11' (13 Permanent Categories) | 'all' (All Modules)
  const [expandedPillar, setExpandedPillar] = useState('dashboard-executive');

  const modules = visiblePrimary.filter(
    (item) =>
      !(item.key === 'staff-progress' && visiblePrimary.some((entry) => entry.key === 'staff'))
  );

  return (
    <div className="flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden bg-white p-2.5 select-none">
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-panel">
        {/* Top Brand Gradient Bar */}
        <div className="h-1 w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* Platform Name on Top + Smaller-Length Logo Below App Name + Blue/Purple/Pink Slogan */}
        <div className="flex shrink-0 flex-col items-center border-b border-slate-100 bg-[#F5F0FF]/40 px-3 py-2.5 text-center">
          <span className="font-editorial text-[13px] font-extrabold leading-tight tracking-tight text-[#0A2B6D] whitespace-nowrap">
            Compliance
            <span className="font-editorial-italic text-[#5A00D6]">HR</span>{' '}
            <span className="bg-gradient-to-r from-[#5A00D6] to-[#FF2E9A] bg-clip-text text-transparent">
              Infinity
            </span>
          </span>
          <Image
            src={CHR_LOGO}
            alt="ComplianceHR Infinity"
            fittingType="fit"
            className="mt-1 h-5 w-14 rounded-md border border-slate-200 bg-white px-1 py-0.5 shadow-2xs"
          />
          <span className="mt-1 text-[8px] font-extrabold leading-tight">
            <span style={{ color: '#0072FF' }}>Complete Control.</span>{' '}
            <span style={{ color: '#5A00D6' }}>Greater Confidence.</span>{' '}
            <span style={{ color: '#FF2E9A' }}>Brighter Success.</span>
          </span>

          {/* Mode Toggle: 11 Primary OS Pillars vs All Modules */}
          <div className="mt-2 grid w-full grid-cols-2 gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setNavMode('os11')}
              className={`rounded-md py-1 text-[9.5px] font-extrabold transition ${
                navMode === 'os11'
                  ? 'bg-[#0A2B6D] text-white'
                  : 'text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
            >
              13 OS Categories
            </button>
            <button
              type="button"
              onClick={() => setNavMode('all')}
              className={`rounded-md py-1 text-[9.5px] font-extrabold transition ${
                navMode === 'all'
                  ? 'bg-[#5A00D6] text-white'
                  : 'text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
            >
              All Direct Screens
            </button>
          </div>
        </div>

        {/* Navigation List (Max 2 Levels) */}
        <nav
          aria-label="Page navigation"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2 space-y-1.5"
        >
          {navMode === 'os11'
            ? PRIMARY_11_OS_NAV.map((pillar, idx) => {
                const Icon = pillar.icon;
                const pillarActive =
                  isActive(pillar.path) ||
                  pillar.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`));
                const isExpanded = expandedPillar === pillar.id || pillarActive;
                const headerBg = getHeaderView(idx);

                return (
                  <div key={pillar.id} className="space-y-1">
                    <div
                      className={`group flex flex-col gap-[2px] rounded-xl border-2 bg-[#0A2B6D] p-[2.5px] transition-all duration-200 ${
                        pillarActive
                          ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25'
                          : 'border-[#0A2B6D] hover:border-[#0072FF]'
                      }`}
                    >
                      <div className="flex flex-1 flex-col overflow-hidden rounded-[7px] bg-white">
                        <div
                          className="flex min-h-[32px] items-center justify-between gap-1 px-2 py-1 text-white"
                          style={{ background: headerBg }}
                        >
                          <Link
                            to={pillar.path}
                            onClick={() => setExpandedPillar(pillar.id)}
                            className="flex min-w-0 flex-1 items-center gap-1.5"
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                            <span
                              className="min-w-0 text-[10px] font-extrabold leading-tight tracking-tight text-white"
                              style={{ color: '#FFFFFF' }}
                            >
                              {pillar.label}
                            </span>
                          </Link>
                          <button
                            type="button"
                            aria-label={`Toggle ${pillar.label}`}
                            onClick={() =>
                              setExpandedPillar((prev) => (prev === pillar.id ? '' : pillar.id))
                            }
                            className="rounded p-0.5 text-white hover:bg-white/20"
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3.5 w-3.5 text-white" />
                            ) : (
                              <ChevronRight className="h-3.5 w-3.5 text-white" />
                            )}
                          </button>
                        </div>

                        <Link
                          to={pillar.path}
                          onClick={() => setExpandedPillar(pillar.id)}
                          className="flex items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-2 py-1"
                        >
                          <span className="text-[9.5px] font-bold text-[#0A2B6D]/85">
                            {pillar.sub}
                          </span>
                          <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF]" />
                        </Link>
                      </div>
                    </div>

                    {/* Level 2 Sub-Navigation (Maximum 2 Levels) */}
                    {isExpanded && (
                      <div className="ml-2.5 space-y-1 border-l-2 border-[#C084FC] pl-2 py-0.5">
                        {pillar.children.map((child) => {
                          const subActive =
                            location.pathname === child.path ||
                            (child.path !== '/dashboard' && location.pathname.startsWith(`${child.path}/`));
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`flex items-center justify-between rounded-lg px-2 py-1 text-[10px] font-extrabold transition ${
                                subActive
                                  ? 'bg-[#5A00D6] text-white shadow-2xs'
                                  : 'bg-[#F6F0FF]/70 text-[#0A2B6D] hover:bg-[#EDE9FE]'
                              }`}
                            >
                              <span style={{ color: subActive ? '#FFFFFF' : '#0A2B6D' }}>
                                {child.label}
                              </span>
                              <ArrowRight
                                className={`h-2.5 w-2.5 shrink-0 ${
                                  subActive ? 'text-[#00C6FF]' : 'text-[#5A00D6]'
                                }`}
                              />
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            : modules.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const label = navLabel(item);
                const subtitle = item.blurb || item.group || 'Open workspace';
                const headerBg = getHeaderView(idx);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={`${label} — ${subtitle}`}
                    className={`group flex flex-col gap-[3px] rounded-xl border-2 bg-[#0A2B6D] p-[3px] transition-all duration-200 focus-visible:outline-none ${
                      active
                        ? 'border-[#5A00D6] shadow-md ring-2 ring-[#5A00D6]/25 ring-offset-1'
                        : 'border-[#0A2B6D] hover:-translate-y-0.5 hover:border-[#0072FF] hover:shadow-md'
                    }`}
                  >
                    <div className="flex flex-1 flex-col overflow-hidden rounded-[8px] bg-white">
                      <div
                        className="flex min-h-[32px] items-center justify-between gap-1 px-1.5 py-1 text-white"
                        style={{ background: headerBg }}
                      >
                        <div className="flex min-w-0 items-center gap-1">
                          <Icon className="h-3 w-3 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                          <span
                            className="min-w-0 text-[9.5px] font-extrabold leading-[11px] tracking-tight text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {label}
                          </span>
                        </div>
                        <span
                          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                            active ? 'bg-[#00C6FF]' : 'bg-white/75'
                          }`}
                        />
                      </div>

                      <div className="flex min-h-[30px] flex-1 items-center justify-between gap-1 border-t border-[#0A2B6D]/10 bg-white px-1.5 py-1">
                        <span className="min-w-0 flex-1 break-words text-[9.5px] font-bold leading-[12px] text-[#0A2B6D]/85">
                          {subtitle}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 shrink-0 text-[#0072FF]" />
                      </div>
                    </div>
                  </Link>
                );
              })}
        </nav>

        {/* Minimal Sign-Out Action */}
        {onLogout && (
          <div className="shrink-0 border-t border-slate-100 p-2">
            <button
              type="button"
              onClick={onLogout}
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10.5px] font-extrabold text-[#0A2B6D] transition hover:border-[#0072FF]/50 hover:bg-[#F5F0FF] hover:text-[#5A00D6]"
            >
              <LogOut className="h-3 w-3 text-[#FF2E9A]" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}