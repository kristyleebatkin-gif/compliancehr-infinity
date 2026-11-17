import { z } from 'zod';
import { idSchema } from './base.ts';

export const OUTCOME_STATUSES = ['met', 'partial', 'not_met', 'not_measured'] as const;

/** Schema for `Outcome`: what changes for the person, and how that was measured. */
export const outcomeSchema = z.object({
  id: idSchema,
  requirementId: idSchema,
  statement: z.string().min(1),
  beneficiary: z.enum(['participant', 'resident', 'worker', 'organisation']),
  indicator: z.string().min(1),
  status: z.enum(OUTCOME_STATUSES),
  source: z.enum(['recorded', 'derived', 'none']),
});