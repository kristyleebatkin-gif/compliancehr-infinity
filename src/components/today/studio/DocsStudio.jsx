import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FilePlus2, Download, Trash2, Bold, Italic, List, Heading2, ArrowUpRight, Loader2 } from 'lucide-react';
import { downloadFile, wordCount, formatWhen } from '@/components/today/studio/studioStore';
import { listStudioItems, createStudioItem, updateStudioItem, deleteStudioItem, itemWhen } from '@/components/today/studio/studioData';

const STARTERS = [
  { id: 'blank', label: 'Blank', html: '<h1>Untitled document</h1><p></p>' },
  {
    id: 'minutes',
    label: 'Meeting minutes',
    html: '<h1>Meeting minutes</h1><p><strong>Date:</strong> </p><p><strong>Present:</strong> </p><p><strong>Chair:</strong> </p><h2>Agenda</h2><ul><li></li></ul><h2>Discussion</h2><p></p><h2>Decisions</h2><ul><li></li></ul><h2>Actions</h2><ul><li></li></ul>'
  },
  {
    id: 'policy',
    label: 'Policy draft',
    html: '<h1>Policy title</h1><p><strong>Owner:</strong> </p><p><strong>Review date:</strong> </p><h2>Purpose</h2><p></p><h2>Scope</h2><p></p><h2>Procedure</h2><ol><li></li></ol><h2>Related documents</h2><p></p>'
  },
  {
    id: 'letter',
    label: 'Letter',
    html: '<p>Dear </p><p></p><p></p><p>Kind regards,</p><p><strong>Sherelle</strong><br />Administration Lead<br />ComplianceHR Infinity</p>'
  }
];

const toDoc = (item) => ({
  id: item.id,
  title: item.title || 'Untitled document',
  html: item.payload?.html || '',
  updated: itemWhen(item)
});

