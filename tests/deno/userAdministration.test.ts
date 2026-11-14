// Runs the real User Administration handler (backlog P0 17.07) against an in-memory business,
// plus accounts that are not linked to any business yet.
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { handleAccess } from '../../base44/functions/manageAppAccess/entry.ts';
import { accountDirectory } from '../../base44/shared/tenantScope.ts';

type Rec = Record<string, any>;
const NOW = new Date('2026-11-15T01:00:00Z');
const BIZ = 'tenant_choices';
const active = { account_status: 'Active', access_approved: true, tenant_id: BIZ };
const OWNER = { id: 'u-own', email: 'owner@x.test', full_name: 'Owner', role: 'admin', ...active };
const PA = { id: 'u-pa', email: 'pa@x.test', full_name: 'Pat Admin', role: 'Provider Administrator', ...active };
const MGMT = { id: 'u-m', email: 'm@x.test', full_name: 'Morgan Manager', role: 'Management', ...active };
const WORKER = { id: 'u-w', email: 'worker@x.test', full_name: 'Sam Worker', role: 'Employee', ...active };
const OTHER_BIZ = { id: 'u-o', email: 'other@x.test', full_name: 'Elsewhere', role: 'Employee', account_status: 'Active', access_approved: true, tenant_id: 'tenant_other' };

const matches = (r: Rec, q: Rec) => Object.entries(q || {}).every(([k, v]) => r[k] === v);

function world(users: Rec[] = [], seed: Record<string, Rec[]> = {}) {
  const allUsers: Rec[] = users.map((u) => ({ ...u }));
  const db: Record<string, Rec[]> = { AccountInvitation: [], ProfilePortalInvitation: [], TenantMembership: [], AuditLog: [], StaffProfile: [], ...seed };
  const invited: string[] = [];
  let n = 0;
  const dao = (name: string) => ({
    list: async () => ({ items: db[name] ||= [] }),
    filter: async (q: Rec) => ({ items: (db[name] ||= []).filter((r) => matches(r, q)) }),
    get: async (id: string) => (db[name] || []).find((r) => r.id === id) || null,
    create: async (d: Rec) => { const r = { id: `${name}-${++n}`, tenant_id: BIZ, ...d }; (db[name] ||= []).push(r); return r; },
    update: async (id: string, p: Rec) => Object.assign(db[name].find((x) => x.id === id)!, p),
  });
  // This business's view of accounts, like the scoped client: only accounts linked to BIZ.
  const scopedUsers = {
    list: async () => ({ items: allUsers.filter((u) => u.tenant_id === BIZ) }),
    get: async (id: string) => allUsers.find((u) => u.id === id && u.tenant_id === BIZ) || null,
    update: async (id: string, p: Rec) => { const { tenant_id: _t, ...rest } = p; return Object.assign(allUsers.find((u) => u.id === id)!, rest); },
  };
  const entities = new Proxy({}, { get: (_t, p: string) => (p === 'User' ? scopedUsers : dao(p)) });
  // The real directory, over an unscoped view of every account.
  const raw = { entities: { User: {
    list: async () => allUsers,
    get: async (id: string) => allUsers.find((u) => u.id === id) || null,
    update: async (id: string, p: Rec) => Object.assign(allUsers.find((u) => u.id === id)!, p),
  } } };
  const directory = accountDirectory(raw, BIZ);
  const call = async (actor: Rec, body: Rec) => {
    const client = { auth: { me: async () => actor }, asServiceRole: { entities, users: { inviteUser: async (e: string) => { invited.push(e); } } } };
    const res = await handleAccess({ client, directory, tenantId: BIZ, now: NOW }, body);
    return { status: res.status, body: await res.json() };
  };
  const signUp = (u: Rec) => { allUsers.push({ role: 'user', account_status: 'Pending Approval', access_approved: false, created_date: '2026-11-15', ...u }); };
  return { db, allUsers, invited, call, signUp, user: (id: string) => allUsers.find((u) => u.id === id)! };
}

