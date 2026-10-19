import React, { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, ChevronRight, ShieldAlert } from 'lucide-react';
import { format, startOfMonth, startOfWeek, addDays, isSameMonth, isToday, isSameDay } from 'date-fns';

// Monthly calendar of task due dates plus worker screening expiry deadlines.
const SCREENING_TYPES = ['Worker Screening', 'Worker Screening Audit'];
const SKIP_STATUSES = ['Completed', 'Submitted'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const taskTone = (status) => {
  if (status === 'Overdue') return 'bg-danger/10 text-danger border-danger/30';
  if (status === 'Completed') return 'bg-safe/10 text-safe border-safe/30';
  if (status === 'In Progress') return 'bg-brand/10 text-brand border-brand/30';
  return 'bg-muted text-foreground/70 border-border/60';
};

export default function TaskCalendar({ tasks = [], onOpen }) {
  const [cursor, setCursor] = useState(startOfMonth(new Date()));
  const [screenings, setScreenings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    base44.entities.NDISComplianceDeadline
      .filter({ deadline_type: { $in: SCREENING_TYPES } }, { limit: 500 })
      .then((page) => {
        if (!alive) return;
        setScreenings((page.items || []).filter((d) => !SKIP_STATUSES.includes(d.status) && d.due_date));
      })
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const days = useMemo(() => {
    const start = startOfWeek(cursor, { weekStartsOn: 1 });
    return Array.from({ length: 42 }, (_, i) => addDays(start, i));
  }, [cursor]);

  const itemsFor = (date) => ({
    tasks: tasks.filter((t) => t.due_date && isSameDay(new Date(t.due_date), date)),
    screenings: screenings.filter((d) => isSameDay(new Date(d.due_date), date)),
  });

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-editorial text-lg font-semibold">{format(cursor, 'MMMM yyyy')}</h3>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setCursor(startOfMonth(addDays(cursor, -1)))} aria-label="Previous month" className="rounded-lg border border-border bg-card p-2 hover:bg-muted"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setCursor(startOfMonth(new Date()))} className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold hover:bg-muted">Today</button>
          <button onClick={() => setCursor(startOfMonth(addDays(cursor, 32)))} aria-label="Next month" className="rounded-lg border border-border bg-card p-2 hover:bg-muted"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-foreground/60">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-brand" />Task due</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-danger" />Overdue</span>
        <span className="flex items-center gap-1.5"><ShieldAlert className="h-3 w-3 text-warning" />Worker screening expiry</span>
      </div>
      {loading ? (
        <div className="py-12 text-center text-sm text-foreground/40">Loading deadlines...</div>
      ) : (
        <div>
          <div className="grid grid-cols-7 gap-1 border-b border-border/50 pb-1.5">
            {WEEKDAYS.map((d) => <div key={d} className="text-center text-[11px] font-bold uppercase tracking-wide text-foreground/40">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 pt-1.5">
            {days.map((date, i) => {
              const { tasks: dayTasks, screenings: dayScreenings } = itemsFor(date);
              const inMonth = isSameMonth(date, cursor);
              const weekend = [5, 6].includes(i % 7);
              return (
                <div key={date.toISOString()} className={`min-h-24 rounded-lg border p-1.5 ${isToday(date) ? 'border-brand bg-brand/5' : 'border-border/40'} ${inMonth ? 'bg-card' : weekend ? 'bg-muted/40' : 'bg-muted/20'} ${!inMonth && weekend ? 'opacity-60' : ''}`}>
                  <div className={`mb-1 text-xs font-semibold tabular-nums ${inMonth ? 'text-foreground/70' : 'text-foreground/30'}`}>{format(date, 'd')}</div>
                  <div className="space-y-0.5">
                    {dayScreenings.map((d) => (
                      <div key={d.id} title={`${d.owner || d.title} — screening expiry`} className="flex items-center gap-1 rounded border border-warning/40 bg-warning/10 px-1 py-0.5 text-[10px] font-semibold text-warning">
                        <ShieldAlert className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate">{d.owner || 'Screening'}</span>
                      </div>
                    ))}
                    {dayTasks.slice(0, dayScreenings.length ? 1 : 2).map((t) => (
                      <button key={t.id} onClick={() => onOpen && onOpen(t)} className={`block w-full truncate rounded border px-1 py-0.5 text-left text-[10px] font-medium hover:opacity-80 ${taskTone(t.status)}`}>
                        {t.title}
                      </button>
                    ))}
                    {dayTasks.length + dayScreenings.length > (dayScreenings.length ? 2 : 2) && (
                      <div className="text-[10px] font-medium text-foreground/40">+{dayTasks.length + dayScreenings.length - 2} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}