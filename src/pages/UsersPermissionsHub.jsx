import React from 'react';
import PageHeader from '@/components/PageHeader';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import { Users, ShieldCheck, ClipboardCheck } from 'lucide-react';
import UsersTable from '@/components/users/UsersTable';
import PermissionMatrix from '@/components/users/PermissionMatrix';

export default function UsersPermissionsHub() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Users & Permissions Hub"
        subtitle="Manage app users, roles, invitations and per-module permissions."
        showAlerts={false}
        showAudit={false}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left side under the header: users and the permission matrix */}
        <div className="space-y-6 lg:col-span-2">
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

        {/* Right side: audit checklist and report, moved over */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-sm"><ClipboardCheck className="h-3.5 w-3.5" /></span>
            Audit this module
          </div>
          <div className="flex flex-wrap gap-2">
            <ModuleAuditChecklistButton />
            <ModuleAuditButton />
          </div>
          <p className="text-xs text-muted-foreground">
            Run a live compliance audit checklist or generate an audit report covering users, roles and module permissions.
          </p>
        </div>
      </div>
    </div>
  );
}