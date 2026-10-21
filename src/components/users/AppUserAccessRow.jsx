import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { ALL_ROLES } from '@/lib/roles';
import { useAuth } from '@/lib/AuthContext';

export default function AppUserAccessRow({ user, pending = false, onChange }) {
  const { user: actor } = useAuth();
  const [role, setRole] = useState(ALL_ROLES.includes(user.requested_role) ? user.requested_role : ALL_ROLES.includes(user.role) ? user.role : 'Employee');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const locked = saving || user.id === actor?.id || user.role === 'admin';
  const decide = async (action) => {
    setSaving(true); setError('');
    try {
      await base44.functions.invoke('manageAppAccess', { action, user_id: user.id, role });
      await onChange();
    } catch (e) { setError(e.response?.data?.error || e.message || 'Unable to save the decision.'); }
    finally { setSaving(false); }
  };
  return <div className="space-y-2 rounded-lg border border-border p-3">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div className="min-w-0"><p className="text-sm font-semibold">{user.full_name || user.email}</p><p className="break-all text-xs text-muted-foreground">{user.email}</p><p className="text-xs text-muted-foreground">{pending ? 'Awaiting approval' : user.account_status || 'Active'} · {user.role}</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <select aria-label={`Access role for ${user.email}`} value={role} disabled={locked} onChange={(e) => setRole(e.target.value)} className="h-8 rounded-md border border-input bg-background px-2 text-xs">{ALL_ROLES.map((value) => <option key={value}>{value}</option>)}</select>
        <Button size="sm" disabled={locked || (!pending && !user.access_approved)} onClick={() => decide(pending ? 'approve' : 'role')}>{saving ? 'Saving…' : pending ? 'Approve' : 'Save role'}</Button>
        {pending && <Button size="sm" variant="outline" disabled={locked} onClick={() => decide('reject')}>Reject</Button>}
      </div>
    </div>
    {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}