import React, { useState, useEffect } from 'react';
import '@/components/dashboard/brightDashboard.css';
import '@/components/dashboard/dashboardSectionRefresh.css';
import ManagementReviewReport from '@/components/dashboard/ManagementReviewReport';
import ComplianceDashboardFrame from '@/components/dashboard/ComplianceDashboardFrame';
import { useRole } from '@/lib/useRole';
import { ROLES, canAccessNav } from '@/lib/roles';
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

import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import EnterpriseStandardQualityGateSuite from '@/components/compliance/EnterpriseStandardQualityGateSuite';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';

import Universal360ProfileFramework from '@/components/enterprise/Universal360ProfileFramework';
import OrganisationalOperatingSystemCommand from '@/components/enterprise/OrganisationalOperatingSystemCommand';
import OrganisationHealthScoreFramework from '@/components/enterprise/OrganisationHealthScoreFramework';
import MissionControlAiCoreHub from '@/components/enterprise/MissionControlAiCoreHub';
import BrandLogoLockup from '@/components/common/BrandLogoLockup';

import {
  Activity, ShieldCheck, Zap, LayoutGrid, Layers, Building2, Cpu, Users,
} from 'lucide-react';

const HEADINGS = {
  [ROLES.GUEST]: {
    title: 'Guest dashboard',
    sub: 'Guest access is limited to help and system guides.',
  },
  [ROLES.VOLUNTEER]: {
    title: 'Volunteer dashboard',
    sub: 'Your volunteer workspace and placement records.',
  },
  [ROLES.ADMIN]: {
    title: 'Business dashboard',
    sub: 'A clear view of organisational priorities, compliance, workforce and participant support.',
  },
  [ROLES.COMPLIANCE]: {
    title: 'Business dashboard',
    sub: 'A clear view of organisational priorities, compliance, workforce and participant support.',
  },
  [ROLES.TEAM_LEADER]: {
    title: 'Team dashboard',
    sub: 'Review team compliance, participant safeguards, risks and open actions.'
  },
  [ROLES.SUPPORT]: {
    title: 'Staff dashboard',
    sub: 'Your tools for shifts, participant support, training and reporting.'
  },
  [ROLES.PARTICIPANT]: {
    title: 'My support dashboard',
    sub: 'View your supports, goals, documents and messages from your team.'
  },
};

const DASHBOARD_SUITES = [
  { id: 'os-command', label: 'Executive overview', icon: Cpu },
  { id: 'universal-360', label: '360° profiles', icon: Users },
  { id: 'overview', label: 'Role dashboards', icon: LayoutGrid },
  { id: 'control-centre', label: 'Forms & controls', icon: ShieldCheck },
  { id: 'one-click', label: 'Operations', icon: Zap },
  { id: 'health-intelligence', label: 'Readiness', icon: Activity },
  { id: 'office-wall', label: 'Executive office', icon: Building2 },
  { id: 'all', label: 'All workspaces', icon: Layers },
];

