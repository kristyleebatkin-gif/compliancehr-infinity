import type { CheckResult, Dimension, IsoDate, V8000Dataset } from '../types/index.ts';
import { referenceValidator } from './reference.ts';
import { frameworkValidator } from './framework.ts';
import { ownerValidator } from './owner.ts';
import { workflowValidator } from './workflow.ts';
import { reviewValidator } from './review.ts';
import { evidenceValidator } from './evidence.ts';
import { auditValidator } from './audit.ts';
import { findingValidator } from './finding.ts';
import { capaValidator } from './capa.ts';
import { trustValidator } from './trust.ts';
import { gapValidator } from './gap.ts';
import { traceabilityValidator } from './traceability.ts';
import { integrityValidator } from './integrity.ts';

export type Validator = (dataset: V8000Dataset, today: IsoDate) => readonly CheckResult[];

/** One validator per dimension. The health runner uses this map to prove nothing is unowned. */
export const VALIDATORS: Readonly<Record<Dimension, Validator>> = {
  reference: referenceValidator,
  framework: frameworkValidator,
  owner: ownerValidator,
  workflow: workflowValidator,
  review: reviewValidator,
  evidence: evidenceValidator,
  audit: auditValidator,
  finding: findingValidator,
  capa: capaValidator,
  trust: trustValidator,
  gap: gapValidator,
  traceability: traceabilityValidator,
  integrity: integrityValidator,
};

/** Every validator, in dimension order, concatenated. */
export function runAllValidators(dataset: V8000Dataset, today: IsoDate): readonly CheckResult[] {
  return (Object.keys(VALIDATORS) as Dimension[]).flatMap((dimension) => VALIDATORS[dimension](dataset, today));
}

export {
  auditValidator,
  capaValidator,
  evidenceValidator,
  findingValidator,
  frameworkValidator,
  gapValidator,
  integrityValidator,
  ownerValidator,
  referenceValidator,
  reviewValidator,
  traceabilityValidator,
  trustValidator,
  workflowValidator,
};