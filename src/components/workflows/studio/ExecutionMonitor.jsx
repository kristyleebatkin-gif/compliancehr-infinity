import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Play, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { INSTANCE_STATES, SLA_STATES } from '@/lib/workflowStudio';
import { cn } from '@/lib/utils';

const OPEN_STATES = ['Running', 'Waiting', 'Escalated', 'Paused'];

export default function ExecutionMonitor({ instances = [], definitions = [], busy = false, presetDefinitionId = '', onStart, onAct, onEscalate, onOpen }) {
  const [definitionId, setDefinitionId] = useState(presetDefinitionId);

  useEffect(() => {
    if (presetDefinitionId) setDefinitionId(presetDefinitionId);
  }, [presetDefinitionId]);
  const [stateFilter, setStateFilter] = useState('Open');
  const [search, setSearch] = useState('');
  const [decision, setDecision] = useState(null);
  const [note, setNote] = useState('');

  const published = definitions.filter((item) => item.state === 'Published');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return instances.filter((row) => {
      if (stateFilter === 'Open' && !OPEN_STATES.includes(row.state)) return false;
      if (stateFilter !== 'Open' && stateFilter !== 'All' && row.state !== stateFilter) return false;
      if (!term) return true;
      return [row.definition_name, row.context_label, row.current_node_label, row.task_role, row.workflow_type]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [instances, stateFilter, search]);

  const submitDecision = async () => {
    if (!decision) return;
    if (decision.kind === 'escalate') await onEscalate?.(decision.instance.id, note);
    else await onAct?.(decision.instance.id, decision.kind, note, decision.instance.current_node_id);
    setDecision(null);
    setNote('');
  };

  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-border bg-card p-3 shadow-2xs">
        <h2 className="text-sm font-extrabold text-foreground">Start a run</h2>
        <p className="text-xs text-muted-foreground">Only published workflows can run. The engine assigns the first step by role and sets its clock.</p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <select
            value={definitionId}
            onChange={(event) => setDefinitionId(event.target.value)}
            className="h-9 min-w-0 flex-1 rounded-md border border-input bg-card px-2 text-sm font-semibold text-foreground"
            aria-label="Workflow to start"
          >
            <option value="">Choose a published workflow</option>
            {published.map((item) => (
              <option key={item.id} value={item.id}>{item.code} · {item.name}</option>
            ))}
          </select>
          <Button
            size="sm"
            disabled={busy || !definitionId}
            onClick={async () => {
              await onStart?.(definitionId);
            }}
          >
            <Play className="mr-1.5 h-4 w-4" /> Start
          </Button>
        </div>
        {!published.length && (
          <p className="mt-2 text-[11px] font-semibold text-warning">
            No published workflows yet. Add a template in the library and publish it first.
          </p>
        )}
      </section>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search runs, steps or roles"
            className="pl-8"
            aria-label="Search runs"
          />
        </div>
        <select
          value={stateFilter}
          onChange={(event) => setStateFilter(event.target.value)}
          className="h-9 rounded-md border border-input bg-card px-2 text-sm font-semibold text-foreground"
          aria-label="Filter by state"
        >
          <option value="Open">Open runs</option>
          <option value="All">All runs</option>
          {Object.keys(INSTANCE_STATES).map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2">Run</th>
                <th className="px-3 py-2">State</th>
                <th className="px-3 py-2">Current step</th>
                <th className="px-3 py-2">Clock</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((row) => (
                <tr key={row.id} className="align-top hover:bg-muted/50">
                  <td className="px-3 py-2">
                    <div className="text-sm font-bold text-foreground">{row.definition_name}</div>
                    <div className="text-[11px] font-medium text-muted-foreground">
                      {row.definition_code} · v{row.definition_version || 1} · started {row.started_at ? new Date(row.started_at).toLocaleDateString() : '—'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', INSTANCE_STATES[row.state])}>
                      {row.state}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs font-semibold text-foreground">{row.current_node_label || '—'}</div>
                    <div className="text-[11px] font-medium text-muted-foreground">
                      {row.task_kind || 'Closed'} · {row.task_role || 'no role'}
                    </div>
                    {row.evidence_required && (
                      <div className={cn('mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold', Number(row.evidence_count || 0) > 0 ? 'border-safe/40 bg-safe/10 text-safe' : 'border-warning/50 bg-warning/15 text-warning')}>
                        {Number(row.evidence_count || 0) > 0 ? 'Evidence recorded' : 'Evidence required'}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', SLA_STATES[row.sla_state] || SLA_STATES['On track'])}>
                      {row.sla_state || 'On track'}
                    </span>
                    <div className="mt-1 text-[11px] font-medium text-muted-foreground">
                      {row.due_at ? `due ${new Date(row.due_at).toLocaleString()}` : 'no clock'}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => onOpen?.(row)}>
                        <ArrowUpRight className="mr-1 h-3.5 w-3.5" /> Open
                      </Button>
                      {OPEN_STATES.includes(row.state) && (
                        <>
                          <Button
                            size="sm"
                            disabled={busy || (row.evidence_required && Number(row.evidence_count || 0) < 1)}
                            title={row.evidence_required && Number(row.evidence_count || 0) < 1 ? 'Record evidence before this step can pass validation' : undefined}
                            onClick={() => { setDecision({ instance: row, kind: 'approve' }); setNote(''); }}
                          >
                            {/approval|sign-off/i.test(row.task_kind || '') ? 'Approve' : 'Complete'}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() => { setDecision({ instance: row, kind: 'reject' }); setNote(''); }}
                          >
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => { setDecision({ instance: row, kind: 'escalate' }); setNote(''); }}
                          >
                            Escalate
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!filtered.length && (
                <tr>
                  <td colSpan={5} className="px-3 py-10 text-center text-sm text-muted-foreground">
                    No runs match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={Boolean(decision)} onOpenChange={(open) => !open && setDecision(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-foreground">
              {decision?.kind === 'escalate' ? 'Escalate this run' : decision?.kind === 'reject' ? 'Reject this step' : 'Complete this step'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs font-semibold text-muted-foreground">
            {decision?.instance?.current_node_label} · {decision?.instance?.definition_name}
          </p>
          <label className="block text-[11px] font-bold text-foreground">
            {decision?.kind === 'escalate' ? 'Why is this being escalated?' : 'Decision note / evidence reference'}
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={4}
              className="mt-1 w-full rounded-md border border-input bg-card p-2 text-sm text-foreground"
            />
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setDecision(null)}>Cancel</Button>
            <Button size="sm" disabled={busy} onClick={submitDecision}>
              {decision?.kind === 'escalate' ? 'Escalate' : decision?.kind === 'reject' ? 'Reject step' : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}