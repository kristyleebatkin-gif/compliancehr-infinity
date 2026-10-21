import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';

export default function PortalInviteButton({ kind, profile }) {
  const { isAdmin } = useRole();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Employee');
  const [busy, setBusy] = useState(false);

  if (!isAdmin) return null;

  const openDialog = () => {
    setEmail(profile?.email || '');
    setRole(kind === 'participant' ? 'Participant' : 'Employee');
    setOpen(true);
  };

  const invite = async () => {
    if (!email.trim() || !email.trim().includes('@')) {
      toast({ title: 'Enter a valid email address', variant: 'destructive' });
      return;
    }
    setBusy(true);
    try {
      const { data } = await base44.functions.invoke('manageAppAccess', { action: 'invite', email: email.trim(), kind, profile_id: profile?.id });
      if (data.error) throw new Error(data.error);
      toast({
        title: 'Invitation sent',
        description: `${email.trim()} sets a password from the email, then sees only their own data.`,
      });
      setOpen(false);
    } catch (e) {
      toast({ title: 'Invite failed', description: e.message || 'Please try again.', variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={openDialog}>
        <UserPlus className="h-4 w-4" />
        {profile ? 'Invite to portal' : kind === 'participant' ? 'Invite participant' : 'Invite employee'}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite to the portal</DialogTitle>
            <DialogDescription>
              {profile
                ? `${profile.full_name} gets an email with a link to set a password. After signing in, they will only see their own profile and data.`
                : 'They get an email with a link to set a password. After signing in, they will only see their own profile and data.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                disabled={busy || !!profile}
              />
            </div>
            <p className="text-xs text-muted-foreground">Portal access: {role}. New accounts invited from this profile are linked by their sign-in email. Existing active accounts keep their current role; suspended or rejected accounts still need management review.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button onClick={invite} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}