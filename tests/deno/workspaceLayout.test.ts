import { assertEquals, assertThrows } from 'jsr:@std/assert@1';
import {
  WORKSPACE_VIEW_STATES,
  BUILT_VIEW_STATES,
  LAYOUT_SECTION_KEYS,
  defaultLayout,
  canonicalLayout,
  layoutHash,
  normaliseLayout,
  parseStoredLayout,
  nextVersionNumber,
  diffLayouts,
  workspaceAccess,
} from '../../base44/shared/workspaceLayout.ts';

const admin = { id: 'u-1', tenant_id: 't-1', role: 'Provider Administrator', account_status: 'Active', access_approved: true };

Deno.test('view states and sections stay within the documented contract', () => {
  assertEquals(WORKSPACE_VIEW_STATES.length, 13);
  assertEquals(LAYOUT_SECTION_KEYS, ['insight', 'tiles', 'medium', 'supporting']);
  assertEquals(BUILT_VIEW_STATES.every((state) => WORKSPACE_VIEW_STATES.includes(state)), true);
});

Deno.test('default layout is canonical, hashed and stable', () => {
  const layout = defaultLayout();
  const canonical = canonicalLayout(layout);
  assertEquals(JSON.parse(canonical).sections, layout.sections);
  assertEquals(parseStoredLayout(canonical), layout);
  const edited = { ...layout, viewState: 'History', sections: [...layout.sections].reverse().map((section) => ({ ...section, visible: false })) };
  assertEquals(parseStoredLayout(canonicalLayout(edited)), edited);
  assertEquals(layoutHash(layout), layoutHash(defaultLayout()));
  assertEquals(layoutHash(layout).startsWith('fnv1a-'), true);
});

Deno.test('layout hash changes when the view state or a block changes', () => {
  const base = defaultLayout();
  const differentView = { ...base, viewState: 'History' };
  const hidden = { ...base, sections: base.sections.map((s: any) => (s.key === 'tiles' ? { ...s, visible: false } : s)) };
  if (layoutHash(base) === layoutHash(differentView)) throw new Error('view state must change the hash');
  if (layoutHash(base) === layoutHash(hidden)) throw new Error('visibility must change the hash');
});

Deno.test('a layout is rejected when its view state is not supported', () => {
  const result = normaliseLayout({ ...defaultLayout(), viewState: 'Published' });
  assertEquals(result.ok, false);
  if (result.ok) throw new Error('unreachable');
  assertEquals(result.code, 'INVALID_VIEW_STATE');
});

Deno.test('unknown, repeated and non-boolean sections are rejected', () => {
  const codes = [
    normaliseLayout({ viewState: 'Dashboard', sections: [{ key: 'kpi', visible: true }] }),
    normaliseLayout({ viewState: 'Dashboard', sections: [{ key: 'tiles', visible: true }, { key: 'tiles', visible: true }] }),
    normaliseLayout({ viewState: 'Dashboard', sections: [{ key: 'tiles', visible: 'true' }] }),
    normaliseLayout({ viewState: 'Dashboard', sections: [] }),
    normaliseLayout('nonsense'),
  ].map((result) => (result.ok ? 'OK' : result.code));
  assertEquals(codes, ['UNKNOWN_SECTION', 'DUPLICATE_SECTION', 'INVALID_VISIBILITY', 'INVALID_LAYOUT', 'INVALID_LAYOUT']);
});

Deno.test('older clients that omit a section never hide it', () => {
  const result = normaliseLayout({ viewState: 'Dashboard', sections: [{ key: 'tiles', visible: false }] });
  if (!result.ok) throw new Error(result.message);
  assertEquals(result.layout.sections.map((s: any) => [s.key, s.visible]), [
    ['tiles', false],
    ['insight', true],
    ['medium', true],
    ['supporting', true],
  ]);
});

Deno.test('a stored layout that cannot be read is refused instead of guessed', () => {
  assertEquals(parseStoredLayout('{ not json'), null);
  assertEquals(parseStoredLayout(JSON.stringify({ viewState: 'Invented', sections: [] })), null);
  const good = JSON.stringify(defaultLayout());
  assertEquals(parseStoredLayout(good)?.viewState, 'Dashboard');
});

Deno.test('version numbers only ever move forward', () => {
  assertEquals(nextVersionNumber(undefined), 1);
  assertEquals(nextVersionNumber(null), 1);
  assertEquals(nextVersionNumber('nope'), 1);
  assertEquals(nextVersionNumber(-3), 1);
  assertEquals(nextVersionNumber(0), 1);
  assertEquals(nextVersionNumber(7), 8);
  assertEquals(nextVersionNumber(7.8), 8);
});

Deno.test('version compare reports order, visibility and view changes', () => {
  const before = defaultLayout();
  const after = {
    ...before,
    viewState: 'Version Compare',
    sections: [{ key: 'medium', visible: true }, { key: 'insight', visible: false }, { key: 'tiles', visible: true }, { key: 'supporting', visible: true }],
  };
  const changes = diffLayouts(before, after);
  assertEquals(changes.map((change) => change.field), ['View state', 'Section order', 'Register insight']);
  assertEquals(diffLayouts(before, defaultLayout()).length, 0);
});

Deno.test('workspace access refuses before any record is touched', () => {
  const code = (user: any, key: any) => {
    const result = workspaceAccess(user, key);
    return result.ok ? 'OK' : result.code;
  };
  assertEquals(code(null, 'compliance'), 'NOT_AUTHENTICATED');
  assertEquals(code({ ...admin, account_status: 'Pending Approval' }, 'compliance'), 'NOT_APPROVED');
  assertEquals(code({ ...admin, access_approved: false }, 'compliance'), 'NOT_APPROVED');
  assertEquals(code({ ...admin, tenant_id: undefined }, 'compliance'), 'NO_BUSINESS');
  assertEquals(code(admin, ''), 'UNKNOWN_WORKSPACE');
  assertEquals(code(admin, 'not-a-real-module'), 'UNKNOWN_WORKSPACE');
  assertEquals(code({ ...admin, role: 'Employee' }, 'compliance'), 'NO_PERMISSION');
  assertEquals(code({ ...admin, role: 'Participant' }, 'users'), 'NO_PERMISSION');
  assertEquals(code({ ...admin, role: 'Auditor' }, 'compliance'), 'NO_PERMISSION');
});

Deno.test('workspace access returns the caller business, never a requested one', () => {
  const allowed = workspaceAccess(admin, 'compliance');
  if (!allowed.ok) throw new Error(allowed.message);
  assertEquals(allowed.tenantId, 't-1');
  assertEquals(allowed.workspaceKey, 'compliance');

  // A caller-supplied business cannot change the resolved scope: the user record decides it.
  const spoofed = workspaceAccess({ ...admin, requested_tenant_id: 't-2' }, 'compliance');
  if (!spoofed.ok) throw new Error(spoofed.message);
  assertEquals(spoofed.tenantId, 't-1');

  const trimmed = workspaceAccess(admin, '  compliance  ');
  if (!trimmed.ok) throw new Error(trimmed.message);
  assertEquals(trimmed.workspaceKey, 'compliance');
});

Deno.test('tenant resolution errors are not converted into access', () => {
  // resolveUserTenantId throws for an unapproved account; workspaceAccess must deny first.
  assertEquals(workspaceAccess({ id: 'u-2', tenant_id: 't-1', role: 'Archived', account_status: 'Active', access_approved: true }, 'compliance').ok, false);
  assertThrows(() => {
    const result = workspaceAccess({ id: 'u-3' }, 'compliance');
    if (!result.ok) throw new Error(result.code);
  });
});