import test from 'node:test';
import assert from 'node:assert/strict';

import { DATASET_TODAY, buildBaselineDataset, buildDegradedDataset, buildEmptyDataset } from '../src/v8000/data/fixtures/datasets.ts';
import { CONTROL_IDS, FINDING_IDS } from '../src/v8000/data/fixtures/operations.ts';
import { REQUIREMENT_IDS, STANDARD_IDS } from '../src/v8000/data/fixtures/reference.ts';
import { runAllValidators, VALIDATORS } from '../src/v8000/validators/index.ts';
import { referenceValidator } from '../src/v8000/validators/reference.ts';
import { ownerValidator } from '../src/v8000/validators/owner.ts';
import { evidenceValidator } from '../src/v8000/validators/evidence.ts';
import { workflowValidator } from '../src/v8000/validators/workflow.ts';
import { reviewValidator } from '../src/v8000/validators/review.ts';
import { traceabilityValidator } from '../src/v8000/validators/traceability.ts';
import { findingValidator } from '../src/v8000/validators/finding.ts';
import { capaValidator } from '../src/v8000/validators/capa.ts';
import { gapValidator } from '../src/v8000/validators/gap.ts';
import { integrityValidator } from '../src/v8000/validators/integrity.ts';
import { trustValidator } from '../src/v8000/validators/trust.ts';
import { DIMENSIONS } from '../src/v8000/types/index.ts';

const baseline = buildBaselineDataset();
const today = DATASET_TODAY;

const byId = (results, id) => {
  const match = results.find((result) => result.id === id);
  assert.ok(match, `expected check ${id} to be evaluated`);
  return match;
};

test('every dimension has exactly one validator', () => {
  assert.deepEqual(Object.keys(VALIDATORS).sort(), [...DIMENSIONS].sort());
  assert.equal(VALIDATORS.reference, referenceValidator);
});

test('baseline references all resolve', () => {
  const results = referenceValidator(baseline, today);
  const failing = results.filter((result) => result.status !== 'pass');
  assert.deepEqual(failing.map((result) => `${result.id}: ${result.count}`), []);
});

test('degraded references and duplicate owners are caught', () => {
  const degraded = buildDegradedDataset();
  const results = referenceValidator(degraded, today);
  assert.equal(byId(results, 'reference.control-requirement').count >= 1, true);
  assert.equal(byId(results, 'reference.evidence-control').count >= 1, true);
  assert.equal(byId(results, 'reference.capa-finding').count >= 1, true);
  assert.equal(byId(results, 'reference.review-subject').count >= 1, true);
  assert.equal(byId(results, 'reference.control-owner').count >= 1, true);
});

test('the unowned control is reported by the owner validator', () => {
  const results = ownerValidator(baseline, today);
  const unowned = byId(results, 'owner.control-unowned');
  assert.equal(unowned.status, 'fail');
  assert.deepEqual(unowned.refs.map((ref) => ref.id), [CONTROL_IDS.screening]);
});

test('expired and rejected evidence are separated from missing evidence', () => {
  const results = evidenceValidator(baseline, today);
  assert.equal(byId(results, 'evidence.expired').count >= 1, true);
  assert.equal(byId(results, 'evidence.rejected').count >= 1, true);
  assert.equal(byId(results, 'evidence.orphan').count >= 1, true);
  const missing = byId(results, 'evidence.no-holding-evidence');
  assert.equal(missing.refs.some((ref) => ref.id === CONTROL_IDS.medication), true);
  assert.equal(missing.refs.some((ref) => ref.id === CONTROL_IDS.screening), true);
});

test('a workflow cycle is found only in the degraded dataset', () => {
  const healthy = workflowValidator(baseline, today);
  assert.equal(byId(healthy, 'workflow.cycle').status, 'pass');
  assert.equal(byId(healthy, 'workflow.broken-next').status, 'pass');

  const broken = workflowValidator(buildDegradedDataset(), today);
  const cycle = byId(broken, 'workflow.cycle');
  assert.equal(cycle.status, 'fail');
  assert.equal(cycle.count >= 1, true);
  assert.equal(byId(broken, 'workflow.instance-unknown-step').status, 'fail');
  assert.equal(byId(broken, 'workflow.instance-overdue').count >= 1, true);
});

test('the overdue framework review is reported', () => {
  const results = reviewValidator(baseline, today);
  const overdue = byId(results, 'review.overdue');
  assert.equal(overdue.status, 'fail');
  assert.deepEqual(overdue.refs.map((ref) => ref.id), ['rev-ndis-framework']);
});

test('traceability names the exact broken links in the baseline', () => {
  const results = traceabilityValidator(baseline, today);
  assert.deepEqual(
    byId(results, 'traceability.requirement-no-control').refs.map((ref) => ref.id),
    [REQUIREMENT_IDS.accessibleCommunication]
  );
  assert.deepEqual(
    byId(results, 'traceability.requirement-no-outcome').refs.map((ref) => ref.id),
    [REQUIREMENT_IDS.riskReview]
  );
  assert.deepEqual(
    byId(results, 'traceability.standard-no-control').refs.map((ref) => ref.id),
    [STANDARD_IDS.agedNutrition]
  );
});

test('findings and corrective actions are judged on verification, not status alone', () => {
  const findings = findingValidator(baseline, today);
  const overdue = byId(findings, 'finding.overdue');
  assert.equal(overdue.refs.some((ref) => ref.id === FINDING_IDS.medication), true);
  assert.equal(byId(findings, 'finding.closed-unverified').count >= 1, true);

  const capas = capaValidator(baseline, today);
  assert.equal(byId(capas, 'capa.overdue').count >= 1, true);
  assert.equal(byId(capas, 'capa.ineffective').count >= 1, true);
});

test('gaps and integrity report real defects rather than a clean sheet', () => {
  const gaps = gapValidator(baseline, today);
  assert.equal(byId(gaps, 'gap.critical').status, 'fail');
  assert.equal(byId(gaps, 'gap.unmapped-requirement').count, 1);
  assert.equal(byId(gaps, 'gap.training').count >= 1, true);

  const integrity = integrityValidator(baseline, today);
  assert.equal(byId(integrity, 'integrity.below-floor').status, 'fail');
  assert.equal(byId(integrity, 'integrity.coverage').count, 0, 'every integrity dimension is measured in the baseline');
});

test('trust reports its floor rather than inventing a pass', () => {
  const results = trustValidator(baseline, today);
  assert.equal(byId(results, 'trust.below-floor').status, 'fail');
  assert.equal(byId(results, 'trust.unmeasured-signal').count, 0);
});

test('an empty dataset produces passes and warnings, never a failure or a throw', () => {
  const empty = buildEmptyDataset();
  const results = runAllValidators(empty, today);
  assert.equal(results.length > 0, true);
  assert.equal(results.some((result) => result.status === 'fail'), false, results.filter((r) => r.status === 'fail').map((r) => r.id).join(', '));
  assert.equal(new Set(results.map((result) => result.dimension)).size, DIMENSIONS.length);
});

test('every check result carries an id, a status and a non-negative count', () => {
  runAllValidators(baseline, today).forEach((result) => {
    assert.equal(result.id.length > 0, true);
    assert.equal(['pass', 'fail', 'warn'].includes(result.status), true);
    assert.equal(Number.isInteger(result.count) && result.count >= 0, true);
    assert.equal(DIMENSIONS.includes(result.dimension), true);
  });
});