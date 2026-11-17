import type { EntityRef, FrameworkCode, IsoDate, IsoDateTime, RecordId } from './common.ts';

/** A node in a definition. `next` holds step ids, which is what the cycle check walks. */
export interface WorkflowStep {
  readonly id: RecordId;
  readonly label: string;
  readonly kind: 'task' | 'approval' | 'evidence' | 'notify' | 'decision';
  readonly role: string;
  readonly slaHours: number;
  readonly next: readonly RecordId[];
}

/** A published definition. Only published definitions may open instances. */
export interface WorkflowDefinition {
  readonly id: RecordId;
  readonly code: string;
  readonly name: string;
  readonly framework: FrameworkCode;
  readonly domain: string;
  readonly steps: readonly WorkflowStep[];
  readonly ownerRole: string;
  readonly slaHours: number;
  readonly published: boolean;
}

/** One run of a definition, pinned to the definition it opened against. */
export interface WorkflowInstance {
  readonly id: RecordId;
  readonly definitionId: RecordId;
  readonly state: 'running' | 'waiting' | 'paused' | 'escalated' | 'completed' | 'cancelled';
  readonly currentNodeId: RecordId;
  readonly openedOn: IsoDateTime;
  readonly dueOn: IsoDate;
  readonly closedOn: IsoDateTime | null;
  readonly subjectRef: EntityRef | null;
  readonly ownerId: RecordId | null;
}

/** Lifecycle states that still demand someone's attention. */
export const OPEN_INSTANCE_STATES: readonly WorkflowInstance['state'][] = [
  'running',
  'waiting',
  'paused',
  'escalated',
];