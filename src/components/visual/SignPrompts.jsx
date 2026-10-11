import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SIGN_CATEGORIES, SIGN_LIBRARY } from '@/lib/signPrompts';
import { printSignSheet } from '@/lib/visualPrint';
import AttachSignDialog from '@/components/visual/AttachSignDialog';
import { Hand, Info, Paperclip, Printer } from 'lucide-react';

export default function SignPrompts() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [attachSign, setAttachSign] = useState(null);

  const signs = useMemo(() => SIGN_LIBRARY.filter((s) => {
    const matchesCategory = category === 'all' || s.category === category;
    const matchesSearch = !search.trim() || s.word.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [search, category]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Hand className="h-4 w-4 text-brand" />
          <span className="text-sm font-semibold">Sign language prompts</span>
          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Input placeholder="Search signs..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-44" />
            <div className="grid gap-1.5">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 w-[150px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {SIGN_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="outline" onClick={() => printSignSheet(signs)}><Printer className="mr-2 h-3.5 w-3.5" />Print sheet ({signs.length})</Button>
          </div>
        </div>
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-xs text-muted-foreground">
            Simplified gesture prompts for visual support and communication practice. They are plain-language
            descriptions of common Auslan-style signs, not certified sign language instruction. Attach signs to
            routine steps in the Visual Routine tab.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {signs.map((s) => (
            <div key={s.word} className="rounded-xl border border-border/60 p-4 text-center">
              <div className="text-4xl">{s.emoji}</div>
              <div className="mt-1 text-sm font-bold">{s.word}</div>
              <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-brand">{s.category}</div>
              <p className="mt-2 text-xs text-muted-foreground">{s.description}</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => setAttachSign(s)}><Paperclip className="h-3.5 w-3.5" />Attach to routine</Button>
            </div>
          ))}
        </div>
        {signs.length === 0 && <p className="text-sm text-muted-foreground">No signs match your search.</p>}
      </div>

      <AttachSignDialog sign={attachSign} onClose={() => setAttachSign(null)} />
    </div>
  );
}