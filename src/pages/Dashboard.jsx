import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Smartphone } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ExecutiveDashboards from '@/pages/ExecutiveDashboards';
import LiveDashboards from '@/components/dashboard/LiveDashboards';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
import { useRole } from '@/lib/useRole';
import { LayoutDashboard, Activity, Trophy, ShieldCheck } from 'lucide-react';
import ReportGenerator from '@/components/reports/ReportGenerator';

const ADMIN_ROLES = ['admin', 'Provider Administrator', 'Administration'];

function DashboardSection({ title, description, icon: Icon, children }) {
  return (
    <section className="space-y-3 rounded-2xl border border-[#8CCBFF]/70 bg-white/90 p-3 shadow-[0_8px_28px_rgba(10,43,109,0.08)] backdrop-blur-md sm:p-4">
      <div className="flex items-start gap-3 border-b border-[#D9ECFF] pb-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#8CCBFF] bg-[#EAF5FF] text-[#0A2B6D]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-[#0A2B6D] sm:text-lg">{title}</h2>
          <p className="text-sm font-semibold leading-relaxed text-workspace-navy">{description}</p>
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

      <div className="flex flex-wrap gap-2">
        <Link
          to="/today"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#8CCBFF] bg-white px-3 py-1.5 text-[12px] font-bold text-[#0A2B6D] shadow-sm transition hover:bg-[#EAF5FF]"
        >
          <Sun className="h-3.5 w-3.5" /> Today workspace
        </Link>
        <Link
          to="/team-leader"
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7B6FF] bg-white px-3 py-1.5 text-[12px] font-bold text-[#5A00D6] shadow-sm transition hover:bg-[#F5F0FF]"
        >
          <Smartphone className="h-3.5 w-3.5" /> Team leader app
        </Link>
      </div>

      <DashboardSection
        title="Executive Performance"
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