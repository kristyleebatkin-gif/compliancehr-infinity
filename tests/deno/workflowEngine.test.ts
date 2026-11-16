import { assertEquals, assertRejects, assertThrows } from 'jsr:@std/assert@1';
import {
  normaliseNodes,
  validateGraph,
  unsupportedHandlers,
  contentHash,
  canonicalGraph,
  nextNodeId,
  canActOnNode,
  requiresEvidence,
  isApprovalNode,
  stepKind,
  dueAtFor,
  slaStateFor,
  nextVersion,
  SUPPORTED_HANDLERS,
} from '../../base44/shared/workflowEngine.ts';
import { WORKFLOW_TEMPLATES } from '../../src/lib/workflowStudio.js';

const graph = [
  { id: 's', type: 'START', label: 'Start', next: 't' },
  { id: 't', type: 'TASK', label: 'Prepare', role: 'Compliance Manager', sla_hours: 24, next: 'a' },
  { id: 'a', type: 'APPROVAL', label: 'Sign off', role: 'General Manager', next: 'e' },
  { id: 'e', type: 'END', label: 'End' },
];

Deno.test('a graph is normalised into a known shape and malformed graphs are refused', () => {
  assertEquals(normaliseNodes(graph)[1].role, 'Compliance Manager');
  assertEquals(normaliseNodes([{ id: 'x', type: 'task', label: 'Lower case type' }])[0].type, 'TASK');
  assertThrows(() => normaliseNodes([{ id: 'x', type: 'TASK' }, { id: 'x', type: 'TASK' }]), Error, 'used twice');
  assertThrows(() => normaliseNodes([{ type: 'TASK' }]), Error, 'needs an id');
  assertThrows(() => normaliseNodes(Array.from({ length: 121 }, (_, n) => ({ id: `n${n}`, type: 'TASK' }))), Error, '120');
});

Deno.test('validation accepts a complete graph and names the faults of a broken one', () => {
  assertEquals(validateGraph(normaliseNodes(graph)).valid, true);

  const dangling = graph.map((node) => (node.id === 't' ? { ...node, next: 'missing' } : node));
  assertEquals(validateGraph(normaliseNodes(dangling)).valid, false);

  const twoStarts = [...graph, { id: 's2', type: 'START', label: 'Second start', next: 'e' }];
  const report = validateGraph(normaliseNodes(twoStarts));
  assertEquals(report.valid, false);
  assertEquals(report.errors.some((error) => error.includes('exactly one start step')), true);

  const noPerson = [
    { id: 's', type: 'START', label: 'Start', next: 'e' },
    { id: 'e', type: 'END', label: 'End' },
  ];
  assertEquals(validateGraph(normaliseNodes(noPerson)).valid, false);
});

Deno.test('a node handler without a verified runtime adapter cannot be published', () => {
  for (const type of ['NOTIFICATION', 'WAIT', 'AI_REVIEW', 'API_CALL', 'WEBHOOK', 'SUB_WORKFLOW', 'SLA_CHECK', 'STANDARD_CHECK']) {
    const withAdapter = [
      { id: 's', type: 'START', label: 'Start', next: 't' },
      { id: 't', type: 'TASK', label: 'Work', role: 'Compliance Manager', next: 'x' },
      { id: 'x', type, label: 'Adapter step', next: 'e' },
      { id: 'e', type: 'END', label: 'End' },
    ];
    const nodes = normaliseNodes(withAdapter);
    assertEquals(unsupportedHandlers(nodes).includes(type), true, `${type} was treated as supported`);
    assertEquals(validateGraph(nodes).valid, false, `${type} was publishable`);
  }
  assertEquals(unsupportedHandlers(normaliseNodes(graph)), []);
});

Deno.test('every supplied template is publishable on this runtime', () => {
  assertEquals(WORKFLOW_TEMPLATES.length, 10);
  for (const template of WORKFLOW_TEMPLATES) {
    const nodes = normaliseNodes(template.nodes);
    assertEquals(unsupportedHandlers(nodes), [], `${template.code} still uses an unverified handler`);
    const report = validateGraph(nodes);
    assertEquals(report.valid, true, `${template.code}: ${report.errors.join(' | ')}`);
  }
});

