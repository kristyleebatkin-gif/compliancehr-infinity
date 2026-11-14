import { assertEquals } from 'jsr:@std/assert@1';
import { pickPublicBusiness } from '../../base44/functions/publicSubmissions/entry.ts';

Deno.test('public form: one business is used when only one exists', () => {
  assertEquals(pickPublicBusiness(undefined, ['tenant_a']), { ok: true, tenantId: 'tenant_a' });
});
Deno.test('public form: a named business must be active', () => {
  assertEquals(pickPublicBusiness('tenant_b', ['tenant_a', 'tenant_b']), { ok: true, tenantId: 'tenant_b' });
  assertEquals(pickPublicBusiness('tenant_x', ['tenant_a', 'tenant_b']).ok, false);
});
Deno.test('public form: with several businesses and none named, nothing is guessed', () => {
  assertEquals(pickPublicBusiness('', ['tenant_a', 'tenant_b']).ok, false);
});
