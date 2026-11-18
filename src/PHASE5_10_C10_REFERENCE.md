# C10 — Autonomous Enterprise Operating System

Design reference and delivery record for Capability Track C10, the last step in the C5–C10 order. It
holds the C10 material in the same way `PHASE5_10_C8_REFERENCE.md` and `PHASE5_10_C9_REFERENCE.md` hold
C8 and C9. Everything in §1 and §2 runs today; §3 states the boundaries; §4 states what is deliberately
not built.

---

## 1. What runs today

**Records (eight, all tenant-scoped, all `__service_role_only__` on create, update and delete).**

| Record | Holds | Notable fields |
| --- | --- | --- |
| `EnterprisePortfolio` | A sponsored grouping of transformation work | `portfolio_key`, `sponsor`, `strategy_alignment`, `status`, `horizon`, `review_due` |
| `TransformationProgram` | One change programme inside a portfolio | `program_key`, `portfolio_id`, `portfolio_key`, `sponsor`, `owner_role`, `status`, `target_date` |
| `StrategyObjective` | One measured objective of a programme | `objective_key`, `measure`, `unit`, `baseline_value`, `target_value`, `current_value`, `status`, `linked_records_json` |
| `StrategyBenefit` | A benefit claimed against an objective | `benefit_key`, `valuation_method`, `valuation_amount`, `actual_value`, `review_status`, `evidence_refs_json`, `realised_date` |
| `EnterpriseCapability` | An organisational capability and its maturity | `capability_key`, `current_maturity`, `target_maturity`, `latest_assessment_id`, `latest_assessment_score`, `evidence_backed` |
| `CapabilityMaturityAssessment` | One person's scored assessment of a capability | `assessment_ref`, `score`, `rationale`, `evidence_refs_json`, `status`, `validated_by`, `validated_at` |
| `TransformationRoadmap` | A versioned delivery plan for a programme | `roadmap_key`, `version`, `initiatives_json`, `dependencies_json`, `milestones_json`, `status`, `approval_authority`, `self_approved`, `previous_version_id` |
| `StrategyAuditRecord` | Append-only trail of every change and refusal | `action`, `subject_type`, `subject_ref`, `outcome`, `detail`, `redacted_count`, `previous_hash`, `chain_hash` |

**Service.** `base44/shared/enterpriseStrategy.ts` (`ENTERPRISE_STRATEGY_VERSION = 'C10.1'`) is the rule
book: the status vocabularies, the valuation methods, the linked-register list, the maturity labels and
the minimum lengths for rationales and reasons, plus the pure functions that decide everything the UI
shows — `progressPercent`, `dueState`, `capabilityMaturity`, `buildRollups`, `validatePortfolio`,
`validateProgram`, `validateObjective`, `validateBenefit`, `validateCapability`, `validateAssessment`,
`validateRoadmapPlan`, `validateRoadmap`, `statusChangeNeedsApproval`, `roadmapTransition`,
`strategyPermissions` and `buildAuditEntry`. The backend function `enterpriseStrategy` is the only
writer, and it scopes every read and write by the caller's `tenant_id`.

**Actions on the function.** `list`, `savePortfolio`, `setPortfolioStatus`, `saveProgram`,
`setProgramStatus`, `saveObjective`, `setObjectiveStatus`, `saveBenefit`, `reviewBenefit`,
`saveCapability`, `setCapabilityStatus`, `recordAssessment`, `validateAssessment`, `saveRoadmap`,
`submitRoadmap`, `decideRoadmap`, `archiveRoadmap`. Every write emits a `StrategyAuditRecord` with its
previous hash carried forward, and a refusal the caller was not allowed to make is recorded with
outcome `Refused`.

**Module.** `/enterprise-strategy`, eight tabs: board view, portfolios, programs, objectives, benefits,
capabilities, assessments, roadmaps and the audit trail, with rollup cards, a per-register table and a
dialog per register. Gated in `src/lib/roleMatrix.js` (`'enterprise-strategy': COMPLIANCE_REVIEW_ROLES`)
to Provider Administrator, Compliance Manager, Compliance Administrator, Management, Administration,
Quality & Improvement Manager, Auditor and admin; approving a roadmap needs `permissions.approve`,
which excludes Auditor.

**Rollups come from stored numbers only.** Portfolio to programme to objective to benefit is summed
from the records themselves; progress is `null` when a measure is missing rather than assumed, capability
maturity comes from the latest *validated* assessment, and an empty workspace reads zero rather than a
placeholder.

