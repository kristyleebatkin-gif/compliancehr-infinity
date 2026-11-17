import { z } from 'zod';
import { frameworkCodeSchema, idSchema, isoDateSchema } from './base.ts';

/** Schema for `Framework`. */
export const frameworkSchema = z.object({
  id: idSchema,
  code: frameworkCodeSchema,
  label: z.string().min(1),
  legislation: z.string().min(1),
  version: z.string().min(1),
  effectiveFrom: isoDateSchema,
  reviewDue: isoDateSchema,
});

export const STANDARD_STATUSES = ['draft', 'active', 'superseded', 'retired'] as const;

/** Schema for `Standard`. */
export const standardSchema = z.object({
  id: idSchema,
  framework: frameworkCodeSchema,
  code: z.string().min(1),
  title: z.string().min(1),
  moduleArea: z.string().min(1),
  outcome: z.string(),
  effectiveFrom: isoDateSchema,
  reviewDue: isoDateSchema,
  status: z.enum(STANDARD_STATUSES),
});