import { z } from 'zod';
import { entityRefSchema, frameworkCodeSchema, idSchema, isoDateTimeSchema, isoDateSchema } from './base.ts';

/** Schema for one `WorkflowStep`. */
export const workflowStepSchema = z.object({
  id: idSchema,
  label: z.string().min(1),
  kind: z.enum(['task', 'approval', 'evidence', 'notify', 'decision']),
  role: z.string().min(1),
  slaHours: z.number().int().min(1).max(8760),
  next: z.array(idSchema),
});

/** Schema for `WorkflowDefinition`. A published definition needs at least one step. */
export const workflowDefinitionSchema = z
  .object({
    id: idSchema,
    code: z.string().min(1),
    name: z.string().min(1),
    framework: frameworkCodeSchema,
    domain: z.string().min(1),
    steps: z.array(workflowStepSchema).min(1),
    ownerRole: z.string().min(1),
    slaHours: z.number().int().min(1).max(8760),
    published: z.boolean(),
  })
  .refine((value) => !value.published || value.steps.length >= 2, {
    message: 'a published workflow needs at least a start and a completion step',
    path: ['steps'],
  });

/** Schema for `WorkflowInstance`. */
export const workflowInstanceSchema = z.object({
  id: idSchema,
  definitionId: idSchema,
  state: z.enum(['running', 'waiting', 'paused', 'escalated', 'completed', 'cancelled']),
  currentNodeId: idSchema,
  openedOn: isoDateTimeSchema,
  dueOn: isoDateSchema,
  closedOn: isoDateTimeSchema.nullable(),
  subjectRef: entityRefSchema.nullable(),
  ownerId: idSchema.nullable(),
});