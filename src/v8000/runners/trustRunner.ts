import type { IsoDate, TrustScore, V8000Dataset } from '../types/index.ts';
import { computeTrust } from '../lib/trust.ts';

/** Trust position for the dataset. The computation lives in `lib/trust.ts` for reuse by readiness. */
export function runTrust(dataset: V8000Dataset, today: IsoDate): TrustScore {
  return computeTrust(dataset, today);
}