export default function Dashboard() {
  const { role, user } = useRole();
  const heading = HEADINGS[role] || HEADINGS[ROLES.SUPPORT];
  const firstName = (user?.full_name || '').split(' ')[0];
  // Treat an unresolved role as restricted until the authenticated role is known.
  const isRestrictedRole = !role || role === ROLES.PARTICIPANT || role === ROLES.SUPPORT || role === ROLES.GUEST || role === ROLES.VOLUNTEER;
  const [activeSuite, setActiveSuite] = useState(() => isRestrictedRole ? 'overview' : 'os-command');

  useEffect(() => {
    setActiveSuite((current) => isRestrictedRole ? 'overview' : current === 'overview' ? 'os-command' : current);
  }, [isRestrictedRole]);

  const availableSuites = isRestrictedRole
    ? DASHBOARD_SUITES.filter((suite) => suite.id === 'overview')
    : DASHBOARD_SUITES;
  const isSuiteVisible = (suiteId) => isRestrictedRole
    ? suiteId === 'overview' && activeSuite === 'overview'
    : activeSuite === suiteId || activeSuite === 'all';

  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] px-3 py-2 sm:px-5 lg:px-6 space-y-3">
      {/* Main Screen Hybrid: Premium Remote + Mission Control + Enterprise Dashboard (AI CORE + 8 Glowing Circular Control Pods) */}
      <MissionControlAiCoreHub
        activeSuite={activeSuite}
        onSelectSuite={(id) => setActiveSuite(id)}
        showHeaderLogo={false}
      />

      {isSuiteVisible('os-command') && (
        <div className="space-y-2.5">
          <OrganisationHealthScoreFramework />
          <OrganisationalOperatingSystemCommand />
        </div>
      )}

      {/* 2. Full Universal 360° Profile, 12-Step Master Workflow & 14-Point Automation Explorer */}
      {isSuiteVisible('universal-360') && (
        <Universal360ProfileFramework />
      )}

      {/* 3. Role Dashboards, Morning Brief & All Modules Hub */}
      {isSuiteVisible('overview') && (
        <div className="space-y-5">
          {canAccessNav(role, 'compliance') && (
            <ComplianceDashboardFrame>
              <MorningBrief />
            </ComplianceDashboardFrame>
          )}
          {canAccessNav(role, 'compliance') && (
            <ComplianceDashboardFrame>
              <IssuesDashboardWidget />
            </ComplianceDashboardFrame>
          )}
          {OVERVIEW_ROLES.includes(role) && (
            <ComplianceDashboardFrame>
              <LiveDashboards />
            </ComplianceDashboardFrame>
          )}
          {[ROLES.GUEST, ROLES.VOLUNTEER].includes(role) ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-[#0A2B6D]">{role === ROLES.VOLUNTEER ? 'Your volunteer workspace' : 'Guest access'}</h2>
              <p className="mt-1 text-sm text-slate-600">{role === ROLES.VOLUNTEER ? 'Open your placement details and volunteer records.' : 'This account can open the Help Centre and User Guides. Contact an administrator if you need a different role.'}</p>
              {role === ROLES.VOLUNTEER && <a className="mt-4 inline-flex rounded-lg bg-[#0A2B6D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17408b]" href="/volunteers">Open volunteering records</a>}
            </section>
          ) : role === ROLES.PARTICIPANT ? (
            <ComplianceDashboardFrame>
              <ParticipantDashboard />
            </ComplianceDashboardFrame>
          ) : role === ROLES.SUPPORT ? (
            <ComplianceDashboardFrame>
              <StaffDashboard />
            </ComplianceDashboardFrame>
          ) : (
            <AdminDashboard />
          )}
          {!([ROLES.GUEST, ROLES.VOLUNTEER].includes(role)) && <DashboardQuickStart />}
          {!([ROLES.GUEST, ROLES.VOLUNTEER].includes(role)) && <AllModulesHub />}
        </div>
      )}

      {/* 4. Form & Document Generator Studio + Infinity Control Centre */}
      {isSuiteVisible('control-centre') && (
        <div className="space-y-5">
          <EnterpriseStandardQualityGateSuite />
          <InfinityControlCentreMasterSuite />
        </div>
      )}

      {/* 5. 1-Click Operations Deck & Core Engine */}
      {isSuiteVisible('one-click') && (
        <div className="space-y-5">
          <InfinityOneClickOperations />
          <InfinityCoreEngine />
        </div>
      )}

      {/* 6. NDIS & Aged Care Health & Readiness + Management Review */}
      {isSuiteVisible('health-intelligence') && (
        <div className="space-y-5">
          <OrganisationHealthScoreFramework />
          <BusinessHealthComplianceIntelligenceDashboard />
          {role !== ROLES.PARTICIPANT && role !== ROLES.SUPPORT && <ManagementReviewReport />}
          {canAccessNav(role, 'safety-insights') && (
            <ComplianceDashboardFrame>
              <SafetyTrendsDashboard />
            </ComplianceDashboardFrame>
          )}
        </div>
      )}

      {/* 7. Interactive Executive Office & Dual Profile Wall Scene */}
      {isSuiteVisible('office-wall') && (
        <ExecutiveWallScene showAllModulesMinimised={true} />
      )}

      {/* Dashboard Footer Logo Area — Matching Top Header Logo Area (White Background Outside Border to Side of Page) */}
      <footer
        aria-label="Dashboard brand footer"
        className="rounded-2xl bg-white px-4 py-3 text-center shadow-md"
      >
        <div className="mx-auto flex max-w-[1440px] justify-center">
          <BrandLogoLockup size="md" theme="light" showSlogan={true} />
        </div>
      </footer>
    </div>
  );
}