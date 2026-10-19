import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, RefreshCw, Loader2, ArrowRight } from 'lucide-react';

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
      <Card className="shadow-panel"><CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin text-brand" /> Reading the register…
      </CardContent></Card>
    );
  }
  if (!data || !data.insights) return null;

  const { insights } = data;

  return (
    <Card className="shadow-panel">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="gradient-brand flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm"><Sparkles className="h-4 w-4 text-white" /></span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-brand">AI register insight</p>
              <p className="font-editorial text-[1.05rem] leading-snug text-foreground">{insights.summary}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={load} title="Refresh insight">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {Array.isArray(insights.attention) && insights.attention.length > 0 && (
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {insights.attention.slice(0, 3).map((a, i) => (
              <div key={i} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground"><AlertTriangle className="h-3.5 w-3.5 text-warning" />{a.item}</p>
                <p className="mt-1 text-xs text-muted-foreground">{a.detail}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="tabular-nums">{data.total} records</Badge>
          <Badge variant="secondary" className="tabular-nums">{data.open} open</Badge>
          {data.overdue > 0 && <Badge className="bg-warning/10 text-warning border border-warning/30 tabular-nums">{data.overdue} overdue</Badge>}
          {data.expiring > 0 && <Badge className="bg-danger/10 text-danger border border-danger/30 tabular-nums">{data.expiring} due in 30 days</Badge>}
          {Array.isArray(insights.suggestions) && insights.suggestions.slice(0, 2).map((s, i) => (
            <span key={i} className="flex items-center gap-1 text-xs text-muted-foreground"><ArrowRight className="h-3 w-3 text-brand" />{s}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}