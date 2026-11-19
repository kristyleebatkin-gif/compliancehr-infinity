/**
 * The Phase 1 file map. Every artefact from the generation prompt is recorded here with the
 * path it actually lives at and whether Phase 1 built it or reused what the app already had.
 *
 * `npm test` asserts that every path in this map exists, so the map cannot drift into fiction.
 * The Phase 1 plan (docs/history/V8000_PHASE1_PLAN.md) explains the mapping decisions in prose.
 */
export type ArtefactStatus = 'reuse' | 'extend' | 'new';

export interface RepositoryEntry {
  readonly path: string;
  readonly artefact: string;
  readonly status: ArtefactStatus;
  readonly notes: string;
}

export const REPOSITORY_MAP: readonly RepositoryEntry[] = [
  // ---- existing V8000 foundation, reused and not replaced ----
  {
    path: 'src/lib/v8000Engine.js',
    artefact: 'Evidence state model, readiness arithmetic, readiness bands, entry points',
    status: 'reuse',
    notes: 'Phase 1 imports this engine rather than restating it: evidenceState and the readiness runners delegate here.',
  },
  {
    path: 'src/lib/v8000Fabric.js',
    artefact: 'Tenant-scoped register loading for the live fabric',
    status: 'reuse',
    notes: 'The only module that talks to Base44 entities for V8000. Phase 1 stays pure and never calls it.',
  },
  {
    path: 'src/lib/integrityIndex.js',
    artefact: 'Production Enterprise Integrity Index over live entity counts',
    status: 'reuse',
    notes: 'Phase 1 dataset integrity is a separate, dataset-scoped measure and does not replace this.',
  },
  {
    path: 'src/pages/V8000CommandCentre.jsx',
    artefact: 'V8000 command centre page',
    status: 'reuse',
    notes: 'The Phase 1 dashboards map onto this page and the nine module routes it links to.',
  },
  {
    path: 'src/components/v8000/ValidationPanel.jsx',
    artefact: 'Live validation panel in the command centre',
    status: 'reuse',
    notes: 'Renders engine checks against live records. Phase 1 validation is dataset-scoped and separate.',
  },
  {
    path: 'base44/entities/RegulatoryStandard.jsonc',
    artefact: 'Standard register',
    status: 'reuse',
    notes: 'Target entity for the standard records described in the dictionary.',
  },
  {
    path: 'base44/entities/ComplianceControl.jsonc',
    artefact: 'Control register',
    status: 'reuse',
    notes: 'Target entity for control records.',
  },
  {
    path: 'base44/entities/AssuranceEvidence.jsonc',
    artefact: 'Evidence register',
    status: 'reuse',
    notes: 'Target entity for evidence records.',
  },
  {
    path: 'base44/entities/AssuranceFinding.jsonc',
    artefact: 'Finding register',
    status: 'reuse',
    notes: 'Target entity for finding records.',
  },
  {
    path: 'base44/entities/KnowledgeLink.jsonc',
    artefact: 'Traceability links between registers',
    status: 'reuse',
    notes: 'Carries the requirement to control to evidence chain once records leave the dataset.',
  },
  {
    path: 'tests/integrityIndex.test.mjs',
    artefact: 'Existing test harness pattern (node:test)',
    status: 'reuse',
    notes: 'Phase 1 tests follow this harness so they run in the repository’s existing npm test.',
  },

  // ---- Phase 1: types ----
  { path: 'src/v8000/types/common.ts', artefact: 'Shared primitives, severity scale, check result', status: 'new', notes: 'Single vocabulary for every Phase 1 module.' },
  { path: 'src/v8000/types/framework.ts', artefact: 'Framework, standard, requirement, outcome types', status: 'new', notes: '' },
  { path: 'src/v8000/types/compliance.ts', artefact: 'Control, policy, procedure, training, competency, assessment, audit, finding, CAPA types', status: 'new', notes: '' },
  { path: 'src/v8000/types/evidence.ts', artefact: 'Evidence types and state thresholds', status: 'new', notes: '' },
  { path: 'src/v8000/types/workflow.ts', artefact: 'Workflow definition, step and instance types', status: 'new', notes: '' },
  { path: 'src/v8000/types/review.ts', artefact: 'Review types', status: 'new', notes: '' },
  { path: 'src/v8000/types/trust.ts', artefact: 'Trust signal, score and band types', status: 'new', notes: '' },
  { path: 'src/v8000/types/risk.ts', artefact: 'Risk record type and rating function', status: 'new', notes: '' },
  { path: 'src/v8000/types/gap.ts', artefact: 'Gap kinds, gap and gap report types', status: 'new', notes: '' },
  { path: 'src/v8000/types/owner.ts', artefact: 'Owner type', status: 'new', notes: '' },
  { path: 'src/v8000/types/dataset.ts', artefact: 'Dataset and dataset metadata types', status: 'new', notes: '' },
  { path: 'src/v8000/types/dashboard.ts', artefact: 'Dashboard keys, metrics and tone', status: 'new', notes: '' },
  { path: 'src/v8000/types/index.ts', artefact: 'Type barrel', status: 'new', notes: '' },

  // ---- Phase 1: schemas ----
  { path: 'src/v8000/schemas/base.ts', artefact: 'Zod primitives shared by all schemas', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/framework.ts', artefact: 'Framework and standard schemas', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/requirement.ts', artefact: 'Requirement schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/control.ts', artefact: 'Control schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/policy.ts', artefact: 'Policy schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/procedure.ts', artefact: 'Procedure schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/training.ts', artefact: 'Training schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/competency.ts', artefact: 'Competency schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/evidence.ts', artefact: 'Evidence schema with validity ordering', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/assessment.ts', artefact: 'Assessment schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/audit.ts', artefact: 'Audit schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/finding.ts', artefact: 'Finding schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/capa.ts', artefact: 'CAPA schema with effectiveness rule', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/outcome.ts', artefact: 'Outcome schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/owner.ts', artefact: 'Owner schema', status: 'new', notes: 'Added because the owner validator must validate owners.' },
  { path: 'src/v8000/schemas/review.ts', artefact: 'Review schema', status: 'new', notes: 'Added because the review validator must validate reviews.' },
  { path: 'src/v8000/schemas/risk.ts', artefact: 'Risk schema with rating consistency', status: 'new', notes: 'Added because the risk records feed integrity.' },
  { path: 'src/v8000/schemas/workflow.ts', artefact: 'Workflow definition, step and instance schemas', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/dataset.ts', artefact: 'Dataset schema', status: 'new', notes: '' },
  { path: 'src/v8000/schemas/contracts.ts', artefact: 'Compile-time type/schema contracts', status: 'new', notes: 'Typechecked, never executed.' },
  { path: 'src/v8000/schemas/index.ts', artefact: 'Schema barrel', status: 'new', notes: '' },

  // ---- Phase 1: data ----
  { path: 'src/v8000/data/dictionary.ts', artefact: 'Entity data dictionary', status: 'new', notes: 'Nineteen entity definitions with live-register mappings.' },
  { path: 'src/v8000/data/repositoryMap.ts', artefact: 'Repository and file map', status: 'new', notes: 'Asserted against the filesystem by the Phase 1 tests.' },
  { path: 'src/v8000/data/fixtures/factories.ts', artefact: 'Fixture factories', status: 'new', notes: 'Deterministic builders used by every dataset.' },
  { path: 'src/v8000/data/fixtures/reference.ts', artefact: 'Starter reference dataset (frameworks, standards, requirements, outcomes)', status: 'new', notes: 'Fixture-grade reference set, not the authoritative instrument text.' },
  { path: 'src/v8000/data/fixtures/operations.ts', artefact: 'Operational dataset (owners, controls, evidence, audits, findings, CAPAs, workflows, reviews, risks)', status: 'new', notes: '' },
  { path: 'src/v8000/data/fixtures/datasets.ts', artefact: 'Baseline, empty and degraded datasets', status: 'new', notes: '' },

  { path: 'src/v8000/lib/gaps.ts', artefact: 'Gap derivation and density', status: 'new', notes: 'Shared by the gap runner and the gap validator.' },
  { path: 'src/v8000/lib/trust.ts', artefact: 'Trust signals and score', status: 'new', notes: 'Weighting delegated to the existing engine.' },
  { path: 'src/v8000/lib/assurance.ts', artefact: 'Per-standard assurance statements', status: 'new', notes: '' },
  { path: 'src/v8000/lib/readiness.ts', artefact: 'Weighted readiness position', status: 'new', notes: 'Delegates arithmetic to the existing engine.' },
  { path: 'src/v8000/lib/integrity.ts', artefact: 'Dataset integrity across seven dimensions', status: 'new', notes: 'Dataset-scoped; does not replace src/lib/integrityIndex.js.' },
  { path: 'src/v8000/tsconfig.json', artefact: 'Strict TypeScript config for the Phase 1 package', status: 'new', notes: 'Run with npm run typecheck:v8000.' },

  // ---- Phase 1: validators ----
  { path: 'src/v8000/validators/result.ts', artefact: 'Check result helpers', status: 'new', notes: '' },
  { path: 'src/v8000/validators/reference.ts', artefact: 'Reference validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/framework.ts', artefact: 'Framework validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/owner.ts', artefact: 'Owner validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/workflow.ts', artefact: 'Workflow validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/review.ts', artefact: 'Review validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/evidence.ts', artefact: 'Evidence validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/audit.ts', artefact: 'Audit validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/finding.ts', artefact: 'Finding validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/capa.ts', artefact: 'CAPA validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/trust.ts', artefact: 'Trust validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/gap.ts', artefact: 'Gap validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/traceability.ts', artefact: 'Traceability validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/integrity.ts', artefact: 'Integrity validator', status: 'new', notes: '' },
  { path: 'src/v8000/validators/index.ts', artefact: 'Validator registry barrel', status: 'new', notes: '' },

  // ---- Phase 1: checks, runners, tests ----
  { path: 'src/v8000/checks/registry.ts', artefact: 'Check suite registry', status: 'new', notes: 'One entry per validator with its dimension and blocking rule.' },
  { path: 'src/v8000/runners/validationRunner.ts', artefact: 'Validation runner', status: 'new', notes: '' },
  { path: 'src/v8000/runners/treeRunner.ts', artefact: 'Traceability tree runner', status: 'new', notes: '' },
  { path: 'src/v8000/runners/datasetRunner.ts', artefact: 'Dataset integrity runner', status: 'new', notes: '' },
  { path: 'src/v8000/runners/trustRunner.ts', artefact: 'Trust runner', status: 'new', notes: '' },
  { path: 'src/v8000/runners/gapRunner.ts', artefact: 'Gap runner', status: 'new', notes: '' },
  { path: 'src/v8000/runners/assuranceRunner.ts', artefact: 'Assurance runner', status: 'new', notes: '' },
  { path: 'src/v8000/runners/healthRunner.ts', artefact: 'Health runner', status: 'new', notes: '' },
  { path: 'src/v8000/runners/readinessRunner.ts', artefact: 'Readiness runner', status: 'new', notes: 'Delegates weighting to the existing engine.' },
  { path: 'src/v8000/runners/dashboardRunner.ts', artefact: 'Dashboard runner', status: 'new', notes: 'Reuses the published entry points for labels and routes.' },
  { path: 'src/v8000/runners/integrityRunner.ts', artefact: 'Dataset integrity runner', status: 'new', notes: '' },
  { path: 'src/v8000/runners/nightlyRunner.ts', artefact: 'Nightly orchestration runner', status: 'new', notes: 'Pure; it schedules nothing by itself.' },
  { path: 'src/v8000/runners/index.ts', artefact: 'Runner barrel', status: 'new', notes: '' },
  { path: 'src/v8000/lib/evidenceState.ts', artefact: 'Evidence state adapter', status: 'new', notes: 'Delegates to the existing engine.' },
  { path: 'src/v8000/lib/datasetIndex.ts', artefact: 'Dataset index and record predicates', status: 'new', notes: '' },
  { path: 'tests/v8000-phase1-schemas.test.mjs', artefact: 'Schema and contract coverage', status: 'new', notes: 'Runs on the repository’s node:test harness.' },
  { path: 'tests/v8000-phase1-validators.test.mjs', artefact: 'Validator coverage', status: 'new', notes: '' },
  { path: 'tests/v8000-phase1-runners.test.mjs', artefact: 'Runner coverage', status: 'new', notes: '' },
  { path: 'docs/history/V8000_PHASE1_PLAN.md', artefact: 'Phase 1 implementation plan', status: 'new', notes: 'Mapping, reuse decisions and recorded deviations.' },
];