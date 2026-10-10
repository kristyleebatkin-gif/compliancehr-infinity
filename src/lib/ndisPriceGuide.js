/**
 * NDIS Pricing Schedule 2026-27 (effective 1 July 2026) - common national price limits.
 * Every rate and item number is editable on each invoice line, so a line can be
 * corrected or extended for any support not pre-listed here.
 */
export const PRICE_GUIDE_VERSION = 'NDIS Pricing Schedule 2026-27 (effective 1 July 2026, national limits)';

export const PRICE_GUIDE_NOTE = 'Rates below are 2026-27 national price limits and are editable on every line. Verify support item numbers and prices against the current NDIS Pricing Schedule before sending your invoice.';

export const SUPPORT_ITEMS = [
  { code: '01_011_0107_1_1', description: 'Assistance With Self-Care Activities - Standard - Weekday Daytime', unit: 'hour', rate: 73.58, group: 'Assistance in Daily Life' },
  { code: '01_012_0107_1_1', description: 'Assistance With Self-Care Activities - Standard - Weekday Evening', unit: 'hour', rate: 81.07, group: 'Assistance in Daily Life' },
  { code: '01_013_0107_1_1', description: 'Assistance With Self-Care Activities - Standard - Weekday Night', unit: 'hour', rate: 82.57, group: 'Assistance in Daily Life' },
  { code: '01_015_0107_1_1', description: 'Assistance With Self-Care Activities - Standard - Saturday', unit: 'hour', rate: 103.54, group: 'Assistance in Daily Life' },
  { code: '01_016_0107_1_1', description: 'Assistance With Self-Care Activities - Standard - Sunday', unit: 'hour', rate: 133.5, group: 'Assistance in Daily Life' },
  { code: '01_017_0107_1_1', description: 'Assistance With Self-Care Activities - Standard - Public Holiday', unit: 'hour', rate: 163.46, group: 'Assistance in Daily Life' },
  { code: '01_018_0107_1_1', description: 'Assistance With Self-Care Activities - Standard - Weekday Night Sleepover', unit: 'each', rate: 311.79, group: 'Assistance in Daily Life' },
  { code: '', description: 'High Intensity Daily Personal Activities - Weekday Daytime', unit: 'hour', rate: 79.6, group: 'Assistance in Daily Life' },
  { code: '', description: 'High Intensity Daily Personal Activities - Saturday', unit: 'hour', rate: 112.01, group: 'Assistance in Daily Life' },
  { code: '', description: 'High Intensity Daily Personal Activities - Sunday', unit: 'hour', rate: 144.42, group: 'Assistance in Daily Life' },
  { code: '', description: 'High Intensity Daily Personal Activities - Public Holiday', unit: 'hour', rate: 176.84, group: 'Assistance in Daily Life' },
  { code: '', description: 'Assistance With Personal Domestic Activities', unit: 'hour', rate: 61.16, group: 'Household & Domestic' },
  { code: '', description: 'House Cleaning and Other Household Activities', unit: 'hour', rate: 60.1, group: 'Household & Domestic' },
  { code: '', description: 'House or Yard Maintenance', unit: 'hour', rate: 59.01, group: 'Household & Domestic' },
  { code: '', description: 'Delivery of Health Supports by an Enrolled Nurse - Weekday Daytime', unit: 'hour', rate: 103.44, group: 'Nursing' },
  { code: '', description: 'Delivery of Health Supports by a Registered Nurse - Weekday Daytime', unit: 'hour', rate: 128.05, group: 'Nursing' },
  { code: '', description: 'Delivery of Health Supports by a Clinical Nurse - Weekday Daytime', unit: 'hour', rate: 148.13, group: 'Nursing' },
  { code: '', description: 'Delivery of Health Supports by a Nurse Practitioner - Weekday Daytime', unit: 'hour', rate: 183.15, group: 'Nursing' },
  { code: '', description: 'Short Term Accommodation - Participant Accommodation', unit: 'day', rate: 162.85, group: 'Accommodation' },
  { code: '', description: 'Medium Term Accommodation', unit: 'day', rate: 162.85, group: 'Accommodation' },
  { code: '', description: 'Behaviour Management Plan Implementation - Direct Service', unit: 'hour', rate: 252.99, group: 'Behaviour Support' },
];

/* NSW public holidays 2026-27 (used to auto-classify rostered shifts; extend as needed). */
export const PUBLIC_HOLIDAYS = [
  '2026-10-05', '2026-12-25', '2026-12-26', '2026-12-28',
  '2027-01-01', '2027-01-26', '2027-04-02', '2027-04-03', '2027-04-04', '2027-04-05',
  '2027-04-25', '2027-06-14',
];

/** Parse "HH:MM" or "H:MM am" style times into minutes-from-midnight. */
export function parseTime(text) {
  const raw = String(text || '').trim().toLowerCase();
  if (!raw) return null;
  const match = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  const suffix = match[3];
  if (suffix === 'pm' && hours < 12) hours += 12;
  if (suffix === 'am' && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

/** Classify a shift date/time against the support item schedule. */
export function classifyShift(date, startTime, endTime) {
  const start = parseTime(startTime) ?? 9 * 60;
  const endRaw = parseTime(endTime);
  let hours = 0;
  if (endRaw != null) {
    hours = (endRaw - start) / 60;
    if (hours < 0) hours += 24;
  }
  let label = 'Weekday Daytime';
  let rate = 73.58;
  let description = 'Assistance With Self-Care Activities - Standard - ';
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const weekday = (dayNames[new Date(`${date}T00:00:00`).getDay()] || 'Monday');
  if (PUBLIC_HOLIDAYS.includes(date)) {
    label = 'Public Holiday';
    rate = 163.46;
  } else if (weekday === 'Saturday') {
    label = 'Saturday';
    rate = 103.54;
  } else if (weekday === 'Sunday') {
    label = 'Sunday';
    rate = 133.5;
  } else if (start >= 22 * 60 || (endRaw != null && endRaw <= 6 * 60)) {
    label = 'Weekday Night';
    rate = 82.57;
  } else if (start >= 18 * 60) {
    label = 'Weekday Evening';
    rate = 81.07;
  }
  const codeByLabel = {
    'Weekday Daytime': '01_011_0107_1_1',
    'Weekday Evening': '01_012_0107_1_1',
    'Weekday Night': '01_013_0107_1_1',
    Saturday: '01_015_0107_1_1',
    Sunday: '01_016_0107_1_1',
    'Public Holiday': '01_017_0107_1_1',
  };
  return {
    label,
    rate,
    code: codeByLabel[label] || '',
    description: `${description}${label}`,
    hours: Math.round(hours * 100) / 100,
    unit: 'hour',
  };
}

export function lineAmount(line) {
  return Math.round((Number(line.qty) || 0) * (Number(line.unit_price) || 0) * 100) / 100;
}

export function parseLineItems(text) {
  try {
    const parsed = JSON.parse(text || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}