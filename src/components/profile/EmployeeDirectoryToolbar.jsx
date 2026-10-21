import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmployeeDirectoryToolbar({ search, onSearch, progressAllowed }) {
  return <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/20 bg-card p-2">
    <div className="relative min-w-40 flex-1">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" aria-label="Search employees" className="pl-8" placeholder="Search employees…" value={search} onChange={event => onSearch(event.target.value)} />
    </div>
    <TabsList className="w-auto flex-nowrap">
      <TabsTrigger value="profiles">Employee profiles</TabsTrigger>
      {progressAllowed && <TabsTrigger value="progress">Staff progress</TabsTrigger>}
    </TabsList>
  </div>;
}