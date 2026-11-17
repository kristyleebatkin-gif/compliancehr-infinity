import type { IsoDate, RecordId, Severity } from './common.ts';

export type RiskRating = 'low' | 'medium' | 'high' | 'critical';

/** A risk in the register, linked to the controls that treat it. */
export interface RiskRecord {
  readonly id: RecordId;
  readonly title: string;
  readonly category: 'clinical' | 'workforce' | 'governance' | 'financial' | 'operational' | 'information' | 'regulatory';
  readonly likelihood: 1 | 2 | 3 | 4 | 5;
  readonly consequence: 1 | 2 | 3 | 4 | 5;
  readonly rating: RiskRating;
  readonly status: 'identified' | 'assessed' | 'treating' | 'monitored' | 'closed';
  readonly ownerId: RecordId;
  readonly reviewDue: IsoDate;
  readonly controlIds: readonly RecordId[];
  readonly treatment: string;
}

/** Likelihood x consequence, banded. Kept here so a rating can never drift from its inputs. */
export function riskRating(likelihood: number, consequence: number): RiskRating {
  const score = likelihood * consequence;
  if (score >= 20) return 'critical';
  if (score >= 12) return 'high';
  if (score >= 6) return 'medium';
  return 'low';
}

/** Rating to finding severity, so a high risk can be spoken about on the same scale as a gap. */
export const RISK_SEVERITY: Readonly<Record<RiskRating, Severity>> = {
  critical: 'critical',
  high: 'high',
  medium: 'medium',
  low: 'low',
};