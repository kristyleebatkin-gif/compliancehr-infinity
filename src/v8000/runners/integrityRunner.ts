import type { IsoDate, V8000Dataset } from '../types/index.ts';
import { computeDatasetIntegrity, type DatasetIntegrity } from '../lib/integrity.ts';

/**
 * Dataset integrity (Phase 1 scope). The production Enterprise Integrity Index remains
 * `src/lib/integrityIndex.js`; this measures the dataset the Phase 1 checks run against.
 */
export function runIntegrity(dataset: V8000Dataset, today: IsoDate): DatasetIntegrity {
  return computeDatasetIntegrity(dataset, today);
}