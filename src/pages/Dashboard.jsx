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
import { Activity, ShieldCheck, Sparkles, Zap } from 'lucide-react';

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
    <div className="mx-auto max-w-6xl p-4 md:p-8 space-y-6">
      <div className="relative overflow-hidden rounded-3xl gradient-brand p-6 text-white shadow-2xl shadow-violet-500/25 md:p-8">
        <div className="absolute -right-12 -top-20 h-56 w-56 rounded-full bg-violet-200/20 blur-sm" />
        <div className="absolute left-[42%] top-[-5rem] h-40 w-40 rounded-full bg-cyan-300/20 blur-xl" />
        <div className="absolute -bottom-20 right-28 h-44 w-44 rounded-full bg-teal-200/20" />
        <div className="absolute -bottom-24 -left-12 h-48 w-48 rounded-full bg-violet-900/25" />
        <div className="relative mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-cyan-100" />
          Your ComplianceHR Infinity workspace
        </div>
        <h1 className="relative font-display text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          {firstName ? `Welcome, ${firstName}` : heading.title}
        </h1>
        <p className="relative mt-3 max-w-3xl text-sm leading-6 text-white/85 md:text-base">{heading.sub}</p>
        <div className="relative mt-6 flex flex-wrap gap-2.5">
          {[
            [ShieldCheck, heading.title],
            [Activity, 'Live compliance overview'],
            [Zap, 'Quick access to every module'],
          ].map(([Icon, label]) => (
            <div key={label} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/15 px-3 py-2 text-xs font-semibold text-white/90 backdrop-blur-sm">
              <Icon className="h-4 w-4 text-cyan-100" />
              {label}
            </div>
          ))}
        </div>
      </div>

      <DashboardQuickStart />

      {canAccessNav(role, 'compliance') && <MorningBrief />}

      {canAccessNav(role, 'compliance') && <IssuesDashboardWidget />}

      <AllModulesHub />

      {role === ROLES.PARTICIPANT
        ? <ParticipantDashboard />
        : (role === ROLES.SUPPORT)
          ? <StaffDashboard />
          : <AdminDashboard />}

      {canAccessNav(role, 'safety-insights') && <SafetyTrendsDashboard />}
    </div>
  );
}