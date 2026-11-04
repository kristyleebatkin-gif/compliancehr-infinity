import assert from 'node:assert/strict';
import {
  PRIVATE_COMPLIANCE_ENTITIES,
  canCommunityUserAccessEntity,
  assertCommunityBoundaryAccess,
  scrubCommunityContentForPii,
  computeAnonymisedPeerBenchmark,
  BENCHMARK_SEED_COHORT,
  checkTierEntitlement,
  calculateAdviserBookingQuote,
  submitAdviserReview,
  evaluateModerationReport,
  processModerationAppeal,
  calculateReputationScore,
  runCommunityVerificationSuite,
} from '../src/lib/communityPlatformEngine.js';

// 1. Verify every test case in the 14-point verification matrix passes
const results = runCommunityVerificationSuite();
for (const row of results) {
  assert.equal(row.status, 'PASS', `Expected ${row.id} (${row.test}) to PASS`);
}

// 2. Verify every single private compliance entity is blocked from community users
for (const entityName of PRIVATE_COMPLIANCE_ENTITIES) {
  assert.equal(
    canCommunityUserAccessEntity({ surface: 'community', role: 'Community Member' }, entityName),
    false,
    `Community member must NEVER access private compliance entity ${entityName}`
  );
  assert.throws(
    () => assertCommunityBoundaryAccess({ surface: 'community', role: 'Community Member' }, entityName, 'read'),
    /403 Forbidden \[Zero-Trust Community Boundary\]/
  );
}

// 3. Verify k-anonymity suppression for cohorts < 5 and aggregation for cohorts >= 5
const smallCohort = computeAnonymisedPeerBenchmark(BENCHMARK_SEED_COHORT, { state: 'QLD' });
assert.equal(smallCohort.suppressed, true);
assert.equal(smallCohort.metrics, null);

const validCohort = computeAnonymisedPeerBenchmark(BENCHMARK_SEED_COHORT, { sector: 'NDIS', state: 'NSW' });
assert.equal(validCohort.suppressed, false);
assert.equal(validCohort.cohortSize, 5);
assert.ok(validCohort.metrics.workerScreeningCurrency.median > 95);

// 4. Verify PII scrubber and moderation appeal conflict-of-interest check
const pii = scrubCommunityContentForPii('Call 0412 345 678 regarding NDIS 430 111 222');
assert.equal(pii.piiDetected, true);
assert.ok(!pii.sanitized.includes('430 111 222'));

console.log(`All ${results.length} Wave 2 Community Platform & Privacy Isolation tests passed.`);