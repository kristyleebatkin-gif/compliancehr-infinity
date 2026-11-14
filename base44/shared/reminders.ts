import { BUSINESS_TIME_ZONE } from './businessTime.ts';
// Shared date + pagination helpers for reminder scan functions (Australia/Sydney).

export { BUSINESS_TIME_ZONE };

export const auDate = (d) => new Intl.DateTimeFormat('en-CA', {
  timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
}).format(d);

export const auTime = (d) => new Intl.DateTimeFormat('en-AU', {
  timeZone: BUSINESS_TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false,
}).format(d);

export const pretty = (iso) => iso
  ? new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(`${iso}T00:00:00Z`))
  : '';

export const addDays = (iso, days) => {
  if (!iso) return '';
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return '';
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

export const pageItems = (page) => page?.items || page || [];