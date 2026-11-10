import React from 'react';
import PageHeader from '@/components/PageHeader';
import ExecutiveDashboards from '@/pages/ExecutiveDashboards';
import LiveDashboards from '@/components/dashboard/LiveDashboards';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
import { useRole } from '@/lib/useRole';
import { LayoutDashboard, Activity, Trophy, ShieldCheck } from 'lucide-react';
import ReportGenerator from '@/components/reports/ReportGenerator';

const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Administration'];

function DashboardSection({ title, description, icon: Icon, children, glass = false }) {
  return (
    <section className={glass ? 'executive-glass-surface space-y-3 rounded-2xl border border-header-foreground/20 p-3 shadow-panel sm:p-4' : 'space-y-3 rounded-2xl border border-[#8CCBFF]/70 bg-white/90 p-3 shadow-[0_8px_28px_rgba(10,43,109,0.08)] backdrop-blur-md sm:p-4'}>
      <div className={glass ? 'flex items-start gap-3 border-b border-header-foreground/20 pb-3' : 'flex items-start gap-3 border-b border-[#D9ECFF] pb-3'}>
        <span className={glass ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-header-foreground/20 bg-workspace-navy/70 text-header-foreground backdrop-blur-md' : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#8CCBFF] bg-[#EAF5FF] text-[#0A2B6D]'}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className={glass ? 'text-base font-extrabold text-header-foreground sm:text-lg' : 'text-base font-extrabold text-[#0A2B6D] sm:text-lg'}>{title}</h2>
          <p className={glass ? 'text-sm font-semibold leading-relaxed text-header-foreground' : 'text-sm font-semibold leading-relaxed text-workspace-navy'}>{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

export default function Dashboard() {
  const { role } = useRole();
  const isAdmin = ADMIN_ROLES.includes(role);

  return (
    <div className="business-dashboard app-dashboard-canvas mx-auto w-full max-w-[1600px] space-y-4 px-3 pb-8 sm:px-5">
      <PageHeader
        title="Business Command Centre"
        description="Your live operational overview, priorities, module performance and team recognition."
        icon={LayoutDashboard}
      />

      <DashboardSection
        title="Executive Performance"
        glass
        description="Live counts from the source registers. Select a measure to open the register and take action."
        icon={Activity}
      >
        <ExecutiveDashboards />
      </DashboardSection>

      {isAdmin && (
        <DashboardSection
          title="Compliance & Quality Oversight"
          description="Operational compliance, risk, incident, expiry and provider-quality views. Values remain linked to their source modules."
          icon={ShieldCheck}
        >
          <ReportGenerator area="administration" />
          <AdminDashboard />
        </DashboardSection>
      )}

      <DashboardSection
        title="Live Module Performance"
        description="Current module record volumes and status breakdowns, with direct links to each module."
        icon={LayoutDashboard}
      >
        <LiveDashboards />
      </DashboardSection>

      <DashboardSection
        title="Staff Recognition & Leaderboard"
        description="Team task-completion points for the active competition season."
        icon={Trophy}
      >
        <TaskLeaderboard compact={false} />
      </DashboardSection>
    </div>
  );
}