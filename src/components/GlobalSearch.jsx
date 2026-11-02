import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { canAccessNav } from '@/lib/roles';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { Search, X, Loader2, Users, Heart, FolderOpen, ClipboardList, Zap, Plus } from 'lucide-react';

const EMPTY = {
  modules: [],
  staff: [],
  participants: [],
  documents: [],
  tasks: [],
  incidents: [],
  risks: [],
  policies: [],
  goals: [],
  assets: [],
};

const QUICK_ACTIONS = [
  { id: 'qa-incident', label: 'New Incident Report', path: '/incidents/new', hint: 'Report & investigate' },
  { id: 'qa-participant', label: 'New Participant Intake', path: '/intake/participant', hint: 'Onboard a participant' },
  { id: 'qa-employee', label: 'New Employee Intake', path: '/intake/employee', hint: 'Onboard an employee' },
  { id: 'qa-ai', label: 'Ask Infinity AI Copilot', path: '/assistant', hint: 'Instant NDIS & HR intelligence' },
  { id: 'qa-compliance', label: 'Compliance & Audit Centre', path: '/compliance', hint: '356 checkpoints & readiness' },
  { id: 'qa-dashboard', label: 'Go to Executive Dashboard', path: '/dashboard', hint: 'Live overview' },
];