Deno.test('an invited person who signs in can be approved, and is linked to this business with a membership', async () => {
  const w = world([OWNER, PA]);
  assertEquals((await w.call(PA, { action: 'invite', email: 'New@X.test', role: 'Human Resources Manager' })).status, 200);
  assertEquals(w.invited, ['New@X.test']);
  let list = (await w.call(PA, { action: 'list' })).body;
  assertEquals(list.invitations.map((i: Rec) => [i.email, i.role]), [['New@X.test', 'Human Resources Manager']]);

  w.signUp({ id: 'u-new', email: 'new@x.test', full_name: 'New Person' });
  list = (await w.call(PA, { action: 'list' })).body;
  assertEquals(list.invitations, [], 'once they sign in the invitation moves to the approval queue');
  assertEquals(list.pending_users.map((u: Rec) => [u.id, u.linked, u.invitation?.role]), [['u-new', false, 'Human Resources Manager']]);

  assertEquals((await w.call(PA, { action: 'approve', user_id: 'u-new', role: 'Human Resources Manager' })).status, 200);
  const u = w.user('u-new');
  assertEquals([u.tenant_id, u.role, u.account_status, u.access_approved], [BIZ, 'Human Resources Manager', 'Active', true]);
  assertEquals(w.db.TenantMembership.map((m) => [m.user_id, m.membership_role, m.status, m.organisation_id]), [['u-new', 'Human Resources Manager', 'Active', BIZ]]);
  assertEquals(w.db.AccountInvitation[0].status, 'Accepted');
  assertEquals(w.db.AuditLog.map((a) => a.action), ['Access: invited', 'Access: approved']);
  list = (await w.call(PA, { action: 'list' })).body;
  assertEquals(list.pending_users, []);
  assert(list.users.some((x: Rec) => x.id === 'u-new' && !x.out_of_step));
});

Deno.test('someone who signed up without an invitation is shown to the owner only', async () => {
  const w = world([OWNER, PA]);
  w.signUp({ id: 'u-x', email: 'stranger@x.test' });
  assertEquals((await w.call(PA, { action: 'list' })).body.pending_users, []);
  assertEquals((await w.call(PA, { action: 'approve', user_id: 'u-x', role: 'Employee' })).status, 403);
  assertEquals(w.user('u-x').tenant_id, undefined);
  const owner = (await w.call(OWNER, { action: 'list' })).body;
  assertEquals(owner.pending_users.map((u: Rec) => [u.id, u.invitation]), [['u-x', null]]);
  assertEquals((await w.call(OWNER, { action: 'approve', user_id: 'u-x', role: 'Employee' })).status, 200);
  assertEquals(w.user('u-x').tenant_id, BIZ);
});

Deno.test('another business\'s accounts are never shown, changed or invited over', async () => {
  const w = world([OWNER, PA, OTHER_BIZ]);
  const list = (await w.call(OWNER, { action: 'list' })).body;
  assert(![...list.users, ...list.pending_users].some((u: Rec) => u.id === 'u-o'));
  for (const action of ['approve', 'role', 'suspend', 'reject']) {
    const r = await w.call(OWNER, { action, user_id: 'u-o', role: 'Employee' });
    assertEquals(r.status, 404, action);
  }
  assertEquals((await w.call(PA, { action: 'invite', email: 'other@x.test', role: 'Employee' })).status, 409);
  assertEquals(w.user('u-o').tenant_id, 'tenant_other');
  assertEquals(w.user('u-o').role, 'Employee');
});

Deno.test('senior roles are given and changed only by the owner or a Provider Administrator', async () => {
  const w = world([OWNER, PA, MGMT, WORKER]);
  assertEquals((await w.call(MGMT, { action: 'role', user_id: 'u-w', role: 'Provider Administrator' })).status, 403);
  assertEquals((await w.call(MGMT, { action: 'suspend', user_id: 'u-pa' })).status, 403);
  assertEquals((await w.call(MGMT, { action: 'invite', email: 'boss@x.test', role: 'Management' })).status, 403);
  assert(!(await w.call(MGMT, { action: 'list' })).body.grantable_roles.includes('Provider Administrator'));
  assertEquals((await w.call(MGMT, { action: 'role', user_id: 'u-w', role: 'Rostering Coordinator' })).status, 200);
  assertEquals((await w.call(PA, { action: 'role', user_id: 'u-w', role: 'Management' })).status, 200);
  assertEquals(w.user('u-w').role, 'Management');
  assertEquals(w.db.TenantMembership[0].membership_role, 'Management', 'membership follows the role');
  assertEquals(w.db.AuditLog.map((a) => JSON.parse(a.details)), [{ from: 'Employee', to: 'Rostering Coordinator' }, { from: 'Rostering Coordinator', to: 'Management' }]);
});

Deno.test('nobody changes their own access or the owner account', async () => {
  const w = world([OWNER, PA]);
  assertEquals((await w.call(PA, { action: 'suspend', user_id: 'u-pa' })).status, 403);
  assertEquals((await w.call(PA, { action: 'suspend', user_id: 'u-own' })).status, 403);
  assertEquals((await w.call({ ...WORKER }, { action: 'list' })).status, 403);
  assertEquals(w.db.AuditLog.length, 0);
});

