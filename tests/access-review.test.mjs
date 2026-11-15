// Backlog 16.12: Periodic Access Review records and screen.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ACTION_PERMISSIONS, MANAGEMENT_ROLES } from '../src/lib/roleMatrix.js';

const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');

test('access reviews are business records only the server function reads or writes', async () => {
  const schema = JSON.parse(await read('../base44/entities/AccessReview.jsonc'));
  for (const op of ['read', 'create', 'update', 'delete']) assert.match(JSON.stringify(schema.rls[op]), /__service_role_only__/, op);
  for (const f of ['../base44/shared/tenantClassification.ts', '../src/lib/tenantClassification.js']) assert.match(await read(f), /'AccessReview'/, f);
});

test('the Users & Permissions page shows access reviews, and decisions go through the server', async () => {
  assert.match(await read('../src/pages/UsersPermissionsHub.jsx'), /<AccessReviewPanel \/>/);
  const panel = await read('../src/components/users/AccessReviewPanel.jsx');
  assert.match(panel, /invoke\('accessReview'/);
  assert.match(panel, /Someone else must review your own access/);
  assert.doesNotMatch(panel, /entities\.(User|AccessReview)\./, 'no direct record edits from the browser');
});

test('the Access explorer lists who runs access reviews', () => {
  const entry = ACTION_PERMISSIONS.find((a) => a.key === 'access-review');
  assert.ok(entry);
  assert.equal(entry.roles, MANAGEMENT_ROLES);
});
