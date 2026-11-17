import { useCallback, useEffect, useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useRole } from '@/lib/useRole';
import { defaultWorkspaceLayout, isLatestResponse, layoutScopeKey, normaliseWorkspaceLayout } from '@/lib/workspaceLayout';

const EMPTY = {
  status: 'idle', layout: null, version: 0, savedAt: null, savedBy: null,
  note: null, hash: null, stored: false, error: null, warning: null,
};

function messageOf(error) {
  return error?.response?.data?.errors?.[0]?.message
    || error?.message || 'The workspace layout request failed.';
}

const changed = () => ({
  ok: false, code: 'CONTEXT_CHANGED',
  message: 'The account or workspace changed, so that result was discarded.',
});

/** Scope includes the workspace and permission state, not just the signed-in person.
 * Reads from a previous context are hidden immediately, even before effect cleanup runs.
 * Local mutations are serialised; server-side CAS remains a separate release requirement.
 */
export default function useWorkspaceLayout(workspaceKey, workspaceLabel = '') {
  const { user, can } = useRole();
  const identity = layoutScopeKey(user);
  const permitted = Boolean(workspaceKey && identity && can(workspaceKey));
  const scope = permitted ? JSON.stringify([identity, workspaceKey]) : null;
  const [state, setState] = useState({ ...EMPTY, scope: null, context: null });
  const requestRef = useRef(0);
  const contextRef = useRef({ scope });
  if (contextRef.current.scope !== scope) contextRef.current = { scope };
  const context = contextRef.current;
  const mutationRef = useRef(null);
  const activeRef = useRef(true);

  const load = useCallback(async () => {
    if (!activeRef.current || !scope || contextRef.current !== context || mutationRef.current?.context === context) return;
    const requestId = ++requestRef.current;
    const current = () => activeRef.current && contextRef.current === context && isLatestResponse(requestId, requestRef.current);
    setState((previous) => ({ ...(previous.context === context ? previous : EMPTY), scope, context, status: 'loading', error: null, warning: null }));
    try {
      const response = await base44.functions.invoke('workspacePreferences', { action: 'load', workspace_key: workspaceKey });
      if (!current()) return;
      const data = response.data;
      if (!data?.success) {
        setState({ ...EMPTY, scope, context, status: 'error', error: data?.errors?.[0]?.message || 'The saved layout could not be loaded.' });
        return;
      }
      const normalised = normaliseWorkspaceLayout(data.data?.layout);
      setState({
        scope, context, status: 'ready',
        layout: normalised.ok ? normalised.layout : defaultWorkspaceLayout(),
        version: Number(data.data?.version) || 0,
        savedAt: data.data?.saved_at || null, savedBy: data.data?.saved_by || null,
        note: data.data?.note || null, hash: data.data?.content_hash || null,
        stored: Boolean(data.data?.stored),
        error: normalised.ok ? null : 'The saved layout could not be read, so the default layout is shown.',
        warning: data.warnings?.[0] || null,
      });
    } catch (error) {
      if (current()) setState({ ...EMPTY, scope, context, status: 'error', error: messageOf(error) });
    }
  }, [scope, workspaceKey, context]);

  useEffect(() => {
    activeRef.current = true;
    if (!scope) {
      setState({ ...EMPTY, scope: null, context: null });
      return;
    }
    load();
    return () => { activeRef.current = false; requestRef.current += 1; };
  }, [scope, load]);

  const send = useCallback(async (action, payload = {}) => {
    if (!activeRef.current || !scope || contextRef.current !== context) return changed();
    const mutation = action !== 'history';
    if (mutation && mutationRef.current?.context === context) {
      return { ok: false, code: 'SAVE_IN_PROGRESS', message: 'Wait for the current layout save to finish before changing it again.' };
    }
    const token = { scope, context };
    if (mutation) {
      mutationRef.current = token;
      requestRef.current += 1; // An earlier read must never replace a completed save.
    }
    try {
      const response = await base44.functions.invoke('workspacePreferences', {
        ...payload, action, workspace_key: workspaceKey, workspace_label: workspaceLabel,
      });
      if (!activeRef.current || contextRef.current !== context) return changed();
      const data = response.data;
      if (!data?.success) {
        return { ok: false, code: data?.errors?.[0]?.errorCode || 'FAILED',
          message: data?.errors?.[0]?.message || 'The workspace layout request failed.', data: data?.data || null };
      }
      return { ok: true, data: data.data, warnings: data.warnings || [] };
    } catch (error) {
      if (!activeRef.current || contextRef.current !== context) return changed();
      const body = error?.response?.data;
      return { ok: false, code: body?.errors?.[0]?.errorCode || 'FAILED',
        message: body?.errors?.[0]?.message || messageOf(error), data: body?.data || null };
    } finally {
      if (mutationRef.current === token) mutationRef.current = null;
    }
  }, [scope, workspaceKey, workspaceLabel, context]);

  const save = useCallback(async (layout, expectedVersion, note = '') => {
    const normalised = normaliseWorkspaceLayout(layout);
    if (!normalised.ok) return { ok: false, code: normalised.code, message: normalised.message };
    const result = await send('save', { layout: normalised.layout, expected_version: expectedVersion, note });
    if (result.ok && activeRef.current && contextRef.current === context) {
      setState({
        ...EMPTY, scope, context, status: 'ready', layout: normalised.layout,
        version: result.data?.version, savedAt: result.data?.saved_at || null,
        savedBy: result.data?.saved_by || null, note, hash: result.data?.content_hash || null,
        stored: true, warning: result.warnings?.[0] || null,
      });
    }
    return result;
  }, [send, scope, context]);

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
  const visible = state.context === context ? state : { ...EMPTY, status: scope ? 'loading' : 'idle' };
  return { ...visible, permitted, scope, load, save, restore, reset, history };
}
