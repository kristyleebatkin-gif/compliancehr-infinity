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
        subtitle="Manage app users, access approvals, and module visibility for the 8 roles defined in the app."
        moduleKey="users"
      />

      <div className="rounded-xl border-2 border-[#0284c7] bg-sky-50/70 p-2.5" style={{ borderTopWidth: '4px' }}>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-sky-950">
              Defined app roles and module visibility
            </h3>
            <p className="text-[10px] font-semibold text-sky-800">
              The matrix shows which modules each defined role can open.
            </p>
          </div>
          <span className="rounded-full bg-[#0284c7] px-2.5 py-0.5 text-[10px] font-black text-white">
            8 Defined Roles
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-1.5">
          {[
            ['Guest', 'Guest access', '#6366f1'],
            ['Participant', 'Participant workspace', '#e11d48'],
            ['Employee', 'Employee workspace', '#2563eb'],
            ['Administration', 'Operations access', '#0891b2'],
            ['Compliance Administrator', 'Compliance access', '#6d28d9'],
            ['Provider Administrator', 'Provider administration', '#db2777'],
            ['Management', 'Management access', '#0d9488'],
            ['Auditor', 'Auditor access', '#1d4ed8'],
          ].map(([roleName, desc, hex]) => (
            <div key={roleName} className="rounded-lg border bg-white p-1.5" style={{ borderColor: `${hex}66`, borderTopWidth: '3px', borderTopColor: hex }}>
              <div className="text-[10px] font-black" style={{ color: hex }}>{roleName}</div>
              <div className="text-[9px] font-semibold text-violet-900 leading-tight">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      <p className="px-1 text-[11px] text-muted-foreground">The matrix describes module visibility only; it does not confirm record-level or action-level controls.</p>\n\n      <div className="grid min-w-0 gap-2">
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