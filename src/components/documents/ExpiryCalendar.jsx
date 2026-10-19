import React, { useMemo, useState } from 'react';
import { format, differenceInCalendarDays, addMonths, startOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Eye, GripVertical } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const endOfMonthSafe = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const isSameDaySafe = (a, b) => format(a, 'yyyy-MM-dd') === format(b, 'yyyy-MM-dd');

// Month-by-month interactive calendar of every compliance deadline in the vault:
// employee document expiries plus training certificate expiries.
// Drag a deadline chip onto another day to change its expiry date.
// Colour per urgency: red = expired, amber = due within 30 days, green = further out.
export default function ExpiryCalendar({ docs, certs, viewDoc, editable = false, onReschedule }) {
  const [selected, setSelected] = useState(null);
  const [month, setMonth] = useState(new Date());
  const [dragId, setDragId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const { toast } = useToast();

  // Normalise both sources into one list of deadline items.
  const items = useMemo(() => {
    const fromDocs = (docs || []).filter((d) => d.expiry_date).map((d) => ({
      id: `doc-${d.id}`,
      title: d.title,
      person: d.employee_name || 'Unassigned',
      type: d.document_type || 'Document',
      kind: 'Document',
      expiry_date: d.expiry_date,
      raw: d,
    }));
    const fromCerts = (certs || []).filter((c) => c.expiry_date).map((c) => ({
      id: `cert-${c.id}`,
      title: c.module_title,
      person: c.staff_name || 'Unassigned',
      type: 'Training Certificate',
      kind: 'Certificate',
      expiry_date: c.expiry_date,
      raw: c,
    }));
    return [...fromDocs, ...fromCerts];
  }, [docs, certs]);

  const byDay = useMemo(() => {
    const m = new Map();
    for (const it of items) {
      const key = format(new Date(it.expiry_date), 'yyyy-MM-dd');
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(it);
    }
    return m;
  }, [items]);

  // Month-by-month overview: the next 6 months from today, each with its deadline count.
  const monthSummary = useMemo(() => {
    const start = startOfMonth(new Date());
    return Array.from({ length: 6 }, (_, i) => {
      const m = addMonths(start, i);
      const prefix = format(m, 'yyyy-MM');
      const count = items.filter((it) => format(new Date(it.expiry_date), 'yyyy-MM') === prefix).length;
      return { month: m, count };
    });
  }, [items]);

  // Grid of days spanning the displayed month (whole weeks, Sunday-start).
  const gridDays = useMemo(() => {
    const from = startOfWeek(startOfMonth(month), { weekStartsOn: 0 });
    const to = endOfWeek(endOfMonthSafe(month), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: from, end: to });
  }, [month]);

  const daysUntil = (date) => differenceInCalendarDays(date, new Date());

  const dayItems = selected ? (byDay.get(format(selected, 'yyyy-MM-dd')) || []) : [];
  const expiringCount = items.length;

  const tone = (it) => {
    const days = differenceInCalendarDays(new Date(it.expiry_date), new Date());
    if (days < 0) return { cls: 'bg-danger/10 text-danger', label: 'Expired' };
    if (days <= 30) return { cls: 'bg-warning/10 text-warning', label: 'Due within 30 days' };
    return { cls: 'bg-safe/10 text-safe', label: 'Current' };
  };

  const chipCls = (date) => {
    const days = daysUntil(date);
    if (days < 0) return 'expiry-day-expired';
    if (days <= 30) return 'expiry-day-soon';
    return 'expiry-day-later';
  };

  // Drop handler: move the dragged deadline to the new day and save it.
  const onDropItem = async (e, date) => {
    e.preventDefault();
    setDragId(null);
    const id = e.dataTransfer.getData('text/plain');
    const item = items.find((i) => i.id === id);
    if (!item || busyId) return;
    const newDate = format(date, 'yyyy-MM-dd');
    if (format(new Date(item.expiry_date), 'yyyy-MM-dd') === newDate) return;
    const entity = item.kind === 'Certificate' ? base44.entities.Certificate : base44.entities.EmployeeDocument;
    setBusyId(item.id);
    try {
      await entity.update(item.raw.id, { expiry_date: newDate });
      toast({ title: 'Deadline moved', description: `${item.title} now expires ${format(date, 'd MMM yyyy')}.` });
      onReschedule?.();
    } catch (err) {
      toast({ title: 'Could not move deadline', description: 'You may not have permission to update this record.', variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  const chipLabel = (it) => (it.title || it.kind).split(' ').slice(0, 2).join(' ');

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-bold font-editorial text-foreground/80">
            <CalendarDays className="h-4 w-4 text-brand" /> Compliance deadlines calendar
          </span>
          {editable && <span className="text-xs font-medium text-brand">Drag a deadline to a new day to change it</span>}
          <span className="flex-1" />
          <span className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3 w-3 rounded-full bg-danger/60" /> Expired</span>
          <span className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3 w-3 rounded-full bg-warning/60" /> Within 30 days</span>
          <span className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3 w-3 rounded-full bg-safe/60" /> Later</span>
          <Badge variant="outline" className="tabular-nums">{expiringCount} deadline(s)</Badge>
        </div>

        {/* Month-by-month summary: click a month to jump straight to it */}
        <div className="mb-4 flex flex-wrap gap-2">
          {monthSummary.map(({ month: m, count }) => (
            <button
              key={format(m, 'yyyy-MM')}
              type="button"
              onClick={() => { setMonth(m); setSelected(null); }}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold tabular-nums transition-colors ${
                isSameMonth(m, month)
                  ? 'border-brand bg-brand/10 text-brand'
                  : count > 0
                    ? 'border-border bg-muted/40 text-foreground/70 hover:border-brand/40'
                    : 'border-border/50 bg-transparent text-foreground/40'
              }`}
            >
              {format(m, 'MMM yyyy')}{count > 0 && <span className="ml-1.5 font-bold text-brand">{count}</span>}
            </button>
          ))}
        </div>

        {expiringCount === 0 ? (
          <div className="flex flex-col items-center py-10 text-center text-sm text-muted-foreground">
            <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/60" />
            No documents or certificates with expiry dates on file yet.
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

            {/* Interactive month grid: chips are draggable, day cells accept drops */}
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
                    onDragOver={editable ? (e) => e.preventDefault() : undefined}
                    onDrop={editable ? (e) => onDropItem(e, date) : undefined}
                    className={`min-h-[72px] cursor-pointer bg-card p-1 text-left transition-colors sm:min-h-[84px] ${
                      inMonth ? '' : 'opacity-40'
                    } ${selected && isSameDaySafe(selected, date) ? 'ring-2 ring-inset ring-primary' : ''} ${editable && dragId ? 'hover:bg-primary/5' : ''}`}
                  >
                    <div className={`mb-1 flex items-center justify-between px-0.5 text-[11px] font-bold tabular-nums ${isToday(date) ? 'text-brand' : 'text-foreground/60'}`}>
                      {format(date, 'd')}
                      {dayList.length > 0 && <span className="rounded-full bg-foreground/5 px-1 text-[9px] text-foreground/50">{dayList.length}</span>}
                    </div>
                    <div className="space-y-0.5">
                      {dayList.slice(0, 2).map((it) => (
                        <div
                          key={it.id}
                          draggable={editable && !busyId}
                          onDragStart={(e) => { e.dataTransfer.setData('text/plain', it.id); setDragId(it.id); }}
                          onDragEnd={() => setDragId(null)}
                          className={`flex items-center gap-0.5 rounded-md px-1 py-0.5 text-[9px] font-semibold leading-tight ${chipCls(date)} ${editable && !busyId ? 'cursor-grab active:cursor-grabbing' : ''} ${dragId === it.id ? 'opacity-40' : ''}`}
                          title={`${it.title} — ${it.person}${editable ? ' (drag to reschedule)' : ''}`}
                        >
                          <GripVertical className="h-2.5 w-2.5 shrink-0 opacity-60" />
                          <span className="truncate">{chipLabel(it)}</span>
                        </div>
                      ))}
                      {dayList.length > 2 && <div className="px-1 text-[9px] font-semibold text-foreground/40">+{dayList.length - 2} more</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="mt-5">
          <div className="mb-2 text-sm font-bold font-editorial text-foreground/80">
            {selected ? `Expiring ${format(selected, 'EEEE, d MMM yyyy')}` : 'Select a highlighted day'}
          </div>
          {dayItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {selected ? 'Nothing expires on this day.' : 'Click any day with deadlines to see the documents and certificates expiring that day.'}
            </p>
          ) : (
            <div className="space-y-2">
              {dayItems.map((it) => {
                const t = tone(it);
                const canOpen = it.kind === 'Document'
                  ? Boolean(it.raw.file_uri || it.raw.file_url)
                  : Boolean(it.raw.file_url);
                return (
                  <div key={it.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{it.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{it.person} · {it.type}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">{it.kind}</Badge>
                    <Badge className={`shrink-0 ${t.cls}`}>{t.label}</Badge>
                    {canOpen && (
                      <Button variant="ghost" size="icon" title="View document" onClick={() => viewDoc(it.raw)}><Eye className="h-4 w-4 text-foreground/60" /></Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}