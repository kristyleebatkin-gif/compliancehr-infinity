export const openRiskQuery = { status: { $in: ['Identified', 'Assessed', 'Treating', 'Monitored'] } };
export const safetyDashboardToday = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Sydney', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
export const safetyDashboardDate = (date) => {
  const [year, month, day] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('en-AU', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(year, month - 1, day));
};