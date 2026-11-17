// Workspace OS — persisted workspace layout, view state and version history.
//
// What this function really does:
//   load     one person's saved layout for one workspace in their own business
//   save     appends an immutable version snapshot, then points the live row at it
//   history  bounded, paged list of that person's saved versions for the workspace
//   restore  writes a NEW version from an older snapshot (history is never edited)
//   reset    writes the default layout as a new version
//
// Everything is decided before a record is touched: approved account, business from the account
// record (never the request), workspace present in the canonical permission matrix, and the
// canonical navigation permission for the caller's role. Browser writes to both entities are denied
// by service-role-only RLS, so this function is the only write path.
//
// Honest limits: the version check is a read-then-write, not an atomic compare-and-swap, so two
// saves at the same moment can still collide. An uncertain write retains its snapshot for
// reconciliation and never promises safe retries. This is not a transaction.
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import {
  workspaceAccess,
  normaliseLayout,
  parseStoredLayout,
  defaultLayout,
  layoutHash,
  nextVersionNumber,
  canonicalLayout,
  HISTORY_PAGE_SIZE,
  MAX_NOTE,
} from '../../shared/workspaceLayout.ts';

const MAX_TEXT = 140;

function text(value: unknown, limit = MAX_TEXT) {
  return String(value ?? '').trim().slice(0, limit);
}

function ok(data: any, warnings: string[] = []) {
  return Response.json({
    success: true,
    data,
    errors: [],
    warnings,
    metadata: { at: new Date().toISOString() },
  });
}

function fail(errorCode: string, message: string, status: number, correlationId: string, data: any = null) {
  return Response.json({
    success: false,
    data,
    errors: [{ errorCode, message, correlationId }],
    warnings: [],
    metadata: { at: new Date().toISOString() },
  }, { status });
}

function rowsOf(page: any): any[] | null {
  const rows = Array.isArray(page) ? page : page?.items;
  return Array.isArray(rows) ? rows : null;
}

