# V8000 Phase 1 implementation plan

Maps every Phase 1 artefact onto this repository as it actually is: React + Vite on Base44, Zod 4,
TypeScript 5.8, `node:test` for tests, and the V8000 engine and fabric that already shipped at
`/v8000`. The Phase 1 package is additive: it lives in `src/v8000/`, is imported by nothing in the
running UI yet, and changes no existing module.

## 1. What already existed and is reused, not rebuilt

| Existing artefact | Reused for |
| --- | --- |
| `src/lib/v8000Engine.js` | Evidence state model (`evidenceStateAt`), weighted readiness (`readinessFromParts`), readiness bands (`readinessBand`), and the nine `ENTRY_POINTS` used for dashboard labels and routes. Phase 1 imports it; it does not restate any of it. |
| `src/lib/v8000Fabric.js` | The single tenant-scoped loader for live registers. Phase 1 stays pure and never calls it. |
| `src/lib/integrityIndex.js` | The production Enterprise Integrity Index over live entity counts. Phase 1 dataset integrity is a separate, dataset-scoped measure and does not replace it. |
| Live entities (`RegulatoryStandard`, `ComplianceControl`, `AssuranceEvidence`, `AssuranceFinding`, `KnowledgeLink`, `Policy`, `Risk`, `InternalAudit`, `ImprovementAction`, `TrainingModule`, `TrainingCompletion`, `WorkflowDefinition`, `WorkflowInstance`, `DocumentControl`) | Record targets named in the data dictionary's `base44Entity` and `mapsTo` columns. |
| `tests/*.test.mjs` harness | Phase 1 tests run through the existing `npm test`. |

## 2. What Phase 1 adds

All new files are listed, with status, in `src/v8000/data/repositoryMap.ts`; a test asserts every
path in that map exists. Structure:

```
src/v8000/
  types/        common, framework, compliance, evidence, workflow, review, owner,
                trust, risk, gap, dataset, dashboard  (+ barrel)
  schemas/      base, framework, requirement, control, policy, procedure, training,
                competency, evidence, assessment, audit, finding, capa, outcome,
                owner, review, risk, workflow, dataset, contracts  (+ barrel)
  data/         dictionary.ts, repositoryMap.ts,
                fixtures/{factories,reference,operations,datasets}.ts
  lib/          evidenceState, datasetIndex, gaps, trust, assurance, readiness, integrity
  validators/   result + 13 dimension validators  (+ barrel)
  checks/       registry.ts
  runners/      validation, tree, dataset, trust, gap, assurance, health, readiness,
                dashboard, integrity, nightly  (+ barrel)
  tsconfig.json strict, noEmit, .ts-extension imports
tests/          v8000-phase1-schemas.test.mjs, -validators, -runners
```

### Types and schemas

Interfaces are hand-written and strict (`readonly` fields, union-typed enums, no `any`). Zod
schemas are the runtime gate. `src/v8000/schemas/contracts.ts` holds a compile-time assertion per
record type (`z.infer<schema>` assignable to the domain interface), so a renamed field fails
`npm run typecheck:v8000` rather than silently becoming `undefined` in a runner.

Schemas add rules the plain shape cannot express: evidence validity must run forwards, an
effective CAPA needs a completion date and a named verifier, a risk band must equal its own
likelihood × consequence, a published workflow needs at least a start and an end step.

### Data dictionary and datasets

The dictionary documents all 19 record types, each with field type, required flag, meaning and the
live entity field it maps to. Datasets: `buildBaselineDataset()` (two frameworks, named defects),
`buildEmptyDataset()` (nothing recorded, so every measure must read as not measured) and
`buildDegradedDataset()` (duplicate ids, dangling references, a workflow cycle). Factories are
deterministic; datasets are pinned to `2026-11-17`, and every runner takes `today` as an argument.

The reference set is fixture-grade: it mirrors the NDIS Practice Standards and strengthened Aged
Care Quality Standards closely enough to exercise the chain, but it is **not** the authoritative
instrument text and is not presented as such. The 57 live `RegulatoryStandard` records remain the
source of truth.

### Validators, checks, runners

13 validators, one per dimension, each returning a `CheckResult` per rule — `pass` when the rule
ran and found nothing, `fail` when something must be corrected, `warn` when something needs
attention. The check registry states which severities block. Runners compose them:

- `runValidation` — all checks, blocking separated
- `runDatasetChecks` — schema parse and duplicate ids per collection
- `buildTraceabilityTree` — standard → requirement → control → evidence → findings
- `runTrust`, `runGaps`, `runAssurance`, `runReadiness`, `runIntegrity` — weighted positions
- `runHealth` — dimension coverage, dataset validity, blocking state
- `runDashboards` — the nine entry points, labels and paths taken from `ENTRY_POINTS`
- `runNightly` — one deterministic report from all of the above

## 3. Recorded deviations (with the reason)

1. **Vitest → `node:test`.** Vitest is not installed in this repository and adding it beside Vite 8
   risks the app's own build. Phase 1 tests are written for the harness the repository already
   uses, so `npm test` runs them. They import the TypeScript modules directly, which Node 24
   supports through type stripping.
2. **Extra schema files.** The prompt lists 14 schemas; owner, review, risk, workflow and dataset
   schemas are also present because their validators and the dataset runner have to validate those
   records. No listed schema was dropped.
3. **Computations in `lib/`, runners as wrappers.** Validators need the same trust, gap, assurance
   and readiness arithmetic the runners report. Putting it in `lib/` keeps one implementation
   rather than two.
4. **Dashboard routes.** Labels and paths are read from the existing `ENTRY_POINTS`; a hardcoded
   fallback path per dashboard exists only in case an entry point is renamed.
5. **No persistence, scheduling or notification.** The nightly runner is a pure function. Wiring it
   to a scheduled platform workflow, and writing results to entities, is deliberately not done in
   this pass and is reported in every nightly report's `deferred` list.

## 4. Verification

```
npm test                                  # includes the three Phase 1 suites
npx tsc --noEmit -p src/v8000/tsconfig.json
npm run build
```

Assertions worth knowing: the baseline dataset is schema-valid with zero duplicate ids; every
reference resolves in the baseline and fails loudly in the degraded dataset; the exact broken links
(uncontrolled requirement, requirement without outcome, standard with no control, unowned control,
expired and rejected evidence, workflow cycle) are identified by id; an empty dataset produces no
failures and no score; the nightly run is byte-identical between two runs.

## 5. Deferred

- Persisting Phase 1 reports to entities (no `V8000Run` entity exists).
- A scheduled workflow calling `runNightly`.
- Rendering Phase 1 dashboards in the UI; `/v8000` continues to render the live fabric.
- SLA automation, notification fan-out and external integrations.
- Replacing the fixture reference set with the authoritative instrument text from the live
  obligation registers.
