import type { EntityName, RecordId } from './common.ts';

/**
 * The accountable person for a record set. Phase 1 treats an unowned control as a gap,
 * so ownership is a required field everywhere a control or finding is raised.
 */
export interface Owner {
  readonly id: RecordId;
  readonly name: string;
  readonly role: string;
  readonly department: string;
  readonly email: string | null;
  readonly accountableFor: readonly EntityName[];
  readonly active: boolean;
}