export default perBusiness(async function (req: Request) {
  const correlationId = crypto.randomUUID();
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    const body = await req.json().catch(() => ({}));
    const action = text(body.action, 24) || 'load';

    const access = workspaceAccess(user, body.workspace_key);
    if (!access.ok) {
      const status = access.code === 'UNKNOWN_WORKSPACE' ? 400 : access.code === 'NOT_AUTHENTICATED' ? 401 : 403;
      return fail(access.code, access.message, status, correlationId);
    }
    const { tenantId, workspaceKey } = access;
    const read = base44.entities;
    const write = base44.asServiceRole.entities;
    const userId = String(user.id);
    const actor = text(user.full_name || user.email || 'Unknown user');

    async function currentPreference() {
      // Positional SDK form: a plain array, with the business applied by the scoped client.
      const page = await read.WorkspacePreference.filter(
        { tenant_id: tenantId, user_id: userId, workspace_key: workspaceKey },
        '-saved_at',
        1,
        0,
      );
      const rows = rowsOf(page);
      if (rows === null) {
        const error: any = new Error('The saved workspace layout could not be read.');
        error.status = 502;
        throw error;
      }
      const row = rows[0];
      if (!row) return null;
      // The scoped client already filters by business; this refuses an untagged or foreign row
      // rather than treating it as this person's layout.
      if (row.tenant_id !== tenantId || row.user_id !== userId || row.workspace_key !== workspaceKey) {
        const error: any = new Error('The saved workspace layout is not in your business.');
        error.status = 409;
        throw error;
      }
      return row;
    }

    async function readVersion(versionNumber: number) {
      const page = await read.WorkspacePreferenceVersion.filter(
        { tenant_id: tenantId, user_id: userId, workspace_key: workspaceKey, version_number: versionNumber },
        '-version_number',
        1,
        0,
      );
      const rows = rowsOf(page);
      if (rows === null) {
        const error: any = new Error('Saved layout versions could not be read.');
        error.status = 502;
        throw error;
      }
      const row = rows[0];
      return row && row.tenant_id === tenantId && row.user_id === userId && row.workspace_key === workspaceKey ? row : null;
    }

    async function writeLayout(layout: any, expectedVersion: unknown, note: string, restoredFrom: number | null) {
      const current = await currentPreference();
      const currentVersion = current ? Number(current.version_number) || 0 : 0;
      if (typeof expectedVersion !== 'number' || !Number.isSafeInteger(expectedVersion) || expectedVersion < 0) {
        return fail('INVALID_EXPECTED_VERSION', 'Reload the layout and supply its whole-number version before saving.', 400, correlationId);
      }
      {
        const expected = Number(expectedVersion);
        if (!Number.isFinite(expected) || expected < 0) {
          return fail('INVALID_EXPECTED_VERSION', 'The expected version must be a whole number.', 400, correlationId);
        }
        if (expected !== currentVersion) {
          const stored = current ? parseStoredLayout(current.layout_json) : null;
          return fail(
            'VERSION_CONFLICT',
            `This layout was saved again since you opened it (now version ${currentVersion}). Reload before saving.`,
            409,
            correlationId,
            { version: currentVersion, layout: stored, content_hash: current?.content_hash || null },
          );
        }
      }

      const version = nextVersionNumber(currentVersion);
      const hash = layoutHash(layout);
      const savedAt = new Date().toISOString();

      let snapshot: any = null;
      try {
        snapshot = await write.WorkspacePreferenceVersion.create({
          tenant_id: tenantId,
          preference_id: current?.id || '',
          user_id: userId,
          workspace_key: workspaceKey,
          version_number: version,
          layout_json: canonicalLayout(layout),
          content_hash: hash,
          schema_version: layout.schema,
          saved_by: actor,
          saved_by_id: userId,
          saved_at: savedAt,
          note,
          restored_from_version: restoredFrom ?? undefined,
        });
      } catch {
        return fail('SAVE_FAILED', 'The snapshot outcome could not be confirmed. Reload history before retrying; the current layout was not updated by this request.', 503, correlationId);
      }
      if (!snapshot?.id) {
        return fail('SAVE_FAILED', 'The snapshot response was incomplete. Reload history before retrying; the current layout was not updated by this request.', 503, correlationId);
      }

      let savedPreferenceId = current?.id || null;
      try {
        if (current) {
          await write.WorkspacePreference.update(current.id, {
            layout_json: canonicalLayout(layout),
            content_hash: hash,
            schema_version: layout.schema,
            view_state: layout.viewState,
            version_number: version,
            saved_by: actor,
            saved_by_id: userId,
            saved_at: savedAt,
            note,
            workspace_label: text(body.workspace_label, 80) || current.workspace_label || workspaceKey,
          });
        } else {
          const created = await write.WorkspacePreference.create({
            tenant_id: tenantId,
            user_id: userId,
            user_name: actor,
            workspace_key: workspaceKey,
            workspace_label: text(body.workspace_label, 80) || workspaceKey,
            view_state: layout.viewState,
            layout_json: canonicalLayout(layout),
            content_hash: hash,
            schema_version: layout.schema,
            version_number: version,
            saved_by: actor,
            saved_by_id: userId,
            saved_at: savedAt,
            note,
          });
          savedPreferenceId = created?.id || null;
          if (!savedPreferenceId) throw new Error('The saved layout response had no record ID.');
          if (savedPreferenceId && snapshot) {
            // Point the snapshot at the row it now belongs to. A failure here is not fatal: the
            // snapshot is still the person's own version and the history read is keyed on user + workspace.
            try { await write.WorkspacePreferenceVersion.update(snapshot.id, { preference_id: savedPreferenceId }); } catch { /* history still reads by user and workspace */ }
          }
        }
      } catch {
        // A failed transport can follow a committed write. Retain its snapshot for reconciliation.
        return fail(
          'SAVE_OUTCOME_UNKNOWN',
          'The save outcome could not be confirmed. Reload the layout and history before trying again; the attempted snapshot was retained.',
          503,
          correlationId,
        );
      }

      return ok({
        workspace_key: workspaceKey,
        layout,
        version,
        content_hash: hash,
        saved_at: savedAt,
        saved_by: actor,
        note,
        preference_id: savedPreferenceId,
      }, ['Saves are checked then written: a simultaneous save from another session can still conflict.']);
    }

    if (action === 'load') {
      const current = await currentPreference();
      if (!current) {
        return ok({
          workspace_key: workspaceKey,
          layout: defaultLayout(),
          version: 0,
          content_hash: null,
          saved_at: null,
          saved_by: null,
          note: null,
          stored: false,
        });
      }
      const stored = parseStoredLayout(current.layout_json);
      if (!stored) {
        return ok({
          workspace_key: workspaceKey,
          layout: defaultLayout(),
          version: Number(current.version_number) || 0,
          content_hash: current.content_hash || null,
          saved_at: current.saved_at || null,
          saved_by: current.saved_by || null,
          note: current.note || null,
          stored: true,
        }, ['The saved layout could not be read, so the default layout is shown.']);
      }
      return ok({
        workspace_key: workspaceKey,
        layout: stored,
        version: Number(current.version_number) || 0,
        content_hash: current.content_hash || null,
        saved_at: current.saved_at || null,
        saved_by: current.saved_by || null,
        note: current.note || null,
        stored: true,
      });
    }

    if (action === 'save') {
      const normalised = normaliseLayout(body.layout);
      if (!normalised.ok) return fail(normalised.code, normalised.message, 400, correlationId);
      return await writeLayout(normalised.layout, body.expected_version, text(body.note, MAX_NOTE), null);
    }

    if (action === 'restore') {
      const target = Number(body.version_number);
      if (!Number.isFinite(target) || target < 1) {
        return fail('INVALID_VERSION', 'Choose a saved version to restore.', 400, correlationId);
      }
      const version = await readVersion(Math.floor(target));
      if (!version) return fail('VERSION_NOT_FOUND', 'That saved version is not available to this account.', 404, correlationId);
      const layout = parseStoredLayout(version.layout_json);
      if (!layout) {
        return fail('VERSION_UNREADABLE', 'That saved version cannot be read, so it was not restored.', 409, correlationId);
      }
      return await writeLayout(
        layout,
        body.expected_version,
        `Restored from version ${Math.floor(target)}`,
        Math.floor(target),
      );
    }

    if (action === 'reset') {
      return await writeLayout(defaultLayout(), body.expected_version, 'Reset to the default layout', null);
    }

    if (action === 'history') {
      const pageIndex = Math.max(0, Math.min(50, Number(body.page) || 0));
      const page = await read.WorkspacePreferenceVersion.filter(
        { tenant_id: tenantId, user_id: userId, workspace_key: workspaceKey },
        '-version_number',
        HISTORY_PAGE_SIZE + 1,
        pageIndex * HISTORY_PAGE_SIZE,
      );
      const rows = rowsOf(page);
      if (rows === null) return fail('HISTORY_UNAVAILABLE', 'Saved layout versions could not be read.', 502, correlationId);
      const foreign = rows.some((row) => row.tenant_id !== tenantId || row.user_id !== userId || row.workspace_key !== workspaceKey);
      if (foreign) return fail('HISTORY_UNAVAILABLE', 'Saved layout versions are not all in your business.', 409, correlationId);

      let totalRecords = 0;
      try {
        totalRecords = await read.WorkspacePreferenceVersion.count({ tenant_id: tenantId, user_id: userId, workspace_key: workspaceKey });
      } catch {
        totalRecords = -1;
      }

      return ok({
        workspace_key: workspaceKey,
        items: rows.slice(0, HISTORY_PAGE_SIZE).map((row) => {
          const layout = parseStoredLayout(row.layout_json);
          return {
            id: row.id,
            version: Number(row.version_number) || 0,
            saved_at: row.saved_at || row.created_date || null,
            saved_by: row.saved_by || null,
            note: row.note || null,
            content_hash: row.content_hash || null,
            restored_from_version: row.restored_from_version ?? null,
            layout,
          };
        }),
        page: pageIndex + 1,
        pageSize: HISTORY_PAGE_SIZE,
        totalRecords: Number.isFinite(totalRecords) && totalRecords >= 0 ? totalRecords : null,
        totalPages: totalRecords > 0 ? Math.ceil(totalRecords / HISTORY_PAGE_SIZE) : null,
      }, totalRecords < 0 ? ['An exact version count was unavailable; paging still works.'] : []);
    }

    return fail('UNKNOWN_ACTION', 'That workspace layout action is not supported.', 400, correlationId);
  } catch (error: any) {
    const status = Number(error?.status) || 500;
    const code = status === 502 ? 'LAYOUT_UNAVAILABLE' : status === 409 ? 'LAYOUT_CONFLICT' : 'WORKSPACE_LAYOUT_FAILED';
    return fail(code, String(error?.message || 'The workspace layout request failed.'), status >= 400 ? status : 500, correlationId);
  }
});