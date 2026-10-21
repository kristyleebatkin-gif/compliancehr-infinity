import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RefreshCw, Search, LayoutDashboard, Mail } from 'lucide-react';

export default function NdisNewsToolbar({ refresh, refreshing, search, onSearch }) {
  return <div className="ndis-news-toolbar flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-card p-2 shadow-panel">
    <Button size="sm" onClick={refresh} disabled={refreshing} className="shrink-0 border border-primary/25 bg-primary/10 text-primary hover:bg-primary/20"><RefreshCw className={refreshing ? 'h-3.5 w-3.5 animate-spin' : 'h-3.5 w-3.5'} />{refreshing ? 'Checking NDIS...' : 'Refresh updates'}</Button>
    <div className="ndis-search relative min-w-32 flex-1"><Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" /><Input type="search" aria-label="Search NDIS updates and newsletters" placeholder="Search updates..." value={search} onChange={(event) => onSearch(event.target.value)} className="h-8 pl-7 text-xs" /></div>
    <TabsList data-dashboard-tabs={undefined} className="ndis-news-tabs w-auto shrink-0 flex-nowrap gap-1 bg-muted/50 p-1 shadow-none">
      <TabsTrigger data-dashboard-tab={undefined} value="updates" className="min-h-7 px-2 text-[11px]"><LayoutDashboard />Updates &amp; News</TabsTrigger>
      <TabsTrigger data-dashboard-tab={undefined} value="newsletters" className="min-h-7 px-2 text-[11px]"><Mail />Newsletters</TabsTrigger>
    </TabsList>
  </div>;
}