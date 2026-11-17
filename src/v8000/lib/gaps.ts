import type { EntityRef, Gap, GapKind, IsoDate, SeverityCounts, V8000Dataset, GapReport } from '../types/index.ts';
import { percent, SEVERITY_ORDER } from '../types/index.ts';
import { evidenceState, holdsAssurance } from './evidenceState.ts';
import { isActiveControl, isOpenFinding, safeIndex } from './datasetIndex.ts';

const GAP_KINDS: readonly GapKind[] = [
  'missing_evidence',
  'stale_evidence',
  'rejected_evidence',
  'unowned_control',
  'untested_control',
  'open_high_finding',
  'overdue_capa',
  'missing_outcome',
  'unmapped_requirement',
  'overdue_review',
  'inadequate_training',
];

function emptyKindCounts(): Record<GapKind, number> {
  return GAP_KINDS.reduce((counts, kind) => {
    counts[kind] = 0;
    return counts;
  }, {} as Record<GapKind, number>);
}

function emptySeverityCounts(): Record<'critical' | 'high' | 'medium' | 'low', number> {
  return { critical: 0, high: 0, medium: 0, low: 0 };
}

/**
 * Every way the evidence chain is broken in this dataset, derived only from stored records.
 * No gap is raised for a measure the business has no records for: an empty register is reported
 * as unmapped, not as a fabricated failure.
 */
