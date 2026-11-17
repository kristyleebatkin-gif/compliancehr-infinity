import type { EntityRef, IsoDate, Severity } from './common.ts';

/**
 * The recognised ways the evidence chain breaks. Each kind maps to a specific action a person
 * can take in an existing module, which is what makes a gap actionable rather than a statistic.
 */
export type GapKind =
  | 'missing_evidence'
  | 'stale_evidence'
  | 'rejected_evidence'
  | 'unowned_control'
  | 'untested_control'
  | 'open_high_finding'
  | 'overdue_capa'
  | 'missing_outcome'
  | 'unmapped_requirement'
  | 'overdue_review'
  | 'inadequate_training';

export const GAP_LABELS: Readonly<Record<GapKind, string>> = {
  missing_evidence: 'Control holds no evidence',
  stale_evidence: 'Evidence out of date',
  rejected_evidence: 'Evidence rejected or weak',
  unowned_control: 'Control has no named owner',
  untested_control: 'Control test overdue',
  open_high_finding: 'High or major finding open',
  overdue_capa: 'Corrective action overdue',
  missing_outcome: 'Requirement has no stated outcome',
  unmapped_requirement: 'Requirement has no control',
  overdue_review: 'Review overdue',
  inadequate_training: 'Mandated training lapsed or missing',
};

export interface Gap {
  readonly id: string;
  readonly kind: GapKind;
  readonly severity: Severity;
  readonly title: string;
  readonly detail: string;
  readonly refs: readonly EntityRef[];
  readonly dueOn: IsoDate | null;
}

export type SeverityCounts = Readonly<Record<Severity, number>>;

export interface GapReport {
  readonly gaps: readonly Gap[];
  readonly bySeverity: SeverityCounts;
  readonly byKind: Readonly<Record<GapKind, number>>;
  readonly total: number;
  readonly asAt: IsoDate;
}