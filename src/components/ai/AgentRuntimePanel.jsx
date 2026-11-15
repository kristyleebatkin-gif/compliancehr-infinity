import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Play, RefreshCw, ShieldCheck, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const when = (iso) => {
  if (!iso) return 'Not run yet';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Not run yet';
  return date.toLocaleString('en-AU', { timeZone: 'Australia/Brisbane', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
};

// Runs the registered autonomous agents on demand and shows what their last pass found.
// Every output is a recommendation awaiting human review; the runtime changes no record.
export default function AgentRuntimePanel() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const response = await base44.functions.invoke('agentRuntime', { action: 'status' });
      setData(response.data);
    } catch (err) {
      setError(err?.response?.data?.error || err?.message || 'The agent runtime is unavailable.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (agent) => {
    setBusy(agent?.id || 'all');
    try {
      const action = agent ? 'run' : 'run_all';
      const response = await base44.functions.invoke('agentRuntime', agent ? { action, agent_id: agent.id } : { action });
      const result = response.data?.result;
      const results = response.data?.results || (result ? [result] : []);
      const created = results.reduce((total, entry) => total + (entry.created || 0), 0);
      toast({
        title: created ? `${created} recommendation${created === 1 ? '' : 's'} drafted` : 'Pass complete',
        description: results.map((entry) => `${entry.agent}: ${entry.skipped ? entry.reason : `${entry.created} drafted`}`).join(' · ') || 'Nothing needed review.',
      });
      await load();
    } catch (err) {
      toast({ title: 'The pass did not complete', description: err?.response?.data?.error || err.message, variant: 'destructive' });
    } finally {
      setBusy('');
    }
  };

  if (error) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/40 bg-card p-3 text-sm">
        {error} <Button variant="link" size="sm" onClick={load}>Try again</Button>
      </div>
    );
  }
  if (!data) {
    return <p role="status" className="flex items-center gap-2 p-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading the agent runtime…</p>;
  }

  return (
    <section aria-label="Autonomous agent runtime" className="space-y-3 rounded-xl border border-border bg-card p-3.5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-foreground"><ShieldCheck className="h-4 w-4 text-primary" />Agent runtime</h2>
          <p className="text-xs text-muted-foreground">
            Registered autonomous agents read a bounded snapshot of the assurance registers and draft advisory recommendations. Nothing is approved, changed or sent without a person.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => run(null)} disabled={Boolean(busy) || !data.can_run_all} title={data.can_run_all ? 'Run every active agent now' : 'An administrator runs the scheduled pass'}>
            {busy === 'all' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}Run scheduled pass
          </Button>
          <Button size="sm" variant="outline" onClick={load} disabled={Boolean(busy)}><RefreshCw className="h-4 w-4" />Refresh</Button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <div className="rounded-lg border border-border p-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Active agents</p>
          <p className="text-lg font-extrabold text-foreground">{data.agents.filter((agent) => agent.status === 'Active').length}</p>
        </div>
        <div className="rounded-lg border border-border p-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Awaiting review</p>
          <p className="text-lg font-extrabold text-foreground">{data.awaiting}</p>
        </div>
        <div className="rounded-lg border border-border p-2.5">
          <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Recorded passes</p>
          <p className="text-lg font-extrabold text-foreground">{data.runs.filter((entry) => String(entry.state) !== 'Started').length}</p>
        </div>
      </div>

      {data.agents.length ? (
        <ul className="space-y-2">
          {data.agents.map((agent) => (
            <li key={agent.id} className="flex flex-col gap-2 rounded-lg border border-border p-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground">{agent.name} <span className="font-semibold text-muted-foreground">· {agent.status}</span></p>
                <p className="text-xs text-muted-foreground">{agent.purpose}</p>
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
                  <Clock className="h-3 w-3" />Last pass {when(agent.last_run)}{agent.last_state ? ` · ${agent.last_state}` : ''}
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => run(agent)} disabled={Boolean(busy) || agent.status !== 'Active'}>
                {busy === agent.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}Run now
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
          No autonomous agent is registered yet. Running the scheduled pass registers the default agent for this business.
        </p>
      )}

      {data.runs.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Recent passes</h3>
          <ul className="mt-1 space-y-1 text-xs">
            {data.runs.slice(0, 6).map((entry) => (
              <li key={entry.id} className="rounded-lg border border-border px-2.5 py-1.5">
                <span className="font-bold text-foreground">{entry.agent_name}</span>
                <span className="text-muted-foreground"> · {entry.state} · {when(entry.created_date)}</span>
                {entry.recommendations > 0 && <span className="text-muted-foreground"> · {entry.recommendations} drafted</span>}
                {entry.summary && <p className="text-[11px] text-muted-foreground">{entry.summary}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}