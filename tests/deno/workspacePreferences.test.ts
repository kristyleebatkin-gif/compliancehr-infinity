// Executes the real layout handler against a bounded in-memory SDK substitute.
import { assertEquals } from 'jsr:@std/assert@1';
import { handleWorkspacePreferences } from '../../base44/functions/workspacePreferences/entry.ts';
import { defaultLayout, canonicalLayout, layoutHash } from '../../base44/shared/workspaceLayout.ts';

const actor = { id: 'u-a', tenant_id: 't-a', role: 'Provider Administrator', account_status: 'Active', access_approved: true };
const snapshot = (version: number, patch = {}) => ({
  id: 'v-' + version, tenant_id: 't-a', user_id: 'u-a', workspace_key: 'compliance',
  version_number: version, layout_json: canonicalLayout(defaultLayout()), content_hash: layoutHash(defaultLayout()), ...patch,
});

function fixture(seed: any[] = [], user: any = actor, options: any = {}) {
  const records: any = { WorkspacePreferenceVersion: [...seed], WorkspacePreference: [] };
  const writes: any[] = [];
  const reads: any[] = [];
  const matches = (row: any, query: any) => Object.entries(query).every(([key, value]) => row[key] === value);
  const entities: any = {};
  for (const name of Object.keys(records)) {
    entities[name] = {
      filter: async (query: any, _sort: any, limit: number, skip = 0) => {
        reads.push({ name, query, skip });
        const items = options.foreignResponse ? records[name] : records[name].filter((r: any) => matches(r, query));
        return items.sort((a: any, b: any) => b.version_number - a.version_number).slice(skip, skip + limit);
      },
      count: async (query: any) => {
        if (options.countFails) throw new Error('offline');
        return records[name].filter((r: any) => matches(r, query)).length;
      },
      create: async (data: any) => {
        const row = { ...data, id: name + '-' + writes.length };
        records[name].push(row); writes.push(row); return row;
      },
      update: async (id: string, data: any) => {
        const row = records[name].find((r: any) => r.id === id);
        Object.assign(row, data); writes.push({ id, ...data }); return row;
      },
    };
  }
  const client = { auth: { me: async () => user }, entities, asServiceRole: { entities } };
  const post = (body: any) => handleWorkspacePreferences(client, new Request('http://test', { method: 'POST', body: JSON.stringify({ workspace_key: 'compliance', ...body }) }));
  return { post, records, reads, writes };
}

Deno.test('layout handler denies unsupported roles before database access', async () => {
  for (const user of [null, { ...actor, role: 'Participant' }, { ...actor, access_approved: false }]) {
    const f = fixture([], user);
    const response = await f.post({ action: 'history' });
    assertEquals(response.status === 401 || response.status === 403, true);
    assertEquals(f.reads.length, 0);
    assertEquals(f.writes.length, 0);
  }
});

Deno.test('history still pages without a count and never exposes another tenant or user', async () => {
  const f = fixture([
    ...Array.from({ length: 12 }, (_, i) => snapshot(i + 1)),
    snapshot(99, { tenant_id: 't-b' }), snapshot(98, { user_id: 'u-b' }),
  ], actor, { countFails: true });
  const first = await (await f.post({ action: 'history', page: 0, tenant_id: 't-b', user_id: 'u-b' })).json();
  assertEquals(first.data.items.length, 10);
  assertEquals(first.data.items[0].version, 12);
  assertEquals(first.data.hasMore, true);
  assertEquals(first.data.totalRecords, null);
  assertEquals(first.data.totalPages, null);
  const second = await (await f.post({ action: 'history', page: 1 })).json();
  assertEquals(second.data.items.map((r: any) => r.version), [2, 1]);
  assertEquals(second.data.hasMore, false);
  assertEquals(f.reads.every((r: any) => r.query.tenant_id === 't-a' && r.query.user_id === 'u-a'), true);
});

Deno.test('history fails closed if the SDK returns a foreign row', async () => {
  const f = fixture([snapshot(9, { tenant_id: 't-b' })], actor, { foreignResponse: true });
  const response = await f.post({ action: 'history' });
  assertEquals(response.status, 409);
  assertEquals((await response.json()).data, null);
});

Deno.test('invalid pages and version targets are refused without reads or writes', async () => {
  const f = fixture([snapshot(1)]);
  for (const page of [-1, 1.2, '1', null, 100001]) {
    assertEquals((await f.post({ action: 'history', page })).status, 400);
  }
  for (const version_number of [0, -1, 1.9, '1', null, Number.MAX_SAFE_INTEGER + 1]) {
    assertEquals((await f.post({ action: 'restore', version_number, expected_version: 0 })).status, 400);
  }
  assertEquals(f.reads.length, 0);
  assertEquals(f.writes.length, 0);
});

Deno.test('corrupt, missing-hash and unsupported-schema snapshots cannot be restored', async () => {
  for (const patch of [
    { content_hash: 'altered' },
    { content_hash: null },
    { layout_json: JSON.stringify({ ...defaultLayout(), schema: 9 }) },
    { layout_json: '{bad' },
  ]) {
    const f = fixture([snapshot(1, patch)]);
    const response = await f.post({ action: 'restore', version_number: 1, expected_version: 0 });
    assertEquals(response.status, 409);
    assertEquals(f.writes.length, 0);
    const history = await (await f.post({ action: 'history' })).json();
    assertEquals(history.data.items[0].layout, null);
  }
});

Deno.test('restore creates a new snapshot while preserving the selected historical one', async () => {
  const original = snapshot(1);
  const f = fixture([original]);
  f.records.WorkspacePreference.push({ ...original, id: 'live', version_number: 3 });
  const response = await f.post({ action: 'restore', version_number: 1, expected_version: 3 });
  assertEquals(response.status, 200);
  const data = (await response.json()).data;
  assertEquals(data.version, 4);
  assertEquals(f.records.WorkspacePreferenceVersion[0].version_number, 1);
  assertEquals(f.records.WorkspacePreferenceVersion[1].version_number, 4);
  assertEquals(f.records.WorkspacePreferenceVersion[1].restored_from_version, 1);
  assertEquals(f.records.WorkspacePreference[0].version_number, 4);
});

Deno.test('stale or corrupt current versions cannot be overwritten', async () => {
  const f = fixture();
  f.records.WorkspacePreference.push({ ...snapshot(1), id: 'live', version_number: 4 });
  assertEquals((await f.post({ action: 'save', expected_version: 3, layout: defaultLayout() })).status, 409);
  f.records.WorkspacePreference[0].version_number = 2.5;
  assertEquals((await f.post({ action: 'save', expected_version: 2, layout: defaultLayout() })).status, 409);
  assertEquals(f.writes.length, 0);
});
