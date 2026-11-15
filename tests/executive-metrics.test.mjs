import test from 'node:test';
import assert from 'node:assert/strict';
import { loadExecutiveMetrics, executiveIdentity, canReadExecutiveMetrics } from '../src/lib/executiveMetrics.js';
const user = { id: 'test-user', role: 'Provider Administrator', tenant_id: 'tenant-a', account_status: 'Active', access_approved: true };
const blocked = new Proxy({}, { get() { throw new Error('Must not read'); } });
test('executive metrics reject unapproved, inactive, unassigned and non-operational identities before reads', async () => {
  for (const person of [null, { ...user, id: null }, { ...user, tenant_id: null }, { ...user, access_approved: false }, { ...user, account_status: 'Suspended' }, { ...user, role: 'Participant' }]) {
    assert.equal(canReadExecutiveMetrics(person), false);
    assert.deepEqual(await loadExecutiveMetrics({ entities: blocked, user: person, view: 'executive', today: '2026-11-15' }), {});
  }
});
test('executive queries always include business, source filters and Brisbane cutoff date', async () => {
  let calls = 0;
  const entities = new Proxy({}, { get: (_, name) => ({ count: async query => {
    calls++;
    assert.equal(query.tenant_id, 'tenant-a');
    if (name === 'TodoTask') assert.equal(query.due_date.$lt, '2026-11-15');
    return 0;
  } }) });
  const result = await loadExecutiveMetrics({ entities, user, view: 'executive', today: '2026-11-15' });
  assert.equal(calls, 4);
  assert.deepEqual(result, { risks: 0, incidents: 0, issues: 0, tasks: 0 });
});
test('failed, negative and malformed measures stay unavailable while valid results survive', async () => {
  const entities = {
    Risk: { count: async () => { throw new Error('private failure'); } },
    Incident: { count: async () => -1 },
    ComplianceIssue: { count: async () => ({ count: 4 }) },
    TodoTask: { count: async () => 7 },
  };
  assert.deepEqual(await loadExecutiveMetrics({ entities, user, view: 'executive', today: '2026-11-15' }), { risks: null, incidents: null, issues: null, tasks: 7 });
});
test('cache identity distinguishes business and access changes', () => {
  for (const patch of [{ tenant_id: 'tenant-b' }, { role: 'Management' }, { access_approved: false }, { account_status: 'Suspended' }]) {
    assert.notEqual(executiveIdentity(user), executiveIdentity({ ...user, ...patch }));
  }
});
test('unknown view and invalid cutoff dates issue no reads', async () => {
  assert.deepEqual(await loadExecutiveMetrics({ entities: blocked, user, view: 'unknown', today: '2026-11-15' }), {});
  assert.deepEqual(await loadExecutiveMetrics({ entities: blocked, user, view: 'board', today: 'invalid' }), {});
});
