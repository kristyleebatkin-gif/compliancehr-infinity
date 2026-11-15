// Runs the real Periodic Access Review handler (backlog P0 16.12) against an in-memory business.
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { handleReview, REVIEW_EVERY_DAYS } from '../../base44/functions/accessReview/entry.ts';

type Rec = Record<string, any>;
const NOW = new Date('2026-11-15T01:00:00Z'); // 15 Nov, 11 am in Brisbane
const BIZ = 'tenant_choices';
const active = { account_status: 'Active', access_approved: true, tenant_id: BIZ };
const OWNER = { id: 'u-own', email: 'owner@x.test', full_name: 'Owner', role: 'admin', ...active };
const PA = { id: 'u-pa', email: 'pa@x.test', full_name: 'Pat Admin', role: 'Provider Administrator', ...active };
const MGMT = { id: 'u-m', email: 'm@x.test', full_name: 'Morgan Manager', role: 'Management', ...active };
const WORKER = { id: 'u-w', email: 'worker@x.test', full_name: 'Sam Worker', role: 'Employee', ...active };
const ROSTER = { id: 'u-r', email: 'r@x.test', full_name: 'Robin Roster', role: 'Rostering Coordinator', ...active };
const GONE = { id: 'u-g', email: 'g@x.test', full_name: 'Gale Gone', role: 'Archived', account_status: 'Suspended', access_approved: false, tenant_id: BIZ };

function matches(r: Rec, q: Rec) {
  return Object.entries(q || {}).every(([k, v]: [string, any]) => (v && typeof v === 'object' && '$ne' in v ? r[k] !== v.$ne : r[k] === v));
}

function world(users: Rec[]) {
  const db: Record<string, Rec[]> = { User: users.map((u) => ({ ...u })), AccessReview: [], AuditLog: [], TenantMembership: [] };
  let n = 0;
  const dao = (name: string) => ({
    list: async () => ({ items: db[name] ||= [] }),
    filter: async (q: Rec) => ({ items: (db[name] ||= []).filter((r) => matches(r, q)) }),
    get: async (id: string) => (db[name] || []).find((x) => x.id === id) || null,
    create: async (d: Rec) => { const r = { id: `${name}-${++n}`, ...structuredClone(d) }; (db[name] ||= []).push(r); return r; },
    update: async (id: string, p: Rec) => Object.assign(db[name].find((x) => x.id === id)!, structuredClone(p)),
  });
  const entities = new Proxy({}, { get: (_t, p: string) => dao(p) });
  const me = (id: string) => db.User.find((u) => u.id === id)!;
  const call = async (actorId: string, body: Rec, now = NOW) => {
    const actor = { ...me(actorId) };
    const res = await handleReview({ auth: { me: async () => actor }, asServiceRole: { entities } }, body, now);
    return { status: res.status, body: await res.json() };
  };
  const review = () => db.AccessReview[0];
  const item = (userId: string) => review().items.find((i: Rec) => i.user_id === userId);
  return { db, call, me, review, item };
}

Deno.test('a review snapshots everyone with active access, except the owner and anyone already without access', async () => {
  const w = world([OWNER, PA, MGMT, WORKER, GONE]);
  assertEquals((await w.call('u-m', { action: 'overview' })).body.due_now, true, 'never reviewed, so due now');
  assertEquals((await w.call('u-m', { action: 'start' })).status, 200);
  assertEquals(w.review().items.map((i: Rec) => [i.user_id, i.decision]), [['u-m', 'Pending'], ['u-pa', 'Pending'], ['u-w', 'Pending']]);
  assertEquals(w.review().title, 'Access review: November 2026');
  assertEquals(w.review().due_date, '2026-11-29');
  assertEquals((await w.call('u-pa', { action: 'start' })).status, 409, 'one open review at a time');
  assertEquals(w.db.AuditLog[0].action, 'Access review: started');
});

