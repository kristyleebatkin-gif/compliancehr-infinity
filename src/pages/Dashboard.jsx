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

import {
  Activity, ShieldCheck, Zap, LayoutGrid, Cpu, Users, Download, FileCheck2,
} from 'lucide-react';
import { ENTERPRISE_12_FORM_TEMPLATES, exportControlledRecordAsPdf } from '@/lib/enterpriseGovernanceStandard';
import { openDocumentInViewer } from '@/lib/openDocument';

const DASHBOARD_SUITES = [
  { id: 'os-command', label: 'Executive Posture & KPIs', icon: Cpu },
  { id: 'overview', label: 'Operational & Role View', icon: LayoutGrid },
  { id: 'health-intelligence', label: 'Readiness & Board Review', icon: Activity },
  { id: 'universal-360', label: '360° Profiles & Lineage', icon: Users },
  { id: 'control-centre', label: '356 Checkpoints & Forms', icon: ShieldCheck },
  { id: 'one-click', label: 'Automated Sweeps', icon: Zap },
];

export default function Dashboard() {
  const { role } = useRole();
  const isRestrictedRole =
    !role ||
    role === ROLES.PARTICIPANT ||
    role === ROLES.SUPPORT ||
    role === ROLES.GUEST ||
    role === ROLES.VOLUNTEER;

  const [activeSuite, setActiveSuite] = useState(() =>
    isRestrictedRole ? 'overview' : 'os-command'
  );

  useEffect(() => {
    setActiveSuite((current) =>
      isRestrictedRole ? 'overview' : current === 'overview' ? 'os-command' : current
    );
  }, [isRestrictedRole]);

  const availableSuites = isRestrictedRole
    ? DASHBOARD_SUITES.filter((suite) => suite.id === 'overview')
    : DASHBOARD_SUITES;

  const isSuiteVisible = (suiteId) =>
    isRestrictedRole
      ? suiteId === 'overview' && activeSuite === 'overview'
      : activeSuite === suiteId;

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      {/* Microsoft Purview / ServiceNow Horizon Executive Command Header & Pivot Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0072FF]/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#0072FF]">
              Executive Governance &amp; Compliance Command Centre
            </span>
            <h1 className="mt-1.5 font-editorial text-2xl font-extrabold tracking-tight text-[#0A2B6D] sm:text-3xl">
              Organisation Posture, Risk &amp; Operational Readiness
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#0A2B6D]/75">
            <button
              type="button"
              onClick={() => openDocumentInViewer(ENTERPRISE_12_FORM_TEMPLATES[2])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#0072FF] bg-[#F0F7FF] px-3 py-1.5 text-xs font-extrabold text-[#0A2B6D] transition hover:bg-[#E0F2FE]"
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
            <span className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Live Telemetry Active
            </span>
          </div>
        </div>

        {!isRestrictedRole && (
          <div
            role="tablist"
            aria-label="Executive command views"
            className="mt-3 flex flex-wrap items-center gap-1.5"
          >
            {availableSuites.map((suite) => {
              const Icon = suite.icon;
              const active = activeSuite === suite.id;
              return (
                <button
                  key={suite.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveSuite(suite.id)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-bold transition ${
                    active
                      ? 'border-[#0A2B6D] bg-[#0A2B6D] text-white shadow-2xs'
                      : 'border-slate-200 bg-slate-50 text-[#0A2B6D] hover:border-[#0072FF] hover:bg-white'
                  }`}
                >
                  <Icon
                    className="h-4 w-4 shrink-0"
                    style={{ color: active ? '#00C6FF' : '#0072FF' }}
                  />
                  <span>{suite.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

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
          {![ROLES.GUEST, ROLES.VOLUNTEER].includes(role) && <DashboardQuickStart />}
          {![ROLES.GUEST, ROLES.VOLUNTEER].includes(role) && <AllModulesHub />}
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
          {role !== ROLES.PARTICIPANT && role !== ROLES.SUPPORT && <ManagementReviewReport />}
          {canAccessNav(role, 'safety-insights') && (
            <ComplianceDashboardFrame>
              <SafetyTrendsDashboard />
            </ComplianceDashboardFrame>
          )}
        </div>
      )}
    </div>
  );
}