import { z } from 'zod';
import { idSchema, isoDateSchema } from './base.ts';

export const PROCEDURE_STATUSES = ['draft', 'active', 'retired'] as const;

/** Schema for `Procedure`. A procedure must state at least one step to be usable. */
export const procedureSchema = z.object({
  id: idSchema,
  policyId: idSchema.nullable(),
  title: z.string().min(1),
  steps: z.array(z.string().min(1)).min(1),
  ownerRole: z.string().min(1),
  reviewDue: isoDateSchema,
  status: z.enum(PROCEDURE_STATUSES),
});