import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_LOADINGS, classifyPayHours, computePay } from '@/lib/payroll';
import { Calculator, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Labour-cost forecast before publishing a roster (Deputy/Tanda parity): the week's
// scheduled shifts priced with each worker's hourly rate and the SCHADS loadings.
export default function RosterLabourForecast({ shifts = [] }) {
  const [rates, setRates] = useState(null);
  const [holidays, setHolidays] = useState(null);

  const dateBoundsKey = useMemo(() => {
    const dates = shifts.map((s) => s.date).filter(Boolean).sort();
    return `${dates[0] || '1970-01-01'}|${dates[dates.length - 1] || '2100-01-01'}`;
  }, [shifts]);

  useEffect(() => {
    let live = true;
    const [from, to] = dateBoundsKey.split('|');
    Promise.all([
      base44.entities.StaffProfile.filter({ status: 'Active' }, { limit: 500, fields: ['full_name', 'hourly_rate'] }),
      base44.entities.RosterPublicHoliday.filter({ active: true, holiday_date: { $gte: from, $lte: to } }, { limit: 100, fields: ['holiday_date'] }),
    ]).then(([staffPage, holidayPage]) => {
      if (!live) return;
      const map = {};
      (staffPage.items || []).forEach((s) => { if (s.full_name) map[s.full_name] = Number(s.hourly_rate) || 0; });
      setRates(map);
      setHolidays(new Set((holidayPage.items || []).map((h) => h.holiday_date)));
    }).catch(() => live && (setRates({}), setHolidays(new Set())));
    return () => { live = false; };
  }, [dateBoundsKey]);

  const forecast = useMemo(() => {
    if (!rates || !holidays) return null;
    const byDay = {};
    let total = 0;
    let hours = 0;
    let missing = 0;
    shifts
      .filter((s) => s.status !== 'Cancelled' && s.status !== 'Missed')
      .forEach((s) => {
        const rate = rates[s.employee_name];
        const buckets = classifyPayHours(s, holidays);
        const pay = computePay(
          { hourly_rate: rate, ap_weekday: buckets.weekday, ap_after_8pm: buckets.after_8pm, ap_saturday: buckets.saturday, ap_sunday: buckets.sunday, ap_ph: buckets.public_holiday },
          { loadings: DEFAULT_LOADINGS },
        );
        if (!rate) missing += 1;
        total += pay.totalPay;
        hours += buckets.payable;
        const day = s.date ? format(parseISO(s.date), 'EEE d MMM') : 'Unknown';
        byDay[day] = (byDay[day] || 0) + pay.totalPay;
      });
    return { total, hours, missing, byDay };
  }, [rates, holidays, shifts]);

  const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { maximumFractionDigits: 2 })}`;

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-emerald-500/10 p-2"><Calculator className="h-4 w-4 text-emerald-600" /></div>
          <div>
            <p className="text-sm font-bold">Labour-cost forecast</p>
            <p className="text-xs text-muted-foreground">Scheduled shifts priced at each worker's hourly rate with SCHADS loadings, before you publish</p>
          </div>
        </div>

        {forecast === null ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />Pricing the roster...
          </div>
        ) : (
          <>
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-500/10 p-3">
                <p className="text-xl font-bold tabular-nums text-emerald-700">{money(forecast.total)}</p>
                <p className="text-[11px] font-medium text-emerald-700/70">Forecast wage cost</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="text-xl font-bold tabular-nums">{forecast.hours.toFixed(1)}</p>
                <p className="text-[11px] text-muted-foreground">Payable hours</p>
              </div>
              <div className="rounded-xl border border-border/60 bg-muted/30 p-3">
                <p className="text-xl font-bold tabular-nums">{forecast.hours > 0 ? money(forecast.total / forecast.hours) : '—'}</p>
                <p className="text-[11px] text-muted-foreground">Average cost / hour</p>
              </div>
            </div>

            {Object.keys(forecast.byDay).length > 0 && (
              <table className="mt-4 w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-1.5 font-semibold">Day</th>
                    <th className="py-1.5 text-right font-semibold">Forecast cost</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(forecast.byDay).map(([day, cost]) => (
                    <tr key={day} className="border-b border-border/40 last:border-0 hover:bg-muted/30">
                      <td className="py-1.5">{day}</td>
                      <td className="py-1.5 text-right font-semibold tabular-nums">{money(cost)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {forecast.missing > 0 && (
              <p className="mt-2 text-xs text-muted-foreground">{forecast.missing} shift{forecast.missing === 1 ? '' : 's'} priced at $0 — the assigned worker has no hourly rate recorded in their profile.</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}