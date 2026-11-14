import { base44 } from '@/api/base44Client';

// Client side of the referral -> intake handover. It performs no writes: it calls
// the authenticated backend function, which re-checks identity, role, business,
// consent and existing links before anything is created. The blockers below are
// advisory only, used to explain on screen what the server will refuse.

export const LINKABLE_REFERRAL_STATUSES = ['Prepared', 'Sent', 'Accepted', 'In Progress'];

export function referralIntakeBlockers(referral) {
  if (!referral) return ['No referral selected.'];
  const blockers = [];
  if (!String(referral.client_name || '').trim()) blockers.push('The referral has no person named.');
  if (referral.consent !== 'Consent given') blockers.push('Client consent has not been recorded on this referral, so an intake case cannot be opened.');
  if (referral.intake_case_id || referral.intake_case_number) blockers.push('This referral is already linked to an intake case.');
  if (!LINKABLE_REFERRAL_STATUSES.includes(referral.status)) {
    blockers.push(`Referral status is "${referral.status}". Move it to Prepared, Sent, Accepted or In Progress before starting intake.`);
  }
  return blockers;
}

export async function startIntakeFromReferral({ referral }) {
  if (!referral?.id) {
    const error = new Error('Save this referral before starting intake.');
    error.blockers = [error.message];
    throw error;
  }
  try {
    const response = await base44.functions.invoke('referralIntakeHandover', { referral_id: referral.id });
    return response?.data || {};
  } catch (error) {
    const data = error?.response?.data || {};
    const wrapped = new Error(data.error || error?.message || 'The handover failed.');
    wrapped.code = data.code || '';
    wrapped.status = error?.response?.status || 0;
    wrapped.blockers = data.blockers?.length ? data.blockers : [wrapped.message];
    throw wrapped;
  }
}