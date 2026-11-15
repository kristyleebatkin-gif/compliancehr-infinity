import test from 'node:test';
import assert from 'node:assert/strict';
import { readTraceabilityReview } from '../src/lib/evidenceTraceabilityReview.js';
import { ENTERPRISE_PHASES, REQUIRED_WORKSPACES, SHARED_ENGINES, EVIDENCE_CHAIN } from '../src/lib/enterprisePhases.js';
const user = { id: 'user-a', tenant_id: 'business-a', role: 'Provider Administrator', account_status: 'Active', access_approved: true };
const record = (id, fields = {}) => ({ id, tenant_id: 'business-a', lifecycle_stage: 'Policy', title: id, ...fields });
const review = rows => readTraceabilityReview({ user, entities: { GovernanceObject: { filter: async (query, options) => {
  assert.equal(query.tenant_id, user.tenant_id); assert.equal(options.limit, 201);
  assert.deepEqual(query.status, { $ne: 'Archived' });
  return rows;
} } } });
test('traceability denies missing identity, approval, business and permission before any source access', async () => {
  const entities = new Proxy({}, { get() { assert.fail('Denied user must not query'); } });
  for (const person of [null, { ...user, id: '' }, { ...user, tenant_id: null }, { ...user, access_approved: false }, { ...user, account_status: 'Suspended' }, { ...user, role: 'Participant' }, { ...user, role: 'Auditor' }]) {
    await assert.rejects(readTraceabilityReview({ user: person, entities }));
  }
});
test('only explicit IDs and unique codes resolve; private locations and notes never leave the read model', async () => {
  const result = await review({ items: [
    record('source', { related_policy: 'POL-1', related_procedure: 'procedure', evidence_documents: ['private/signed-document.pdf?secret=hidden', 'evidence'], notes: 'clinical secret', business_owner: 'Owner', version: 'v1' }),
    record('policy', { object_code: 'POL-1', version: 'v2' }),
    record('procedure', { lifecycle_stage: 'Procedure' }),
    record('evidence', { lifecycle_stage: 'Evidence' }),
  ] });
  const row = result.items[0];
  assert.equal(row.recorded, 4); assert.equal(row.resolved, 3); assert.equal(row.unresolved, 1);
  assert.equal(row.links.find(link => link.field === 'related_policy').targetId, 'policy');
  const serialized = JSON.stringify(result);
  for (const secret of ['signed-document', 'hidden', 'clinical secret']) assert.equal(serialized.includes(secret), false);
});
test('self references, duplicate codes and different lifecycle stages never count as resolved', async () => {
  const result = await review([
    record('source', { related_policy: 'source', related_procedure: 'DUP', audit_link: 'wrong' }),
    record('one', { object_code: 'DUP', lifecycle_stage: 'Procedure' }),
    record('two', { object_code: 'DUP', lifecycle_stage: 'Procedure' }),
    record('wrong'),
  ]);
  const row = result.items[0];
  assert.equal(row.resolved, 0); assert.equal(row.unresolved, 3);
  assert.deepEqual(row.links.filter(link => link.count).map(link => link.state), ['self-reference', 'ambiguous', 'stage-mismatch']);
});
test('malformed, duplicate and cross-business source records fail closed', async () => {
  for (const rows of [{ other: [] }, [null], [record('a'), record('a')], [record('x', { tenant_id: 'business-b' })], [record('')]]) {
    await assert.rejects(review(rows));
  }
});
test('bounded sample does not resolve records beyond its displayed boundary and flags cursor pagination', async () => {
  const rows = Array.from({ length: 201 }, (_, i) => record(String(i), i === 0 ? { related_policy: '200' } : {}));
  const result = await review(rows);
  assert.equal(result.items.length, 200); assert.equal(result.limited, true);
  assert.equal(result.items[0].resolved, 0);
  assert.equal((await review({ items: [], next_cursor: 'more' })).limited, true);
});
test('source failures propagate and genuine empty results remain empty', async () => {
  assert.deepEqual(await review([]), { items: [], limited: false });
  await assert.rejects(readTraceabilityReview({ user, entities: { GovernanceObject: { filter: async () => { throw Error('service unavailable'); } } } }));
});
test('latest master sequence has 12 dependency-ordered phases, 29 planned OS and all requested roles', () => {
  assert.deepEqual(ENTERPRISE_PHASES.map(phase => phase.title), ['Platform Foundation', 'Compliance Foundation', 'Audit & Risk', 'Workforce Governance', 'Operational Governance', 'Board & Strategy', 'Clinical Governance', 'Commercial Governance', 'Enterprise Intelligence', 'AI Governance', 'Accreditation', 'Enterprise Digital Twin']);
  for (const phase of ENTERPRISE_PHASES) assert.ok(phase.dependsOn.every(id => id < phase.id));
  const systems = ENTERPRISE_PHASES.flatMap(phase => phase.systems);
  assert.equal(systems.length, 29);
  assert.equal(new Set(systems.map(system => system.name)).size, 29);
  for (const role of ['Platform Owner', 'Board Member', 'CEO', 'General Manager', 'Compliance Manager', 'Quality Manager', 'Risk Manager', 'Audit Manager', 'HR Manager', 'Learning Manager', 'Clinical Governance Lead', 'Allied Health Manager', 'Practitioner', 'Team Leader', 'Service Manager', 'Finance Manager', 'IT Manager', 'Participant', 'External Auditor']) assert.ok(REQUIRED_WORKSPACES.includes(role), role);
  assert.ok(SHARED_ENGINES.includes('Relationship'));
  assert.equal(EVIDENCE_CHAIN[0], 'Legislation'); assert.equal(EVIDENCE_CHAIN.at(-1), 'Board Reporting');
});
