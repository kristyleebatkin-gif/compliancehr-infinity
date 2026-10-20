import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

// AI as a default layer: a live, number-grounded summary on top of every register
// (what changed, what needs attention, one suggested next action). Silent on failure
// so a register never breaks because the insight did.
export default function RegisterInsights({ module }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('registerInsights', { module });
      setData(res.data);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [module]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3.5 py-2 shadow-sm">
        <Loader2 className="h-3.5 w-3.5 animate-spin text-brand" />
        <span className="text-xs text-muted-foreground">Reading the register…</span>
      </div>
    );
  }
  if (!data || !data.insights) return null;

  const { insights } = data;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-brand/25 bg-gradient-brand-soft px-3.5 py-2 shadow-sm">
      <span className="gradient-brand flex h-6 w-6 shrink-0 items-center justify-center rounded-md shadow-sm"><Sparkles className="h-3.5 w-3.5 text-white" /></span>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground" title={insights.summary}>{insights.summary}</p>
      <Badge variant="secondary" className="tabular-nums">{data.total} records</Badge>
      <Badge variant="secondary" className="tabular-nums">{data.open} open</Badge>
      {data.overdue > 0 && <Badge className="bg-warning/10 text-warning border border-warning/30 tabular-nums">{data.overdue} overdue</Badge>}
      {data.expiring > 0 && <Badge className="bg-danger/10 text-danger border border-danger/30 tabular-nums">{data.expiring} due in 30 days</Badge>}
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={load} title="Refresh insight"><RefreshCw className="h-3.5 w-3.5" /></Button>
    </div>
  );
}