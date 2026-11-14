// Runs the real approvals handler for Access Requests (backlog P0 16.09) against an in-memory business.
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { handleApprovals, accessApprovers } from '../../base44/functions/approvals/entry.ts';

type Rec = Record<string, any>;
const NOW = new Date('2026-11-15T01:00:00Z');
const BIZ = 'tenant_choices';
const active = { account_status: 'Active', access_approved: true, tenant_id: BIZ };
const OWNER = { id: 'u-own', email: 'owner@x.test', full_name: 'Owner', role: 'admin', ...active };
const PA = { id: 'u-pa', email: 'pa@x.test', full_name: 'Pat Admin', role: 'Provider Administrator', ...active };
const MGMT = { id: 'u-m', email: 'm@x.test', full_name: 'Morgan Manager', role: 'Management', ...active };
const WORKER = { id: 'u-w', email: 'worker@x.test', full_name: 'Sam Worker', role: 'Employee', ...active };

function matches(r: Rec, q: Rec) {
  return Object.entries(q || {}).every(([k, v]: [string, any]) => (v && typeof v === 'object' && '$ne' in v ? r[k] !== v.$ne : r[k] === v));
}

function world(users: Rec[], seed: Record<string, Rec[]> = {}) {
  const db: Record<string, Rec[]> = { User: users.map((u) => ({ ...u })), TodoTask: [], ApprovalRequest: [], AuditLog: [], CommunicationEntry: [], Notification: [], TenantMembership: [], ...seed };
  let n = 0;
  const dao = (name: string) => ({
    list: async () => ({ items: db[name] ||= [] }),
    filter: async (q: Rec) => ({ items: (db[name] ||= []).filter((r) => matches(r, q)) }),
    get: async (id: string) => { const r = (db[name] || []).find((x) => x.id === id); return r ? { ...r } : null; },
    create: async (d: Rec) => { const r = { id: `${name}-${++n}`, ...d }; (db[name] ||= []).push(r); return r; },
    update: async (id: string, p: Rec) => Object.assign(db[name].find((x) => x.id === id)!, p),
  });
  const entities = new Proxy({}, { get: (_t, p: string) => dao(p) });
  const me = (id: string) => db.User.find((u) => u.id === id)!;
  const call = async (actorId: string, body: Rec) => {
    const actor = { ...me(actorId) };
    const res = await handleApprovals({ auth: { me: async () => actor }, asServiceRole: { entities } }, new Request('http://x', { method: 'POST', body: JSON.stringify(body) }), NOW);
    return { status: res.status, body: await res.json() };
  };
  return { db, call, me };
}

Deno.test('a worker asks for a role, a manager approves with a signature, and the role and membership change', async () => {
  const w = world([OWNER, PA, MGMT, WORKER]);
  const asked = await w.call('u-w', { action: 'request_access', role: 'Rostering Coordinator', reason: 'I now build the weekly roster.' });
  assertEquals(asked.status, 200);
  const req = w.db.ApprovalRequest[0];
  assertEquals([req.record_type, req.current_role, req.requested_role, req.status], ['AccessRequest', 'Employee', 'Rostering Coordinator', 'Pending']);
  assertEquals(w.db.Notification.map((x) => x.recipient).sort(), ['m@x.test', 'owner@x.test', 'pa@x.test'], 'every manager is told');

  const inbox = (await w.call('u-m', { action: 'inbox' })).body;
  assertEquals(inbox.can_approve, true, 'Management can now decide access requests');
  assertEquals(inbox.to_decide.map((r: Rec) => r.requested_role), ['Rostering Coordinator']);
  assertEquals((await w.call('u-w', { action: 'inbox' })).body.my_requests.map((r: Rec) => r.status), ['Pending']);

  assertEquals((await w.call('u-m', { action: 'decide', id: req.id, decision: 'approve', signature: '' })).status, 400);
  assertEquals((await w.call('u-m', { action: 'decide', id: req.id, decision: 'approve', signature: 'Morgan Manager' })).status, 200);
  assertEquals([w.me('u-w').role, w.me('u-w').previous_role], ['Rostering Coordinator', 'Employee']);
  assertEquals(w.db.TenantMembership.map((m) => [m.user_id, m.membership_role, m.status]), [['u-w', 'Rostering Coordinator', 'Active']]);
  assertEquals(w.db.ApprovalRequest[0].status, 'Approved');
  assertEquals(w.db.AuditLog.map((a) => a.action), ['Access request: submitted', 'Access: role changed']);
  assert(w.db.Notification.at(-1)!.message.includes('approved'));
  assertEquals((await w.call('u-m', { action: 'decide', id: req.id, decision: 'approve', signature: 'Morgan Manager' })).status, 409, 'decided once only');
});

