import { evidenceStateAt } from '../../lib/v8000Engine.js';
import type { Evidence, EvidenceState, VerificationStatus } from '../types/index.ts';

/**
 * The evidence-state model already ships in `src/lib/v8000Engine.js`. Phase 1 does not restate it:
 * this adapter maps the typed Phase 1 record onto the engine's field names and delegates, so a
 * change to the state model in the engine reaches the Phase 1 checks at the same time.
 */
const ENGINE_STATUS: Readonly<Record<VerificationStatus, string>> = {
  unverified: 'Unverified',
  in_review: 'In Review',
  verified: 'Verified',
  rejected: 'Rejected',
  expired: 'Expired',
};

export function evidenceState(item: Evidence, today: string): EvidenceState {
  return evidenceStateAt(
    { verification_status: ENGINE_STATUS[item.verificationStatus], valid_to: item.validTo },
    new Date(`${today}T00:00:00Z`)
  ) as EvidenceState;
}

/** States that still support a control. Rejected and expired evidence supports nothing. */
export function holdsAssurance(state: EvidenceState): boolean {
  return state === 'verified' || state === 'expiring';
}

export const EVIDENCE_STATE_LABELS: Readonly<Record<EvidenceState, string>> = {
  verified: 'Verified',
  expiring: 'Expiring within 30 days',
  in_review: 'In review',
  unverified: 'Unverified',
  rejected: 'Rejected',
  expired: 'Expired',
};