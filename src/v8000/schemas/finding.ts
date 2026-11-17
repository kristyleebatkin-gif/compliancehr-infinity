import { z } from 'zod';
import { idSchema, isoDateSchema, severitySchema } from './base.ts';

export const FINDING_RATINGS = [
  'conformity',
  'minor_nonconformity',
  'major_nonconformity',
  'observation',
  'opportunity',
] as const;

export const FINDING_STATUSES = ['open', 'in_progress', 'verification', 'closed'] as const;

/** Schema for `Finding`. */
export const findingSchema = z.object({
  id: idSchema,
  auditId: idSchema.nullable(),
  controlId: idSchema.nullable(),
  standardId: idSchema.nullable(),
  title: z.string().min(1),
  rating: z.enum(FINDING_RATINGS),
  severity: severitySchema,
  source: z.enum(['internal_audit', 'external_audit', 'desk_review', 'spot_check', 'incident', 'complaint']),
  detail: z.string().min(1),
  rootCause: z.string().min(1),
  ownerId: idSchema,
  raisedOn: isoDateSchema,
  dueOn: isoDateSchema,
  status: z.enum(FINDING_STATUSES),
  closedOn: isoDateSchema.nullable(),
  closedBy: z.string().min(1).nullable(),
});