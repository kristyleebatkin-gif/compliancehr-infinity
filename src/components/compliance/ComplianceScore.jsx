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
export default function ComplianceScore({ compact = false }) {
  const { toast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const res = await base44.functions.invoke('complianceScore', {});
      if (res.data?.error) throw new Error(res.data.error);
      if (!res.data || typeof res.data.score !== 'number' || !Array.isArray(res.data.controls)) throw new Error('Compliance assessment response was incomplete');
      setData(res.data);
    } catch {
      setData(null);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    // Continuous monitoring: re-collect automatically every two minutes.
    const timer = setInterval(load, 120000);
    return () => clearInterval(timer);
  }, [load]);

  const score = data?.score;

  return (
    <Card className="shadow-panel">
      <CardContent className={compact ? 'p-2.5' : 'p-5'}>
        <div className={compact ? 'flex flex-col gap-2 md:flex-row md:items-center' : 'flex flex-col gap-5 md:flex-row md:items-center'}>
          <div className="flex items-center gap-4">
            {loading && !data ? (
              <div className={compact ? 'h-24 w-24 animate-pulse rounded-full bg-muted' : 'h-[140px] w-[140px] animate-pulse rounded-full bg-muted'} />
            ) : data ? (
              <ScoreRing value={score} size={compact ? 96 : 140} label="Reported score" />
            ) : <div className="flex h-24 w-24 items-center justify-center rounded-full border text-center text-xs text-muted-foreground">{loadError ? 'Score unavailable' : 'Not assessed'}</div>}
            <div>
              <div className={compact ? 'font-display text-sm font-bold' : 'font-display text-lg font-bold'}>Continuous compliance score</div>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                {data ? `Reported from ${data.registers_monitored ?? 'an unspecified number of'} connected registers.` : 'No compliance score is available until an assessment response is confirmed.'}
              </p>
              {data?.generated_at && (
                <p className="mt-1 text-[11px] text-muted-foreground">Last collected {format(new Date(data.generated_at), 'd MMM yyyy, h:mm a')}</p>
              )}
              <Button variant="outline" size="sm" className="mt-2" onClick={load} disabled={loading}>
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />{loadError ? 'Retry assessment' : 'Refresh assessment'}
              </Button>
              {loadError && <p role="alert" className="mt-1 text-xs text-amber-700">Assessment could not be loaded. No pass status is inferred.</p>}
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            {data?.controls?.map((c) => (
              <Link
                key={c.key}
                to={c.path}
                className={`flex items-center gap-2 rounded-lg border border-border/60 bg-card px-2 transition-colors hover:bg-muted/30 ${compact ? 'py-1' : 'py-2'}`}
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
            {!data && <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Control evidence is unavailable until the assessment loads.</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}