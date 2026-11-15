import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GitBranch, Loader2, Plus, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ApprovalChainCard from '@/components/approvals/ApprovalChainCard';
import NewApprovalChainDialog from '@/components/approvals/NewApprovalChainDialog';
import ApprovalDecisionDialog from '@/components/approvals/ApprovalDecisionDialog';
import { canDecideNow } from '@/lib/approvalChain';

const call = async (payload) => {
  const response = await base44.functions.invoke('approvalChain', payload);
  const data = response?.data ?? {};
  if (data.error) throw new Error(data.error);
  return data;
};

export default function ApprovalEngine() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [formBusy, setFormBusy] = useState(false);
  const [formError, setFormError] = useState('');
  const [target, setTarget] = useState(null);
  const [busy, setBusy] = useState('');
  const [dialogError, setDialogError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await call({ action: 'list' }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const chains = data?.chains || [];
  const waiting = useMemo(
    () => chains.filter((chain) => chain.status === 'Pending' && canDecideNow(chain, data?.role)),
    [chains, data]
  );
  const pending = useMemo(() => chains.filter((chain) => chain.status === 'Pending'), [chains]);
  const closed = useMemo(() => chains.filter((chain) => chain.status !== 'Pending'), [chains]);

  const create = async (payload) => {
    setFormBusy(true);
    setFormError('');
    try {
      await call({ action: 'create', ...payload });
      toast({ title: 'Approval started', description: 'Level 1 now holds the request.' });
      setFormOpen(false);
      await load();
      return true;
    } catch (err) {
      setFormError(err.message);
      return false;
    } finally {
      setFormBusy(false);
    }
  };

  const decide = async ({ note, signature }) => {
    if (!target) return false;
    setBusy(target.chain.id);
    setDialogError('');
    try {
      await call({ action: 'decide', id: target.chain.id, decision: target.decision, note, signature });
      toast({
        title: target.decision === 'approve' ? 'Level signed' : 'Request returned',
        description: target.decision === 'approve' ? 'The request moved to the next level, or closed if that was the last one.' : target.chain.title,
      });
      setTarget(null);
      await load();
      return true;
    } catch (err) {
      setDialogError(err.message);
      return false;
    } finally {
      setBusy('');
    }
  };

  const withdraw = async (chain) => {
    setBusy(chain.id);
    try {
      await call({ action: 'withdraw', id: chain.id });
      toast({ title: 'Request withdrawn', description: chain.title });
      await load();
    } catch (err) {
      toast({ title: 'Not withdrawn', description: err.message, variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  const tiles = [
    { label: 'Waiting on you', value: waiting.length, hint: 'At a level your role decides' },
    { label: 'Open requests', value: pending.length, hint: 'Still moving through their levels' },
    { label: 'Closed', value: closed.length, hint: 'Approved, returned or withdrawn' },
    { label: 'Your role', value: data?.role || '—', hint: 'Read from your account, not chosen here' },
  ];

  const list = (rows, empty) => (
    rows.length ? (
      <ul className="space-y-2">
        {rows.map((chain) => (
          <ApprovalChainCard
            key={chain.id}
            chain={chain}
            role={data?.role}
            busy={busy}
            onDecide={(item, decision) => { setDialogError(''); setTarget({ chain: item, decision }); }}
            onWithdraw={withdraw}
          />
        ))}
      </ul>
    ) : (
      <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">{empty}</p>
    )
  );

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <ModuleShell
        moduleKey="approval-engine"
        title="Approval Chains"
        subtitle="Up to five signed levels for expenditure, policy, risk acceptance, clinical decisions and access changes. The engine sets the levels; nobody approves their own request."
        icon={GitBranch}
        actions={(
          <>
            <Button size="sm" onClick={() => { setFormError(''); setFormOpen(true); }}><Plus className="h-4 w-4" />Raise a request</Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className="h-4 w-4" />Refresh</Button>
          </>
        )}
      />

      {error && (
        <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-3 text-sm">
          The approval engine could not load: {error} <Button variant="link" size="sm" onClick={load}>Try again</Button>
        </div>
      )}
      {loading && !data && (
        <p role="status" className="flex items-center gap-2 p-4 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading approval chains…</p>
      )}

      {data && (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {tiles.map((tile) => (
              <div key={tile.label} className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{tile.label}</p>
                <p className="mt-1.5 text-2xl font-extrabold leading-none text-foreground">{tile.value}</p>
                <p className="mt-1.5 text-[11px] font-semibold text-muted-foreground">{tile.hint}</p>
              </div>
            ))}
          </div>

          <Tabs defaultValue="waiting">
            <TabsList className="flex h-auto flex-wrap justify-start gap-1.5" aria-label="Approval chain views">
              <TabsTrigger value="waiting">Waiting on you ({waiting.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({pending.length})</TabsTrigger>
              <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="waiting" className="mt-3">
              {list(waiting, 'Nothing is waiting for a decision from your role. Requests appear here when they reach a level you decide.')}
            </TabsContent>
            <TabsContent value="open" className="mt-3">
              {list(pending, 'No approval request is open. Raise one with the button above.')}
            </TabsContent>
            <TabsContent value="closed" className="mt-3">
              {list(closed, 'No request has been closed yet.')}
            </TabsContent>
          </Tabs>
        </>
      )}

      <NewApprovalChainDialog
        open={formOpen}
        busy={formBusy}
        error={formError}
        onClose={() => setFormOpen(false)}
        onCreate={create}
      />
      <ApprovalDecisionDialog
        target={target}
        busy={Boolean(busy)}
        error={dialogError}
        onClose={() => setTarget(null)}
        onSubmit={decide}
      />
    </div>
  );
}