import React, { useState, useEffect } from 'react';
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

import Universal360ProfileFramework from '@/components/enterprise/Universal360ProfileFramework';
import OrganisationalOperatingSystemCommand from '@/components/enterprise/OrganisationalOperatingSystemCommand';
import OrganisationHealthScoreFramework from '@/components/enterprise/OrganisationHealthScoreFramework';

import MissionControlAiCoreHub from '@/components/enterprise/MissionControlAiCoreHub';
import AuditReadyTodayCommandStrip from '@/components/dashboard/AuditReadyTodayCommandStrip';
import ExecutiveWallScene from '@/components/safe/ExecutiveWallScene';
import {
  Activity, ShieldCheck, Zap, LayoutGrid, Cpu, Users, Building2, Layers, Download, FileCheck2,
} from 'lucide-react';
import { ENTERPRISE_12_FORM_TEMPLATES, exportControlledRecordAsPdf } from '@/lib/enterpriseGovernanceStandard';
import { openDocumentInViewer } from '@/lib/openDocument';

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
  const { role } = useRole();
  const isRestrictedRole =
    role === ROLES.PARTICIPANT ||
    role === ROLES.SUPPORT ||
    role === ROLES.GUEST ||
    role === ROLES.VOLUNTEER;

  const [activeSuite, setActiveSuite] = useState('os-command');

  const availableSuites = DASHBOARD_SUITES;

  const isSuiteVisible = (suiteId) =>
    activeSuite === suiteId || activeSuite === 'all';

  return (
    <div className="bright-dashboard mx-auto w-full max-w-[1440px] space-y-3">
      {/* Priority 1 Audit Readiness Strip: "Am I Audit Ready Today?" */}
      {!isRestrictedRole && <AuditReadyTodayCommandStrip />}

      {/* Main Screen Hybrid: Premium Remote + Mission Control + Enterprise Dashboard (AI CORE + 8 Glowing Circular Control Pods) */}
      <MissionControlAiCoreHub
        activeSuite={activeSuite}
        onSelectSuite={(id) => setActiveSuite(id)}
        showHeaderLogo={false}
      />

      {/* Quick Access to New Form Template (White, Light Blue & Dark Blue) */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-sky-200 bg-[#F0F7FF] px-4 py-2.5 shadow-2xs">
        <span className="text-xs font-extrabold text-[#0A2B6D]">
          New Controlled Form Template (White, Light Blue &amp; Dark Blue Edition)
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => openDocumentInViewer(ENTERPRISE_12_FORM_TEMPLATES[2])}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#0072FF] bg-white px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-[#E0F2FE]"
          >
            <FileCheck2 className="h-3.5 w-3.5 text-[#0072FF]" />
            <span>Preview New Form Template</span>
          </button>
          <button
            type="button"
            onClick={() => exportControlledRecordAsPdf(ENTERPRISE_12_FORM_TEMPLATES[2])}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0A2B6D] px-3 py-1.5 text-xs font-extrabold text-white transition hover:bg-[#0072FF]"
          >
            <Download className="h-3.5 w-3.5 text-[#00C6FF]" />
            <span>Download Form Template (PDF)</span>
          </button>
        </div>
      </div>

      <div id="dashboard-active-suite-section" className="scroll-mt-24 space-y-4">
        {/* 1. Executive Overview (Default for Executives / Admins / Compliance) */}
        {isSuiteVisible('os-command') && (
          <div className="space-y-4">
            <OrganisationHealthScoreFramework />
            <OrganisationalOperatingSystemCommand />
          </div>
        )}

        {/* 2. Universal 360° Profiles */}
        {isSuiteVisible('universal-360') && <Universal360ProfileFramework />}

        {/* 3. Role Dashboards & Morning Brief */}
        {isSuiteVisible('overview') && (
          <div className="space-y-4">
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
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-2xs">
                <h2 className="text-lg font-bold text-[#0A2B6D]">
                  {role === ROLES.VOLUNTEER ? 'Your volunteer workspace' : 'Guest access'}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {role === ROLES.VOLUNTEER
                    ? 'Open your placement details and volunteer records.'
                    : 'This account can open the Help Centre and User Guides. Contact an administrator if you need a different role.'}
                </p>
                {role === ROLES.VOLUNTEER && (
                  <a
                    className="mt-4 inline-flex rounded-lg bg-[#0A2B6D] px-4 py-2 text-sm font-semibold text-white hover:bg-[#17408b]"
                    href="/volunteers"
                  >
                    Open volunteering records
                  </a>
                )}
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
            <DashboardQuickStart />
            <AllModulesHub />
          </div>
        )}

        {/* 4. 356 Checkpoints & Control Centre */}
        {isSuiteVisible('control-centre') && (
          <div className="space-y-4">
            <EnterpriseStandardQualityGateSuite />
            <InfinityControlCentreMasterSuite />
          </div>
        )}

        {/* 5. 1-Click Operations Deck & Core Engine */}
        {isSuiteVisible('one-click') && (
          <div className="space-y-4">
            <InfinityOneClickOperations />
            <InfinityCoreEngine />
          </div>
        )}

        {/* 6. Health & Readiness + Management Review */}
        {isSuiteVisible('health-intelligence') && (
          <div className="space-y-4">
            <BusinessHealthComplianceIntelligenceDashboard />
            <ManagementReviewReport />
            <ComplianceDashboardFrame>
              <SafetyTrendsDashboard />
            </ComplianceDashboardFrame>
          </div>
        )}

        {/* 7. Executive Office Wall Scene */}
        {isSuiteVisible('office-wall') && (
          <div className="space-y-4">
            <ExecutiveWallScene />
          </div>
        )}
      </div>
    </div>
  );
}