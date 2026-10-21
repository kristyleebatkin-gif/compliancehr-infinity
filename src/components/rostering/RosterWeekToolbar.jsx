import React from 'react';
import { addDays, format } from 'date-fns';
import { ChevronLeft, ChevronRight, CalendarPlus, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RosterWeekToolbar({ weekStart, onWeekChange, onRepeat, onSchedule, saving }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-3">
    <div className="space-y-1"><h2 className="text-base font-bold">Weekly roster</h2><p className="text-sm font-medium text-muted-foreground">{format(weekStart, 'd MMM')} – {format(addDays(weekStart, 6), 'd MMM yyyy')}</p></div>
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1"><Button variant="ghost" size="icon" aria-label="Previous roster week" onClick={() => onWeekChange(addDays(weekStart, -7))}><ChevronLeft className="h-4 w-4" /></Button><Button variant="ghost" size="icon" aria-label="Next roster week" onClick={() => onWeekChange(addDays(weekStart, 7))}><ChevronRight className="h-4 w-4" /></Button></div>
      <Button variant="outline" onClick={onRepeat} disabled={saving} title="Copy last week's shifts into this week"><Repeat className="h-4 w-4" />Repeat last week</Button>
      <Button onClick={onSchedule}><CalendarPlus className="h-4 w-4" />Schedule shift</Button>
    </div>
  </div>;
}