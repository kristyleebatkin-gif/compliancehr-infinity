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
import SoftwareAndSafeBanner from '@/components/safe/SoftwareAndSafeBanner';
import { Activity, ShieldCheck, Sparkles, Zap, Users } from 'lucide-react';

const HEADINGS = {
  [ROLES.ADMIN]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.COMPLIANCE]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.TEAM_LEADER]: { title: 'Administrator Dashboard', sub: 'Monitor compliance, manage documents, ensure safety and drive continuous improvement across your organisation.' },
  [ROLES.SUPPORT]: { title: 'Staff Dashboard', sub: 'Your tools for training, incidents, risks and participant support.' },
  [ROLES.PARTICIPANT]: { title: 'Participant Dashboard', sub: 'Manage your supports, documents and communications with your team.' },
};

export default function Dashboard() {
  const { role, user } = useRole();
  const heading = HEADINGS[role] || HEADINGS[ROLES.SUPPORT];
  const firstName = (user?.full_name || '').split(' ')[0];
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('chr-workspace-view-mode') || 'office');

  useEffect(() => {
    const onModeChange = (e) => {
      if (e?.detail?.mode) setViewMode(e.detail.mode);
    };
    window.addEventListener('chr-view-mode-change', onModeChange);
    return () => window.removeEventListener('chr-view-mode-change', onModeChange);
  }, []);

  if (viewMode !== 'profiles') {
    return (
      <div className="mx-auto max-w-6xl bg-white p-3 md:p-4">
        <SoftwareAndSafeBanner compact />
      </div>
    );
  }

  return (
    <div className="bright-dashboard mx-auto max-w-6xl p-3 md:p-4 space-y-3">
      <PageHeader
        icon={ShieldCheck}
        title={firstName ? `Welcome, ${firstName}` : heading.title}
        subtitle={heading.sub}
      />

      <SoftwareAndSafeBanner compact />

      <AllModulesHub />

      <DashboardQuickStart />

      {role !== ROLES.PARTICIPANT && role !== ROLES.SUPPORT && <ManagementReviewReport />}

      {OVERVIEW_ROLES.includes(role) && <ComplianceDashboardFrame><LiveDashboards /></ComplianceDashboardFrame>}

      {canAccessNav(role, 'compliance') && <ComplianceDashboardFrame><MorningBrief /></ComplianceDashboardFrame>}

      {canAccessNav(role, 'compliance') && <ComplianceDashboardFrame><IssuesDashboardWidget /></ComplianceDashboardFrame>}

      {role === ROLES.PARTICIPANT
        ? <ComplianceDashboardFrame><ParticipantDashboard /></ComplianceDashboardFrame>
        : (role === ROLES.SUPPORT)
          ? <ComplianceDashboardFrame><StaffDashboard /></ComplianceDashboardFrame>
          : <AdminDashboard />}

      {canAccessNav(role, 'safety-insights') && <ComplianceDashboardFrame><SafetyTrendsDashboard /></ComplianceDashboardFrame>}
    </div>
  );
}