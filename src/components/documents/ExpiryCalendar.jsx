import React, { useMemo, useState } from 'react';
import { format, differenceInCalendarDays } from 'date-fns';
import { CalendarDays, Eye } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Month calendar of every document expiry date in the vault.
// Colour per urgency: red = expired, amber = due within 30 days, green = further out.
export default function ExpiryCalendar({ docs, viewDoc }) {
  const [selected, setSelected] = useState(null);

  const byDay = useMemo(() => {
    const m = new Map();
    for (const d of docs || []) {
      if (!d.expiry_date) continue;
      const key = format(new Date(d.expiry_date), 'yyyy-MM-dd');
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(d);
    }
    return m;
  }, [docs]);

  const daysUntil = (date) => differenceInCalendarDays(date, new Date());

  const dayDocs = selected ? (byDay.get(format(selected, 'yyyy-MM-dd')) || []) : [];
  const expiringCount = [...byDay.values()].reduce((n, list) => n + list.length, 0);

  const tone = (doc) => {
    const days = differenceInCalendarDays(new Date(doc.expiry_date), new Date());
    if (days < 0) return { cls: 'bg-danger/10 text-danger', label: 'Expired' };
    if (days <= 30) return { cls: 'bg-warning/10 text-warning', label: 'Due within 30 days' };
    return { cls: 'bg-safe/10 text-safe', label: 'Current' };
  };

  return (
    <Card>
      <CardContent className="p-5">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-2 text-sm font-bold font-editorial text-foreground/80">
            <CalendarDays className="h-4 w-4 text-brand" /> Certification deadlines calendar
          </span>
          <span className="flex-1" />
          <span className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3 w-3 rounded-full bg-danger/60" /> Expired</span>
          <span className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3 w-3 rounded-full bg-warning/60" /> Within 30 days</span>
          <span className="flex items-center gap-1.5 text-xs font-medium"><span className="h-3 w-3 rounded-full bg-safe/60" /> Later</span>
          <Badge variant="outline" className="tabular-nums">{expiringCount} dated document(s)</Badge>
        </div>

        {expiringCount === 0 ? (
          <div className="flex flex-col items-center py-10 text-center text-sm text-muted-foreground">
            <CalendarDays className="mb-2 h-8 w-8 text-muted-foreground/60" />
            No documents with expiry dates on file yet.
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[auto,1fr]">
            <Calendar
              mode="single"
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
            <div>
              <div className="mb-2 text-sm font-bold font-editorial text-foreground/80">
                {selected ? `Expiring ${format(selected, 'EEEE, d MMM yyyy')}` : 'Select a highlighted day'}
              </div>
              {dayDocs.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {selected ? 'No documents expire on this day.' : 'Click any coloured day to see the documents expiring that day.'}
                </p>
              ) : (
                <div className="space-y-2">
                  {dayDocs.map((d) => {
                    const t = tone(d);
                    return (
                      <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{d.title}</p>
                          <p className="truncate text-xs text-muted-foreground">{d.employee_name || 'Unassigned'} · {d.document_type}</p>
                        </div>
                        <Badge className={t.cls}>{t.label}</Badge>
                        {(d.file_uri || d.file_url) && (
                          <Button variant="ghost" size="icon" title="View document" onClick={() => viewDoc(d)}><Eye className="h-4 w-4 text-foreground/60" /></Button>
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