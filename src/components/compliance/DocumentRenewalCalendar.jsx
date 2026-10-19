import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, differenceInCalendarDays, addMonths, subMonths } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusTone } from '@/lib/statusStyles';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Every renewal source the calendar plots, with its semantic colour.
const SOURCES = [
  { kind: 'Certificate', label: 'Staff certificates', entity: 'Certificate', dateField: 'expiry_date', fields: ['staff_name', 'module_title', 'expiry_date', 'status'], person: (r) => r.staff_name, title: (r) => r.module_title, chip: 'bg-teal/15 text-teal border-teal/30', dot: 'bg-teal' },
  { kind: 'Employee Document', label: 'Employee documents', entity: 'EmployeeDocument', dateField: 'expiry_date', fields: ['employee_name', 'document_type', 'expiry_date', 'status'], person: (r) => r.employee_name, title: (r) => r.document_type, chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-300 dark:border-amber-800', dot: 'bg-amber-500' },
  { kind: 'Participant Document', label: 'Participant documents', entity: 'ParticipantDocument', dateField: 'expiry_date', fields: ['participant_name', 'document_type', 'expiry_date', 'status'], person: (r) => r.participant_name, title: (r) => r.document_type, chip: 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-300 border-violet-300 dark:border-violet-800', dot: 'bg-violet-500' },
  { kind: 'Policy Review', label: 'Policy reviews', entity: 'Policy', dateField: 'review_date', fields: ['document_name', 'review_date', 'status'], person: () => '', title: (r) => r.document_name, chip: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800', dot: 'bg-indigo-500' },
  { kind: 'Legal Requirement', label: 'Legal requirements', entity: 'LegalRequirement', dateField: 'next_review', fields: ['title', 'next_review', 'status'], person: () => '', title: (r) => r.title, chip: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-300 dark:border-blue-800', dot: 'bg-blue-500' },
  { kind: 'NDIS Deadline', label: 'NDIS deadlines', entity: 'NDISComplianceDeadline', dateField: 'due_date', fields: ['title', 'due_date', 'status', 'deadline_type'], person: () => '', title: (r) => r.deadline_type || r.title, chip: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 border-rose-300 dark:border-rose-800', dot: 'bg-rose-500' },
  { kind: 'Task Due', label: 'Task due dates', entity: 'TodoTask', dateField: 'due_date', fields: ['title', 'due_date', 'status', 'priority'], person: () => '', title: (r) => r.title, chip: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800', dot: 'bg-emerald-500', extraFilter: { archived: { $ne: true }, status: { $nin: ['Completed', 'Cancelled'] } } },
];

const endOfMonthSafe = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);
const validDate = (v) => (v && !isNaN(new Date(v).getTime()) ? v : null);

// Month calendar plotting every document renewal date in one place: staff
// certificates, employee and participant documents, policy reviews, legal
// requirement reviews and NDIS deadlines. Click a day to see what is due.
export default function DocumentRenewalCalendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(null);
  const [kinds, setKinds] = useState(SOURCES.map((s) => s.kind));

  const load = async () => {
    setLoading(true);
    try {
      const pages = await Promise.all(
        SOURCES.map((s) =>
          base44.entities[s.entity]
            .filter({ [s.dateField]: { $ne: null }, ...(s.extraFilter || {}) }, { sort: s.dateField, limit: 500, fields: s.fields })
            .catch(() => ({ items: [] })),
        ),
      );
      const collected = pages.flatMap((page, i) =>
        (page.items || []).map((r) => {
          const src = SOURCES[i];
          return {
            id: `${src.kind}-${r.id}`,
            kind: src.kind,
            date: r[src.dateField],
            person: src.person(r) || '',
            title: src.title(r) || 'Untitled',
            status: r.status || '',
          };
        }),
      );
      setEvents(collected.filter((e) => e.date && !isNaN(new Date(e.date).getTime())));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sourceBy = (k) => SOURCES.find((s) => s.kind === k);

  const visible = useMemo(() => events.filter((e) => kinds.includes(e.kind)), [events, kinds]);

  const byDay = useMemo(() => {
    const m = new Map();
    for (const e of visible) {
      const key = format(new Date(e.date), 'yyyy-MM-dd');
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(e);
    }
    return m;
  }, [visible]);

  const days = useMemo(() => {
    const mStart = startOfMonth(month);
    return eachDayOfInterval({ start: startOfWeek(mStart, { weekStartsOn: 1 }), end: endOfWeek(endOfMonthSafe(mStart), { weekStartsOn: 1 }) });
  }, [month]);

  // 12-month density strip: how many renewals land in each upcoming month.
  const monthDensity = useMemo(() => {
    const mStart = startOfMonth(month);
    return Array.from({ length: 12 }, (_, i) => {
      const d = addMonths(mStart, i);
      const label = format(d, 'MMM yy');
      const count = visible.filter((e) => { const ed = new Date(e.date); return ed.getFullYear() === d.getFullYear() && ed.getMonth() === d.getMonth(); }).length;
      return { label, count, date: d };
    });
  }, [visible, month]);
  const maxDensity = Math.max(1, ...monthDensity.map((m) => m.count));

  const counts = useMemo(() => {
    const now = new Date();
    const in30 = now.getTime() + 30 * 86400000;
    return {
      expired: visible.filter((e) => new Date(e.date) < now).length,
      dueSoon: visible.filter((e) => { const d = new Date(e.date); return d >= now && d <= new Date(in30); }).length,
    };
  }, [visible]);

  if (loading) {
    return (
      <Card className="shadow-panel">
        <CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
          <RefreshCw className="h-4 w-4 animate-spin" />Loading renewal dates...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Source filter chips */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-foreground/60">Show:</span>
        {SOURCES.map((s) => (
          <button
            key={s.kind}
            onClick={() => setKinds((prev) => (prev.includes(s.kind) ? prev.filter((k) => k !== s.kind) : [...prev, s.kind]))}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${kinds.includes(s.kind) ? s.chip : 'border-border/60 bg-card text-foreground/40'}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${kinds.includes(s.kind) ? s.dot : 'bg-foreground/25'}`} />
            {s.label} ({events.filter((e) => e.kind === s.kind).length})
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="border-red-200 dark:border-red-800"><CardContent className="flex items-center gap-3 p-4">
          <span className="h-2.5 w-2.5 rounded-full bg-danger" />
          <div><div className="text-2xl font-bold tabular-nums text-danger">{counts.expired}</div><div className="text-xs font-medium text-foreground/60">Past their renewal date</div></div>
        </CardContent></Card>
        <Card className="border-amber-200 dark:border-amber-800"><CardContent className="flex items-center gap-3 p-4">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <div><div className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-300">{counts.dueSoon}</div><div className="text-xs font-medium text-foreground/60">Due within 30 days</div></div>
        </CardContent></Card>
      </div>

      {/* Busy months at a glance */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <div className="font-semibold">Renewals ahead by month</div>
            <span className="text-xs font-medium text-foreground/50">Starting {format(startOfMonth(month), 'MMM yyyy')}</span>
          </div>
          <div className="flex items-end gap-1 overflow-x-auto pb-1">
            {monthDensity.map((m) => (
              <button
                key={m.label}
                onClick={() => setMonth(m.date)}
                className="flex w-14 shrink-0 flex-col items-center gap-1 rounded-lg p-1 transition-colors hover:bg-muted/50"
                title={`${m.count} renewal${m.count === 1 ? '' : 's'} in ${m.label}`}
              >
                <span className="text-[10px] font-semibold tabular-nums text-foreground/60">{m.count || ''}</span>
                <div
                  className={`w-6 rounded-t ${m.count ? (m.count >= maxDensity ? 'bg-danger' : 'bg-brand/70') : 'bg-muted'}`}
                  style={{ height: `${6 + (m.count / maxDensity) * 48}px` }}
                />
                <span className={`text-[10px] font-medium tabular-nums ${m.count === maxDensity && m.count > 0 ? 'font-bold text-danger' : 'text-foreground/50'}`}>{m.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Month grid */}
      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-brand" />Document renewal calendar</div>
              <p className="text-xs text-foreground/50">Click a day to see every document due for renewal then.</p>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" onClick={() => setMonth((m) => subMonths(m, 1))}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="min-w-36 text-center text-sm font-semibold">{format(month, 'MMMM yyyy')}</span>
              <Button size="sm" variant="outline" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-foreground/50">
            {DAY_LABELS.map((d) => <div key={d} className="py-1">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = format(day, 'yyyy-MM-dd');
              const dayEvents = byDay.get(key) || [];
              const inMonth = isSameMonth(day, month);
              const heavy = dayEvents.length >= 4;
              return (
                <button
                  key={key}
                  onClick={() => dayEvents.length && setSelected(dayEvents)}
                  className={`min-h-16 rounded-lg border p-1 text-left align-top text-xs transition-colors sm:min-h-20 ${!inMonth ? 'border-transparent text-foreground/25' : heavy ? 'border-danger/50 bg-danger/5' : dayEvents.length ? 'border-brand/30 bg-brand/5' : 'border-border/50'} ${dayEvents.length ? 'cursor-pointer hover:brightness-95' : 'cursor-default'} ${isToday(day) ? 'ring-2 ring-brand/60' : ''}`}
                >
                  <div className="font-semibold tabular-nums">{format(day, 'd')}</div>
                  <div className="mt-0.5 space-y-0.5">
                    {dayEvents.slice(0, 2).map((e) => {
                      const src = sourceBy(e.kind);
                      const overdue = new Date(e.date) < new Date();
                      return (
                        <div key={e.id} className={`truncate rounded border px-1 py-0.5 text-[10px] font-medium ${overdue ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-300 dark:border-red-800' : src.chip}`} title={`${e.kind}: ${e.person ? `${e.person} — ` : ''}${e.title}`}>
                          {e.person ? e.person : e.title}
                        </div>
                      );
                    })}
                    {dayEvents.length > 2 && <div className="px-1 text-[10px] font-semibold text-foreground/50">+{dayEvents.length - 2} more</div>}
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="mb-2 text-sm font-semibold">Due {format(new Date(selected[0].date), 'EEEE d MMMM yyyy')}</div>
              <div className="space-y-1">
                {selected.map((e) => {
                  const src = sourceBy(e.kind);
                  return (
                    <div key={e.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs">
                      <span className={`rounded-full border px-2 py-0.5 font-semibold ${src.chip}`}>{src.label}</span>
                      {e.person && <span className="font-semibold">{e.person}</span>}
                      <span className="text-foreground/60">{e.title}</span>
                      {e.status && <Badge className={statusTone(e.status)}>{e.status}</Badge>}
                      <span className="ml-auto tabular-nums text-foreground/50">{differenceInCalendarDays(new Date(e.date), new Date()) < 0 ? `${-differenceInCalendarDays(new Date(e.date), new Date())}d overdue` : `in ${differenceInCalendarDays(new Date(e.date), new Date())}d`}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}