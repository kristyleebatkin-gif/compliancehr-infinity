import { assertEquals, assertRejects, assertThrows } from 'jsr:@std/assert@1';
import { assertWorkflowAction, connectorOwnerAllows, readWorkflowRecords, requireWorkflowAdministrator } from '../../base44/shared/workflowSafety.ts';

const user = { id: 'user-a', role: 'Provider Administrator', account_status: 'Active', access_approved: true, tenant_id: 'tenant-a' };
function context(rows: any[] = [{ id: 'membership-a', user_id: 'user-a', tenant_id: 'tenant-a', status: 'Active' }]) {
  let reads = 0;
  const base = { businessId: 'tenant-a', asServiceRole: { entities: { TenantMembership: {
    filter: async (_query: any, _sort: any, _limit: any, skip: number) => {
      reads++;
      return rows.slice(skip, skip + 100);
    },
  } } } };
  return { base, reads: () => reads };
}
Deno.test('workflow preview refuses every new mutating action', () => {
  assertWorkflowAction('assess');
  for (const action of ['bill_shifts', 'create_corrective_action', 'record_acknowledgement', 'start_revision', 'unknown']) {
    assertThrows(() => assertWorkflowAction(action), Error, 'read-only');
  }
});
Deno.test('unapproved and suspended administrators are denied before membership reads', async () => {
  for (const patch of [{ access_approved: false }, { account_status: 'Suspended' }, { role: 'Employee' }]) {
    const ctx = context();
    await assertRejects(() => requireWorkflowAdministrator(ctx.base, { ...user, ...patch }), Error, 'approved');
    assertEquals(ctx.reads(), 0);
  }
});
Deno.test('a forged or mismatched business is denied before membership reads', async () => {
  const ctx = context();
  await assertRejects(() => requireWorkflowAdministrator({ ...ctx.base, businessId: 'tenant-b' }, user), Error, 'scope');
  assertEquals(ctx.reads(), 0);
});
Deno.test('missing, ended and foreign memberships cannot authorise workflow reads', async () => {
  for (const rows of [[], [{ id: 'm1', user_id: 'user-a', tenant_id: 'tenant-a', status: 'Ended' }],
    [{ id: 'm1', user_id: 'someone-else', tenant_id: 'tenant-a', status: 'Active' }],
    [{ id: 'm1', user_id: 'user-a', tenant_id: 'tenant-a', status: 'Active', ends_on: '2000-01-01' }]]) {
    const ctx = context(rows);
    await assertRejects(() => requireWorkflowAdministrator(ctx.base, user), Error, 'membership');
  }
});
Deno.test('verified active administrator membership grants only its own scope', async () => {
  const ctx = context();
  assertEquals(await requireWorkflowAdministrator(ctx.base, user), 'tenant-a');
});
Deno.test('app-wide credentials require an exact independently configured owner', () => {
  assertEquals(connectorOwnerAllows('tenant-a', undefined), false);
  assertEquals(connectorOwnerAllows('tenant-a', ''), false);
  assertEquals(connectorOwnerAllows('tenant-b', 'tenant-a'), false);
  assertEquals(connectorOwnerAllows('tenant-a', 'tenant-a'), true);
});
Deno.test('workflow reads consume all positional SDK pages beyond 500 records', async () => {
  const source = Array.from({ length: 2050 }, (_, n) => ({ id: 'row-' + n }));
  const offsets: number[] = [];
  const result = await readWorkflowRecords({ filter: async (q: any, sort: string, limit: number, skip: number) => {
    assertEquals(q, { status: 'Active' });
    assertEquals(sort, '-created_date');
    assertEquals(limit, 100);
    offsets.push(skip);
    return source.slice(skip, skip + limit);
  } }, { status: 'Active' });
  assertEquals(result.length, 2050);
  assertEquals(offsets.at(-1), 2000);
});
Deno.test('malformed and repeated pages are errors rather than empty evidence', async () => {
  await assertRejects(() => readWorkflowRecords({ filter: async () => ({ items: [] }) }), Error, 'supported page');
  const page = Array.from({ length: 100 }, (_, n) => ({ id: 'same-' + n }));
  await assertRejects(() => readWorkflowRecords({ filter: async () => page }), Error, 'repeated');
});
Deno.test('provider read failures propagate without a ready or empty result', async () => {
  await assertRejects(() => readWorkflowRecords({ filter: async () => { throw new Error('unavailable'); } }), Error, 'unavailable');
});
