import test from 'node:test';
import assert from 'node:assert/strict';
import { enterpriseScope, readRegisterCounts, readBoardAssurance } from '../src/lib/enterpriseReadModel.js';
const user = { id: 'test-user', tenant_id: 'tenant-a', role: 'Provider Administrator', account_status: 'Active', access_approved: true };
const blocked = new Proxy({}, { get() { throw new Error('Must not read'); } });
test('enterprise reads deny missing identity, tenant, approval and governance permission before data access', async () => {
  for (const person of [null, { ...user, id: null }, { ...user, tenant_id: null }, { ...user, access_approved: false }, { ...user, role: 'Participant' }]) {
    await assert.rejects(readBoardAssurance({ entities: blocked, user: person, today: '2026-11-15' }));
    assert.deepEqual(await readRegisterCounts({ entities: blocked, registers: [{ entity: 'KPI' }], user: person, allowedEntities: new Set(['KPI']) }), {});
  }
});
test('register counts enforce tenant queries, explicit source permissions and numeric contracts', async () => {
  const counts = await readRegisterCounts({ entities: {
    KPI: { count: async query => { assert.deepEqual(query, { tenant_id: 'tenant-a' }); return 0; } },
    Invalid: { count: async () => ({ count: 10 }) }, Failure: { count: async () => { throw new Error('private'); } },
  }, registers: ['KPI', 'Invalid', 'Failure', 'Denied'].map(entity => ({ entity })), user, allowedEntities: new Set(['KPI', 'Invalid', 'Failure']) });
  assert.deepEqual(counts, { KPI: { status: 'ready', value: 0 }, Invalid: { status: 'unavailable' }, Failure: { status: 'unavailable' }, Denied: { status: 'restricted' } });
});
test('assurance review projects metadata, flags absent evidence and overdue reviews without claiming assurance', async () => {
  const entities = { GovernanceObject: { filter: async (query, options) => {
    assert.equal(query.tenant_id, 'tenant-a'); assert.equal(options.limit, 201);
    return { items: [{ id: 'g-1', tenant_id: 'tenant-a', title: '=Untrusted title', business_owner: '', review_date: '2026-11-14', evidence_documents: ['', 'evidence-1'], evidence_notes: 'private' }] };
  } } };
  const result = await readBoardAssurance({ entities, user, today: '2026-11-15' });
  assert.equal(result.limited, false);
  assert.equal(result.items[0].evidence_count, 1);
  assert.equal(result.items[0].attention, 'Owner missing; Review overdue');
  assert.equal('evidence_notes' in result.items[0], false);
});
test('assurance rejects malformed and cross-tenant responses', async () => {
  for (const response of [{ invalid: [] }, [{ id: 'x', tenant_id: 'tenant-b' }], [{ id: 'x' }]]) {
    await assert.rejects(readBoardAssurance({ entities: { GovernanceObject: { filter: async () => response } }, user, today: '2026-11-15' }));
  }
});
test('bounded assurance review explicitly marks truncation and never exports unseen records', async () => {
  const rows = Array.from({ length: 201 }, (_, i) => ({ id: String(i), tenant_id: 'tenant-a' }));
  const result = await readBoardAssurance({ entities: { GovernanceObject: { filter: async () => rows } }, user, today: '2026-11-15' });
  assert.equal(result.limited, true); assert.equal(result.items.length, 200);
});
test('identity keys change immediately with tenant, role and approval', () => {
  assert.notEqual(enterpriseScope(user).key, enterpriseScope({ ...user, tenant_id: 'tenant-b' }).key);
  assert.notEqual(enterpriseScope(user).key, enterpriseScope({ ...user, role: 'Management' }).key);
  assert.equal(enterpriseScope({ ...user, access_approved: false }), null);
});
