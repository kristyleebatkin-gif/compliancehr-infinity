import { z } from 'zod';
import { idSchema, isoDateSchema } from './base.ts';
import { riskRating } from '../types/risk.ts';

export const RISK_RATINGS = ['low', 'medium', 'high', 'critical'] as const;
export const RISK_STATUSES = ['identified', 'assessed', 'treating', 'monitored', 'closed'] as const;

/** Schema for `RiskRecord`. The band must agree with its own likelihood and consequence. */
export const riskRecordSchema = z
  .object({
    id: idSchema,
    title: z.string().min(1),
    category: z.enum(['clinical', 'workforce', 'governance', 'financial', 'operational', 'information', 'regulatory']),
    likelihood: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    consequence: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
    rating: z.enum(RISK_RATINGS),
    status: z.enum(RISK_STATUSES),
    ownerId: idSchema,
    reviewDue: isoDateSchema,
    controlIds: z.array(idSchema),
    treatment: z.string().min(1),
  })
  .refine((value) => riskRating(value.likelihood, value.consequence) === value.rating, {
    message: 'rating does not match likelihood x consequence',
    path: ['rating'],
  });