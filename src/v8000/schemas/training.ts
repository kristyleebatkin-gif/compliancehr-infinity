import { z } from 'zod';
import { idSchema } from './base.ts';

export const TRAINING_STATUSES = ['draft', 'active', 'retired'] as const;

/** Schema for `Training`. */
export const trainingSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  moduleCode: z.string().min(1),
  mandatedBy: z.array(z.string().min(1)),
  refresherMonths: z.number().int().min(1).max(120).nullable(),
  ownerRole: z.string().min(1),
  status: z.enum(TRAINING_STATUSES),
});