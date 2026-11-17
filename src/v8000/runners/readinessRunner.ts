import type { IsoDate, V8000Dataset } from '../types/index.ts';
import { computeReadiness, type ReadinessPosition } from '../lib/readiness.ts';

/** Weighted readiness, computed by the existing engine's arithmetic. */
export function runReadiness(dataset: V8000Dataset, today: IsoDate): ReadinessPosition {
  return computeReadiness(dataset, today);
}