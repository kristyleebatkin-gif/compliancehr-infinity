import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { accessCall, accessError } from '@/components/users/useAppUsers';

const STATUS_TEXT = { Active: 'Active', Suspended: 'Suspended', Rejected: 'Turned away' };

// One person in User Administration (backlog 17.07). What can be done depends on where they are:
// waiting (approve / turn away), active (change role / suspend) or suspended (reactivate).
export default function AppUserAccessRow({ user, pending = false, grantableRoles = [], onChange }) {
  const { user: actor } = useAuth();
  const suspended = user.account_status === 'Suspended';
  const startRole = [user.invitation?.role, user.requested_role, suspended ? user.previous_role : user.role].find((r) => grantableRoles.includes(r)) || '';
  const [role, setRole] = useState(startRole);
  const [reason, setReason] = useState('');
  const [askReason, setAskReason] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const self = user.id === actor?.id;
  const owner = user.role === 'admin';
  const seniorLocked = user.senior && !['admin', 'Provider Administrator'].includes(actor?.role);
  const locked = saving || self || owner || seniorLocked;

  const run = async (action, extra = {}) => {
    setSaving(true); setError('');
    try {
      await accessCall(actor, { action, user_id: user.id, ...extra });
      setAskReason(false); setReason('');
      await onChange();
    } catch (e) { setError(accessError(e)); }
    finally { setSaving(false); }
  };

  const status = pending ? (user.linked ? 'Waiting for approval' : 'Signed in, not yet linked to this business') : STATUS_TEXT[user.account_status] || user.account_status || 'Active';
  const roleText = suspended ? `was ${user.previous_role || 'unknown'}` : pending ? (user.invitation ? `invited as ${user.invitation.role}${user.invitation.invited_by_name ? ` by ${user.invitation.invited_by_name}` : ''}` : 'not invited by this business') : user.role === 'admin' ? 'Owner' : user.role;

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{user.full_name || user.email}</p>
          <p className="break-all text-xs text-muted-foreground">{user.email}</p>
          <p className="text-xs text-muted-foreground">{status} · {roleText}</p>
          {!pending && user.membership && <p className="text-xs text-muted-foreground">Business membership: {user.membership.status}{user.membership.role && user.membership.role !== user.role ? ` (${user.membership.role})` : ''}</p>}
          {user.out_of_step && <p className="text-xs font-semibold text-amber-700">Business membership doesn't match this account. Saving their role puts it right.</p>}
          {self && <p className="text-xs text-muted-foreground">Another manager must change your own access.</p>}
          {seniorLocked && !self && !owner && <p className="text-xs text-muted-foreground">Senior account: only the owner or a Provider Administrator can change it.</p>}
        </div>
        {!owner && (
          <div className="flex flex-wrap items-center gap-2">
            <select aria-label={`Role for ${user.email}`} value={role} disabled={locked} onChange={(e) => setRole(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">
              <option value="" disabled>Choose role…</option>
              {grantableRoles.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>
            {pending && <>
              <Button size="sm" disabled={locked || !role} onClick={() => run('approve', { role })}>{saving ? 'Saving…' : 'Approve'}</Button>
              <Button size="sm" variant="outline" disabled={locked} onClick={() => run('reject')}>Turn away</Button>
            </>}
            {!pending && !suspended && user.access_approved && <>
              <Button size="sm" disabled={locked || !role || (role === user.role && !user.out_of_step)} onClick={() => run('role', { role })}>{saving ? 'Saving…' : 'Save role'}</Button>
              <Button size="sm" variant="outline" disabled={locked} onClick={() => setAskReason((v) => !v)}>Suspend</Button>
            </>}
            {suspended && <Button size="sm" disabled={locked || !role} onClick={() => run('reactivate', { role })}>{saving ? 'Saving…' : 'Reactivate'}</Button>}
          </div>
        )}
      </div>
      {askReason && (
        <div className="flex flex-wrap items-center gap-2 rounded-md bg-muted/50 p-2">
          <input aria-label={`Reason for suspending ${user.email}`} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (kept in the activity log)" className="h-8 min-w-48 flex-1 rounded-md border border-input bg-background px-2 text-xs" />
          <Button size="sm" variant="destructive" disabled={saving} onClick={() => run('suspend', { reason })}>Confirm suspend</Button>
          <Button size="sm" variant="ghost" disabled={saving} onClick={() => setAskReason(false)}>Cancel</Button>
        </div>
      )}
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
