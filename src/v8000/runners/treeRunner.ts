import type { EvidenceState, IsoDate, RecordId, V8000Dataset } from '../types/index.ts';
import { percent } from '../types/index.ts';
import { isActiveControl, isOpenFinding, safeIndex } from '../lib/datasetIndex.ts';
import { evidenceState, holdsAssurance } from '../lib/evidenceState.ts';

export interface TreeEvidence {
  readonly id: RecordId;
  readonly title: string;
  readonly state: EvidenceState;
  readonly holds: boolean;
}

export interface TreeControl {
  readonly id: RecordId;
  readonly statement: string;
  readonly ownerName: string | null;
  readonly active: boolean;
  readonly evidence: readonly TreeEvidence[];
  readonly openFindings: number;
}

export interface TreeRequirement {
  readonly id: RecordId;
  readonly code: string;
  readonly requirement: string;
  readonly outcome: { readonly id: RecordId; readonly status: string } | null;
  readonly controls: readonly TreeControl[];
}

export interface TreeStandard {
  readonly id: RecordId;
  readonly code: string;
  readonly title: string;
  readonly framework: string;
  readonly requirements: readonly TreeRequirement[];
  readonly evidencedControls: number;
  readonly controls: number;
}

export interface TreeSummary {
  readonly standards: number;
  readonly requirements: number;
  readonly controls: number;
  readonly evidence: number;
  readonly orphanEvidence: number;
  readonly requirementsWithoutControl: number;
  readonly standardsWithoutControl: number;
  readonly assuranceCoverage: number | null;
}

export interface TraceabilityTree {
  readonly standards: readonly TreeStandard[];
  readonly summary: TreeSummary;
  readonly asAt: IsoDate;
}

/**
 * The whole traceability tree, framework → standard → requirement → control → evidence → findings.
 * Built for reading as much as for counting: every node carries the record ids a page would link to.
 */
export function buildTraceabilityTree(dataset: V8000Dataset, today: IsoDate): TraceabilityTree {
  const owners = safeIndex(dataset.owners);
  const evidenceByControl = new Map<string, TreeEvidence[]>();
  dataset.evidence.forEach((item) => {
    if (!item.controlId) return;
    const list = evidenceByControl.get(item.controlId) ?? [];
    const state = evidenceState(item, today);
    list.push({ id: item.id, title: item.title, state, holds: holdsAssurance(state) });
    evidenceByControl.set(item.controlId, list);
  });
  const openFindingsByControl = new Map<string, number>();
  dataset.findings.filter(isOpenFinding).forEach((finding) => {
    if (!finding.controlId) return;
    openFindingsByControl.set(finding.controlId, (openFindingsByControl.get(finding.controlId) ?? 0) + 1);
  });

  const standards: TreeStandard[] = dataset.standards.map((standard) => {
    const requirements = dataset.requirements
      .filter((requirement) => requirement.standardId === standard.id)
      .map((requirement) => {
        const controls = dataset.controls
          .filter((control) => control.requirementIds.includes(requirement.id))
          .map((control) => ({
            id: control.id,
            statement: control.statement,
            ownerName: control.ownerId ? owners.get(control.ownerId)?.name ?? null : null,
            active: isActiveControl(control),
            evidence: evidenceByControl.get(control.id) ?? [],
            openFindings: openFindingsByControl.get(control.id) ?? 0,
          }));
        const outcome = dataset.outcomes.find((item) => item.requirementId === requirement.id);
        return {
          id: requirement.id,
          code: requirement.code,
          requirement: requirement.requirement,
          outcome: outcome ? { id: outcome.id, status: outcome.status } : null,
          controls,
        };
      });

    const allControls = requirements.flatMap((requirement) => requirement.controls);
    return {
      id: standard.id,
      code: standard.code,
      title: standard.title,
      framework: standard.framework,
      requirements,
      controls: allControls.length,
      evidencedControls: allControls.filter((control) => control.active && control.evidence.some((item) => item.holds)).length,
    };
  });

  const summary: TreeSummary = {
    standards: standards.length,
    requirements: dataset.requirements.length,
    controls: dataset.controls.length,
    evidence: dataset.evidence.length,
    orphanEvidence: dataset.evidence.filter((item) => item.controlId === null).length,
    requirementsWithoutControl: dataset.requirements.filter(
      (requirement) => !dataset.controls.some((control) => control.requirementIds.includes(requirement.id))
    ).length,
    standardsWithoutControl: standards.filter((standard) => standard.controls === 0).length,
    assuranceCoverage: percent(
      standards.reduce((sum, standard) => sum + standard.evidencedControls, 0),
      standards.reduce((sum, standard) => sum + standard.controls, 0)
    ),
  };

  return { standards, summary, asAt: today };
}