export default function DocsStudio() {
  const [docs, setDocs] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const editorRef = useRef(null);
  const docsRef = useRef([]);
  const saveTimer = useRef(null);

  const active = docs.find((doc) => doc.id === activeId) || null;

  useEffect(() => {
    let cancelled = false;
    listStudioItems('document')
      .then((items) => {
        if (cancelled) return;
        const list = items.map(toDoc);
        setDocs(list);
        setActiveId((current) => current || list[0]?.id || null);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Your documents could not be loaded.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    docsRef.current = docs;
  }, [docs]);

  useEffect(() => {
    const doc = docsRef.current.find((item) => item.id === activeId);
    if (editorRef.current && doc) {
      editorRef.current.innerHTML = doc.html || '';
    }
    // Only re-seed the editor when a different document is opened.
  }, [activeId]);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    []
  );

  const persist = useCallback(async (id) => {
    const doc = docsRef.current.find((item) => item.id === id);
    if (!doc) return;
    setStatus('Saving…');
    try {
      await updateStudioItem(id, { title: doc.title, payload: { html: doc.html, savedAt: doc.updated } });
      setStatus('Saved to the app');
      setError('');
    } catch (err) {
      setStatus('');
      setError(err?.message || 'That document could not be saved.');
    }
  }, []);

  const scheduleSave = useCallback(
    (id) => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveTimer.current = null;
        persist(id);
      }, 700);
    },
    [persist]
  );

  const createDoc = async (starter) => {
    setError('');
    const title = starter.label === 'Blank' ? 'Untitled document' : starter.label;
    try {
      const item = await createStudioItem('document', title, {
        html: starter.html,
        savedAt: new Date().toISOString()
      });
      const doc = { id: item.id, title, html: starter.html, updated: item.updated };
      setDocs((prev) => [doc, ...prev]);
      setActiveId(doc.id);
      setStatus('Saved to the app');
    } catch (err) {
      setError(err?.message || 'That document could not be created.');
    }
  };

  const patchActive = (patch) => {
    if (!activeId) return;
    const updated = new Date().toISOString();
    setDocs((prev) => prev.map((doc) => (doc.id === activeId ? { ...doc, ...patch, updated } : doc)));
    scheduleSave(activeId);
  };

  const onInput = () => {
    patchActive({ html: editorRef.current?.innerHTML || '' });
  };

  const flush = () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    if (activeId) persist(activeId);
  };

  const selectDoc = (id) => {
    flush();
    setActiveId(id);
  };

  const run = (command, value) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    onInput();
  };

  const removeDoc = async (id) => {
    setDocs((prev) => prev.filter((doc) => doc.id !== id));
    if (id === activeId) setActiveId(null);
    try {
      await deleteStudioItem(id);
    } catch (err) {
      setError(err?.message || 'That document could not be removed.');
    }
  };

  return (
    <div className="grid gap-3.5 lg:grid-cols-[260px_minmax(0,1fr)]">
      <div className="space-y-2.5">
        <div className="t-card p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="t-title text-[13px] font-extrabold">New from template</p>
            <Link to="/documents" className="t-muted flex items-center gap-0.5 text-[10.5px] font-bold hover:underline">
              Drive <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {STARTERS.map((starter) => (
              <button key={starter.id} type="button" onClick={() => createDoc(starter)} className="studio-chip flex items-center gap-1">
                <FilePlus2 className="h-3 w-3" /> {starter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="t-card p-3">
          <p className="t-title text-[13px] font-extrabold">My documents</p>
          {loading ? (
            <p className="t-muted mt-2 flex items-center gap-1.5 text-[11.5px]">
              <Loader2 className="h-3 w-3 animate-spin" /> Loading your documents…
            </p>
          ) : docs.length === 0 ? (
            <p className="t-muted mt-2 text-[11.5px]">Nothing saved yet. Start with a template above.</p>
          ) : (
            <div className="mt-1.5 max-h-[320px] space-y-0.5 overflow-y-auto">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="t-row flex items-center gap-2 px-2 py-1.5"
                  style={doc.id === activeId ? { background: 'var(--t-hover)' } : undefined}
                >
                  <button type="button" onClick={() => selectDoc(doc.id)} className="min-w-0 flex-1 text-left">
                    <span className="t-title block truncate text-[12px] font-bold">{doc.title}</span>
                    <span className="t-muted block text-[10px]">{formatWhen(doc.updated)} · {wordCount(doc.html)} words</span>
                  </button>
                  <button type="button" onClick={() => removeDoc(doc.id)} aria-label={`Delete ${doc.title}`} className="t-muted shrink-0 hover:text-[#FF2E9A]">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {active ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              value={active.title}
              onChange={(event) => patchActive({ title: event.target.value })}
              className="studio-input flex-1 min-w-[140px] font-bold"
              aria-label="Document title"
            />
            <button type="button" onClick={() => run('bold')} className="studio-chip" aria-label="Bold"><Bold className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => run('italic')} className="studio-chip" aria-label="Italic"><Italic className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => run('formatBlock', '<h2>')} className="studio-chip" aria-label="Heading"><Heading2 className="h-3.5 w-3.5" /></button>
            <button type="button" onClick={() => run('insertUnorderedList')} className="studio-chip" aria-label="Bullet list"><List className="h-3.5 w-3.5" /></button>
            <button
              type="button"
              onClick={() => downloadFile(`${active.title.replace(/[^\w\- ]+/g, '').trim() || 'document'}.html`, active.html, 'text/html;charset=utf-8')}
              className="studio-chip flex items-center gap-1"
            >
              <Download className="h-3.5 w-3.5" /> Export
            </button>
          </div>

          <div
            ref={editorRef}
            className="studio-doc"
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            onBlur={flush}
            role="textbox"
            aria-multiline="true"
            aria-label="Document body"
          />

          <p className="t-muted text-[10.5px]">
            {wordCount(active.html)} words · {status || 'saved to the app'} · it appears in{' '}
            <Link to="/documents" className="underline">Documents</Link> · exported files open in Word, Google Docs or Pages.
          </p>
          {error ? <p className="text-[11px] font-semibold text-[#FF2E9A]">{error}</p> : null}
        </div>
      ) : (
        <div className="t-card grid min-h-[280px] place-items-center p-6 text-center">
          <div>
            <p className="t-title text-[13px] font-extrabold">Pick a document or start a new one</p>
            <p className="t-muted mt-1 text-[11.5px]">Minutes, policies, letters and notes — saved to the app, exported anywhere.</p>
            {error ? <p className="mt-2 text-[11px] font-semibold text-[#FF2E9A]">{error}</p> : null}
          </div>
        </div>
      )}
    </div>
  );
}