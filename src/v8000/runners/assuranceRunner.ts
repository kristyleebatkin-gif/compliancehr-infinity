import type { IsoDate, V8000Dataset } from '../types/index.ts';
import { assessStandards, summariseAssurance, type AssuranceSummary, type StandardAssurance } from '../lib/assurance.ts';

export interface AssuranceRun {
  readonly statements: readonly StandardAssurance[];
  readonly summary: AssuranceSummary;
}

/** A per-standard assurance statement plus the counts behind it. */
export function runAssurance(dataset: V8000Dataset, today: IsoDate): AssuranceRun {
  const statements = assessStandards(dataset, today);
  return { statements, summary: summariseAssurance(statements) };
}