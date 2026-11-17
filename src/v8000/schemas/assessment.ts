import { z } from 'zod';
import { idSchema, isoDateSchema, percentSchema } from './base.ts';

/** Schema for `Assessment`: one test of a control. */
export const assessmentSchema = z.object({
  id: idSchema,
  controlId: idSchema,
  assessedOn: isoDateSchema,
  assessor: z.string().min(1),
  method: z.enum(['walkthrough', 'record_review', 'observation', 'sampling', 'system_export']),
  sampleSize: z.number().int().min(0),
  score: percentSchema.nullable(),
  findings: z.number().int().min(0),
});