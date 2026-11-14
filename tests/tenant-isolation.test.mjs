// Data separation between businesses (audit CRIT-01). These tests read the REAL schema,
// workflow and classification files. They do not prove live isolation on their own:
// the two-business live test (register VER-01) is still required before release.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import {
  PLATFORM_ENTITIES,
  SHARED_LIBRARY_ENTITIES,
  SHARED_WITH_COPIES_ENTITIES,
  BUSINESS_OWNED_ENTITIES,
  SHARED_MASTER_TENANT_ID,
} from '../src/lib/tenantClassification.js';
import { withTenantRls, groupOf } from '../scripts/tenant-rls.mjs';

const root = new URL('../', import.meta.url);
const read = (p) => readFile(new URL(p, root), 'utf8');

async function loadSchemas() {
  const files = (await readdir(new URL('base44/entities/', root))).filter((f) => f.endsWith('.jsonc'));
  return Promise.all(files.map(async (f) => JSON.parse(await read(`base44/entities/${f}`))));
}

// Minimal evaluator for the RLS shapes this app uses. Conditions it does not model
// (other data.* fields, collaborator roles) evaluate to TRUE, so a denial below can only
// come from the business lock itself.
function evaluate(rule, user, record) {
  if (rule == null) return true;
  if (Array.isArray(rule.$and)) return rule.$and.every((r) => evaluate(r, user, record));
  if (Array.isArray(rule.$or)) return rule.$or.some((r) => evaluate(r, user, record));
  if (Array.isArray(rule.$nor)) return !rule.$nor.some((r) => evaluate(r, user, record));
  return Object.entries(rule).every(([key, value]) => {
    if (key === 'user_condition') return value.role === undefined || value.role === user.role;
    if (key === 'data.tenant_id') {
      const expected = value === '{{user.data.tenant_id}}' ? user.data.tenant_id : value;
      return record.tenant_id === expected;
    }
    return true;
  });
}

test('frontend and backend classification files are identical', async () => {
  assert.equal(await read('src/lib/tenantClassification.js'), await read('base44/shared/tenantClassification.ts'));
});

test('every entity is classified exactly once', async () => {
  const names = (await loadSchemas()).map((s) => s.name).sort();
  const all = [...PLATFORM_ENTITIES, ...SHARED_LIBRARY_ENTITIES, ...SHARED_WITH_COPIES_ENTITIES, ...BUSINESS_OWNED_ENTITIES];
  assert.equal(new Set(all).size, all.length, 'an entity is listed in more than one group');
  assert.deepEqual([...all].sort(), names, 'classification does not match base44/entities');
});

test('every business-owned and master-template schema declares tenant_id', async () => {
  const missing = (await loadSchemas())
    .filter((s) => ['business', 'shared_with_copies'].includes(groupOf(s.name)))
    .filter((s) => !s.properties?.tenant_id)
    .map((s) => s.name);
  assert.deepEqual(missing, []);
});

test('generated access rules: another business is denied every operation on business-owned records', async () => {
  const ownerOfA = { role: 'Provider Administrator', data: { tenant_id: 'tenant_a' } };
  const staffOfB = { role: 'Provider Administrator', data: { tenant_id: 'tenant_b' } };
  const platformOwner = { role: 'admin', data: { tenant_id: 'tenant_a' } };
  const recordOfA = { tenant_id: 'tenant_a' };
  for (const schema of (await loadSchemas()).filter((s) => groupOf(s.name) === 'business')) {
    const { rls } = withTenantRls(schema);
    for (const op of ['read', 'create', 'update', 'delete']) {
      assert.equal(evaluate(rls[op], staffOfB, recordOfA), false, `${schema.name}.${op} lets business B reach business A`);
      // The lock never adds access: if the original rule allowed A, the locked rule still may; it never allows B.
      if (evaluate(schema.rls?.[op], ownerOfA, recordOfA)) {
        assert.equal(evaluate(rls[op], ownerOfA, recordOfA), true, `${schema.name}.${op} lock blocks the owning business`);
      }
      if (evaluate(schema.rls?.[op], platformOwner, recordOfA)) {
        assert.equal(evaluate(rls[op], platformOwner, recordOfA), true, `${schema.name}.${op} lock blocks the platform owner`);
      }
    }
  }
});

