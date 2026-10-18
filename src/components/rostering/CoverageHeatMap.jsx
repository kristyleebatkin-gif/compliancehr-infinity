import React, { useCallback, useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Flame, Loader2 } from 'lucide-react';
import { addDays, endOfWeek, format, startOfWeek } from 'date-fns';

// Weekly coverage heat map: filled vs unassigned shifts per day.
export default function CoverageHeatMap() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (start) => {
    setLoading(true);
    try {
      const from = format(start, 'yyyy-MM-dd');
      const to = format(endOfWeek(start, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const page = await base44.entities.Shift.filter({ date: { $gte: from, $lte: to } }, { sort: 'date', limit: 500 });
      const byDate = {};
      for (const shift of page.items) {
        const bucket = byDate[shift.date] || (byDate[shift.date] = { total: 0, filled: 0, unassigned: 0, cancelled: 0 });
        bucket.total += 1;
        if (shift.status === 'Cancelled') bucket.cancelled += 1;
        else if (shift.employee_name) bucket.filled += 1;
        else bucket.unassigned += 1;
      }
      const week = Array.from({ length: 7 }, (_, i) => {
        const date = addDays(start, i);
        const key = format(date, 'yyyy-MM-dd');
        return { date, key, ...(byDate[key] || { total: 0, filled: 0, unassigned: 0, cancelled: 0 }) };
      });
      setDays(week);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(weekStart); }, [weekStart, load]);

  const tone = (d) => {
    if (d.total === 0) return 'bg-muted/40 border-border/60';
    if (d.cancelled === d.total) return 'bg-muted/40 border-border/60';
    if (d.unassigned === 0) return 'bg-safe/10 border-safe/30';
    if (d.unassigned >= d.filled) return 'bg-danger/10 border-danger/30';
    return 'bg-warning/10 border-warning/30';
  };

  const weekTotal = days.reduce((sum, d) => sum + d.total, 0);
  const weekUnassigned = days.reduce((sum, d) => sum + d.unassigned, 0);

  return (
    <Card className="shadow-panel">
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand text-white"><Flame className="h-4 w-4" /></div>
          <div className="mr-auto">
            <div className="font-bold font-display">Coverage heat map</div>
            <div className="text-[11px] text-foreground/45">Filled vs unassigned shifts for the week</div>
          </div>
          <button onClick={() => setWeekStart(addDays(weekStart, -7))} className="rounded-lg border border-border bg-card p-2 hover:bg-brand/5"><ChevronLeft className="h-4 w-4" /></button>
          <span className="text-sm font-semibold">{format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}</span>
          <button onClick={() => setWeekStart(addDays(weekStart, 7))} className="rounded-lg border border-border bg-card p-2 hover:bg-brand/5"><ChevronRight className="h-4 w-4" /></button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-7">
              {days.map((d) => (
                <div key={d.key} className={`rounded-xl border p-3 shadow-sm ${tone(d)}`}>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">{format(d.date, 'EEE d MMM')}</div>
                  <div className="mt-1.5 text-2xl font-bold leading-none text-foreground">{d.total}</div>
                  <div className="mt-1 text-[11px] font-medium text-foreground/55">
                    {d.total === 0 ? 'No shifts' : `${d.filled} filled`}
                  </div>
                  {d.total > 0 && d.cancelled < d.total && (
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-foreground/10">
                      <div className="h-full rounded-full bg-safe" style={{ width: `${Math.round((d.filled / d.total) * 100)}%` }} />
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap gap-1">
                    {d.unassigned > 0 && <Badge className="bg-danger/15 text-danger border-transparent px-1.5 py-0 text-[10px]">{d.unassigned} unfilled</Badge>}
                    {d.cancelled > 0 && <Badge className="bg-muted text-foreground/50 border-transparent px-1.5 py-0 text-[10px]">{d.cancelled} cancelled</Badge>}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-foreground/50">
              <span className="font-semibold text-foreground/70">{weekTotal} shifts this week</span>
              <span className="text-danger font-semibold">{weekUnassigned} unassigned</span>
              <span className="text-safe font-semibold">{weekTotal - weekUnassigned} filled</span>
              <span>Green = fully filled · Amber = some gaps · Red = majority unfilled</span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}