import React, { useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';
import { downloadCsv } from '@/lib/csvExport';
import { money, startOfWeek, loadHolidaySet, buildPayRow, round2 } from '@/components/payroll/payrollShared';

// Weekly timesheets built from rostered shifts, using the shared pay maths.
export default function TimesheetsTab() {
  const [weekStart, setWeekStart] = useState(() => startOfWeek());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d.toISOString().slice(0, 10);
  }, [weekStart]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [holidaySet, shiftPage, detailPage] = await Promise.all([
        loadHolidaySet(),
        base44.entities.Shift.filter({ date: { $gte: weekStart, $lte: weekEnd } }, { sort: 'date', limit: 500 }),
        base44.entities.StaffPayrollDetail.filter({}, { limit: 300 }),
      ]);
      const byEmployee = new Map();
      for (const s of shiftPage.items || []) {
        const name = s.employee_name || 'Unassigned';
        if (!byEmployee.has(name)) byEmployee.set(name, []);
        byEmployee.get(name).push(s);
      }
      const detailByName = new Map((detailPage.items || []).map((d) => [d.employee_name, d]));
      const computed = [...byEmployee.entries()].map(([name, shifts]) => {
        const detail = detailByName.get(name) || { employee_name: name };
        const { row, pay } = buildPayRow(detail, shifts, holidaySet);
        return { name, shifts, row, pay, completed: shifts.filter((s) => s.status === 'Completed').length };
      });
      computed.sort((a, b) => a.name.localeCompare(b.name));
      setRows(computed);
      setLoading(false);
    })();
  }, [weekStart, weekEnd]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-2">
        <div className="grid gap-1.5"><Label>Week starting (Monday)</Label><Input type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} /></div>
        <Button variant="outline" onClick={() => downloadCsv(`timesheets-${weekStart}.csv`, [
          { label: 'Employee', key: 'name' }, { label: 'Shifts', key: 'shiftCount' }, { label: 'Payable hours', key: 'hours' },
          { label: 'Weekday hrs', key: 'weekday' }, { label: 'After 8pm hrs', key: 'after' }, { label: 'Sat hrs', key: 'sat' },
          { label: 'Sun hrs', key: 'sun' }, { label: 'Public holiday hrs', key: 'ph' }, { label: 'Travel km', key: 'km' },
          { label: 'Hourly rate', key: 'rate' }, { label: 'Gross pay ($)', key: 'gross' },
        ], rows.map((r) => ({
          name: r.name, shiftCount: r.shifts.length, hours: round2(r.row.approved_hours), weekday: round2(r.row.ap_weekday),
          after: round2(r.row.ap_after_8pm), sat: round2(r.row.ap_saturday), sun: round2(r.row.ap_sunday), ph: round2(r.row.ap_ph),
          km: round2(r.row.approved_km), rate: r.row.hourly_rate.toFixed(2), gross: r.pay.totalPay.toFixed(2),
        })))}>Export CSV</Button>
      </div>

      {loading ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">Loading timesheets...</CardContent></Card>
      ) : rows.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No shifts rostered for the week starting {weekStart}.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <Card key={r.name}><CardContent className="p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-teal/10 p-2"><Clock className="h-4 w-4 text-teal" /></div>
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.shifts.length} shift{r.shifts.length === 1 ? '' : 's'} · {r.completed} completed · {round2(r.row.approved_hours)} payable hrs · {round2(r.row.approved_km)} km</p>
                  </div>
                </div>
                <p className="text-lg font-bold">{money(r.pay.totalPay)}</p>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                <span className="rounded-md bg-muted px-2 py-0.5">Weekday {round2(r.row.ap_weekday)}h</span>
                <span className="rounded-md bg-muted px-2 py-0.5">After 8pm {round2(r.row.ap_after_8pm)}h</span>
                <span className="rounded-md bg-muted px-2 py-0.5">Saturday {round2(r.row.ap_saturday)}h</span>
                <span className="rounded-md bg-muted px-2 py-0.5">Sunday {round2(r.row.ap_sunday)}h</span>
                <span className="rounded-md bg-muted px-2 py-0.5">Public holiday {round2(r.row.ap_ph)}h</span>
              </div>
              <details className="mt-2 text-xs text-muted-foreground">
                <summary className="cursor-pointer font-medium">Show shifts</summary>
                <div className="mt-1 space-y-0.5">
                  {r.shifts.map((s) => (
                    <div key={s.id}>{s.date} · {s.start_time || ''}{s.end_time ? `-${s.end_time}` : ''} · {s.participant_name || ''} · {s.status}{s.approval_status && s.approval_status !== 'Not Required' ? ` · ${s.approval_status}` : ''}</div>
                  ))}
                </div>
              </details>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}