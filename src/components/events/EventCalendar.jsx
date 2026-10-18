import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, MapPin, Clock, DollarSign } from 'lucide-react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, isToday, parseISO,
} from 'date-fns';

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function EventCalendar({ events, onSelect }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));

  const days = useMemo(() => eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  }), [month]);

  const byDay = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      try {
        const d = format(parseISO(e.date), 'yyyy-MM-dd');
        (map[d] = map[d] || []).push(e);
      } catch { /* skip undated */ }
    });
    return map;
  }, [events]);

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-lg font-bold">{format(month, 'MMMM yyyy')}</p>
          <div className="flex gap-1.5">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(subMonths(month, 1))}><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setMonth(startOfMonth(new Date()))}>Today</Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setMonth(addMonths(month, 1))}><ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {WEEK_LABELS.map((d) => (
            <div key={d} className="pb-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{d}</div>
          ))}
          {days.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayEvents = byDay[key] || [];
            const inMonth = isSameMonth(day, month);
            return (
              <div
                key={key}
                className={`min-h-16 rounded-lg border p-1.5 sm:min-h-20 ${
                  inMonth ? 'border-border/60 bg-card' : 'border-transparent bg-muted/30'
                } ${isToday(day) ? 'border-brand ring-1 ring-brand/40' : ''}`}
              >
                <p className={`text-[10px] font-bold ${inMonth ? 'text-foreground/70' : 'text-muted-foreground/50'}`}>{format(day, 'd')}</p>
                <div className="mt-0.5 space-y-0.5">
                  {dayEvents.slice(0, 2).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onSelect?.(e)}
                      className="block w-full truncate rounded bg-gradient-to-r from-fuchsia-500/15 to-purple-500/15 px-1 py-0.5 text-left text-[9px] font-semibold text-purple-700 dark:text-purple-300 hover:from-fuchsia-500/25 hover:to-purple-500/25 sm:text-[10px]"
                    >
                      {e.title}
                    </button>
                  ))}
                  {dayEvents.length > 2 && (
                    <p className="px-1 text-[9px] font-semibold text-purple-600">+{dayEvents.length - 2} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {(() => {
          const monthEvents = events.filter((e) => { try { return isSameMonth(parseISO(e.date), month); } catch { return false; } });
          if (!monthEvents.length) return <p className="mt-3 text-center text-xs text-muted-foreground">No programs or events this month.</p>;
          return (
            <div className="mt-4 space-y-2 border-t border-border/60 pt-3">
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">This month ({monthEvents.length})</p>
              {monthEvents.map((e) => (
                <button key={e.id} onClick={() => onSelect?.(e)} className="flex w-full flex-wrap items-center gap-2 rounded-lg border border-border/60 p-2 text-left hover:bg-brand/5">
                  <Badge className="bg-gradient-to-r from-fuchsia-500 to-purple-600 text-[10px] text-white">{format(parseISO(e.date), 'EEE d MMM')}</Badge>
                  <span className="font-semibold text-sm">{e.title}</span>
                  {e.start_time && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{e.start_time}</span>}
                  {e.location && <span className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{e.location}</span>}
                  {e.cost_text && <span className="flex items-center gap-1 text-xs text-muted-foreground"><DollarSign className="h-3 w-3" />{e.cost_text}</span>}
                </button>
              ))}
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
}