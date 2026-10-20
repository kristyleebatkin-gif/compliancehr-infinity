import React from 'react';
import { Link } from 'react-router-dom';
import { NAV_GROUPS } from '@/lib/moduleDirectory';

export default function WorkspaceSidebarNavigation({ items, isActive, navLabel }) {
  return <nav aria-label="Workspace navigation" className="min-h-0 flex-1 overflow-y-auto px-3 pb-3">
    {NAV_GROUPS.map((group) => {
      const links = items.filter((item) => group.keys.includes(item.key));
      if (!links.length) return null;
      return <section key={group.label} className="mb-3">
        <h2 className="mb-1 flex items-center gap-2 px-2 pt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{group.label}<span className="h-px flex-1 bg-border/70" /></h2>
        <div className="space-y-0.5">{links.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return <Link key={item.path} to={item.path} aria-current={active ? 'page' : undefined} title={navLabel(item)} className={`relative flex min-h-9 items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] leading-4 transition-colors ${active ? 'bg-primary/10 font-bold text-primary ring-1 ring-primary/15' : 'font-medium text-foreground/75 hover:bg-accent hover:text-accent-foreground'}`}>
            {active && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full gradient-brand" />}
            <Icon className="h-4 w-4 shrink-0" /><span className="min-w-0">{navLabel(item)}</span>
          </Link>;
        })}</div>
      </section>;
    })}
  </nav>;
}