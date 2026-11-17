// Workspace OS — persisted workspace layout, view state and version history.
//
// One authority for what a workspace layout may contain, so the browser and the backend function
// cannot disagree about an accepted value. A layout is small and bounded: a chosen view state plus
// the order and visibility of the four shell blocks a module page actually renders.
//
// Deliberately NOT here: role/organisation layout sharing, approvals on layout changes, and
// cross-user layouts. Those need real enforced handlers and are recorded as open work.
import { canAccessNav, hasApprovedAccess, resolveUserTenantId, NAV_PERMISSIONS } from './roleMatrix.ts';

export const LAYOUT_SCHEMA_VERSION = 1;

// A view state is how a workspace is being looked at. It is separate from a record's lifecycle
// (Draft → Published → Archived) and separate from a stored version snapshot.
// BUILT_VIEW_STATES are the only states with a real screen in this app; the rest are persisted so a
// chosen state survives a reload, and the interface must say the view itself is not built.
export const WORKSPACE_VIEW_STATES = Object.freeze([
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
]);

export const BUILT_VIEW_STATES = Object.freeze([
  'Dashboard',
  'Selection',
  'History',
  'Version Compare',
]);

// The shell blocks a module page can show. 'supporting' groups the collapsible sections that always
// stay below the page's own content.
export const LAYOUT_SECTIONS = Object.freeze([
  { key: 'insight', label: 'Register insight' },
  { key: 'tiles', label: 'Summary tiles' },
  { key: 'medium', label: 'Detail panels' },
  { key: 'supporting', label: 'Supporting sections' },
]);

export const SECTION_KEYS = LAYOUT_SECTIONS.map((section: any) => section.key);
export const LAYOUT_SECTION_KEYS = SECTION_KEYS;
export const MAX_LAYOUT_BYTES = 2000;
export const MAX_NOTE = 200;
export const HISTORY_PAGE_SIZE = 10;

export type WorkspaceLayout = {
  schema: number;
  viewState: string;
  sections: { key: string; visible: boolean }[];
};

const MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: 'Sign in to use workspace layouts.',
  NOT_APPROVED: 'This account is not approved for workspace access yet.',
  NO_BUSINESS: 'This account is not linked to a business.',
  UNKNOWN_WORKSPACE: 'That workspace is not in the permission matrix, so no layout can be stored for it.',
  NO_PERMISSION: 'Your role cannot open that workspace.',
};

export function defaultLayout(viewState = 'Dashboard'): WorkspaceLayout {
  return {
    schema: LAYOUT_SCHEMA_VERSION,
    viewState,
    sections: LAYOUT_SECTIONS.map((section: any) => ({ key: section.key, visible: true })),
  };
}

export function canonicalLayout(layout: WorkspaceLayout) {
  return JSON.stringify({
    schema: LAYOUT_SCHEMA_VERSION,
    viewState: layout.viewState,
    sections: layout.sections.map((section) => ({ key: section.key, visible: section.visible })),
  });
}

// FNV-1a over the canonical form. Used to show that two stored versions differ, and to detect a
// stored row that no longer matches the version it points at.
export function layoutHash(layout: WorkspaceLayout) {
  const input = canonicalLayout(layout);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return 'fnv1a-' + hash.toString(16).padStart(8, '0');
}

export type LayoutResult = { ok: true; layout: WorkspaceLayout } | { ok: false; code: string; message: string };

export function normaliseLayout(input: any): LayoutResult {
  const reject = (code: string, message: string): LayoutResult => ({ ok: false, code, message });
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return reject('INVALID_LAYOUT', 'A workspace layout must be an object.');
  }
  const viewState = typeof input.viewState === 'string' ? input.viewState : '';
  if (!WORKSPACE_VIEW_STATES.includes(viewState)) {
    return reject('INVALID_VIEW_STATE', 'That view state is not one of the supported workspace views.');
  }
  const rawSections = Array.isArray(input.sections) ? input.sections : [];
  if (!rawSections.length) return reject('INVALID_LAYOUT', 'A layout needs at least one section.');
  if (rawSections.length > SECTION_KEYS.length) return reject('INVALID_LAYOUT', 'Too many sections for one workspace layout.');

  const seen: string[] = [];
  const kept: { key: string; visible: boolean }[] = [];
  for (const section of rawSections) {
    const key = typeof section?.key === 'string' ? section.key : '';
    if (!SECTION_KEYS.includes(key)) return reject('UNKNOWN_SECTION', 'A layout section is not one this shell renders.');
    if (seen.includes(key)) return reject('DUPLICATE_SECTION', 'A layout section appears twice.');
    if (typeof section?.visible !== 'boolean') return reject('INVALID_VISIBILITY', 'Each section needs a visible true or false.');
    seen.push(key);
    kept.push({ key, visible: section.visible });
  }
  // Sections the caller left out stay visible and keep their default position, so an older client
  // never silently hides part of a page.
  for (const key of SECTION_KEYS) {
    if (!seen.includes(key)) kept.push({ key, visible: true });
  }

  const layout: WorkspaceLayout = { schema: LAYOUT_SCHEMA_VERSION, viewState, sections: kept };
  if (canonicalLayout(layout).length > MAX_LAYOUT_BYTES) {
    return reject('LAYOUT_TOO_LARGE', 'That layout is larger than a workspace layout may be.');
  }
  return { ok: true, layout };
}

export function parseStoredLayout(value: unknown): WorkspaceLayout | null {
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    const result = normaliseLayout(parsed);
    return result.ok ? result.layout : null;
  } catch {
    return null;
  }
}

export function nextVersionNumber(current: unknown) {
  const value = Number(current);
  if (!Number.isFinite(value) || value < 0) return 1;
  return Math.floor(value) + 1;
}

export function sectionLabel(key: string) {
  const found = LAYOUT_SECTIONS.find((section: any) => section.key === key);
  return found ? found.label : key;
}

// Plain-language differences between two saved layouts, for the version compare view.
export function diffLayouts(before: WorkspaceLayout, after: WorkspaceLayout) {
  const changes: { field: string; from: string; to: string }[] = [];
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
  for (const key of SECTION_KEYS) {
    const was = before.sections.find((section) => section.key === key)?.visible;
    const now = after.sections.find((section) => section.key === key)?.visible;
    if (was !== now) {
      changes.push({
        field: sectionLabel(key),
        from: was ? 'shown' : 'hidden',
        to: now ? 'shown' : 'hidden',
      });
    }
  }
  return changes;
}

export type WorkspaceAccess =
  | { ok: true; tenantId: string; workspaceKey: string }
  | { ok: false; code: string; message: string };

// Server-side access for one workspace. Runs before any read or write: approved account, a business
// from the account record (never the request), a workspace that exists in the canonical permission
// matrix, and the canonical navigation permission for the caller's role.
export function workspaceAccess(user: any, workspaceKey: unknown): WorkspaceAccess {
  const deny = (code: string): WorkspaceAccess => ({ ok: false, code, message: MESSAGES[code] || 'Workspace access denied.' });
  if (!user?.id) return deny('NOT_AUTHENTICATED');
  if (!hasApprovedAccess(user)) return deny('NOT_APPROVED');
  const tenantId = resolveUserTenantId(user);
  if (!tenantId) return deny('NO_BUSINESS');
  const key = String(workspaceKey ?? '').trim();
  if (!key || !Object.hasOwn(NAV_PERMISSIONS, key)) return deny('UNKNOWN_WORKSPACE');
  if (!canAccessNav(user.role, key)) return deny('NO_PERMISSION');
  return { ok: true, tenantId, workspaceKey: key };
}