// Specialist roles (HR, Finance, Rostering, Quality, Intake, Marketing) keep Employee page access
// and also open the modules their job needs. Executive areas stay closed to them.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  SPECIALIST_NAV_EXTRAS, RESTRICTED_EXECUTIVE_KEYS, NAV_PERMISSIONS, canAccessNav, explainNavAccess,
} from '../src/lib/roleMatrix.js';

const EXPECTED = {
  'Human Resources Manager': ['staff', 'certificates', 'staff-progress'],
  'Finance & Accounts Officer': ['invoicing', 'quotes', 'insurance-finance', 'procurement', 'my-payroll'],
  'Rostering Coordinator': ['staff', 'participants', 'our-participants'],
  'Quality & Improvement Manager': ['quality', 'compliance', 'audit-centre', 'incident-analytics'],
  'Intake Officer': ['participants', 'crm'],
  'CRM & Marketing Officer': ['crm', 'projects'],
};

test('each specialist role opens the modules of its job', () => {
  for (const [role, keys] of Object.entries(EXPECTED)) {
    for (const key of keys) assert.equal(canAccessNav(role, key), true, `${role} / ${key}`);
  }
  assert.match(explainNavAccess('Finance & Accounts Officer', 'invoicing').reason, /Finance & Accounts Officer role's work/);
});

test('specialist roles still open everything an Employee opens', () => {
  for (const role of Object.keys(SPECIALIST_NAV_EXTRAS)) {
    for (const key of Object.keys(NAV_PERMISSIONS)) {
      if (canAccessNav('Employee', key)) assert.equal(canAccessNav(role, key), true, `${role} / ${key}`);
    }
  }
});

test('executive areas stay closed and no extra names an executive area or an unknown module', () => {
  for (const [role, keys] of Object.entries(SPECIALIST_NAV_EXTRAS)) {
    for (const key of RESTRICTED_EXECUTIVE_KEYS) assert.equal(canAccessNav(role, key), false, `${role} / ${key}`);
    for (const key of keys) {
      assert.ok(!RESTRICTED_EXECUTIVE_KEYS.includes(key), `${role} lists executive ${key}`);
      assert.ok(key in NAV_PERMISSIONS, `${role} lists unknown module ${key}`);
    }
  }
  // Plain employees gain nothing from this change.
  assert.equal(canAccessNav('Employee', 'invoicing'), false);
  assert.equal(canAccessNav('Employee', 'quality'), false);
});

test('pages check access with the person\'s actual role, not the Employee stand-in', async () => {
  const useRole = await readFile(new URL('../src/lib/useRole.js', import.meta.url), 'utf8');
  assert.match(useRole, /canAccessNav\(navRole, navKey\)/);
  for (const f of ['../src/components/AppLayout.jsx', '../src/pages/TodayDashboard.jsx']) {
    const src = await readFile(new URL(f, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /canAccessNav\(role,/, f);
  }
  const shared = await readFile(new URL('../base44/shared/roleMatrix.ts', import.meta.url), 'utf8');
  assert.match(shared, /SPECIALIST_NAV_EXTRAS/);
});
