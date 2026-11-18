import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { MiniTable, StatusBadge, TableCell, TableRow } from '@/components/workforce/workforceKit';

const when = (value) => (value ? new Date(value).toLocaleString() : '—');

/** The full record of one proposal: versions, provenance, policy, redaction and reviews. */
export default function DecisionDetailDialog({ open, onOpenChange, detail, loading } = {}) {
  const decision = detail?.decision;
  const reviews = detail?.reviews || [];
  const audit = detail?.audit || [];
  const refs = detail?.inputRefs || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{decision ? decision.action_title : 'AI decision'}</DialogTitle>
          <DialogDescription>
            {decision ? `${decision.decision_ref} · ${when(decision.created_date)} · ${decision.execution_state}` : 'Loading the recorded decision.'}
          </DialogDescription>
        </DialogHeader>

        {loading && <p className="py-6 text-center text-sm text-[#0A2B6D]/70">Loading the record…</p>}

        {decision && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={decision.status} />
              <StatusBadge status={decision.policy_verdict} />
              <span className="text-[11px] font-bold text-[#0A2B6D]">Confidence {decision.confidence}% ({decision.confidence_band})</span>
            </div>

            <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-[#0A2B6D] sm:grid-cols-2">
              <p><span className="font-bold">Agent:</span> {decision.agent_name} ({decision.agent_key}) · {decision.autonomy_level}</p>
              <p><span className="font-bold">Agent status at run:</span> {decision.agent_status_at_run}</p>
              <p><span className="font-bold">Model:</span> {decision.model_name} · context {decision.model_version}</p>
              <p><span className="font-bold">Prompt:</span> {decision.prompt_name} v{decision.prompt_version}</p>
              <p><span className="font-bold">Tool:</span> {decision.tool_name || 'None'} {decision.tool_kind && `· ${decision.tool_kind} (${decision.tool_risk_level})`}</p>
              <p><span className="font-bold">Tool policy:</span> {decision.assignment_policy}</p>
              <p><span className="font-bold">Recorded by:</span> {decision.requested_by}</p>
              <p><span className="font-bold">Correlation:</span> {decision.correlation_id}</p>
              <p><span className="font-bold">Workflow:</span> {decision.workflow_definition_name || 'Not correlated'}</p>
              <p><span className="font-bold">Review due by:</span> {when(decision.expires_at)}</p>
            </div>

            <div className="space-y-2 text-xs text-[#0A2B6D]">
              <p><span className="font-bold">Policy reason:</span> {decision.policy_reason}</p>
              <p><span className="font-bold">Proposed action:</span> {decision.action_summary || '—'}</p>
              <p><span className="font-bold">Input source:</span> {decision.input_source}</p>
              <p><span className="font-bold">Input summary:</span> {decision.input_summary || '—'}</p>
              <p><span className="font-bold">Output:</span> {decision.output_summary || '—'}</p>
              <p><span className="font-bold">Rationale:</span> {decision.rationale || '—'}</p>
              <p className="text-[11px] text-[#0A2B6D]/70">{decision.redacted_count} value(s) were redacted before storage. Hashes: input {(decision.input_hash || '').slice(0, 20) || '—'}, output {(decision.output_hash || '').slice(0, 20) || '—'}.</p>
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0A2B6D]">Input provenance</p>
              <MiniTable
                head={['Record']}
                rows={refs.map((item, index) => <TableRow key={index}><TableCell className="text-[11px] text-[#0A2B6D]">{item?.ref || JSON.stringify(item)}</TableCell></TableRow>)}
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0A2B6D]">Reviews</p>
              <MiniTable
                head={['When', 'Reviewer', 'Outcome', 'Reason']}
                rows={reviews.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]/80">{when(row.decided_at)}</TableCell>
                    <TableCell className="text-[11px] text-[#0A2B6D]">{row.reviewer}</TableCell>
                    <TableCell><StatusBadge status={row.outcome} /></TableCell>
                    <TableCell className="text-[11px] text-[#0A2B6D]/80">
                      {row.reason}
                      {row.override_reason && <div className="text-[#0A2B6D]/60">Override: {row.override_reason}</div>}
                    </TableCell>
                  </TableRow>
                ))}
              />
            </div>

            <div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#0A2B6D]">Audit for this decision</p>
              <MiniTable
                head={['When', 'Action', 'Actor', 'Outcome']}
                rows={audit.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]/80">{when(row.occurred_at)}</TableCell>
                    <TableCell className="text-[11px] text-[#0A2B6D]">{row.action}</TableCell>
                    <TableCell className="text-[11px] text-[#0A2B6D]">{row.actor}</TableCell>
                    <TableCell><StatusBadge status={row.outcome} /></TableCell>
                  </TableRow>
                ))}
              />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}