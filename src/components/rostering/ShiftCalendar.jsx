import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, UserX } from 'lucide-react';
import { addDays, format, isSameMonth, isToday } from 'date-fns';
import { statusTone } from '@/lib/statusStyles';
import { shiftHours } from '@/lib/rostering';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ShiftCalendar({ monthStart, shifts, onAdd, onEdit }) {
  const gridStart = addDays(monthStart, -((monthStart.getDay() + 6) % 7)); // back to Monday
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));

  return (
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1 text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
          {cells.map((day) => {
            const key = format(day, 'yyyy-MM-dd');
            const dayShifts = shifts.filter((s) => s.date === key);
            const outside = !isSameMonth(day, monthStart);
            return (
              <div
                key={key}
                className={`min-h-[84px] rounded-lg border p-1 ${outside ? 'border-transparent bg-muted/30 opacity-50' : 'border-border/60'} ${isToday(day) ? 'ring-1 ring-brand' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">{format(day, 'd')}</span>
                  {!outside && (
                    <button type="button" className="rounded p-0.5 hover:bg-accent" onClick={() => onAdd(key)} title="Add shift">
                      <Plus className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="mt-1 space-y-1">
                  {dayShifts.slice(0, 3).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => onEdit(s)}
                      className={`block w-full truncate rounded px-1 py-0.5 text-left text-[10px] leading-tight hover:opacity-80 ${statusTone(s.status)}`}
                      title={`
                        ${s.employee_name || 'Unassigned'}${s.participant_name ? ` → ${s.participant_name}` : ''}${s.start_time ? ` · ${s.start_time}${s.end_time ? `–${s.end_time}` : ''}` : ''}`}
                    >
                      {s.employee_name ? s.employee_name.split(' ')[0] : <span className="inline-flex items-center gap-0.5"><UserX className="h-2.5 w-2.5" /> Unassigned</span>}
                      {s.start_time ? ` ${s.start_time}` : ''}
                    </button>
                  ))}
                  {dayShifts.length > 3 && (
                    <p className="px-1 text-[10px] text-muted-foreground">+{dayShifts.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}