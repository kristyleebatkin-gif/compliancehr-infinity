import React from 'react';
import RosterShiftCard from '@/components/rostering/RosterShiftCard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { format } from 'date-fns';
import { addDays } from 'date-fns';
import { isToday } from 'date-fns';

export default function RosterBoard({ weekStart, shifts, onAdd, onEdit }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="max-w-full overflow-x-auto rounded-xl border border-border bg-card">
      <div className="grid grid-cols-1 gap-px bg-border md:min-w-[84rem] md:grid-cols-7">
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayShifts = shifts.filter((shift) => shift.date === key);
          return <section key={key} aria-label={format(day, 'EEEE d MMMM')} className="min-w-0 bg-background">
            <header className={`flex items-center justify-between gap-2 border-b border-border p-3 ${isToday(day) ? 'bg-primary/10' : 'bg-muted/50'}`}>
              <div><p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{format(day, 'EEEE')}</p><p className="mt-1 text-base font-bold text-foreground">{format(day, 'd MMM')}{isToday(day) && <span className="ml-2 text-xs text-primary">Today</span>}</p></div>
              <Button variant="outline" size="icon" onClick={() => onAdd(key)} aria-label={`Add shift for ${format(day, 'EEEE d MMMM')}`}><Plus className="h-4 w-4" /></Button>
            </header>
            <div className="min-h-32 space-y-3 p-3 md:min-h-80">
              {dayShifts.length ? dayShifts.map((shift) => <RosterShiftCard key={shift.id} shift={shift} onEdit={onEdit} />) : <p className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">No shifts scheduled</p>}
            </div>
          </section>;
        })}
      </div>
    </div>
  );
}