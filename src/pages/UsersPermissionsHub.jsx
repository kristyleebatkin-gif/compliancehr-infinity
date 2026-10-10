import React from 'react';
import PageHeader from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, ShieldCheck } from 'lucide-react';
import UsersTable from '@/components/users/UsersTable';
import PermissionMatrix from '@/components/users/PermissionMatrix';

export default function UsersPermissionsHub() {
  return (
    <div className="space-y-6">
      <PageHeader
        icon={Users}
        title="Users & Permissions Hub"
        subtitle="Manage app users, roles, invitations and per-module permissions."
      />

      <Tabs defaultValue="users">
        <TabsList className="flex-wrap">
          <TabsTrigger value="users"><Users className="mr-1.5 h-4 w-4" /> Users</TabsTrigger>
          <TabsTrigger value="permissions"><ShieldCheck className="mr-1.5 h-4 w-4" /> Permission matrix</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <UsersTable />
        </TabsContent>

        <TabsContent value="permissions" className="mt-4">
          <PermissionMatrix />
        </TabsContent>
      </Tabs>
    </div>
  );
}