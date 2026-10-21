import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import '@/components/communications/communicationNavigation.css';

const TONES = {
  alerts: 'danger', logs: 'muted', diary: 'primary', inbox: 'teal',
  templates: 'warning', email: 'teal', bulk: 'pink', banter: 'safe',
  shoutouts: 'warning', feed: 'safe', complaints: 'danger', todo: 'primary',
  video: 'teal', ai: 'primary', 'shift-notes': 'safe', 'employee-log': 'pink',
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
      {shown.map(([value, Icon, label]) => <TabsTrigger key={value} value={value} data-tone={TONES[value]} className="communication-navigation-tile">
        <span className="communication-navigation-icon"><Icon aria-hidden="true" /></span>
        <span>{label}</span>
      </TabsTrigger>)}
    </TabsList>
    {shown.length === 0 && <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">No dashboards match this search. <button type="button" className="font-semibold text-primary underline" onClick={() => setSearch('')}>Clear search</button></p>}
  </div>;
}