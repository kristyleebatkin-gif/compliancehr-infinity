import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function AppUserInviteDialog({ onChange }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      await base44.functions.invoke('manageAppAccess', { action: 'invite', email: email.trim() });
      setOpen(false); setEmail(''); await onChange();
    } catch (e) { setError(e.response?.data?.error || e.message); }
    finally { setSaving(false); }
  };
  return <><Button size="sm" onClick={() => setOpen(true)}>Invite user</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-sm"><DialogHeader><DialogTitle>Invite a user</DialogTitle></DialogHeader>
    <form onSubmit={submit} className="space-y-3"><label className="block text-sm">Email<Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></label><p className="text-xs text-muted-foreground">New users need management approval before accessing the app. Choose their role when approving.</p>{error && <p role="alert" className="text-sm text-destructive">{error}</p>}<Button disabled={saving} type="submit">{saving ? 'Sending…' : 'Send invite'}</Button></form>
  </DialogContent></Dialog></>;
}