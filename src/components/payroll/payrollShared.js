import { base44 } from '@/api/base44Client';
import { classifyPayHours, computePay } from '@/lib/payroll';
import { shiftHours } from '@/lib/rostering';
import { estimatePayg } from '@/lib/payrollExports';
import { format } from 'date-fns';

export const money = (v) => `$${Number(v || 0).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const round2 = (v) => Math.round((Number(v) || 0) * 100) / 100;

// Payable hours for a single shift (minus unpaid break) - used on timesheet views.
export function shiftHoursPayable(s) {
  return Math.max(0, shiftHours(s.start_time, s.end_time) - (s.break_minutes || 0) / 60);
}

export function startOfWeek(dateStr) {
  const d = new Date(dateStr || Date.now());
  const day = (d.getDay() + 6) % 7; // Monday
  d.setDate(d.getDate() - day);
  return format(d, 'yyyy-MM-dd');
}

export async function loadHolidaySet() {
  const page = await base44.entities.RosterPublicHoliday.filter({ active: true }, { limit: 500, fields: ['holiday_date'] });
  return new Set((page.items || []).map((h) => h.holiday_date));
}

// Builds the pay-computation row for one employee's shifts using the shared
// payroll maths, so timesheets, payslips and reports all agree.
export function buildPayRow(detail, shifts, holidaySet) {
  const shiftRate = Number(shifts[0]?.billable_rate) || 0;
  const row = {
    employee_name: detail.employee_name,
    hourly_rate: Number(detail.hourly_rate) || shiftRate,
    ap_weekday: 0, ap_after_8pm: 0, ap_saturday: 0, ap_sunday: 0, ap_ph: 0,
    approved_km: 0, approved: shifts.length, approved_hours: 0,
  };
  for (const s of shifts) {
    const c = classifyPayHours(s, holidaySet);
    row.ap_weekday += c.weekday;
    row.ap_after_8pm += c.after_8pm;
    row.ap_saturday += c.saturday;
    row.ap_sunday += c.sunday;
    row.ap_ph += c.public_holiday;
    row.approved_hours += c.payable;
    row.approved_km += Number(s.travel_km || 0);
  }
  const pay = computePay(row, { otherAllowance: Number(detail.allowances_per_pay || 0) });
  return { row, pay };
}

// Turns a computed pay row into the fields stored on a Payslip record.
export function buildPayslipPayload(detail, row, pay, periodStart, periodEnd) {
  const periodsPerYear = detail.pay_cycle === 'Weekly' ? 52 : detail.pay_cycle === 'Monthly' ? 12 : 26;
  const earningsJson = {
    hourly_rate: pay.hourlyRate,
    loadings: pay.loadings,
    kmRate: pay.kmRate,
    km: round2(row.approved_km),
    buckets: pay.buckets.map((b) => ({ key: b.key, label: b.label, hours: round2(b.hours), pay: round2(b.pay) })),
    hours: round2(row.approved_hours),
    shifts: row.approved,
    weekStart: periodStart,
    weekEnd: periodEnd,
  };
  const gross = pay.totalPay;
  const payg = estimatePayg(gross, periodsPerYear);
  const superAmount = pay.earnings * ((Number(detail.super_rate) || 11.5) / 100);
  const deductions = Number(detail.salary_sacrifice) || 0;
  return {
    earnings_json: JSON.stringify(earningsJson),
    gross: round2(gross),
    payg_tax: payg,
    superannuation: round2(superAmount),
    deductions,
    net: round2(gross - payg - deductions),
    hours_worked: round2(row.approved_hours),
    shifts_count: row.approved,
  };
}

// Rebuilds the pay row (and settings) from a saved Payslip for the PDF.
export function payslipPdfRow(payslip) {
  const ej = JSON.parse(payslip.earnings_json || '{}');
  const b = (key) => ((ej.buckets || []).find((x) => x.key === key) || {}).hours || 0;
  return {
    employee_name: payslip.employee_name,
    hourly_rate: ej.hourly_rate || 0,
    approved_hours: ej.hours || 0,
    approved: ej.shifts || 0,
    approved_km: ej.km || 0,
    ap_weekday: b('base'),
    ap_after_8pm: b('after_8pm'),
    ap_saturday: b('saturday'),
    ap_sunday: b('sunday'),
    ap_ph: b('public_holiday'),
  };
}

export function payslipPdfSettings(payslip) {
  const ej = JSON.parse(payslip.earnings_json || '{}');
  return { loadings: ej.loadings, kmRate: ej.kmRate, weekStart: payslip.pay_period_start, weekEnd: payslip.pay_period_end };
}