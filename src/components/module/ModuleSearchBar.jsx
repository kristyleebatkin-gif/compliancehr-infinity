import React from 'react';
import { Search } from 'lucide-react';

export default function ModuleSearchBar({ value, onChange, placeholder = 'Search this module…' }) {
  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-7 w-full rounded-md border border-border bg-white pl-7 pr-2 text-xs outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}