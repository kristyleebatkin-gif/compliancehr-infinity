import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { createStudioRepository } from '../src/components/today/studio/studioPersistence.js';
import { sanitizeStudioHtml } from '../src/components/today/studio/studioSecurity.js';

const dom = new JSDOM('');
globalThis.DOMParser = dom.window.DOMParser;

function fixture() {
  let context = { tenantId: 'business-a', user: { id: 'person-a', account_status: 'Active', access_approved: true } };
  const calls = [];
  let stored = { id: 'saved', tenant_id: 'business-a', created_by_id: 'person-a', kind: 'document', title: 'Draft', payload: '{"html":"<p>Saved</p>"}', archived: false };
  const entity = {
    filter: async (filter) => { calls.push(['filter', filter]); return { items: [stored] }; },
    create: async (data) => { calls.push(['create', data]); stored = { id: 'new', ...data }; return stored; },
    update: async (id, patch) => { calls.push(['update', id, patch]); stored = { ...stored, ...patch }; return stored; },
    delete: async () => { throw new Error('Hard deletion must never occur'); }
  };
  return { entity, calls, get stored() { return stored; }, setStored: row => { stored = row; },
    setContext: value => { context = value; }, repository: createStudioRepository({ entities: { StudioItem: entity } }, () => context) };
}

test('studio denies missing or unapproved identity before querying', async () => {
  for (const context of [null, { user: { id: 'p' } }, { tenantId: 't', user: { id: 'p', account_status: 'Suspended', access_approved: true } }]) {
    const f = fixture(); f.setContext(context);
    await assert.rejects(f.repository.list('document'), /approved account/);
    assert.equal(f.calls.length, 0);
  }
});

test('studio scopes lists to owner/business and accepts SDK array responses', async () => {
  const f = fixture();
  f.entity.filter = async filter => { f.calls.push(['filter', filter]); return [f.stored]; };
  const rows = await f.repository.list('document');
  assert.equal(rows[0].title, 'Draft');
  assert.deepEqual(f.calls[0][1], { tenant_id: 'business-a', created_by_id: 'person-a', kind: 'document', archived: false });
});

test('studio refuses cross-business/owner data and malformed SDK responses', async () => {
  for (const patch of [{ tenant_id: 'business-b' }, { created_by_id: 'person-b' }]) {
    const f = fixture(); f.setStored({ ...f.stored, ...patch });
    await assert.rejects(f.repository.list('document'), /outside your personal business scope/);
  }
  const f = fixture(); f.entity.filter = async () => ({ unexpected: [] });
  await assert.rejects(f.repository.list('document'), /invalid response/);
});

test('studio drops late results after identity/business change', async () => {
  const f = fixture();
  f.entity.filter = async () => {
    f.setContext({ tenantId: 'business-b', user: { id: 'person-a', account_status: 'Active', access_approved: true } });
    return [f.stored];
  };
  await assert.rejects(f.repository.list('document'), /account or business changed/);
});

test('studio creation stamps scope and rejects caller overrides', async () => {
  const f = fixture();
  await assert.rejects(f.repository.create('document', 'Draft', {}, { tenant_id: 'business-b' }), /Unsupported/);
  assert.equal(f.calls.length, 0);
  await f.repository.create('document', 'Draft', { html: '<p onclick="bad()">Safe</p><script>bad()</script>' });
  assert.equal(f.stored.tenant_id, 'business-a');
  assert.equal(f.stored.created_by_id, 'person-a');
  assert.equal(JSON.parse(f.stored.payload).html, '<p>Safe</p>');
  assert.equal(f.stored.retention_until, undefined);
});

test('studio checks ownership before updating and archives without deletion', async () => {
  const f = fixture();
  await f.repository.archive('saved');
  assert.equal(f.stored.archived, true);
  assert.deepEqual(f.calls[1], ['update', 'saved', { archived: true }]);
  const other = fixture(); other.setStored({ ...other.stored, created_by_id: 'other' });
  await assert.rejects(other.repository.update('saved', { title: 'Overwrite', payload: {} }), /outside/);
  assert.equal(other.calls.filter(call => call[0] === 'update').length, 0);
});

test('studio refuses silent truncation and corrupt saved payloads', async () => {
  const f = fixture(); f.entity.filter = async () => Array.from({ length: 200 }, () => f.stored);
  await assert.rejects(f.repository.list('document'), /display limit/);
  const corrupt = fixture(); corrupt.setStored({ ...corrupt.stored, payload: '{broken' });
  await assert.rejects(corrupt.repository.list('document'), /unreadable/);
});

test('studio HTML retains formatting while stripping active content and remote resources', () => {
  const result = sanitizeStudioHtml('<h1 style="background:url(https://example.test)">Title</h1><p onclick="x()">Text <strong>bold</strong><a href="javascript:x()">link</a></p><img src="https://example.test/pixel"><iframe srcdoc="evil"></iframe><svg onload="x()"></svg><script>x()</script>');
  assert.equal(result, '<h1>Title</h1><p>Text <strong>bold</strong>link</p>');
});

test('studio schema restricts even administrators to approved same-owner same-business records', () => {
  const schema = JSON.parse(fs.readFileSync(new URL('../base44/entities/StudioItem.jsonc', import.meta.url), 'utf8'));
  const evaluate = (rule, user, row) => {
    if (rule.$and) return rule.$and.every(r => evaluate(r, user, row));
    if (rule.$or) return rule.$or.some(r => evaluate(r, user, row));
    return Object.entries(rule).every(([key, value]) => {
      if (key === 'user_condition') return Object.entries(value).every(([k,v]) => user[k] === v);
      if (key === 'created_by_id') return row.created_by_id === user.id;
      if (key === 'data.tenant_id') return row.tenant_id === user.data.tenant_id && Boolean(row.tenant_id);
      throw new Error('Unmodelled rule: ' + key);
    });
  };
  const owner = { id: 'person-a', role: 'admin', account_status: 'Active', access_approved: true, data: { tenant_id: 'business-a' } };
  const row = { created_by_id: 'person-a', tenant_id: 'business-a' };
  for (const op of ['read','create','update']) {
    assert.equal(evaluate(schema.rls[op], owner, row), true);
    assert.equal(evaluate(schema.rls[op], { ...owner, id: 'other' }, row), false);
    assert.equal(evaluate(schema.rls[op], { ...owner, data: { tenant_id: 'business-b' } }, row), false);
    assert.equal(evaluate(schema.rls[op], { ...owner, access_approved: false }, row), false);
  }
  assert.equal(evaluate(schema.rls.delete, owner, row), false);
});
