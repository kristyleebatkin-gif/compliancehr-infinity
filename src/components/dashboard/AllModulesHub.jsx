import React, { useState } from 'react';
import { canAccessNav, ROLES } from '@/lib/roles';
import { useRole } from '@/lib/useRole';
import { MODULE_DIRECTORY, NAV_GROUPS } from '@/lib/moduleDirectory';
import { LayoutGrid, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import ModuleHubItem from '@/components/dashboard/ModuleHubItem';

export default function AllModulesHub() {
  const { role } = useRole();
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const modules = MODULE_DIRECTORY.filter((module) => canAccessNav(role, module.key)).map((module) => module.key === 'my-profile' ? { ...module, label: role === ROLES.PARTICIPANT ? 'My participant profile' : 'My employee profile' } : module);
  const groups = NAV_GROUPS.filter((group) => modules.some((module) => group.keys.includes(module.key)));
  const selected = groups.find((group) => group.label === category);
  const term = search.trim().toLowerCase();
  const visible = modules.filter((module) => (!selected || selected.keys.includes(module.key)) && `${module.label} ${module.blurb}`.toLowerCase().includes(term));
  return <section aria-labelledby="all-modules-hub" className="overflow-hidden rounded-2xl border border-primary/20 bg-card shadow-panel">
    <div className="h-1 gradient-brand" />
    <div className="space-y-3 p-3 sm:p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5"><span className="rounded-lg bg-primary/10 p-2 text-primary"><LayoutGrid className="h-4 w-4" /></span><div><h2 id="all-modules-hub" className="font-display text-base font-bold">All modules</h2><p className="text-xs text-muted-foreground">Find a tool, register or workflow.</p></div></div>
        <div className="relative w-full sm:w-56"><Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input aria-label="Find a workspace module" placeholder="Find a module…" value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 pl-8 pr-8 text-xs" />{search && <button type="button" aria-label="Clear module search" onClick={() => setSearch('')} className="absolute right-1 top-1 rounded p-1.5 text-muted-foreground"><X className="h-4 w-4" /></button>}</div>
      </div>
      <div className="flex flex-wrap gap-1.5" aria-label="Module categories">
        {['All', ...groups.map((group) => group.label)].map((label) => <button key={label} type="button" aria-pressed={category === label} onClick={() => setCategory(label)} className={`rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${category === label ? 'border-primary/25 bg-primary/10 text-primary' : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'}`}>{label}</button>)}
      </div>
      <div className="flex items-center justify-between border-t border-border/70 pt-2 text-[11px] text-muted-foreground"><span>{category === 'All' ? 'Workspace directory' : category}</span><span aria-live="polite">{visible.length} of {modules.length} modules</span></div>
      {visible.length ? <div role="region" aria-label="Available modules" tabIndex={0} className="grid max-h-96 grid-cols-1 gap-2 overflow-y-auto overscroll-contain pr-1 sm:grid-cols-2 2xl:grid-cols-3">{visible.map((module) => <ModuleHubItem key={module.key} module={module} />)}</div> : <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No matching modules. Try another name or category.</div>}
    </div>
  </section>;
}