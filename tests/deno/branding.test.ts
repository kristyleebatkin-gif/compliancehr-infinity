// Runs the real updateCompanyBranding handler against an in-memory fake (audit CRIT-04).
//   deno test --no-config --no-lock --no-check -A tests/deno/branding.test.ts
import { assert, assertEquals } from 'jsr:@std/assert@1';
import { handleBranding } from '../../base44/functions/updateCompanyBranding/entry.ts';

type Rec = Record<string, any>;
const LOGO = 'https://base44.app/api/apps/6ac9f91f0d82b1f80ec6a25f/files/mp/public/x/logo.png';

function fake(user: Rec, seed: { Provider?: Rec[]; BusinessDetails?: Rec[] } = {}) {
  const db: Record<string, Rec[]> = { Provider: [...(seed.Provider || [])], BusinessDetails: [...(seed.BusinessDetails || [])], AuditLog: [] };
  let n = 0;
  const dao = (name: string) => ({
    filter: async () => ({ items: [...db[name]].reverse() }),
    create: async (d: Rec) => { const r = { id: `${name}${++n}`, ...d }; db[name].push(r); return r; },
    update: async (id: string, patch: Rec) => { Object.assign(db[name].find((r) => r.id === id)!, patch); },
  });
  return {
    db,
    client: { auth: { me: async () => user }, asServiceRole: { entities: { Provider: dao('Provider'), BusinessDetails: dao('BusinessDetails'), AuditLog: dao('AuditLog') } } },
  };
}
const ADMIN_A = { id: 'ua', role: 'Provider Administrator', account_status: 'Active', access_approved: true, tenant_id: 'tenant_a', email: 'a@x.test' };
const post = (f: any, body: Rec) => handleBranding(f.client, new Request('http://x', { method: 'POST', body: JSON.stringify(body) }));

Deno.test('cannot change another business\'s branding record by sending its id', async () => {
  const f = fake(ADMIN_A, { Provider: [{ id: 'pb', tenant_id: 'tenant_b', provider_name: 'B Care', document_branding_active: true }] });
  const res = await post(f, { provider_id: 'pb', company_name: 'Hijack' });
  assertEquals(res.status, 403);
  assertEquals(f.db.Provider[0].provider_name, 'B Care');
});

Deno.test('cannot act for another business by sending its tenant id', async () => {
  const f = fake(ADMIN_A);
  assertEquals((await post(f, { tenant_id: 'tenant_b', company_name: 'X' })).status, 403);
});

Deno.test('saving branding never switches off another business\'s branding', async () => {
  const f = fake(ADMIN_A, { Provider: [{ id: 'pb', tenant_id: 'tenant_b', provider_name: 'B Care', document_branding_active: true }] });
  const res = await post(f, { company_name: 'A Supports', logo_url: LOGO });
  assertEquals(res.status, 200);
  assertEquals(f.db.Provider.find((p) => p.id === 'pb')!.document_branding_active, true);
  const mine = f.db.Provider.find((p) => p.tenant_id === 'tenant_a')!;
  assertEquals(mine.provider_name, 'A Supports');
  assert(f.db.BusinessDetails.every((b) => b.tenant_id === 'tenant_a'));
  assertEquals(f.db.AuditLog[0].tenant_id, 'tenant_a');
});

Deno.test('slogan is optional; outside logo links are refused', async () => {
  const f = fake(ADMIN_A);
  assertEquals((await post(f, { company_name: 'A Supports' })).status, 200);
  assertEquals((await post(f, { company_name: 'A Supports', logo_url: 'https://evil.example/logo.png' })).status, 400);
});

Deno.test('staff without admin role, and unapproved accounts, are refused', async () => {
  assertEquals((await post(fake({ ...ADMIN_A, role: 'Support Worker' }), { company_name: 'X' })).status, 403);
  assertEquals((await post(fake({ ...ADMIN_A, account_status: 'Suspended' }), { company_name: 'X' })).status, 403);
});
