import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { useRole } from '@/lib/useRole';
import { emptySearchResults, searchIdentity, searchModules, searchEnterprise } from '@/lib/enterpriseSearch';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from '@/components/ui/command';
import { Search, X, Loader2, Users, Heart, FolderOpen, ClipboardList, Zap, Plus } from 'lucide-react';

const EMPTY = emptySearchResults();

const QUICK_ACTIONS = [
  { id: 'qa-onboarding', label: 'Open 5-Step Provider Setup Checklist', event: 'chr-open-onboarding-checklist', hint: 'Guided activation & readiness' },
  { id: 'qa-incident', label: 'New Incident Report (24h/5d SIRS)', path: '/incidents/new', hint: 'Report & auto-escalate CAPA' },
  { id: 'qa-roster', label: 'Schedule Screened Roster Shift', path: '/roster', hint: 'Open roster workspace' },
  { id: 'qa-participant', label: 'New Participant Intake', path: '/intake/participant', hint: 'Onboard a participant' },
  { id: 'qa-employee', label: 'New Employee Intake', path: '/intake/employee', hint: 'Onboard an employee' },
  { id: 'qa-auditor', label: 'Preview External Auditor Portal', path: '/auditor-portal', hint: 'Consent-gated evidence view' },
  { id: 'qa-ai', label: 'Ask Infinity AI Copilot', path: '/assistant', hint: 'Instant NDIS & HR intelligence' },
  { id: 'qa-compliance', label: 'Compliance & Audit Centre', path: '/compliance', hint: 'Assessments, evidence and audits' },
  { id: 'qa-dashboard', label: 'Go to Executive Dashboard', path: '/dashboard', hint: 'Live overview' },
];

export default function GlobalSearch() {
  const { navRole: role, user, can } = useRole();
  const scope = searchIdentity(user);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchState, setSearchState] = useState({ scope: null, results: EMPTY, unavailable: [], blocked: false });
  const [retry, setRetry] = useState(0);
  const results = searchState.scope === scope ? searchState.results : EMPTY;
  const unavailable = searchState.scope === scope ? searchState.unavailable : [];
  const blocked = searchState.scope === scope && searchState.blocked;
  const setResults = (next) => setSearchState({ scope, results: next, unavailable: [], blocked: false });
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
    const term = query.trim();
    const modules = searchModules(MODULE_DIRECTORY, term, can);
    setSearchState({ scope, results: { ...EMPTY, modules }, unavailable: [], blocked: !scope });
    if (term.length < 2 || !scope) {
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const response = await searchEnterprise({ entities: base44.entities, term, can, user });
        if (!cancelled) setSearchState({ scope, ...response, results: { ...response.results, modules } });
      } catch {
        if (!cancelled) setSearchState({ scope, results: { ...EMPTY, modules }, unavailable: ['Organisation search'], blocked: false });
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query, open, role, scope, retry]);

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const actionKeys = {
    'qa-onboarding': 'dashboard', 'qa-incident': 'incidents', 'qa-roster': 'rostering',
    'qa-participant': 'intake', 'qa-employee': 'intake', 'qa-auditor': 'auditor-portal',
    'qa-ai': 'assistant', 'qa-compliance': 'compliance', 'qa-dashboard': 'dashboard',
  };
  const quickActions = QUICK_ACTIONS.filter((action) =>
    can(actionKeys[action.id]) &&
    (query.trim().length < 2 || action.label.toLowerCase().includes(query.trim().toLowerCase()))
  );
  const modules = results.modules.filter((module) => can(module.key));

  const hasResults = quickActions.length > 0 || ['modules', 'staff', 'participants', 'documents', 'tasks', 'incidents', 'risks', 'policies', 'goals', 'assets', 'audits', 'evidence', 'training', 'projects', 'governance'].some((k) => (results[k] || []).length > 0);

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
                placeholder="Search people, audits, evidence, training, projects…"
              />
              {searching && (
                <div className="flex items-center gap-2 px-4 pt-2 text-[11px] text-foreground/40">
                  <Loader2 className="h-3 w-3 animate-spin text-brand" /> Searching the organisation…
                </div>
              )}
              {blocked && query.trim().length >= 2 && <p role="status" className="px-4 py-2 text-sm text-[#0A2B6D]">Organisation search requires an active approved account with a business assigned.</p>}
              {!!unavailable.length && <div role="status" className="px-4 py-2 text-sm text-[#0A2B6D]">
                <p>Search is incomplete. Unavailable: {unavailable.join(', ')}.</p>
                <button type="button" onClick={() => setRetry((value) => value + 1)} className="mt-1 min-h-11 font-bold text-[#0072FF]">Retry search</button>
              </div>}
              <CommandList className="max-h-[22rem]">
                {!hasResults && query.trim().length >= 2 && !searching && !blocked && !unavailable.length && (
                  <CommandEmpty>No matches for “{query.trim()}”</CommandEmpty>
                )}
                {quickActions.length > 0 && (
                  <CommandGroup heading="Quick Actions">
                    {quickActions.map((a) => (
                      <CommandItem
                        key={a.id}
                        value={a.id}
                        onSelect={() => {
                          if (a.event) {
                            setOpen(false);
                            window.dispatchEvent(new CustomEvent(a.event));
                          } else {
                            go(a.path);
                          }
                        }}
                      >
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
                {[
                  { key: 'audits', label: 'Audits', path: '/compliance?tab=audits' },
                  { key: 'evidence', label: 'Evidence', path: '/compliance' },
                  { key: 'training', label: 'Training', path: '/training' },
                  { key: 'projects', label: 'Projects', path: '/projects' },
                  { key: 'governance', label: 'Governance records', path: '/governance' },
                ].map((source) => results[source.key]?.length > 0 && <CommandGroup key={source.key} heading={source.label}>
                  {results[source.key].map((record) => <CommandItem key={record.id} value={source.key + '-' + record.id} onSelect={() => go(source.path)}>
                    <FolderOpen className="text-brand" /><span className="font-medium">{record.title || record.name}</span>
                    <span className="ml-auto text-[11px] text-foreground/60">{record.status || record.standard || record.record_type || 'Open workspace'}</span>
                  </CommandItem>)}
                </CommandGroup>)}
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