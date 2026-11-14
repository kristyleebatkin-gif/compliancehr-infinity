import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/AuthContext';
import useAppUsers, { accessCall, accessError } from '@/components/users/useAppUsers';
import AppUserAccessRow from '@/components/users/AppUserAccessRow';
import AppUserInviteDialog from '@/components/users/AppUserInviteDialog';

const Section = ({ label, title, hint, actions, children }) => (
  <section aria-label={label} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-panel">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <h3 className="text-sm font-extrabold text-[#0A2B6D]">{title}</h3>
        {hint && <p className="text-xs text-slate-600">{hint}</p>}
      </div>
      {actions}
    </div>
    {children}
  </section>
);

const Empty = ({ children }) => <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs font-medium text-slate-600">{children}</p>;

function InvitationRow({ invite, onChange }) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const cancel = async () => {
    setSaving(true); setError('');
    try { await accessCall(user, { action: 'cancel_invite', id: invite.id }); await onChange(); }
    catch (e) { setError(accessError(e)); }
    finally { setSaving(false); }
  };
  const expires = invite.expires_at ? new Date(invite.expires_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' }) : '';
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="break-all text-sm font-semibold">{invite.email}</p>
        <p className="text-xs text-muted-foreground">As {invite.role}{invite.invited_by_name ? ` · invited by ${invite.invited_by_name}` : ''} · {invite.expired ? <span className="font-semibold text-amber-700">expired {expires}, invite again to renew</span> : `waiting for them to sign in, until ${expires}`}</p>
        {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
      </div>
      <Button size="sm" variant="outline" disabled={saving} onClick={cancel}>{saving ? 'Cancelling…' : 'Cancel invitation'}</Button>
    </div>
  );
}

// User Administration (backlog 17.07): invite, approve and link, change roles, suspend and reactivate.
export default function UsersTable() {
  const [search, setSearch] = useState('');
  const [showSuspended, setShowSuspended] = useState(false);
  const { data, isLoading, error, enabled, refresh } = useAppUsers(search);
  if (!enabled) {
    return (
      <div role="region" aria-label="Restricted Access Notice" className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-950">
        <p className="font-bold">Administrator Permission Required</p>
        <p className="mt-1 text-xs text-amber-900">Only approved Provider Administrators and Management roles can approve accounts or change roles. Contact your organisation administrator if you need this.</p>
      </div>
    );
  }
  const roles = data?.grantable_roles || [];
  const users = data?.users || [];
  const current = users.filter((u) => u.account_status !== 'Suspended' && u.account_status !== 'Rejected');
  const suspended = users.filter((u) => u.account_status === 'Suspended');
  const outOfStep = users.filter((u) => u.out_of_step).length;
  const failed = error && (
    <div role="alert" className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <span>{accessError(error, 'Unable to load accounts.')} Check your connection and try again.</span>
      <Button size="sm" variant="outline" onClick={refresh} className="min-h-8 text-xs">Retry</Button>
    </div>
  );

  return (
    <div className="space-y-4">
      <Section
        label="Pending Account Approvals"
        title={`Waiting for approval ${data ? `(${data.pending_count})` : ''}`}
        hint={data?.is_owner
          ? 'People who have signed in but cannot use the app yet. Approving gives them a role and links them to this business. As the owner you also see people who signed up without an invitation.'
          : 'People this business invited who have now signed in. Approving gives them a role and links them to this business.'}
        actions={<Button size="sm" variant="outline" onClick={refresh} className="min-h-9 text-xs font-bold">Refresh</Button>}
      >
        {isLoading && <p role="status" className="text-sm text-slate-600">Loading…</p>}
        {failed || (data?.pending_users?.length
          ? data.pending_users.map((u) => <AppUserAccessRow key={u.id} user={u} pending grantableRoles={roles} onChange={refresh} />)
          : !isLoading && <Empty>All caught up — no user accounts are awaiting approval.</Empty>)}
      </Section>

      {data?.invitations?.length > 0 && (
        <Section label="Invitations sent" title={`Invitations sent (${data.invitations.length})`} hint="Invited, but they haven't signed in yet.">
          {data.invitations.map((i) => <InvitationRow key={i.id} invite={i} onChange={refresh} />)}
        </Section>
      )}

      <Section
        label="Active App Users Directory"
        title="People in this business"
        hint="Change roles, or suspend someone who should no longer have access. Every change is recorded in the activity log."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Input type="search" aria-label="Search app users by name or email" placeholder="Search by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-56 text-sm" />
            <AppUserInviteDialog grantableRoles={roles} onChange={refresh} />
          </div>
        }
      >
        {outOfStep > 0 && <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">{outOfStep} {outOfStep === 1 ? 'person has' : 'people have'} a business membership that doesn't match their account. It's marked on their row.</p>}
        {current.map((u) => <AppUserAccessRow key={u.id} user={u} grantableRoles={roles} onChange={refresh} />)}
        {!isLoading && !error && !current.length && <Empty>No matching people. Clear your search or invite someone.</Empty>}
        {suspended.length > 0 && (
          <div className="space-y-2">
            <Button size="sm" variant="ghost" className="text-xs" onClick={() => setShowSuspended((v) => !v)}>{showSuspended ? 'Hide' : 'Show'} suspended ({suspended.length})</Button>
            {showSuspended && suspended.map((u) => <AppUserAccessRow key={u.id} user={u} grantableRoles={roles} onChange={refresh} />)}
          </div>
        )}
      </Section>
    </div>
  );
}
