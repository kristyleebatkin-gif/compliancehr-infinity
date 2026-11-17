import type { IsoDate } from './common.ts';

/**
 * One input to the trust position. `value` is a whole-number percentage, or `null` when the
 * business has no records for it yet. A weight with a null value is subtracted from coverage,
 * never counted as zero.
 */
export interface TrustSignal {
  readonly key: string;
  readonly label: string;
  readonly weight: number;
  readonly value: number | null;
  readonly source: string;
  readonly refCount: number;
}

export type TrustBand = 'assured' | 'developing' | 'at_risk' | 'not_measured';

/**
 * The trust position for a dataset. Trust is about what the business has earned from the people
 * it serves: complaints resolved, feedback acted on, findings closed with verification, evidence
 * current. It is an internal management indicator, not an audit opinion.
 */
export interface TrustScore {
  readonly score: number | null;
  readonly coverage: number;
  readonly band: TrustBand;
  readonly signals: readonly TrustSignal[];
  readonly asAt: IsoDate;
}