import test from 'node:test';
import assert from 'node:assert/strict';

import { DATASET_TODAY, buildBaselineDataset, buildDegradedDataset, buildEmptyDataset } from '../src/v8000/data/fixtures/datasets.ts';
import { CONTROL_IDS } from '../src/v8000/data/fixtures/operations.ts';
import { STANDARD_IDS } from '../src/v8000/data/fixtures/reference.ts';
import { runValidation } from '../src/v8000/runners/validationRunner.ts';
import { runDatasetChecks } from '../src/v8000/runners/datasetRunner.ts';
import { buildTraceabilityTree } from '../src/v8000/runners/treeRunner.ts';
import { runTrust } from '../src/v8000/runners/trustRunner.ts';
import { runGaps } from '../src/v8000/runners/gapRunner.ts';
import { runAssurance } from '../src/v8000/runners/assuranceRunner.ts';
import { runHealth } from '../src/v8000/runners/healthRunner.ts';
import { runReadiness } from '../src/v8000/runners/readinessRunner.ts';
import { runDashboards } from '../src/v8000/runners/dashboardRunner.ts';
import { runIntegrity } from '../src/v8000/runners/integrityRunner.ts';
import { runNightly } from '../src/v8000/runners/nightlyRunner.ts';
import { DIMENSIONS } from '../src/v8000/types/index.ts';

const baseline = buildBaselineDataset();
const today = DATASET_TODAY;

test('validation summarises every dimension and separates blocking results', () => {
  const report = runValidation(baseline, today);
  assert.equal(report.dimensionsCovered, DIMENSIONS.length);
  assert.equal(report.total, report.passed + report.failed + report.warned);
  assert.equal(report.blocking.every((result) => result.status === 'fail'), true);
  assert.equal(report.blocking.length > 0, true);
});

test('the traceability tree mirrors the dataset counts', () => {
  const tree = buildTraceabilityTree(baseline, today);
  assert.equal(tree.summary.standards, baseline.standards.length);
  assert.equal(tree.summary.requirements, baseline.requirements.length);
  assert.equal(tree.summary.controls, baseline.controls.length);
  assert.equal(tree.summary.evidence, baseline.evidence.length);
  assert.equal(tree.summary.orphanEvidence, 1);
  assert.equal(tree.summary.standardsWithoutControl, 1);

  const nutrition = tree.standards.find((standard) => standard.id === STANDARD_IDS.agedNutrition);
  assert.equal(nutrition.requirements.length, 0);
  const planning = tree.standards.find((standard) => standard.id === STANDARD_IDS.ndisPersonCentred);
  assert.equal(planning.controls > 0, true);
});

test('trust weights sum to 100 and coverage follows the measured signals', () => {
  const trust = runTrust(baseline, today);
  assert.equal(trust.signals.reduce((sum, signal) => sum + signal.weight, 0), 100);
  assert.equal(typeof trust.score, 'number');
  assert.equal(trust.score >= 0 && trust.score <= 100, true);
  assert.equal(trust.coverage, 100);
  assert.equal(['assured', 'developing', 'at_risk'].includes(trust.band), true);
});

test('an empty dataset reports trust and readiness as not measured, not as zero', () => {
  const empty = buildEmptyDataset();
  assert.equal(runTrust(empty, today).score, null);
  assert.equal(runTrust(empty, today).band, 'not_measured');
  const readiness = runReadiness(empty, today);
  assert.equal(readiness.score, null);
  assert.equal(readiness.coverage, 0);
  assert.equal(readiness.label, 'Not measured');
});

test('gaps are classified, counted and sorted by severity', () => {
  const { report, density } = runGaps(baseline, today);
  assert.equal(report.total, report.gaps.length);
  const summed = Object.values(report.bySeverity).reduce((sum, count) => sum + count, 0);
  assert.equal(summed, report.total);
  assert.equal(report.gaps[0].severity, report.gaps[0].severity);
  assert.equal(report.byKind.missing_evidence >= 1, true);
  assert.equal(typeof density, 'number');
});

