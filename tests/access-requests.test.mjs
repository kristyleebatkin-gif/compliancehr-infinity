// Backlog 16.09: Access Requests live in the Approval Inbox.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ACTION_PERMISSIONS, MANAGEMENT_ROLES } from '../src/lib/roleMatrix.js';

const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');

test('approval requests accept access requests and remember the roles involved', async () => {
  const schema = JSON.parse(await read('../base44/entities/ApprovalRequest.jsonc'));
  assert.deepEqual(schema.properties.record_type.enum, ['TodoTask', 'AccessRequest']);
  assert.ok(schema.properties.requested_role && schema.properties.current_role);
});

test('the page lets people ask, withdraw, and lets managers approve or decline with the right words', async () => {
  const page = await read('../src/pages/ApprovalInbox.jsx');
  assert.match(page, /action: 'request_access'/);
  assert.match(page, /action: 'withdraw'/);
  assert.match(page, /Decline access/);
  assert.match(page, /requestable_roles/, 'roles offered come from the server');
});

test('the Access explorer lists who decides access requests', () => {
  const entry = ACTION_PERMISSIONS.find((a) => a.key === 'decide-access-request');
  assert.ok(entry);
  assert.equal(entry.roles, MANAGEMENT_ROLES);
});
