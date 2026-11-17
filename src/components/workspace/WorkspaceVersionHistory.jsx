import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, GitCompare, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { diffLayouts, describeLayout } from '@/lib/workspaceLayout';

/** Saved layout versions: browse, compare two versions, restore one as a new version. */
export default function WorkspaceVersionHistory({ open, onOpenChange, workspace, currentLayout, onRestored }) {
  const [page, setPage] = useState(0);
  const [result, setResult] = useState({ status: 'idle', items: [], totalPages: null, hasMore: false, error: null });
  const [compare, setCompare] = useState({ a: '', b: '' });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null);
  const requestRef = useRef(0);
  const { history, scope } = workspace;
  const contextRef = useRef({ open, scope });
  contextRef.current = { open, scope };

  const load = useCallback(async (nextPage) => {
    const requestId = ++requestRef.current;
    const current = () => requestId === requestRef.current
      && contextRef.current.open && contextRef.current.scope === scope;
    setCompare({ a: '', b: '' });
    setResult({ status: 'loading', items: [], totalPages: null, hasMore: false, error: null });
    try {
      const response = await history(nextPage);
      if (!current()) return;
      if (!response.ok || !Array.isArray(response.data?.items)) {
        setResult({ status: 'error', items: [], totalPages: null, hasMore: false, error: response.message || 'Saved versions could not be read.' });
        return;
      }
      setPage(nextPage);
      setResult({
        status: 'ready', items: response.data.items,
        totalPages: response.data.totalPages ?? null,
        hasMore: response.data.hasMore === true,
        error: null,
      });
    } catch {
      if (current()) setResult({ status: 'error', items: [], totalPages: null, hasMore: false, error: 'Saved versions could not be loaded. Please retry.' });
    }
  }, [history, scope]);

  useEffect(() => {
    setPage(0);
    setCompare({ a: '', b: '' });
    setMessage(null);
    if (open) load(0);
    else setResult({ status: 'idle', items: [], totalPages: null, hasMore: false, error: null });
    return () => { requestRef.current += 1; };
  }, [open, load]);

  const restore = async (versionNumber) => {
    setBusy(true);
    const response = await workspace.restore(versionNumber, workspace.version || 0);
    setBusy(false);
    if (response.ok) {
      setMessage({ tone: 'ok', text: `Version ${versionNumber} restored as version ${response.data?.version}.` });
      onRestored?.(`Version ${versionNumber} restored as version ${response.data?.version}.`, 'ok');
      await load(0);
    } else {
      setMessage({ tone: 'error', text: response.message });
    }
  };

  const itemFor = (value) => result.items.find((item) => String(item.version) === String(value));
  const before = itemFor(compare.a)?.layout || null;
  const after = itemFor(compare.b)?.layout || null;
  const changes = before && after ? diffLayouts(before, after) : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogTitle>Layout version history</DialogTitle>
        <DialogDescription>
          Each save is kept as its own version. Restoring writes a new version; nothing already saved is edited or deleted.
        </DialogDescription>

        {result.status === 'loading' && <p className="flex items-center gap-2 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved versions…</p>}
        {result.status === 'error' && <p className="text-sm font-semibold text-danger">{result.error}</p>}
        {result.status === 'ready' && !result.items.length && <p className="text-sm">No layout has been saved for this workspace yet.</p>}

        {!!result.items.length && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide">
                  <th scope="col" className="py-2 pr-2">Version</th>
                  <th scope="col" className="py-2 pr-2">Saved</th>
                  <th scope="col" className="py-2 pr-2">Layout</th>
                  <th scope="col" className="py-2">Restore</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item) => (
                  <tr key={item.id || item.version} className="border-b border-border/60 align-top">
                    <td className="py-2 pr-2 font-bold">{item.version}{item.version === workspace.version ? ' · current' : ''}</td>
                    <td className="py-2 pr-2 text-xs">
                      {item.saved_at ? new Date(item.saved_at).toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }) : 'Not recorded'}<br />
                      <span className="text-muted-foreground">{item.saved_by || 'Unknown'}</span>
                      {item.note ? <><br /><span className="italic">{item.note}</span></> : null}
                    </td>
                    <td className="py-2 pr-2 text-xs">{item.layout ? describeLayout(item.layout) : 'This snapshot could not be read'}</td>
                    <td className="py-2">
                      <button
                        type="button"
                        onClick={() => restore(item.version)}
                        disabled={busy || result.status !== 'ready' || !item.layout || item.version === workspace.version}
                        className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-[#0072FF]/40 px-2 text-xs font-bold disabled:opacity-40"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Restore
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {result.items.length > 1 && (
          <div className="rounded-xl border border-border p-3">
            <p className="flex items-center gap-2 text-sm font-bold"><GitCompare className="h-4 w-4" /> Compare versions</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {['a', 'b'].map((slot) => (
                <label key={slot} className="text-xs font-bold">
                  {slot === 'a' ? 'From' : 'To'}
                  <select
                    value={compare[slot]}
                    onChange={(event) => setCompare((previous) => ({ ...previous, [slot]: event.target.value }))}
                    className="mt-1 min-h-11 w-full rounded-lg border border-border px-2 text-sm"
                  >
                    <option value="">Choose a version</option>
                    {result.items.map((item) => <option key={item.id || item.version} value={item.version} disabled={!item.layout}>Version {item.version}</option>)}
                  </select>
                </label>
              ))}
            </div>
            {before && after && (
              changes.length ? (
                <ul className="mt-2 space-y-1 text-xs">
                  {changes.map((change) => <li key={change.field}><span className="font-bold">{change.field}:</span> {change.from} → {change.to}</li>)}
                </ul>
              ) : <p className="mt-2 text-xs font-semibold">These two versions describe the same layout.</p>
            )}
            {compare.b && itemFor(compare.b)?.layout && compare.a && currentLayout && (
              <p className="mt-2 text-xs">Current unsaved layout: {describeLayout(currentLayout)}</p>
            )}
          </div>
        )}

        {(page > 0 || result.hasMore || result.totalPages > 1) && (
          <div className="flex items-center gap-2 text-sm">
            <button type="button" onClick={() => load(Math.max(0, page - 1))} disabled={busy || result.status === 'loading' || page === 0} className="min-h-11 rounded-lg border border-border px-3 text-xs font-bold disabled:opacity-40">Newer</button>
            <span>Page {page + 1}{result.totalPages ? ` of ${result.totalPages}` : ''}</span>
            <button type="button" onClick={() => load(page + 1)} disabled={busy || result.status !== 'ready' || !result.hasMore} className="min-h-11 rounded-lg border border-border px-3 text-xs font-bold disabled:opacity-40">Older</button>
          </div>
        )}
        {result.status === 'error' && <button type="button" onClick={() => load(page)} className="min-h-11 rounded-lg border border-border px-3 text-xs font-bold">Retry history</button>}

        <p role="status" aria-live="polite" className={`text-sm font-semibold ${message?.tone === 'ok' ? 'text-safe' : 'text-danger'}`}>{message?.text || ''}</p>
      </DialogContent>
    </Dialog>
  );
}