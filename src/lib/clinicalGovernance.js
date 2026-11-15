// Clinical and allied health helpers: option lists and due-date arithmetic shared by the
// Clinical OS panels. Nothing here scores clinical quality — it only describes dates.

export const PLAN_TYPES = [
  'NDIS Support Plan',
  'Clinical Care Plan',
  'Behaviour Support Plan',
  'Health Support Plan',
  'Risk Management Plan',
  'Transition Plan',
];

export const PLAN_STATUSES = ['Draft', 'Active', 'Under Review', 'Superseded', 'Closed'];
export const REVIEW_FREQUENCIES = ['Monthly', 'Quarterly', 'Six monthly', 'Annually', 'Event driven'];
export const CONSENT_OPTIONS = ['Consent recorded', 'Consent pending', 'Consent declined'];

export const DISCIPLINES = [
  'Occupational Therapy',
  'Physiotherapy',
  'Speech Pathology',
  'Psychology',
  'Positive Behaviour Support',
  'Dietetics',
  'Nursing',
  'Social Work',
  'Other',
];

export const REFERRAL_STATUSES = ['Draft', 'Sent', 'Accepted', 'Scheduled', 'Completed', 'Declined', 'Closed'];
export const URGENCIES = ['Routine', 'Priority', 'Urgent'];

const OPEN_REFERRAL = ['Sent', 'Accepted', 'Scheduled'];
const TODAY = () => new Date().toISOString().slice(0, 10);

export function daysUntil(date) {
  if (!date) return null;
  const target = new Date(`${String(date).slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - new Date(`${TODAY()}T00:00:00Z`).getTime()) / 86400000);
}

export function clinicalMetrics(plans = [], referrals = []) {
  const active = plans.filter((plan) => plan.status === 'Active');
  const dueSoon = plans.filter((plan) => {
    const days = daysUntil(plan.review_due);
    return plan.status !== 'Closed' && plan.status !== 'Superseded' && days !== null && days <= 30;
  });
  const overdue = dueSoon.filter((plan) => daysUntil(plan.review_due) < 0);
  return {
    activePlans: active.length,
    reviewsDue: dueSoon.length,
    reviewsOverdue: overdue.length,
    restrictivePractice: plans.filter((plan) => plan.restrictive_practice).length,
    consentPending: plans.filter((plan) => plan.consent_status === 'Consent pending').length
      + referrals.filter((row) => row.consent_status === 'Consent pending').length,
    openReferrals: referrals.filter((row) => OPEN_REFERRAL.includes(row.status)).length,
    urgentReferrals: referrals.filter((row) => row.urgency === 'Urgent' && OPEN_REFERRAL.includes(row.status)).length,
    awaitingOutcome: referrals.filter((row) => row.status === 'Completed' && !row.outcome_summary).length,
  };
}

export function reviewQueue(plans = []) {
  return plans
    .filter((plan) => plan.review_due && plan.status !== 'Closed' && plan.status !== 'Superseded')
    .map((plan) => ({ plan, days: daysUntil(plan.review_due) }))
    .filter((entry) => entry.days !== null && entry.days <= 60)
    .sort((a, b) => a.days - b.days);
}

export const daysLabel = (days) => {
  if (days === null) return 'No review date';
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  return `Due in ${days} day${days === 1 ? '' : 's'}`;
};