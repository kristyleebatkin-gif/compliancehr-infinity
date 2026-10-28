import React, { useState, useEffect } from 'react';
import '@/components/dashboard/brightDashboard.css';
import '@/components/dashboard/dashboardSectionRefresh.css';
import ManagementReviewReport from '@/components/dashboard/ManagementReviewReport';
import ComplianceDashboardFrame from '@/components/dashboard/ComplianceDashboardFrame';
import { useRole } from '@/lib/useRole';
import { ROLES, canAccessNav } from '@/lib/roles';
import { getTilePalette, getHeaderView, getSymbolView } from '@/lib/fullColourTiles';
import SafetyTrendsDashboard from '@/components/safety/SafetyTrendsDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import DashboardQuickStart from '@/components/dashboard/DashboardQuickStart';
import AllModulesHub from '@/components/dashboard/AllModulesHub';
import MorningBrief from '@/components/dashboard/MorningBrief';
import IssuesDashboardWidget from '@/components/compliance/IssuesDashboardWidget';
import { OVERVIEW_ROLES } from '@/components/profile/ProfilesOverview';
import LiveDashboards from '@/components/dashboard/LiveDashboards';
import PageHeader from '@/components/PageHeader';
import SoftwareAndSafeBanner from '@/components/safe/SoftwareAndSafeBanner';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import OriginalPublishedOverview from '@/components/dashboard/OriginalPublishedOverview';
import DashboardGrandCelebrationBar from '@/components/dashboard/DashboardGrandCelebrationBar';
import { Activity, ShieldCheck, Sparkles, Zap, LayoutGrid, ClipboardCheck, Layers, Building2, Cpu } from 'lucide-react';

const HEADINGS = {
  [ROLES.ADMIN]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.COMPLIANCE]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.TEAM_LEADER]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.SUPPORT]: { title: 'Staff Dashboard', sub: 'Your tools for training, incidents, incident reporting, risks and participant support.' },
  [ROLES.PARTICIPANT]: { title: 'Participant Dashboard', sub: 'Manage your supports, documents and communications with your team.' },
};

const DASHBOARD_SUITES = [
  { id: 'all', label: 'All Workspaces', sub: 'Your complete dashboard in one place', icon: Layers, color: '#ea580c' },
  { id: 'overview', label: 'Overview & Modules', sub: 'KPIs · Announcements · Quick Start · Live Trackers', icon: LayoutGrid, color: '#4f46e5' },
  { id: 'office-wall', label: 'Interactive Office & Profile Scene', sub: 'Dual Office Wall · Safe · Modular Screens', icon: Building2, color: '#0284c7' },
  { id: 'control-centre', label: 'Infinity Control Centre', sub: '356 Audit Checks · 98 Docs · Approvals', icon: ShieldCheck, color: '#7c3aed' },
  { id: 'one-click', label: '1-Click Operations Deck', sub: '12 Instant Executive Actions', icon: Zap, color: '#db2777' },
  { id: 'core-engine', label: 'Infinity Core Engine', sub: '104 Functions · 65 Workflows · AI Smart-Fill', icon: Cpu, color: '#16a34a' },
  { id: 'health-intelligence', label: 'NDIS Health & Readiness', sub: '8 Practice Standards · Predictive Radar', icon: Activity, color: '#2563eb' },
  { id: 'reviews-trends', label: 'Management & Safety Trends', sub: 'Board Reviews · Incident & Risk Trends', icon: ClipboardCheck, color: '#0d9488' },
];

