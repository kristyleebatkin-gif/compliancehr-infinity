import { assertEquals, assertRejects } from 'jsr:@std/assert@1';
import { scopedEntities, forEachTenant, tenantOfTrigger, CrossBusinessError, perBusiness, createScopedClientFromRequest, SCOPE_HEADER } from '../../base44/shared/tenantScope.ts';

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

// --- perBusiness wrapper ---------------------------------------------------------------------
function clientFor(user: any, w = world()) {
  return () => ({ auth: { me: async () => user }, entities: w, asServiceRole: { entities: w, integrations: { tag: 'core' } } });
}
const call = (body: any, headers: Record<string, string> = {}) =>
  new Request('https://x.test/fn', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });

// Handler that reports which business it ran for and what it could see.
function probe(factory: any) {
  return async (req: Request) => {
    const base44 = createScopedClientFromRequest(req, factory);
    const tasks = await base44.asServiceRole.entities.TodoTask.filter({});
    const mine = await base44.entities.TodoTask.list();
    const body = await req.json();
    return Response.json({ scope: req.headers.get(SCOPE_HEADER), service: tasks.map((t: any) => t.id), user: mine.map((t: any) => t.id), echo: body.n ?? null, core: base44.asServiceRole.integrations.tag });
  };
}

Deno.test('wrapper: staff run for their own business only, even if they ask for another', async () => {
  const f = clientFor({ id: 's1', role: 'Provider Administrator', tenant_id: A });
  const fn = perBusiness(probe(f), f);
  const ok = await (await fn(call({ n: 1 }))).json();
  assertEquals(ok, { scope: A, service: ['t1'], user: ['t1'], echo: 1, core: 'core' });
  const denied = await fn(call({ tenant_id: B }));
  assertEquals(denied.status, 403);
});

Deno.test('wrapper: a business sent in a header by the browser is ignored', async () => {
  const f = clientFor({ id: 's1', role: 'Team Leader', tenant_id: A });
  const fn = perBusiness(probe(f), f);
  const res = await (await fn(call({}, { [SCOPE_HEADER]: B }))).json();
  assertEquals(res.scope, A);
  assertEquals(res.service, ['t1']);
});

Deno.test('wrapper: owner with a business id runs for that business; unknown ids are refused', async () => {
  const f = clientFor({ id: 'o', role: 'admin', tenant_id: A });
  const fn = perBusiness(probe(f), f);
  assertEquals((await (await fn(call({ tenant_id: B }))).json()).service, ['t2']);
  assertEquals((await fn(call({ tenant_id: 'tenant_c' }))).status, 404);
});

Deno.test('wrapper: owner without a business id runs once per active business, combined', async () => {
  const f = clientFor({ id: 'o', role: 'admin', tenant_id: A });
  const fn = perBusiness(probe(f), f);
  const res = await fn(call({ n: 7 }));
  assertEquals(res.status, 200);
  const out = await res.json();
  assertEquals(out.per_business.map((p: any) => [p.tenant_id, p.status, p.body.service, p.body.echo]), [[A, 200, ['t1'], 7], [B, 200, ['t2'], 7]]);
});

Deno.test('wrapper: single business returns the function response unchanged', async () => {
  const w = world();
  w.Tenant.rows.splice(1); // only business A active
  const f = clientFor({ id: 'o', role: 'admin', tenant_id: A }, w);
  const fn = perBusiness(async () => Response.json({ hello: 'world' }, { status: 202 }), f);
  const res = await fn(call({}));
  assertEquals([res.status, await res.json()], [202, { hello: 'world' }]);
});

Deno.test('wrapper: signed-out and unlinked callers are refused; a failing business is reported', async () => {
  const anon = clientFor(null);
  assertEquals((await perBusiness(probe(anon), anon)(call({}))).status, 401);
  const unlinked = clientFor({ id: 'x', role: 'Employee' });
  assertEquals((await perBusiness(probe(unlinked), unlinked)(call({}))).status, 403);
  const f = clientFor({ id: 'o', role: 'admin', tenant_id: A });
  const fn = perBusiness(async (req) => {
    if (req.headers.get(SCOPE_HEADER) === A) throw new Error('boom');
    return Response.json({ ok: true });
  }, f);
  const res = await fn(call({}));
  assertEquals(res.status, 500);
  assertEquals((await res.json()).per_business.map((p: any) => p.status), [500, 200]);
});

Deno.test('scoped client refuses to run without the wrapper', () => {
  let threw = false;
  try { createScopedClientFromRequest(call({}), clientFor(null)); } catch { threw = true; }
  assertEquals(threw, true);
});
