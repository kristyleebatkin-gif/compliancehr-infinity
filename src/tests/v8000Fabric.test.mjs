import test from 'node:test';
import assert from 'node:assert/strict';
import {
  daysTo,
  evidenceStateAt,
  readinessFromParts,
  readinessBand,
  v8000Position,
  validationChecks,
  ENTRY_POINTS,
} from '../lib/v8000Engine.js';

const TODAY = new Date('2026-11-17T00:00:00Z');

const control = (over) => ({ id: 'c1', status: 'Active', owner: 'Quality Manager', next_test_date: '2027-01-01', standard_code: 'CORE1', ...over });
const evidence = (over) => ({ id: 'e1', control_id: 'c1', verification_status: 'Verified', valid_to: '2027-06-01', ...over });
const standard = (over) => ({ id: 's1', status: 'Active', standard_code: 'CORE1', outcome: 'People are safe', ...over });

test('daysTo counts whole days and rejects unusable dates', () => {
  assert.equal(daysTo('2026-11-20', TODAY), 3);
  assert.equal(daysTo('2026-11-10', TODAY), -7);
  assert.equal(daysTo('', TODAY), null);
  assert.equal(daysTo('20/11/2026', TODAY), null);
});

test('evidence states follow verification status and expiry', () => {
  assert.equal(evidenceStateAt({ verification_status: 'Verified', valid_to: '2027-01-01' }, TODAY), 'verified');
  assert.equal(evidenceStateAt({ verification_status: 'Verified', valid_to: '2026-12-01' }, TODAY), 'expiring');
  assert.equal(evidenceStateAt({ verification_status: 'Verified', valid_to: '2026-01-01' }, TODAY), 'expired');
  assert.equal(evidenceStateAt({ verification_status: 'Unverified' }, TODAY), 'unverified');
  assert.equal(evidenceStateAt({ verification_status: 'Rejected' }, TODAY), 'rejected');
});

test('an empty business reports every measure as not measured', () => {
  const position = v8000Position({ today: TODAY });
  assert.equal(position.trust, null);
  assert.equal(position.coverage, null);
  assert.equal(position.readiness.score, null);
  assert.equal(position.readiness.coverage, 0);
  assert.equal(readinessBand(position.readiness.score).tone, 'unmeasured');
});

test('trust counts verified evidence only, coverage also accepts in-date evidence', () => {
  const position = v8000Position({
    standards: [standard()],
    controls: [control(), control({ id: 'c2' }), control({ id: 'c3' })],
    evidence: [evidence(), evidence({ id: 'e2', control_id: 'c2', valid_to: '2026-12-01' })],
    today: TODAY,
  });
  assert.equal(position.trust, 33);
  assert.equal(position.coverage, 67);
  assert.equal(position.controlsMissing, 1);
});

test('readiness renormalises over measurable parts and reports the rest as coverage', () => {
  const result = readinessFromParts([
    { key: 'a', weight: 50, value: 80 },
    { key: 'b', weight: 20, value: null },
    { key: 'c', weight: 30, value: 60 },
  ]);
  assert.equal(result.score, 73);
  assert.equal(result.coverage, 80);
});

test('overdue findings and expired evidence raise high-severity checks', () => {
  const checks = validationChecks({
    standards: [standard()],
    controls: [control(), control({ id: 'c2', owner: '', next_test_date: '2026-01-01' })],
    evidence: [evidence({ valid_to: '2026-01-01' })],
    findings: [{ id: 'f1', status: 'Open', due_date: '2026-01-01' }],
    today: TODAY,
  });
  const expired = checks.find((check) => check.id === 'evidence-expired');
  const overdue = checks.find((check) => check.id === 'findings-overdue');
  assert.equal(expired.severity, 'high');
  assert.equal(overdue.count, 1);
  assert.equal(checks[0].severity, 'high');
  assert.ok(checks.every((check) => check.count > 0 && check.action.path));
});

test('a clean position produces no checks rather than a fabricated result', () => {
  const checks = validationChecks({
    standards: [standard()],
    controls: [control()],
    evidence: [evidence()],
    findings: [],
    today: TODAY,
  });
  assert.deepEqual(checks, []);
});

test('nine entry points are declared, each with a route and its own register counts', () => {
  assert.equal(ENTRY_POINTS.length, 9);
  assert.deepEqual(ENTRY_POINTS.map((entry) => entry.key), [
    'executive', 'board', 'trust', 'ndis', 'aged-care', 'clinical', 'workforce', 'audit', 'risk',
  ]);
  entryPointsShape();
});

function entryPointsShape() {
  ENTRY_POINTS.forEach((entry) => {
    assert.match(entry.path, /^\//);
    assert.ok(entry.counts.length >= 1);
  });
}