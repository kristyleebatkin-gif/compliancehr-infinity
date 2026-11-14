import { base44 } from '@/api/base44Client';

// Client side of the referral -> intake handover. It performs no writes: it calls
// the authenticated backend function, which re-checks identity, role, business,
// consent and existing links before anything is created. The blockers below are
// advisory only, used to explain on screen what the server will refuse.

export const LINKABLE_REFERRAL_STATUSES = ['Prepared', 'Sent', 'Accepted', 'In Progress'];

// Mirrors HANDOVER_RELEASE / HANDOVER_ENABLED in base44/shared/referralHandover.ts.
// The server refuses on its own; this only lets the screen say so before a round trip.
export const HANDOVER_ENABLED = false;
export const HANDOVER_PENDING_MESSAGE =
  'Starting intake from a referral is switched off while the duplicate-case and case-number checks are verified. Referrals and their records are unaffected.';

// Every state the server can return. Anything else is not a result we may show as done.
const KNOWN_STATES = ['linked', 'already_linked', 'created_link_pending', 'linked_audit_pending'];

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

function handoverError(message, code = '') {
  const error = new Error(message);
  error.code = code;
  error.blockers = [message];
  return error;
}

export async function startIntakeFromReferral({ referral }) {
  if (!referral?.id) throw handoverError('Save this referral before starting intake.');
  if (!HANDOVER_ENABLED) throw handoverError(HANDOVER_PENDING_MESSAGE, 'HANDOVER_PENDING_VERIFICATION');
  try {
    const response = await base44.functions.invoke('referralIntakeHandover', { referral_id: referral.id });
    const data = response?.data ?? null;

    // An owner working across several businesses gets one result per business, which
    // is not an answer to "did this referral's handover finish". Say so, never guess.
    if (Array.isArray(data?.per_business)) {
      throw handoverError('This action has to run for one business at a time. Select a single business and try again.', 'MULTIPLE_BUSINESSES');
    }
    // Never let an empty or unexpected body ({}, a bare string, a missing state)
    // be shown as success.
    if (!data || typeof data !== 'object' || !KNOWN_STATES.includes(data.state) || !String(data.message || '').trim()) {
      throw handoverError(
        'The handover did not return a recognised result, so nothing is confirmed as complete. Check the referral and its intake cases before trying again.',
        'UNRECOGNISED_RESULT',
      );
    }
    return data;
  } catch (error) {
    const data = error?.response?.data || {};
    const wrapped = new Error(data.error || error?.message || 'The handover failed.');
    wrapped.code = data.code || error?.code || '';
    wrapped.status = error?.response?.status || 0;
    wrapped.blockers = data.blockers?.length ? data.blockers : [wrapped.message];
    throw wrapped;
  }
}