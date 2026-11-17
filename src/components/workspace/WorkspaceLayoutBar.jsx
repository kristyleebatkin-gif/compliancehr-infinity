import React, { useEffect, useState } from 'react';
import { Save, RotateCcw, History, PanelRight, ChevronUp, ChevronDown, Loader2, AlertTriangle, LayoutGrid } from 'lucide-react';
import { WORKSPACE_VIEW_STATES, defaultWorkspaceLayout, moveSection, sectionLabel, setSectionVisible, isBuiltViewState } from '@/lib/workspaceLayout';
import WorkspaceVersionHistory from '@/components/workspace/WorkspaceVersionHistory';

const chip = 'inline-flex min-h-11 items-center gap-1 rounded-lg px-3 text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00C6FF]';

/**
 * View state, block layout, save/reset and version history for one workspace.
 * Saving is server-side and versioned; nothing here reports a success the server did not return.
 */
export default function WorkspaceLayoutBar({ workspaceKey, workspaceLabel, availableSections = [], workspace, onOpenContext }) {
  const [draft, setDraft] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (workspace.status === 'ready' && workspace.layout && !dirty) setDraft(workspace.layout);
  }, [workspace.status, workspace.layout, dirty]);

  if (!workspace.permitted) return null;

  const working = draft || workspace.layout || defaultWorkspaceLayout();
  const update = (next) => { setDraft(next); setDirty(true); setFeedback(null); };

  const save = async () => {
    setSaving(true);
    const result = await workspace.save(working, workspace.version || 0, 'Layout saved');
    setSaving(false);
    if (result.ok) {
      setDirty(false);
      setFeedback({ tone: 'ok', text: `Saved as version ${result.data?.version}.` });
    } else if (result.code === 'VERSION_CONFLICT') {
      setFeedback({ tone: 'warn', text: result.message });
    } else {
      setFeedback({ tone: 'error', text: result.message });
    }
  };

  const reset = async () => {
    setSaving(true);
    const result = await workspace.reset(workspace.version || 0);
    setSaving(false);
    if (result.ok) {
      setDirty(false);
      setDraft(defaultWorkspaceLayout());
      setFeedback({ tone: 'ok', text: `Reset saved as version ${result.data?.version}.` });
    } else {
      setFeedback({ tone: 'error', text: result.message });
    }
  };

  const move = (key, direction) => update(moveSection(working, key, direction));
  const toggle = (key, visible) => update(setSectionVisible(working, key, visible));

  return (
    <section
      aria-label={`Workspace layout for ${workspaceLabel || workspaceKey}`}
      className="min-w-0 rounded-xl border border-[#00C6FF]/35 p-3 text-white shadow-panel"
      style={{ background: 'linear-gradient(160deg, #0A2B6D 0%, #0A2B6D 55%, #5A00D6 100%)' }}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#00C6FF]">Workspace</p>
          <p className="truncate text-sm font-bold">{workspaceLabel || workspaceKey}</p>
          <p className="text-[11px] font-semibold text-white/90">
            {workspace.status === 'loading' && 'Loading your saved layout…'}
            {workspace.status === 'error' && 'Your saved layout is unavailable'}
            {workspace.status === 'ready' && (workspace.stored
              ? `Version ${workspace.version} · saved ${workspace.savedAt ? new Date(workspace.savedAt).toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }) : 'earlier'}${workspace.savedBy ? ` by ${workspace.savedBy}` : ''}`
              : 'No layout saved yet · showing the default layout')}
            {dirty ? ' · unsaved changes' : ''}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('chr-open-module-directory'))}
            className={`${chip} border border-white/30 bg-white/10`}
          >
            <LayoutGrid className="h-4 w-4" /> Switch
          </button>
          <button type="button" onClick={() => setHistoryOpen(true)} className={`${chip} border border-white/30 bg-white/10`}>
            <History className="h-4 w-4" /> History
          </button>
          <button type="button" onClick={onOpenContext} className={`${chip} border border-white/30 bg-white/10`}>
            <PanelRight className="h-4 w-4" /> Context
          </button>
          <button type="button" onClick={reset} disabled={saving || workspace.status !== 'ready'} className={`${chip} border border-[#FF2E9A]/60 bg-[#FF2E9A]/20 disabled:opacity-50`}>
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving || workspace.status !== 'ready' || !dirty}
            className={`${chip} text-[#0A2B6D] disabled:opacity-50`}
            style={{ background: 'linear-gradient(115deg, #00C6FF 0%, #A100FF 100%)' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save layout
          </button>
        </div>
      </div>

      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        <label className="text-[11px] font-extrabold uppercase tracking-wide text-[#00C6FF]">
          View state
          <select
            value={working.viewState}
            onChange={(event) => update({ ...working, viewState: event.target.value })}
            className="mt-1 min-h-11 w-full rounded-lg border border-[#00C6FF]/40 bg-[#0A2B6D] px-2 text-sm font-semibold text-white"
          >
            {WORKSPACE_VIEW_STATES.map((state) => (
              <option key={state} value={state}>{isBuiltViewState(state) ? state : `${state} (recorded only)`}</option>
            ))}
          </select>
        </label>

        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#00C6FF]">Dashboard blocks</p>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {working.sections.map((section, index) => {
              const available = availableSections.includes(section.key);
              return (
                <li key={section.key} className="flex items-center gap-1 rounded-lg border border-white/25 bg-white/10 px-1.5 py-0.5">
                  <button
                    type="button"
                    onClick={() => toggle(section.key, !section.visible)}
                    aria-pressed={section.visible}
                    aria-label={`${section.visible ? 'Hide' : 'Show'} ${sectionLabel(section.key)}`}
                    className="min-h-9 rounded px-2 text-xs font-bold"
                  >
                    <span className={section.visible ? 'text-white' : 'text-white/60 line-through'}>{sectionLabel(section.key)}</span>
                  </button>
                  {!available && <span className="pr-1 text-[10px] font-semibold text-white/70">not on this page</span>}
                  <button type="button" onClick={() => move(section.key, 'up')} disabled={index === 0} aria-label={`Move ${sectionLabel(section.key)} up`} className="min-h-9 min-w-8 rounded text-white disabled:opacity-30">
                    <ChevronUp className="mx-auto h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => move(section.key, 'down')} disabled={index === working.sections.length - 1} aria-label={`Move ${sectionLabel(section.key)} down`} className="min-h-9 min-w-8 rounded text-white disabled:opacity-30">
                    <ChevronDown className="mx-auto h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {!isBuiltViewState(working.viewState) && (
        <p role="status" className="mt-2 text-[11px] font-semibold text-[#FFD1E8]">
          {working.viewState} is saved with your layout, but this app has no screen for that view yet. Only Dashboard, Selection, History and Version Compare open a real view.
        </p>
      )}
      {workspace.error && (
        <p role="status" className="mt-2 flex items-start gap-1 text-[11px] font-semibold text-[#FFD1E8]">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {workspace.error}
        </p>
      )}
      {workspace.warning && !workspace.error && (
        <p role="status" className="mt-2 text-[11px] font-semibold text-[#FFD1E8]">{workspace.warning}</p>
      )}
      <p role="status" aria-live="polite" className={`mt-1 text-xs font-bold ${feedback?.tone === 'ok' ? 'text-[#7CF7C1]' : 'text-[#FFD1E8]'}`}>
        {feedback?.text || ''}
      </p>

      <WorkspaceVersionHistory
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        workspace={workspace}
        currentLayout={working}
        onRestored={(text, tone) => { setDirty(false); setFeedback({ tone, text }); }}
      />
    </section>
  );
}