Deno.test('suspend keeps the role to come back to; reactivate restores it and the membership', async () => {
  const w = world([OWNER, PA, WORKER], { TenantMembership: [{ id: 'm1', tenant_id: BIZ, user_id: 'u-w', membership_role: 'Employee', status: 'Active' }] });
  assertEquals((await w.call(PA, { action: 'suspend', user_id: 'u-w', reason: 'On extended leave' })).status, 200);
  let u = w.user('u-w');
  assertEquals([u.role, u.previous_role, u.account_status, u.access_approved, u.archive_reason], ['Archived', 'Employee', 'Suspended', false, 'On extended leave']);
  assertEquals(w.db.TenantMembership[0].status, 'Suspended');
  assertEquals((await w.call(PA, { action: 'role', user_id: 'u-w', role: 'Employee' })).status, 409, 'no role change while suspended');
  assertEquals((await w.call(PA, { action: 'reactivate', user_id: 'u-w' })).status, 200);
  u = w.user('u-w');
  assertEquals([u.role, u.account_status, u.access_approved], ['Employee', 'Active', true]);
  assertEquals(w.db.TenantMembership[0].status, 'Active');
  assertEquals(w.db.AuditLog.map((a) => a.action), ['Access: suspended', 'Access: reactivated']);
});

Deno.test('turning away an invited sign-up declines the invitation and leaves the account unlinked', async () => {
  const w = world([OWNER, PA]);
  await w.call(PA, { action: 'invite', email: 'maybe@x.test', role: 'Employee' });
  w.signUp({ id: 'u-maybe', email: 'maybe@x.test' });
  assertEquals((await w.call(PA, { action: 'reject', user_id: 'u-maybe' })).status, 200);
  assertEquals(w.db.AccountInvitation[0].status, 'Declined');
  assertEquals(w.user('u-maybe').tenant_id, undefined);
  assertEquals((await w.call(PA, { action: 'list' })).body.pending_users, []);
});

Deno.test('invitations can be cancelled, re-inviting refreshes rather than duplicates, and existing members are not re-invited', async () => {
  const w = world([OWNER, PA, WORKER]);
  await w.call(PA, { action: 'invite', email: 'a@x.test', role: 'Employee' });
  await w.call(PA, { action: 'invite', email: 'a@x.test', role: 'Intake Officer' });
  assertEquals(w.db.AccountInvitation.map((i) => [i.role, i.status]), [['Intake Officer', 'Pending']]);
  assertEquals((await w.call(PA, { action: 'invite', email: 'worker@x.test', role: 'Employee' })).status, 409);
  assertEquals((await w.call(PA, { action: 'invite', email: 'not-an-email', role: 'Employee' })).status, 400);
  const id = w.db.AccountInvitation[0].id;
  assertEquals((await w.call(PA, { action: 'cancel_invite', id })).status, 200);
  assertEquals(w.db.AccountInvitation[0].status, 'Cancelled');
  assertEquals((await w.call(PA, { action: 'list' })).body.invitations, []);
});

Deno.test('the list flags people whose business membership is out of step with their account', async () => {
  const w = world([OWNER, PA, WORKER], { TenantMembership: [{ id: 'm1', tenant_id: BIZ, user_id: 'u-pa', membership_role: 'Provider Administrator', status: 'Active' }] });
  const users = (await w.call(OWNER, { action: 'list' })).body.users;
  const flag = Object.fromEntries(users.map((u: Rec) => [u.id, u.out_of_step]));
  assertEquals(flag['u-pa'], false);
  assertEquals(flag['u-w'], true, 'no membership at all');
});

Deno.test('the directory never hands out or links an account that belongs to a business', async () => {
  const accounts = [{ id: 'a', email: 'a@x.test', tenant_id: 'tenant_other' }, { id: 'b', email: 'b@x.test' }];
  const raw = { entities: { User: { list: async () => accounts, get: async (id: string) => accounts.find((u) => u.id === id) || null, update: async (id: string, p: Rec) => Object.assign(accounts.find((u) => u.id === id)!, p) } } };
  const d = accountDirectory(raw, BIZ);
  assertEquals((await d.unlinked()).map((u: Rec) => u.id), ['b']);
  assertEquals(await d.getUnlinked('a'), null);
  assertEquals(await d.emailStatus('A@x.test'), 'elsewhere');
  let refused = false;
  try { await d.link('a', { role: 'Employee' }); } catch { refused = true; }
  assert(refused);
  await d.link('b', { role: 'Employee', tenant_id: 'sneaky' });
  assertEquals(accounts[1].tenant_id, BIZ, 'linking always uses this business');
  refused = false;
  try { await d.link('b', {}); } catch { refused = true; }
  assert(refused, 'an account is linked once');
});
