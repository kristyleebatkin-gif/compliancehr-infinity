import React from 'react';
import '@/components/users/usersWorkspace.css';
import PageHeader from '@/components/PageHeader';
import { Users, ShieldCheck } from 'lucide-react';
import UsersTable from '@/components/users/UsersTable';
import PermissionMatrix from '@/components/users/PermissionMatrix';
import RecentActionsPanel from '@/components/dashboard/RecentActionsPanel';

export default function UsersPermissionsHub() {
  return (
    <div className="users-workspace compact-module space-y-2">
      <PageHeader
        icon={Users}
        title="Users & Permissions Hub"
        subtitle="Manage app users, roles, invitations and per-module permissions."
        showAlerts={false}
        
      />

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