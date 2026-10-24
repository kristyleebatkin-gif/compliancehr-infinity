import React, { useState } from 'react';
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
import SoftwareAndSafeBanner from '@/components/safe/SoftwareAndSafeBanner';
import BusinessHealthComplianceIntelligenceDashboard from '@/components/compliance/BusinessHealthComplianceIntelligenceDashboard';
import InfinityOneClickOperations from '@/components/operations/InfinityOneClickOperations';
import InfinityControlCentreMasterSuite from '@/components/operations/InfinityControlCentreMasterSuite';
import { Activity, ShieldCheck, Sparkles, Zap, LayoutGrid, ClipboardCheck, Layers } from 'lucide-react';

const HEADINGS = {
  [ROLES.ADMIN]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.COMPLIANCE]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.TEAM_LEADER]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.SUPPORT]: { title: 'Staff Dashboard', sub: 'Your tools for training, incidents, incidents reporting, risks and participant support.' },
  [ROLES.PARTICIPANT]: { title: 'Participant Dashboard', sub: 'Manage your supports, documents and communications with your team.' },
};

const DASHBOARD_SUITES = [
  { id: 'overview', label: 'All Modules & Live Workspace', sub: '45 Modules · Quick Start · Live Trackers', icon: LayoutGrid, color: '#4f46e5' },
  { id: 'control-centre', label: 'Infinity Control Centre', sub: '356 Audit Checks · 98 Docs · Approvals', icon: ShieldCheck, color: '#7c3aed' },
  { id: 'one-click', label: '1-Click Operations Deck', sub: '12 Instant Executive Actions', icon: Zap, color: '#db2777' },
  { id: 'health-intelligence', label: 'NDIS Health & Readiness', sub: '8 Practice Standards · Predictive Radar', icon: Activity, color: '#2563eb' },
  { id: 'reviews-trends', label: 'Management & Safety Trends', sub: 'Board Reviews · Incident & Risk Trends', icon: ClipboardCheck, color: '#0d9488' },
  { id: 'all', label: 'Full Executive View', sub: 'View All Suites Together', icon: Layers, color: '#ea580c' },
];

export default function Dashboard() {
  const { role, user } = useRole();
  const heading = HEADINGS[role] || HEADINGS[ROLES.SUPPORT];
  const firstName = (user?.full_name || '').split(' ')[0];
  const [activeSuite, setActiveSuite] = useState('overview');

  return (
    <div className="bright-dashboard mx-auto max-w-6xl p-3 md:p-5 space-y-4">
      <PageHeader
        icon={ShieldCheck}
        title={firstName ? `Welcome, ${firstName}` : heading.title}
        subtitle={heading.sub}
      />

      <SoftwareAndSafeBanner compact />

      {/* Clean, modern Dashboard Command Navigator — preserves current colour scheme */}
      <section className="rounded-2xl border border-violet-200 bg-white p-3 shadow-sm">
        <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg gradient-brand text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-sm font-extrabold text-foreground">Executive Dashboard Views</h2>
              <p className="text-xs text-muted-foreground">Select a focused workspace view below or open all suites together.</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {DASHBOARD_SUITES.map((s) => {
            const Icon = s.icon;
            const active = activeSuite === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveSuite(s.id)}
                className={`flex flex-col items-start justify-between rounded-xl border p-2.5 text-left transition-all ${
                  active ? 'shadow-md ring-2 ring-primary' : 'hover:-translate-y-0.5 hover:shadow-sm'
                }`}
                style={{
                  borderColor: active ? s.color : `${s.color}55`,
                  borderTopWidth: '4px',
                  borderTopColor: s.color,
                  background: active
                    ? `linear-gradient(135deg, ${s.color}26 0%, ${s.color}10 60%, #ffffff 100%)`
                    : `linear-gradient(135deg, ${s.color}12 0%, #ffffff 85%)`,
                }}
              >
                <div className="flex w-full items-center justify-between gap-1.5">
                  <span
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white shadow-sm"
                    style={{ background: s.color }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  {active && (
                    <span className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: s.color }}>
                      Active
                    </span>
                  )}
                </div>
                <div className="mt-2 min-w-0 w-full">
                  <div className="truncate text-xs font-extrabold text-foreground">{s.label}</div>
                  <div className="mt-0.5 truncate text-[11px] font-medium text-muted-foreground">{s.sub}</div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {(activeSuite === 'overview' || activeSuite === 'all') && (
        <>
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

      {(activeSuite === 'control-centre' || activeSuite === 'all') && (
        <InfinityControlCentreMasterSuite />
      )}

      {(activeSuite === 'one-click' || activeSuite === 'all') && (
        <InfinityOneClickOperations />
      )}

      {(activeSuite === 'health-intelligence' || activeSuite === 'all') && (
        <BusinessHealthComplianceIntelligenceDashboard />
      )}

      {(activeSuite === 'reviews-trends' || activeSuite === 'all') && (
        <>
          {role !== ROLES.PARTICIPANT && role !== ROLES.SUPPORT && <ManagementReviewReport />}
          {canAccessNav(role, 'safety-insights') && <ComplianceDashboardFrame><SafetyTrendsDashboard /></ComplianceDashboardFrame>}
        </>
      )}
    </div>
  );
}