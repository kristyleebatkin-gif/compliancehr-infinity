import React, { useMemo } from 'react';
import { evidenceStateAt, EVIDENCE_STATE_LABELS } from '@/lib/v8000Engine';

const STATE_TONE = {
  verified: 'verified',
  expiring: 'expiring',
  in_review: 'review',
  unverified: 'muted',
  rejected: 'risk',
  expired: 'risk',
};

const text = (value) => String(value ?? '').trim();

function Stage({ label, status, detail }) {
  const resolved = status !== 'break';
  return (
    <li className="flex gap-2">
      <span
        aria-hidden="true"
        className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
        style={{ background: resolved ? '#7CF0C4' : '#FF9EC4' }}
      />
      <div className="min-w-0">
        <p className="text-xs font-extrabold text-white">
          {label}
          <span className="v8-chip ml-1.5" data-state={resolved ? 'verified' : 'risk'}>
            {resolved ? 'Traced' : 'Break'}
          </span>
        </p>
        <p className="v8-sub">{detail}</p>
      </div>
    </li>
  );
}

/**
 * Node detail for one standard: its declared fields, the chain to outcome, and every control
 * with the evidence and findings attached to it. All counts are the records themselves.
 */
export default function FabricNodeDetail({ standard, controls = [], evidence = [], findings = [], today }) {
  const linked = useMemo(
    () => controls.filter((control) => control.standard_id === standard.id
      || (text(control.standard_code) && text(control.standard_code).toUpperCase() === text(standard.standard_code).toUpperCase())),
    [controls, standard]
  );

  const evidenceFor = (controlId) => evidence.filter((item) => item.control_id === controlId);
  const findingsFor = (controlId) => findings.filter((item) => item.control_id === controlId);
  const allEvidence = linked.flatMap((control) => evidenceFor(control.id));
  const allFindings = linked.flatMap((control) => findingsFor(control.id));
  const verifiedEvidence = allEvidence.filter((item) => evidenceStateAt(item, today) === 'verified').length;
  const openFindings = allFindings.filter((item) => item.status !== 'Closed').length;
  const has = (field) => linked.some((control) => text(control[field]));

  const stages = [
    { label: 'Framework', status: text(standard.framework) ? 'declared' : 'break', detail: text(standard.framework) || 'No framework is named on this standard.' },
    { label: 'Standard', status: 'linked', detail: [text(standard.standard_code), text(standard.standard_title)].filter(Boolean).join(' · ') || 'Untitled standard' },
    { label: 'Obligation', status: has('obligation') ? 'declared' : 'break', detail: has('obligation') ? 'Stated on at least one control.' : 'No control states the obligation it carries.' },
    { label: 'Requirement', status: has('requirement') ? 'declared' : 'break', detail: has('requirement') ? 'Stated on at least one control.' : 'No control states the requirement it meets.' },
    { label: 'Control', status: linked.length ? 'linked' : 'break', detail: linked.length ? `${linked.length} control(s) attached` : 'No control is attached to this standard.' },
    { label: 'Evidence', status: allEvidence.length ? 'linked' : 'break', detail: allEvidence.length ? `${allEvidence.length} record(s), ${verifiedEvidence} verified` : 'No evidence supports these controls.' },
    { label: 'Finding', status: allFindings.length ? 'linked' : 'break', detail: allFindings.length ? `${allFindings.length} finding(s), ${openFindings} open` : 'No finding is recorded against these controls.' },
    { label: 'Outcome', status: text(standard.outcome) ? 'declared' : 'break', detail: text(standard.outcome) || 'No outcome is stated, so the chain stops before the person it protects.' },
  ];

  return (
    <div className="space-y-3">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="v8-chip" data-state="review">{text(standard.framework) || 'No framework'}</span>
          <span className="v8-chip" data-state="muted">{text(standard.status) || 'No status'}</span>
        </div>
        <h3 className="mt-1.5 text-sm font-extrabold text-white">{text(standard.standard_title) || 'Untitled standard'}</h3>
        <p className="v8-sub">{text(standard.standard_code) || 'No code'} · {text(standard.legislation) || 'No legislation named'}</p>
      </div>

      <ol className="space-y-2" aria-label="Traceability chain">
        {stages.map((stage) => <Stage key={stage.label} {...stage} />)}
      </ol>

      <div>
        <p className="v8-muted mb-1 font-bold uppercase tracking-wide">Controls and their evidence</p>
        {linked.length === 0 ? (
          <p className="v8-sub">No control is attached, so there is no evidence to inspect.</p>
        ) : (
          <div className="space-y-2">
            {linked.map((control) => {
              const items = evidenceFor(control.id);
              const open = findingsFor(control.id).filter((finding) => finding.status !== 'Closed').length;
              return (
                <div key={control.id} className="v8-row">
                  <p className="text-xs font-bold text-white">{text(control.control_statement).slice(0, 150) || 'Untitled control'}</p>
                  <p className="v8-sub mt-0.5">
                    {text(control.control_type) || 'No type'} · {text(control.frequency) || 'No frequency'} · {text(control.owner) || 'No owner'}
                    {text(control.next_test_date) ? ` · next test ${text(control.next_test_date).slice(0, 10)}` : ''}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {items.length === 0 ? (
                      <span className="v8-chip" data-state="risk">No evidence</span>
                    ) : items.map((item) => {
                      const state = evidenceStateAt(item, today);
                      return (
                        <span key={item.id} className="v8-chip" data-state={STATE_TONE[state]} title={EVIDENCE_STATE_LABELS[state]}>
                          {text(item.title).slice(0, 44) || 'Untitled evidence'} · {EVIDENCE_STATE_LABELS[state]}
                        </span>
                      );
                    })}
                    {open > 0 && <span className="v8-chip" data-state="risk">{open} open finding(s)</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}