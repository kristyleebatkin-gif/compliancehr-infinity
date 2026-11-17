import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import {
  DATASET_TODAY,
  buildBaselineDataset,
  buildDegradedDataset,
  buildEmptyDataset,
} from '../src/v8000/data/fixtures/datasets.ts';
import { v8000DatasetSchema } from '../src/v8000/schemas/dataset.ts';
import { evidenceSchema } from '../src/v8000/schemas/evidence.ts';
import { capaSchema } from '../src/v8000/schemas/capa.ts';
import { riskRecordSchema } from '../src/v8000/schemas/risk.ts';
import { runDatasetChecks } from '../src/v8000/runners/datasetRunner.ts';
import { REPOSITORY_MAP } from '../src/v8000/data/repositoryMap.ts';
import { DATA_DICTIONARY } from '../src/v8000/data/dictionary.ts';
import { DATASET_COLLECTIONS } from '../src/v8000/types/dataset.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const COLLECTION_ENTITY = {
  frameworks: 'framework',
  standards: 'standard',
  requirements: 'requirement',
  outcomes: 'outcome',
  owners: 'owner',
  policies: 'policy',
  procedures: 'procedure',
  training: 'training',
  competencies: 'competency',
  assessments: 'assessment',
  controls: 'control',
  evidence: 'evidence',
  audits: 'audit',
  findings: 'finding',
  capas: 'capa',
  workflows: 'workflow',
  instances: 'workflow_instance',
  reviews: 'review',
  risks: 'risk',
};

test('the baseline dataset satisfies the assembled dataset schema', () => {
  const parsed = v8000DatasetSchema.safeParse(buildBaselineDataset());
  assert.equal(parsed.success, true, parsed.success ? '' : JSON.stringify(parsed.error.issues.slice(0, 5), null, 2));
});

test('every baseline record parses and no collection holds a duplicate id', () => {
  const report = runDatasetChecks(buildBaselineDataset());
  assert.equal(report.schemaIssueCount, 0, report.collections.flatMap((c) => c.schemaIssues).slice(0, 5).map((i) => i.message).join(' | '));
  assert.equal(report.duplicateCount, 0);
  assert.equal(report.valid, true);
  assert.equal(report.totalRecords > 40, true, 'the baseline should be a substantial dataset');
});

test('the empty dataset is structurally valid but measures nothing', () => {
  const report = runDatasetChecks(buildEmptyDataset());
  assert.equal(report.valid, true);
  assert.equal(report.totalRecords, 0);
  assert.equal(report.emptyCollections.length, DATASET_COLLECTIONS.length);
});

test('the degraded dataset is caught: duplicate ids, and records still parse', () => {
  const report = runDatasetChecks(buildDegradedDataset());
  assert.equal(report.duplicateCount >= 1, true);
  assert.equal(report.valid, false);
});

test('evidence cannot claim a validity window that runs backwards', () => {
  const base = buildBaselineDataset().evidence[0];
  const parsed = evidenceSchema.safeParse({ ...base, validFrom: '2026-06-01', validTo: '2026-05-01' });
  assert.equal(parsed.success, false);
  assert.match(JSON.stringify(parsed.error.issues), /validTo cannot precede validFrom/);
});

test('an effective corrective action needs a completion date and a verifier', () => {
  const base = buildBaselineDataset().capas[0];
  const parsed = capaSchema.safeParse({ ...base, effectivenessCheck: 'effective', completedOn: null, verifiedBy: null });
  assert.equal(parsed.success, false);
  assert.match(JSON.stringify(parsed.error.issues), /effective CAPA needs a completion date/);
});

test('a risk rating must agree with its own likelihood and consequence', () => {
  const base = buildBaselineDataset().risks[0];
  const parsed = riskRecordSchema.safeParse({ ...base, likelihood: 1, consequence: 1, rating: 'critical' });
  assert.equal(parsed.success, false);
  assert.match(JSON.stringify(parsed.error.issues), /rating does not match/);
});

test('every file in the repository map exists', () => {
  const missing = REPOSITORY_MAP.filter((entry) => !existsSync(path.join(ROOT, entry.path))).map((entry) => entry.path);
  assert.deepEqual(missing, []);
});

test('the repository map has no duplicate paths and states a real status', () => {
  const paths = REPOSITORY_MAP.map((entry) => entry.path);
  assert.equal(new Set(paths).size, paths.length);
  REPOSITORY_MAP.forEach((entry) => {
    assert.equal(['reuse', 'extend', 'new'].includes(entry.status), true, `${entry.path} has status ${entry.status}`);
    assert.equal(entry.artefact.length > 0, true);
  });
});

test('the data dictionary describes every collection the dataset carries', () => {
  const described = new Set(DATA_DICTIONARY.map((entry) => entry.entity));
  DATASET_COLLECTIONS.forEach((collection) => {
    assert.equal(described.has(COLLECTION_ENTITY[collection]), true, `${collection} has no dictionary entry`);
  });
  DATA_DICTIONARY.forEach((entry) => {
    assert.equal(entry.fields.length > 0, true, `${entry.entity} documents no fields`);
    assert.equal(entry.fields.every((field) => field.description.length > 0), true, `${entry.entity} has an undocumented field`);
  });
});

test('the fixtures are pinned to a stated date rather than the wall clock', () => {
  assert.equal(DATASET_TODAY, '2026-11-17');
  assert.equal(buildBaselineDataset().meta.builtOn.startsWith(DATASET_TODAY), true);
});