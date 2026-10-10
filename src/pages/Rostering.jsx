import React, { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarRange, ChevronLeft, ChevronRight } from 'lucide-react';
import { addDays, startOfWeek, endOfWeek, format, isSameDay } from 'date-fns';

const tone = (s) => (s === 'Scheduled' ? 'default' : s === 'Completed' ? 'secondary' : 'destructive');

export default function Rostering() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (start) => {
    setLoading(true);
    try {
      const from = format(start, 'yyyy-MM-dd');
      const to = format(endOfWeek(start, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const page = await base44.entities.Shift.filter({ date: { $gte: from, $lte: to } }, { sort: 'date', limit: 200 });
      setShifts(page.items);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(weekStart); }, [load, weekStart]);

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold"><CalendarRange className="h-6 w-6" /> Rostering</h1>
          <p className="text-sm text-muted-foreground">Weekly roster view across all staff shifts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-medium">{format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}</span>
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {days.map((day) => {
            const dayShifts = shifts.filter((s) => isSameDay(new Date(s.date), day));
            return (
              <Card key={day.toISOString()}>
                <CardContent className="p-4">
                  <p className="font-semibold">{format(day, 'EEE d MMM')}</p>
                  <div className="mt-3 space-y-2">
                    {dayShifts.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No shifts</p>
                    ) : dayShifts.map((s) => (
                      <div key={s.id} className="rounded-lg border p-2">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">{s.employee_name}</p>
                          <Badge variant={tone(s.status)}>{s.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {[s.start_time && s.end_time ? `${s.start_time}–${s.end_time}` : '', s.participant_name, s.location].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}