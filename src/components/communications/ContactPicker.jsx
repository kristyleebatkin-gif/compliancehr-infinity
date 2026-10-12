import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';

export default function ContactPicker({ contacts = [], selected = [], onChange }) {
  const [search, setSearch] = useState('');
  const toggle = (email) => onChange(selected.includes(email) ? selected.filter((e) => e !== email) : [...selected, email]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => !q || String(c.name).toLowerCase().includes(q) || String(c.email).toLowerCase().includes(q));
  }, [contacts, search]);

  return (
    <div className="rounded-lg border border-input p-2">
      <Input placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} className="mb-2 h-8" />
      <div className="max-h-48 space-y-0.5 overflow-y-auto">
        {filtered.map((c) => (
          <label key={c.email} className="flex cursor-pointer items-center gap-2 rounded px-1.5 py-1 text-sm hover:bg-accent">
            <input type="checkbox" checked={selected.includes(c.email)} onChange={() => toggle(c.email)} className="h-3.5 w-3.5" />
            <span className="truncate">{c.name}</span>
            <span className="ml-auto shrink-0 text-xs text-muted-foreground">{c.type}</span>
          </label>
        ))}
        {filtered.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">No contacts match.</p>}
      </div>
      <p className="mt-1.5 px-1 text-xs text-muted-foreground">{selected.length} selected</p>
    </div>
  );
}