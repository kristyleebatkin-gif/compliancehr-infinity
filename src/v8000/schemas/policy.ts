import { z } from 'zod';
import { frameworkCodeSchema, idSchema, isoDateSchema } from './base.ts';

export const POLICY_STATUSES = ['draft', 'active', 'retired'] as const;

/** Schema for `Policy`. */
export const policySchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  framework: frameworkCodeSchema,
  standardCodes: z.array(z.string().min(1)),
  version: z.string().min(1),
  approvedBy: z.string().min(1).nullable(),
  approvedOn: isoDateSchema.nullable(),
  reviewDue: isoDateSchema,
  status: z.enum(POLICY_STATUSES),
});