import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ScoreRing from '@/components/ScoreRing';
import { useToast } from '@/components/ui/use-toast';
import { ChevronRight, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const BADGE = {
  pass: 'bg-safe/10 text-safe border-transparent',
  attention: 'bg-warning/10 text-warning border-transparent',
  fail: 'bg-danger/10 text-danger border-transparent',
};
const LABEL = { pass: 'Pass', attention: 'Attention', fail: 'Action needed' };

// Live compliance score ring + automated evidence table (continuous monitoring).
export default function ComplianceScore() {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await base44.functions.invoke('complianceScore', {});
      if (res.data?.error) throw new Error(res.data.error);
      setData(res.data);
    } catch (error) {
      toast({ title: 'Could not collect evidence', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
    // Continuous monitoring: re-collect automatically every two minutes.
    const timer = setInterval(load, 120000);
    return () => clearInterval(timer);
  }, [load]);

  const score = data?.score ?? 0;

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center">
          <div className="flex items-center gap-4">
            {loading && !data ? (
              <div className="h-[140px] w-[140px] animate-pulse rounded-full bg-muted" />
            ) : (
              <ScoreRing value={score} size={140} label="Live score" />
            )}
            <div>
              <div className="font-display text-lg font-bold">Continuous compliance score</div>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Collected automatically from {data?.registers_monitored ?? 10} connected registers — no manual tick-and-flick. Re-collected every two minutes.
              </p>
              {data?.generated_at && (
                <p className="mt-1 text-[11px] text-muted-foreground">Last collected {format(new Date(data.generated_at), 'd MMM yyyy, h:mm a')}</p>
              )}
              <Button variant="outline" size="sm" className="mt-2" onClick={load} disabled={loading}>
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />Collect evidence now
              </Button>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {(data?.controls || []).map((c) => (
              <Link
                key={c.key}
                to={c.path}
                className="flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 transition-colors hover:bg-muted/30"
              >
                <Badge className={`text-[10px] ${BADGE[c.status]}`}>{LABEL[c.status]}</Badge>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{c.label}</div>
                  <div className="truncate text-xs text-muted-foreground">{c.detail}</div>
                </div>
                <span className="hidden text-[10px] text-muted-foreground sm:block">{c.source}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Link>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}