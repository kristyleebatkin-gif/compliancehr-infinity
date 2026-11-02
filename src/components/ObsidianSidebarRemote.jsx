import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import {
  LogOut, ArrowRight, ChevronDown, ChevronRight, LayoutDashboard, ClipboardList,
  Users, ShieldCheck, ShieldAlert, FolderOpen, Megaphone,
  BarChart3, Cpu, Settings,
} from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)';

// Exact same dark blue as around the modular tiles in QuickAppBar / Command Centre
const DARK_NAVY_CHASSIS =
  'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)';

// App design colour palette for symbols and icons
const APP_DESIGN_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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
    label: '2. People, Intake & Profiles',
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
    label: '3. Communications & Workforce',
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
    label: '5. Compliance, Quality & Evidence',
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
    label: '6. Training & Capability',
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
    label: '9. CRM, Growth & Relationships',
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
    label: '12. Community & Support Services',
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
    label: '13. Help, Knowledge & Support',
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
      <section
        className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-2xl"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        {/* Top Blue -> Purple -> Pink Gradient Strip */}
        <div className="h-1.5 w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* TOP WHITE COMMAND HEADER: Brand Logo Lockup at Top of Nav Router Remote + Mode Switcher */}
        <div className="flex shrink-0 flex-col items-center bg-white px-2.5 py-2.5 text-center shadow-sm">
          <Link
            to="/dashboard"
            aria-label="ComplianceHR Infinity Home"
            className="flex w-full justify-center"
          >
            <BrandLogoLockup size="xs" showSlogan className="w-full" />
          </Link>

          {/* Remote Control Mode Switcher */}
          <div
            className="mt-2 grid w-full grid-cols-2 gap-1 rounded-xl p-[2px]"
            style={{ background: BRAND_GRADIENT }}
          >
            <button
              type="button"
              onClick={() => setNavMode('os11')}
              className={`min-h-[28px] rounded-[10px] py-1 text-[9.5px] font-extrabold transition-all ${
                navMode === 'os11'
                  ? 'bg-[#0A2B6D] text-white shadow-[0_0_12px_rgba(0,198,255,0.6)]'
                  : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
              style={{ color: navMode === 'os11' ? '#FFFFFF' : '#0A2B6D' }}
            >
              ◉ 13 Command Channels
            </button>
            <button
              type="button"
              onClick={() => setNavMode('all')}
              className={`min-h-[28px] rounded-[10px] py-1 text-[9.5px] font-extrabold transition-all ${
                navMode === 'all'
                  ? 'bg-[#0A2B6D] text-white shadow-[0_0_12px_rgba(255,46,154,0.6)]'
                  : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
              style={{ color: navMode === 'all' ? '#FFFFFF' : '#0A2B6D' }}
            >
              ◉ All 46 Modules
            </button>
          </div>
        </div>

        {/* BOTTOM 3/4 DARK BLUE (Same Dark Blue as QuickAppBar / Command Centre) */}
        <nav
          aria-label="Page navigation"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          {navMode === 'os11'
            ? PRIMARY_11_OS_NAV.map((pillar, pIdx) => {
                const Icon = pillar.icon;
                const symColor = APP_DESIGN_COLOURS[pIdx % APP_DESIGN_COLOURS.length];
                const pillarActive =
                  isActive(pillar.path) ||
                  pillar.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`));
                const isExpanded = expandedPillar === pillar.id || pillarActive;

                return (
                  <div key={pillar.id} className="space-y-1.5">
                    {/* Illuminated Modular Remote Button: Top 1/4 White + Bottom 3/4 Dark Blue */}
                    <div
                      className={`group rounded-2xl p-[2px] transition-all duration-200 ${
                        pillarActive
                          ? 'shadow-[0_0_20px_rgba(0,198,255,0.8)] scale-[1.01]'
                          : 'shadow-[0_0_10px_rgba(90,0,214,0.35)] hover:shadow-[0_0_16px_rgba(0,198,255,0.65)]'
                      }`}
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <div
                        className="flex min-h-[68px] flex-col justify-between overflow-hidden rounded-[14px]"
                        style={{ background: DARK_NAVY_CHASSIS }}
                      >
                        {/* Top 1/4 White Title Bar with App-Design-Colour Symbol */}
                        <div className="flex min-h-[34px] items-center justify-between gap-1.5 bg-white px-2.5 py-1">
                          <Link
                            to={pillar.path}
                            onClick={() => setExpandedPillar(pillar.id)}
                            className="flex min-w-0 flex-1 items-center gap-1.5"
                          >
                            <span
                              className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF] shadow-2xs"
                              style={{ border: `1.5px solid ${symColor}` }}
                            >
                              <Icon className="h-3 w-3 shrink-0" style={{ color: symColor }} />
                            </span>
                            <span
                              className="min-w-0 bg-clip-text text-[10.5px] font-extrabold leading-tight tracking-tight text-transparent"
                              style={{
                                backgroundImage:
                                  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                              }}
                            >
                              <span style={{ color: symColor }}>◉</span> {pillar.label}
                            </span>
                          </Link>

                          {/* Illuminated LED Status Pill */}
                          <div className="flex shrink-0 items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wider ${
                                pillarActive
                                  ? 'bg-[#0A2B6D] text-[#00C6FF]'
                                  : 'bg-[#F5F0FF] text-[#5A00D6]'
                              }`}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{
                                  backgroundColor: pillarActive ? '#00C6FF' : symColor,
                                  boxShadow: pillarActive
                                    ? '0 0 8px 2px #00C6FF'
                                    : `0 0 6px 1px ${symColor}`,
                                }}
                              />
                              {pillarActive ? 'ACTIVE' : pillar.status}
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
                                <ChevronDown className="h-3.5 w-3.5 text-[#5A00D6]" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-[#0A2B6D]" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Bottom 3/4 Dark Blue Body */}
                        <Link
                          to={pillar.path}
                          onClick={() => setExpandedPillar(pillar.id)}
                          className="flex items-center justify-between gap-1.5 px-2.5 py-1.5"
                        >
                          <span
                            className="text-[9px] font-bold leading-snug text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {pillar.sub}
                          </span>
                          <ArrowRight className="h-3 w-3 shrink-0 transition group-hover:translate-x-0.5" style={{ color: symColor }} />
                        </Link>
                      </div>
                    </div>

                    {/* Level 2 Page Modular Tiles: Each Page Tile Lights Up with Top 1/4 White + Bottom 3/4 Dark Blue & App Design Colour Symbols */}
                    {isExpanded && (
                      <div className="pl-2 space-y-1.5 py-0.5">
                        {pillar.children.map((child, cIdx) => {
                          const childColor = APP_DESIGN_COLOURS[(pIdx + cIdx + 1) % APP_DESIGN_COLOURS.length];
                          const subActive =
                            location.pathname === child.path ||
                            (child.path !== '/dashboard' && location.pathname.startsWith(`${child.path}/`));
                          return (
                            <Link
                              key={child.path}
                              to={child.path}
                              className={`group block rounded-2xl p-[2px] transition-all duration-200 ${
                                subActive
                                  ? 'shadow-[0_0_18px_rgba(0,198,255,0.8)] scale-[1.01]'
                                  : 'shadow-[0_0_10px_rgba(90,0,214,0.3)] hover:-translate-y-0.5 hover:shadow-[0_0_14px_rgba(0,198,255,0.65)]'
                              }`}
                              style={{ background: BRAND_GRADIENT }}
                            >
                              <div
                                className="flex min-h-[54px] flex-col justify-between overflow-hidden rounded-[14px]"
                                style={{ background: DARK_NAVY_CHASSIS }}
                              >
                                {/* Top 1/4 White Bar */}
                                <div className="flex min-h-[28px] items-center justify-between gap-1.5 bg-white px-2.5 py-0.5">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <span
                                      className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md bg-[#F5F0FF]"
                                      style={{ border: `1.5px solid ${childColor}` }}
                                    >
                                      <Icon className="h-2.5 w-2.5 shrink-0" style={{ color: childColor }} />
                                    </span>
                                    <span
                                      className="min-w-0 bg-clip-text text-[10px] font-extrabold leading-tight text-transparent"
                                      style={{
                                        backgroundImage:
                                          'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                                      }}
                                    >
                                      <span style={{ color: childColor }}>◉</span> {child.label}
                                    </span>
                                  </div>
                                  <span
                                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0 text-[7px] font-black uppercase ${
                                      subActive ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                                    }`}
                                  >
                                    <span
                                      className="h-1.5 w-1.5 rounded-full"
                                      style={{
                                        backgroundColor: subActive ? '#00C6FF' : childColor,
                                        boxShadow: subActive
                                          ? '0 0 8px 2px #00C6FF'
                                          : `0 0 5px 1px ${childColor}`,
                                      }}
                                    />
                                    {subActive ? 'ACTIVE' : 'LIVE'}
                                  </span>
                                </div>

                                {/* Bottom 3/4 Dark Blue Body */}
                                <div className="flex items-center justify-between gap-1.5 px-2.5 py-1">
                                  <span
                                    className="min-w-0 flex-1 text-[8.5px] font-bold leading-snug text-white"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    {child.sub || `Open ${child.label}`}
                                  </span>
                                  <ArrowRight className="h-2.5 w-2.5 shrink-0 transition group-hover:translate-x-0.5" style={{ color: childColor }} />
                                </div>
                              </div>
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
                const symColor = APP_DESIGN_COLOURS[mIdx % APP_DESIGN_COLOURS.length];
                const active = isActive(item.path);
                const label = navLabel(item);
                const subtitle = item.blurb || item.group || 'Open workspace';

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={`${label} — ${subtitle}`}
                    className={`group block rounded-2xl p-[2px] transition-all duration-200 focus-visible:outline-none ${
                      active
                        ? 'shadow-[0_0_20px_rgba(0,198,255,0.8)] scale-[1.01]'
                        : 'shadow-[0_0_10px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(0,198,255,0.65)]'
                    }`}
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <div
                      className="flex min-h-[62px] flex-col justify-between overflow-hidden rounded-[14px]"
                      style={{ background: DARK_NAVY_CHASSIS }}
                    >
                      {/* Top 1/4 White Title Background with App-Design-Colour Symbol */}
                      <div className="flex min-h-[32px] items-center justify-between gap-1.5 bg-white px-2.5 py-1">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span
                            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-[#F5F0FF] shadow-2xs"
                            style={{ border: `1.5px solid ${symColor}` }}
                          >
                            <Icon className="h-3 w-3 shrink-0" style={{ color: symColor }} />
                          </span>
                          <span
                            className="min-w-0 bg-clip-text text-[10.5px] font-extrabold leading-tight tracking-tight text-transparent"
                            style={{
                              backgroundImage:
                                'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)',
                            }}
                          >
                            <span style={{ color: symColor }}>◉</span> {label}
                          </span>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[7.5px] font-black uppercase ${
                            active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                          }`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: active ? '#00C6FF' : symColor,
                              boxShadow: active ? '0 0 8px 2px #00C6FF' : `0 0 5px 1px ${symColor}`,
                            }}
                          />
                          {active ? 'ACTIVE' : 'LIVE'}
                        </span>
                      </div>

                      {/* Bottom 3/4 Dark Blue Body */}
                      <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5">
                        <span
                          className="min-w-0 flex-1 break-words text-[9px] font-bold leading-snug text-white"
                          style={{ color: '#FFFFFF' }}
                        >
                          {subtitle}
                        </span>
                        <ArrowRight className="h-3 w-3 shrink-0 transition group-hover:translate-x-0.5" style={{ color: symColor }} />
                      </div>
                    </div>
                  </Link>
                );
              })}
        </nav>

        {/* Minimal Sign-Out Action */}
        {onLogout && (
          <div className="shrink-0 p-2" style={{ background: DARK_NAVY_CHASSIS }}>
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-[36px] w-full items-center justify-center gap-1.5 rounded-xl border border-[#0A2B6D] bg-white px-3 py-1.5 text-[10px] font-extrabold text-[#0A2B6D] shadow-sm transition hover:bg-[#F5F0FF]"
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