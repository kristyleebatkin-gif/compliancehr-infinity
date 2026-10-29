import React, { useState } from 'react';
import { JARGON_TERMS } from '@/lib/ndisDummiesData';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function JargonBuster() {
  const [query, setQuery] = useState('');
  const filtered = JARGON_TERMS.filter(
    (item) =>
      item.term.toLowerCase().includes(query.toLowerCase()) ||
      item.plain.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-foreground bg-card p-5">
        <h2 className="text-xl font-black text-foreground">NDIS Jargon Buster</h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Type any acronym or confusing phrase below to see what it actually means in everyday language.
        </p>
        <div className="relative mt-3 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search terms like LAC, SIL, Plan Manager..."
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((item) => (
          <div key={item.term} className="rounded-xl border-2 border-foreground bg-card p-4">
            <p className="text-sm font-black text-primary">{item.term}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{item.plain}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-2 rounded-xl border-2 border-dashed border-border p-6 text-center text-sm font-bold text-muted-foreground">
            No matching term found — try another word.
          </p>
        )}
      </div>
    </div>
  );
}