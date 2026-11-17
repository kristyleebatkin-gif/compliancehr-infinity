import { z } from 'zod';
import { frameworkCodeSchema, idSchema, isoDateSchema } from './base.ts';

export const AUDIT_STATUSES = ['planned', 'in_progress', 'complete', 'cancelled'] as const;

/** Schema for `Audit`. */
export const auditSchema = z.object({
  id: idSchema,
  framework: frameworkCodeSchema,
  scope: z.string().min(1),
  standardIds: z.array(idSchema).min(1),
  plannedFor: isoDateSchema,
  completedOn: isoDateSchema.nullable(),
  auditor: z.string().min(1),
  independence: z.enum(['internal', 'external', 'desk']),
  method: z.enum(['document_review', 'interview', 'observation', 'sampling', 'site_visit']),
  status: z.enum(AUDIT_STATUSES),
});