import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useAppUsers from '@/components/users/useAppUsers';
import AppUserAccessRow from '@/components/users/AppUserAccessRow';
import AppUserInviteDialog from '@/components/users/AppUserInviteDialog';

export default function UsersTable() {
  const [search, setSearch] = useState('');
  const { data, isLoading, error, enabled, refresh } = useAppUsers(search);
  if (!enabled) {
    return (
      <div
        role="region"
        aria-label="Restricted Access Notice"
        className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950"
      >
        <p className="font-bold">Administrator Permission Required</p>
        <p className="mt-1 text-xs text-amber-900">
          Only approved Provider Administrators and Management roles can approve accounts or modify role assignments. Contact your organisation administrator if you require elevated access.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <section
        id="pending-approvals"
        aria-label="Pending Account Approvals"
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#0A2B6D]">
              Pending Account Approvals {data ? `(${data.pending_count})` : ''}
            </h3>
            <p className="text-xs text-slate-600">
              New sign-ins remain blocked by default until an administrator verifies their identity and approves a role.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={refresh} className="min-h-9 text-xs font-bold">
            Refresh Queue
          </Button>
        </div>
        {isLoading && (
          <p role="status" className="text-sm text-slate-600">
            Loading pending approval requests…
          </p>
        )}
        {error ? (
          <div role="alert" className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
            <span>Unable to load approval requests. Check your connection and try again.</span>
            <Button size="sm" variant="outline" onClick={refresh} className="min-h-8 text-xs">
              Retry
            </Button>
          </div>
        ) : data?.pending_users?.length ? (
          data.pending_users.map((user) => (
            <AppUserAccessRow key={user.id} user={user} pending onChange={refresh} />
          ))
        ) : (
          !isLoading && (
            <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600">
              All caught up — no user accounts are awaiting approval.
            </p>
          )
        )}
      </section>

      <section
        aria-label="Active App Users Directory"
        className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-panel"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-[#0A2B6D]">
              Organisation Directory &amp; Role Assignments
            </h3>
            <p className="text-xs text-slate-600">
              Review active accounts, update roles, or suspend access with full audit logging.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              type="search"
              aria-label="Search app users by name or email"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-56 text-sm"
            />
            <AppUserInviteDialog onChange={refresh} />
          </div>
        </div>
        {data?.users?.map((user) => (
          <AppUserAccessRow key={user.id} user={user} onChange={refresh} />
        ))}
        {!isLoading && !error && !data?.users?.length && (
          <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600">
            No matching app users found. Clear your search filter or invite a new team member.
          </p>
        )}
      </section>
    </div>
  );
}