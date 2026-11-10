import React from 'react';
import { Link } from 'react-router-dom';
import { Sun, Sparkles, LayoutDashboard, Activity, Trophy, ShieldCheck } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import ExecutiveDashboards from '@/pages/ExecutiveDashboards';
import LiveDashboards from '@/components/dashboard/LiveDashboards';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import StaffDashboard from '@/components/dashboard/StaffDashboard';
import ParticipantDashboard from '@/components/dashboard/ParticipantDashboard';
import TaskLeaderboard from '@/components/communications/TaskLeaderboard';
import { useRole } from '@/lib/useRole';
import ReportGenerator from '@/components/reports/ReportGenerator';

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

function SupportWorkspace() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Link to="/help" className="rounded-2xl border border-[#8CCBFF] bg-white/90 p-4 text-sm font-bold text-[#0A2B6D] shadow-sm transition hover:bg-[#EAF5FF]">
        Help Centre
        <span className="mt-1 block text-xs font-medium text-[#42608F]">Find help and support for your account.</span>
      </Link>
      <Link to="/user-guides" className="rounded-2xl border border-[#C7B6FF] bg-white/90 p-4 text-sm font-bold text-[#5A00D6] shadow-sm transition hover:bg-[#F5F0FF]">
        User Guides
        <span className="mt-1 block text-xs font-medium text-[#42608F]">Learn how to use your available workspace.</span>
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const { role, can } = useRole();
  const canViewBusinessCommand = can('operations-centre');

  if (!canViewBusinessCommand && role === 'Participant') {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4 px-3 pb-8 sm:px-5">
        <PageHeader title="My Participant Portal" description="Your documents, messages, routines and support information." icon={LayoutDashboard} />
        <ParticipantDashboard />
      </div>
    );
  }

  if (!canViewBusinessCommand && role === 'Employee') {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4 px-3 pb-8 sm:px-5">
        <PageHeader title="My Staff Workspace" description="Your shifts, training, records and support tools." icon={LayoutDashboard} />
        <StaffDashboard />
      </div>
    );
  }

  if (!canViewBusinessCommand) {
    return (
      <div className="mx-auto w-full max-w-[1600px] space-y-4 px-3 pb-8 sm:px-5">
        <PageHeader title="Your Choices NQ Workspace" description="Open the support resources available to your approved account." icon={LayoutDashboard} />
        <SupportWorkspace />
      </div>
    );
  }

  return (
    <div className="business-dashboard app-dashboard-canvas mx-auto w-full max-w-[1600px] space-y-4 px-3 pb-8 sm:px-5">
      <PageHeader
        title="Business Command Centre"
        description="Your live operational overview, priorities, module performance and team recognition."
        icon={LayoutDashboard}
      />

      <div className="flex flex-wrap gap-2">
        {can('today') && (
          <Link
            to="/today"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#8CCBFF] bg-white px-3 py-2 text-[12px] font-bold text-[#0A2B6D] shadow-sm transition hover:bg-[#EAF5FF]"
          >
            <Sun className="h-3.5 w-3.5" /> Administration – Lead (Sherelle)
          </Link>
        )}
        {can('team-leader') && (
          <Link
            to="/team-leader"
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#C7B6FF] bg-white px-3 py-2 text-[12px] font-bold text-[#5A00D6] shadow-sm transition hover:bg-[#F5F0FF]"
          >
            <Sparkles className="h-3.5 w-3.5" /> Team Leader - Lead (Jamie)
          </Link>
        )}
      </div>

      <DashboardSection
        title="Executive Performance"
        description="Live counts from the source registers. Select a measure to open the register and take action."
        icon={Activity}
      >
        <ExecutiveDashboards embedded />
      </DashboardSection>

      {can('compliance') && (
        <DashboardSection
          title="Compliance & Quality Oversight"
          description="Operational compliance, risk, incident, expiry and provider-quality views. Values remain linked to their source modules."
          icon={ShieldCheck}
        >
          <ReportGenerator area="administration" />
          <AdminDashboard />
        </DashboardSection>
      )}

      {can('analytics') && (
        <DashboardSection
          title="Live Module Performance"
          description="Current module record volumes and status breakdowns, with direct links to each module."
          icon={LayoutDashboard}
        >
          <LiveDashboards embedded />
        </DashboardSection>
      )}

      <DashboardSection
        title="Staff Recognition & Leaderboard"
        description="Staff task-completion points for the active competition season. Points are based on completed shared tasks."
        icon={Trophy}
      >
        <TaskLeaderboard compact={false} />
      </DashboardSection>
    </div>
  );
}