export default function Dashboard() {
  const { role, user } = useRole();
  const heading = HEADINGS[role] || HEADINGS[ROLES.SUPPORT];
  const firstName = (user?.full_name || '').split(' ')[0];
  // Default to 'all' so both the original published Dashboard and current suites are displayed together
  const [activeSuite, setActiveSuite] = useState('all');
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('chr-workspace-view-mode') || 'profiles');

  useEffect(() => {
    const onModeChange = (e) => {
      if (e?.detail?.mode) setViewMode(e.detail.mode);
    };
    window.addEventListener('chr-view-mode-change', onModeChange);
    return () => window.removeEventListener('chr-view-mode-change', onModeChange);
  }, []);

  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 space-y-6">
      <PageHeader
        icon={ShieldCheck}
        title={firstName ? `Welcome, ${firstName}` : heading.title}
        subtitle={heading.sub}
      />

      <SoftwareAndSafeBanner compact />

      <DashboardGrandCelebrationBar />

      {/* Unified Dashboard Command Navigator — Framed in Top Section Template */}
      <section
        className="rounded-3xl p-[2px] shadow-sm"
        style={{
          background:
            'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)',
        }}
      >
        <div className="rounded-[16px] bg-white p-4 sm:p-5 text-center space-y-3">
          <span
            className="mx-auto inline-flex min-h-[40px] items-center justify-center gap-2.5 rounded-full border-2 border-[#0A2B6D] px-6 py-1.5 text-xs sm:text-sm font-extrabold tracking-wide text-white shadow-sm"
            style={{ background: getHeaderView(0) }}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </span>
            <span>Your Dashboard</span>
          </span>

          <p className="mx-auto max-w-3xl text-xs sm:text-sm font-extrabold text-[#5A00D6]">
            Choose a workspace to focus on your priorities, or view all areas together.
          </p>

          <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {DASHBOARD_SUITES.map((s, idx) => {
              const Icon = s.icon;
              const active = activeSuite === s.id;
              const tile = getTilePalette(idx);
              const sym = getSymbolView(idx);
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setActiveSuite(s.id)}
                  aria-pressed={active}
                  className={`flex min-h-[100px] items-start gap-3 rounded-2xl border border-[#0A2B6D]/15 p-4 text-left transition-all hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A00D6] ${
                    active ? 'ring-2 ring-[#5A00D6] shadow-md' : 'shadow-2xs hover:shadow-md'
                  }`}
                  style={{ backgroundColor: tile.bg, color: tile.text }}
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-[#0A2B6D] bg-white">
                    <Icon className="h-3.5 w-3.5" style={{ color: sym.iconColor }} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="break-words text-sm font-bold leading-snug" style={{ color: tile.text }}>
                      {s.label}
                    </div>
                    <div className="mt-1 break-words text-xs font-medium leading-relaxed" style={{ color: tile.subtext }}>
                      {s.sub}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 1. Original Published KPI Strip, Announcements Board & Quick Links + 45 Modules Hub + Quick Start + Role Dashboards */}
      {(activeSuite === 'overview' || activeSuite === 'all') && (
        <>
          <OriginalPublishedOverview />
          <AllModulesHub />
          <DashboardQuickStart />
          {OVERVIEW_ROLES.includes(role) && <ComplianceDashboardFrame><LiveDashboards /></ComplianceDashboardFrame>}
          {canAccessNav(role, 'compliance') && <ComplianceDashboardFrame><MorningBrief /></ComplianceDashboardFrame>}
          {canAccessNav(role, 'compliance') && <ComplianceDashboardFrame><IssuesDashboardWidget /></ComplianceDashboardFrame>}
          {role === ROLES.PARTICIPANT
            ? <ComplianceDashboardFrame><ParticipantDashboard /></ComplianceDashboardFrame>
            : (role === ROLES.SUPPORT)
              ? <ComplianceDashboardFrame><StaffDashboard /></ComplianceDashboardFrame>
              : <AdminDashboard />}
        </>
      )}

      {/* 2. Interactive Executive Office & Dual Profile Wall Scene */}
      {(activeSuite === 'office-wall' || activeSuite === 'all') && (
        <ExecutiveWallScene showAllModulesMinimised={true} />
      )}

      {/* 3. Infinity Control Centre Master Suite */}
      {(activeSuite === 'control-centre' || activeSuite === 'all') && (
        <InfinityControlCentreMasterSuite />
      )}

      {/* 4. Infinity One-Click Operations Deck */}
      {(activeSuite === 'one-click' || activeSuite === 'all') && (
        <InfinityOneClickOperations />
      )}

      {/* 5. Infinity Core Engine (104 Functions · 65 Workflows · Real-Time Validation & Smart-Fill) */}
      {(activeSuite === 'core-engine' || activeSuite === 'all') && (
        <InfinityCoreEngine />
      )}

      {/* 6. Business Health & Compliance Intelligence Dashboard */}
      {(activeSuite === 'health-intelligence' || activeSuite === 'all') && (
        <BusinessHealthComplianceIntelligenceDashboard />
      )}

      {/* 6. Management Review Report & Safety Trends Dashboard */}
      {(activeSuite === 'reviews-trends' || activeSuite === 'all') && (
        <>
          {role !== ROLES.PARTICIPANT && role !== ROLES.SUPPORT && <ManagementReviewReport />}
          {canAccessNav(role, 'safety-insights') && <ComplianceDashboardFrame><SafetyTrendsDashboard /></ComplianceDashboardFrame>}
        </>
      )}
    </div>
  );
}