import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAppUsers from '@/components/users/useAppUsers';
import AppUserAccessRow from '@/components/users/AppUserAccessRow';
import AppUserInviteDialog from '@/components/users/AppUserInviteDialog';

export default function UsersTable() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error, enabled, refresh } = useAppUsers(search);
  if (!enabled) return <p>Only approved management can manage app users.</p>;
  return <div className="space-y-4">
    <section id="pending-approvals" className="space-y-3 rounded-xl border border-warning/40 bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold">Pending approvals {data ? `(${data.pending_count})` : ''}</h2><Button size="sm" variant="outline" onClick={refresh}>Refresh</Button></div>
      <p className="text-xs text-muted-foreground">New sign-ins awaiting access appear here automatically. Approve a role or reject the request.</p>
      {isLoading && <p role="status" className="text-sm">Loading app users…</p>}
      {error ? <p role="alert" className="text-sm text-destructive">Unable to load approval requests. Please refresh.</p> : data?.pending_users?.length ? data.pending_users.map((user) => <AppUserAccessRow key={user.id} user={user} pending onChange={refresh} />) : !isLoading && <p className="text-sm text-muted-foreground">No accounts awaiting approval.</p>}
    </section>
    <section className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold">App users and roles</h2><div className="flex items-center gap-2"><Input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-44" /><AppUserInviteDialog onChange={refresh} /></div></div>
      {data?.users?.map((user) => <AppUserAccessRow key={user.id} user={user} onChange={refresh} />)}
      {!isLoading && !error && !data?.users?.length && <p className="text-sm text-muted-foreground">No matching app users.</p>}
    </section>
  </div>;
}