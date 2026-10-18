import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Download, Globe, Phone, Search } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { RESOURCE_CATEGORIES, SUPPORT_RESOURCE_LIBRARY } from '@/lib/supportResourceLibrary';

const categoryTone = (c) => {
  switch (c) {
    case 'Crisis & Mental Health': return 'bg-danger/10 text-danger';
    case 'Disability & NDIS': return 'bg-brand/10 text-brand';
    case 'Health & Medical': return 'bg-teal/10 text-teal';
    case 'Family & Safety': return 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300';
    case 'Government & Legal': return 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    case 'Housing & Relief': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300';
    default: return 'bg-muted text-muted-foreground';
  }
};

export default function ResourceLibrary() {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const visible = useMemo(() => SUPPORT_RESOURCE_LIBRARY.filter((r) =>
    (category === 'All' || r.category === category) &&
    (!search.trim() || [r.name, r.description, r.phone].some((v) => (v || '').toLowerCase().includes(search.trim().toLowerCase())))
  ), [search, category]);

  const exportList = () => {
    downloadCsv('Support-Resource-Library.csv', [
      { key: 'name', label: 'Service' }, { key: 'category', label: 'Category' },
      { key: 'phone', label: 'Phone' }, { key: 'hours', label: 'Hours' },
      { key: 'website', label: 'Website' }, { key: 'description', label: 'When to use' },
    ], visible);
    toast({ title: 'Resource library exported' });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-8" placeholder="Search services, needs or phone numbers..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All categories</SelectItem>
            {RESOURCE_CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={exportList}><Download className="mr-1.5 h-3.5 w-3.5" />Export</Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((r) => (
          <Card key={r.name} className="flex flex-col">
            <CardContent className="flex flex-1 flex-col p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-snug">{r.name}</p>
                <Badge variant="secondary" className={`shrink-0 text-[10px] ${categoryTone(r.category)}`}>{r.category}</Badge>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{r.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">Hours: {r.hours || '-'}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                {r.phone && (
                  <a href={`tel:${r.phone.replace(/\s/g, '')}`} className="inline-flex h-7 items-center gap-1.5 rounded-md bg-brand px-3 text-xs font-semibold text-white hover:bg-brand/90">
                    <Phone className="h-3 w-3" />{r.phone}
                  </a>
                )}
                {r.website && (
                  <a href={r.website} target="_blank" rel="noreferrer" className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-brand hover:bg-brand/5">
                    <Globe className="h-3 w-3" />Website
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {visible.length === 0 && (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No services match this search.</CardContent></Card>
      )}
    </div>
  );
}