import React from 'react';
import { Search } from 'lucide-react';

export default function ModuleSearchBar({ value, onChange, placeholder = 'Search this module…' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-border bg-white pl-8 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}