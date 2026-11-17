import test from 'node:test';
import assert from 'node:assert/strict';
import {
  integrityDimensions,
  scoreDimension,
  scoreIntegrityIndex,
  integrityBand,
  businessToday,
} from '../src/lib/integrityIndex.js';

const today = '2026-11-17';

test('the governing weights sum to exactly 100 across ten dimensions', () => {
  const dimensions = integrityDimensions(today);
  assert.equal(dimensions.length, 10);
  assert.equal(dimensions.reduce((total, dimension) => total + dimension.weight, 0), 100);
  assert.deepEqual(dimensions.map((dimension) => dimension.key), [
    'governance', 'compliance', 'risk', 'audit', 'evidence',
    'workforce', 'clinical', 'trust', 'assurance', 'strategic',
  ]);
});

test('a dimension scores the ratio of good evidence to total evidence', () => {
  const [governance] = integrityDimensions(today);
  const scored = scoreDimension(governance, { govActive: 30, govOverdue: 10, boardApproved: 20, boardOverdue: 0 });
  assert.equal(scored.good, 50);
  assert.equal(scored.bad, 10);
  assert.equal(scored.score, 83);
  assert.equal(scored.coverage, 100);
});

test('unmeasured dimensions carry no weight and cannot inflate the index', () => {
  const dimensions = integrityDimensions(today);
  const result = scoreIntegrityIndex(dimensions, { govActive: 9, govOverdue: 1 });
  const governance = result.dimensions.find((dimension) => dimension.key === 'governance');
  assert.equal(governance.score, 90);
  assert.equal(result.score, 90);
  assert.equal(result.coverage, 15);
  assert.equal(result.measuredDimensions, 1);
});

test('an empty business reports no score rather than a perfect one', () => {
  const result = scoreIntegrityIndex(integrityDimensions(today), {});
  assert.equal(result.score, null);
  assert.equal(result.coverage, 0);
  assert.equal(result.band.tone, 'unmeasured');
});

test('missing or impossible counts are treated as not measured', () => {
  const [governance] = integrityDimensions(today);
  const scored = scoreDimension(governance, { govActive: null, govOverdue: -2, boardApproved: 4, boardOverdue: 0 });
  assert.equal(scored.good, 4);
  assert.equal(scored.bad, 0);
  assert.equal(scored.score, 100);
  assert.equal(scored.coverage, 50);
});

test('bands follow the published thresholds', () => {
  assert.equal(integrityBand(95).tone, 'exemplary');
  assert.equal(integrityBand(75).tone, 'assured');
  assert.equal(integrityBand(60).tone, 'developing');
  assert.equal(integrityBand(59).tone, 'risk');
  assert.equal(integrityBand(null).tone, 'unmeasured');
});

test('an invalid business date is rejected', () => {
  assert.throws(() => integrityDimensions('17/11/2026'), /business date/i);
});

test('businessToday returns an ISO date in the business time zone', () => {
  const value = businessToday(new Date('2026-11-17T13:00:00Z'));
  assert.match(value, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(value, '2026-11-17');
});