Deno.test('declining needs a reason, leaves the role alone and tells the person why', async () => {
  const w = world([OWNER, MGMT, WORKER]);
  await w.call('u-w', { action: 'request_access', role: 'Intake Officer', reason: 'Helping with new referrals.' });
  const id = w.db.ApprovalRequest[0].id;
  assertEquals((await w.call('u-m', { action: 'decide', id, decision: 'return', note: '' })).status, 400);
  assertEquals((await w.call('u-m', { action: 'decide', id, decision: 'return', note: 'Not this month, ask again in December.' })).status, 200);
  assertEquals(w.me('u-w').role, 'Employee');
  assertEquals(w.db.ApprovalRequest[0].status, 'Returned');
  assertEquals(w.db.AuditLog.at(-1)!.action, 'Access request: declined');
  assert(w.db.Notification.at(-1)!.message.includes('ask again in December'));
});

Deno.test('senior roles go to the owner or a Provider Administrator only', async () => {
  assertEquals(accessApprovers('Employee', 'Management'), ['admin', 'Provider Administrator']);
  assertEquals(accessApprovers('Management', 'Employee'), ['admin', 'Provider Administrator']);
  assertEquals(accessApprovers('Employee', 'Intake Officer'), ['admin', 'Provider Administrator', 'Management']);
  const w = world([OWNER, PA, MGMT, WORKER]);
  await w.call('u-w', { action: 'request_access', role: 'Provider Administrator', reason: 'Covering while the manager is away.' });
  const id = w.db.ApprovalRequest[0].id;
  assertEquals((await w.call('u-m', { action: 'inbox' })).body.to_decide, []);
  assertEquals((await w.call('u-m', { action: 'decide', id, decision: 'approve', signature: 'Morgan Manager' })).status, 403);
  assertEquals((await w.call('u-pa', { action: 'decide', id, decision: 'approve', signature: 'Pat Admin' })).status, 200);
  assertEquals(w.me('u-w').role, 'Provider Administrator');
});

Deno.test('nobody approves their own request, even a manager asking for more', async () => {
  const w = world([OWNER, PA, MGMT]);
  await w.call('u-m', { action: 'request_access', role: 'Compliance Administrator', reason: 'Taking over the compliance calendar.' });
  const id = w.db.ApprovalRequest[0].id;
  assertEquals((await w.call('u-m', { action: 'decide', id, decision: 'approve', signature: 'Morgan Manager' })).status, 403);
  assertEquals(w.me('u-m').role, 'Management');
});

Deno.test('requests are checked: a real role, a reason, one at a time, and the owner needs none', async () => {
  const w = world([OWNER, WORKER]);
  assertEquals((await w.call('u-w', { action: 'request_access', role: 'admin', reason: 'I would like everything please.' })).status, 400);
  assertEquals((await w.call('u-w', { action: 'request_access', role: 'Employee', reason: 'Same role as now, oddly.' })).status, 400);
  assertEquals((await w.call('u-w', { action: 'request_access', role: 'Intake Officer', reason: 'short' })).status, 400);
  assertEquals((await w.call('u-w', { action: 'request_access', role: 'Intake Officer', reason: 'Helping with referrals.' })).status, 200);
  assertEquals((await w.call('u-w', { action: 'request_access', role: 'Rostering Coordinator', reason: 'Actually rostering instead.' })).status, 409);
  assertEquals((await w.call('u-own', { action: 'request_access', role: 'Employee', reason: 'Testing the owner path.' })).status, 400);
});

Deno.test('the person can withdraw a waiting request; nobody else can', async () => {
  const w = world([OWNER, MGMT, WORKER]);
  await w.call('u-w', { action: 'request_access', role: 'Intake Officer', reason: 'Helping with referrals.' });
  const id = w.db.ApprovalRequest[0].id;
  assertEquals((await w.call('u-m', { action: 'withdraw', id })).status, 404);
  assertEquals((await w.call('u-w', { action: 'withdraw', id })).status, 200);
  assertEquals(w.db.ApprovalRequest[0].status, 'Withdrawn');
  assertEquals((await w.call('u-w', { action: 'withdraw', id })).status, 409);
});

Deno.test('if the account changed after asking, the request is withdrawn instead of applied', async () => {
  const w = world([OWNER, MGMT, WORKER]);
  await w.call('u-w', { action: 'request_access', role: 'Intake Officer', reason: 'Helping with referrals.' });
  const id = w.db.ApprovalRequest[0].id;
  w.me('u-w').role = 'Volunteer'; // changed by User Administration in the meantime
  assertEquals((await w.call('u-m', { action: 'decide', id, decision: 'approve', signature: 'Morgan Manager' })).status, 409);
  assertEquals(w.me('u-w').role, 'Volunteer');
  assertEquals(w.db.ApprovalRequest[0].status, 'Withdrawn');
});
