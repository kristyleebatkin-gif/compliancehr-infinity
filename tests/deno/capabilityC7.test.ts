import { assertEquals, assertExists } from 'jsr:@std/assert@1';
import {
  SYSTEM_TRIPLES,
  DERIVED_TRIPLES,
  NODE_TYPES,
  RELATIONSHIP_TYPES,
  tripleAllowed,
  buildNodes,
  validateEdges,
  nodeKey,
} from '../../base44/shared/graphRegistry.ts';
import {
  METRICS,
  ESTIMATE_NOTICE,
  ENGINE_VERSION,
  validateModelMetrics,
  validateLevers,
  simulate,
} from '../../base44/shared/digitalTwin.ts';

/* ---------------------------------------------------------------- graph registry */

Deno.test('C7 every derived rule is a relationship this app allows', () => {
  const allowed = new Set(RELATIONSHIP_TYPES);
  DERIVED_TRIPLES.forEach((triple: any) => assertEquals(allowed.has(triple.relationship), true));
});

Deno.test('C7 every indexed node type reads a real register and carries its route', () => {
  const entities = new Set<string>();
  NODE_TYPES.forEach((type: any) => {
    assertExists(type.sourceEntity);
    assertExists(type.path);
    entities.add(type.sourceEntity);
  });
  assertEquals(entities.size, NODE_TYPES.length);
});

Deno.test('C7 an edge is refused when an endpoint is another business or missing', () => {
  const keys = new Set([nodeKey('control', 'c1'), nodeKey('standard', 's1')]);
  const { accepted, rejected } = validateEdges([
    { fromKey: nodeKey('control', 'c1'), fromType: 'control', relationship: 'REFERENCES', toKey: nodeKey('standard', 's1'), toType: 'standard' },
    { fromKey: nodeKey('control', 'c1'), fromType: 'control', relationship: 'REFERENCES', toKey: nodeKey('standard', 'other-business'), toType: 'standard' },
  ], keys, SYSTEM_TRIPLES);
  assertEquals(accepted.length, 1);
  assertEquals(rejected.length, 1);
  assertEquals(/not an indexed record/.test(rejected[0].reason), true);
});

Deno.test('C7 a record cannot relate to itself and the ontology still filters', () => {
  const keys = new Set([nodeKey('risk', 'r1'), nodeKey('policy', 'p1')]);
  const { accepted, rejected } = validateEdges([
    { fromKey: nodeKey('risk', 'r1'), fromType: 'risk', relationship: 'RELATES_TO', toKey: nodeKey('risk', 'r1'), toType: 'risk' },
    { fromKey: nodeKey('risk', 'r1'), fromType: 'risk', relationship: 'GOVERNS', toKey: nodeKey('policy', 'p1'), toType: 'policy' },
  ], keys, DERIVED_TRIPLES);
  assertEquals(accepted.length, 0);
  assertEquals(rejected.length, 2);
  assertEquals(tripleAllowed(DERIVED_TRIPLES, 'risk', 'RELATES_TO', 'standard'), true);
  assertEquals(tripleAllowed(DERIVED_TRIPLES, 'risk', 'RELATES_TO', 'policy'), false);
});

Deno.test('C7 a node points back at the register record it was built from', () => {
  const rows = buildNodes({ risk: [{ id: 'r1', tenant_id: 'a', title: 'Fall risk', status: 'Open' }] });
  assertEquals(rows.length, 1);
  assertEquals(rows[0].key, nodeKey('risk', 'r1'));
  assertEquals(rows[0].sourceEntity, 'Risk');
  assertEquals(rows[0].sourceRecordId, 'r1');
  assertEquals(rows[0].modulePath, '/risks');
  assertEquals(rows[0].recordStatus, 'Open');
});

/* ---------------------------------------------------------------- digital twin */

const model = {
  metrics_json: [
    { metric: 'control_coverage', weight: 60, ceiling: 100 },
    { metric: 'gap_exposure', weight: 40, ceiling: 50 },
  ],
};
const observations = {
  metrics: {
    control_coverage: { value: 80, recordCount: 40, note: '40 evidence records' },
    gap_exposure: { value: 10, recordCount: 2, note: '2 open gaps' },
  },
};

Deno.test('C7 a published estimate carries its notice, engine version and provenance', () => {
  const scenario = { levers_json: [{ metric: 'control_coverage', delta: 20, rationale: 'Two documents to be verified' }] };
  const run = simulate(model, scenario, observations);
  assertEquals(ESTIMATE_NOTICE.includes('not an observed outcome'), true);
  assertExists(ENGINE_VERSION);
  assertEquals(run.index_baseline < run.index_projected, true);
  const moved = run.results.find((row: any) => row.metric === 'control_coverage');
  assertEquals(moved.rationale, 'Two documents to be verified');
  assertEquals(moved.record_count, 40);
  assertExists(moved.source);
  assertEquals(moved.projected, 100);
});

Deno.test('C7 an input with no records is excluded and lowers confidence', () => {
  const partial = { metrics: { control_coverage: { value: 80, recordCount: 40, note: '40 evidence records' } } };
  const run = simulate(model, { levers_json: [] }, partial);
  assertEquals(run.metrics_used, 1);
  assertEquals(run.metrics_missing, 1);
  assertEquals(run.confidence, 60);
  const silent = run.results.find((row: any) => row.metric === 'gap_exposure');
  assertEquals(silent.observed, null);
  assertEquals(silent.projected, null);
});

Deno.test('C7 a model with no data behind it refuses to model anything', () => {
  const run = simulate(model, { levers_json: [] }, { metrics: {} });
  assertEquals(/nothing to model/.test(run.error), true);
});

Deno.test('C7 a lever without a stated reason is rejected', () => {
  const metrics = validateModelMetrics(model.metrics_json).metrics;
  assertEquals(/hidden assumption/.test(validateLevers([{ metric: 'gap_exposure', delta: -5, rationale: '' }], metrics).error), true);
  assertEquals(validateLevers([{ metric: 'gap_exposure', delta: -5, rationale: 'Close two gaps' }], metrics).error, undefined);
});

Deno.test('C7 a lever on something the model does not read is rejected', () => {
  const metrics = validateModelMetrics(model.metrics_json).metrics;
  assertEquals(/not an input of this model/.test(validateLevers([{ metric: 'risk_exposure', delta: 1, rationale: 'test' }], metrics).error), true);
});

Deno.test('C7 model inputs must be known, unique and weighted', () => {
  assertEquals(/Unknown model input/.test(validateModelMetrics([{ metric: 'made_up', weight: 10 }]).error), true);
  assertEquals(/listed twice/.test(validateModelMetrics([{ metric: 'gap_exposure', weight: 10 }, { metric: 'gap_exposure', weight: 20 }]).error), true);
  assertEquals(/weight between 1 and 100/.test(validateModelMetrics([{ metric: 'gap_exposure', weight: 0 }]).error), true);
  assertEquals(validateModelMetrics([]).error, 'Add at least one model input.');
  assertEquals(METRICS.every((metric: any) => Boolean(metric.source && metric.label && metric.description)), true);
});