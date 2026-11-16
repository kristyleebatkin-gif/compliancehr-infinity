import { assertEquals } from 'jsr:@std/assert@1';
import { publicationAuthority, approvalIndependence } from '../../base44/shared/workflowGovernance.ts';
import { canActOnNode, normaliseNodes } from '../../base44/shared/workflowEngine.ts';

Deno.test('publication requires distinct known identities even for administrators', () => {
  assertEquals(publicationAuthority('maker', 'checker'), null);
  assertEquals(Boolean(publicationAuthority('maker', 'maker')), true);
  assertEquals(Boolean(publicationAuthority('', 'checker')), true);
  assertEquals(Boolean(publicationAuthority('maker', '')), true);
});
Deno.test('approval independence uses stable identities, includes all preparers and legacy evidence events', () => {
  const history = [
    { event_type: 'StepCompleted', node_type: 'TASK', actor_id: 'maker-a' },
    { event_type: 'StepOpened', node_type: 'APPROVAL', actor_id: 'checker' },
    { event_type: 'EvidenceVerified', node_type: 'EVIDENCE_UPLOAD', actor_id: 'maker-b' },
    { event_type: 'EvidenceRecorded', node_type: 'EVIDENCE_REQUEST', actor_id: 'maker-c' },
  ];
  for (const id of ['maker-a', 'maker-b', 'maker-c']) assertEquals(Boolean(approvalIndependence(id, history)), true);
  assertEquals(approvalIndependence('checker', history), null);
  assertEquals(Boolean(approvalIndependence('checker', [...history, { event_type: 'StepCompleted', node_type: 'TASK' }])), true);
  assertEquals(Boolean(approvalIndependence('', history)), true);
});
Deno.test('unassigned work does not become available to every worker', () => {
  const node = normaliseNodes([{ id: 'task', type: 'TASK' }])[0];
  assertEquals(canActOnNode(node, { role: 'Support Worker' }).allowed, false);
  assertEquals(canActOnNode(node, { role: 'admin' }).allowed, true);
  assertEquals(canActOnNode(node, { role: 'Provider Administrator' }).allowed, true);
});
