import { z } from 'zod';
import { idSchema, isoDateSchema } from './base.ts';

export const CAPA_STATUSES = ['pending', 'effective', 'ineffective', 'not_required'] as const;

/**
 * Schema for `Capa`. Effectiveness cannot be claimed without a completion date and a named
 * verifier: that rule is what stops "closed" from meaning "we said so".
 */
export const capaSchema = z
  .object({
    id: idSchema,
    findingId: idSchema,
    type: z.enum(['corrective', 'preventive']),
    action: z.string().min(1),
    ownerId: idSchema,
    dueOn: isoDateSchema,
    completedOn: isoDateSchema.nullable(),
    effectivenessCheck: z.enum(CAPA_STATUSES),
    verifiedBy: z.string().min(1).nullable(),
  })
  .refine((value) => value.effectivenessCheck !== 'effective' || (value.completedOn !== null && value.verifiedBy !== null), {
    message: 'an effective CAPA needs a completion date and a named verifier',
    path: ['effectivenessCheck'],
  });