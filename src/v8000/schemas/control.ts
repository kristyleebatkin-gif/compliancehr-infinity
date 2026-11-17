import { z } from 'zod';
import { cadenceSchema, controlTypeSchema, frameworkCodeSchema, idSchema, isoDateSchema } from './base.ts';

export const CONTROL_STATUSES = ['draft', 'active', 'under_review', 'retired'] as const;

/** Schema for `Control`: what the business does, who owns it, when it is next tested. */
export const controlSchema = z.object({
  id: idSchema,
  requirementIds: z.array(idSchema),
  framework: frameworkCodeSchema,
  statement: z.string().min(1),
  type: controlTypeSchema,
  cadence: cadenceSchema,
  ownerId: idSchema.nullable(),
  policyId: idSchema.nullable(),
  procedureIds: z.array(idSchema),
  trainingIds: z.array(idSchema),
  evidenceRequired: z.boolean(),
  lastTestedOn: isoDateSchema.nullable(),
  nextTestOn: isoDateSchema.nullable(),
  status: z.enum(CONTROL_STATUSES),
});