Deno.test('the graph hash follows content, not key order, and changes with the graph', async () => {
  const reordered = graph.map((node) => Object.fromEntries(Object.entries(node).reverse()));
  assertEquals(canonicalGraph(normaliseNodes(graph)), canonicalGraph(normaliseNodes(reordered)));
  const first = await contentHash(normaliseNodes(graph));
  const second = await contentHash(normaliseNodes(reordered));
  assertEquals(first, second);
  const changed = graph.map((node) => (node.id === 't' ? { ...node, sla_hours: 48 } : node));
  const third = await contentHash(normaliseNodes(changed));
  assertEquals(first === third, false);
  assertEquals(/^sha256:[0-9a-f]{64}$/.test(first) || /^fnv1a64:[0-9a-f]{16}$/.test(first), true);
});

Deno.test('a decision takes its own route and other steps take their next step', () => {
  const decision = normaliseNodes([
    { id: 'd', type: 'DECISION', label: 'Reportable?', role: 'Compliance Manager', yes_next: 'y', no_next: 'n' },
  ])[0];
  assertEquals(nextNodeId(decision, 'approve'), 'y');
  assertEquals(nextNodeId(decision, 'reject'), 'n');
  assertEquals(nextNodeId(normaliseNodes(graph)[1], 'reject'), 'a');
});

Deno.test('authority is checked against the assigned role, with a recorded override', () => {
  const approval = normaliseNodes(graph)[2];
  assertEquals(canActOnNode(approval, { role: 'General Manager' }).allowed, true);
  const denied = canActOnNode(approval, { role: 'Support Worker' });
  assertEquals(denied.allowed, false);
  assertEquals(denied.reason?.includes('General Manager'), true);
  assertEquals(canActOnNode(approval, { role: 'admin' }), { allowed: true, override: true });
  assertEquals(canActOnNode(approval, { role: 'Provider Administrator' }).override, true);
  assertEquals(canActOnNode(undefined, { role: 'admin' }).allowed, false);
});

Deno.test('step classification drives the evidence gate and the task label', () => {
  const [start, task, approval, end] = normaliseNodes(graph);
  assertEquals(requiresEvidence(task), false);
  assertEquals(requiresEvidence(normaliseNodes([{ id: 'v', type: 'EVIDENCE_VALIDATION', label: 'Check' }])[0]), true);
  assertEquals(isApprovalNode(approval), true);
  assertEquals(isApprovalNode(task), false);
  assertEquals(stepKind(approval), 'Approval');
  assertEquals(stepKind(task), 'Task');
  assertEquals(stepKind(start), 'Task');
  assertEquals(stepKind(end), 'Closed');
});

Deno.test('clocks are calculated from the step target and never claim a closed run is on track', () => {
  const task = normaliseNodes(graph)[1];
  const from = new Date('2026-11-16T00:00:00.000Z');
  assertEquals(dueAtFor(task, from, 72), '2026-11-17T00:00:00.000Z');
  const noClock = normaliseNodes([{ id: 'x', type: 'TASK', label: 'No clock', role: 'Administrator', sla_hours: 0 }])[0];
  assertEquals(dueAtFor(noClock, from, 0), null);

  const now = new Date('2026-11-16T00:00:00.000Z');
  assertEquals(slaStateFor('2026-11-18T00:00:00.000Z', 'Running', now), 'On track');
  assertEquals(slaStateFor('2026-11-16T02:00:00.000Z', 'Running', now), 'Due soon');
  assertEquals(slaStateFor('2026-11-15T00:00:00.000Z', 'Running', now), 'Breached');
  assertEquals(slaStateFor('2026-11-15T00:00:00.000Z', 'Completed', now), 'Closed');
  assertEquals(slaStateFor(null, 'Running', now), 'On track');
});

Deno.test('versions advance by one and never reuse a number', () => {
  assertEquals(nextVersion(0), 1);
  assertEquals(nextVersion(3), 4);
  assertEquals(nextVersion(undefined), 1);
  assertEquals(nextVersion('bogus'), 1);
  assertEquals(SUPPORTED_HANDLERS.includes('EVIDENCE_VALIDATION'), true);
});