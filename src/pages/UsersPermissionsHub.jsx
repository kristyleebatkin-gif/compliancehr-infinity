import React from 'react';
import '@/components/users/usersWorkspace.css';
import ModuleShell from '@/components/module/ModuleShell';
import { Users, ShieldCheck } from 'lucide-react';
import UsersTable from '@/components/users/UsersTable';
import PermissionMatrix from '@/components/users/PermissionMatrix';
import RecentActionsPanel from '@/components/dashboard/RecentActionsPanel';

export default function UsersPermissionsHub() {
  return (
    <div className="users-workspace compact-module space-y-2">
      <ModuleShell
        icon={Users}
        title="Users & Permissions Hub"
        subtitle="Manage app users, 7 Core Roles + Custom Roles, View/Edit/Submit/Approve separation of duties, and per-module permissions."
        moduleKey="users"
      />

      <div className="rounded-xl border-2 border-[#12214B] bg-[#F4EAFB]/40 p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-[#12214B]">
              Section 3 — 7 Core User Roles &amp; Custom Role Separation of Duties
            </h3>
            <p className="text-[10px] font-semibold text-[#442078]">
              Enforces separation between View, Edit, Submit, and Approve across all 45 operational modules
            </p>
          </div>
          <span className="rounded-full bg-[#12214B] px-2.5 py-0.5 text-[10px] font-black text-white">
            7 Core Roles + Custom Roles Active
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
          {[
            ['Guest', 'Public & Portal Preview'],
            ['Participant', 'Own Plan, Goals & Consents'],
            ['Employee', 'Roster, Shift Notes & HR'],
            ['Administration', 'Operational Registers'],
            ['Compliance Administrator', '356 Checkpoints & 98 Docs'],
            ['Provider Administrator', 'Full Executive & Safe Control'],
            ['Auditor', 'Read-Only Consented Evidence'],
            ['Custom Roles', 'HR / Finance / Quality / Intake'],
          ].map(([roleName, desc]) => (
            <div key={roleName} className="rounded-lg border border-[#A45CDE]/50 bg-white p-1.5">
              <div className="text-[10px] font-black text-[#12214B]">{roleName}</div>
              <div className="text-[9px] font-semibold text-[#442078] leading-tight">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 gap-2">
        {/* Left side under the header: users and the permission matrix */}
        <div className="min-w-0 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-sm"><Users className="h-3.5 w-3.5" /></span>
            Users &amp; roles
          </div>
          <UsersTable />

          <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm"><ShieldCheck className="h-3.5 w-3.5" /></span>
            Permission matrix
          </div>
          <PermissionMatrix />
        </div>

        <RecentActionsPanel />
      </div>
    </div>
  );
}