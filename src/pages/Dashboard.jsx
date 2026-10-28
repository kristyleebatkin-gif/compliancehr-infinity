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
import PageHeader from '@/components/PageHeader';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import EnterpriseStandardQualityGateSuite from '@/components/compliance/EnterpriseStandardQualityGateSuite';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import InfinityCoreEngine from '@/components/compliance/InfinityCoreEngine';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import ObsidianSmartRemote from '@/components/common/ObsidianSmartRemote';
import Universal360ProfileFramework from '@/components/enterprise/Universal360ProfileFramework';
import OrganisationalOperatingSystemCommand from '@/components/enterprise/OrganisationalOperatingSystemCommand';
import LivingOrganisationalEcosystemSuite from '@/components/enterprise/LivingOrganisationalEcosystemSuite';
import {
  Activity, ShieldCheck, Zap, LayoutGrid, ClipboardCheck, Layers, Building2, Cpu, Users,
} from 'lucide-react';

const HEADINGS = {
  [ROLES.ADMIN]: {
    title: 'Home Command Centre — Organisational Operating System',
    sub: 'Answer all 14 critical compliance, safety, audit, workforce and participant questions within 30 seconds.',
  },
  [ROLES.COMPLIANCE]: {
    title: 'Home Command Centre — Organisational Operating System',
    sub: 'Answer all 14 critical compliance, safety, audit, workforce and participant questions within 30 seconds.',
  },
  [ROLES.TEAM_LEADER]: {
    title: 'Manager Command Centre — Organisational Operating System',
    sub: 'Immediate visibility across workforce compliance, participant safeguards, risks, incidents, reviews and actions.',
  },
  [ROLES.SUPPORT]: {
    title: 'Staff Command Workspace',
    sub: 'Your connected tools for shifts, participant support, training, incidents, risks and evidence.',
  },
  [ROLES.PARTICIPANT]: {
    title: 'Participant 360° Workspace',
    sub: 'Manage your supports, goals, consents, documents and communications with your team.',
  },
};

const DASHBOARD_SUITES = [
  { id: 'os-command', label: '1. Home Command & Digital Twin', sub: '30-Second Outcomes · 9 Health Pillars · AI & Data Quality', icon: Cpu },
  { id: 'universal-360', label: '2. Universal 360° Profiles', sub: 'Employee · Participant · Risk · Incident · Standard · Audit · Doc · Supplier', icon: Users },
  { id: 'overview', label: '3. Role Dashboard & Modules', sub: 'Morning Brief · Live Trackers · 46 Connected Modules', icon: LayoutGrid },
  { id: 'control-centre', label: '4. Form Generator & Control Studio', sub: '11-Section Forms · 356 Audit Checks · 98 Controlled Docs', icon: ShieldCheck },
  { id: 'one-click', label: '5. 1-Click Operations Deck', sub: '12 Instant Automated Executive Sweeps', icon: Zap },
  { id: 'health-intelligence', label: '6. NDIS & Aged Care Readiness', sub: 'Practice Standards · Predictive Radar · Board Reports', icon: Activity },
  { id: 'office-wall', label: '7. Interactive Executive Office', sub: 'Dual Office Wall · Company Safe · Modular Screens', icon: Building2 },
  { id: 'all', label: '8. View All Suites Together', sub: 'Complete full-stack enterprise view', icon: Layers },
];

export default function Dashboard() {
  const { role, user } = useRole();
  const heading = HEADINGS[role] || HEADINGS[ROLES.SUPPORT];
  const firstName = (user?.full_name || '').split(' ')[0];
  // Default to the clean, fast 'os-command' view so the page is focused, uncluttered, and answers all 14 questions in 30 seconds
  const [activeSuite, setActiveSuite] = useState('os-command');

  const isRestrictedRole = role === ROLES.PARTICIPANT || role === ROLES.SUPPORT;
  const isSuiteVisible = (suiteId) => {
    if (isRestrictedRole) {
      return suiteId === activeSuite || (activeSuite === 'os-command' && suiteId === 'os-command');
    }
    return activeSuite === suiteId || activeSuite === 'all';
  };

  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8 space-y-5">
      <PageHeader
        icon={ShieldCheck}
        title={firstName ? `Welcome, ${firstName} — ${heading.title}` : heading.title}
        subtitle={heading.sub}
      />

      {/* Clean Workspace Switcher — Pick any focused command view without vertical clutter */}
      <ObsidianSmartRemote
        title="Organisational Operating System — Command Switcher"
        subtitle="Select a focused command workspace below (no duplicate screens, instant 30-second clarity)"
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

      {/* 1. Flagship Home Command Centre, 30-Second Outcome Matrix, Organisational Digital Twin, Living Ecosystem & 360° Profiles */}
      {isSuiteVisible('os-command') && (
        <div className="space-y-5">
          <OrganisationalOperatingSystemCommand />
          <LivingOrganisationalEcosystemSuite />
          <Universal360ProfileFramework compact />
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
          {role === ROLES.PARTICIPANT ? (
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
          <DashboardQuickStart />
          <AllModulesHub />
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
    </div>
  );
}