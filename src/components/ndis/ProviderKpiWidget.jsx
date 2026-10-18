import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Loader2, ArrowRight } from 'lucide-react';
import { statusTone } from '@/lib/statusStyles';

const TONE_BAR = {
  'On Track': 'bg-gradient-to-r from-emerald-500 to-teal-500',
  'Exceeded': 'bg-gradient-to-r from-emerald-500 to-lime-500',
  'At Risk': 'bg-gradient-to-r from-amber-500 to-orange-500',
  'Attention': 'bg-gradient-to-r from-amber-500 to-orange-500',
  'Off Track': 'bg-gradient-to-r from-rose-500 to-red-500',
};

// Provider KPI dashboard widget: progress of each tracked KPI toward its target.
export default function ProviderKpiWidget() {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    let live = true;
    base44.entities.KPI.filter({}, { sort: 'category', limit: 50 })
      .then((page) => { if (live) setKpis(page.items || []); })
      .catch(() => { if (live) setKpis([]); });
    return () => { live = false; };
  }, []);

  if (!kpis) {
    return (
      <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />Loading provider KPIs...
      </CardContent></Card>
    );
  }

  const onTrack = kpis.filter((k) => k.status === 'On Track' || k.status === 'Exceeded').length;
  const atRisk = kpis.filter((k) => k.status === 'At Risk' || k.status === 'Attention').length;
  const offTrack = kpis.filter((k) => k.status === 'Off Track').length;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-indigo-500/10 p-2"><Target className="h-4 w-4 text-indigo-600" /></div>
            <div>
              <p className="text-sm font-bold">Provider KPIs</p>
              <p className="text-xs text-muted-foreground">Performance against targets, reviewed {kpis[0]?.last_reviewed ? 'recently' : 'this quarter'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-emerald-600">{onTrack} on track</span>
            {atRisk > 0 && <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-amber-600">{atRisk} at risk</span>}
            {offTrack > 0 && <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-rose-600">{offTrack} off track</span>}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((k) => {
            const pct = k.target_value ? Math.min(100, Math.round((Number(k.current_value || 0) / Number(k.target_value)) * 100)) : 0;
            return (
              <div key={k.id} className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-bold leading-snug">{k.title}</p>
                  <Badge variant="outline" className={`shrink-0 text-[10px] ${statusTone(k.status)}`}>{k.status}</Badge>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-foreground/10">
                  <div className={`h-full rounded-full transition-all duration-700 ${TONE_BAR[k.status] || 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>{k.current_value}{k.unit || '%'} of {k.target_value}{k.unit || '%'}</span>
                  <span>{k.category}</span>
                </div>
              </div>
            );
          })}
          {kpis.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">No KPIs recorded yet.</p>}
        </div>

        <Link to="/analytics" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
          View business analytics <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </CardContent>
    </Card>
  );
}