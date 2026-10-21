import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { isAfter, subDays, parseISO } from 'date-fns';

const sourceTone = (s) => (s === 'NDIS Commission' ? 'bg-warning/10 text-warning' : s === 'NDIS Agency' ? 'bg-brand/10 text-brand' : 'bg-muted text-foreground/70');

export default function NdisUpdateList({ items, loading, emptyText }) {
  if (loading) {
    return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>;
  }
  if (!items.length) {
    return <Card><CardContent className="p-10 text-center text-muted-foreground">{emptyText || 'No items yet - use "Refresh updates" to fetch the latest.'}</CardContent></Card>;
  }
  return (
    <div className="grid gap-3">
      {items.map((item, i) => {
        let isNew = false;
        try { isNew = item.published_date && isAfter(parseISO(item.published_date), subDays(new Date(), 14)); } catch { isNew = false; }
        const safeUrl = item.url && /^https?:\/\//i.test(item.url) ? item.url : null;
        return (
          <Card key={item.id || i} className={`ndis-panel ${item.source === 'NDIS Commission' ? 'ndis-accent-evidence' : 'ndis-accent-primary'}`}>
            <CardContent className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge className={`text-[10px] ${sourceTone(item.source)}`}>{item.source || 'NDIS'}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{item.news_type || 'News'}</Badge>
                    {item.category && <Badge variant="outline" className="text-[10px]">{item.category}</Badge>}
                    {isNew && <Badge className="bg-safe/10 text-safe text-[10px]">New</Badge>}
                  </div>
                  <p className="mt-2 font-semibold leading-snug">
                    {safeUrl ? <a href={safeUrl} target="_blank" rel="noreferrer" className="hover:text-brand hover:underline">{item.title}</a> : item.title}
                  </p>
                  {item.published_date && <p className="text-xs text-muted-foreground">{item.published_date}</p>}
                </div>
                {safeUrl && (
                  <a href={safeUrl} target="_blank" rel="noreferrer" className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-semibold text-brand hover:bg-brand/5">
                    <ExternalLink className="h-3 w-3" />Read at source
                  </a>
                )}
              </div>
              {item.summary && <p className="mt-2 border-t border-border/60 pt-2 text-xs text-muted-foreground">{item.summary}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}