test('generated access rules: master templates readable by all, editable only by the owner', async () => {
  const staffOfB = { role: 'Provider Administrator', data: { tenant_id: 'tenant_b' } };
  const master = { tenant_id: SHARED_MASTER_TENANT_ID };
  const copyOfA = { tenant_id: 'tenant_a' };
  for (const schema of (await loadSchemas()).filter((s) => groupOf(s.name) === 'shared_with_copies')) {
    const { rls } = withTenantRls(schema);
    if (evaluate(schema.rls?.read, staffOfB, master)) assert.equal(evaluate(rls.read, staffOfB, master), true, `${schema.name} master unreadable`);
    for (const op of ['update', 'delete']) assert.equal(evaluate(rls[op], staffOfB, master), false, `${schema.name}.${op} lets a business change the master`);
    for (const op of ['read', 'update', 'delete']) assert.equal(evaluate(rls[op], staffOfB, copyOfA), false, `${schema.name}.${op} lets B reach A's copy`);
  }
});

test('generated access rules: shared library is changed only by the owner', async () => {
  const staff = { role: 'Provider Administrator', data: { tenant_id: 'tenant_b' } };
  for (const schema of (await loadSchemas()).filter((s) => groupOf(s.name) === 'shared_library')) {
    const { rls } = withTenantRls(schema);
    for (const op of ['create', 'update', 'delete']) assert.equal(evaluate(rls[op], staff, {}), false, `${schema.name}.${op} open to a business`);
  }
});

test('generating access rules twice changes nothing (safe to re-run)', async () => {
  for (const schema of await loadSchemas()) {
    const once = withTenantRls(schema);
    assert.deepEqual(withTenantRls(once).rls, once.rls, `${schema.name} not idempotent`);
  }
});

test('automations that run on update ignore a change to the business tag alone', async () => {
  const dir = new URL('base44/workflows/', root);
  const unguarded = [];
  for (const f of (await readdir(dir)).filter((x) => x.endsWith('.jsonc'))) {
    const wf = JSON.parse(await readFile(new URL(f, dir), 'utf8'));
    const cfg = wf.trigger?.config;
    if (cfg?.trigger_type !== 'entity' || !(cfg.events || []).includes('update')) continue;
    const cond = String(wf.trigger.condition || '');
    // Base44 refuses array subtraction in trigger conditions, so the guard uses any(...) instead.
    const guard = '(.trigger.event_type != "update" or .trigger.changed_fields == null or any(.trigger.changed_fields[]; . != "tenant_id" and . != "updated_date"))';
    if (!cond.startsWith('${ ' + guard) || /\) - \[/.test(cond)) unguarded.push(f);
  }
  assert.deepEqual(unguarded, []);
});

test('tagging function is owner-only and uses the shared classification', async () => {
  const src = await read('base44/functions/tenantMigration/entry.ts');
  assert.match(src, /user\.role !== 'admin' \|\| !hasApprovedAccess\(user\)/);
  assert.match(src, /BUSINESS_OWNED_ENTITIES/);
  assert.match(src, /SHARED_WITH_COPIES_ENTITIES/);
  assert.match(src, /mode === 'apply'/, 'must default to dry run');
});

test('release switch is identical in frontend and backend, and stays OFF until live records are tagged', async () => {
  const front = await read('src/lib/tenantEnforcement.js');
  assert.equal(front, await read('base44/shared/tenantEnforcement.ts'));
  // Flip to true only in release 2 together with `node scripts/tenant-rls.mjs --apply`; update this test then.
  assert.match(front, /export const TENANT_ENFORCEMENT_ON = false;/);
});

test('live dashboard function uses the server business context and per-business snapshots', async () => {
  const src = await read('base44/functions/liveModuleOverview/entry.ts');
  assert.match(src, /resolveTenantContext\(base44/);
  assert.doesNotMatch(src, /\.(aggregate|count)\(\{\s*(query: \{\}|\})/, 'an unscoped aggregate/count remains');
  assert.match(src, /key: \['tenant_id', 'module', 'snapshot_date'\]/);
});

test('branding cache is per business and cleared on sign-out; no business contact details are built in', async () => {
  const branding = await read('src/lib/companyBranding.js');
  const client = await read('src/api/base44Client.js');
  assert.doesNotMatch(branding, /localStorage\.(get|set)Item\(STORAGE_KEY/);
  assert.doesNotMatch(branding, /11769681650|0402 165 668|kristyleebatkin/);
  assert.match(client, /rawClient\.auth\.logout = /);
  assert.match(client, /clearBusinessCaches\(\)/);
});
