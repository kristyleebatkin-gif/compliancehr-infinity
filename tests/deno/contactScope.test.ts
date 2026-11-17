import { assertEquals, assertRejects } from 'jsr:@std/assert@1';
import { appContactEmails } from '../../base44/shared/systemAuth.ts';
const user = { id: 'u-a', tenant_id: 'a', role: 'Administration', account_status: 'Active', access_approved: true };
function fixture() {
  const calls: any[] = [];
  const entities = Object.fromEntries(['User', 'StaffProfile', 'ParticipantProfile', 'Contact', 'KeyBusinessContact'].map(name => [name, {
    filter: async (q: any) => {
      calls.push({ name, q });
      // Deliberately ignore the query to verify defence against a foreign/malformed response.
      const rows = [{ tenant_id: 'a', email: ' OWN@example.test ' }, { tenant_id: 'b', email: 'foreign@example.test' }, { email: 'untagged@example.test' }];
      return name === 'User' ? rows : { items: rows };
    }
  }]));
  return { client: { asServiceRole: { entities } }, calls };
}
Deno.test('contact eligibility refuses missing, unapproved and unscoped users before reads', async () => {
  for (const actor of [undefined, { ...user, access_approved: false }, { ...user, account_status: 'Suspended' }, { ...user, tenant_id: null }]) {
    const f = fixture();
    await assertRejects(() => appContactEmails(f.client, actor));
    assertEquals(f.calls.length, 0);
  }
});
Deno.test('contact eligibility scopes all sources and excludes foreign/untagged email addresses', async () => {
  const f = fixture();
  assertEquals([...await appContactEmails(f.client, user)], ['own@example.test']);
  assertEquals(f.calls.length, 5);
  assertEquals(f.calls.every(call => call.q.tenant_id === 'a'), true);
});
Deno.test('contact eligibility tolerates an unavailable source without admitting unknown recipients', async () => {
  const f = fixture();
  f.client.asServiceRole.entities.Contact.filter = async () => { throw new Error('offline'); };
  assertEquals([...await appContactEmails(f.client, user)], ['own@example.test']);
});
