import type { Cadence, EntityRef, IsoDate, RecordId } from './common.ts';

/** A scheduled or event-driven review of one record. The proof that assurance is current. */
export interface Review {
  readonly id: RecordId;
  readonly subjectRef: EntityRef;
  readonly title: string;
  readonly type:
    | 'document'
    | 'control'
    | 'policy'
    | 'procedure'
    | 'workflow'
    | 'framework'
    | 'clinical_plan'
    | 'credential'
    | 'risk';
  readonly cadence: Cadence;
  readonly lastReviewedOn: IsoDate | null;
  readonly dueOn: IsoDate;
  readonly ownerId: RecordId | null;
  readonly reviewerName: string | null;
  readonly outcome: 'effective' | 'changes_required' | 'not_reviewed';
  readonly notes: string;
}