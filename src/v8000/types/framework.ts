import type { FrameworkCode, IsoDate, RecordId } from './common.ts';

/** The instrument itself: what it is, when it started, when the business must re-read it. */
export interface Framework {
  readonly id: RecordId;
  readonly code: FrameworkCode;
  readonly label: string;
  readonly legislation: string;
  readonly version: string;
  readonly effectiveFrom: IsoDate;
  readonly reviewDue: IsoDate;
}

/** One standard or module area inside a framework. `code` is the citation staff quote. */
export interface Standard {
  readonly id: RecordId;
  readonly framework: FrameworkCode;
  readonly code: string;
  readonly title: string;
  readonly moduleArea: string;
  readonly outcome: string;
  readonly effectiveFrom: IsoDate;
  readonly reviewDue: IsoDate;
  readonly status: 'draft' | 'active' | 'superseded' | 'retired';
}

/** A single obligation the business must meet. The atom of traceability. */
export interface Requirement {
  readonly id: RecordId;
  readonly standardId: RecordId;
  readonly framework: FrameworkCode;
  readonly code: string;
  readonly obligation: string;
  readonly requirement: string;
  readonly mandatory: boolean;
  readonly evidenceExpectation: string;
  readonly ownerRole: string;
}

/** What changes for the person if the requirement is truly met. */
export interface Outcome {
  readonly id: RecordId;
  readonly requirementId: RecordId;
  readonly statement: string;
  readonly beneficiary: 'participant' | 'resident' | 'worker' | 'organisation';
  readonly indicator: string;
  readonly status: 'met' | 'partial' | 'not_met' | 'not_measured';
  readonly source: 'recorded' | 'derived' | 'none';
}