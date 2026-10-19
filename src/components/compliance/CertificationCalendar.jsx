import React, { useEffect, useMemo, useState } from 'react';
import { format, startOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, differenceInCalendarDays, addMonths, subMonths } from 'date-fns';
import { CalendarDays, ChevronLeft, ChevronRight, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { statusTone } from '@/lib/statusStyles';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const urgency = (dateStr) => {
  const days = differenceInCalendarDays(new Date(dateStr), new Date());
  if (days < 0) return 'expired';
  if (days <= 30) return 'due-soon';
  return 'later';
};

const URGENCY_STYLES = {
  expired: { cell: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800', chip: 'bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-200' },
  'due-soon': { cell: 'bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800', chip: 'bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-100' },
  later: { cell: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800', chip: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200' },
};

// Month calendar of staff certification expiries, so renewals can be planned ahead.
// Read-only: red = expired, amber = due within 30 days, green = further out.
export default function CertificationCalendar() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date());
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { items } = await base44.entities.Certificate.filter(
        { expiry_date: { $ne: null } },
        { sort: 'expiry_date', limit: 500, fields: ['staff_name', 'module_title', 'expiry_date', 'status', 'certificate_number'] }
      );
      setCerts(items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const byDay = useMemo(() => {
    const m = new Map();
    for (const c of certs) {
      const key = format(new Date(c.expiry_date), 'yyyy-MM-dd');
      if (!m.has(key)) m.set(key, []);
      m.get(key).push(c);
    }
    return m;
  }, [certs]);

  const days = useMemo(() => {
    const mStart = startOfMonth(month);
    return eachDayOfInterval({ start: startOfWeek(mStart, { weekStartsOn: 1 }), end: endOfWeek(endOfMonthSafe(mStart), { weekStartsOn: 1 }) });
  }, [month]);

  const counts = useMemo(() => {
    const now = new Date();
    const in90 = new Date(now.getTime() + 90 * 86400000);
    return {
      expired: certs.filter((c) => new Date(c.expiry_date) < now).length,
      dueSoon: certs.filter((c) => new Date(c.expiry_date) >= now && new Date(c.expiry_date) <= new Date(now.getTime() + 30 * 86400000)).length,
      upcoming: certs.filter((c) => new Date(c.expiry_date) > now && new Date(c.expiry_date) <= in90).length,
    };
  }, [certs]);

  const upcoming = useMemo(() => {
    const now = new Date();
    return certs
      .filter((c) => new Date(c.expiry_date) >= now)
      .sort((a, b) => new Date(a.expiry_date) - new Date(b.expiry_date))
      .slice(0, 10);
  }, [certs]);

  if (loading) {
    return (
      <Card><CardContent className="flex items-center justify-center gap-2 p-10 text-sm text-foreground/60">
        <RefreshCw className="h-4 w-4 animate-spin" />Loading certification expiries...
      </CardContent></Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-red-200 dark:border-red-800"><CardContent className="p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <div><div className="text-2xl font-bold tabular-nums text-red-700 dark:text-red-300">{counts.expired}</div><div className="text-xs font-medium text-foreground/60">Expired certificates</div></div>
        </CardContent></Card>
        <Card className="border-amber-200 dark:border-amber-800"><CardContent className="p-4 flex items-center gap-3">
          <Clock className="h-5 w-5 text-amber-600" />
          <div><div className="text-2xl font-bold tabular-nums text-amber-700 dark:text-amber-300">{counts.dueSoon}</div><div className="text-xs font-medium text-foreground/60">Due within 30 days</div></div>
        </CardContent></Card>
        <Card className="border-emerald-200 dark:border-emerald-800"><CardContent className="p-4 flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-emerald-600" />
          <div><div className="text-2xl font-bold tabular-nums text-emerald-700 dark:text-emerald-300">{counts.upcoming}</div><div className="text-xs font-medium text-foreground/60">Renewals in next 90 days</div></div>
        </CardContent></Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-brand" />Certification expiry calendar</div>
              <p className="text-xs text-foreground/50">Click a day to see every certificate expiring then.</p>
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
              const dayCerts = byDay.get(key) || [];
              const inMonth = isSameMonth(day, month);
              const urg = dayCerts.length ? urgency(dayCerts[0].expiry_date) : null;
              return (
                <button
                  key={key}
                  onClick={() => dayCerts.length && setSelected(dayCerts)}
                  className={`min-h-16 rounded-lg border p-1 text-left align-top text-xs transition-colors sm:min-h-20 ${!inMonth ? 'border-transparent text-foreground/25' : urg ? URGENCY_STYLES[urg].cell : 'border-border/50'} ${dayCerts.length ? 'cursor-pointer hover:brightness-95' : 'cursor-default'} ${isToday(day) ? 'ring-2 ring-brand/60' : ''}`}
                >
                  <div className="font-semibold tabular-nums">{format(day, 'd')}</div>
                  <div className="mt-0.5 space-y-0.5">
                    {dayCerts.slice(0, 2).map((c) => (
                      <div key={c.id} className={`truncate rounded px-1 py-0.5 text-[10px] font-medium ${URGENCY_STYLES[urgency(c.expiry_date)].chip}`} title={`${c.staff_name}: ${c.module_title}`}>
                        {c.staff_name}
                      </div>
                    ))}
                    {dayCerts.length > 2 && <div className="px-1 text-[10px] font-semibold text-foreground/50">+{dayCerts.length - 2} more</div>}
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-4 rounded-xl border border-border/60 bg-muted/30 p-4">
              <div className="mb-2 text-sm font-semibold">Expiring {format(new Date(selected[0].expiry_date), 'EEEE d MMMM yyyy')}</div>
              <div className="space-y-1">
                {selected.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs">
                    <span className="font-semibold">{c.staff_name}</span>
                    <span className="text-foreground/60">{c.module_title}</span>
                    <Badge className={statusTone(c.status)}>{c.status}</Badge>
                    <span className="ml-auto tabular-nums text-foreground/50">{c.certificate_number || 'No number'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="mb-3 font-semibold">Next renewals ahead</div>
          {upcoming.length === 0 ? (
            <p className="text-sm text-foreground/60">No certificates with future expiry dates.</p>
          ) : (
            <div className="space-y-1">
              {upcoming.map((c) => {
                const urg = urgency(c.expiry_date);
                return (
                  <div key={c.id} className={`flex flex-wrap items-center gap-2 rounded-lg px-3 py-2 text-xs ${URGENCY_STYLES[urg].chip.replace('hover:', '')}`}>
                    <span className="font-semibold">{c.staff_name}</span>
                    <span className="opacity-80">{c.module_title}</span>
                    <span className="ml-auto tabular-nums font-semibold">{format(new Date(c.expiry_date), 'd MMM yyyy')}</span>
                    <span className="tabular-nums opacity-70">in {differenceInCalendarDays(new Date(c.expiry_date), new Date())}d</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

const endOfMonthSafe = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);