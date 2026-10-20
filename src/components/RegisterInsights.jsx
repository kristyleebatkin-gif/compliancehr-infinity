import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';

// AI as a default layer: a live, number-grounded summary on top of every register
// (what changed, what needs attention, one suggested next action). Silent on failure
// so a register never breaks because the insight did.
export default function RegisterInsights({ module, compact = false, wrapSummary = false }) {
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
    <div className={`flex items-center gap-2 rounded-xl border border-brand/25 bg-gradient-brand-soft ${compact ? 'px-2.5 py-1' : 'flex-wrap px-3.5 py-2'} ${wrapSummary ? 'flex-wrap' : ''} shadow-sm`}>
      <span className={`gradient-brand flex shrink-0 items-center justify-center rounded-md shadow-sm ${compact ? 'h-5 w-5' : 'h-6 w-6'}`}><Sparkles className={compact ? 'h-3 w-3 text-white' : 'h-3.5 w-3.5 text-white'} /></span>
      <p className={`min-w-0 text-foreground ${wrapSummary ? 'flex-[1_1_16rem] whitespace-normal break-words leading-snug' : 'flex-1 truncate'} ${compact ? 'text-xs font-medium' : 'text-sm font-medium'}`} title={insights.summary}>{insights.summary}</p>
      {compact ? (
        <span className={`flex items-center gap-1.5 text-[11px] font-semibold tabular-nums text-foreground/60 ${wrapSummary ? 'max-w-full flex-wrap' : 'shrink-0'}`}>
          {data.total} records · {data.open} open
          {data.overdue > 0 && <span className="text-warning">{data.overdue} overdue</span>}
          {data.expiring > 0 && <span className="text-danger">{data.expiring} due 30d</span>}
        </span>
      ) : (
        <>
          <Badge variant="secondary" className="tabular-nums">{data.total} records</Badge>
          <Badge variant="secondary" className="tabular-nums">{data.open} open</Badge>
          {data.overdue > 0 && <Badge className="bg-warning/10 text-warning border border-warning/30 tabular-nums">{data.overdue} overdue</Badge>}
          {data.expiring > 0 && <Badge className="bg-danger/10 text-danger border border-danger/30 tabular-nums">{data.expiring} due in 30 days</Badge>}
        </>
      )}
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={load} title="Refresh insight"><RefreshCw className="h-3.5 w-3.5" /></Button>
    </div>
  );
}