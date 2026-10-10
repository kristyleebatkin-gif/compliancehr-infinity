import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { addDays } from 'date-fns';
import { statusTone } from '@/lib/statusStyles';
import { shiftHours } from '@/lib/rostering';

export default function RosterBoard({ weekStart, shifts, onAdd, onEdit }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {days.map((day) => {
        const key = format(day, 'yyyy-MM-dd');
        const dayShifts = shifts.filter((s) => s.date === key);
        return (
          <Card key={key}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{format(day, 'EEE d MMM')}</p>
                <Button variant="ghost" size="icon" onClick={() => onAdd(key)} title="Add shift">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3 space-y-2">
                {dayShifts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No shifts</p>
                ) : dayShifts.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onEdit(s)}
                    className="w-full rounded-lg border p-2 text-left hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">
                        {s.employee_name || <span className="inline-flex items-center gap-1 text-warning"><UserX className="h-3.5 w-3.5" /> Unassigned</span>}
                      </p>
                      <Badge className={statusTone(s.status)}>{s.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {[
                        s.start_time && s.end_time ? `${s.start_time}–${s.end_time}` : s.start_time,
                        s.participant_name,
                        s.location,
                        shiftHours(s.start_time, s.end_time) ? `${shiftHours(s.start_time, s.end_time)}h` : '',
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}