import type { CheckResult, IsoDate, V8000Dataset } from '../types/index.ts';
import { WEAK_CONFIDENCE } from '../types/index.ts';
import { isActiveControl, safeIndex } from '../lib/datasetIndex.ts';
import { evidenceState, holdsAssurance } from '../lib/evidenceState.ts';
import { evaluate, ref } from './result.ts';

/** Evidence quality: does each active control hold current, verified, attributable proof? */
export function evidenceValidator(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  const activeControls = dataset.controls.filter(isActiveControl);
  const activeIds = new Set(activeControls.map((control) => control.id));
  const owners = safeIndex(dataset.owners);
  const byControl = new Map<string, typeof dataset.evidence[number][]>();
  dataset.evidence.forEach((item) => {
    if (!item.controlId) return;
    const list = byControl.get(item.controlId) ?? [];
    list.push(item);
    byControl.set(item.controlId, list);
  });

  const controlsWithoutHolding = activeControls.filter(
    (control) =>
      control.evidenceRequired &&
      !(byControl.get(control.id) ?? []).some((item) => holdsAssurance(evidenceState(item, today)))
  );
  const onActive = dataset.evidence.filter((item) => item.controlId !== null && activeIds.has(item.controlId));
  const expired = onActive.filter((item) => evidenceState(item, today) === 'expired');
  const rejected = onActive.filter((item) => evidenceState(item, today) === 'rejected');
  const unverified = onActive.filter((item) => ['unverified', 'in_review'].includes(evidenceState(item, today)));
  const orphan = dataset.evidence.filter((item) => item.controlId === null);
  const weakVerified = dataset.evidence.filter(
    (item) => item.verificationStatus === 'verified' && item.confidence < WEAK_CONFIDENCE
  );
  const noOwner = dataset.evidence.filter(
    (item) => item.ownerId === null || (item.ownerId !== null && !owners.has(item.ownerId))
  );
  const backwards = dataset.evidence.filter((item) => item.validTo !== null && item.validTo < item.validFrom);
  const verifiedWithoutName = dataset.evidence.filter(
    (item) => item.verificationStatus === 'verified' && (item.verifiedBy === null || item.verifiedOn === null)
  );

  return [
    evaluate(
      {
        id: 'evidence.no-holding-evidence',
        dimension: 'evidence',
        severity: 'high',
        title: 'Active controls with no current evidence',
        detail: 'Nothing verified or in date supports these controls, so they cannot be assured.',
      },
      controlsWithoutHolding.map((control) => ref('control', control.id))
    ),
    evaluate(
      {
        id: 'evidence.expired',
        dimension: 'evidence',
        severity: 'high',
        title: 'Expired evidence still attached to an active control',
        detail: 'The evidence window has closed; the control needs fresh evidence.',
      },
      expired.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'evidence.rejected',
        dimension: 'evidence',
        severity: 'high',
        title: 'Rejected evidence still attached to an active control',
        detail: 'Rejected evidence supports nothing until it is replaced or re-verified.',
      },
      rejected.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'evidence.unverified',
        dimension: 'evidence',
        severity: 'medium',
        title: 'Evidence collected but not yet verified',
        detail: 'Unverified evidence is a claim, not assurance, until someone checks it.',
        statusWhenFound: 'warn',
      },
      unverified.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'evidence.orphan',
        dimension: 'evidence',
        severity: 'medium',
        title: 'Evidence linked to no control',
        detail: 'Evidence that traces to no control cannot be reported as supporting a standard.',
      },
      orphan.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'evidence.weak-confidence',
        dimension: 'evidence',
        severity: 'medium',
        title: 'Verified evidence with weak confidence',
        detail: `Evidence marked verified below ${WEAK_CONFIDENCE}% confidence is weaker than its status suggests.`,
        statusWhenFound: 'warn',
      },
      weakVerified.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'evidence.no-owner',
        dimension: 'evidence',
        severity: 'low',
        title: 'Evidence with no resolvable owner',
        detail: 'No one is accountable for producing or renewing this evidence.',
        statusWhenFound: 'warn',
      },
      noOwner.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'evidence.backwards-dates',
        dimension: 'evidence',
        severity: 'high',
        title: 'Evidence whose validity ends before it begins',
        detail: 'The recorded window is impossible, so the state cannot be trusted.',
      },
      backwards.map((item) => ref('evidence', item.id))
    ),
    evaluate(
      {
        id: 'evidence.verified-anonymously',
        dimension: 'evidence',
        severity: 'medium',
        title: 'Evidence marked verified with no verifier or date',
        detail: 'Verification without a person and a date cannot be substantiated.',
      },
      verifiedWithoutName.map((item) => ref('evidence', item.id))
    ),
  ];
}