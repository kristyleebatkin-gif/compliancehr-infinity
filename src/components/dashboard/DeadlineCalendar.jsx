import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { format, differenceInCalendarDays, addMonths, startOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, ClipboardCheck, FileClock, ArrowUpRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const endOfMonthSafe = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const isSameDaySafe = (a, b) => format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd');
const DAY = 86400000;

// Admin dashboard calendar: compliance expiry dates (staff documents + certificates,
// from 30 days ago to 90 days ahead) and pending participant document review deadlines.
// Expiry chips use the vault's urgency tones; review deadlines show in brand purple.
export default function DeadlineCalendar() {
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const from = new Date(Date.now() - 30 * DAY).toISOString().slice(0, 10);
        const to = new Date(Date.now() + 90 * DAY).toISOString().slice(0, 10);
        const [docs, certs, pending] = await Promise.all([
          base44.entities.EmployeeDocument.filter(
            { expiry_date: { $gte: from, $lte: to }, status: { $ne: 'Archived' } },
            { sort: 'expiry_date', limit: 50, fields: ['title', 'employee_name', 'expiry_date'] }
          ),
          base44.entities.Certificate.filter(
            { expiry_date: { $gte: from, $lte: to } },
            { sort: 'expiry_date', limit: 50, fields: ['module_title', 'staff_name', 'expiry_date'] }
          ),
          base44.entities.ParticipantDocument.filter(
            { review_outcome: 'Pending Review' },
            { sort: '-created_date', limit: 50, fields: ['title', 'document_type', 'participant_name', 'review_date'] }
          ),
        ]);
        if (!alive) return;
        setItems([
          ...docs.items.filter((d) => d.expiry_date).map((d) => ({
            id: `doc-${d.id}`, title: d.title, person: d.employee_name || 'Unassigned', kind: 'Expiry',
            date: d.expiry_date,
          })),
          ...certs.items.filter((c) => c.expiry_date).map((c) => ({
            id: `cert-${c.id}`, title: c.module_title, person: c.staff_name || 'Unassigned', kind: 'Expiry',
            date: c.expiry_date,
          })),
          ...pending.items.filter((p) => p.review_date).map((p) => ({
            id: `rev-${p.id}`, title: p.title || p.document_type, person: p.participant_name || 'Unassigned', kind: 'Review',
            date: p.review_date,
          })),
        ]);
      } catch {
        if (alive) setFailed(true);
      }
    })();
    return () => { alive = false; };
  }, []);

  const byDay = useMemo(() => {
    const m = new Map();
    for (const it of items || []) {
      const key = format(new Date(it.date), 'yyyy-MM-dd');
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(it);
    }
    return m;
  }, [items]);

  const gridDays = useMemo(() => {
    const from = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const to = endOfWeek(endOfMonthSafe(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: from, end: to });
  }, [month]);

  if (failed) return null;
  if (!items) return <div className="h-64 animate-pulse rounded-2xl border border-border/60 bg-card" />;

  const chipCls = (date, kind) => {
    if (kind === 'Review') return 'bg-brand/15 text-brand font-bold';
    const days = differenceInCalendarDays(date, new Date());
    if (days < 0) return 'expiry-day-expired';
    if (days <= 30) return 'expiry-day-soon';
    return 'expiry-day-later';
  };

  const toneFor = (it) => {
    if (it.kind === 'Review') return { cls: 'bg-brand/10 text-brand', label: 'Review due' };
    const days = differenceInCalendarDays(new Date(it.date), new Date());
    if (days < 0) return { cls: 'bg-danger/10 text-danger', label: 'Expired' };
    if (days <= 30) return { cls: 'bg-warning/10 text-warning', label: 'Due within 30 days' };
    return { cls: 'bg-safe/10 text-safe', label: 'Current' };
  };

  const dayItems = selected ? (byDay.get(format(selected, 'yyyy-MM-dd')) || []) : [];

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-md">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-brand text-white shadow-md"><CalendarDays className="h-5 w-5" /></span>
        <div>
          <h2 className="font-display text-lg font-bold leading-tight">Compliance deadline calendar</h2>
          <p className="text-xs text-muted-foreground">Expiry dates and pending document review deadlines, month at a glance.</p>
        </div>
        <span className="flex-1" />
        <Link to="/documents" className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
          Document Vault <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-medium">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-danger/60" /> Expired</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-warning/60" /> Within 30 days</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-safe/60" /> Later</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full bg-brand" /> Review deadline</span>
        <span className="flex-1" />
        <Badge variant="outline" className="tabular-nums">{items.length} on calendar</Badge>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center py-10 text-center text-sm text-muted-foreground">
          <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/60" />
          No expiry dates or review deadlines in the next 90 days.
        </div>
      ) : (
        <>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold font-editorial text-foreground/80">{format(month, 'MMMM yyyy')}</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, -1))}><ChevronLeft className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border/60 bg-border/40">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="bg-muted/60 px-1 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-foreground/50">{d}</div>
            ))}
            {gridDays.map((date) => {
              const key = format(date, 'yyyy-MM-dd');
              const dayList = byDay.get(key) || [];
              const inMonth = isSameMonth(date, month);
              return (
                <div
                  key={key}
                  onClick={() => setSelected(date)}
                  className={`min-h-[68px] cursor-pointer bg-card p-1 text-left transition-colors sm:min-h-[80px] ${
                    inMonth ? '' : 'opacity-40'
                  } ${selected && isSameDaySafe(selected, date) ? 'ring-2 ring-inset ring-primary' : ''}`}
                >
                  <div className={`mb-1 flex items-center justify-between px-0.5 text-[11px] font-bold tabular-nums ${isToday(date) ? 'text-brand' : 'text-foreground/60'}`}>
                    {format(date, 'd')}
                    {dayList.length > 0 && <span className="rounded-full bg-foreground/5 px-1 text-[9px] text-foreground/50">{dayList.length}</span>}
                  </div>
                  <div className="space-y-0.5">
                    {dayList.slice(0, 2).map((it) => (
                      <div
                        key={it.id}
                        className={`flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[9px] font-semibold leading-tight ${chipCls(date, it.kind)}`}
                        title={`${it.title} — ${it.person}`}
                      >
                        {it.kind === 'Review' && <ClipboardCheck className="h-2.5 w-2.5 shrink-0 opacity-70" />}
                        {it.kind === 'Expiry' && <FileClock className="h-2.5 w-2.5 shrink-0 opacity-60" />}
                        <span className="truncate">{(it.title || it.kind).split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                    ))}
                    {dayList.length > 2 && <div className="px-1 text-[9px] font-semibold text-foreground/40">+{dayList.length - 2} more</div>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4">
            <div className="mb-2 text-sm font-bold font-editorial text-foreground/80">
              {selected ? format(selected, 'EEEE, d MMM yyyy') : 'Select a day to see its deadlines'}
            </div>
            {dayItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {selected ? 'Nothing due on this day.' : 'Click any highlighted day to see what expires or is due for review.'}
              </p>
            ) : (
              <div className="space-y-2">
                {dayItems.map((it) => {
                  const t = toneFor(it);
                  return (
                    <div key={it.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{it.title}</p>
                        <p className="truncate text-xs text-muted-foreground">{it.person}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">{it.kind}</Badge>
                      <Badge className={`shrink-0 ${t.cls}`}>{t.label}</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}