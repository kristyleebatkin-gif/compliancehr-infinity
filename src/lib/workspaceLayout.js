// Client-side view of the workspace layout contract.
// The server (base44/shared/workspaceLayout.ts) is the authority; this file mirrors the accepted
// values so the shell can render and validate before saving, and is checked against the server copy
// by tests/workspace-layout.test.mjs.

export const WORKSPACE_VIEW_STATES = [
  'Dashboard',
  'Selection',
  'Review',
  'Investigation',
  'Evidence Analysis',
  'AI Analysis',
  'Workflow Action',
  'Approval',
  'Reporting',
  'History',
  'Version Compare',
  'Design Mode',
  'Archived',
];

// Only these states have a screen in this app. The rest are recorded so a choice survives a reload.
export const BUILT_VIEW_STATES = ['Dashboard', 'Selection', 'History', 'Version Compare'];

export const LAYOUT_SECTIONS = [
  { key: 'insight', label: 'Register insight' },
  { key: 'tiles', label: 'Summary tiles' },
  { key: 'medium', label: 'Detail panels' },
  { key: 'supporting', label: 'Supporting sections' },
];

export const LAYOUT_SECTION_KEYS = LAYOUT_SECTIONS.map((section) => section.key);

export function defaultWorkspaceLayout(viewState = 'Dashboard') {
  return {
    schema: 1,
    viewState,
    sections: LAYOUT_SECTIONS.map((section) => ({ key: section.key, visible: true })),
  };
}

// Cache/scope key for one person in one business with one role. A changed identity can never read
// the previous identity's layout, and a layout is never stored against a name alone.
export function layoutScopeKey(user) {
  const tenant = user?.tenant_id || user?.data?.tenant_id;
  if (!user?.id || !tenant) return null;
  const role = user.role || '';
  const status = user.account_status || user.data?.account_status || '';
  const approved = user.access_approved === true || user.data?.access_approved === true ? '1' : '0';
  return ['chr-workspace-v1', tenant, user.id, role, status, approved]
    .map((part) => encodeURIComponent(String(part)))
    .join(':');
}

// A response is applied only if it belongs to the newest request for the current identity.
export function isLatestResponse(requestId, latestRequestId) {
  return Number.isFinite(requestId) && requestId === latestRequestId;
}

export function isBuiltViewState(viewState) {
  return BUILT_VIEW_STATES.includes(viewState);
}

export function normaliseWorkspaceLayout(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return { ok: false, code: 'INVALID_LAYOUT', message: 'A workspace layout must be an object.' };
  }
  if (!WORKSPACE_VIEW_STATES.includes(input.viewState)) {
    return { ok: false, code: 'INVALID_VIEW_STATE', message: 'That view state is not supported.' };
  }
  const raw = Array.isArray(input.sections) ? input.sections : [];
  if (!raw.length) return { ok: false, code: 'INVALID_LAYOUT', message: 'A layout needs at least one section.' };
  const seen = [];
  const sections = [];
  for (const section of raw) {
    const key = typeof section?.key === 'string' ? section.key : '';
    if (!LAYOUT_SECTION_KEYS.includes(key)) {
      return { ok: false, code: 'UNKNOWN_SECTION', message: 'A layout section is not one this shell renders.' };
    }
    if (seen.includes(key)) return { ok: false, code: 'DUPLICATE_SECTION', message: 'A layout section appears twice.' };
    if (typeof section?.visible !== 'boolean') {
      return { ok: false, code: 'INVALID_VISIBILITY', message: 'Each section needs visible true or false.' };
    }
    seen.push(key);
    sections.push({ key, visible: section.visible });
  }
  for (const key of LAYOUT_SECTION_KEYS) {
    if (!seen.includes(key)) sections.push({ key, visible: true });
  }
  return { ok: true, layout: { schema: 1, viewState: input.viewState, sections } };
}

export function moveSection(layout, key, direction) {
  const sections = [...(layout?.sections || [])];
  const index = sections.findIndex((section) => section.key === key);
  const target = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= sections.length) return layout;
  const [moved] = sections.splice(index, 1);
  sections.splice(target, 0, moved);
  return { ...layout, sections };
}

export function setSectionVisible(layout, key, visible) {
  return {
    ...layout,
    sections: (layout?.sections || []).map((section) => (section.key === key ? { ...section, visible: Boolean(visible) } : section)),
  };
}

export function sectionLabel(key) {
  const found = LAYOUT_SECTIONS.find((section) => section.key === key);
  return found ? found.label : key;
}

export function describeLayout(layout) {
  if (!layout) return 'No layout saved';
  const hidden = layout.sections.filter((section) => !section.visible).map((section) => sectionLabel(section.key));
  const order = layout.sections.map((section) => sectionLabel(section.key)).join(' → ');
  return `${layout.viewState} · ${hidden.length ? `hidden: ${hidden.join(', ')}` : 'all blocks shown'} · ${order}`;
}

export function diffLayouts(before, after) {
  const changes = [];
  if (!before || !after) return changes;
  if (before.viewState !== after.viewState) {
    changes.push({ field: 'View state', from: before.viewState, to: after.viewState });
  }
  const beforeOrder = before.sections.map((section) => section.key);
  const afterOrder = after.sections.map((section) => section.key);
  if (beforeOrder.join('|') !== afterOrder.join('|')) {
    changes.push({
      field: 'Section order',
      from: beforeOrder.map(sectionLabel).join(' → '),
      to: afterOrder.map(sectionLabel).join(' → '),
    });
  }
  for (const key of LAYOUT_SECTION_KEYS) {
    const was = before.sections.find((section) => section.key === key)?.visible;
    const now = after.sections.find((section) => section.key === key)?.visible;
    if (was !== now) {
      changes.push({ field: sectionLabel(key), from: was ? 'shown' : 'hidden', to: now ? 'shown' : 'hidden' });
    }
  }
  return changes;
}

// Applies a saved layout to the blocks a page can render: order first, then visibility.
export function orderedSections(layout) {
  if (!layout) return LAYOUT_SECTIONS.map((section) => ({ ...section, visible: true }));
  const ordered = layout.sections.map((section) => ({ key: section.key, label: sectionLabel(section.key), visible: section.visible }));
  for (const section of LAYOUT_SECTIONS) {
    if (!ordered.some((entry) => entry.key === section.key)) ordered.push({ ...section, visible: true });
  }
  return ordered;
}