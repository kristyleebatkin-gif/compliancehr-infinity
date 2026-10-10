import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, UserX, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { addDays, differenceInCalendarDays, format, isSameMonth, isToday } from 'date-fns';
import { statusTone } from '@/lib/statusStyles';
import { shiftHours } from '@/lib/rostering';

const isMine = (s, myName) => Boolean(myName) && Boolean(s.employee_name) && s.employee_name.toLowerCase() === String(myName).toLowerCase();
const needsConfirm = (s) => Boolean(s.employee_name) && s.staff_confirmation !== 'Confirmed';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_GRID_DAYS = 70;

function ShiftChip({ s, onEdit, compact }) {
  return (
    <button
      type="button"
      onClick={() => onEdit(s)}
      className={`block w-full truncate rounded px-1 py-0.5 text-left leading-tight hover:opacity-80 ${statusTone(s.status)} ${compact ? 'text-[10px]' : 'text-xs'}`}
      title={`${s.employee_name || 'Unassigned'}${s.participant_name ? ` → ${s.participant_name}` : ''}${s.start_time ? ` · ${s.start_time}${s.end_time ? `–${s.end_time}` : ''}` : ''}${s.employee_name ? (needsConfirm(s) ? ' · Awaiting confirmation' : ' · Confirmed') : ''}`}
    >
      {s.employee_name ? (s.staff_confirmation === 'Confirmed' ? '✓ ' : '') + s.employee_name.split(' ')[0] : <span className="inline-flex items-center gap-0.5"><UserX className="h-2.5 w-2.5" /> Unassigned</span>}
      {s.start_time ? ` ${s.start_time}` : ''}
    </button>
  );
}

function DayCell({ day, shifts, onAdd, onEdit, onConfirm, myName, outside }) {
  const key = format(day, 'yyyy-MM-dd');
  const pendingCount = shifts.filter((s) => needsConfirm(s)).length;
  const confirmedCount = shifts.length - pendingCount;
  return (
    <div
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
      {shifts.length > 0 && (
        <div className="flex flex-wrap items-center gap-x-2 px-0.5 text-[9px] font-semibold leading-none">
          {confirmedCount > 0 && <span className="text-safe">{confirmedCount} confirmed</span>}
          {pendingCount > 0 && <span className="text-warning">{pendingCount} pending</span>}
        </div>
      )}
      <div className="mt-1 space-y-1">
        {shifts.slice(0, 3).map((s) => (
          <div key={s.id} className="flex items-start gap-0.5">
            <ShiftChip s={s} onEdit={onEdit} compact />
            {isMine(s, myName) && needsConfirm(s) && (
              <button type="button" onClick={() => onConfirm(s)} title="Confirm this shift" className="shrink-0 rounded bg-safe/15 px-1 text-[10px] font-bold leading-tight text-safe hover:bg-safe/25">✓</button>
            )}
          </div>
        ))}
        {shifts.length > 3 && <p className="px-1 text-[10px] text-muted-foreground">+{shifts.length - 3} more</p>}
      </div>
    </div>
  );
}

function GridView({ from, to, shifts, onAdd, onEdit, onConfirm, myName }) {
  const gridStart = addDays(from, -((from.getDay() + 6) % 7)); // back to Monday
  const days = differenceInCalendarDays(to, gridStart) + 1;
  const weeks = Math.ceil(days / 7);
  const cells = Array.from({ length: weeks * 7 }, (_, i) => addDays(gridStart, i));
  const key = format(from, 'yyyy-MM-dd');

  return (
    <Card>
      <CardContent className="p-3">
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-1 text-center text-xs font-semibold text-muted-foreground">{d}</div>
          ))}
          {cells.map((day) => {
            const k = format(day, 'yyyy-MM-dd');
            const outside = k < key || k > format(to, 'yyyy-MM-dd');
            return <DayCell key={k} day={day} shifts={shifts.filter((s) => s.date === k)} onAdd={onAdd} onEdit={onEdit} onConfirm={onConfirm} myName={myName} outside={outside} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function AgendaView({ from, to, shifts, onAdd, onEdit, onConfirm, myName }) {
  const byDate = {};
  shifts.forEach((s) => { (byDate[s.date] = byDate[s.date] || []).push(s); });
  const dates = Object.keys(byDate).sort();
  const total = differenceInCalendarDays(to, from) + 1;

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <p className="text-sm text-muted-foreground">{total} days selected · {dates.length} with shifts · {shifts.length} shifts total</p>
        {dates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No shifts in this date range.</p>
        ) : dates.map((d) => (
          <div key={d} className="rounded-lg border border-border/60 p-3">
            {(() => {
              const pending = byDate[d].filter((s) => needsConfirm(s)).length;
              const confirmed = byDate[d].length - pending;
              return (
                <p className="mb-1 text-[11px] font-semibold">
                  {confirmed > 0 && <span className="mr-3 text-safe">{confirmed} confirmed</span>}
                  {pending > 0 && <span className="text-warning">{pending} pending confirmation</span>}
                </p>
              );
            })()}
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{format(new Date(d + 'T00:00:00'), 'EEE d MMM yyyy')}</p>
              <button type="button" className="rounded p-0.5 hover:bg-accent" onClick={() => onAdd(d)} title="Add shift">
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {byDate[d].map((s) => (
                <div key={s.id} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onEdit(s)}
                  className="flex flex-1 flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 p-2 text-left hover:bg-accent"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s.employee_name || <span className="inline-flex items-center gap-1 text-warning"><UserX className="h-3.5 w-3.5" /> Unassigned</span>}</p>
                    <p className="text-xs text-muted-foreground">
                      {[
                        s.start_time && s.end_time ? `${s.start_time}–${s.end_time}` : s.start_time,
                        s.participant_name,
                        s.location,
                        shiftHours(s.start_time, s.end_time) ? `${shiftHours(s.start_time, s.end_time)}h` : '',
                      ].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <Badge className={statusTone(s.status)}>{s.status}</Badge>
                </button>
                {isMine(s, myName) && needsConfirm(s) && (
                  <Button size="sm" variant="outline" className="shrink-0 border-safe/40 text-safe hover:bg-safe/10" onClick={() => onConfirm(s)}>
                    <Check className="h-3.5 w-3.5" /> Confirm
                  </Button>
                )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function ShiftCalendar({ from, to, shifts, onAdd, onEdit, onConfirm, myName }) {
  const span = differenceInCalendarDays(to, from) + 1;
  return span <= MAX_GRID_DAYS
    ? <GridView from={from} to={to} shifts={shifts} onAdd={onAdd} onEdit={onEdit} onConfirm={onConfirm} myName={myName} />
    : <AgendaView from={from} to={to} shifts={shifts} onAdd={onAdd} onEdit={onEdit} onConfirm={onConfirm} myName={myName} />;
}