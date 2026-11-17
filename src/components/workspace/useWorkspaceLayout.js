import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { defaultWorkspaceLayout, isLatestResponse, layoutScopeKey, normaliseWorkspaceLayout } from '@/lib/workspaceLayout';

const EMPTY = {
  status: 'idle',
  layout: null,
  version: 0,
  savedAt: null,
  savedBy: null,
  note: null,
  hash: null,
  stored: false,
  error: null,
  warning: null,
};

function messageOf(error) {
  return error?.response?.data?.errors?.[0]?.message
    || error?.message
    || 'The workspace layout request failed.';
}

/**
 * Loads and saves one person's layout for one workspace.
 * Every request is keyed by the identity scope (business + user + role + status) and a sequence
 * number, so a response for a previous identity or an older request is discarded instead of shown.
 */
export default function useWorkspaceLayout(workspaceKey, workspaceLabel = '') {
  const { user, can } = useRole();
  const scope = layoutScopeKey(user);
  const permitted = Boolean(workspaceKey && scope && can(workspaceKey));
  const [state, setState] = useState(EMPTY);
  const requestRef = useRef(0);
  const scopeRef = useRef(scope);
  scopeRef.current = scope;

  const load = useCallback(async () => {
    if (!permitted) return;
    const requestId = requestRef.current + 1;
    requestRef.current = requestId;
    const forScope = scope;
    setState((previous) => ({ ...previous, status: 'loading', error: null, warning: null }));
    try {
      const response = await base44.functions.invoke('workspacePreferences', { action: 'load', workspace_key: workspaceKey });
      if (!isLatestResponse(requestId, requestRef.current) || scopeRef.current !== forScope) return;
      const data = response.data;
      if (!data?.success) {
        setState({ ...EMPTY, status: 'error', error: data?.errors?.[0]?.message || 'The saved layout could not be loaded.' });
        return;
      }
      const normalised = normaliseWorkspaceLayout(data.data?.layout);
      setState({
        status: 'ready',
        layout: normalised.ok ? normalised.layout : defaultWorkspaceLayout(),
        version: Number(data.data?.version) || 0,
        savedAt: data.data?.saved_at || null,
        savedBy: data.data?.saved_by || null,
        note: data.data?.note || null,
        hash: data.data?.content_hash || null,
        stored: Boolean(data.data?.stored),
        error: normalised.ok ? null : 'The saved layout could not be read, so the default layout is shown.',
        warning: data.warnings?.[0] || null,
      });
    } catch (error) {
      if (!isLatestResponse(requestId, requestRef.current) || scopeRef.current !== forScope) return;
      setState({ ...EMPTY, status: 'error', error: messageOf(error) });
    }
  }, [permitted, scope, workspaceKey]);

  useEffect(() => {
    if (!permitted) {
      requestRef.current += 1;
      setState(EMPTY);
      return;
    }
    load();
  }, [permitted, load]);

  const send = useCallback(async (action, payload = {}) => {
    if (!permitted) {
      return { ok: false, code: 'NOT_PERMITTED', message: 'Your role cannot change layouts for this workspace.' };
    }
    const forScope = scope;
    try {
      const response = await base44.functions.invoke('workspacePreferences', {
        action,
        workspace_key: workspaceKey,
        workspace_label: workspaceLabel,
        ...payload,
      });
      if (scopeRef.current !== forScope) return { ok: false, code: 'IDENTITY_CHANGED', message: 'The signed-in identity changed, so that result was discarded.' };
      const data = response.data;
      if (!data?.success) {
        return {
          ok: false,
          code: data?.errors?.[0]?.errorCode || 'FAILED',
          message: data?.errors?.[0]?.message || 'The workspace layout request failed.',
          data: data?.data || null,
        };
      }
      return { ok: true, data: data.data, warnings: data.warnings || [] };
    } catch (error) {
      const body = error?.response?.data;
      return {
        ok: false,
        code: body?.errors?.[0]?.errorCode || 'FAILED',
        message: body?.errors?.[0]?.message || messageOf(error),
        data: body?.data || null,
      };
    }
  }, [permitted, scope, workspaceKey, workspaceLabel]);

  const save = useCallback(async (layout, expectedVersion, note = '') => {
    const normalised = normaliseWorkspaceLayout(layout);
    if (!normalised.ok) return { ok: false, code: normalised.code, message: normalised.message };
    const result = await send('save', { layout: normalised.layout, expected_version: expectedVersion, note });
    if (result.ok) {
      setState((previous) => ({
        ...previous,
        status: 'ready',
        layout: normalised.layout,
        version: Number(result.data?.version) || previous.version,
        savedAt: result.data?.saved_at || previous.savedAt,
        savedBy: result.data?.saved_by || previous.savedBy,
        note,
        hash: result.data?.content_hash || previous.hash,
        stored: true,
        error: null,
        warning: result.warnings?.[0] || null,
      }));
    }
    return result;
  }, [send]);

  const restore = useCallback(async (versionNumber, expectedVersion) => {
    const result = await send('restore', { version_number: versionNumber, expected_version: expectedVersion });
    if (result.ok) await load();
    return result;
  }, [send, load]);

  const reset = useCallback(async (expectedVersion) => {
    const result = await send('reset', { expected_version: expectedVersion });
    if (result.ok) await load();
    return result;
  }, [send, load]);

  const history = useCallback(async (page = 0) => send('history', { page }), [send]);

  return { permitted, scope, ...state, load, save, restore, reset, history };
}