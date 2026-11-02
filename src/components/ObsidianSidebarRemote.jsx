import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import {
  LogOut, ArrowRight, ChevronDown, ChevronRight, LayoutDashboard, ClipboardList,
  Users, ShieldCheck, ShieldAlert, FolderOpen, Megaphone,
  BarChart3, Cpu, Settings,
} from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS =
  'radial-gradient(circle at 50% 30%, rgba(0, 198, 255, 0.36) 0%, #0072FF 40%, #0A2B6D 84%, #061539 100%)';

const APP_DESIGN_ICON_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

// Permanent 13-Group Architectural Map (Single Source of Truth, Zero Duplicates)
export const PRIMARY_11_OS_NAV = [
  {
    id: 'dashboard-executive',
    label: '1. Dashboard & Executive Command',
    sub: 'Dashboard, Operations, Analytics, Suggestions & AI',
    path: '/dashboard',
    icon: LayoutDashboard,
    status: 'LIVE',
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
    status: 'READY',
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
    status: 'LIVE',
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
    status: 'GUARDED',
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
    status: 'VERIFIED',
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
    status: 'READY',
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
    status: 'READY',
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
    status: 'READY',
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
    status: 'LIVE',
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
    status: 'VERIFIED',
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
    status: 'SYNCED',
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
    status: 'READY',
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
    status: 'ONLINE',
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
    <div
      className="preserve-island-theme flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden p-2 select-none"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-2xl">
        {/* Top Blue -> Purple -> Pink Gradient Strip */}
        <div className="h-1.5 w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* Top Logo Area on Landing-Page Dashboard Blue with White Boxes & App-Design-Colour Borders */}
        <div
          className="flex shrink-0 flex-col items-center border-b border-white/25 px-2 py-2 text-center shadow-sm"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          <BrandLogoLockup size="xs" theme="light" />

          {/* Mode Switcher: All-White Buttons with App-Design-Colour Borders on Blue */}
          <div className="mt-1.5 grid w-full grid-cols-2 gap-1.5">
            <div className="rounded-full p-[1.5px]" style={{ background: BRAND_GRADIENT }}>
              <button
                type="button"
                onClick={() => setNavMode('os11')}
                className={`min-h-[24px] w-full rounded-full bg-white py-0.5 text-[8.5px] font-extrabold transition-all ${
                  navMode === 'os11'
                    ? 'shadow-[0_0_12px_rgba(0,198,255,0.75)]'
                    : 'opacity-90 hover:opacity-100'
                }`}
                style={{ color: navMode === 'os11' ? '#5A00D6' : '#0A2B6D' }}
              >
                ◉ 13 Command Pods
              </button>
            </div>
            <div className="rounded-full p-[1.5px]" style={{ background: BRAND_GRADIENT }}>
              <button
                type="button"
                onClick={() => setNavMode('all')}
                className={`min-h-[24px] w-full rounded-full bg-white py-0.5 text-[8.5px] font-extrabold transition-all ${
                  navMode === 'all'
                    ? 'shadow-[0_0_12px_rgba(255,46,154,0.75)]'
                    : 'opacity-90 hover:opacity-100'
                }`}
                style={{ color: navMode === 'all' ? '#FF2E9A' : '#0A2B6D' }}
              >
                ◉ All 46 Pods
              </button>
            </div>
          </div>
        </div>

        {/* 50% Compact Circular Control-Pod Navigation List — All-White Buttons with App-Design-Colour Borders & Icons */}
        <nav
          aria-label="Page navigation"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 space-y-1.5"
        >
          {navMode === 'os11'
            ? PRIMARY_11_OS_NAV.map((pillar, pIdx) => {
                const Icon = pillar.icon;
                const iconColor = APP_DESIGN_ICON_COLOURS[pIdx % APP_DESIGN_ICON_COLOURS.length];
                const pillarActive =
                  isActive(pillar.path) ||
                  pillar.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`));
                const isExpanded = expandedPillar === pillar.id || pillarActive;

                return (
                  <div key={pillar.id} className="space-y-1">
                    {/* All-White Pod Button with App-Design-Colour Border & App-Coloured Icon */}
                    <div
                      className={`group rounded-2xl p-[2px] transition-all duration-200 ${
                        pillarActive
                          ? 'shadow-[0_0_14px_rgba(0,198,255,0.75)] scale-[1.01]'
                          : 'hover:shadow-[0_0_10px_rgba(161,0,255,0.5)]'
                      }`}
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <div className="flex flex-col justify-between overflow-hidden rounded-[14px] bg-white px-2 py-1">
                        <div className="flex items-center justify-between gap-1">
                          <Link
                            to={pillar.path}
                            onClick={() => setExpandedPillar(pillar.id)}
                            className="flex min-w-0 flex-1 items-center gap-1.5"
                          >
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F0FF]"
                              style={{ border: `1.5px solid ${iconColor}` }}
                            >
                              <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                            </span>
                            <span
                              className="min-w-0 text-[9px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]"
                              style={{ color: '#0A2B6D' }}
                            >
                              {pillar.label}
                            </span>
                          </Link>

                          <div className="flex shrink-0 items-center gap-0.5">
                            <span
                              className="inline-flex items-center gap-0.5 rounded-full border px-1 py-0 text-[6.5px] font-black uppercase"
                              style={{
                                borderColor: iconColor,
                                color: pillarActive ? '#5A00D6' : '#0A2B6D',
                                backgroundColor: '#F5F0FF',
                              }}
                            >
                              {pillarActive ? 'ON' : pillar.status}
                            </span>

                            <button
                              type="button"
                              aria-label={`Toggle ${pillar.label}`}
                              onClick={() =>
                                setExpandedPillar((prev) => (prev === pillar.id ? '' : pillar.id))
                              }
                              className="rounded p-0.5 text-[#0A2B6D] hover:bg-slate-100"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-3 w-3" style={{ color: iconColor }} />
                              ) : (
                                <ChevronRight className="h-3 w-3" style={{ color: iconColor }} />
                              )}
                            </button>
                          </div>
                        </div>

                        <Link
                          to={pillar.path}
                          onClick={() => setExpandedPillar(pillar.id)}
                          className="mt-0.5 flex items-center justify-between gap-1 border-t border-[#C084FC]/35 pt-0.5"
                        >
                          <span className="text-[8px] font-bold leading-tight text-[#5A00D6]" style={{ color: '#5A00D6' }}>
                            {pillar.sub}
                          </span>
                          <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                        </Link>
                      </div>
                    </div>

                    {/* Level 2 Sub-Navigation All-White Circular Pill Pods */}
                    {isExpanded && (
                      <div className="ml-1.5 space-y-1 border-l-2 border-[#00C6FF] pl-1.5 py-0.5">
                        {pillar.children.map((child) => {
                          const subActive =
                            location.pathname === child.path ||
                            (child.path !== '/dashboard' && location.pathname.startsWith(`${child.path}/`));
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className="block rounded-full p-[1.5px] transition-all"
                              style={{ background: BRAND_GRADIENT }}
                            >
                              <span
                                className={`flex min-h-[24px] items-center justify-between rounded-full bg-white px-2 py-0.5 text-[8.5px] font-extrabold ${
                                  subActive ? 'bg-[#F5F0FF]' : ''
                                }`}
                              >
                                <span className="flex items-center gap-1 min-w-0">
                                  <span
                                    className="text-[8px] leading-none shrink-0"
                                    style={{ color: subActive ? '#FF2E9A' : iconColor }}
                                  >
                                    ◉
                                  </span>
                                  <span className="leading-tight" style={{ color: '#0A2B6D' }}>
                                    {child.label}
                                  </span>
                                </span>
                                <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            : modules.map((item, mIdx) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const label = navLabel(item);
                const subtitle = item.blurb || item.group || 'Open workspace';
                const iconColor = APP_DESIGN_ICON_COLOURS[mIdx % APP_DESIGN_ICON_COLOURS.length];

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={`${label} — ${subtitle}`}
                    className={`group block rounded-2xl p-[2px] transition-all duration-200 focus-visible:outline-none ${
                      active
                        ? 'shadow-[0_0_14px_rgba(0,198,255,0.75)] scale-[1.01]'
                        : 'hover:-translate-y-0.5 hover:shadow-[0_0_10px_rgba(161,0,255,0.45)]'
                    }`}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <div className="flex flex-col justify-between overflow-hidden rounded-[14px] bg-white px-2 py-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F5F0FF]"
                            style={{ border: `1.5px solid ${iconColor}` }}
                          >
                            <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                          </span>
                          <span
                            className="min-w-0 text-[9px] font-extrabold leading-tight tracking-tight text-[#0A2B6D]"
                            style={{ color: '#0A2B6D' }}
                          >
                            ◉ {label}
                          </span>
                        </div>
                        <span
                          className="inline-flex items-center gap-0.5 rounded-full border px-1 py-0 text-[6.5px] font-black uppercase"
                          style={{ borderColor: iconColor, color: active ? '#FF2E9A' : '#5A00D6' }}
                        >
                          {active ? 'ON' : 'LIVE'}
                        </span>
                      </div>

                      <div className="mt-0.5 flex items-center justify-between gap-1 border-t border-[#C084FC]/35 pt-0.5">
                        <span className="min-w-0 flex-1 break-words text-[8px] font-bold leading-tight text-[#5A00D6]" style={{ color: '#5A00D6' }}>
                          {subtitle}
                        </span>
                        <ArrowRight className="h-2.5 w-2.5 shrink-0" style={{ color: iconColor }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
        </nav>

        {/* Minimal Sign-Out Action */}
        {onLogout && (
          <div className="shrink-0 border-t border-white/15 bg-white/10 p-2 backdrop-blur-md">
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-[34px] w-full items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white px-3 py-1 text-[10px] font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-[#F5F0FF]"
            >
              <LogOut className="h-3 w-3 text-[#FF2E9A]" />
              <span style={{ color: '#0A2B6D' }}>Sign out</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}