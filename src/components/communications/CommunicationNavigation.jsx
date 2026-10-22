import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import '@/components/communications/communicationNavigation.css';

// One fixed colour per tile, taken from the 45-module dashboard palette
// (src/components/dashboard/dashboardModuleColours.js).
const COLOURS = {
  alerts: '#dc2626', logs: '#64748b', diary: '#0891b2', inbox: '#0ea5e9',
  templates: '#ca8a04', email: '#059669', bulk: '#f97316', banter: '#22c55e',
  shoutouts: '#ec4899', feed: '#0d9488', complaints: '#b91c1c', todo: '#ef4444',
  'task-dashboard': '#4338ca', guide: '#65a30d', video: '#6366f1', ai: '#8b5cf6',
  'shift-notes': '#14b8a6', 'employee-log': '#7c3aed',
};

export default function CommunicationNavigation({ tabs }) {
  const [search, setSearch] = useState('');
  const shown = tabs.filter(([, , label]) => label.toLowerCase().includes(search.trim().toLowerCase()));
  return <div className="communication-dashboard space-y-3">
    <div className="communication-dashboard-search relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" aria-label="Search communication dashboards" placeholder="Search communication dashboards…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
    </div>
    <TabsList aria-label="Communication dashboard" className="communication-navigation">
      {shown.map(([value, Icon, label]) => {
        const c = COLOURS[value] || '#0891b2';
        return (
          <TabsTrigger
            key={value}
            value={value}
            className="group relative flex min-h-28 min-w-0 flex-col items-center overflow-hidden rounded-xl border p-2.5 text-center font-semibold text-foreground transition-all hover:-translate-y-1 hover:shadow-lg"
            style={{ '--tile-tone': c, borderColor: `${c}40`, background: `linear-gradient(165deg, ${c}29 0%, ${c}12 46%, hsl(var(--card)) 82%)`, boxShadow: `0 10px 30px -18px ${c}77` }}
          >
            <span className="absolute inset-x-0 top-0 h-1.5" style={{ background: `linear-gradient(90deg, ${c}, ${c}99)` }} />
            <span className="absolute -right-8 -top-10 h-24 w-24 rounded-full opacity-15" style={{ backgroundColor: c }} />
            <span className="communication-navigation-icon relative" style={{ background: `linear-gradient(135deg, ${c}, ${c}cc)` }}><Icon aria-hidden="true" /></span>
            <span className="relative mt-1 text-sm font-bold">{label}</span>
          </TabsTrigger>
        );
      })}
    </TabsList>
    {shown.length === 0 && <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">No dashboards match this search. <button type="button" className="font-semibold text-primary underline" onClick={() => setSearch('')}>Clear search</button></p>}
  </div>;
}