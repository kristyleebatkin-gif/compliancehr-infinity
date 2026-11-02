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
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] px-3 py-2 sm:px-5 lg:px-6 space-y-2.5">
      {/* Dashboard Executive Command — Centred Title Above + 50% Squashed Remote Control Tiles in Two Rows */}
      <section
        className="preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] p-2 shadow-lg"
        style={{
          background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #141B4D 100%)',
        }}
      >
        {/* Centred Dashboard Title Above on White Title Background */}
        <div className="mb-1.5 flex flex-col items-center justify-center rounded-xl bg-white px-3 py-1 text-center shadow-2xs">
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
              {firstName ? `${heading.title} · Welcome, ${firstName}` : heading.title} — Dashboard &amp; Executive Command
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F0FF] px-2 py-0 text-[8.5px] font-extrabold text-[#5A00D6]">
              <ShieldCheck className="h-2.5 w-2.5 text-[#0072FF]" />
              <span>LIVE</span>
            </span>
          </div>
          <p className="text-[9.5px] font-semibold text-[#0A2B6D]/80 leading-tight" style={{ color: '#0A2B6D' }}>
            {heading.sub}
          </p>
        </div>

        {/* 8 Executive Command Options Squashed by 50% in Two Rows (4 per row) */}
        <nav aria-label="Dashboard workspaces" className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {availableSuites.map((suite) => {
            const Icon = suite.icon;
            const active = activeSuite === suite.id;
            return (
              <button
                key={suite.id}
                type="button"
                onClick={() => setActiveSuite(suite.id)}
                aria-pressed={active}
                className={`group rounded-xl p-[1.5px] text-left transition-all focus:outline-none ${
                  active
                    ? 'shadow-[0_0_14px_rgba(0,198,255,0.75)] scale-[1.01]'
                    : 'hover:shadow-[0_0_10px_rgba(161,0,255,0.45)]'
                }`}
                style={{
                  background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                }}
              >
                <div className="flex min-h-[28px] items-center justify-between gap-1 rounded-[10px] bg-white px-2 py-1">
                  <div className="flex min-w-0 items-center gap-1.5">
                    <span
                      className="flex h-4 w-4 shrink-0 items-center justify-center rounded-md text-white"
                      style={{
                        background: 'linear-gradient(120deg, #0072FF 0%, #5A00D6 50%, #FF2E9A 100%)',
                      }}
                    >
                      <Icon className="h-2.5 w-2.5 shrink-0 text-white" style={{ color: '#FFFFFF' }} />
                    </span>
                    <span className="truncate text-[10px] font-extrabold text-[#0A2B6D]" style={{ color: '#0A2B6D' }}>
                      {suite.label}
                    </span>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center gap-1 rounded-full px-1.5 py-0 text-[7px] font-black uppercase ${
                      active ? 'bg-[#0A2B6D] text-[#00C6FF]' : 'bg-[#F5F0FF] text-[#5A00D6]'
                    }`}
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        backgroundColor: active ? '#00C6FF' : '#FF2E9A',
                        boxShadow: active ? '0 0 6px 1px #00C6FF' : 'none',
                      }}
                    />
                    {active ? 'ON' : 'READY'}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>
      </section>

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
    </div>
  );
}