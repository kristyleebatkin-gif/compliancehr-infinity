import React, { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek, getDay } from 'date-fns';
import { parseISO } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { shiftHours, timeToMinutes } from '@/lib/rostering';

const PAYROLL_CSV_COLUMNS = [
  { key: 'employee_name', label: 'Employee' },
  { key: 'week_start', label: 'Week Start' },
  { key: 'week_end', label: 'Week End' },
  { key: 'shifts', label: 'Shifts' },
  { key: 'planned_hours', label: 'Planned Hours' },
  { key: 'break_hours', label: 'Unpaid Breaks (hrs)' },
  { key: 'payable_hours', label: 'Payable Hours' },
  { key: 'weekday_hours', label: 'Weekday Hours (< 8pm)' },
  { key: 'after_8pm_hours', label: 'After 8pm Hours' },
  { key: 'saturday_hours', label: 'Saturday Hours' },
  { key: 'sunday_hours', label: 'Sunday Hours' },
  { key: 'public_holiday_hours', label: 'Public Holiday Hours' },
  { key: 'travel_km', label: 'Travel (km)' },
  { key: 'allowances', label: 'Allowances ($)' },
  { key: 'completed', label: 'Completed Shifts' },
  { key: 'approved', label: 'Approved Shifts' },
  { key: 'pending_approval', label: 'Awaiting Approval' },
  { key: 'timesheet_logged', label: 'Clock-ins Logged' },
  { key: 'hourly_rate', label: 'Hourly Rate ($)' },
  { key: 'estimated_pay', label: 'Estimated Pay ($)' },
  { key: 'total_pay', label: 'Total Pay incl. Allowances ($)' },
];

// Splits a shift's payable hours across the pay classifications.
// Returns hours for weekday (<8pm), after-8pm, Saturday, Sunday and public holiday buckets.
function classifyShift(s, holidaySet) {
  const hrs = shiftHours(s.start_time, s.end_time);
  const brk = (s.break_minutes || 0) / 60;
  const payable = Math.max(0, hrs - brk);
  if (payable === 0) {
    return { payable, weekday: 0, after_8pm: 0, saturday: 0, sunday: 0, public_holiday: 0 };
  }
  if (!s.date) return { payable, weekday: payable, after_8pm: 0, saturday: 0, sunday: 0, public_holiday: 0 };

  const day = parseISO(s.date);
  if (holidaySet.has(s.date)) {
    return { payable, weekday: 0, after_8pm: 0, saturday: 0, sunday: 0, public_holiday: payable };
  }
  const dow = getDay(day); // 0 Sunday, 6 Saturday
  if (dow === 0) return { payable, weekday: 0, after_8pm: 0, saturday: 0, sunday: payable, public_holiday: 0 };
  if (dow === 6) return { payable, weekday: 0, after_8pm: 0, saturday: payable, sunday: 0, public_holiday: 0 };

  // Weekday: split at 8pm. Shifts running past midnight count fully as after-8pm.
  const startMin = timeToMinutes(s.start_time);
  const endMin = timeToMinutes(s.end_time);
  const crossesMidnight = endMin !== null && startMin !== null && endMin <= startMin;
  const cutoff = 20 * 60;
  if (startMin === null || endMin === null || crossesMidnight) {
    return { payable, weekday: 0, after_8pm: payable, saturday: 0, sunday: 0, public_holiday: 0 };
  }
  const effectiveEnd = Math.min(endMin, cutoff);
  const dayHrs = Math.max(0, ((effectiveEnd - startMin) / 60) - brk);
  const dayHrsCapped = Math.min(dayHrs, payable);
  return { payable, weekday: dayHrsCapped, after_8pm: payable - dayHrsCapped, saturday: 0, sunday: 0, public_holiday: 0 };
}