**Tests.** `tests/deno/capabilityC10.test.ts` (20 tests) covers the rollup arithmetic, progress and due
state, capability maturity from validated evidence only, the empty-workspace case, permission denial,
which status changes need approval, the roadmap approval sequence, audit redaction and hash chaining,
and the reported strategy version. `tests/enterprise-strategy-entities.test.mjs` covers the register
schemas and their tenant RLS.

---

## 2. Live verification (production database)

Read paths and every endpoint's refusal path were exercised against the live function; no register
record was left behind.

| Check | Result |
| --- | --- |
| `list` on an empty workspace | `saved: true`, every register count `0`, `auditRecords: 1`, `strategyVersion: C10.1` |
| `savePortfolio` with a valid body | Created `POR-2026-001` as `Draft` and wrote one `StrategyAuditRecord` (`Portfolio created`) |
| `savePortfolio` with no name | `400 Give the portfolio a name.` |
| `saveCapability` with no name | `400 Give the capability a name.` |
| `setPortfolioStatus`, `saveProgram`, `setProgramStatus`, `saveObjective`, `setObjectiveStatus`, `saveBenefit`, `reviewBenefit`, `setCapabilityStatus`, `recordAssessment`, `validateAssessment`, `saveRoadmap`, `submitRoadmap`, `decideRoadmap`, `archiveRoadmap` with a parent record that does not exist | Each refused `404` with its own message ("That portfolio is not in your business.", "That capability is not in your business.", and so on) and wrote nothing |
| Unknown action | `400 Unknown action.` |
| Portfolio register after the test record was removed | `0` |
| Strategy audit register | `1` entry, `AUD-20261118030719-2DY5`, `Portfolio created`, `POR-2026-001`, outcome `Recorded`, `previous_hash` empty and `chain_hash` present |

The test-created portfolio was soft-deleted by its exact record id on request. Its audit entry is kept
as immutable history: it records that the portfolio was created, which is what happened, and it is not
edited or removed, nor is any other audit row. Because the register is append-only, an audit trail of
this step will legitimately begin with that single entry.

**Verified live:** the read path, portfolio creation with its audit write, and the refusal path of all
seventeen actions.
**Not verified live:** the successful path of programme, objective, benefit, capability, assessment and
roadmap creation, status change, benefit review, assessment validation and the roadmap
submit/decide/archive transitions. Those are covered by the 20 service tests, but no live end-to-end
cycle through them was run, because each would need records created and then removed, and this step was
closed without adding or deleting further data. The first real use of those registers is their first
live exercise.

---

## 3. Boundaries that hold

1. **No invented numbers.** Progress, rollups, realised benefit and maturity come from stored fields;
   a missing measure yields "not measured", never an estimate.
2. **Maturity needs evidence.** A capability's maturity is taken from the latest *validated* assessment,
   and a score of 4 or 5 requires at least one evidence reference.
3. **Approval before work starts.** Moving a portfolio, programme, objective, benefit, capability or
   roadmap into a status that sets work in motion (`Active`, `Approved`, `Closed`, `Achieved`) requires
   `permissions.approve` and a recorded reason.
4. **A roadmap is approved by someone else.** Approval is only possible once a roadmap is `Submitted`,
   needs a reason, and a person cannot approve a roadmap they authored; an administrator override is
   recorded as an override, and `approval_authority` and `self_approved` state which happened.
5. **Versions, not overwrites.** Editing a `Submitted`, `Approved` or `Returned` roadmap creates a new
   version that points at the previous record; an `Archived` roadmap cannot be versioned.
6. **Tenant isolation on every path.** Every read and write is scoped by `data.tenant_id === user.data.tenant_id`;
   a record from another business answers "not in your business" rather than being revealed.
7. **Append-only audit.** Entries are hash chained to the one before them and are written only by the
   service; the browser cannot write, edit or delete them.

---

## 4. Deliberately not built

- No scheduling, forecasting or projection engine: the roadmap is a recorded plan with dates and
  statuses, not a resourced schedule.
- No financial accounting: a benefit's valuation is a person's recorded figure using a chosen method,
  and nothing computes a business case.
- No write-back into the registers it links to. `linked_records_json` holds references to decisions,
  risks, controls, evidence, workflows and AI recommendations; those registers remain the only records.
- No automatic approval, no approval by timeout, and no approval by the author of the roadmap.
- No replacement of an existing module, route, entity or role. C10 added a workspace; it substituted
  nothing.

Named checkpoint for this step: **Capability Track C10 — Autonomous Enterprise Operating System**.
