import React, { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { useAuth } from '@/lib/AuthContext';
import {
  LogOut, LayoutDashboard, ClipboardList,
  Users, ShieldCheck, ShieldAlert, FolderOpen, Megaphone,
  BarChart3, Cpu, Settings, Sun, Smartphone,
} from 'lucide-react';

const BRAND_GRADIENT =
  'linear-gradient(120deg, #0072FF 0%, #A855F7 50%, #FF2E9A 100%)';

const DARK_NAVY_CHASSIS = 'linear-gradient(165deg, #0A2B6D 0%, #0A2B6D 55%, #5A00D6 100%)';

// Strict repeating symbol & square indicator sequence: Blue, Purple, Pink, Blue, Purple, Pink...
const SYMBOL_COLOR_SEQUENCE = ['#0072FF', '#A855F7', '#FF2E9A'];

// Permanent 13-Group Architectural Map (Single Source of Truth, Zero Duplicates)
export const PRIMARY_11_OS_NAV = [
  {
    id: 'dashboard-executive',
    label: '1. Dashboard',
    sub: 'Executive Dashboard, Subscriptions, Communication, Mailbox & Live Roster',
    path: '/dashboard',
    icon: LayoutDashboard,
    status: 'LIVE',
    children: [
      { label: 'Dashboard', path: '/dashboard', sub: 'Executive Dashboard, Subscriptions & Command', icon: LayoutDashboard },
      { label: 'Administration – Lead (Sherelle)', path: '/today', sub: 'Daily operations workspace', icon: Sun },
      { label: 'Team Leader - Lead (Jamie)', path: '/team-leader', sub: 'Team leader mobile workspace', icon: Smartphone },
      { label: 'Communication', path: '/communications', sub: 'Unified Communication, Mailbox & Roster', icon: Megaphone },
      { label: 'Daily Briefing', path: '/briefing', sub: 'Morning operational briefing' },
      { label: 'Meetings', path: '/meetings', sub: 'Agendas, minutes & action items' },
      { label: 'Feedback & Surveys', path: '/feedback', sub: 'Complaints, compliments & surveys' },
      { label: 'Notifications', path: '/notifications', sub: 'Live alerts, reminders & escalations' },
      { label: 'Operations Centre', path: '/operations-centre', sub: 'Master operations & control deck' },
      { label: 'Suggestions Hub', path: '/suggestions', sub: 'Continuous improvement ideas' },
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
      { label: 'Tasks & To-Do', path: '/tasks', sub: 'Merged shared to-do & sign-off board' },
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
    sub: 'Compliance, Analytics, Auditor, Vault & Company Safe',
    path: '/compliance',
    icon: ShieldCheck,
    status: 'VERIFIED',
    children: [
      { label: 'Compliance & Evidence', path: '/compliance', sub: 'Merged Compliance Centre, Business Analytics & 356 checks' },
      { label: 'Auditor Portal', path: '/auditor-portal', sub: 'Read-only external auditor view' },
      { label: 'Document Vault', path: '/documents', sub: 'Document Vault, Smart Vault, Company Safe & 45 Master Registers' },
      { label: 'Remote Access & VPN', path: '/remote-access', sub: 'Zero-trust remote access without headaches' },
      { label: 'Quality & Improvement', path: '/quality', sub: 'Continuous improvement & CAPA' },
      { label: 'Checklists', path: '/checklists', sub: 'Operational & audit checklists' },
      { label: 'Review Due Board', path: '/review-due', sub: 'Upcoming scheduled reviews' },
      { label: 'Evidence & User Success Hub', path: '/user-success', sub: 'Evidence-first verification' },
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
    label: '1. Dashboard',
    sub: 'Executive Dashboard, Subscriptions, Communication, Mailbox & Live Roster',
    path: '/dashboard',
    icon: LayoutDashboard,
    status: 'LIVE',
    children: [
      { label: 'Dashboard', path: '/dashboard', sub: 'Executive Dashboard, Subscriptions & Command', icon: LayoutDashboard },
      { label: 'Administration – Lead (Sherelle)', path: '/today', sub: 'Daily operations workspace', icon: Sun },
      { label: 'Team Leader - Lead (Jamie)', path: '/team-leader', sub: 'Team leader mobile workspace', icon: Smartphone },
      { label: 'Communication', path: '/communications', sub: 'Unified Communication, Mailbox & Roster', icon: Megaphone },
      { label: 'Daily Briefing', path: '/briefing', sub: 'Morning operational briefing' },
      { label: 'Meetings', path: '/meetings', sub: 'Agendas, minutes & action items' },
      { label: 'Feedback & Surveys', path: '/feedback', sub: 'Complaints, compliments & surveys' },
      { label: 'Notifications', path: '/notifications', sub: 'Live alerts, reminders & escalations' },
      { label: 'Operations Centre', path: '/operations-centre', sub: 'Master operations & control deck' },
      { label: 'Suggestions Hub', path: '/suggestions', sub: 'Continuous improvement ideas' },
      { label: 'AI Assistant', path: '/assistant', sub: 'Compliance & HR intelligence copilot' },
      { label: 'Tasks & To-Do', path: '/tasks', sub: 'Merged shared to-do & sign-off board' },
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
    ],
  },
  {
    id: 'pillar-audit',
    label: '5. Audit, Governance & Finance',
    sub: 'Compliance, Analytics, Vault & Safe, NDIS & Finance',
    path: '/compliance',
    icon: ShieldCheck,
    status: 'VERIFIED',
    children: [
      { label: 'Compliance & Evidence', path: '/compliance', sub: 'Merged Compliance Centre, Business Analytics & 356 checks' },
      { label: 'Auditor Portal', path: '/auditor-portal', sub: 'Consent-verified auditor view' },
      { label: 'Document Vault', path: '/documents', sub: 'Document Vault, Smart Vault, Company Safe & 45 Master Registers' },
      { label: 'Remote Access & VPN', path: '/remote-access', sub: 'Zero-trust remote access without headaches' },
      { label: 'Governance Layer', path: '/governance', sub: 'Delegations, lifecycle & board packs' },
      { label: 'Checklists', path: '/checklists', sub: 'Operational & audit checklists' },
      { label: 'Review Due Board', path: '/review-due', sub: 'Upcoming scheduled reviews' },
      { label: 'Evidence & User Success Hub', path: '/user-success', sub: 'Evidence-first verification' },
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
  const [navMode, setNavMode] = useState(() => localStorage.getItem('chr-active-remote-mode') || 'os11');
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
      !(item.key === 'staff-progress' && sourceList.some((entry) => entry.key === 'staff')) &&
      !['company-safe', 'universal-storage', 'registers', 'record-intelligence'].includes(item.key)
  );

  return (
    <div
      className="preserve-island-theme flex w-full min-w-0 flex-col select-none"
      style={{ background: DARK_NAVY_CHASSIS }}
    >
      <section
        className="flex flex-col shadow-2xl"
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        <div className="h-1.5 w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        <div className="flex shrink-0 flex-col items-center justify-end gap-1 bg-[#0A2B6D]/90 px-1.5 pt-1 pb-1 text-center">
          <Link
            to="/dashboard"
            aria-label="ComplianceHR Infinity Home"
            className="flex w-full items-center justify-center"
          >
            <BrandLogoLockup size="xs" theme="dark" showSlogan compactSlogan className="w-full" />
          </Link>

          {/* Remote Control Mode Switcher (Blue, Purple, Pink with White Writing) */}
          <div
            className="grid w-full shrink-0 grid-cols-3 gap-0.5 rounded-lg p-[1.5px]"
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
              className={`min-h-[26px] min-w-0 whitespace-nowrap rounded-[6px] px-0.5 py-0.5 text-[10px] font-extrabold tracking-tight text-white transition-all ${
                navMode === 'pillars5' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#0072FF',
                color: '#FFFFFF',
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
              className={`min-h-[26px] min-w-0 whitespace-nowrap rounded-[6px] px-0.5 py-0.5 text-[10px] font-extrabold tracking-tight text-white transition-all ${
                navMode === 'os11' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#A855F7',
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
              className={`min-h-[26px] min-w-0 whitespace-nowrap rounded-[6px] px-0.5 py-0.5 text-[10px] font-extrabold tracking-tight text-white transition-all ${
                navMode === 'all' ? 'ring-2 ring-white' : 'opacity-90 hover:opacity-100'
              }`}
              style={{
                backgroundColor: '#FF2E9A',
                color: '#FFFFFF',
              }}
            >
              ◉ All 45
            </button>
          </div>
        </div>

        <div className="h-[2px] w-full shrink-0" style={{ background: BRAND_GRADIENT }} />

        {/* Navigation Router Buttons: White Writing, Blue-Purple-Pink Symbols, Square Indicator Button Without Text */}
        <nav
          aria-label="Page navigation"
          className="flex-1 p-1.5 space-y-1"
          style={{ background: DARK_NAVY_CHASSIS }}
        >
          {(() => {
            let colorCounter = 0;
            const nextSymbolColor = () => {
              const color = SYMBOL_COLOR_SEQUENCE[colorCounter % SYMBOL_COLOR_SEQUENCE.length];
              colorCounter += 1;
              return color;
            };

            if (navMode === 'os11' || navMode === 'pillars5') {
              const list = navMode === 'pillars5' ? FOCUSED_5_PILLAR_NAV : PRIMARY_11_OS_NAV;
              return list.map((pillar) => {
                const Icon = pillar.icon;
                const symColor = nextSymbolColor();
                const pillarActive =
                  selectedPillarId === pillar.id ||
                  isActive(pillar.path) ||
                  pillar.children.some((c) => location.pathname === c.path || location.pathname.startsWith(`${c.path}/`));

                return (
                  <div key={pillar.id}>
                    <button
                      type="button"
                      onClick={() => openMajorSectionInMainView(pillar)}
                      aria-pressed={selectedPillarId === pillar.id}
                      title={pillar.label}
                      className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                        pillarActive
                          ? 'shadow-[0_0_12px_rgba(0,114,255,0.85)]'
                          : 'shadow-[0_0_5px_rgba(168,85,247,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                      }`}
                      style={{ background: BRAND_GRADIENT }}
                    >
                      <div
                        className="flex h-[38px] items-center justify-between gap-1.5 overflow-hidden rounded-[7px] bg-[#0A2B6D]/90 px-2"
                        style={{ background: 'linear-gradient(135deg, #0A2B6D, #16468A)' }}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <span
                            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] bg-[#0A2B6D]/90"
                            style={{
                              border: `1.5px solid ${symColor}`,
                              boxShadow: `0 0 6px ${symColor}66`,
                            }}
                          >
                            <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: symColor }} />
                          </span>
                          <span
                            className="min-w-0 truncate text-[13.5px] font-black leading-tight tracking-tight text-white"
                            style={{ color: '#FFFFFF' }}
                          >
                            {pillar.label}
                          </span>
                        </div>

                        {/* Square Indicator Button (No Text) */}
                        <span
                          aria-hidden="true"
                          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
                          style={{
                            border: `1.5px solid ${symColor}`,
                            boxShadow: `0 0 7px ${symColor}88`,
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-[2px]"
                            style={{
                              backgroundColor: symColor,
                              boxShadow: `0 0 6px 1px ${symColor}`,
                            }}
                          />
                        </span>
                      </div>
                    </button>

                    {pillar.children?.length > 0 && (
                      <div className="mt-1 space-y-1 pl-2 border-l-2 border-[#A855F7]/70">
                        {pillar.children.map((child, cIdx) => {
                          const childSymColor = nextSymbolColor();
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
                              title={child.label}
                              className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                                childActive
                                  ? 'shadow-[0_0_12px_rgba(0,114,255,0.85)]'
                                  : 'shadow-[0_0_5px_rgba(168,85,247,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                              }`}
                              style={{ background: BRAND_GRADIENT }}
                            >
                              <div
                                className="flex h-[36px] items-center justify-between gap-1.5 overflow-hidden rounded-[7px] bg-[#0A2B6D]/90 px-2"
                                style={{ background: 'linear-gradient(135deg, #0A2B6D, #16468A)' }}
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  <span
                                    className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] bg-[#0A2B6D]/90"
                                    style={{
                                      border: `1.5px solid ${childSymColor}`,
                                      boxShadow: `0 0 6px ${childSymColor}66`,
                                    }}
                                  >
                                    <ChildIcon className="h-3.5 w-3.5 shrink-0" style={{ color: childSymColor }} />
                                  </span>
                                  <span
                                    className="min-w-0 truncate text-[13px] font-black leading-tight tracking-tight text-white"
                                    style={{ color: '#FFFFFF' }}
                                  >
                                    {child.label}
                                  </span>
                                </div>

                                {/* Square Indicator Button (No Text) */}
                                <span
                                  aria-hidden="true"
                                  className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
                                  style={{
                                    border: `1.5px solid ${childSymColor}`,
                                    boxShadow: `0 0 7px ${childSymColor}88`,
                                  }}
                                >
                                  <span
                                    className="h-2 w-2 rounded-[2px]"
                                    style={{
                                      backgroundColor: childSymColor,
                                      boxShadow: `0 0 6px 1px ${childSymColor}`,
                                    }}
                                  />
                                </span>
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
              const modSymColor = nextSymbolColor();
              const active = isActive(item.path);
              const label = navLabel(item);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={scrollWorkspaceToTop}
                  title={label}
                  className={`group block w-full text-left rounded-lg p-[1.5px] transition-all duration-150 focus-visible:outline-none ${
                    active
                      ? 'shadow-[0_0_12px_rgba(0,114,255,0.85)]'
                      : 'shadow-[0_0_5px_rgba(168,85,247,0.35)] hover:shadow-[0_0_10px_rgba(255,46,154,0.65)]'
                  }`}
                  style={{ background: BRAND_GRADIENT }}
                >
                  <div
                    className="flex h-[36px] items-center justify-between gap-1.5 overflow-hidden rounded-[7px] bg-[#0A2B6D]/90 px-2"
                    style={{ background: 'linear-gradient(135deg, #0A2B6D, #16468A)' }}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <span
                        className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-[4px] bg-[#0A2B6D]/90"
                        style={{
                          border: `1.5px solid ${modSymColor}`,
                          boxShadow: `0 0 6px ${modSymColor}66`,
                        }}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" style={{ color: modSymColor }} />
                      </span>
                      <span
                        className="min-w-0 truncate text-[13px] font-black leading-tight tracking-tight text-white"
                        style={{ color: '#FFFFFF' }}
                      >
                        {label}
                      </span>
                    </div>

                    {/* Square Indicator Button (No Text) */}
                    <span
                      aria-hidden="true"
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-[#0A2B6D]/90"
                      style={{
                        border: `1.5px solid ${modSymColor}`,
                        boxShadow: `0 0 7px ${modSymColor}88`,
                      }}
                    >
                      <span
                        className="h-2 w-2 rounded-[2px]"
                        style={{
                          backgroundColor: modSymColor,
                          boxShadow: `0 0 6px 1px ${modSymColor}`,
                        }}
                      />
                    </span>
                  </div>
                </Link>
              );
            });
          })()}
        </nav>

        {onLogout && (
          <div className="shrink-0 p-1" style={{ background: DARK_NAVY_CHASSIS }}>
            <button
              type="button"
              onClick={onLogout}
              className="flex min-h-[30px] w-full items-center justify-center gap-1.5 rounded-md border border-[#0072FF] bg-[#0A2B6D]/90 px-2 py-1 text-xs font-extrabold text-white shadow-2xs transition hover:border-[#FF2E9A]"
            >
              <LogOut className="h-3.5 w-3.5 text-[#FF2E9A]" />
              <span>Sign out</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}