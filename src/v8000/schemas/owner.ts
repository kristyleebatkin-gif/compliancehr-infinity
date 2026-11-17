import { z } from 'zod';
import { entityNameSchema, idSchema } from './base.ts';

/** Schema for `Owner`. */
export const ownerSchema = z.object({
  id: idSchema,
  name: z.string().min(1),
  role: z.string().min(1),
  department: z.string().min(1),
  email: z.string().min(3).nullable(),
  accountableFor: z.array(entityNameSchema),
  active: z.boolean(),
});