export function collectGaps(dataset: V8000Dataset, today: IsoDate): GapReport {
  const owners = safeIndex(dataset.owners);
  const evidenceByControl = new Map<string, typeof dataset.evidence[number][]>();
  dataset.evidence.forEach((item) => {
    if (!item.controlId) return;
    const list = evidenceByControl.get(item.controlId) ?? [];
    list.push(item);
    evidenceByControl.set(item.controlId, list);
  });

  const gaps: Gap[] = [];
  const add = (gap: Omit<Gap, 'id'>): void => {
    gaps.push({ id: `${gap.kind}:${gap.refs.map((item) => item.id).join('+')}`, ...gap });
  };

  const active = dataset.controls.filter(isActiveControl);

  active.forEach((control) => {
    const holding = (evidenceByControl.get(control.id) ?? []).filter((item) =>
      holdsAssurance(evidenceState(item, today))
    );
    if (control.evidenceRequired && holding.length === 0) {
      add({
        kind: 'missing_evidence',
        severity: 'high',
        title: 'Control holds no current evidence',
        detail: `${control.statement} has no verified or in-date evidence, so it cannot be assured.`,
        refs: [{ type: 'control', id: control.id }],
        dueOn: control.nextTestOn,
      });
    }

    (evidenceByControl.get(control.id) ?? []).forEach((item) => {
      const state = evidenceState(item, today);
      if (state === 'expired') {
        add({
          kind: 'stale_evidence',
          severity: 'high',
          title: 'Evidence is out of date',
          detail: `${item.title} expired on ${item.validTo ?? 'an unrecorded date'} and still sits against an active control.`,
          refs: [
            { type: 'evidence', id: item.id },
            { type: 'control', id: control.id },
          ],
          dueOn: item.validTo,
        });
      }
      if (state === 'rejected') {
        add({
          kind: 'rejected_evidence',
          severity: 'high',
          title: 'Evidence was rejected',
          detail: `${item.title} was rejected and cannot support the control until it is replaced.`,
          refs: [
            { type: 'evidence', id: item.id },
            { type: 'control', id: control.id },
          ],
          dueOn: null,
        });
      }
    });

    const owner = control.ownerId ? owners.get(control.ownerId) : undefined;
    if (!owner || owner.active === false) {
      add({
        kind: 'unowned_control',
        severity: 'high',
        title: 'Control has no active owner',
        detail: `${control.statement} has no one accountable for its evidence.`,
        refs: [{ type: 'control', id: control.id }],
        dueOn: null,
      });
    }

    if (control.nextTestOn && control.nextTestOn < today) {
      add({
        kind: 'untested_control',
        severity: 'medium',
        title: 'Control test overdue',
        detail: `The control was due to be tested on ${control.nextTestOn}.`,
        refs: [{ type: 'control', id: control.id }],
        dueOn: control.nextTestOn,
      });
    }

    control.trainingIds.forEach((trainingId) => {
      const required = dataset.competencies.filter((item) => item.trainingId === trainingId && item.required);
      const current = required.filter((item) => item.expiresOn !== null && item.expiresOn >= today);
      if (required.length > 0 && current.length < required.length) {
        add({
          kind: 'inadequate_training',
          severity: 'medium',
          title: 'Mandated training lapsed or unassessed',
          detail: `${required.length} people require this training and ${required.length - current.length} are lapsed or unassessed.`,
          refs: [
            { type: 'control', id: control.id },
            { type: 'training', id: trainingId },
          ],
          dueOn: null,
        });
      }
    });
  });

  dataset.findings.filter(isOpenFinding).forEach((finding) => {
    const severe = finding.severity === 'critical' || finding.severity === 'high';
    if (!severe) return;
    add({
      kind: 'open_high_finding',
      severity: finding.severity,
      title: 'High or major finding still open',
      detail: `${finding.title} was due on ${finding.dueOn}.`,
      refs: [{ type: 'finding', id: finding.id }],
      dueOn: finding.dueOn,
    });
  });

  dataset.capas.forEach((capa) => {
    if (capa.completedOn === null && capa.dueOn < today) {
      add({
        kind: 'overdue_capa',
        severity: 'high',
        title: 'Corrective action overdue',
        detail: `${capa.action} was due on ${capa.dueOn} and is not complete.`,
        refs: [{ type: 'capa', id: capa.id }],
        dueOn: capa.dueOn,
      });
    }
  });

  const controlledRequirementIds = new Set<string>();
  dataset.controls.filter(isActiveControl).forEach((control) => {
    control.requirementIds.forEach((id) => controlledRequirementIds.add(id));
  });

  dataset.requirements.forEach((requirement) => {
    if (requirement.mandatory && !controlledRequirementIds.has(requirement.id)) {
      add({
        kind: 'unmapped_requirement',
        severity: 'high',
        title: 'Requirement has no control',
        detail: `${requirement.code} is mandatory and nothing in the business is recorded as meeting it.`,
        refs: [{ type: 'requirement', id: requirement.id }],
        dueOn: null,
      });
    }
  });

  const outcomeRequirementIds = new Set(dataset.outcomes.map((outcome) => outcome.requirementId));
  dataset.requirements.forEach((requirement) => {
    if (!outcomeRequirementIds.has(requirement.id)) {
      add({
        kind: 'missing_outcome',
        severity: 'low',
        title: 'Requirement has no stated outcome',
        detail: `${requirement.code} stops at the control: there is no recorded outcome for the person it protects.`,
        refs: [{ type: 'requirement', id: requirement.id }],
        dueOn: null,
      });
    }
  });

  dataset.reviews.forEach((review) => {
    if (review.dueOn < today) {
      add({
        kind: 'overdue_review',
        severity: 'high',
        title: 'Review overdue',
        detail: `${review.title} was due on ${review.dueOn}.`,
        refs: [{ type: 'review', id: review.id }],
        dueOn: review.dueOn,
      });
    }
  });

  // Evidence that resolves to no active control is an orphan, but it is reported by the evidence
  // validator rather than as a gap: nothing is missing, something is unlinked.

  const byKind = emptyKindCounts();
  const bySeverity = emptySeverityCounts();
  gaps.forEach((gap) => {
    byKind[gap.kind] += 1;
    bySeverity[gap.severity as keyof typeof bySeverity] += 1;
  });

  const sorted = [...gaps].sort((a, b) => {
    const severity = SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity);
    return severity !== 0 ? severity : a.kind.localeCompare(b.kind);
  });

  return {
    gaps: sorted,
    byKind,
    bySeverity: bySeverity as SeverityCounts,
    total: sorted.length,
    asAt: today,
  };
}

/**
 * How much of the obligation set carries a gap. Reported as `null` when there are no active
 * controls, because "no controls" is an absence of data, not a perfect score.
 */
export function gapDensity(report: GapReport, dataset: V8000Dataset): number | null {
  const active = dataset.controls.filter(isActiveControl).length;
  const structural = report.byKind.missing_evidence + report.byKind.stale_evidence + report.byKind.rejected_evidence;
  return percent(structural, active);
}

/** Ref type guard used by the gap validator. */
export function gapRefs(gap: Gap, type: EntityRef['type']): readonly EntityRef[] {
  return gap.refs.filter((item) => item.type === type);
}