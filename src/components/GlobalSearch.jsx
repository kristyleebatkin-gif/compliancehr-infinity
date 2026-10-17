import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { Search, X, Loader2, Users, Heart, FolderOpen, ClipboardList, LayoutGrid } from 'lucide-react';

const EMPTY = { modules: [], staff: [], participants: [], documents: [], tasks: [] };

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(EMPTY);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  // Ctrl/Cmd + K opens, Escape closes
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const term = query.trim();
    if (term.length < 2) {
      setResults({ ...EMPTY, modules: MODULE_DIRECTORY.filter((m) => !term) });
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = { $regex: esc, $options: 'i' };
      try {
        const [staff, participants, documents, tasks] = await Promise.all([
          base44.entities.StaffProfile.filter({ full_name: rx }, { limit: 5, fields: ['id', 'full_name', 'position'] }),
          base44.entities.ParticipantProfile.filter({ full_name: rx }, { limit: 5, fields: ['id', 'full_name', 'status'] }),
          base44.entities.EmployeeDocument.filter({ title: rx }, { limit: 5, fields: ['id', 'title', 'document_type'] }),
          base44.entities.TodoTask.filter({ title: rx }, { limit: 5, fields: ['id', 'title', 'status'] }),
        ]);
        setResults({
          modules: MODULE_DIRECTORY.filter((m) => m.label.toLowerCase().includes(term.toLowerCase())).slice(0, 5),
          staff: staff.items || [],
          participants: participants.items || [],
          documents: documents.items || [],
          tasks: tasks.items || [],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, open]);

  const go = (path) => {
    setOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults = ['modules', 'staff', 'participants', 'documents', 'tasks'].some((k) => results[k].length > 0);

  const Group = ({ label, icon: Icon, items, render }) => items.length > 0 && (
    <div className="mb-2">
      <div className="mb-1 flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase tracking-wider text-foreground/40">
        <Icon className="h-3 w-3" /> {label}
      </div>
      {items.map((item, i) => (
        <button
          key={item.id || i}
          onClick={() => go(item.path)}
          className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground/70 hover:bg-brand/5 hover:text-brand"
        >
          <span className="truncate font-medium">{item.primary}</span>
          <span className="shrink-0 text-[11px] text-foreground/40">{item.secondary}</span>
        </button>
      ))}
    </div>
  );

  return (
    <>
      <button onClick={() => setOpen(true)} title="Search (Ctrl+K)" className="rounded-lg p-2 hover:bg-brand/5">
        <Search className="h-5 w-5 text-foreground/60" />
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-16 sm:pt-24">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
            <div className="flex items-center gap-2 border-b px-4">
              <Search className="h-4 w-4 shrink-0 text-foreground/40" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people, documents, tasks, modules…"
                className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground/40"
              />
              {searching && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-brand" />}
              <button onClick={() => setOpen(false)} className="rounded-lg p-1 hover:bg-brand/5">
                <X className="h-4 w-4 text-foreground/40" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {!hasResults && query.trim().length >= 2 && !searching && (
                <div className="py-8 text-center text-sm text-foreground/40">No matches for “{query.trim()}”</div>
              )}
              {query.trim().length < 2 && (
                <div className="px-2 py-3 text-xs text-foreground/40">
                  Start typing to search across the organisation, or pick a module:
                </div>
              )}
              <Group
                label="Modules"
                icon={LayoutGrid}
                items={results.modules.map((m) => ({ id: m.path, path: m.path, primary: m.label, secondary: '' }))}
              />
              <Group
                label="Staff"
                icon={Users}
                items={results.staff.map((s) => ({ id: s.id, path: `/staff/${s.id}`, primary: s.full_name, secondary: s.position || '' }))}
              />
              <Group
                label="Participants"
                icon={Heart}
                items={results.participants.map((p) => ({ id: p.id, path: `/participants/${p.id}`, primary: p.full_name, secondary: p.status || '' }))}
              />
              <Group
                label="Documents"
                icon={FolderOpen}
                items={results.documents.map((d) => ({ id: d.id, path: '/documents', primary: d.title, secondary: d.document_type || '' }))}
              />
              <Group
                label="Tasks"
                icon={ClipboardList}
                items={results.tasks.map((t) => ({ id: t.id, path: '/tasks', primary: t.title, secondary: t.status || '' }))}
              />
            </div>
            <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-foreground/40">
              <span>Ctrl + K to open</span>
              <span>Esc to close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}