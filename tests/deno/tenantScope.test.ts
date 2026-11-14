import { assertEquals, assertRejects } from 'jsr:@std/assert@1';
import { scopedEntities, forEachTenant, tenantOfTrigger, CrossBusinessError } from '../../base44/shared/tenantScope.ts';

const A = 'tenant_a';
const B = 'tenant_b';

function matches(rec: any, q: any) {
  return Object.entries(q || {}).every(([k, v]: any) =>
    v && typeof v === 'object' && Array.isArray(v.$in) ? v.$in.includes(rec[k]) : rec[k] === v);
}

function fakeDao(rows: any[]) {
  let n = 0;
  return {
    rows,
    async filter(q: any) { return rows.filter((r) => matches(r, q)); },
    async list() { return rows; },
    async count(q: any) { return rows.filter((r) => matches(r, q)).length; },
    async get(id: string) { return rows.find((r) => r.id === id) || null; },
    async create(d: any) { const r = { id: `new${++n}`, ...d }; rows.push(r); return r; },
    async bulkCreate(ds: any[]) { return Promise.all(ds.map((d) => this.create(d))); },
    async update(id: string, c: any) { const r = rows.find((x) => x.id === id); Object.assign(r, c); return r; },
    async bulkUpdate(cs: any[]) { return cs.map((c) => Object.assign(rows.find((x) => x.id === c.id), c)); },
    async updateMany(q: any, c: any) { const hit = rows.filter((r) => matches(r, q)); hit.forEach((r) => Object.assign(r, c.$set || {})); return { updated: hit.length }; },
    async delete(id: string) { rows.splice(rows.findIndex((r) => r.id === id), 1); return true; },
  };
}

function world() {
  return {
    TodoTask: fakeDao([{ id: 't1', tenant_id: A, title: 'A task' }, { id: 't2', tenant_id: B, title: 'B task' }]),
    HrTemplate: fakeDao([{ id: 'h0', tenant_id: 'shared' }, { id: 'h1', tenant_id: A }, { id: 'h2', tenant_id: B }]),
    LegalRequirement: fakeDao([{ id: 'l1' }]),
    User: fakeDao([{ id: 'u1', tenant_id: A, role: 'admin' }, { id: 'u2', tenant_id: B, role: 'admin' }]),
    Tenant: fakeDao([{ id: 'x1', tenant_key: A, status: 'Active' }, { id: 'x2', tenant_key: B, status: 'Active' }, { id: 'x3', tenant_key: 'tenant_c', status: 'Suspended' }]),
  };
}

Deno.test('reads see only the business, plus shared master copies', async () => {
  const w = world();
  const e = scopedEntities(w, A);
  assertEquals((await e.TodoTask.filter({})).map((r: any) => r.id), ['t1']);
  assertEquals((await e.TodoTask.list()).map((r: any) => r.id), ['t1']);
  assertEquals(await e.TodoTask.count({}), 1);
  assertEquals((await e.HrTemplate.filter({})).map((r: any) => r.id).sort(), ['h0', 'h1']);
  assertEquals((await e.User.filter({ role: 'admin' })).map((r: any) => r.id), ['u1']);
  assertEquals((await e.LegalRequirement.filter({})).length, 1);
});

Deno.test('get hides another business record', async () => {
  const e = scopedEntities(world(), A);
  assertEquals((await e.TodoTask.get('t1'))?.id, 't1');
  assertEquals(await e.TodoTask.get('t2'), null);
});

Deno.test('creates are stamped with the business, even if the caller asks for another', async () => {
  const w = world();
  const e = scopedEntities(w, A);
  const one = await e.TodoTask.create({ title: 'new', tenant_id: B });
  assertEquals(one.tenant_id, A);
  const many = await e.TodoTask.bulkCreate([{ title: 'x' }, { title: 'y' }]);
  assertEquals(many.map((r: any) => r.tenant_id), [A, A]);
  const lib = await e.LegalRequirement.create({ title: 'law' });
  assertEquals(lib.tenant_id, undefined);
});

Deno.test('another business record cannot be changed or deleted, and records cannot be moved', async () => {
  const w = world();
  const e = scopedEntities(w, A);
  await assertRejects(() => e.TodoTask.update('t2', { title: 'hijack' }), CrossBusinessError);
  await assertRejects(() => e.TodoTask.delete('t2'), CrossBusinessError);
  await assertRejects(() => e.TodoTask.bulkUpdate([{ id: 't2', title: 'x' }]), CrossBusinessError);
  await e.TodoTask.update('t1', { title: 'ok', tenant_id: B });
  assertEquals(w.TodoTask.rows.find((r: any) => r.id === 't1'), { id: 't1', tenant_id: A, title: 'ok' });
  assertEquals(w.TodoTask.rows.find((r: any) => r.id === 't2')?.title, 'B task');
});

Deno.test('shared master copies are readable but not writable by a business', async () => {
  const e = scopedEntities(world(), A);
  assertEquals((await e.HrTemplate.get('h0'))?.id, 'h0');
  await assertRejects(() => e.HrTemplate.update('h0', { title: 'edit master' }), CrossBusinessError);
  const res = await e.HrTemplate.updateMany({}, { $set: { title: 'mine' } });
  assertEquals(res.updated, 1);
});

Deno.test('updateMany only reaches the business and never re-tags', async () => {
  const w = world();
  const e = scopedEntities(w, A);
  const res = await e.TodoTask.updateMany({}, { $set: { title: 'bulk', tenant_id: B } });
  assertEquals(res.updated, 1);
  assertEquals(w.TodoTask.rows.map((r: any) => [r.id, r.tenant_id, r.title]), [['t1', A, 'bulk'], ['t2', B, 'B task']]);
});

Deno.test('forEachTenant runs once per active business, and one failure does not stop the rest', async () => {
  const w = world();
  const base44 = { asServiceRole: { entities: w } };
  const seen: string[] = [];
  const out = await forEachTenant(base44, async (tenantId, e) => {
    seen.push(tenantId);
    if (tenantId === A) throw new Error('boom');
    return (await e.TodoTask.filter({})).map((r: any) => r.id);
  });
  assertEquals(seen, [A, B]);
  assertEquals(out, [{ tenantId: A, error: 'boom' }, { tenantId: B, result: ['t2'] }]);
});

Deno.test('tenantOfTrigger reads the business from the changed record', () => {
  assertEquals(tenantOfTrigger({ data: { tenant_id: A } }), A);
  assertEquals(tenantOfTrigger({ data: {}, old_data: { tenant_id: B } }), B);
  assertEquals(tenantOfTrigger({ data: { data: { tenant_id: A } } }), A);
  assertEquals(tenantOfTrigger({}), null);
});
