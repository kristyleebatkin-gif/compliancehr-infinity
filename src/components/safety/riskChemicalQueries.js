import { BUSINESS_TIME_ZONE } from '@/lib/businessTime';
export const openRiskQuery = { status: { $in: ['Identified', 'Assessed', 'Treating', 'Monitored'] } };
export const filteredRiskQuery = (rating) => ({ ...openRiskQuery, ...(rating ? { rating } : {}) });
export const filteredChemicalQuery = (hazardClass) => hazardClass === '__no_class__'
  ? { $or: [{ hazard_class: { $exists: false } }, { hazard_class: null }, { hazard_class: '' }] }
  : hazardClass ? { hazard_class: hazardClass } : {};
export const safetyDashboardToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: BUSINESS_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const safetyDashboardDate = (date) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
};