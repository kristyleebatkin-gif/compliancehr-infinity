import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CRITICALITY } from '@/lib/masterAssuranceCatalogue';
import { cn } from '@/lib/utils';

function stepTone(linked) {
  return linked ? 'border-safe/40 bg-safe/10 text-safe' : 'border-warning/40 bg-warning/15 text-warning';
}

export default function TraceabilityChainDrawer({ row, onClose }) {
  if (!row) return null;

  const steps = [
    { label: 'Standard', code: row.standard_code, value: row.standard_name, linked: Boolean(row.standard_code) },
    { label: 'Indicator', code: row.indicator_code, value: row.indicator_name, linked: Boolean(row.indicator_code) },
    {
      label: 'Control',
      code: row.control_code,
      value: row.control_name,
      linked: Boolean(row.control_code),
      note: `${row.control_records} control(s) in your register cover ${row.standard_code}`,
    },
    { label: 'Audit checkpoint', code: row.audit_code, value: row.audit_name, linked: true, note: `${row.audit_type} · ${row.review_frequency}` },
    {
      label: 'Evidence requirement',
      code: row.evidence_code,
      value: row.evidence_name,
      linked: Boolean(row.current_evidence),
      note: `${row.evidence_count} evidence record(s) linked · ${row.current_evidence} current`,
    },
    {
      label: 'Finding',
      code: row.findings_count ? `${row.findings_count} open` : 'None open',
      value: row.findings_count ? 'Corrective action required' : 'No open finding for this standard',
      linked: row.findings_count > 0,
    },
    {
      label: 'Corrective action',
      code: row.actions_count ? `${row.actions_count} in progress` : 'None',
      value: row.actions_count ? 'Actions tracked to verification and closure' : 'No corrective action recorded',
      linked: row.actions_count > 0,
    },
    { label: 'Risk', code: row.risk_id, value: `${row.risk_rating} · residual score ${row.residual_risk_score}`, linked: true },
    { label: 'Attestation', code: row.approver_role, value: `Signed off by the ${row.approver_role}`, linked: false },
    { label: 'Executive & board report', code: row.reviewer_role, value: `Rolls up to ${row.audit_domain} assurance reporting`, linked: true },
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onClose?.()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-extrabold text-foreground">
            {row.audit_code} · {row.audit_name}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
          <span className={cn('rounded-full border px-2 py-0.5', CRITICALITY[row.criticality].tone)}>{row.criticality}</span>
          <span className={cn('rounded-full border px-2 py-0.5', row.state_tone)}>{row.state_label}</span>
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-foreground">
            {row.achieved_points}/{row.weighting} points · {row.compliance_percentage}%
          </span>
        </div>

        <ol className="space-y-2">
          {steps.map((step, index) => (
            <li key={step.label} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-foreground">
                  {index + 1}
                </span>
                {index < steps.length - 1 && <span className="mt-1 h-full w-px flex-1 bg-border" />}
              </div>
              <div className="min-w-0 flex-1 rounded-lg border border-border bg-card p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{step.label}</span>
                  <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', stepTone(step.linked))}>
                    {step.code}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{step.value}</p>
                {step.note && <p className="text-[11px] font-medium text-muted-foreground">{step.note}</p>}
              </div>
            </li>
          ))}
        </ol>

        <p className="rounded-lg border border-border bg-muted/60 p-2.5 text-[11px] font-semibold text-muted-foreground">
          Accountability: owner {row.owner_role} · reviewer {row.reviewer_role} · approver {row.approver_role}. Evidence is expected
          {' '}{row.evidence_frequency.toLowerCase()} and the checkpoint is reviewed {row.review_frequency.toLowerCase()}.
        </p>
      </DialogContent>
    </Dialog>
  );
}