import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import * as frontend from '../src/lib/roles.js';

// This helper currently contains plain JavaScript in a .ts file. Import its
// exact source without loading any Base44 client or contacting production.
const backendSource = await readFile(new URL('../base44/shared/appAccess.ts', import.meta.url), 'utf8');
const backend = await import(`data:text/javascript;base64,${Buffer.from(backendSource).toString('base64')}`);

test('frontend and backend never enable an access bypass', () => {
  assert.equal(frontend.isOpenAccessWindowActive(), false);
  assert.equal(backend.isOpenAccessWindowActive(), false);
});

test('unapproved and inactive users are refused consistently', () => {
  const users = [null, undefined, {},
    { role: 'Employee', account_status: 'Pending', access_approved: false },
    { role: 'Employee', account_status: 'Active', access_approved: false },
    { role: 'Unknown', account_status: 'Active', access_approved: true },
  ];
  for (const role of ['admin', 'Provider Administrator', 'Management', 'Employee', 'Participant']) {
    for (const account_status of ['Suspended', 'Rejected', 'Archived']) {
      users.push({ role, account_status, access_approved: true });
    }
  }
  for (const user of users) {
    assert.equal(frontend.hasApprovedAccess(user), false, JSON.stringify(user));
    assert.equal(backend.hasApprovedAccess(user), false, JSON.stringify(user));
  }
});

test('active approved roles retain frontend and backend access', () => {
  for (const role of [...frontend.ALL_ROLES, 'admin', 'Support Worker', 'Team Leader', 'Human Resources Manager']) {
    const user = { role, account_status: 'Active', access_approved: true };
    assert.equal(frontend.hasApprovedAccess(user), true, role);
    assert.equal(backend.hasApprovedAccess(user), true, role);
  }
});

test('missing and low-trust roles do not gain administrator privileges', () => {
  assert.equal(frontend.normalizeRole(undefined), frontend.ROLES.PENDING_APPROVAL);
  for (const role of [undefined, 'Unknown', 'Employee', 'Participant', 'Volunteer', 'Auditor']) {
    assert.equal(frontend.isAdmin(role), false, String(role));
    assert.equal(frontend.isCompliance(role), false, String(role));
    for (const key of ['users', 'company-safe', 'operations-centre', 'analytics']) {
      assert.equal(frontend.canAccessNav(role, key), false, `${role}: ${key}`);
    }
  }
});

test('role navigation keeps approved allowed and denied paths', () => {
  assert.equal(frontend.canAccessNav('Employee', 'my-profile'), true);
  assert.equal(frontend.canAccessNav('Participant', 'my-profile'), true);
  assert.equal(frontend.canAccessNav('Auditor', 'auditor-portal'), true);
  assert.equal(frontend.canAccessNav('Auditor', 'communications'), false);
  assert.equal(frontend.canAccessNav('Administration', 'invoicing'), false);
  assert.equal(frontend.canAccessNav('Provider Administrator', 'users'), true);
});
