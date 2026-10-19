import React, { useMemo, useState } from 'react';
import { format, differenceInCalendarDays, addMonths, startOfMonth, isSameMonth } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Month-by-month calendar of every compliance deadline in the vault:
// employee document expiries plus training certificate expiries.
// Colour per urgency: red = expired, amber = due within 30 days, green = further out.
export default function ExpiryCalendar({ docs, certs, viewDoc }) {
  const [selected, setSelected] = useState(null);
  const [month, setMonth] = useState(new Date());

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

  const daysUntil = (date) => differenceInCalendarDays(date, new Date());

  const dayItems = selected ? (byDay.get(format(selected, 'yyyy-MM-dd')) || []) : [];
  const expiringCount = items.length;

  const tone = (it) => {
    const days = differenceInCalendarDays(new Date(it.expiry_date), new Date());
    if (days < 0) return { cls: 'bg-danger/10 text-danger', label: 'Expired' };
    if (days <= 30) return { cls: 'bg-warning/10 text-warning', label: 'Due within 30 days' };
    return { cls: 'bg-safe/10 text-safe', label: 'Current' };
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-bold font-editorial text-foreground/80">
            <CalendarDays className="h-4 w-4 text-brand" /> Compliance deadlines calendar
          </span>
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
          <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold font-editorial text-foreground/80">{format(month, 'MMMM yyyy')}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, -1))}><ChevronLeft className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, 1))}><ChevronRight className="h-4 w-4" /></Button>
                </div>
              </div>
              <Calendar
                mode="single"
                month={month}
                onMonthChange={(m) => setMonth(m)}
                selected={selected || undefined}
                onSelect={(d) => setSelected(d || null)}
                modifiers={{
                  dueExpired: (date) => byDay.has(format(date, 'yyyy-MM-dd')) && daysUntil(date) < 0,
                  dueSoon: (date) => byDay.has(format(date, 'yyyy-MM-dd')) && daysUntil(date) >= 0 && daysUntil(date) <= 30,
                  dueLater: (date) => byDay.has(format(date, 'yyyy-MM-dd')) && daysUntil(date) > 30,
                }}
                modifiersClassNames={{
                  dueExpired: 'expiry-day-expired',
                  dueSoon: 'expiry-day-soon',
                  dueLater: 'expiry-day-later',
                }}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-bold font-editorial text-foreground/80">
                {selected ? `Expiring ${format(selected, 'EEEE, d MMM yyyy')}` : 'Select a highlighted day'}
              </div>
              {dayItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {selected ? 'Nothing expires on this day.' : 'Click any coloured day to see the documents and certificates expiring that day.'}
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
          </div>
        )}
      </CardContent>
    </Card>
  );
}