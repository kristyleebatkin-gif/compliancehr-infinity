import React, { useState, useCallback, useEffect, useMemo } from 'react';
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

const DEFAULT_LOADINGS = { after8: 110, saturday: 150, sunday: 160, ph: 225 };
const DEFAULT_KM_RATE = 0.99;

const PAYROLL_CSV_COLUMNS = [
  { key: 'employee_name', label: 'Employee' },
  { key: 'week_start', label: 'Week Start' },
  { key: 'week_end', label: 'Week End' },
  { key: 'shifts', label: 'Shifts' },
  { key: 'planned_hours', label: 'Planned Hours' },
  { key: 'break_hours', label: 'Unpaid Breaks (hrs)' },
  { key: 'payable_hours', label: 'Payable Hours (all shifts)' },
  { key: 'approved_hours', label: 'Approved Payable Hours' },
  { key: 'pending_approval', label: 'Awaiting Approval' },
  { key: 'weekday_hours', label: 'Approved Weekday Hours (< 8pm)' },
  { key: 'after_8pm_hours', label: 'Approved After 8pm Hours' },
  { key: 'saturday_hours', label: 'Approved Saturday Hours' },
  { key: 'sunday_hours', label: 'Approved Sunday Hours' },
  { key: 'public_holiday_hours', label: 'Approved Public Holiday Hours' },
  { key: 'travel_km', label: 'Approved Travel (km)' },
  { key: 'hourly_rate', label: 'Hourly Rate ($)' },
  { key: 'after_8pm_loading', label: 'After 8pm Loading (%)' },
  { key: 'saturday_loading', label: 'Saturday Loading (%)' },
  { key: 'sunday_loading', label: 'Sunday Loading (%)' },
  { key: 'ph_loading', label: 'Public Holiday Loading (%)' },
  { key: 'base_pay', label: 'Base Pay ($)' },
  { key: 'after_8pm_pay', label: 'After 8pm Pay ($)' },
  { key: 'saturday_pay', label: 'Saturday Pay ($)' },
  { key: 'sunday_pay', label: 'Sunday Pay ($)' },
  { key: 'public_holiday_pay', label: 'Public Holiday Pay ($)' },
  { key: 'travel_allowance', label: 'Travel Allowance ($)' },
  { key: 'other_allowances', label: 'Other Allowances ($)' },
  { key: 'total_allowances', label: 'Total Allowances ($)' },
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

const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
const hrs2 = (v) => num(v).toFixed(2);
const money = (v) => (num(v)).toFixed(2);

export default function PayrollReport() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [staffFilter, setStaffFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [loadings, setLoadings] = useState(DEFAULT_LOADINGS);
  const [kmRate, setKmRate] = useState(DEFAULT_KM_RATE);
  const [otherAllowances, setOtherAllowances] = useState({});
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
          sunday_hours: 0, public_holiday_hours: 0, travel_km: 0,
          // Approved-only hours that feed the pay calculation
          ap_weekday: 0, ap_after_8pm: 0, ap_saturday: 0, ap_sunday: 0, ap_ph: 0,
          approved_hours: 0, approved_km: 0, approved: 0, pending_approval: 0,
        };
        row.shifts += 1;
        const hrs = shiftHours(s.start_time, s.end_time);
        const brk = (s.break_minutes || 0) / 60;
        row.planned_hours += hrs;
        row.break_hours += brk;
        row.payable_hours += Math.max(0, hrs - brk);
        const buckets = classifyShift(s, holidaySet);
        const approved = s.approval_status === 'Approved';
        if (approved) {
          row.ap_weekday += buckets.weekday;
          row.ap_after_8pm += buckets.after_8pm;
          row.ap_saturday += buckets.saturday;
          row.ap_sunday += buckets.sunday;
          row.ap_ph += buckets.public_holiday;
          row.approved_hours += buckets.payable;
          row.approved_km += s.travel_km || 0;
        }
        row.travel_km += s.travel_km || 0;
        if (s.approval_status === 'Approved') row.approved += 1;
        if (s.approval_status === 'Pending Approval') row.pending_approval += 1;
      }
      const list = Object.values(byStaff)
        .map((r) => ({ ...r, week_start: from, week_end: to }))
        .sort((a, b) => a.employee_name.localeCompare(b.employee_name));
      setRows(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(weekStart, staffFilter); }, [weekStart, staffFilter, load]);

  // Pay calculation — derived from the approved (timesheet-approved) hour buckets.
  const displayRows = useMemo(() => {
    const l = {
      after8: num(loadings.after8) / 100,
      saturday: num(loadings.saturday) / 100,
      sunday: num(loadings.sunday) / 100,
      ph: num(loadings.ph) / 100,
    };
    return rows.map((r) => {
      const rate = r.hourly_rate;
      const hasRate = rate != null && rate !== '';
      const R = hasRate ? num(rate) : 0;
      const basePay = r.ap_weekday * R;
      const after8Pay = r.ap_after_8pm * R * l.after8;
      const saturdayPay = r.ap_saturday * R * l.saturday;
      const sundayPay = r.ap_sunday * R * l.sunday;
      const phPay = r.ap_ph * R * l.ph;
      const travelAllowance = r.approved_km * num(kmRate);
      const other = num(otherAllowances[r.employee_name]);
      const totalAllowances = travelAllowance + other;
      return {
        ...r,
        hourly_rate: hasRate ? rate : '',
        planned_hours: hrs2(r.planned_hours),
        break_hours: hrs2(r.break_hours),
        payable_hours: hrs2(r.payable_hours),
        approved_hours: hrs2(r.approved_hours),
        weekday_hours: hrs2(r.ap_weekday),
        after_8pm_hours: hrs2(r.ap_after_8pm),
        saturday_hours: hrs2(r.ap_saturday),
        sunday_hours: hrs2(r.ap_sunday),
        public_holiday_hours: hrs2(r.ap_ph),
        travel_km: r.approved_km.toFixed(1),
        base_pay: hasRate ? money(basePay) : '',
        after_8pm_pay: hasRate ? money(after8Pay) : '',
        saturday_pay: hasRate ? money(saturdayPay) : '',
        sunday_pay: hasRate ? money(sundayPay) : '',
        public_holiday_pay: hasRate ? money(phPay) : '',
        travel_allowance: money(travelAllowance),
        other_allowances: money(other),
        total_allowances: money(totalAllowances),
        approved_pay: hasRate ? money(basePay + after8Pay + saturdayPay + sundayPay + phPay) : '',
        total_pay: hasRate ? money(basePay + after8Pay + saturdayPay + sundayPay + phPay + totalAllowances) : '',
      };
    });
  }, [rows, loadings, kmRate, otherAllowances]);

  const totals = useMemo(() => ({
    shifts: rows.reduce((s, r) => s + r.shifts, 0),
    payable: rows.reduce((s, r) => s + r.payable_hours, 0),
    approved: rows.reduce((s, r) => s + r.approved_hours, 0),
    pending: rows.reduce((s, r) => s + r.pending_approval, 0),
    allowances: displayRows.reduce((s, r) => s + num(r.total_allowances), 0),
    pay: displayRows.reduce((s, r) => s + num(r.approved_pay), 0),
    totalPay: displayRows.reduce((s, r) => s + num(r.total_pay), 0),
  }), [rows, displayRows]);

  const exportCsv = () => {
    downloadCsv(`payroll-week-${fromStr}.csv`, PAYROLL_CSV_COLUMNS, displayRows.map((r) => ({
      ...r,
      after_8pm_loading: loadings.after8,
      saturday_loading: loadings.saturday,
      sunday_loading: loadings.sunday,
      ph_loading: loadings.ph,
    })));
  };

  const setOtherAllowance = (name, value) => setOtherAllowances({ ...otherAllowances, [name]: value });

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

        {rows.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border/60 bg-muted/40 p-3 text-sm">
            <span className="font-semibold">Pay rate loadings</span>
            <label className="flex items-center gap-1.5">After 8pm
              <Input type="number" min="100" step="1" className="h-8 w-20" value={loadings.after8}
                onChange={(e) => setLoadings({ ...loadings, after8: e.target.value })} />
              <span className="text-xs text-muted-foreground">%</span>
            </label>
            <label className="flex items-center gap-1.5">Saturday
              <Input type="number" min="100" step="1" className="h-8 w-20" value={loadings.saturday}
                onChange={(e) => setLoadings({ ...loadings, saturday: e.target.value })} />
              <span className="text-xs text-muted-foreground">%</span>
            </label>
            <label className="flex items-center gap-1.5">Sunday
              <Input type="number" min="100" step="1" className="h-8 w-20" value={loadings.sunday}
                onChange={(e) => setLoadings({ ...loadings, sunday: e.target.value })} />
              <span className="text-xs text-muted-foreground">%</span>
            </label>
            <label className="flex items-center gap-1.5">Public holiday
              <Input type="number" min="100" step="1" className="h-8 w-20" value={loadings.ph}
                onChange={(e) => setLoadings({ ...loadings, ph: e.target.value })} />
              <span className="text-xs text-muted-foreground">%</span>
            </label>
            <label className="flex items-center gap-1.5">Travel
              <Input type="number" min="0" step="0.01" className="h-8 w-20" value={kmRate}
                onChange={(e) => setKmRate(e.target.value)} />
              <span className="text-xs text-muted-foreground">$/km</span>
            </label>
          </div>
        )}

        {rows.length > 0 && (
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="font-medium">{totals.shifts} shifts</span>
            <span className="text-muted-foreground">{hrs2(totals.payable)} payable hrs</span>
            <span className="text-muted-foreground">{hrs2(totals.approved)} approved hrs</span>
            {totals.pending > 0 && <span className="font-medium text-warning">{totals.pending} shift(s) awaiting approval — excluded from pay</span>}
            {totals.allowances > 0 && <span className="text-muted-foreground">${money(totals.allowances)} allowances</span>}
            {totals.pay > 0 && <span className="text-muted-foreground">${money(totals.pay)} approved pay</span>}
            {totals.totalPay > 0 && <span className="font-semibold">${money(totals.totalPay)} total pay incl. allowances</span>}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-10"><div className="h-8 w-8 animate-spin rounded-full border-4 border-border border-t-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">No payable shifts in this week.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1700px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Shifts</th>
                  <th className="py-2 pr-4">Planned hrs</th>
                  <th className="py-2 pr-4">Breaks (hrs)</th>
                  <th className="py-2 pr-4">Payable hrs</th>
                  <th className="py-2 pr-4">Approved hrs</th>
                  <th className="py-2 pr-4">Weekday &lt; 8pm</th>
                  <th className="py-2 pr-4">After 8pm</th>
                  <th className="py-2 pr-4">Saturday</th>
                  <th className="py-2 pr-4">Sunday</th>
                  <th className="py-2 pr-4">Public hol.</th>
                  <th className="py-2 pr-4">Travel (km)</th>
                  <th className="py-2 pr-4">Travel allow. ($)</th>
                  <th className="py-2 pr-4">Other allow. ($)</th>
                  <th className="py-2 pr-4">Total allow. ($)</th>
                  <th className="py-2 pr-4">Approved</th>
                  <th className="py-2 pr-4">Pending approval</th>
                  <th className="py-2 pr-4">Rate ($)</th>
                  <th className="py-2 pr-4">Base pay ($)</th>
                  <th className="py-2 pr-4">After 8pm pay ($)</th>
                  <th className="py-2 pr-4">Sat pay ($)</th>
                  <th className="py-2 pr-4">Sun pay ($)</th>
                  <th className="py-2 pr-4">Public hol. pay ($)</th>
                  <th className="py-2">Total pay ($)</th>
                </tr>
              </thead>
              <tbody>
                {displayRows.map((r) => (
                  <tr key={r.employee_name} className="border-b last:border-0">
                    <td className="py-2 pr-4 font-medium">{r.employee_name}</td>
                    <td className="py-2 pr-4">{r.shifts}</td>
                    <td className="py-2 pr-4">{r.planned_hours}</td>
                    <td className="py-2 pr-4">{r.break_hours}</td>
                    <td className="py-2 pr-4">{r.payable_hours}</td>
                    <td className="py-2 pr-4 font-semibold">{r.approved_hours}</td>
                    <td className="py-2 pr-4">{r.weekday_hours}</td>
                    <td className="py-2 pr-4">{r.after_8pm_hours}</td>
                    <td className="py-2 pr-4">{r.saturday_hours}</td>
                    <td className="py-2 pr-4">{r.sunday_hours}</td>
                    <td className="py-2 pr-4">{r.public_holiday_hours}</td>
                    <td className="py-2 pr-4">{r.travel_km}</td>
                    <td className="py-2 pr-4">{r.travel_allowance}</td>
                    <td className="py-2 pr-4">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-8 w-24"
                        value={otherAllowances[r.employee_name] ?? ''}
                        placeholder="0"
                        onChange={(e) => setOtherAllowance(r.employee_name, e.target.value)}
                      />
                    </td>
                    <td className="py-2 pr-4 font-semibold">{r.total_allowances}</td>
                    <td className="py-2 pr-4">{r.approved}</td>
                    <td className="py-2 pr-4">{r.pending_approval}</td>
                    <td className="py-2 pr-4">{r.hourly_rate}</td>
                    <td className="py-2 pr-4">{r.base_pay}</td>
                    <td className="py-2 pr-4">{r.after_8pm_pay}</td>
                    <td className="py-2 pr-4">{r.saturday_pay}</td>
                    <td className="py-2 pr-4">{r.sunday_pay}</td>
                    <td className="py-2 pr-4">{r.public_holiday_pay}</td>
                    <td className="py-2 font-semibold">{r.total_pay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-xs text-muted-foreground">
              Pay is calculated from hours on shifts approved in the timesheet approval workflow — pending shifts are excluded until approved. After 8pm hours pay the hourly rate × the after-8pm loading; Saturday, Sunday and public holiday hours pay the hourly rate × their loading (defaults 110%, 150%, 160% and 225%, editable above). Travel allowance is approved kilometres × the travel rate; enter any other allowances per staff member for the week. Everything above is included in the CSV export.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}