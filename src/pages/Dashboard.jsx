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
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-6 lg:px-8 space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#5A00D6]">ComplianceHR Infinity</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#0A2B6D] sm:text-3xl">{firstName ? `Welcome, ${firstName}` : heading.title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600">{heading.sub}</p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Secure workspace
          </span>
        </div>
      </section>

      <nav aria-label="Dashboard workspaces" className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        {availableSuites.map((suite) => {
          const Icon = suite.icon;
          const active = activeSuite === suite.id;
          return (
            <button key={suite.id} type="button" onClick={() => setActiveSuite(suite.id)} aria-pressed={active}
              className={`flex min-h-14 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#0072FF] focus:ring-offset-2 ${active ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-sm' : 'border-slate-200 bg-white text-[#0A2B6D] hover:border-[#0072FF] hover:bg-blue-50'}`}>
              <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#00C6FF]' : 'text-[#5A00D6]'}`} />
              <span>{suite.label}</span>
            </button>
          );
        })}
      </nav>

      {isSuiteVisible('os-command') && <OrganisationalOperatingSystemCommand />}

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