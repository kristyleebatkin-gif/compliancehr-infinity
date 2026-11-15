import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MODULE_DIRECTORY, NAV_GROUPS, buildNavigationGroups } from '../src/lib/moduleDirectory.js';
import { cleanModuleKeys, navigationScope, readNavigation, matchesModulePath } from '../src/lib/navigationPreferences.js';
import { navigationHome } from '../src/lib/navigationHome.js';
import { canAccessNav } from '../src/lib/roleMatrix.js';

test('every canonical module has exactly one group and a registered route', () => {
  const keys = MODULE_DIRECTORY.map((item) => item.key);
  assert.equal(new Set(keys).size, keys.length);
  const grouped = NAV_GROUPS.flatMap((item) => item.keys);
  assert.deepEqual([...grouped].sort(), [...keys].sort());
  const routes = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  for (const item of MODULE_DIRECTORY) {
    assert.ok(routes.includes('path="' + item.path + '"'), item.key + ' route missing');
    assert.equal(NAV_GROUPS.find((group) => group.keys.includes(item.key)).label, item.group);
  }
});
test('restricted directory cannot recover hidden children or expose empty groups', () => {
  const restricted = MODULE_DIRECTORY.filter((item) => ['tasks', 'my-profile'].includes(item.key));
  const groups = buildNavigationGroups(restricted);
  assert.equal(groups.length, 1);
  assert.deepEqual(groups[0].children.map((item) => item.key).sort(), ['my-profile', 'tasks']);
  assert.deepEqual(buildNavigationGroups([]), []);
});
test('saved shortcuts reject malformed, unknown, revoked and duplicate entries', () => {
  assert.deepEqual(cleanModuleKeys(['tasks', 'tasks', 'users', '/our-participants/private', null], ['tasks']), ['tasks']);
  assert.deepEqual(readNavigation({ getItem: () => 'not-json' }, 'scope', ['tasks']), { favourites: [], recent: [] });
  assert.deepEqual(readNavigation({ getItem: () => 'null' }, 'scope', ['tasks']), { favourites: [], recent: [] });
  assert.deepEqual(readNavigation({ getItem: () => JSON.stringify({ favourites: ['tasks', 'users'], recent: ['users'] }) }, 'scope', ['tasks']), { favourites: ['tasks'], recent: [] });
  assert.equal(cleanModuleKeys(Array.from({ length: 20 }, (_, index) => String(index)), Array.from({ length: 20 }, (_, index) => String(index))).length, 12);
});
test('shortcut namespaces separate both users and organisations and refuse incomplete identity', () => {
  const one = navigationScope({ id: 'one', tenant_id: 'A' });
  assert.notEqual(one, navigationScope({ id: 'two', tenant_id: 'A' }));
  assert.notEqual(one, navigationScope({ id: 'one', tenant_id: 'B' }));
  assert.equal(navigationScope({ id: 'one' }), null);
  assert.equal(navigationScope({ tenant_id: 'A' }), null);
});
test('active module matching respects path boundaries', () => {
  assert.equal(matchesModulePath('/incidents/123', '/incidents'), true);
  assert.equal(matchesModulePath('/incident-analytics', '/incidents'), false);
  assert.equal(matchesModulePath('/tasks-old', '/tasks'), false);
});
test('role homes use existing permissions and pending accounts remain gated', () => {
  const approved = (role) => ({ role, account_status: 'Active', access_approved: true });
  assert.equal(navigationHome(approved('Participant')), '/my-profile');
  assert.equal(navigationHome(approved('Auditor')), '/auditor-portal');
  assert.equal(navigationHome(approved('Administration')), '/today');
  assert.equal(navigationHome(approved('Team Leader')), '/team-leader');
  assert.equal(navigationHome({ ...approved('Administration'), access_approved: false }), '/dashboard');
  assert.equal(navigationHome(null), '/dashboard');
  for (const role of ['Provider Administrator', 'Management', 'Employee', 'Finance & Accounts Officer', 'Human Resources Manager', 'Rostering Coordinator', 'Quality & Improvement Manager', 'CRM & Marketing Officer', 'Intake Officer']) {
    const path = navigationHome(approved(role));
    const module = MODULE_DIRECTORY.find((item) => item.path === path);
    assert.ok(module && canAccessNav(role, module.key), role + ' home must be permitted');
  }
});
