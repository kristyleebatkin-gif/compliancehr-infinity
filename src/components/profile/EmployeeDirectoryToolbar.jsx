import React from 'react';
import { Search, UserRound, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function EmployeeDirectoryToolbar({ search, onSearch, progressAllowed }) {
  return <div className="employee-directory-toolbar flex flex-nowrap items-center gap-2 overflow-x-auto rounded-xl border border-primary/20 bg-card p-2">
    <div className="relative min-w-28 flex-1">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" aria-label="Search employees" className="pl-8" placeholder="Search employees…" value={search} onChange={event => onSearch(event.target.value)} />
    </div>
    <TabsList className="w-auto flex-nowrap">
      <TabsTrigger value="profiles">Employee profiles</TabsTrigger>
      {progressAllowed && <TabsTrigger value="progress" data-dashboard-tone="blue"><TrendingUp />Staff progress</TabsTrigger>}
    </TabsList>
    <Button asChild variant="outline" className="h-11 shrink-0 border-primary/40 bg-profile-lilac text-xs font-bold text-foreground"><Link to="/my-profile"><UserRound />My profile</Link></Button>
  </div>;
}