Deno.test('keep, change and suspend each take effect at once and keep the membership in step', async () => {
  const w = world([OWNER, PA, WORKER, ROSTER, { ...WORKER, id: 'u-w2', email: 'w2@x.test', full_name: 'Wren Worker' }]);
  await w.call('u-pa', { action: 'start' });
  const id = w.review().id;
  assertEquals((await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-w', decision: 'keep' })).status, 200);
  assertEquals((await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-r', decision: 'change', role: 'Employee', note: '' })).status, 400, 'a change needs a note');
  assertEquals((await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-r', decision: 'change', role: 'Employee', note: 'No longer does rostering.' })).status, 200);
  assertEquals((await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-w2', decision: 'suspend', note: 'Left the business in October.' })).status, 200);
  assertEquals(w.me('u-w').role, 'Employee');
  assertEquals([w.me('u-r').role, w.me('u-r').previous_role], ['Employee', 'Rostering Coordinator']);
  assertEquals([w.me('u-w2').account_status, w.me('u-w2').previous_role, w.me('u-w2').access_approved], ['Suspended', 'Employee', false]);
  assertEquals(w.db.TenantMembership.map((m) => [m.user_id, m.membership_role, m.status]).sort(), [['u-r', 'Employee', 'Active'], ['u-w2', 'Employee', 'Suspended']]);
  assertEquals(w.item('u-r').decision, 'Changed');
  assertEquals(w.item('u-r').new_role, 'Employee');
  assertEquals((await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-w', decision: 'suspend', note: 'Changed my mind.' })).status, 409, 'decided once');
  const logged = w.db.AuditLog.map((a) => a.action);
  assertEquals(logged, ['Access review: started', 'Access review: kept', 'Access: role changed', 'Access: suspended']);
  assertEquals(JSON.parse(w.db.AuditLog[2].details).from, 'Rostering Coordinator');
});

Deno.test('nobody reviews their own access, and senior accounts need the owner or a Provider Administrator', async () => {
  const w = world([OWNER, PA, MGMT, WORKER]);
  await w.call('u-m', { action: 'start' });
  const id = w.review().id;
  assertEquals((await w.call('u-m', { action: 'decide', review_id: id, user_id: 'u-m', decision: 'keep' })).status, 403);
  assertEquals((await w.call('u-m', { action: 'decide', review_id: id, user_id: 'u-pa', decision: 'keep' })).status, 403);
  assertEquals((await w.call('u-m', { action: 'decide', review_id: id, user_id: 'u-w', decision: 'change', role: 'Provider Administrator', note: 'Promotion.' })).status, 403);
  assertEquals((await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-m', decision: 'keep' })).status, 200);
  assertEquals((await w.call('u-own', { action: 'decide', review_id: id, user_id: 'u-pa', decision: 'keep' })).status, 200);
});

Deno.test('someone who lost access after the review started is recorded as having left already', async () => {
  const w = world([OWNER, PA, WORKER]);
  await w.call('u-pa', { action: 'start' });
  Object.assign(w.me('u-w'), { role: 'Archived', account_status: 'Suspended', access_approved: false });
  const r = await w.call('u-pa', { action: 'decide', review_id: w.review().id, user_id: 'u-w', decision: 'change', role: 'Intake Officer', note: 'Was going to change.' });
  assertEquals([r.status, r.body.decision], [200, 'Left already']);
  assertEquals(w.me('u-w').account_status, 'Suspended', 'nothing was re-opened');
});

Deno.test('a review completes only when everyone is decided, and the next one falls due 90 days later', async () => {
  const w = world([OWNER, PA, WORKER, ROSTER]);
  await w.call('u-pa', { action: 'start' });
  const id = w.review().id;
  await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-w', decision: 'keep' });
  const early = await w.call('u-pa', { action: 'complete', review_id: id });
  assertEquals(early.status, 409);
  assertEquals(early.body.error, '2 people still need a decision.');
  await w.call('u-own', { action: 'decide', review_id: id, user_id: 'u-pa', decision: 'keep' });
  await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-r', decision: 'keep' });
  const done = await w.call('u-pa', { action: 'complete', review_id: id });
  assertEquals(done.status, 200);
  assertEquals(done.body.summary, '3 reviewed: 3 kept, 0 changed, 0 suspended, 0 had already left.');
  assertEquals(w.review().status, 'Completed');
  const later = (await w.call('u-pa', { action: 'overview' })).body;
  assertEquals(REVIEW_EVERY_DAYS, 90);
  assertEquals([later.open, later.next_due, later.due_now], [null, '2027-02-13', false]);
  const dueAgain = (await w.call('u-pa', { action: 'overview' }, new Date('2027-02-13T01:00:00Z'))).body;
  assertEquals(dueAgain.due_now, true);
});

Deno.test('a review can be cancelled with a reason; only managers can use reviews at all', async () => {
  const w = world([OWNER, PA, WORKER]);
  assertEquals((await w.call('u-w', { action: 'overview' })).status, 403);
  await w.call('u-pa', { action: 'start' });
  const id = w.review().id;
  assertEquals((await w.call('u-pa', { action: 'cancel', review_id: id, reason: '' })).status, 400);
  assertEquals((await w.call('u-pa', { action: 'cancel', review_id: id, reason: 'Started by mistake.' })).status, 200);
  assertEquals(w.review().status, 'Cancelled');
  assertEquals((await w.call('u-pa', { action: 'decide', review_id: id, user_id: 'u-w', decision: 'keep' })).status, 409);
  assertEquals((await w.call('u-pa', { action: 'overview' })).body.due_now, true, 'a cancelled review does not count as done');
});
