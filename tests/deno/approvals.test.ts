// Runs the real Approval Inbox handler against an in-memory store (backlog P0 01.06).
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { handleApprovals, businessDate } from '../../base44/functions/approvals/entry.ts';

type Rec = Record<string, any>;
const NOW = new Date('2026-11-15T01:00:00Z'); // 11:00 am in Brisbane

function matches(r: Rec, q: Rec) {
  return Object.entries(q || {}).every(([k, v]: [string, any]) => {
    if (v && typeof v === 'object' && '$ne' in v) return r[k] !== v.$ne;
    return r[k] === v;
  });
}

function store(seed: Record<string, Rec[]>) {
  const db: Record<string, Rec[]> = { TodoTask: [], ApprovalRequest: [], AuditLog: [], CommunicationEntry: [], Notification: [], ...seed };
  let n = 0;
  const dao = (name: string) => ({
    filter: async (q: Rec) => ({ items: (db[name] ||= []).filter((r) => matches(r, q)) }),
    get: async (id: string) => (db[name] || []).find((r) => r.id === id) || null,
    create: async (d: Rec) => { const r = { id: `${name}-${++n}`, ...d }; (db[name] ||= []).push(r); return r; },
    update: async (id: string, patch: Rec) => { const r = db[name].find((x) => x.id === id)!; Object.assign(r, patch); return r; },
  });
  const entities = new Proxy({}, { get: (_t, p: string) => dao(p) });
  return { db, client: (user: Rec | null) => ({ auth: { me: async () => user }, asServiceRole: { entities } }) };
}

const active = { account_status: 'Active', access_approved: true };
const KRISTY = { id: 'u-k', email: 'kristy@x.test', full_name: 'Kristy Dalton', role: 'admin', ...active };
const SHERELLE = { id: 'u-s', email: 'sherelle@x.test', full_name: 'Sherelle Dalton', role: 'Provider Administrator', ...active };
const WORKER = { id: 'u-w', email: 'worker@x.test', full_name: 'Sam Worker', role: 'Employee', ...active };

const task = (over: Rec = {}) => ({ id: 't1', title: 'Fire drill record', module: 'Safety', status: 'Pending Approval', completed_by: 'Sam Worker', completed_date: '2026-11-14', assigned_email: 'worker@x.test', ...over });
const call = (s: any, user: Rec | null, body: Rec) =>
  handleApprovals(s.client(user), new Request('http://x', { method: 'POST', body: JSON.stringify(body) }), NOW);
const inbox = async (s: any, user: Rec) => (await call(s, user, { action: 'inbox' })).json();

Deno.test('tasks waiting for sign-off appear in the inbox once, for approvers only', async () => {
  const s = store({ TodoTask: [task()] });
  const k = await inbox(s, KRISTY);
  assertEquals(k.to_decide.map((r: Rec) => r.record_id), ['t1']);
  await inbox(s, KRISTY);
  assertEquals(s.db.ApprovalRequest.length, 1, 'no duplicate request on a second look');
  const w = await inbox(s, WORKER);
  assertEquals(w.to_decide, []);
  assertEquals(w.can_approve, false);
  assertEquals(w.my_requests.map((r: Rec) => r.record_id), ['t1'], 'the worker sees their own request');
});

Deno.test('approving needs a signature, and signs off the task with an activity record and a notification', async () => {
  const s = store({ TodoTask: [task()] });
  const id = (await inbox(s, KRISTY)).to_decide[0].id;
  assertEquals((await call(s, KRISTY, { action: 'decide', id, decision: 'approve', signature: '' })).status, 400);
  const res = await call(s, KRISTY, { action: 'decide', id, decision: 'approve', signature: 'Kristy Dalton' });
  assertEquals(res.status, 200);
  const t = s.db.TodoTask[0];
  assertEquals([t.status, t.signed_off_by, t.signed_off_date, t.signature], ['Finalised', 'Kristy Dalton', businessDate(NOW), 'Kristy Dalton']);
  assertEquals(s.db.ApprovalRequest[0].status, 'Approved');
  assertEquals(s.db.AuditLog[0].action, 'Approval: signed off');
  assertEquals(s.db.Notification[0].recipient, 'worker@x.test');
  assertEquals(businessDate(NOW), '2026-11-15');
});

Deno.test('a request can only be decided once', async () => {
  const s = store({ TodoTask: [task()] });
  const id = (await inbox(s, KRISTY)).to_decide[0].id;
  await call(s, KRISTY, { action: 'decide', id, decision: 'approve', signature: 'K D' });
  assertEquals((await call(s, SHERELLE, { action: 'decide', id, decision: 'return', note: 'again please' })).status, 409);
});

Deno.test('returning needs a reason and sends the task back to pending', async () => {
  const s = store({ TodoTask: [task()] });
  const id = (await inbox(s, SHERELLE)).to_decide[0].id;
  assertEquals((await call(s, SHERELLE, { action: 'decide', id, decision: 'return', note: '' })).status, 400);
  assertEquals((await call(s, SHERELLE, { action: 'decide', id, decision: 'return', note: 'Photo of the log is missing' })).status, 200);
  const t = s.db.TodoTask[0];
  assertEquals([t.status, t.completed_by, t.signed_off_by], ['Pending', '', '']);
  assert(s.db.Notification[0].message.includes('Photo of the log is missing'));
});

Deno.test('nobody can approve their own work, by account or by name', async () => {
  const s = store({ TodoTask: [task({ completed_by: 'Sherelle Dalton', assigned_email: 'sherelle@x.test' })] });
  const sh = await inbox(s, SHERELLE);
  assertEquals(sh.to_decide, []);
  assertEquals(sh.own_awaiting_someone_else.length, 1);
  const id = sh.own_awaiting_someone_else[0].id;
  assertEquals((await call(s, SHERELLE, { action: 'decide', id, decision: 'approve', signature: 'S D' })).status, 403);
  assertEquals(s.db.TodoTask[0].status, 'Pending Approval');
  assertEquals((await call(s, KRISTY, { action: 'decide', id, decision: 'approve', signature: 'K D' })).status, 200);
});

Deno.test('staff without an approver role cannot decide, and signed-out or unapproved callers are refused', async () => {
  const s = store({ TodoTask: [task({ completed_by: 'Someone Else', assigned_email: '' })] });
  const id = (await inbox(s, KRISTY)).to_decide[0].id;
  assertEquals((await call(s, WORKER, { action: 'decide', id, decision: 'approve', signature: 'Sam' })).status, 403);
  assertEquals((await call(s, null, { action: 'inbox' })).status, 401);
  assertEquals((await call(s, { ...SHERELLE, account_status: 'Suspended' }, { action: 'inbox' })).status, 403);
});

Deno.test('a task signed off or reopened elsewhere withdraws its request', async () => {
  const s = store({ TodoTask: [task()] });
  const id = (await inbox(s, KRISTY)).to_decide[0].id;
  s.db.TodoTask[0].status = 'Finalised';
  assertEquals((await call(s, KRISTY, { action: 'decide', id, decision: 'approve', signature: 'K D' })).status, 409);
  assertEquals(s.db.ApprovalRequest[0].status, 'Withdrawn');
  const s2 = store({ TodoTask: [task()] });
  await inbox(s2, KRISTY);
  s2.db.TodoTask[0].status = 'Pending';
  assertEquals((await inbox(s2, KRISTY)).to_decide, []);
  assertEquals(s2.db.ApprovalRequest[0].status, 'Withdrawn');
});
