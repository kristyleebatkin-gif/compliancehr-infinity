import { z } from 'zod';
import { frameworkCodeSchema, idSchema } from './base.ts';

/** Schema for `Requirement`: one obligation, owned, with a stated evidence expectation. */
export const requirementSchema = z.object({
  id: idSchema,
  standardId: idSchema,
  framework: frameworkCodeSchema,
  code: z.string().min(1),
  obligation: z.string().min(1),
  requirement: z.string().min(1),
  mandatory: z.boolean(),
  evidenceExpectation: z.string().min(1),
  ownerRole: z.string().min(1),
});