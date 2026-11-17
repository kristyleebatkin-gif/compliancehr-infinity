import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  WORKSPACE_VIEW_STATES,
  BUILT_VIEW_STATES,
  LAYOUT_SECTIONS,
  LAYOUT_SECTION_KEYS,
  defaultWorkspaceLayout,
  layoutScopeKey,
  isLatestResponse,
  normaliseWorkspaceLayout,
  moveSection,
  setSectionVisible,
  describeLayout,
  diffLayouts,
  orderedSections,
} from '../src/lib/workspaceLayout.js';

const SHARED = readFileSync(new URL('../base44/shared/workspaceLayout.ts', import.meta.url), 'utf8');

test('client constants match the server workspace layout contract', () => {
  assert.equal(WORKSPACE_VIEW_STATES.length, 13);
  for (const state of WORKSPACE_VIEW_STATES) {
    assert.ok(SHARED.includes(`'${state}'`), `server is missing view state ${state}`);
  }
  for (const key of LAYOUT_SECTION_KEYS) {
    assert.ok(SHARED.includes(`key: '${key}'`), `server is missing section ${key}`);
  }
  for (const state of BUILT_VIEW_STATES) {
    assert.ok(SHARED.includes(`'${state}'`), `server is missing built view state ${state}`);
    assert.ok(WORKSPACE_VIEW_STATES.includes(state), 'a built view state must also be a supported state');
  }
});

test('default layout shows every block in the documented order', () => {
  const layout = defaultWorkspaceLayout();
  assert.equal(layout.viewState, 'Dashboard');
  assert.deepEqual(layout.sections.map((section) => section.key), ['insight', 'tiles', 'medium', 'supporting']);
  assert.ok(layout.sections.every((section) => section.visible));
});

test('a layout is rejected when its view state is not a supported workspace view', () => {
  const result = normaliseWorkspaceLayout({ ...defaultWorkspaceLayout(), viewState: 'Published' });
  assert.equal(result.ok, false);
  assert.equal(result.code, 'INVALID_VIEW_STATE');
});

test('a layout is rejected for an unknown, repeated or non-boolean section', () => {
  assert.equal(normaliseWorkspaceLayout({ viewState: 'Dashboard', sections: [{ key: 'kpi-ribbon', visible: true }] }).code, 'UNKNOWN_SECTION');
  assert.equal(normaliseWorkspaceLayout({ viewState: 'Dashboard', sections: [{ key: 'tiles', visible: true }, { key: 'tiles', visible: false }] }).code, 'DUPLICATE_SECTION');
  assert.equal(normaliseWorkspaceLayout({ viewState: 'Dashboard', sections: [{ key: 'tiles', visible: 'yes' }] }).code, 'INVALID_VISIBILITY');
  assert.equal(normaliseWorkspaceLayout({ viewState: 'Dashboard', sections: [] }).code, 'INVALID_LAYOUT');
  assert.equal(normaliseWorkspaceLayout(null).code, 'INVALID_LAYOUT');
});

test('a partial layout keeps the omitted blocks visible instead of silently hiding them', () => {
  const result = normaliseWorkspaceLayout({ viewState: 'Review', sections: [{ key: 'medium', visible: false }] });
  assert.equal(result.ok, true);
  assert.deepEqual(result.layout.sections, [
    { key: 'medium', visible: false },
    { key: 'insight', visible: true },
    { key: 'tiles', visible: true },
    { key: 'supporting', visible: true },
  ]);
});

test('moving a block reorders it and refuses to move past either end', () => {
  const layout = defaultWorkspaceLayout();
  const moved = moveSection(layout, 'medium', 'up');
  assert.deepEqual(moved.sections.map((section) => section.key), ['insight', 'medium', 'tiles', 'supporting']);
  assert.equal(moveSection(moved, 'insight', 'up'), moved, 'first block cannot move up');
  assert.equal(moveSection(moved, 'supporting', 'down'), moved, 'last block cannot move down');
  assert.equal(moveSection(moved, 'not-a-key', 'up'), moved, 'unknown block is ignored');
});

test('hiding a block is recorded and read back by the shell ordering', () => {
  const layout = setSectionVisible(defaultWorkspaceLayout(), 'tiles', false);
  const ordered = orderedSections(layout);
  assert.equal(ordered.find((section) => section.key === 'tiles').visible, false);
  assert.equal(describeLayout(layout).includes('hidden: Summary tiles'), true);
});

test('layout scope keys separate person, business, role and approval, and never use a display name', () => {
  const base = { id: 'u1', tenant_id: 't1', role: 'Administration', account_status: 'Active', full_name: 'A Person' };
  const first = layoutScopeKey(base);
  assert.ok(first.startsWith('chr-workspace-v1:'));
  assert.equal(first.includes('A Person'), false);
  assert.notEqual(first, layoutScopeKey({ ...base, id: 'u2' }));
  assert.notEqual(first, layoutScopeKey({ ...base, tenant_id: 't2' }));
  assert.notEqual(first, layoutScopeKey({ ...base, role: 'Management' }));
  assert.notEqual(first, layoutScopeKey({ ...base, access_approved: true }));
  assert.equal(layoutScopeKey({ id: 'u1' }), null, 'no business means no scope');
  assert.equal(layoutScopeKey(null), null);
});

test('a response for an older request or previous identity is discarded', () => {
  assert.equal(isLatestResponse(3, 3), true);
  assert.equal(isLatestResponse(2, 3), false);
  assert.equal(isLatestResponse(undefined, 3), false);
});

test('version compare lists view state, order and visibility changes only', () => {
  const before = defaultWorkspaceLayout('Dashboard');
  const after = setSectionVisible(moveSection({ ...before, viewState: 'History' }, 'medium', 'up'), 'tiles', false);
  const changes = diffLayouts(before, after);
  const fields = changes.map((change) => change.field);
  assert.deepEqual(fields, ['View state', 'Section order', 'Summary tiles']);
  assert.equal(diffLayouts(before, defaultWorkspaceLayout('Dashboard')).length, 0);
});