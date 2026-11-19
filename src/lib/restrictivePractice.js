// Restrictive practice register rules (NDIS and aged care). Pure functions so they can be tested.
// A use is flagged when it is unauthorised, its authorisation has expired or expires within 30 days,
// it has no behaviour support plan reference (NDIS), or it has not been reported to the regulator.
// These flags prompt action; they are not a legal assessment of compliance.

export const RP_CATEGORIES = ['Seclusion', 'Chemical restraint', 'Mechanical restraint', 'Physical restraint', 'Environmental restraint'];
const DAY = 86400000;

const isoDay = (v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);
const daysBetween = (fromIso, toIso) => Math.round((Date.parse(`${toIso}T00:00:00Z`) - Date.parse(`${fromIso}T00:00:00Z`)) / DAY);

export function rpFlags(record, todayIso) {
  const flags = [];
  const status = record?.authorisation_status;
  const expiry = isoDay(record?.authorisation_expiry);
  if (status === 'Unauthorised' || (!status && !record?.authorisation_reference)) flags.push({ key: 'unauthorised', label: 'Unauthorised use', tone: 'critical' });
  if (status === 'Pending') flags.push({ key: 'pending', label: 'Authorisation pending', tone: 'warning' });
  if (expiry) {
    const left = daysBetween(todayIso, expiry);
    if (left < 0) flags.push({ key: 'expired', label: `Authorisation expired ${-left}d ago`, tone: 'critical' });
    else if (left <= 30) flags.push({ key: 'expiring', label: `Authorisation expires in ${left}d`, tone: 'warning' });
  }
  if ((record?.sector || 'NDIS') === 'NDIS' && !record?.behaviour_support_plan_reference) flags.push({ key: 'no-bsp', label: 'No behaviour support plan', tone: 'warning' });
  if (!record?.reported_to_regulator) flags.push({ key: 'unreported', label: 'Not reported', tone: 'warning' });
  if (!String(record?.reduction_actions || '').trim()) flags.push({ key: 'no-reduction', label: 'No reduction plan', tone: 'info' });
  return flags;
}

export function rpSummary(records, todayIso) {
  const list = Array.isArray(records) ? records : [];
  const month = todayIso.slice(0, 7);
  const has = (r, key) => rpFlags(r, todayIso).some((f) => f.key === key);
  return {
    total: list.length,
    this_month: list.filter((r) => String(r.record_date || '').slice(0, 7) === month).length,
    unauthorised: list.filter((r) => has(r, 'unauthorised')).length,
    expired: list.filter((r) => has(r, 'expired')).length,
    expiring: list.filter((r) => has(r, 'expiring')).length,
    unreported: list.filter((r) => has(r, 'unreported')).length,
  };
}
