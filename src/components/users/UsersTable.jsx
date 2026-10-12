import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, UserPlus, Users } from 'lucide-react';
import { format } from 'date-fns';
import { ALL_ROLES } from '@/lib/roles';

const ROLE_TONES = { admin: 'bg-purple-100 text-purple-800', user: 'bg-slate-100 text-slate-700' };

export default function UsersTable() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [search, setSearch] = useState('');

  const [inviteOpen, setInviteOpen] = useState(false);
  const [invite, setInvite] = useState({ email: '', role: 'user' });
  const [inviting, setInviting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await base44.entities.User.list({ sort: 'full_name', limit: 200 });
      setUsers(page.items);
    } catch {
      setDenied(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const changeRole = async (user, role) => {
    setSavingId(user.id);
    try {
      await base44.entities.User.update(user.id, { role });
      toast({ title: 'Role updated', description: `${user.full_name || user.email} is now ${role}.` });
      await load();
    } catch {
      toast({ title: 'Could not change role', description: 'Only admins can update other users.', variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  const sendInvite = async () => {
    setInviting(true);
    try {
      await base44.users.inviteUser(invite.email.trim(), invite.role);
      toast({ title: 'Invitation sent', description: `${invite.email} was invited as ${invite.role}.` });
      setInvite({ email: '', role: 'user' });
      setInviteOpen(false);
      await load();
    } catch {
      toast({ title: 'Could not invite user', description: 'Only admins can send invitations.', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const filtered = users.filter((u) =>
    `${u.full_name || ''} ${u.email || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-brand" />App users and roles</div>
          <div className="flex items-center gap-2">
            <Input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-8 w-44" />
            <Button size="sm" onClick={() => setInviteOpen(true)}><UserPlus className="mr-1.5 h-4 w-4" /> Invite user</Button>
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : denied ? (
          <p className="text-sm text-muted-foreground">User management is restricted to administrators.</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users registered yet.</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{user.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email} · joined {user.created_date ? format(new Date(user.created_date), 'd MMM yyyy') : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={ROLE_TONES[user.role] || 'bg-slate-100 text-slate-700'}>{user.role}</Badge>
                  <select
                    value={user.role}
                    disabled={savingId === user.id}
                    onChange={(e) => changeRole(user, e.target.value)}
                    className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  >
                    {ALL_ROLES.map((roleOption) => (
                      <option key={roleOption} value={roleOption}>{roleOption}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Invite a user</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Email *</Label>
              <Input type="email" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} placeholder="name@example.com" />
            </div>
            <div className="grid gap-1.5"><Label>Role</Label>
              <Select value={invite.role} onValueChange={(v) => setInvite({ ...invite, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ALL_ROLES.map((roleOption) => (
                    <SelectItem key={roleOption} value={roleOption}>{roleOption}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={sendInvite} disabled={inviting || !invite.email.trim()}>
              {inviting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
              Send invite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}