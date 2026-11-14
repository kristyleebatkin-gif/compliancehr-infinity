// Runs the real workspacePin server handler against an in-memory fake Base44 client.
//   deno test --no-config --no-lock -A tests/deno/workspacePin.test.ts
// Proves the server-side rules. It does not test the live Base44 RLS (register VER-01).
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { handlePinRequest, PIN_RULES } from '../../base44/functions/workspacePin/entry.ts';

type Rec = Record<string, any>;

function fakeBase44(user: Rec) {
  const rows: Rec[] = [];
  const audit: Rec[] = [];
  const emails: Rec[] = [];
  let id = 0;
  const match = (r: Rec, q: Rec) => Object.entries(q).every(([k, v]) => r[k] === v);
  const svc = {
    WorkspaceSecurityPin: {
      filter: async (q: Rec) => ({ items: rows.filter((r) => match(r, q)).slice(-1) }),
      create: async (d: Rec) => { const r = { id: `pin${++id}`, created_by_id: user.id, ...d }; rows.push(r); return r; },
      update: async (rid: string, patch: Rec) => { Object.assign(rows.find((r) => r.id === rid)!, patch); },
    },
    AuditLog: { create: async (d: Rec) => { audit.push(d); return d; } },
  };
  return {
    rows, audit, emails,
    client: {
      auth: { me: async () => user },
      asServiceRole: { entities: svc, integrations: { Core: { SendEmail: async (m: Rec) => { emails.push(m); } } } },
    },
  };
}

const USER = { id: 'u1', email: 'sherelle@example.test', full_name: 'Test User', role: 'Provider Administrator', account_status: 'Active', access_approved: true, tenant_id: 't1' };
const call = async (fake: any, body: Rec, now = Date.now()) => {
  const res = await handlePinRequest(fake.client, new Request('http://x', { method: 'POST', body: JSON.stringify({ workspace: 'today', ...body }) }), now);
  return { status: res.status, data: await res.json() };
};

Deno.test('PIN is stored as a slow salted hash, never as digits', async () => {
  const fake = fakeBase44(USER);
  await call(fake, { action: 'set', pin: '4826' });
  const row = fake.rows[0];
  assert(row.pin_hash.startsWith(`pbkdf2$${PIN_RULES.pbkdf2Iterations}$`));
  assert(!JSON.stringify(row).includes('4826'));
});

Deno.test('weak PINs are refused', async () => {
  const fake = fakeBase44(USER);
  for (const weak of ['1111', '1234', '9876', '12']) {
    const r = await call(fake, { action: 'set', pin: weak });
    assertEquals(r.status, 400, weak);
  }
});

Deno.test('5 wrong attempts lock for 30 minutes, even with the right PIN', async () => {
  const fake = fakeBase44(USER);
  const t0 = Date.now();
  await call(fake, { action: 'set', pin: '4826' }, t0);
  for (let i = 1; i <= 4; i += 1) assertEquals((await call(fake, { action: 'unlock', pin: '0000' }, t0)).status, 401);
  assertEquals((await call(fake, { action: 'unlock', pin: '0000' }, t0)).status, 423);
  assertEquals((await call(fake, { action: 'unlock', pin: '4826' }, t0 + 29 * 60 * 1000)).status, 423, 'still locked at 29 min');
  const after = await call(fake, { action: 'unlock', pin: '4826' }, t0 + 31 * 60 * 1000);
  assertEquals(after.status, 200);
  assertEquals(after.data.unlocked, true);
  assert(fake.audit.some((a) => /locked out/.test(a.action)));
});

Deno.test('session locks after 30 minutes without activity; activity keeps it open; expired session is not revived', async () => {
  const fake = fakeBase44(USER);
  const t0 = Date.now();
  await call(fake, { action: 'set', pin: '4826' }, t0);
  assertEquals((await call(fake, { action: 'status' }, t0 + 20 * 60 * 1000)).data.unlocked, true);
  await call(fake, { action: 'activity' }, t0 + 20 * 60 * 1000);
  assertEquals((await call(fake, { action: 'status' }, t0 + 45 * 60 * 1000)).data.unlocked, true, 'activity extended it');
  assertEquals((await call(fake, { action: 'status' }, t0 + 51 * 60 * 1000)).data.unlocked, false, 'idle 31 min');
  await call(fake, { action: 'activity' }, t0 + 52 * 60 * 1000);
  assertEquals((await call(fake, { action: 'status' }, t0 + 52 * 60 * 1000)).data.unlocked, false, 'activity cannot revive');
});

