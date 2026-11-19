// AI audit trail: every governed model call leaves one AiInteraction record, and logging never breaks the feature.
import { assert, assertEquals, assertRejects } from 'jsr:@std/assert@1';
import { loggedInvokeLLM } from '../../base44/shared/aiAudit.ts';

function fakeClient(llm: () => Promise<any>, failAudit = false) {
  const records: any[] = [];
  return {
    records,
    integrations: { Core: { InvokeLLM: llm } },
    entities: { AiInteraction: { create: async (r: any) => { if (failAudit) throw new Error('down'); records.push(r); return r; } } },
  };
}
const user = { id: 'u1', email: 'sherelle@example.com', tenant_id: 'tenant_choices' };

Deno.test('successful call is returned and logged with tenant, user and summary', async () => {
  const c = fakeClient(async () => ({ answer: 'Draft reply' }));
  const out = await loggedInvokeLLM(c, { feature: 'composeAssist', user }, { prompt: 'Write a reply' });
  assertEquals(out, { answer: 'Draft reply' });
  assertEquals(c.records.length, 1);
  const r = c.records[0];
  assertEquals(r.tenant_id, 'tenant_choices');
  assertEquals(r.agent_name, 'composeAssist');
  assertEquals(r.user_email, 'sherelle@example.com');
  assertEquals(r.question, 'Write a reply');
  assertEquals(r.state, 'Completed');
  assert(r.response_summary.includes('Draft reply'));
});

Deno.test('failed call is still logged as Failed and the error is passed on', async () => {
  const c = fakeClient(async () => { throw new Error('model unavailable'); });
  await assertRejects(() => loggedInvokeLLM(c, { feature: 'incidentTriage', user }, { prompt: 'x' }), Error, 'model unavailable');
  assertEquals(c.records[0].state, 'Failed');
  assertEquals(c.records[0].error_code, 'LLM_CALL_FAILED');
});

Deno.test('a broken audit write never breaks the feature', async () => {
  const c = fakeClient(async () => 'ok', true);
  assertEquals(await loggedInvokeLLM(c, { feature: 'translateText', user }, { prompt: 'hi' }), 'ok');
});

Deno.test('system call with no user is logged as system without a tenant', async () => {
  const c = fakeClient(async () => 'ok');
  await loggedInvokeLLM(c, { feature: 'regulatorNewsFeed' }, { prompt: 'news' });
  assertEquals(c.records[0].user_email, 'system');
  assertEquals('tenant_id' in c.records[0], false);
});
