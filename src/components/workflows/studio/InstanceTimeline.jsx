import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { INSTANCE_STATES, SLA_STATES, NODE_META } from '@/lib/workflowStudio';
import { cn } from '@/lib/utils';

// The stored run is shown as a redacted trail: who acted, in what role, and what they decided.
// Free-text notes stay on the record and are never copied into this view.
export default function InstanceTimeline({ instance, onClose }) {
  const [timeline, setTimeline] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setTimeline(null);
    setError('');
    if (!instance?.id) return undefined;
    (async () => {
      try {
        const res = await base44.functions.invoke('workflowRuntime', { action: 'timeline', instance_id: instance.id });
        if (!active) return;
        if (res?.data?.error) { setError(res.data.error); return; }
        setTimeline(res?.data || { steps: [], events: [] });
      } catch (err) {
        if (active) setError(err?.response?.data?.error || 'The trail for this run is unavailable.');
      }
    })();
    return () => { active = false; };
  }, [instance?.id]);

  if (!instance) return null;

  const entries = timeline?.events?.length
    ? timeline.events.map((event, index) => ({
      key: `${event.event_type}-${index}`,
      label: event.node_label || 'Run',
      type: event.node_type || 'START',
      outcome: event.outcome || event.event_type,
      by: event.actor_name,
      role: event.actor_role,
      authority: event.authority,
      selfApproved: event.self_approved,
      at: event.occurred_at,
    }))
    : (timeline?.steps || []).map((step, index) => ({
      key: `${step.node_id}-${index}`,
      label: step.label,
      type: step.type,
      outcome: step.outcome,
      by: step.by,
      authority: step.authority,
      at: step.at,
    }));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-foreground">
            {instance.definition_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-foreground">{instance.definition_code}</span>
          <span className={cn('rounded-full border px-2 py-0.5', INSTANCE_STATES[instance.state])}>{instance.state}</span>
          <span className={cn('rounded-full border px-2 py-0.5', SLA_STATES[instance.sla_state] || SLA_STATES['On track'])}>
            {instance.sla_state || 'On track'}
          </span>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-foreground">
            {instance.evidence_count || 0} evidence · {instance.approval_count || 0} approvals
          </span>
        </div>

        <dl className="grid gap-2 text-[11px] font-semibold sm:grid-cols-2">
          <div><dt className="text-muted-foreground">Started</dt><dd className="text-foreground">{instance.started_at ? new Date(instance.started_at).toLocaleString() : '—'}</dd></div>
          <div><dt className="text-muted-foreground">Current step</dt><dd className="text-foreground">{instance.current_node_label || 'Closed'} · {instance.task_role || '—'}</dd></div>
          <div><dt className="text-muted-foreground">Due</dt><dd className="text-foreground">{instance.due_at ? new Date(instance.due_at).toLocaleString() : '—'}</dd></div>
          <div><dt className="text-muted-foreground">Pinned version</dt><dd className="text-foreground">v{instance.definition_version || 1}{instance.content_hash ? ` · ${instance.content_hash.slice(-8)}` : ''}</dd></div>
        </dl>

        {error && <p role="alert" className="rounded-lg border border-[#FF2E9A] bg-white p-2.5 text-xs font-semibold text-primary">{error}</p>}

        {!timeline && !error && (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        )}

        <ol className="space-y-2">
          {entries.map((entry, index) => (
            <li key={entry.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-foreground">
                  {index + 1}
                </span>
                {index < entries.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-border" />}
              </div>
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-foreground">{entry.label}</span>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                    {NODE_META[entry.type]?.label || entry.type}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {entry.outcome} · {entry.by || 'system'}
                  {entry.role ? ` (${entry.role})` : ''}
                  {entry.authority ? ` · ${entry.authority}` : ''}
                  {entry.at ? ` · ${new Date(entry.at).toLocaleString()}` : ''}
                </p>
                {entry.selfApproved && (
                  <p className="mt-1 inline-block rounded-full border border-warning/50 bg-warning/15 px-2 py-0.5 text-[10px] font-bold text-warning">
                    Approved a step they completed themselves
                  </p>
                )}
              </div>
            </li>
          ))}
          {timeline && !entries.length && <p className="text-sm text-muted-foreground">This run has not logged a step yet.</p>}
        </ol>

        <p className="rounded-lg border border-border bg-muted/60 p-2.5 text-[11px] font-semibold text-muted-foreground">
          Each entry is written by the workflow engine as it happened and cannot be edited afterwards. Free-text notes stay on the record and are not reproduced here.
        </p>
      </DialogContent>
    </Dialog>
  );
}