Deno.test('forgotten PIN needs the emailed code; wrong codes are limited; there is no remove-PIN bypass', async () => {
  const fake = fakeBase44(USER);
  const t0 = Date.now();
  await call(fake, { action: 'set', pin: '4826' }, t0);
  await call(fake, { action: 'lock' }, t0);
  assertEquals((await call(fake, { action: 'reset' }, t0)).status, 400, 'no direct reset action');
  assertEquals((await call(fake, { action: 'delete' }, t0)).status, 400, 'no delete action');
  const sent = await call(fake, { action: 'requestReset' }, t0);
  assertEquals(sent.status, 200);
  assertEquals(fake.emails.length, 1);
  assertEquals(fake.emails[0].to, USER.email);
  const code = fake.emails[0].body.match(/(\d{6})/)[1];
  assert(!JSON.stringify(fake.rows[0]).includes(code), 'code not stored in plain text');
  for (let i = 0; i < PIN_RULES.resetMaxAttempts; i += 1) {
    const wrong = code === '000000' ? '000001' : '000000';
    await call(fake, { action: 'confirmReset', code: wrong, newPin: '5937' }, t0);
  }
  assertEquals((await call(fake, { action: 'confirmReset', code, newPin: '5937' }, t0)).status, 410, 'used up after 5 wrong codes');
  await call(fake, { action: 'requestReset' }, t0 + 2 * 60 * 1000);
  const code2 = fake.emails[1].body.match(/(\d{6})/)[1];
  assertEquals((await call(fake, { action: 'confirmReset', code: code2, newPin: '5937' }, t0 + 20 * 60 * 1000)).status, 410, 'expired after 15 min');
  await call(fake, { action: 'requestReset' }, t0 + 21 * 60 * 1000);
  const code3 = fake.emails[2].body.match(/(\d{6})/)[1];
  const ok = await call(fake, { action: 'confirmReset', code: code3, newPin: '5937' }, t0 + 22 * 60 * 1000);
  assertEquals(ok.status, 200);
  assertEquals((await call(fake, { action: 'unlock', pin: '5937' }, t0 + 22 * 60 * 1000)).status, 200);
});

Deno.test('the browser cannot set the attempt counter or lockout through the request', async () => {
  const fake = fakeBase44(USER);
  const t0 = Date.now();
  await call(fake, { action: 'set', pin: '4826', failed_attempts: -100, locked_until: null }, t0);
  assertEquals(fake.rows[0].failed_attempts, 0);
  for (let i = 0; i < 5; i += 1) await call(fake, { action: 'unlock', pin: '0000', failed_attempts: 0, locked_until: null }, t0);
  assertEquals((await call(fake, { action: 'unlock', pin: '4826' }, t0)).status, 423);
});

Deno.test('unapproved or suspended accounts are refused', async () => {
  const fake = fakeBase44({ ...USER, account_status: 'Suspended' });
  assertEquals((await call(fake, { action: 'status' })).status, 403);
});

Deno.test('older browser-made PIN hashes still unlock and are upgraded to the slow hash', async () => {
  const fake = fakeBase44(USER);
  const salt = 'abc123';
  const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`compliancehr:${salt}:4826`))), (b) => b.toString(16).padStart(2, '0')).join('');
  fake.rows.push({ id: 'old', workspace: 'today', created_by_id: USER.id, pin_salt: salt, pin_hash: `sha256:${digest}`, failed_attempts: 0 });
  assertEquals((await call(fake, { action: 'unlock', pin: '4826' })).status, 200);
  assert(fake.rows[0].pin_hash.startsWith('pbkdf2$'));
});