test('assurance states a level for every standard and never claims assurance without evidence', () => {
  const { statements, summary } = runAssurance(baseline, today);
  assert.equal(statements.length, baseline.standards.length);
  assert.equal(summary.total, statements.length);
  assert.equal(summary.assured + summary.partial + summary.unsupported + summary.notMeasured, statements.length);

  const nutrition = statements.find((statement) => statement.standardId === STANDARD_IDS.agedNutrition);
  // No requirements recorded for the standard, so it is not measured, and certainly not assured.
  assert.equal(nutrition.level, 'not_measured');
  assert.equal(nutrition.controls, 0);
  statements.forEach((statement) => {
    assert.equal(['assured', 'partial', 'unsupported', 'not_measured'].includes(statement.level), true);
    if (statement.level === 'assured') {
      assert.equal(statement.openFindings, 0);
      assert.equal(statement.evidencedControls, statement.controls);
    }
  });
});

test('readiness is weighted, measured and labelled with text', () => {
  const readiness = runReadiness(baseline, today);
  assert.equal(readiness.parts.reduce((sum, part) => sum + part.weight, 0), 100);
  assert.equal(typeof readiness.score, 'number');
  assert.equal(readiness.label.length > 0, true);
  assert.equal(readiness.coverage, 100);
});

test('health reports blocking state and dimension coverage', () => {
  const health = runHealth(baseline, today);
  assert.equal(health.status, 'blocking');
  assert.equal(health.dimensions.length, DIMENSIONS.length);
  assert.equal(health.dimensionsCovered, DIMENSIONS.length);
  assert.equal(health.dataset.valid, true);
  assert.equal(health.score > 0 && health.score < 100, true);
});

test('the nine dashboards reuse the engine entry points and state missing measures', () => {
  const dashboards = runDashboards(baseline, today);
  assert.equal(dashboards.length, 9);
  const ndis = dashboards.find((dashboard) => dashboard.key === 'ndis');
  assert.equal(ndis.path, '/ndis-portal');
  assert.equal(ndis.label, 'NDIS');
  const board = dashboards.find((dashboard) => dashboard.key === 'board');
  assert.equal(board.path, '/board-ceo');
  dashboards.forEach((dashboard) => {
    assert.equal(dashboard.metrics.length >= 3, true);
    dashboard.metrics.forEach((metric) => {
      assert.equal(metric.value === null || typeof metric.value === 'number', true);
      if (metric.value === null) assert.equal(metric.tone, 'unmeasured');
      assert.equal(metric.label.length > 0, true);
    });
  });
});

test('an empty dataset still produces nine dashboards where every measure is unmeasured or zero-counted', () => {
  const dashboards = runDashboards(buildEmptyDataset(), today);
  assert.equal(dashboards.length, 9);
  dashboards.forEach((dashboard) => {
    dashboard.metrics.forEach((metric) => {
      assert.equal(metric.value === null || metric.value === 0, true, `${dashboard.key}.${metric.key} = ${metric.value}`);
    });
  });
});

test('dataset integrity is a distinct, dataset-scoped measure', () => {
  const integrity = runIntegrity(baseline, today);
  assert.equal(integrity.dimensions.length, 7);
  assert.equal(integrity.dimensions.reduce((sum, dimension) => sum + dimension.weight, 0), 100);
  assert.equal(typeof integrity.score, 'number');
  assert.equal(integrity.score < 100, true, 'the baseline is deliberately imperfect');
});

test('the nightly run is complete, deterministic and honest about what it does not do', () => {
  const first = runNightly(baseline, today);
  const second = runNightly(baseline, today);
  assert.deepEqual(first, second);
  assert.equal(first.status, 'blocked');
  assert.equal(first.runId, `baseline:${today}`);
  assert.equal(first.dashboards.length, 9);
  assert.equal(first.assurance.statements.length, baseline.standards.length);
  assert.equal(first.deferred.length >= 4, true);
  assert.equal(first.gaps.gaps.length, first.gaps.total);
});

test('the degraded dataset blocks the nightly run for structural reasons', () => {
  const report = runNightly(buildDegradedDataset(), today);
  assert.equal(report.status, 'blocked');
  assert.equal(report.dataset.valid, false);
  assert.equal(report.dataset.duplicateCount >= 1, true);
});

test('the dataset runner reports the unowned control as valid schema but the gap runner flags it', () => {
  assert.equal(runDatasetChecks(baseline).valid, true);
  const gaps = runGaps(baseline, today).report;
  assert.equal(gaps.gaps.some((gap) => gap.refs.some((ref) => ref.id === CONTROL_IDS.screening)), true);
});