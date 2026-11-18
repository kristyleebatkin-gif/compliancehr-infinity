import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

const DECIDABLE = [
  { status: 'Approved', label: 'Approve', variant: 'default' },
  { status: 'Rejected', label: 'Reject', variant: 'destructive' },
  { status: 'Deferred', label: 'Defer', variant: 'outline' },
  { status: 'Implemented', label: 'Mark implemented', variant: 'secondary' },
];

const field = (label, value) => (
  <div>
    <dt className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">{label}</dt>
    <dd className="text-sm text-[#0A2B6D]">{value || 'Not recorded'}</dd>
  </div>
);

/** @param {any} props */
export default function DecisionDetailDialog({
  open,
  onOpenChange,
  decision,
  evidence = [],
  outcomes = [],
  canWrite = false,
  canDecide = false,
  onAddEvidence,
  onAddOutcome,
  onDecide,
  busy = false,
  error = '',
} = {}) {
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [measure, setMeasure] = useState({ metric_name: '', target_value: '', actual_value: '', unit: '' });

  useEffect(() => {
    setEvidenceTitle('');
    setMeasure({ metric_name: '', target_value: '', actual_value: '', unit: '' });
  }, [decision?.id]);

  if (!decision) return null;
  const decided = ['Approved', 'Implemented', 'Closed'].includes(decision.status);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{decision.title}</DialogTitle>
          <DialogDescription>
            {decision.decision_number || 'Not numbered'} · {decision.decision_type} · Status {decision.status}
          </DialogDescription>
        </DialogHeader>

        <dl className="grid gap-3 sm:grid-cols-3">
          {field('Owner', decision.owner)}
          {field('Decision authority', decision.decision_maker)}
          {field('Risk if wrong', decision.risk_level)}
          {field('Decision date', decision.decision_date)}
          {field('Effective date', decision.effective_date)}
          {field('Next review', decision.review_date)}
          {field('Evidence confidence', decision.evidence_confidence == null ? '' : `${decision.evidence_confidence}%`)}
          {field('Outcome status', decision.outcome_status)}
          {field('Decided by', decision.decided_by)}
        </dl>

        {decision.context && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">Context</h3>
            <p className="mt-1 whitespace-pre-line text-sm text-[#0A2B6D]">{decision.context}</p>
          </section>
        )}
        {decision.outcome_target && (
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">Outcome target</h3>
            <p className="mt-1 text-sm text-[#0A2B6D]">{decision.outcome_target}</p>
          </section>
        )}

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">Evidence ({evidence.length})</h3>
          {evidence.length ? (
            <ul className="mt-1 space-y-1">
              {evidence.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-[#0A2B6D]">
                  <span>{item.title} <span className="text-[#0A2B6D]/60">· {item.evidence_type}</span></span>
                  <span className="font-bold">{item.confidence ?? 0}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-[#0A2B6D]/60">No evidence attached yet.</p>
          )}
          {canWrite && !decided && (
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <Input value={evidenceTitle} onChange={(e) => setEvidenceTitle(e.target.value)} placeholder="Evidence you are attaching" />
              <Button
                variant="secondary"
                disabled={busy || evidenceTitle.trim().length < 3}
                onClick={() => onAddEvidence?.(decision.id, { title: evidenceTitle, evidence_type: 'Document' })}
              >
                Attach evidence
              </Button>
            </div>
          )}
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">Outcome measures ({outcomes.length})</h3>
          {outcomes.length ? (
            <ul className="mt-1 space-y-1">
              {outcomes.map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-[#0A2B6D]">
                  <span>{item.metric_name} <span className="text-[#0A2B6D]/60">· target {item.target_value}{item.unit ? ` ${item.unit}` : ''}, actual {item.actual_value}{item.unit ? ` ${item.unit}` : ''}</span></span>
                  <span className="font-bold">{item.status}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-xs text-[#0A2B6D]/60">No outcome measures recorded yet.</p>
          )}
          {canWrite && (
            <div className="mt-2 grid gap-2 sm:grid-cols-4">
              <Input value={measure.metric_name} onChange={(e) => setMeasure({ ...measure, metric_name: e.target.value })} placeholder="Measure" />
              <Input type="number" value={measure.target_value} onChange={(e) => setMeasure({ ...measure, target_value: e.target.value })} placeholder="Target" />
              <Input type="number" value={measure.actual_value} onChange={(e) => setMeasure({ ...measure, actual_value: e.target.value })} placeholder="Actual" />
              <Button
                variant="secondary"
                disabled={busy || measure.metric_name.trim().length < 3}
                onClick={() => onAddOutcome?.(decision.id, {
                  ...measure,
                  status: Number(measure.target_value) && Number(measure.actual_value) >= Number(measure.target_value) ? 'Achieved' : 'On track',
                })}
              >
                Record outcome
              </Button>
            </div>
          )}
        </section>

        {canDecide && !decided && (
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">Record the decision</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {DECIDABLE.map((option) => (
                <Button
                  key={option.status}
                  variant={option.variant}
                  size="sm"
                  disabled={busy}
                  onClick={() => onDecide?.(decision.id, option.status)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[#0A2B6D]/60">
              A recorded decision is closed to edits and written to the audit log with your name, role and time.
            </p>
          </section>
        )}

        {error && <p className="text-xs font-bold text-rose-700">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}