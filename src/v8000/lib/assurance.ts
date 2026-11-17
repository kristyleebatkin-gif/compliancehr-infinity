import type { FrameworkCode, IsoDate, RecordId, V8000Dataset } from '../types/index.ts';
import { percent } from '../types/index.ts';
import { isActiveControl, isOpenFinding } from './datasetIndex.ts';
import { evidenceState, holdsAssurance } from './evidenceState.ts';

export type AssuranceLevel = 'assured' | 'partial' | 'unsupported' | 'not_measured';

/** The assurance statement for one standard, and the counts it was derived from. */
export interface StandardAssurance {
  readonly standardId: RecordId;
  readonly code: string;
  readonly title: string;
  readonly framework: FrameworkCode;
  readonly requirements: number;
  readonly controls: number;
  readonly evidencedControls: number;
  readonly openFindings: number;
  readonly coverage: number | null;
  readonly level: AssuranceLevel;
  readonly statement: string;
}

/**
 * Per-standard assurance from the chain: requirement → active control → holding evidence,
 * with open findings subtracted. A standard with no controls is `unsupported`: nothing in the
 * business is recorded as meeting it, which is different from meeting it badly.
 */
export function assessStandards(dataset: V8000Dataset, today: IsoDate): readonly StandardAssurance[] {
  const activeControls = dataset.controls.filter(isActiveControl);
  const holdingControlIds = new Set(
    dataset.evidence
      .filter((item) => item.controlId !== null && holdsAssurance(evidenceState(item, today)))
      .map((item) => item.controlId as string)
  );

  return dataset.standards
    .map((standard) => {
      const requirementIds = new Set(
        dataset.requirements.filter((requirement) => requirement.standardId === standard.id).map((requirement) => requirement.id)
      );
      const controls = activeControls.filter((control) =>
        control.requirementIds.some((requirementId) => requirementIds.has(requirementId))
      );
      const evidencedControls = controls.filter((control) => holdingControlIds.has(control.id)).length;
      const openFindings = dataset.findings.filter(
        (finding) => isOpenFinding(finding) && finding.standardId === standard.id && finding.rating !== 'conformity'
      ).length;
      const coverage = percent(evidencedControls, controls.length);

      let level: AssuranceLevel;
      if (requirementIds.size === 0) level = 'not_measured';
      else if (controls.length === 0) level = 'unsupported';
      else if (evidencedControls === controls.length && openFindings === 0) level = 'assured';
      else level = 'partial';

      const statement =
        level === 'assured'
          ? `${standard.code} is supported by current evidence for every active control, with no open findings.`
          : level === 'partial'
            ? `${standard.code} is partly supported: ${evidencedControls} of ${controls.length} active controls hold current evidence${openFindings === 0 ? '' : `, and ${openFindings} finding${openFindings === 1 ? ' is' : 's are'} open`}.`
            : level === 'unsupported'
              ? `${standard.code} has no active control, so nothing is recorded as meeting it.`
              : `${standard.code} has no requirements recorded yet.`;

      return {
        standardId: standard.id,
        code: standard.code,
        title: standard.title,
        framework: standard.framework,
        requirements: requirementIds.size,
        controls: controls.length,
        evidencedControls,
        openFindings,
        coverage,
        level,
        statement,
      };
    })
    .sort((a, b) => a.framework.localeCompare(b.framework) || a.code.localeCompare(b.code));
}

export interface AssuranceSummary {
  readonly assured: number;
  readonly partial: number;
  readonly unsupported: number;
  readonly notMeasured: number;
  readonly total: number;
}

export function summariseAssurance(statements: readonly StandardAssurance[]): AssuranceSummary {
  return {
    assured: statements.filter((item) => item.level === 'assured').length,
    partial: statements.filter((item) => item.level === 'partial').length,
    unsupported: statements.filter((item) => item.level === 'unsupported').length,
    notMeasured: statements.filter((item) => item.level === 'not_measured').length,
    total: statements.length,
  };
}