// Backlog 17.06: the Access explorer must never disagree with the rules the app enforces.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  ALL_ROLES, LEGACY_ROLE_MAP, NAV_PERMISSIONS, RESTRICTED_EXECUTIVE_KEYS, FINANCIAL_KEYS,
  canAccessNav, explainNavAccess, TASK_APPROVER_ROLES, ACTION_PERMISSIONS, MANAGEMENT_ROLES,
} from '../src/lib/roleMatrix.js';

const ROLES = [...new Set([...ALL_ROLES, ...Object.keys(LEGACY_ROLE_MAP), 'admin', 'Volunteer', 'Made Up Role', '', null])];
const KEYS = [...new Set([...Object.keys(NAV_PERMISSIONS), ...RESTRICTED_EXECUTIVE_KEYS, ...FINANCIAL_KEYS, 'auditor-portal', 'no-such-module'])];

test('the explanation agrees with the enforced rule for every role and every module', () => {
  const mismatches = [];
  for (const role of ROLES) {
    for (const key of KEYS) {
      const e = explainNavAccess(role, key);
      if (e.allowed !== canAccessNav(role, key)) mismatches.push(`${role} / ${key}`);
      assert.ok(e.reason && e.reason.length > 5, `no reason for ${role} / ${key}`);
    }
  }
  assert.deepEqual(mismatches, []);
});

test('job roles that count as another role for page access say so', () => {
  const e = explainNavAccess('Human Resources Manager', 'human-resources');
  assert.equal(e.effectiveRole, 'Employee');
  assert.match(e.reason, /Human Resources Manager counts as Employee/);
  assert.match(explainNavAccess('Employee', 'users').reason, /Executive area/);
  assert.match(explainNavAccess('Auditor', 'tasks').reason, /Auditor Portal only/);
  assert.match(explainNavAccess('Administration', 'invoicing').reason, /Financial area/);
});

test('the actions table reads the same lists the server enforces', async () => {
  const byKey = Object.fromEntries(ACTION_PERMISSIONS.map((a) => [a.key, a.roles]));
  assert.equal(byKey['task-signoff'], TASK_APPROVER_ROLES);
  assert.equal(byKey['manage-access'], MANAGEMENT_ROLES);
  assert.deepEqual(byKey['all-businesses'], ['admin']);
  const approvals = await readFile(new URL('../base44/functions/approvals/entry.ts', import.meta.url), 'utf8');
  assert.match(approvals, /import \{ hasApprovedAccess, TASK_APPROVER_ROLES \} from '..\/..\/shared\/roleMatrix.ts'/);
  assert.doesNotMatch(approvals, /TASK_APPROVER_ROLES = \[/, 'the approver list must not be copied into the function');
  const rls = await readFile(new URL('../scripts/tenant-rls.mjs', import.meta.url), 'utf8');
  assert.match(rls, /OWNER = \{ user_condition: \{ role: 'admin' \} \}/, 'owner access in the data rules is the admin role');
});
