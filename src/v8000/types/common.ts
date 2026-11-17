/**
 * Phase 1 shared primitives.
 *
 * These are the vocabulary every other Phase 1 module speaks. They are deliberately
 * plain, serialisable shapes: the same record can be validated in a Vitest/node test,
 * held in memory by a runner, and stored against a Base44 entity later without translation.
 */

/** Stable record identifier. Phase 1 ids are readable slugs, never array indexes. */
export type RecordId = string;

/** Calendar date in ISO form, `YYYY-MM-DD`. Compared as text where timezone is irrelevant. */
export type IsoDate = string;

/** Instant in ISO form, `YYYY-MM-DDTHH:mm:ss.sssZ`. */
export type IsoDateTime = string;

/** The regulatory instruments the business already models in `RegulatoryStandard.framework`. */
export type FrameworkCode =
  | 'NDIS'
  | 'AGED_CARE'
  | 'ISO_9001'
  | 'ISO_27001'
  | 'NSQHS'
  | 'HSQF'
  | 'FAIR_WORK';

export const FRAMEWORK_LABELS = {
  NDIS: 'NDIS Practice Standards',
  AGED_CARE: 'Aged Care Quality Standards',
  ISO_9001: 'ISO 9001:2015',
  ISO_27001: 'ISO/IEC 27001:2022',
  NSQHS: 'NSQHS Standards',
  HSQF: 'HSQF',
  FAIR_WORK: 'Fair Work',
} as const satisfies Record<FrameworkCode, string>;

export type FrameworkLabel = (typeof FRAMEWORK_LABELS)[FrameworkCode];

/** Findings, gaps and checks share one severity scale so they can be ranked together. */
export type Severity = 'critical' | 'high' | 'medium' | 'low';

export const SEVERITY_ORDER: readonly Severity[] = ['critical', 'high', 'medium', 'low'];

export const SEVERITY_RANK: Readonly<Record<Severity, number>> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

/** How often an obligation must be re-evidenced. `null` days means event-driven, not continuous. */
export type Cadence =
  | 'continuous'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually'
  | 'event_driven';

export const CADENCE_DAYS: Readonly<Record<Cadence, number | null>> = {
  continuous: 1,
  daily: 1,
  weekly: 7,
  monthly: 31,
  quarterly: 92,
  annually: 366,
  event_driven: null,
};

/** ISO 27001 / ISO 9001 control classification, also used for care controls. */
export type ControlType = 'preventive' | 'detective' | 'corrective';

/** Where a record came from. Anything not `recorded` is never presented as assurance. */
export type Provenance = 'reference' | 'fixture' | 'recorded' | 'derived';

/** Verification position of an evidence record. Mirrors `AssuranceEvidence.verification_status`. */
export type VerificationStatus = 'unverified' | 'in_review' | 'verified' | 'rejected' | 'expired';

/** Every entity a Phase 1 reference may point at. */
export type EntityName =
  | 'framework'
  | 'standard'
  | 'requirement'
  | 'outcome'
  | 'control'
  | 'policy'
  | 'procedure'
  | 'training'
  | 'competency'
  | 'assessment'
  | 'evidence'
  | 'audit'
  | 'finding'
  | 'capa'
  | 'owner'
  | 'workflow'
  | 'workflow_instance'
  | 'review'
  | 'risk';

/** A typed pointer. Validators resolve these; an unresolvable one is a defect, not a warning. */
export interface EntityRef {
  readonly type: EntityName;
  readonly id: RecordId;
}

/** Validation dimensions reported by the health and integrity runners. */
export type Dimension =
  | 'reference'
  | 'framework'
  | 'owner'
  | 'workflow'
  | 'review'
  | 'evidence'
  | 'audit'
  | 'finding'
  | 'capa'
  | 'trust'
  | 'gap'
  | 'traceability'
  | 'integrity';

export const DIMENSIONS: readonly Dimension[] = [
  'reference',
  'framework',
  'owner',
  'workflow',
  'review',
  'evidence',
  'audit',
  'finding',
  'capa',
  'trust',
  'gap',
  'traceability',
  'integrity',
];

/**
 * `pass` means the rule was evaluated and found nothing.
 * `fail` means the rule found a condition that must be corrected.
 * `warn` means the rule found a condition worth attention that is not itself a breach.
 */
export type CheckStatus = 'pass' | 'fail' | 'warn';

/** One evaluated rule. `count` is how many records it found, `refs` which ones. */
export interface CheckResult {
  readonly id: string;
  readonly dimension: Dimension;
  readonly severity: Severity;
  readonly status: CheckStatus;
  readonly title: string;
  readonly detail: string;
  readonly count: number;
  readonly refs: readonly EntityRef[];
}

/** Aggregated validator output. */
export interface ValidationSummary {
  readonly total: number;
  readonly passed: number;
  readonly failed: number;
  readonly warned: number;
  readonly results: readonly CheckResult[];
  readonly blocking: readonly CheckResult[];
}

/** Round to a whole number of percentage points. Never returns NaN. */
export function round(value: number, places = 0): number {
  if (!Number.isFinite(value)) throw new Error('round() requires a finite number');
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

/**
 * Whole-number percentage, or `null` when the denominator is zero.
 * `null` means "not measured" and must never be read as zero per cent.
 */
export function percent(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) return null;
  return round((numerator / denominator) * 100);
}

/** Clamp a percentage into 0..100, preserving `null` as not measured. */
export function clampPercent(value: number | null): number | null {
  if (value === null || !Number.isFinite(value)) return null;
  return Math.min(100, Math.max(0, round(value)));
}

/** Days from `from` to `to` (both `YYYY-MM-DD`); positive when `to` is later. */
export function daysBetween(from: IsoDate, to: IsoDate): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  if (Number.isNaN(start) || Number.isNaN(end)) throw new Error(`daysBetween() needs ISO dates, got ${from} and ${to}`);
  return Math.round((end - start) / 86_400_000);
}

/** Days until a due date relative to today. Negative means overdue. */
export function daysUntil(dueOn: IsoDate | null, today: IsoDate): number | null {
  if (!dueOn) return null;
  return daysBetween(today, dueOn);
}

/** `YYYY-MM-DD` for a Date, in UTC so results do not move with the machine's timezone. */
export function isoDate(date: Date): IsoDate {
  return date.toISOString().slice(0, 10);
}

/** Today as an `IsoDate`, injectable for deterministic runs. */
export function todayIso(now: Date = new Date()): IsoDate {
  return isoDate(now);
}