import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { useAuth } from '@/lib/AuthContext';
import {
  LogOut, ArrowRight, LayoutDashboard, ClipboardList,
  Users, ShieldCheck, ShieldAlert, FolderOpen, Megaphone,
  BarChart3, Cpu, Settings,
} from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 40%, #FF2E9A 100%)';

// Pure Black Chassis Theme
const DARK_NAVY_CHASSIS = '#000000';

// Strict repeating LED light sequence: Purple, Pink, Blue, Purple, Pink, Blue...
const LED_LIGHT_SEQUENCE = ['#A855F7', '#FF2E9A', '#0072FF'];
const APP_ICON_GRADIENTS = [
  'linear-gradient(135deg, #00C6FF 0%, #0072FF 55%, #5A00D6 100%)',
  'linear-gradient(135deg, #0072FF 0%, #5A00D6 52%, #FF2E9A 100%)',
  'linear-gradient(135deg, #5A00D6 0%, #A100FF 50%, #FF2E9A 100%)',
  'linear-gradient(135deg, #0A2B6D 0%, #0072FF 55%, #00C6FF 100%)',
  'linear-gradient(135deg, #FF2E9A 0%, #A100FF 52%, #0072FF 100%)',
];

// Permanent 13-Group Architectural Map (Single Source of Truth, Zero Duplicates)
export const PRIMARY_11_OS_NAV = [
  {
    id: 'dashboard-executive',
    label: '1. Communication',
    sub: 'Merged Communication, Dashboard, Executive & AI',
    path: '/dashboard',
    icon: Megaphone,
    status: 'LIVE',
    children: [
      { label: 'Operations Centre', path: '/operations-centre', sub: 'Master operations & control deck' },
      { label: 'Suggestions Hub', path: '/suggestions', sub: 'Continuous improvement ideas' },
      { label: 'Daily Briefing', path: '/briefing', sub: 'Morning operational briefing' },
      { label: 'AI Assistant', path: '/assistant', sub: '24/7 compliance & HR copilot' },
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
    sub: 'Rostering, Goals, Tasks, Meetings & Programs',
    path: '/rostering',
    icon: ClipboardList,
    status: 'LIVE',
    children: [
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
    sub: 'Compliance, Business Analytics, Auditor, Vault & Evidence',
    path: '/compliance',
    icon: ShieldCheck,
    status: 'VERIFIED',
    children: [
      { label: 'Compliance & Evidence', path: '/compliance', sub: 'Merged Compliance Centre, Business Analytics & 356 checks' },
      { label: 'Auditor Portal', path: '/auditor-portal', sub: 'Read-only external auditor view' },
      { label: 'Document Vault', path: '/documents', sub: 'Controlled policies & renewals' },
      { label: 'Company Safe', path: '/company-safe', sub: 'Executive vault & credentials' },
      { label: 'Remote Access & VPN', path: '/remote-access', sub: 'Zero-trust remote access without headaches' },
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
    sub: 'Help Centre & System Support',
    path: '/help',
    icon: Settings,
    status: 'ONLINE',
    children: [
      { label: 'Help Centre', path: '/help', sub: 'AI troubleshooter & support tickets' },
    ],
  },
];

export const FOCUSED_5_PILLAR_NAV = [
  {
    id: 'pillar-today',
    label: '1. Communication',
    sub: 'Merged Communication, Dashboard, Executive, Briefing & AI',
    path: '/dashboard',
    icon: Megaphone,
    status: 'LIVE',
    children: [
      { label: 'Operations Centre', path: '/operations-centre', sub: 'Master operations & control deck' },
      { label: 'Suggestions Hub', path: '/suggestions', sub: 'Continuous improvement ideas' },
      { label: 'Daily Briefing', path: '/briefing', sub: 'Morning operational briefing' },
      { label: 'AI Assistant', path: '/assistant', sub: 'Compliance & HR intelligence copilot' },
      { label: 'Tasks', path: '/tasks', sub: 'Shared to-do & sign-off board' },
    ],
  },
  {
    id: 'pillar-people',
    label: '2. People & Care',
    sub: 'Participants, Intake, Goals, Roster & Community',
    path: '/our-participants',
    icon: Users,
    status: 'READY',
    children: [
      { label: 'Participant Profiles', path: '/our-participants', sub: '360° participant care folders' },
      { label: 'Intake Centre', path: '/intake', sub: 'Participant & staff onboarding' },
      { label: 'Rostering', path: '/rostering', sub: 'Shifts, clearances & coverage' },
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
    sub: 'Compliance & Evidence, Business Analytics, Vault, Safe, NDIS & Finance',
    path: '/compliance',
    icon: ShieldCheck,
    status: 'VERIFIED',
    children: [
      { label: 'Compliance & Evidence', path: '/compliance', sub: 'Merged Compliance Centre, Business Analytics & 356 checks' },
      { label: 'Auditor Portal', path: '/auditor-portal', sub: 'Consent-verified auditor view' },
      { label: 'Document Vault', path: '/documents', sub: 'Controlled policies & evidence' },
      { label: 'Company Safe', path: '/company-safe', sub: 'Executive vault & credentials' },
      { label: 'Remote Access & VPN', path: '/remote-access', sub: 'Zero-trust remote access without headaches' },
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
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [navMode, setNavMode] = useState(() => localStorage.getItem('chr-active-remote-mode') || 'os11'); // 'pillars5' | 'os11' | 'all'
  const [selectedPillarId, setSelectedPillarId] = useState(
    () => localStorage.getItem('chr-active-remote-pillar') || 'dashboard-executive'
  );
  const prevPathnameRef = useRef(location.pathname);

  React.useEffect(() => {
    if (prevPathnameRef.current === location.pathname) return;
    prevPathnameRef.current = location.pathname;
    const list = navMode === 'pillars5' ? FOCUSED_5_PILLAR_NAV : PRIMARY_11_OS_NAV;
    const currentStillMatches = list.some(
      (p) =>
        p.id === selectedPillarId &&
        (location.pathname === p.path ||
          p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`)))
    );
    if (currentStillMatches) return;
    const match = list.find(
      (p) =>
        location.pathname === p.path ||
        p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`))
    );
    if (match) {
      setSelectedPillarId(match.id);
      localStorage.setItem('chr-active-remote-pillar', match.id);
    }
  }, [location.pathname, navMode, selectedPillarId]);

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

  const openMajorSectionInMainView = (pillar, modeOverride, shouldNavigate = true) => {
    const activeMode = modeOverride || navMode;
    setSelectedPillarId(pillar.id);
    localStorage.setItem('chr-active-remote-pillar', pillar.id);
    localStorage.setItem('chr-active-remote-mode', activeMode);
    window.dispatchEvent(
      new CustomEvent('chr-remote-pillar-select', {
        detail: { pillarId: pillar.id, navMode: activeMode, pillar },
      })
    );
    const canAutoRoute = location.pathname !== '/' || isAuthenticated;
    if (shouldNavigate && canAutoRoute && pillar?.path && location.pathname !== pillar.path) {
      navigate(pillar.path);
    }
    scrollWorkspaceToTop();
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

        {/* TOP BLACK SECTION OF REMOTE — aligned flush with the top black section above the dashboard */}
        <div className="flex h-[calc(210px+1cm)] shrink-0 flex-col items-center justify-between bg-black px-1.5 py-1.5 text-center">
          <Link
            to="/dashboard"
            aria-label="ComplianceHR Infinity Home"
            className="flex w-full flex-1 items-center justify-center"
          >
            <BrandLogoLockup size="xs" theme="dark" showSlogan className="w-full" />
          </Link>

          {/* Remote Control Mode Switcher (Aqua, Blue & Pink Buttons on Black) */}
          <div
            className="mt-1 grid w-full shrink-0 grid-cols-3 gap-1 rounded-lg p-[1.5px]"
            style={{ background: BRAND_GRADIENT }}
          >
            <button
              type="button"
              onClick={() => {
                setNavMode('pillars5');
                const match =
                  FOCUSED_5_PILLAR_NAV.find(
                    (p) =>
                      location.pathname === p.path ||
                      p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`))
                  ) || FOCUSED_5_PILLAR_NAV[0];
                openMajorSectionInMainView(match, 'pillars5', false);
              }}
              className={`min-h-[22px] rounded-[6px] py-0.5 text-[9px] font-extrabold transition-all ${
                navMode === 'pillars5' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#00C6FF',
                color: '#000000',
              }}
            >
              ◉ 5 Pillars
            </button>
            <button
              type="button"
              onClick={() => {
                setNavMode('os11');
                const match =
                  PRIMARY_11_OS_NAV.find(
                    (p) =>
                      location.pathname === p.path ||
                      p.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`))
                  ) || PRIMARY_11_OS_NAV[0];
                openMajorSectionInMainView(match, 'os11', false);
              }}
              className={`min-h-[22px] rounded-[6px] py-0.5 text-[9px] font-extrabold transition-all ${
                navMode === 'os11' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#0072FF',
                color: '#FFFFFF',
              }}
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
              className={`min-h-[22px] rounded-[6px] py-0.5 text-[9px] font-extrabold transition-all ${
                navMode === 'all' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#FF2E9A',
                color: '#FFFFFF',
              }}
            >
              ◉ All 46
            </button>
          </div>
        </div>

        {/* Continuous App-Design Gradient Divider Line aligned with main header */}
        <div className="h-[2px] w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* BOTTOM 3/4 BLACK REMOTE WITH AQUA SYMBOLS & PURPLE-PINK-BLUE REPEATING LED LIGHTS */}
        <nav
          aria-label="Page navigation"
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 space-y-1"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          {(() => {
            let ledCounter = 0;
            const nextLedColor = () => {
              const color = LED_LIGHT_SEQUENCE[ledCounter % LED_LIGHT_SEQUENCE.length];
              ledCounter += 1;
              return color;
            };

            if (navMode === 'os11' || navMode === 'pillars5') {
              const list = navMode === 'pillars5' ? FOCUSED_5_PILLAR_NAV : PRIMARY_11_OS_NAV;
              return list.map((pillar) => {
                const Icon = pillar.icon;
                const ledColor = nextLedColor();
                const pillarActive =
                  selectedPillarId === pillar.id ||
                  isActive(pillar.path) ||
                  pillar.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`));

                return (
                  <div key={pillar.id}>
                    {/* Section Header Button (42px Uniform): Black, Aqua, Blue & Pink Theme */}
                    <button
                      type="button"
                      onClick={() => openMajorSectionInMainView(pillar)}
                      aria-pressed={selectedPillarId === pillar.id}
                      className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                        pillarActive
                          ? 'shadow-[0_0_14px_rgba(0,198,255,0.85)]'
                          : 'shadow-[0_0_6px_rgba(0,114,255,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                      }`}
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <div
                        className="flex min-h-[42px] flex-col justify-between overflow-hidden rounded-[7px]"
                        style={{ background: '#000000' }}
                      >
                        <div className="flex min-h-[22px] items-center justify-between gap-1.5 bg-black px-2 py-0.5">
                          <div className="flex min-w-0 flex-1 items-center gap-1.5">
                            <span
                              className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-black"
                              style={{
                                border: '1.5px solid #00C6FF',
                                boxShadow: '0 0 6px rgba(0,198,255,0.55)',
                              }}
                            >
                              <Icon className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
                            </span>
                            <span
                              className="min-w-0 truncate text-[10.5px] font-black leading-tight tracking-tight"
                              style={{ color: '#00C6FF' }}
                            >
                              {pillar.label}
                            </span>
                          </div>

                          <span
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider"
                            style={{
                              color: '#FFFFFF',
                              border: `1px solid ${ledColor}`,
                              boxShadow: `0 0 8px ${ledColor}66`,
                            }}
                          >
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{
                                backgroundColor: ledColor,
                                boxShadow: `0 0 7px 2px ${ledColor}`,
                              }}
                            />
                            {pillarActive ? 'OPEN' : pillar.status}
                          </span>
                        </div>

                        <div className="flex min-h-[19px] items-center justify-between gap-1.5 border-t border-[#0072FF]/35 bg-[#050B16] px-2 py-0.5">
                          <span
                            className="truncate text-[8.5px] font-extrabold leading-tight"
                            style={{ color: '#FF2E9A' }}
                          >
                            {pillar.sub}
                          </span>
                          <ArrowRight
                            className="h-2.5 w-2.5 shrink-0 transition group-hover:translate-x-0.5"
                            style={{ color: '#00C6FF' }}
                          />
                        </div>
                      </div>
                    </button>

                    {/* In-Between Module Buttons Underneath Each Section */}
                    {pillar.children?.length > 0 && (
                      <div className="mt-1 space-y-1 pl-2 border-l-2 border-[#00C6FF]/70">
                        {pillar.children.map((child, cIdx) => {
                          const childLedColor = nextLedColor();
                          const matchedMod = MODULE_DIRECTORY.find((m) => m.path === child.path);
                          const ChildIcon = child.icon || matchedMod?.icon || Icon;
                          const childActive =
                            location.pathname === child.path ||
                            location.pathname.startsWith(`${child.path}/`);
                          return (
                            <Link
                              key={`${pillar.id}-${child.path}-${cIdx}`}
                              to={child.path}
                              onClick={scrollWorkspaceToTop}
                              className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                                childActive
                                  ? 'shadow-[0_0_14px_rgba(0,198,255,0.85)]'
                                  : 'shadow-[0_0_6px_rgba(0,114,255,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                              }`}
                              style={{ background: BRAND_GRADIENT }}
                            >
                              <div
                                className="flex min-h-[42px] flex-col justify-between overflow-hidden rounded-[7px]"
                                style={{ background: '#000000' }}
                              >
                                <div className="flex min-h-[22px] items-center justify-between gap-1.5 bg-black px-2 py-0.5">
                                  <div className="flex min-w-0 flex-1 items-center gap-1.5">
                                    <span
                                      className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-black"
                                      style={{
                                        border: '1.5px solid #00C6FF',
                                        boxShadow: '0 0 6px rgba(0,198,255,0.55)',
                                      }}
                                    >
                                      <ChildIcon className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
                                    </span>
                                    <span
                                      className="min-w-0 truncate text-[10.5px] font-black leading-tight tracking-tight"
                                      style={{ color: '#FFFFFF' }}
                                    >
                                      {child.label}
                                    </span>
                                  </div>
                                  <span
                                    className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider"
                                    style={{
                                      color: '#FFFFFF',
                                      border: `1px solid ${childLedColor}`,
                                      boxShadow: `0 0 8px ${childLedColor}66`,
                                    }}
                                  >
                                    <span
                                      className="h-2 w-2 rounded-full"
                                      style={{
                                        backgroundColor: childLedColor,
                                        boxShadow: `0 0 7px 2px ${childLedColor}`,
                                      }}
                                    />
                                    {childActive ? 'ACTIVE' : 'OPEN'}
                                  </span>
                                </div>
                                <div className="flex min-h-[19px] items-center justify-between gap-1.5 border-t border-[#0072FF]/35 bg-[#050B16] px-2 py-0.5">
                                  <span
                                    className="truncate text-[8.5px] font-extrabold leading-tight"
                                    style={{ color: '#38BDF8' }}
                                  >
                                    {child.sub || `Open ${child.label}`}
                                  </span>
                                  <ArrowRight
                                    className="h-2.5 w-2.5 shrink-0 transition group-hover:translate-x-0.5"
                                    style={{ color: '#00C6FF' }}
                                  />
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              });
            }

            return modules.map((item) => {
              const Icon = item.icon;
              const modLedColor = nextLedColor();
              const active = isActive(item.path);
              const label = navLabel(item);
              const subtitle = item.blurb || item.group || 'Open workspace';

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={scrollWorkspaceToTop}
                  title={`${label} — ${subtitle}`}
                  className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                    active
                      ? 'shadow-[0_0_14px_rgba(0,198,255,0.85)]'
                      : 'shadow-[0_0_6px_rgba(0,114,255,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                  }`}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <div
                    className="flex min-h-[42px] flex-col justify-between overflow-hidden rounded-[7px]"
                    style={{ background: '#000000' }}
                  >
                    <div className="flex min-h-[22px] items-center justify-between gap-1.5 bg-black px-2 py-0.5">
                      <div className="flex min-w-0 flex-1 items-center gap-1.5">
                        <span
                          className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-black"
                          style={{
                            border: '1.5px solid #00C6FF',
                            boxShadow: '0 0 6px rgba(0,198,255,0.55)',
                          }}
                        >
                          <Icon className="h-3 w-3 shrink-0" style={{ color: '#00C6FF' }} />
                        </span>
                        <span
                          className="min-w-0 truncate text-[10.5px] font-black leading-tight tracking-tight"
                          style={{ color: '#FFFFFF' }}
                        >
                          {label}
                        </span>
                      </div>
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-black px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider"
                        style={{
                          color: '#FFFFFF',
                          border: `1px solid ${modLedColor}`,
                          boxShadow: `0 0 8px ${modLedColor}66`,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{
                            backgroundColor: modLedColor,
                            boxShadow: `0 0 7px 2px ${modLedColor}`,
                          }}
                        />
                        {active ? 'ACTIVE' : 'OPEN'}
                      </span>
                    </div>

                    <div className="flex min-h-[19px] items-center justify-between gap-1.5 border-t border-[#0072FF]/35 bg-[#050B16] px-2 py-0.5">
                      <span
                        className="min-w-0 flex-1 truncate text-[8.5px] font-extrabold leading-tight"
                        style={{ color: '#38BDF8' }}
                      >
                        {subtitle}
                      </span>
                      <ArrowRight
                        className="h-2.5 w-2.5 shrink-0 transition group-hover:translate-x-0.5"
                        style={{ color: '#00C6FF' }}
                      />
                    </div>
                  </div>
                </Link>
              );
            });
          })()}
        </nav>

        {/* Minimal Sign-Out Action (Black, Aqua & Pink) */}
        {onLogout && (
          <div className="shrink-0 p-1" style={{ background: DARK_NAVY_CHASSIS }}>
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-[22px] w-full items-center justify-center gap-1 rounded-md border border-[#00C6FF] bg-black px-2 py-0.5 text-[8.5px] font-extrabold text-[#00C6FF] shadow-2xs transition hover:border-[#FF2E9A] hover:text-[#FF2E9A]"
            >
              <LogOut className="h-2.5 w-2.5 text-[#FF2E9A]" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}