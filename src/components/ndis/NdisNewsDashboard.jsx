import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Layers, Newspaper } from 'lucide-react';

export default function NdisNewsDashboard({ stats }) {
  return <div className="grid gap-3 sm:grid-cols-3">
    <section className="ndis-panel ndis-accent-primary p-4"><div className="ndis-panel-icon mb-3"><Newspaper className="h-4 w-4" /></div><p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Updates tracked</p><p className="ndis-panel-stat mt-1 text-3xl font-extrabold tabular-nums">{stats.total}</p></section>
    <section className="ndis-panel ndis-accent-evidence p-4"><div className="ndis-panel-icon mb-3"><CalendarDays className="h-4 w-4" /></div><p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Published last 30 days</p><p className="ndis-panel-stat mt-1 text-3xl font-extrabold tabular-nums">{stats.recent}</p></section>
    <section className="ndis-panel ndis-accent-pink p-4"><div className="ndis-panel-icon mb-3"><Layers className="h-4 w-4" /></div><p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">In library by type</p><div className="mt-2 flex flex-wrap gap-1.5">{['News', 'Update', 'Newsletter', 'Consultation'].map((type) => <Badge key={type} variant="outline" className="border-primary/15 bg-card/70 text-[10px]">{type} · {stats.byType[type] || 0}</Badge>)}</div></section>
  </div>;
}