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
    { label: 'Standard', code: 'Not mapped', value: 'Current official source, version and applicability require review.' },
    { label: 'Indicator proposal', code: row.indicator_code, value: row.indicator_name },
    { label: 'Control proposal', code: row.control_code, value: row.control_name },
    { label: 'Audit checkpoint proposal', code: row.audit_code, value: row.audit_name },
    { label: 'Evidence requirement proposal', code: row.evidence_code, value: row.evidence_name },
    { label: 'Evidence document', code: 'Not linked', value: 'Exact document version and verification required.' },
    { label: 'Finding', code: 'Not assessed', value: 'No checkpoint assessment is connected.' },
    { label: 'Corrective action', code: 'Not assessed', value: 'No action or closure has been verified.' },
    { label: 'Risk', code: 'Not assessed', value: 'No risk record, inherent score or residual score has been assessed.' },
    { label: 'Attestation', code: 'Not signed', value: `Proposed approver: ${row.approver_role}. No signature is recorded.` },
    { label: 'Executive report', code: 'Not linked', value: 'Reporting requires verified source results.' },
    { label: 'Board assurance', code: 'Not linked', value: 'Board assurance has not been established.' },
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
            Draft mapping · Not assessed
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
          Proposed accountability: owner {row.owner_role} · reviewer {row.reviewer_role} · approver {row.approver_role}. Proposed evidence cycle:
          {' '}{row.evidence_frequency.toLowerCase()} ; proposed checkpoint review: {row.review_frequency.toLowerCase()}.
        </p>
      </DialogContent>
    </Dialog>
  );
}