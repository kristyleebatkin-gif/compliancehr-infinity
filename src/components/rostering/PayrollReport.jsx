import React, { useState, useCallback, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';
import { downloadCsv } from '@/lib/csvExport';
import { shiftHours } from '@/lib/rostering';

const PAYROLL_CSV_COLUMNS = [
  { key: 'employee_name', label: 'Employee' },
  { key: 'week_start', label: 'Week Start' },
  { key: 'week_end', label: 'Week End' },
  { key: 'shifts', label: 'Shifts' },
  { key: 'planned_hours', label: 'Planned Hours' },
  { key: 'break_hours', label: 'Unpaid Breaks (hrs)' },
  { key: 'payable_hours', label: 'Payable Hours' },
  { key: 'travel_km', label: 'Travel (km)' },
  { key: 'completed', label: 'Completed Shifts' },
  { key: 'pending_approval', label: 'Awaiting Approval' },
  { key: 'hourly_rate', label: 'Hourly Rate ($)' },
  { key: 'estimated_pay', label: 'Estimated Pay ($)' },
];

export default function PayrollReport() {
  const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [staffFilter, setStaffFilter] = useState('all');
  const [rows, setRows] = useState([]);
  const [totals, setTotals] = useState(null);
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
      const [shiftPage, staffPage] = await Promise.all([
        base44.entities.Shift.filter(query, { sort: 'date', limit: 500 }),
        base44.entities.StaffProfile.filter({ status: 'Active' }, { limit: 500, fields: ['full_name', 'hourly_rate'] }),
      ]);
      const rates = {};
      (staffPage.items || []).forEach((sp) => { if (sp.full_name) rates[sp.full_name] = sp.hourly_rate; });

      const byStaff = {};
      for (const s of shiftPage.items) {
        const name = s.employee_name;
        if (!name) continue;
        const row = byStaff[name] = byStaff[name] || {
          employee_name: name, shifts: 0, planned_hours: 0, break_hours: 0,
          payable_hours: 0, travel_km: 0, completed: 0, pending_approval: 0,
        };
        row.shifts += 1;
        const hrs = shiftHours(s.start_time, s.end_time);
        const brk = (s.break_minutes || 0) / 60;
        row.planned_hours += hrs;
        row.break_hours += brk;
        row.payable_hours += Math.max(0, hrs - brk);
        row.travel_km += s.travel_km || 0;
        if (s.status === 'Completed') row.completed += 1;
        if (s.approval_status === 'Pending Approval') row.pending_approval += 1;
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

  const exportCsv = () => {
    downloadCsv(`payroll-week-${fromStr}.csv`, PAYROLL_CSV_COLUMNS, rows);
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
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-muted-foreground">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Shifts</th>
                  <th className="py-2 pr-4">Planned hrs</th>
                  <th className="py-2 pr-4">Breaks (hrs)</th>
                  <th className="py-2 pr-4">Payable hrs</th>
                  <th className="py-2 pr-4">Travel (km)</th>
                  <th className="py-2 pr-4">Pending approval</th>
                  <th className="py-2">Est. pay ($)</th>
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
                    <td className="py-2 pr-4">{r.travel_km}</td>
                    <td className="py-2 pr-4">{r.pending_approval > 0 ? <span className="font-semibold text-warning">{r.pending_approval}</span> : '0'}</td>
                    <td className="py-2">{r.estimated_pay || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}