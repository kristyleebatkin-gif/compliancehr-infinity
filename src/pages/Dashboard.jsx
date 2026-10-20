import React from 'react';
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
import DashboardWelcome from '@/components/dashboard/DashboardWelcome';

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

  return (
    <div className="mx-auto max-w-6xl space-y-4 p-3 md:p-4">
      <DashboardWelcome firstName={firstName} heading={heading} />

      <AllModulesHub />

      {canAccessNav(role, 'compliance') && <MorningBrief />}

      {canAccessNav(role, 'compliance') && <IssuesDashboardWidget />}

      {role === ROLES.PARTICIPANT
        ? <ParticipantDashboard />
        : (role === ROLES.SUPPORT)
          ? <StaffDashboard />
          : <AdminDashboard />}

      {OVERVIEW_ROLES.includes(role) && <LiveDashboards />}

      {canAccessNav(role, 'safety-insights') && <SafetyTrendsDashboard />}

      <DashboardQuickStart />
    </div>
  );
}