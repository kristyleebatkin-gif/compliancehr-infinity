import test from 'node:test';
import assert from 'node:assert/strict';
import { SEARCH_SOURCES, searchEnterprise, searchIdentity, searchModules } from '../src/lib/enterpriseSearch.js';
import { MODULE_DIRECTORY, NAV_GROUPS, buildNavigationGroups } from '../src/lib/moduleDirectory.js';
const user = { id: 'synthetic-user', tenant_id: 'tenant-a', role: 'Provider Administrator', account_status: 'Active', access_approved: true };
const neverRead = new Proxy({}, { get() { throw new Error('Entity access must not happen'); } });
test('enterprise search refuses missing identity, business, approval and inactive users before reads', async () => {
  for (const person of [null, { ...user, id: null }, { ...user, tenant_id: null }, { ...user, access_approved: false }, { ...user, account_status: 'Suspended' }]) {
    const response = await searchEnterprise({ entities: neverRead, term: 'abc', can: () => true, user: person });
    assert.equal(response.blocked, true);
  }
  const response = await searchEnterprise({ entities: neverRead, term: 'a', can: () => true, user });
  assert.equal(response.blocked, false);
});
test('search identity separates business, role, approval and account changes', () => {
  for (const patch of [{ tenant_id: 'tenant-b' }, { role: 'Employee' }, { access_approved: false }, { account_status: 'Suspended' }]) {
    assert.notEqual(searchIdentity(user), searchIdentity({ ...user, ...patch }));
  }
});
test('search never queries a source without its existing module permission', async () => {
  const response = await searchEnterprise({ entities: neverRead, term: 'abc', can: () => false, user });
  assert.deepEqual(response.unavailable, []);
  assert.ok(Object.values(response.results).every((rows) => rows.length === 0));
});
test('queries carry the business filter, escape regex syntax and request bounded projected results', async () => {
  let calls = 0;
  const entities = { Audit: { filter: async (query, options) => {
    calls++;
    assert.deepEqual(query.$and[0], { tenant_id: 'tenant-a' });
    assert.equal(query.$and[1].$or[0].title.$regex, 'a\\.\\*');
    assert.equal(options.limit, 5);
    assert.equal(options.fields.includes('findings'), false);
    return [{ id: 'audit-1', title: 'Synthetic audit', status: 'Scheduled', findings: 'must not leave adapter' }];
  } }, Policy: { filter: async () => ({ items: [] }) }, AuditEvidenceFile: { filter: async () => [] } };
  const response = await searchEnterprise({ entities, term: 'a.*', can: (key) => key === 'compliance', user });
  assert.equal(calls, 1);
  assert.deepEqual(response.results.audits, [{ id: 'audit-1', title: 'Synthetic audit', status: 'Scheduled' }]);
});
test('partial failures and malformed responses remain visible while successful sources survive', async () => {
  const entities = {
    Audit: { filter: async () => ({ invalid: [] }) },
    Policy: { filter: async () => { throw new Error('secret server details'); } },
    AuditEvidenceFile: { filter: async () => ({ items: [{ id: 'e-1', title: 'Evidence' }] }) },
  };
  const response = await searchEnterprise({ entities, term: 'abc', can: (key) => key === 'compliance', user });
  assert.deepEqual(response.unavailable, ['Policies', 'Audits']);
  assert.equal(JSON.stringify(response).includes('secret server'), false);
  assert.equal(response.results.evidence[0].id, 'e-1');
});
test('both SDK array and cursor pages work and short result lists stay capped', async () => {
  for (const page of [false, true]) {
    const rows = Array.from({ length: 8 }, (_, i) => ({ id: String(i), title: 'Task', content: 'private' }));
    const response = await searchEnterprise({ entities: { TodoTask: { filter: async () => page ? { items: rows } : rows } }, term: 'Task', can: (key) => key === 'tasks', user });
    assert.equal(response.results.tasks.length, 5);
    assert.equal('content' in response.results.tasks[0], false);
  }
});
test('enterprise groups retain every module exactly once and shortcuts use permitted canonical sources', () => {
  assert.equal(NAV_GROUPS[0].label, 'AI Core');
  assert.equal(NAV_GROUPS[1].label, 'My Workspace');
  const restricted = MODULE_DIRECTORY.filter((item) => item.key === 'tasks');
  assert.deepEqual(buildNavigationGroups(restricted).map((group) => group.label), ['My Workspace']);
  const auditor = buildNavigationGroups(MODULE_DIRECTORY.filter((item) => item.key === 'auditor-portal'));
  assert.equal(auditor[0].children.some((item) => item.key === 'audit-management'), false);
  const compliance = buildNavigationGroups(MODULE_DIRECTORY.filter((item) => item.key === 'compliance'));
  assert.equal(compliance.find((group) => group.id === 'audit-os').children[0].path, '/compliance?tab=audits');
  const planned = buildNavigationGroups([], [{ id: 'future-os', label: 'Future OS', keys: [], planned: true }], { includePlanned: true });
  assert.equal(planned.length, 1);
  assert.ok(planned.every(group => group.planned && group.children.length === 0));
  const clinical = buildNavigationGroups(MODULE_DIRECTORY.filter(item => item.key === 'clinical-os'));
  assert.equal(clinical[0].children[0].path, '/clinical-os');
});
test('module search uses enterprise names while respecting approved permissions', () => {
  const modules = searchModules(MODULE_DIRECTORY, 'Workforce OS', (key) => key === 'training');
  assert.deepEqual(modules.map((module) => module.key), ['training']);
  assert.equal(SEARCH_SOURCES.some((source) => source.key === 'audits'), true);
});
