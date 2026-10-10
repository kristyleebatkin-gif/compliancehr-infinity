import React, { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { statusTone } from '@/lib/statusStyles';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format } from 'date-fns';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AuditCalendar({ audits }) {
  const [month, setMonth] = useState(startOfMonth(new Date()));
  const [selected, setSelected] = useState(null);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const auditsOn = (day) => audits.filter((a) => a.date && isSameDay(new Date(a.date), day));
  const selectedAudits = selected ? auditsOn(selected) : [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={() => setMonth((m) => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></Button>
        <p className="text-lg font-semibold">{format(month, 'MMMM yyyy')}</p>
        <Button variant="outline" size="icon" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase tracking-wide text-foreground/40">
        {WEEK_DAYS.map((d) => <div key={d} className="py-1">{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const dayAudits = auditsOn(day);
          const inMonth = isSameMonth(day, month);
          const isSelected = selected && isSameDay(day, selected);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelected(day)}
              className={`min-h-16 rounded-lg border p-1 text-left align-top transition-colors ${
                isSelected ? 'border-brand bg-brand/10' : 'border-border/60 hover:bg-muted/60'
              } ${inMonth ? 'bg-card' : 'bg-muted/30 opacity-50'}`}
            >
              <span className="text-xs font-semibold">{format(day, 'd')}</span>
              <div className="mt-0.5 space-y-0.5">
                {dayAudits.slice(0, 2).map((a) => (
                  <div key={a.id} className="truncate rounded bg-brand/10 px-1 text-[10px] font-medium text-brand">{a.title}</div>
                ))}
                {dayAudits.length > 2 && <div className="text-[10px] text-muted-foreground">+{dayAudits.length - 2} more</div>}
              </div>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold"><CalendarDays className="h-4 w-4 text-brand" />Audits on {format(selected, 'EEEE d MMMM yyyy')}</div>
          {selectedAudits.length === 0 ? (
            <p className="text-sm text-muted-foreground">No audits on this day.</p>
          ) : (
            <div className="space-y-2">
              {selectedAudits.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-2 rounded-lg border border-border/60 p-2.5 text-sm">
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{[a.audit_area, a.audit_type, a.auditor].filter(Boolean).join(' · ')}</p>
                  </div>
                  <Badge className={statusTone(a.status)}>{a.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}