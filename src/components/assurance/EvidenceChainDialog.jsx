import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { EVIDENCE_STATES, FINDING_TONES, assuranceStatement, evidenceState } from '@/lib/assuranceChain';

const DATE = (value) => (value ? String(value).slice(0, 10) : '—');

function Stage({ step, label, children }) {
  return (
    <li className="relative pl-8">
      <span className="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-extrabold text-brand-foreground">
        {step}
      </span>
      <div className="pb-4">
        <div className="text-[11px] font-extrabold uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="mt-1 space-y-1 text-sm font-semibold text-foreground">{children}</div>
      </div>
    </li>
  );
}

/**
 * The traceability chain for one control: legislation → standard → obligation → control →
 * evidence → findings → assurance. Every row shown here is a real record.
 */
export default function EvidenceChainDialog({ open, onClose, standard, control, evidence, findings }) {
  const statement = assuranceStatement({ control, evidence, findings });

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) onClose(); }}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assurance chain</DialogTitle>
          <DialogDescription>
            {control?.standard_code ? `${control.standard_code} — ` : ''}
            {control?.standard_title || 'Control traceability'}
          </DialogDescription>
        </DialogHeader>

        {!control ? (
          <p className="text-sm font-semibold text-muted-foreground">
            This evidence is not linked to a control yet. Edit it and choose the control it supports to complete the chain.
          </p>
        ) : (
          <ol className="relative border-l-2 border-brand/25 pl-1">
            <Stage step="1" label="Legislation & framework">
              <div>{control.framework || 'Framework not set'}</div>
              {standard?.legislation ? <div className="text-xs font-medium text-muted-foreground">{standard.legislation}</div> : null}
            </Stage>

            <Stage step="2" label="Standard & outcome">
              <div>{control.standard_code || 'Uncoded'} — {control.standard_title || standard?.standard_title || 'Standard'}</div>
              {standard?.outcome ? <div className="text-xs font-medium text-muted-foreground">{standard.outcome}</div> : null}
            </Stage>

            <Stage step="3" label="Obligation & requirement">
              <div>{control.obligation || 'No obligation recorded'}</div>
              {control.requirement ? <div className="text-xs font-medium text-muted-foreground">{control.requirement}</div> : null}
            </Stage>

            <Stage step="4" label="Control">
              <div>{control.control_statement}</div>
              <div className="text-xs font-medium text-muted-foreground">
                {control.control_type} control · {control.frequency || 'no frequency'} · owner {control.owner || 'unassigned'}
                {control.policy_reference ? ` · policy ${control.policy_reference}` : ''}
                {control.procedure_reference ? ` · procedure ${control.procedure_reference}` : ''}
              </div>
            </Stage>

            <Stage step="5" label={`Evidence (${evidence.length})`}>
              {evidence.length ? (
                <ul className="space-y-1.5">
                  {evidence.map((item) => {
                    const tone = EVIDENCE_STATES[evidenceState(item)];
                    return (
                      <li key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${tone.chip}`}>{tone.label}</span>
                        <span className="min-w-0 flex-1 truncate text-xs font-bold">{item.title}</span>
                        <span className="text-[11px] font-medium text-muted-foreground">
                          {item.evidence_type} · valid to {DATE(item.valid_to)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="text-xs font-bold text-danger">No evidence linked — this control is not yet assured.</span>
              )}
            </Stage>

            <Stage step="6" label={`Findings & CAPA (${findings.length})`}>
              {findings.length ? (
                <ul className="space-y-1.5">
                  {findings.map((finding) => (
                    <li key={finding.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-2.5 py-1.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${
                          FINDING_TONES[finding.rating] || 'border-border bg-muted text-foreground'
                        }`}
                      >
                        {finding.rating}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-xs font-bold">{finding.title}</span>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        {finding.status} · due {DATE(finding.due_date)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs font-medium text-muted-foreground">No findings recorded against this control.</span>
              )}
            </Stage>

            <Stage step="7" label="Assurance statement">
              <div className="rounded-lg border border-brand/30 bg-brand/5 px-3 py-2 text-xs font-bold text-foreground">{statement}</div>
            </Stage>
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}