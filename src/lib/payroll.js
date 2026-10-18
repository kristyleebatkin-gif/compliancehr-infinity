// Shared payroll maths: hour-bucket classification and pay computation.
// Single source of truth for the payroll report (rostering) and the payslip PDF,
// so both always apply the same loadings and allowances.
import { shiftHours, timeToMinutes } from '@/lib/rostering';
import { getDay, parseISO } from 'date-fns';

export const DEFAULT_LOADINGS = { after8: 110, saturday: 150, sunday: 160, ph: 225 };
export const DEFAULT_KM_RATE = 0.99;

const rateNum = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

// Splits a shift's payable hours across the pay classifications.
// Returns hours for weekday (<8pm), after-8pm, Saturday, Sunday and public holiday buckets.
export function classifyPayHours(s, holidaySet) {
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

// Computes approved-shift pay from the approved hour buckets on a report row.
// settings: { loadings, kmRate, otherAllowance }. Returns raw numbers plus the
// merged loadings so callers display and export exactly what was applied.
export function computePay(row, settings = {}) {
  const loadings = { ...DEFAULT_LOADINGS, ...(settings.loadings || {}) };
  const kmRate = rateNum(settings.kmRate ?? DEFAULT_KM_RATE);
  const hasRate = row.hourly_rate != null && row.hourly_rate !== '';
  const hourlyRate = hasRate ? rateNum(row.hourly_rate) : 0;
  const R = hourlyRate;

  const buckets = [
    { key: 'base', label: 'Weekday (before 8pm)', hours: row.ap_weekday || 0, loading: 100 },
    { key: 'after_8pm', label: 'After 8pm', hours: row.ap_after_8pm || 0, loading: loadings.after8 },
    { key: 'saturday', label: 'Saturday', hours: row.ap_saturday || 0, loading: loadings.saturday },
    { key: 'sunday', label: 'Sunday', hours: row.ap_sunday || 0, loading: loadings.sunday },
    { key: 'public_holiday', label: 'Public holiday', hours: row.ap_ph || 0, loading: loadings.ph },
  ].map((b) => ({ ...b, pay: b.hours * R * (b.loading / 100) }));

  const earnings = buckets.reduce((sum, b) => sum + b.pay, 0);
  const approvedKm = rateNum(row.approved_km);
  const travelAllowance = approvedKm * kmRate;
  const other = rateNum(settings.otherAllowance);
  const totalAllowances = travelAllowance + other;

  return {
    loadings,
    kmRate,
    hasRate,
    hourlyRate: R,
    buckets,
    earnings,
    approvedKm,
    travelAllowance,
    other,
    totalAllowances,
    totalPay: earnings + totalAllowances,
  };
}