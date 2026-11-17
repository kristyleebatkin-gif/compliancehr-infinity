import type { IsoDate, RecordId, VerificationStatus } from './common.ts';

/** Derived from dates and verification, never typed in. See `evidenceState`. */
export type EvidenceState = 'verified' | 'expiring' | 'in_review' | 'unverified' | 'rejected' | 'expired';

/** A collected artefact offered as proof that a control operated. */
export interface Evidence {
  readonly id: RecordId;
  readonly controlId: RecordId | null;
  readonly requirementId: RecordId | null;
  readonly title: string;
  readonly type:
    | 'document'
    | 'record'
    | 'register_extract'
    | 'photo'
    | 'sign_off'
    | 'system_export'
    | 'certificate'
    | 'training_record'
    | 'minutes'
    | 'other';
  readonly source: string;
  readonly ownerId: RecordId | null;
  readonly collectedOn: IsoDate;
  readonly validFrom: IsoDate;
  readonly validTo: IsoDate | null;
  readonly confidence: number;
  readonly verificationStatus: VerificationStatus;
  readonly verifiedBy: string | null;
  readonly verifiedOn: IsoDate | null;
  /** Private storage URI in the app; Phase 1 fixtures carry a synthetic reference only. */
  readonly fileRef: string | null;
  readonly provenance: 'recorded' | 'fixture';
}

/** Confidence below this is treated as weak support even when someone marked it verified. */
export const WEAK_CONFIDENCE = 50;

/** Evidence expiring inside this window still holds, but is reported as expiring. */
export const EXPIRY_WINDOW_DAYS = 30;