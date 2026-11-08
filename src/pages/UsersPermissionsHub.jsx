import React from 'react';
import '@/components/users/usersWorkspace.css';
import ModuleShell from '@/components/module/ModuleShell';
import { Users, ShieldCheck } from 'lucide-react';
import UsersTable from '@/components/users/UsersTable';
import PermissionMatrix from '@/components/users/PermissionMatrix';
import RecentActionsPanel from '@/components/dashboard/RecentActionsPanel';
import PlatformCoreGovernanceCommandStrip from '@/components/users/PlatformCoreGovernanceCommandStrip';
import ReportGenerator from '@/components/reports/ReportGenerator';

export default function UsersPermissionsHub() {
  return (
    <div className="users-workspace compact-module space-y-4">
      <ModuleShell
        icon={Users}
        title="Users & Permissions Hub"
        subtitle="Manage organisation memberships, account approvals, row-level isolation, and role-based module access."
        moduleKey="users"
      />

      <ReportGenerator area="administration" />
      <PlatformCoreGovernanceCommandStrip />

      <section
        aria-label="Defined App Roles Overview"
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#0A2B6D]">
              Defined App Roles &amp; Module Visibility
            </h2>
            <p className="text-xs font-medium text-slate-600">
              Each role below enforces navigation gating and pairs with organisation-scoped Row-Level Security (RLS).
            </p>
          </div>
          <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-bold text-[#0A2B6D]">
            9 Canonical Roles
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9 gap-2.5">
          {[
            ['Guest', 'Public & induction view'],
            ['Participant', 'Participant portal & plans'],
            ['Employee', 'Frontline shifts & records'],
            ['Administration', 'Operational coordination'],
            ['Compliance Administrator', 'Governance, audits & risk'],
            ['Provider Administrator', 'Full organisation control'],
            ['Management', 'Executive oversight'],
            ['Auditor', 'Consented evidence review'],
            ['Volunteer', 'Supervised placement view'],
          ].map(([roleName, desc]) => (
            <div
              key={roleName}
              className="rounded-lg border border-slate-200 bg-slate-50/60 p-2.5"
            >
              <div className="text-xs font-extrabold text-[#0A2B6D]">{roleName}</div>
              <div className="mt-0.5 text-xs text-slate-600 leading-snug">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid min-w-0 gap-4">
        <div className="min-w-0 space-y-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#0A2B6D]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2B6D] text-white shadow-2xs">
              <Users className="h-4 w-4" />
            </span>
            User Account Approvals &amp; Role Assignments
          </div>
          <UsersTable />

          <div className="flex items-center gap-2 text-sm font-extrabold text-[#0A2B6D]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0A2B6D] text-white shadow-2xs">
              <ShieldCheck className="h-4 w-4" />
            </span>
            Role-to-Module Permission Matrix
          </div>
          <PermissionMatrix />
        </div>

        <RecentActionsPanel />
      </div>
    </div>
  );
}