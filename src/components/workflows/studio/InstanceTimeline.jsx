import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { INSTANCE_STATES, SLA_STATES, NODE_META, graphFromJson } from '@/lib/workflowStudio';
import { cn } from '@/lib/utils';

export default function InstanceTimeline({ instance, onClose }) {
  if (!instance) return null;
  const steps = graphFromJson(instance.steps_json);

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
          <div><dt className="text-muted-foreground">Reference</dt><dd className="text-foreground">{instance.context_label || 'No reference'}</dd></div>
          <div><dt className="text-muted-foreground">Started</dt><dd className="text-foreground">{instance.started_at ? new Date(instance.started_at).toLocaleString() : '—'} by {instance.started_by || 'system'}</dd></div>
          <div><dt className="text-muted-foreground">Current step</dt><dd className="text-foreground">{instance.current_node_label || 'Closed'} · {instance.task_role || '—'}</dd></div>
          <div><dt className="text-muted-foreground">Due</dt><dd className="text-foreground">{instance.due_at ? new Date(instance.due_at).toLocaleString() : '—'}</dd></div>
          {instance.escalation_reason && (
            <div className="sm:col-span-2"><dt className="text-muted-foreground">Escalated</dt><dd className="text-foreground">{instance.escalation_reason}</dd></div>
          )}
        </dl>

        <ol className="space-y-2">
          {steps.map((stepItem, index) => (
            <li key={`${stepItem.node_id}-${index}`} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-foreground">
                  {index + 1}
                </span>
                {index < steps.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-border" />}
              </div>
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold text-foreground">{stepItem.label}</span>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                    {NODE_META[stepItem.type]?.label || stepItem.type}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-muted-foreground">
                  {stepItem.outcome} · {stepItem.by} · {stepItem.at ? new Date(stepItem.at).toLocaleString() : ''}
                </p>
                {stepItem.note && <p className="mt-1 text-[11px] font-medium text-foreground">{stepItem.note}</p>}
              </div>
            </li>
          ))}
          {!steps.length && <p className="text-sm text-muted-foreground">This run has not logged a step yet.</p>}
        </ol>

        <p className="rounded-lg border border-border bg-muted/60 p-2.5 text-[11px] font-semibold text-muted-foreground">
          Every step is written by the runtime engine and cannot be edited after the fact. The same events feed the audit trail.
        </p>
      </DialogContent>
    </Dialog>
  );
}