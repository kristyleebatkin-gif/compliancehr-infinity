import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function MeetingSearchFilters({ search, onSearch, typeFilter, onTypeFilter, types }) {
  return <div className="operations-search module-filter-bar flex flex-wrap items-center gap-2">
    <div className="relative min-w-52 flex-1">
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input type="search" aria-label="Search meetings" className="pl-8" placeholder="Search meetings, chair or attendees..." value={search} onChange={(e) => onSearch(e.target.value)} />
    </div>
    <Select value={typeFilter} onValueChange={onTypeFilter}>
      <SelectTrigger className="w-52"><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="All">All meeting types</SelectItem>{types.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
    </Select>
  </div>;
}