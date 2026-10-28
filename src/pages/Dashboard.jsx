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
import EnterpriseStandardQualityGateSuite from '@/components/compliance/EnterpriseStandardQualityGateSuite';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import OriginalPublishedOverview from '@/components/dashboard/OriginalPublishedOverview';
import DashboardGrandCelebrationBar from '@/components/dashboard/DashboardGrandCelebrationBar';
import ObsidianSmartRemote from '@/components/common/ObsidianSmartRemote';
import DashboardPersonaliser from '@/components/dashboard/DashboardPersonaliser';
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
  const [hiddenSuites, setHiddenSuites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('chr-dashboard-hidden-suites') || '[]');
    } catch {
      return [];
    }
  });
  const [density, setDensity] = useState(() => localStorage.getItem('chr-dashboard-density') || 'comfortable');

  const toggleSuiteVisibility = (suiteId) => {
    setHiddenSuites((prev) => {
      const next = prev.includes(suiteId) ? prev.filter((id) => id !== suiteId) : [...prev, suiteId];
      localStorage.setItem('chr-dashboard-hidden-suites', JSON.stringify(next));
      return next;
    });
  };

  const resetSuites = () => {
    setHiddenSuites([]);
    localStorage.removeItem('chr-dashboard-hidden-suites');
  };

  const changeDensity = (mode) => {
    setDensity(mode);
    localStorage.setItem('chr-dashboard-density', mode);
  };

  const isSuiteVisible = (suiteId) =>
    activeSuite === suiteId || (activeSuite === 'all' && !hiddenSuites.includes(suiteId));

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

      {/* Unified Dashboard Command Navigator — Obsidian Smart Remote */}
      <ObsidianSmartRemote
        title="Dashboard Smart Remote"
        subtitle="Choose a workspace channel or step through views with the D-pad"
        channels={DASHBOARD_SUITES.map((s) => ({
          key: s.id,
          label: s.label,
          sub: s.sub,
          icon: s.icon,
        }))}
        activeKey={activeSuite}
        onSelectChannel={setActiveSuite}
        columnsClass="grid-cols-2 sm:grid-cols-4"
      />

      {/* Quick Launch Actions & Personalisation Controls */}
      <DashboardPersonaliser
        suites={DASHBOARD_SUITES}
        hiddenSuites={hiddenSuites}
        onToggleSuite={toggleSuiteVisibility}
        onResetSuites={resetSuites}
        density={density}
        onChangeDensity={changeDensity}
      />

      {/* 1. Original Published KPI Strip, Announcements Board & Quick Links + 45 Modules Hub + Quick Start + Role Dashboards */}
      {isSuiteVisible('overview') && (
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
      {isSuiteVisible('office-wall') && (
        <ExecutiveWallScene showAllModulesMinimised={true} />
      )}

      {/* 3. Infinity Control Centre Master Suite + 12-Pillar Enterprise Governance & Form Generation Studio */}
      {isSuiteVisible('control-centre') && (
        <>
          <EnterpriseStandardQualityGateSuite />
          <InfinityControlCentreMasterSuite />
        </>
      )}

      {/* 4. Infinity One-Click Operations Deck */}
      {isSuiteVisible('one-click') && (
        <InfinityOneClickOperations />
      )}

      {/* 5. Infinity Core Engine (104 Functions · 65 Workflows · Real-Time Validation & Smart-Fill) */}
      {isSuiteVisible('core-engine') && (
        <InfinityCoreEngine />
      )}

      {/* 6. Business Health & Compliance Intelligence Dashboard */}
      {isSuiteVisible('health-intelligence') && (
        <BusinessHealthComplianceIntelligenceDashboard />
      )}

      {/* 7. Management Review Report & Safety Trends Dashboard */}
      {isSuiteVisible('reviews-trends') && (
        <>
          {role !== ROLES.PARTICIPANT && role !== ROLES.SUPPORT && <ManagementReviewReport />}
          {canAccessNav(role, 'safety-insights') && <ComplianceDashboardFrame><SafetyTrendsDashboard /></ComplianceDashboardFrame>}
        </>
      )}
    </div>
  );
}