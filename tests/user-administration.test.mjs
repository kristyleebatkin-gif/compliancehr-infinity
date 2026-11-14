// Backlog 17.07: the User Administration screen and the records it keeps in step.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ASSIGNABLE_ROLES, SENIOR_ROLES, canGrantRole, SPECIALIST_NAV_EXTRAS } from '../src/lib/roleMatrix.js';

const read = (p) => readFile(new URL(p, import.meta.url), 'utf8');

test('every role that can be given out is one a business membership accepts', async () => {
  const membership = JSON.parse(await read('../base44/entities/TenantMembership.jsonc'));
  const allowed = membership.properties.membership_role.enum;
  assert.equal(membership.properties.membership_role.enumColors.length, allowed.length);
  for (const role of ASSIGNABLE_ROLES) assert.ok(allowed.includes(role), role);
  for (const role of Object.keys(SPECIALIST_NAV_EXTRAS)) assert.ok(ASSIGNABLE_ROLES.includes(role), role);
});

test('only the owner or a Provider Administrator can give a senior role', () => {
  for (const role of SENIOR_ROLES) {
    assert.equal(canGrantRole('admin', role), true);
    assert.equal(canGrantRole('Provider Administrator', role), true);
    assert.equal(canGrantRole('Management', role), false);
  }
  assert.equal(canGrantRole('Management', 'Employee'), true);
  assert.equal(canGrantRole('admin', 'admin'), false, 'nobody can be made owner here');
  assert.equal(canGrantRole('admin', 'Made Up'), false);
});

test('invitations are business records that only the server function reads or writes', async () => {
  const inv = JSON.parse(await read('../base44/entities/AccountInvitation.jsonc'));
  for (const op of ['read', 'create', 'update', 'delete']) {
    assert.match(JSON.stringify(inv.rls[op]), /__service_role_only__/, op);
  }
  for (const f of ['../base44/shared/tenantClassification.ts', '../src/lib/tenantClassification.js']) {
    assert.match(await read(f), /'AccountInvitation'/, f);
  }
});

test('the screen sends its own business, offers only roles the server says it can give, and confirms suspensions', async () => {
  assert.match(await read('../src/components/users/useAppUsers.js'), /tenant_id \? \{ \.\.\.body, tenant_id \}/);
  const table = await read('../src/components/users/UsersTable.jsx');
  assert.match(table, /grantable_roles/);
  const row = await read('../src/components/users/AppUserAccessRow.jsx');
  assert.match(row, /Confirm suspend/);
  assert.match(row, /run\('reactivate'/);
  assert.doesNotMatch(row, /ALL_ROLES/, 'roles come from the server, not a fixed list');
});
