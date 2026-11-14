import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/lib/AuthContext';
import { accessCall, accessError } from '@/components/users/useAppUsers';

export default function AppUserInviteDialog({ grantableRoles = [], onChange }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError(''); setNote('');
    try {
      const res = await accessCall(user, { action: 'invite', email: email.trim(), role });
      setEmail('');
      if (res?.already_signed_up) setNote('They already have a sign-in, so no email was sent. They are now waiting for your approval below.');
      else setOpen(false);
      await onChange();
    } catch (e) { setError(accessError(e)); }
    finally { setSaving(false); }
  };
  return <>
    <Button size="sm" onClick={() => { setOpen(true); setNote(''); setError(''); }}>Invite user</Button>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader><DialogTitle>Invite someone to this business</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <label className="block text-sm">Email<Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className="block text-sm">Role once approved
            <select value={role} onChange={(e) => setRole(e.target.value)} className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm">
              {grantableRoles.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
          <p className="text-xs text-muted-foreground">They get a sign-in email. When they first sign in they wait here for approval, and approving links them to this business. The invitation lasts 14 days.</p>
          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          {note && <p role="status" className="text-sm text-emerald-700">{note}</p>}
          <Button disabled={saving} type="submit">{saving ? 'Sending…' : 'Send invite'}</Button>
        </form>
      </DialogContent>
    </Dialog>
  </>;
}
