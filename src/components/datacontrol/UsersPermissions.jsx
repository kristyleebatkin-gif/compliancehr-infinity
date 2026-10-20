import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, ShieldCheck, Users } from 'lucide-react';
import { format } from 'date-fns';

const ROLE_TONES = { admin: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-300', user: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };

const PERMISSION_MATRIX = [
  ['admin / Provider Administrator', 'Full access to all modules, users and settings; manages roles and permissions.'],
  ['Compliance Manager', 'Compliance, incidents, risks, audits, documents, training and safety records.'],
  ['Administration', 'Day-to-day records, invoicing, intake, communications and reporting.'],
  ['Support Worker', 'Own shifts, shift notes, incident reporting, participant supports and assigned tasks.'],
  ['Participant', 'Own goals, plans, feedback and training records.'],
  ['Auditor', 'Read-only access to records where audit consent has been received.'],
];

export default function UsersPermissions() {
  const { toast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const records = await base44.entities.User.list();
      setUsers(records);
      setDenied(false);
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
    } catch (error) {
      toast({ title: 'Could not change role', description: 'Only admins can update other users.', variant: 'destructive' });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><Users className="h-4 w-4 text-brand" />App users and roles</div>
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : denied ? (
          <p className="text-sm text-muted-foreground">User management is restricted to administrators.</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users registered yet.</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div key={user.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{user.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email} · joined {user.created_date ? format(new Date(user.created_date), 'd MMM yyyy') : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={ROLE_TONES[user.role] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}>{user.role}</Badge>
                  <select
                    value={user.role}
                    disabled={savingId === user.id}
                    onChange={(e) => changeRole(user, e.target.value)}
                    className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  >
                    <option value="admin">admin</option>
                    <option value="user">user</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-4">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4 text-brand" />Role permission summary</div>
        <div className="space-y-1.5">
          {PERMISSION_MATRIX.map(([role, description]) => (
            <div key={role} className="grid gap-1 rounded-lg bg-muted/40 p-2.5 md:grid-cols-[220px_1fr] md:gap-3">
              <p className="text-xs font-semibold">{role}</p>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Detailed per-record permissions are enforced by row-level security on every module — staff, participants and auditors only see what their role permits.</p>
      </div>
    </div>
  );
}