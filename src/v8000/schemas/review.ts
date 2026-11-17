import { z } from 'zod';
import { cadenceSchema, entityRefSchema, idSchema, isoDateSchema } from './base.ts';

export const REVIEW_OUTCOMES = ['effective', 'changes_required', 'not_reviewed'] as const;

/** Schema for `Review`. */
export const reviewSchema = z.object({
  id: idSchema,
  subjectRef: entityRefSchema,
  title: z.string().min(1),
  type: z.enum([
    'document',
    'control',
    'policy',
    'procedure',
    'workflow',
    'framework',
    'clinical_plan',
    'credential',
    'risk',
  ]),
  cadence: cadenceSchema,
  lastReviewedOn: isoDateSchema.nullable(),
  dueOn: isoDateSchema,
  ownerId: idSchema.nullable(),
  reviewerName: z.string().min(1).nullable(),
  outcome: z.enum(REVIEW_OUTCOMES),
  notes: z.string(),
});