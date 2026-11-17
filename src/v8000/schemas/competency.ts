import { z } from 'zod';
import { idSchema, isoDateSchema } from './base.ts';

/** Schema for `Competency`: a named person's assessed competence and its expiry. */
export const competencySchema = z.object({
  id: idSchema,
  trainingId: idSchema,
  holder: z.string().min(1),
  role: z.string().min(1),
  required: z.boolean(),
  assessedOn: isoDateSchema.nullable(),
  expiresOn: isoDateSchema.nullable(),
  assessor: z.string().min(1).nullable(),
});