export default function PayrollReport() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [staffFilter, setStaffFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
  const [allowances, setAllowances] = useState({});
  const [loading, setLoading] = useState(true);

  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  const fromStr = format(weekStart, 'yyyy-MM-dd');
  const toStr = format(weekEnd, 'yyyy-MM-dd');

  const load = useCallback(async (start, staffName) => {
    setLoading(true);
    try {
      const from = format(start, 'yyyy-MM-dd');
      const to = format(endOfWeek(start, { weekStartsOn: 1 }), 'yyyy-MM-dd');
      const query = { date: { $gte: from, $lte: to }, employee_name: { $ne: null }, status: { $ne: 'Cancelled' } };
      if (staffName && staffName !== 'all') query.employee_name = staffName;
      const [shiftPage, staffPage, holidayPage] = await Promise.all([
        base44.entities.Shift.filter(query, { sort: 'date', limit: 500 }),
        base44.entities.StaffProfile.filter({ status: 'Active' }, { limit: 500, fields: ['full_name', 'hourly_rate'] }),
        base44.entities.RosterPublicHoliday.filter({ active: true, holiday_date: { $gte: from, $lte: to } }, { limit: 100, fields: ['holiday_date'] }),
      ]);
      const rates = {};
      (staffPage.items || []).forEach((sp) => { if (sp.full_name) rates[sp.full_name] = sp.hourly_rate; });
      const holidaySet = new Set((holidayPage.items || []).map((h) => h.holiday_date));

      const byStaff = {};
      for (const s of shiftPage.items) {
        const name = s.employee_name;
        if (!name) continue;
        const row = byStaff[name] = byStaff[name] || {
          employee_name: name, shifts: 0, planned_hours: 0, break_hours: 0,
          payable_hours: 0, weekday_hours: 0, after_8pm_hours: 0, saturday_hours: 0,
          sunday_hours: 0, public_holiday_hours: 0, travel_km: 0, completed: 0,
          approved: 0, pending_approval: 0, timesheet_logged: 0,
        };
        row.shifts += 1;
        const hrs = shiftHours(s.start_time, s.end_time);
        const brk = (s.break_minutes || 0) / 60;
        row.planned_hours += hrs;
        row.break_hours += brk;
        row.payable_hours += Math.max(0, hrs - brk);
        const buckets = classifyShift(s, holidaySet);
        row.weekday_hours += buckets.weekday;
        row.after_8pm_hours += buckets.after_8pm;
        row.saturday_hours += buckets.saturday;
        row.sunday_hours += buckets.sunday;
        row.public_holiday_hours += buckets.public_holiday;
        row.travel_km += s.travel_km || 0;
        if (s.status === 'Completed') row.completed += 1;
        if (s.approval_status === 'Approved') row.approved += 1;
        if (s.approval_status === 'Pending Approval') row.pending_approval += 1;
        if (s.clock_in || s.clock_out) row.timesheet_logged += 1;
      }
      const list = Object.values(byStaff)
        .map((r) => {
          const rate = rates[r.employee_name];
          return {
            ...r,
            week_start: from,
            week_end: to,
            planned_hours: r.planned_hours.toFixed(2),
            break_hours: r.break_hours.toFixed(2),
            payable_hours: r.payable_hours.toFixed(2),
            weekday_hours: r.weekday_hours.toFixed(2),
            after_8pm_hours: r.after_8pm_hours.toFixed(2),
            saturday_hours: r.saturday_hours.toFixed(2),
            sunday_hours: r.sunday_hours.toFixed(2),
            public_holiday_hours: r.public_holiday_hours.toFixed(2),
            travel_km: r.travel_km.toFixed(1),
            hourly_rate: rate != null ? rate : '',
            estimated_pay: rate != null ? (r.payable_hours * rate).toFixed(2) : '',
          };
        })
        .sort((a, b) => a.employee_name.localeCompare(b.employee_name));
      setRows(list);
      setTotals({
        shifts: shiftPage.items.length,
        payable: list.reduce((sum, r) => sum + parseFloat(r.payable_hours), 0),
        travel: list.reduce((sum, r) => sum + parseFloat(r.travel_km), 0),
        pay: list.reduce((sum, r) => sum + (r.estimated_pay ? parseFloat(r.estimated_pay) : 0), 0),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(weekStart, staffFilter); }, [weekStart, staffFilter, load]);

  const allowanceFor = (name) => Number(allowances[name]) || 0;
  const totalPay = (r) => (r.estimated_pay ? parseFloat(r.estimated_pay) : 0) + allowanceFor(r.employee_name);

  const exportCsv = () => {
    downloadCsv(`payroll-week-${fromStr}.csv`, PAYROLL_CSV_COLUMNS,
      rows.map((r) => ({ ...r, allowances: allowanceFor(r.employee_name).toFixed(2), total_pay: totalPay(r).toFixed(2) })));
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}><ChevronLeft className="h-4 w-4" /></Button>
          <span className="text-sm font-semibold">{format(weekStart, 'd MMM')} – {format(weekEnd, 'd MMM yyyy')}</span>
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>This week</Button>
          <Select value={staffFilter} onValueChange={setStaffFilter}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All staff</SelectItem>
              {rows.map((r) => <SelectItem key={r.employee_name} value={r.employee_name}>{r.employee_name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={exportCsv} disabled={rows.length === 0} className="ml-auto">
            <Download className="h-4 w-4" /> Export CSV
          </Button>
        </div>

        {totals && rows.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="font-medium">{totals.shifts} shifts</span>
            <span className="text-muted-foreground">{totals.payable.toFixed(2)} payable hours</span>
            <span className="text-muted-foreground">{totals.travel.toFixed(1)} km travel</span>
            {totals.pay > 0 && <span className="text-muted-foreground">${totals.pay.toFixed(2)} estimated pay</span>}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No payable shifts in this week.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Shifts</th>
                  <th className="py-2 pr-4">Planned hrs</th>
                  <th className="py-2 pr-4">Breaks (hrs)</th>
                  <th className="py-2 pr-4">Payable hrs</th>
                  <th className="py-2 pr-4">Weekday &lt; 8pm</th>
                  <th className="py-2 pr-4">After 8pm</th>
                  <th className="py-2 pr-4">Saturday</th>
                  <th className="py-2 pr-4">Sunday</th>
                  <th className="py-2 pr-4">Public hol.</th>
                  <th className="py-2 pr-4">Travel (km)</th>
                  <th className="py-2 pr-4">Allowances ($)</th>
                  <th className="py-2 pr-4">Approved</th>
                  <th className="py-2 pr-4">Pending approval</th>
                  <th className="py-2 pr-4">Clock-ins</th>
                  <th className="py-2 pr-4">Est. pay ($)</th>
                  <th className="py-2">Total pay ($)</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.employee_name} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{r.employee_name}</td>
                    <td className="py-2 pr-4">{r.shifts}</td>
                    <td className="py-2 pr-4">{r.planned_hours}</td>
                    <td className="py-2 pr-4">{r.break_hours}</td>
                    <td className="py-2 pr-4 font-semibold">{r.payable_hours}</td>
                    <td className="py-2 pr-4">{r.weekday_hours}</td>
                    <td className="py-2 pr-4">{r.after_8pm_hours}</td>
                    <td className="py-2 pr-4">{r.saturday_hours}</td>
                    <td className="py-2 pr-4">{r.sunday_hours}</td>
                    <td className="py-2 pr-4">{r.public_holiday_hours}</td>
                    <td className="py-2 pr-4">{r.travel_km}</td>
                    <td className="py-2 pr-4">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-8 w-24"
                        value={allowances[r.employee_name] ?? ''}
                        placeholder="0"
                        onChange={(e) => setAllowances({ ...allowances, [r.employee_name]: e.target.value })}
                      />
                    </td>
                    <td className="py-2 pr-4">{r.approved}</td>
                    <td className="py-2 pr-4">{r.pending_approval}</td>
                    <td className="py-2 pr-4">{r.timesheet_logged}</td>
                    <td className="py-2 pr-4">{r.estimated_pay}</td>
                    <td className="py-2 font-semibold">{totalPay(r).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">
              Allowances are entered per staff member for this week and included in the CSV export and total pay. Rate loading is calculated from the hourly rate — apply weekend, after-8pm and public holiday loadings in your payroll system using the hour breakdown above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}