export default function GlobalSearch() {
  const { role } = useRole();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(EMPTY);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Move focus into the search field as soon as it opens so typing works immediately.
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  // Ctrl/Cmd + K or custom event opens, Escape closes
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    const onOpenPalette = (event) => {
      setQuery(typeof event.detail?.query === 'string' ? event.detail.query : '');
      setOpen(true);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('chr-open-command-palette', onOpenPalette);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('chr-open-command-palette', onOpenPalette);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setResults(EMPTY);
      setSearching(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const visibleModules = MODULE_DIRECTORY.filter((module) => canAccessNav(role, module.key));
    const term = query.trim();
    if (term.length < 2) {
      setResults({ ...EMPTY, modules: visibleModules.filter(() => !term) });
      setSearching(false);
      return;
    }
    setResults({ ...EMPTY, modules: visibleModules.filter((module) => module.label.toLowerCase().includes(term.toLowerCase()) || (module.blurb || '').toLowerCase().includes(term.toLowerCase())).slice(0, 6) });
    setSearching(true);
    const timer = setTimeout(async () => {
      const esc = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const rx = { $regex: esc, $options: 'i' };
      try {
        const [staff, participants, employeeDocs, participantDocs, tasks, incidents, risks, policies, goals, assets] = await Promise.all([
          !canAccessNav(role, 'our-staff') ? Promise.resolve({ items: [] }) : base44.entities.StaffProfile.filter({ $or: [{ full_name: rx }, { position: rx }] }, { limit: 5, fields: ['id', 'full_name', 'position'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'our-participants') ? Promise.resolve({ items: [] }) : base44.entities.ParticipantProfile.filter({ $or: [{ full_name: rx }, { ndis_number: rx }] }, { limit: 5, fields: ['id', 'full_name', 'status'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'documents') ? Promise.resolve({ items: [] }) : base44.entities.EmployeeDocument.filter({ title: rx }, { limit: 5, fields: ['id', 'title', 'document_type'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'documents') ? Promise.resolve({ items: [] }) : base44.entities.ParticipantDocument.filter({ title: rx }, { limit: 5, fields: ['id', 'title', 'document_type'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'tasks') ? Promise.resolve({ items: [] }) : base44.entities.TodoTask.filter({ $or: [{ title: rx }, { assigned_to: rx }] }, { limit: 5, fields: ['id', 'title', 'status', 'assigned_to'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'incidents') ? Promise.resolve({ items: [] }) : base44.entities.Incident.filter({ $or: [{ title: rx }, { location: rx }] }, { limit: 5, fields: ['id', 'title', 'severity', 'status'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'risks') ? Promise.resolve({ items: [] }) : base44.entities.Risk.filter({ $or: [{ title: rx }, { category: rx }] }, { limit: 5, fields: ['id', 'title', 'rating', 'status'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'compliance') ? Promise.resolve({ items: [] }) : base44.entities.Policy.filter({ $or: [{ document_name: rx }, { category: rx }] }, { limit: 5, fields: ['id', 'document_name', 'category', 'status'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'goals') ? Promise.resolve({ items: [] }) : base44.entities.Goal.filter({ title: rx }, { limit: 5, fields: ['id', 'title', 'status'] }).catch(() => ({ items: [] })),
          !canAccessNav(role, 'assets') ? Promise.resolve({ items: [] }) : base44.entities.Asset.filter({ $or: [{ name: rx }, { category: rx }] }, { limit: 5, fields: ['id', 'name', 'category'] }).catch(() => ({ items: [] })),
        ]);
        if (cancelled) return;
        setResults({
          modules: visibleModules.filter((m) => m.label.toLowerCase().includes(term.toLowerCase()) || (m.blurb || '').toLowerCase().includes(term.toLowerCase())).slice(0, 6),
          staff: staff.items || [],
          participants: participants.items || [],
          documents: [...(employeeDocs.items || []), ...(participantDocs.items || [])].slice(0, 5),
          tasks: tasks.items || [],
          incidents: incidents.items || [],
          risks: risks.items || [],
          policies: policies.items || [],
          goals: goals.items || [],
          assets: assets.items || [],
        });
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, open, role]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const actionKeys = {
    'qa-incident': 'incidents', 'qa-participant': 'intake', 'qa-employee': 'intake',
    'qa-ai': 'assistant', 'qa-compliance': 'compliance', 'qa-dashboard': 'dashboard',
  };
  const quickActions = QUICK_ACTIONS.filter((action) =>
    canAccessNav(role, actionKeys[action.id]) &&
    (query.trim().length < 2 || action.label.toLowerCase().includes(query.trim().toLowerCase()))
  );
  const modules = results.modules.filter((module) => canAccessNav(role, module.key));

  const hasResults = quickActions.length > 0 || ['modules', 'staff', 'participants', 'documents', 'tasks', 'incidents', 'risks', 'policies', 'goals', 'assets'].some((k) => (results[k] || []).length > 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Search everything (Ctrl+K)"
        className="flex w-full items-center justify-between gap-1.5 rounded-full border border-slate-300 bg-white px-2.5 py-0.5 text-[9.5px] font-bold text-[#0A2B6D] shadow-2xs transition-all hover:border-[#0072FF] hover:bg-[#F5F0FF] hover:text-[#0072FF]"
      >
        <span className="inline-flex items-center gap-1 truncate">
          <Search className="h-2.5 w-2.5 shrink-0 text-[#5A00D6]" />
          <span className="truncate">Search workspace…</span>
        </span>
        <kbd className="shrink-0 rounded border border-slate-200 bg-slate-50 px-1 py-0 text-[8px] font-extrabold text-[#5A00D6]">Ctrl K</kbd>
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-4 pt-16 sm:pt-24">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl">
            <Command shouldFilter={false} loop>
              <CommandInput
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                autoFocus
                placeholder="Search people, documents, tasks, modules or run an action…"
              />
              {searching && (
                <div className="flex items-center gap-2 px-4 pt-2 text-[11px] text-foreground/40">
                  <Loader2 className="h-3 w-3 animate-spin text-brand" /> Searching the organisation…
                </div>
              )}
              <CommandList className="max-h-[22rem]">
                {!hasResults && query.trim().length >= 2 && !searching && (
                  <CommandEmpty>No matches for “{query.trim()}”</CommandEmpty>
                )}
                {quickActions.length > 0 && (
                  <CommandGroup heading="Quick Actions">
                    {quickActions.map((a) => (
                      <CommandItem key={a.id} value={a.id} onSelect={() => go(a.path)}>
                        <Plus className="text-brand" />
                        <span className="font-medium">{a.label}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{a.hint}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {quickActions.length > 0 && modules.length > 0 && <CommandSeparator />}
                {modules.length > 0 && (
                  <CommandGroup heading="Modules">
                    {modules.map((m) => (
                      <CommandItem key={m.key} value={`mod-${m.key}`} onSelect={() => go(m.path)}>
                        <m.icon className="text-brand" />
                        <span className="font-medium">{m.label}</span>
                        <span className="ml-auto hidden truncate text-[11px] text-foreground/40 sm:block">{m.blurb}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {results.staff.length > 0 && (
                  <CommandGroup heading="Staff">
                    {results.staff.map((s) => (
                      <CommandItem key={s.id} value={`staff-${s.id}`} onSelect={() => go(`/our-employees/${s.id}`)}>
                        <Users className="text-brand" />
                        <span className="font-medium">{s.full_name}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{s.position || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {results.participants.length > 0 && (
                  <CommandGroup heading="Participants">
                    {results.participants.map((p) => (
                      <CommandItem key={p.id} value={`part-${p.id}`} onSelect={() => go(`/our-participants/${p.id}`)}>
                        <Heart className="text-brand" />
                        <span className="font-medium">{p.full_name}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{p.status || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {results.documents.length > 0 && (
                  <CommandGroup heading="Documents">
                    {results.documents.map((d) => (
                      <CommandItem key={d.id} value={`doc-${d.id}`} onSelect={() => go('/documents')}>
                        <FolderOpen className="text-brand" />
                        <span className="font-medium">{d.title}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{d.document_type || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {results.tasks.length > 0 && (
                  <CommandGroup heading="Tasks">
                    {results.tasks.map((t) => (
                      <CommandItem key={t.id} value={`task-${t.id}`} onSelect={() => go('/tasks')}>
                        <ClipboardList className="text-brand" />
                        <span className="font-medium">{t.title}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{t.status || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {(results.incidents || []).length > 0 && (
                  <CommandGroup heading="Incidents (Incident 360°)">
                    {results.incidents.map((inc) => (
                      <CommandItem key={inc.id} value={`inc-${inc.id}`} onSelect={() => go(`/incidents/${inc.id}`)}>
                        <Zap className="text-brand" />
                        <span className="font-medium">{inc.title}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{inc.severity || inc.status || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {(results.risks || []).length > 0 && (
                  <CommandGroup heading="Risks (Risk 360°)">
                    {results.risks.map((r) => (
                      <CommandItem key={r.id} value={`risk-${r.id}`} onSelect={() => go('/risks')}>
                        <Zap className="text-brand" />
                        <span className="font-medium">{r.title}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{r.rating || r.status || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {(results.policies || []).length > 0 && (
                  <CommandGroup heading="Policies, Standards & Procedures">
                    {results.policies.map((pol) => (
                      <CommandItem key={pol.id} value={`pol-${pol.id}`} onSelect={() => go('/compliance')}>
                        <FolderOpen className="text-brand" />
                        <span className="font-medium">{pol.document_name}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{pol.category || pol.status || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {(results.goals || []).length > 0 && (
                  <CommandGroup heading="Goals & Outcomes">
                    {results.goals.map((g) => (
                      <CommandItem key={g.id} value={`goal-${g.id}`} onSelect={() => go('/goals')}>
                        <ClipboardList className="text-brand" />
                        <span className="font-medium">{g.title}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{g.status || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                {(results.assets || []).length > 0 && (
                  <CommandGroup heading="Assets, Contracts & Fleet">
                    {results.assets.map((a) => (
                      <CommandItem key={a.id} value={`asset-${a.id}`} onSelect={() => go('/assets')}>
                        <FolderOpen className="text-brand" />
                        <span className="font-medium">{a.name}</span>
                        <span className="ml-auto text-[11px] text-foreground/40">{a.category || ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
              <div className="flex items-center justify-between border-t px-4 py-2 text-[11px] text-foreground/40">
                <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> ↑↓ to navigate · Enter to open</span>
                <span>Ctrl + K to open · Esc to close</span>
              </div>
            </Command>
            <button
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-lg p-1 hover:bg-brand/5"
              title="Close"
            >
              <X className="h-4 w-4 text-foreground/40" />
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}