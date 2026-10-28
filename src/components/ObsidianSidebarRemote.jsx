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

// Master Specification: 11 Primary Navigation Pillars (Max 2 Navigation Levels, Zero Duplicates)
export const PRIMARY_11_OS_NAV = [
  {
    id: 'home',
    label: '1. Home',
    sub: 'Command Centre & Digital Twin',
    path: '/dashboard',
    icon: LayoutDashboard,
    children: [
      { label: 'Home Command Centre', path: '/dashboard' },
      { label: 'Daily Briefing', path: '/briefing' },
      { label: 'Review Due Board', path: '/review-due' },
    ],
  },
  {
    id: 'my-work',
    label: '2. My Work',
    sub: 'Tasks, Shifts, Goals & Profile',
    path: '/my-profile',
    icon: ClipboardList,
    children: [
      { label: 'My Profile & Work Hub', path: '/my-profile' },
      { label: 'Task Dashboard & Shared To-Do', path: '/tasks' },
      { label: 'Frontline Rapid & Finish Shift', path: '/frontline-hub' },
      { label: 'My Payroll & Payslips', path: '/my-payroll' },
    ],
  },
  {
    id: 'people',
    label: '3. People',
    sub: 'Employee 360° & Participant 360°',
    path: '/our-employees',
    icon: Users,
    children: [
      { label: 'Employee 360° Profiles', path: '/our-employees' },
      { label: 'Participant 360° Profiles', path: '/our-participants' },
      { label: 'Intake & Onboarding Centre', path: '/intake' },
      { label: 'HR Hub & Volunteering', path: '/hr' },
      { label: 'Training & Skills Matrix', path: '/training' },
      { label: 'Goal Progress & Outcomes', path: '/goals' },
      { label: 'Recognition & Certificates', path: '/certificates' },
    ],
  },
  {
    id: 'operations',
    label: '4. Operations',
    sub: 'Rostering, Fleet, Assets & Suppliers',
    path: '/rostering',
    icon: CalendarClock,
    children: [
      { label: 'Rostering & Shift Management', path: '/rostering' },
      { label: 'Workforce Presence & Roll Call', path: '/workforce-presence' },
      { label: 'Programs & Events', path: '/programs' },
      { label: 'Projects Hub', path: '/projects' },
      { label: 'Assets & Fleet Management', path: '/assets' },
      { label: 'Procurement & Supplier 360°', path: '/procurement' },
      { label: 'Emergency & Business Continuity', path: '/emergency-response' },
    ],
  },
  {
    id: 'compliance-quality',
    label: '5. Compliance & Quality',
    sub: 'NDIS, Aged Care, Audits & CAPA',
    path: '/compliance',
    icon: ShieldCheck,
    children: [
      { label: 'Compliance & Standard 360°', path: '/compliance' },
      { label: 'Live Auditor Portal (Audit 360°)', path: '/auditor-portal' },
      { label: 'Quality & Continuous Improvement', path: '/quality' },
      { label: 'Working Checklists & Assessments', path: '/checklists' },
      { label: 'NDIS Provider Portal', path: '/ndis-portal' },
      { label: 'NDIS Updates & Alerts', path: '/ndis-updates' },
    ],
  },
  {
    id: 'risks-incidents',
    label: '6. Risks & Incidents',
    sub: 'Risk 360°, Incident 360° & WHS',
    path: '/risks',
    icon: ShieldAlert,
    children: [
      { label: 'Risk 360° & 5×5 Matrix', path: '/risks' },
      { label: 'Incident 360° & 24h/5d Clinic', path: '/incidents' },
      { label: 'Feedback, Complaints & Surveys', path: '/feedback' },
      { label: 'Equipment Manuals & MSDS', path: '/equipment-manuals' },
    ],
  },
  {
    id: 'documents-evidence',
    label: '7. Documents & Evidence',
    sub: 'Document 360°, Vault & Safe',
    path: '/documents',
    icon: FolderOpen,
    children: [
      { label: 'Document Vault & Form Studio', path: '/documents' },
      { label: 'Company Safe Master Copies', path: '/company-safe' },
      { label: 'Universal Storage & Export Hub', path: '/universal-storage' },
      { label: '45 Master Registers Hub', path: '/registers' },
    ],
  },
  {
    id: 'communications',
    label: '8. Communications',
    sub: 'Email, Notes, Calls & Meetings',
    path: '/communications',
    icon: Megaphone,
    children: [
      { label: 'Communication Centre', path: '/communications' },
      { label: 'Meeting Centre & Minutes', path: '/meetings' },
      { label: 'Community & Referral Hub', path: '/community-council' },
      { label: 'Visual & Accessible Boards', path: '/visual-boards' },
      { label: 'CRM & Leads Pipeline', path: '/crm' },
    ],
  },
  {
    id: 'reports-analytics',
    label: '9. Reports & Analytics',
    sub: 'KPIs, Heatmaps, Claims & Finance',
    path: '/analytics',
    icon: BarChart3,
    children: [
      { label: 'Enterprise Analytics & KPIs', path: '/analytics' },
      { label: 'Incident & Safety Analytics', path: '/incident-analytics' },
      { label: 'Invoicing & NDIS Claims', path: '/invoicing' },
      { label: 'Quotes & Service Estimates', path: '/quotes' },
      { label: 'Receipts & Reimbursements', path: '/receipts' },
    ],
  },
  {
    id: 'executive-centre',
    label: '10. Executive Centre',
    sub: 'Digital Twin, Board & AI Briefings',
    path: '/operations-centre',
    icon: Cpu,
    children: [
      { label: 'Executive Operations Centre', path: '/operations-centre' },
      { label: 'Universal Record Intelligence', path: '/record-intelligence' },
      { label: 'User Success & Evidence Hub', path: '/user-success' },
      { label: 'AI Copilot Studio', path: '/assistant' },
    ],
  },
  {
    id: 'administration',
    label: '11. Administration',
    sub: 'Users, Roles, Security & Guides',
    path: '/users',
    icon: Settings,
    children: [
      { label: 'Users, Roles & Permissions', path: '/users' },
      { label: 'Key Personnel & Delegations', path: '/key-contacts' },
      { label: 'Help & System Health', path: '/help' },
      { label: 'User Guides & Manuals', path: '/user-guides' },
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
  const [navMode, setNavMode] = useState('os11'); // 'os11' (11 Primary OS Pillars) | 'all' (All Modules)
  const [expandedPillar, setExpandedPillar] = useState('home');

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
              11 Primary Pillars
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