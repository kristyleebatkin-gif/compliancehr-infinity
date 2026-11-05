import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import {
  LogOut, ArrowRight, LayoutDashboard, ClipboardList,
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

export const FOCUSED_5_PILLAR_NAV = [
  {
    id: 'pillar-today',
    label: "1. Today's Command",
    sub: 'Dashboard, Operations, Analytics, Briefing, Tasks & AI',
    path: '/dashboard',
    icon: LayoutDashboard,
    status: 'LIVE',
    children: [
      { label: 'Dashboard', path: '/dashboard', sub: 'Audit Ready Today & Executive KPIs' },
      { label: 'Operations Centre', path: '/operations-centre', sub: 'Master operations & control deck' },
      { label: 'Business Analytics', path: '/analytics', sub: 'Cross-module trends & reports' },
      { label: 'Daily Briefing', path: '/briefing', sub: 'Morning operational briefing' },
      { label: 'Tasks', path: '/tasks', sub: 'Shared to-do & sign-off board' },
      { label: 'Suggestions Hub', path: '/suggestions', sub: 'Continuous improvement ideas' },
      { label: 'AI Assistant', path: '/assistant', sub: 'Compliance & HR intelligence copilot' },
    ],
  },
  {
    id: 'pillar-people',
    label: '2. People & Care',
    sub: 'Participants, Intake, Goals, Roster, Comms & Community',
    path: '/our-participants',
    icon: Users,
    status: 'READY',
    children: [
      { label: 'Participant Profiles', path: '/our-participants', sub: '360° participant care folders' },
      { label: 'Intake Centre', path: '/intake', sub: 'Participant & staff onboarding' },
      { label: 'Rostering', path: '/rostering', sub: 'Shifts, clearances & coverage' },
      { label: 'Communication Centre', path: '/communications', sub: 'Shift notes & team messages' },
      { label: 'Goals', path: '/goals', sub: 'Participant & staff goal tracking' },
      { label: 'Visual Boards', path: '/visual-boards', sub: 'Accessible visual routines & AAC' },
      { label: 'Programs & Events', path: '/programs', sub: 'Community programs & calendar' },
      { label: 'Frontline Rapid Hub', path: '/frontline-hub', sub: '60-second mobile field actions' },
      { label: 'CRM & Leads', path: '/crm', sub: 'Enquiries, leads & partnerships' },
      { label: 'Referrals', path: '/referrals', sub: 'Inbound & outbound referrals' },
      { label: 'Community Council Hub', path: '/community-council', sub: 'Local council programs & events' },
    ],
  },
  {
    id: 'pillar-workforce',
    label: '3. Workforce & HR',
    sub: 'Employees, Clearances, Training, HR, Presence & Users',
    path: '/our-employees',
    icon: ClipboardList,
    status: 'READY',
    children: [
      { label: 'My Profile', path: '/my-profile', sub: 'Personal profile, work & docs' },
      { label: 'Employee Profiles', path: '/our-employees', sub: '360° staff directory & files' },
      { label: 'HR Hub', path: '/hr', sub: 'Contracts, appraisals & payroll' },
      { label: 'Training Centre', path: '/training', sub: 'LMS courses, quizzes & matrix' },
      { label: 'Certificates', path: '/certificates', sub: 'Credentials & expiry alerts' },
      { label: 'Workforce Presence Centre', path: '/workforce-presence', sub: 'Live sign-in & roll call' },
      { label: 'Volunteering & Placements', path: '/volunteers', sub: 'Volunteer screening & placements' },
      { label: 'Key Personnel Contacts', path: '/key-contacts', sub: 'Key personnel & emergency directory' },
      { label: 'Meetings', path: '/meetings', sub: 'Agendas, minutes & action items' },
      { label: 'Users & Permissions', path: '/users', sub: 'Role matrix & access control' },
    ],
  },
  {
    id: 'pillar-safety',
    label: '4. Safety, Risk & Quality',
    sub: 'Incidents, Risks, Continuous Improvement & Emergency',
    path: '/incidents',
    icon: ShieldAlert,
    status: 'GUARDED',
    children: [
      { label: 'Incident Clinic', path: '/incidents', sub: 'NDIS 24h/5d & SIRS triage' },
      { label: 'Incident Analytics', path: '/incident-analytics', sub: 'Root-cause & trend intelligence' },
      { label: 'Risk Reporting', path: '/risks', sub: 'Risk register, hazards & Take-5' },
      { label: 'Quality & Improvement', path: '/quality', sub: 'Closed-loop CAPA register' },
      { label: 'Emergency Response', path: '/emergency-response', sub: 'Drills, plans & roll call' },
      { label: 'Equipment Manuals & MSDS', path: '/equipment-manuals', sub: 'Safety data sheets & manuals' },
      { label: 'Feedback & Surveys', path: '/feedback', sub: 'Complaints, compliments & surveys' },
    ],
  },
  {
    id: 'pillar-audit',
    label: '5. Audit, Governance & Finance',
    sub: 'Compliance, Vault, Safe, Registers, NDIS & Finance',
    path: '/compliance',
    icon: ShieldCheck,
    status: 'VERIFIED',
    children: [
      { label: 'Compliance Centre', path: '/compliance', sub: '356 audit checks & readiness' },
      { label: 'Auditor Portal', path: '/auditor-portal', sub: 'Consent-verified auditor view' },
      { label: 'Document Vault', path: '/documents', sub: 'Controlled policies & evidence' },
      { label: 'Company Safe', path: '/company-safe', sub: 'Executive vault & credentials' },
      { label: 'Governance Layer', path: '/governance', sub: 'Delegations, lifecycle & board packs' },
      { label: 'Universal Register Hub', path: '/registers', sub: '45 connected master registers' },
      { label: 'Checklists', path: '/checklists', sub: 'Operational & audit checklists' },
      { label: 'Review Due Board', path: '/review-due', sub: 'Upcoming scheduled reviews' },
      { label: 'Universal Storage & Export Hub', path: '/universal-storage', sub: 'Retention, backup & PDF packs' },
      { label: 'Evidence & User Success Hub', path: '/user-success', sub: 'Evidence-first verification' },
      { label: 'Record Intelligence & Routing', path: '/record-intelligence', sub: 'Automated cross-module routing' },
      { label: 'NDIS Provider Portal', path: '/ndis-portal', sub: 'Registration groups & KPIs' },
      { label: 'NDIS Updates & News', path: '/ndis-updates', sub: 'Price guide & regulatory alerts' },
      { label: 'Invoicing & Finance', path: '/invoicing', sub: 'NDIS claims & financial controls' },
      { label: 'Quote Centre', path: '/quotes', sub: 'Service quotes & agreements' },
      { label: 'Receipt Hub', path: '/receipts', sub: 'Expense scanner & reimbursements' },
      { label: 'Procurement', path: '/procurement', sub: 'Purchase orders & suppliers' },
      { label: 'Asset Management', path: '/assets', sub: 'Fleet, equipment & maintenance' },
      { label: 'Projects Hub', path: '/projects', sub: 'Strategic projects & milestones' },
      { label: 'Help Centre', path: '/help', sub: 'AI troubleshooter & support tickets' },
      { label: 'User Guides', path: '/user-guides', sub: 'Step-by-step platform manuals' },
    ],
  },
];

export default function ObsidianSidebarRemote({
  visiblePrimary,
  isActive: isActiveProp,
  navLabel: navLabelProp,
  onLogout,
}) {
  const location = useLocation();
  const [navMode, setNavMode] = useState(() => localStorage.getItem('chr-active-remote-mode') || 'os11'); // 'pillars5' | 'os11' | 'all'
  const [selectedPillarId, setSelectedPillarId] = useState(
    () => localStorage.getItem('chr-active-remote-pillar') || 'dashboard-executive'
  );

  React.useEffect(() => {
    const list = navMode === 'pillars5' ? FOCUSED_5_PILLAR_NAV : PRIMARY_11_OS_NAV;
    const match = list.find(
      (p) =>
        location.pathname === p.path ||
        p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`))
    );
    if (match) {
      setSelectedPillarId(match.id);
      localStorage.setItem('chr-active-remote-pillar', match.id);
    }
  }, [location.pathname, navMode]);

  React.useEffect(() => {
    const onPillarSync = (e) => {
      if (e?.detail?.pillarId) setSelectedPillarId(e.detail.pillarId);
      if (e?.detail?.navMode) setNavMode(e.detail.navMode);
    };
    window.addEventListener('chr-remote-pillar-select', onPillarSync);
    return () => window.removeEventListener('chr-remote-pillar-select', onPillarSync);
  }, []);

  const scrollWorkspaceToTop = () => {
    const mainEl = document.getElementById('main-workspace-content');
    if (mainEl && typeof mainEl.scrollTo === 'function') {
      mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined' && typeof window.scrollTo === 'function') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openMajorSectionInMainView = (pillar, modeOverride) => {
    const activeMode = modeOverride || navMode;
    setSelectedPillarId(pillar.id);
    localStorage.setItem('chr-active-remote-pillar', pillar.id);
    localStorage.setItem('chr-active-remote-mode', activeMode);
    window.dispatchEvent(
      new CustomEvent('chr-remote-pillar-select', {
        detail: { pillarId: pillar.id, navMode: activeMode, pillar },
      })
    );
    const remoteInMain = document.getElementById('main-view-navigator-remote');
    if (remoteInMain) {
      remoteInMain.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      scrollWorkspaceToTop();
    }
  };

  const sourceList =
    Array.isArray(visiblePrimary) && visiblePrimary.length > 0
      ? visiblePrimary
      : MODULE_DIRECTORY;

  const isActive =
    isActiveProp ||
    ((path) =>
      location.pathname === path ||
      (path !== '/' && location.pathname.startsWith(`${path}/`)));

  const navLabel = navLabelProp || ((item) => item.label);

  const modules = sourceList.filter(
    (item) =>
      !(item.key === 'staff-progress' && sourceList.some((entry) => entry.key === 'staff'))
  );

  return (
    <div
      className="preserve-island-theme flex h-full w-full min-w-0 min-h-0 flex-col overflow-hidden select-none"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      <section
        className="flex h-full min-h-0 flex-col overflow-hidden shadow-2xl"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        {/* Top App-Design Gradient Strip — aligned flush with main header */}
        <div className="h-1.5 w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* TOP WHITE SECTION OF REMOTE — exact same 190px height & alignment as the top white section of the main area */}
        <div className="flex h-[190px] shrink-0 flex-col items-center justify-between bg-white px-1.5 py-2 text-center">
          <Link
            to="/dashboard"
            aria-label="ComplianceHR Infinity Home"
            className="flex w-full flex-1 items-center justify-center"
          >
            <BrandLogoLockup size="xs" showSlogan className="w-full" />
          </Link>

          {/* Remote Control Mode Switcher (5 Pillars | 13 Channels | All 46) */}
          <div
            className="mt-1 grid w-full shrink-0 grid-cols-3 gap-1 rounded-xl p-[2px]"
            style={{ background: BRAND_GRADIENT }}
          >
            <button
              type="button"
              onClick={() => {
                setNavMode('pillars5');
                openMajorSectionInMainView(FOCUSED_5_PILLAR_NAV[0], 'pillars5');
              }}
              className={`min-h-[24px] rounded-[10px] py-0.5 text-[8.5px] font-extrabold transition-all ${
                navMode === 'pillars5'
                  ? 'bg-[#0A2B6D] text-white shadow-[0_0_12px_rgba(0,198,255,0.6)]'
                  : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
              style={{ color: navMode === 'pillars5' ? '#FFFFFF' : '#0A2B6D' }}
            >
              ◉ 5 Pillars
            </button>
            <button
              type="button"
              onClick={() => {
                setNavMode('os11');
                openMajorSectionInMainView(PRIMARY_11_OS_NAV[0], 'os11');
              }}
              className={`min-h-[24px] rounded-[10px] py-0.5 text-[8.5px] font-extrabold transition-all ${
                navMode === 'os11'
                  ? 'bg-[#0A2B6D] text-white shadow-[0_0_12px_rgba(0,198,255,0.6)]'
                  : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
              style={{ color: navMode === 'os11' ? '#FFFFFF' : '#0A2B6D' }}
            >
              ◉ 13 Channels
            </button>
            <button
              type="button"
              onClick={() => {
                setNavMode('all');
                localStorage.setItem('chr-active-remote-mode', 'all');
                window.dispatchEvent(
                  new CustomEvent('chr-remote-pillar-select', {
                    detail: { pillarId: selectedPillarId, navMode: 'all' },
                  })
                );
              }}
              className={`min-h-[24px] rounded-[10px] py-0.5 text-[8.5px] font-extrabold transition-all ${
                navMode === 'all'
                  ? 'bg-[#0A2B6D] text-white shadow-[0_0_12px_rgba(255,46,154,0.6)]'
                  : 'bg-white text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
              style={{ color: navMode === 'all' ? '#FFFFFF' : '#0A2B6D' }}
            >
              ◉ All 46
            </button>
          </div>
        </div>

        {/* Continuous App-Design Gradient Divider Line aligned with main header */}
        <div className="h-[3px] w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* BOTTOM 3/4 DARK BLUE (Same Dark Blue as QuickAppBar / Command Centre) */}
        <nav
          aria-label="Page navigation"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2.5 space-y-2"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          {navMode === 'os11' || navMode === 'pillars5'
            ? (navMode === 'pillars5' ? FOCUSED_5_PILLAR_NAV : PRIMARY_11_OS_NAV).map((pillar, pIdx) => {
                const Icon = pillar.icon;
                const symColor = APP_DESIGN_COLOURS[pIdx % APP_DESIGN_COLOURS.length];
                const pillarActive =
                  selectedPillarId === pillar.id ||
                  isActive(pillar.path) ||
                  pillar.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`));

                return (
                  <div key={pillar.id}>
                    {/* Illuminated Modular Remote Button: Opens Section in Main View on Navigator Remote */}
                    <button
                      type="button"
                      onClick={() => openMajorSectionInMainView(pillar)}
                      aria-pressed={selectedPillarId === pillar.id}
                      className={`group block w-full text-left rounded-2xl p-[2px] transition-all duration-200 focus-visible:outline-none ${
                        pillarActive
                          ? 'shadow-[0_0_20px_rgba(0,198,255,0.85)] scale-[1.01]'
                          : 'shadow-[0_0_10px_rgba(90,0,214,0.35)] hover:-translate-y-0.5 hover:shadow-[0_0_16px_rgba(0,198,255,0.65)]'
                      }`}
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <div
                        className="flex min-h-[68px] flex-col justify-between overflow-hidden rounded-[14px]"
                        style={{ background: DARK_NAVY_CHASSIS }}
                      >
                        {/* Top 1/4 White Title Bar with App-Design-Colour Symbol */}
                        <div className="flex min-h-[34px] items-center justify-between gap-1.5 bg-white px-2.5 py-1">
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
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
                          </div>

                          {/* Illuminated LED Status Pill */}
                          <span
                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0.5 text-[7.5px] font-black uppercase tracking-wider ${
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
                            {pillarActive ? 'IN MAIN VIEW' : pillar.status}
                          </span>
                        </div>

                        {/* Bottom 3/4 Dark Blue Body */}
                        <div className="flex items-center justify-between gap-1.5 px-2.5 py-1.5">
                          <span
                            className="text-[9px] font-bold leading-snug text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {pillar.sub}
                          </span>
                          <ArrowRight className="h-3 w-3 shrink-0 transition group-hover:translate-x-0.5" style={{ color: symColor }} />
                        </div>
                      </div>
                    </button>
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
                    onClick={scrollWorkspaceToTop}
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