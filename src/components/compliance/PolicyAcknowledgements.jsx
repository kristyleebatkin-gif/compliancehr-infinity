import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { FileCheck2, Loader2, CheckCircle2 } from 'lucide-react';
import SectionCard from '@/components/SectionCard';
import EmptyState from '@/components/EmptyState';
import { useRole } from '@/lib/useRole';

const STAFF_ROLES = ['admin', 'Provider Administrator', 'Compliance Manager', 'Quality & Improvement Manager', 'Administration', 'Team Leader', 'Support Worker', 'Finance & Accounts Officer', 'Human Resources Manager', 'Rostering Coordinator', 'CRM & Marketing Officer', 'Intake Officer', 'Volunteer'];

// Latest version of a policy = highest version string, falling back to the newest record.
const versionRank = (v) => (String(v || '').split('.').map((n) => parseInt(n, 10) || 0).reduce((a, b) => a * 100 + b, 0));

export default function PolicyAcknowledgements({ policies }) {
  const { toast } = useToast();
  const { can } = useRole();
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [users, setUsers] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ackP, userP, meUser] = await Promise.all([
        base44.entities.PolicyAcknowledgement.filter({}, { sort: '-acknowledged_date', limit: 500 }),
        base44.entities.User.list(),
        base44.auth.me(),
      ]);
      setAcknowledgements(ackP.items || []);
      setUsers(userP || []);
      setMe(meUser || null);
    } catch (e) { console.error(e); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const activePolicies = (policies || []).filter((p) => p.status === 'Active' || p.status === 'Under Review');
  const latestByName = new Map();
  activePolicies.forEach((p) => {
    const key = p.document_name;
    const existing = latestByName.get(key);
    if (!existing || versionRank(p.version) > versionRank(existing.version)) latestByName.set(key, p);
  });
  const latestPolicies = Array.from(latestByName.values());

  const myName = (me?.full_name || '').trim();
  const myAck = new Map(acknowledgements.filter((a) => me && (a.staff_user_id === me.id || a.staff_email === me.email)).map((a) => [a.policy_id, a]));

  const staffUsers = users.filter((u) => STAFF_ROLES.includes(u.role) && u.account_status !== 'Archived');

  const acknowledge = async (p) => {
    setSavingId(p.id);
    try {
      await base44.entities.PolicyAcknowledgement.create({
        policy_id: p.id,
        policy_name: p.document_name,
        policy_version: p.version || '',
        staff_user_id: me?.id || '',
        staff_name: myName || me?.email || 'Staff member',
        staff_email: me?.email || '',
        acknowledged_date: format(new Date(), 'yyyy-MM-dd'),
      });
      toast({ title: 'Acknowledgement recorded' });
      await load();
    } catch (e) {
      toast({ title: 'Failed to record acknowledgement', description: e.message, variant: 'destructive' });
    }
    setSavingId(null);
  };

  const pending = latestPolicies.filter((p) => !myAck.has(p.id));

  return (
    <div className="space-y-4">
      <SectionCard
        title="Policies awaiting your acknowledgement"
        description="Confirm you have read the latest version of each active policy"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-foreground/50"><Loader2 className="h-4 w-4 animate-spin" /> Loading acknowledgements…</div>
        ) : pending.length === 0 ? (
          <div className="flex items-center gap-2 rounded-lg bg-safe/10 p-3 text-sm font-medium text-safe"><CheckCircle2 className="h-4 w-4" /> You're fully up to date — all active policies acknowledged.</div>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {pending.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{p.document_name}</p>
                  <p className="text-xs text-foreground/50">{p.category}{p.version ? ` · v${p.version}` : ''}</p>
                </div>
                <Button size="sm" className="shrink-0" onClick={() => acknowledge(p)} disabled={savingId === p.id || !me}>
                  {savingId === p.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileCheck2 className="h-4 w-4" />} I acknowledge
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {can('compliance') && (
        <SectionCard
          title="Acknowledgement coverage"
          description="Which staff have read and acknowledged each policy's latest version"
        >
          {latestPolicies.length === 0 ? (
            <EmptyState icon={FileCheck2} title="No active policies to track" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 text-left text-xs text-foreground/50">
                    <th className="px-3 py-2 font-medium">Policy</th>
                    <th className="px-3 py-2 font-medium">Version</th>
                    <th className="px-3 py-2 font-medium">Acknowledged</th>
                    <th className="px-3 py-2 font-medium">Not yet</th>
                  </tr>
                </thead>
                <tbody>
                  {latestPolicies.map((p) => {
                    const done = acknowledgements.filter((a) => a.policy_id === p.id);
                    const doneIds = new Set(done.map((a) => a.staff_user_id || a.staff_email));
                    const outstanding = staffUsers.filter((u) => !doneIds.has(u.id) && !doneIds.has(u.email));
                    return (
                      <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30 align-top">
                        <td className="px-3 py-2.5 font-medium">{p.document_name}</td>
                        <td className="px-3 py-2.5 text-foreground/60">{p.version || '—'}</td>
                        <td className="px-3 py-2.5">
                          <Badge className={done.length ? 'bg-safe/15 text-safe border-transparent' : 'bg-warning/15 text-warning border-transparent'}>{done.length} acknowledged</Badge>
                          <div className="mt-1 text-xs text-foreground/60">{done.map((a) => a.staff_name).join(', ') || '—'}</div>
                        </td>
                        <td className="px-3 py-2.5 text-xs text-foreground/60">{outstanding.map((u) => u.full_name || u.email).join(', ') || 'All staff'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}