# PMM Phase 0 — Architecture baseline and compatibility map

Recorded 18 November 2026. This is the Phase 0 output of the PMM plan applied to ComplianceHR Infinity: the
existing architecture is recorded and reconciled, not replaced. Nothing here is a completion claim for the
phases that follow it.

## 1. What the app is today (baseline)

| Area | Baseline as it actually is |
| --- | --- |
| Runtime | Base44 Vite React single-page app, published on Base44 hosting |
| Data | 243 Base44 entity schemas, business-scoped with `tenant_id` and per-entity RLS |
| API | Base44 SDK entity calls from the browser, plus 130 backend functions in `base44/functions/` |
| Automation | 68 workflow files in `base44/workflows/`, the Automation Fabric and Workflow Studio |
| Identity | Base44 auth, approved-access gate (account Active and access approved), role matrix, MFA support |
| UI | 112 pages, a canonical module directory and role-gated routes |
| Tests | Node and Deno suites executed in CI (`npm run ci:verify`) |

The metadata repository does not restate these numbers as prose only: `base44/shared/pmmMetadata.ts` names the
registers, modules, workflows, reports and AI surfaces, and `tests/deno/pmm.test.ts` fails if any of them stops
existing.

## 2. Compatibility and adaptation map

The PMM plan's target stack (NestJS, PostgreSQL, Prisma, Redis, Docker, GitHub Actions) is the target for
generated reference output. The live app remains on its Base44 runtime.

| Area | Today | Target | Reconciliation |
| --- | --- | --- | --- |
| Runtime | Base44 Vite React SPA | NestJS API with a Vite React client | Reference output generated and reviewed; live app untouched |
| Database | Base44 entities with declared schemas and RLS | PostgreSQL with Prisma migrations, FORCE RLS, audit triggers | Entity metadata drives generated DDL; live registers stay authoritative |
| API | SDK calls and backend functions | NestJS modules, controllers, services, DTOs, guards | OpenAPI generated per register as a design target |
| UI | Existing pages, routes and module directory | Generated register, detail and create screens | Existing route ids and screens reused; generated screens are specifications |
| Automation | 68 workflows, Automation Fabric, Workflow Studio | Event-driven services with durable queues | Workflow metadata names the live file that implements each automation |
| AI | AI Intelligence OS, AI Workforce OS, agents and copilots | Infinity Nexus AI with permission-filtered sources | Declared as skills with human review; no capability claimed beyond what runs |
| Tests | Node and Deno suites plus the PMM engine tests | Generated unit, API, workflow, RLS and tenant tests | Test specifications generated; executed suites remain the evidence |
| Tenancy | `tenant_id`, per-entity RLS, approved-access gate | FORCE RLS with an application tenant setting | Both models declared; generated policies mirror the live rule |

Rules carried into every phase: evolve in place, preserve routes, ids, entities, records, permissions,
workflows, branding and tenants; no replacement app, no framework migration, no duplicate entity schemas, no
production record changes, no publication from the factory.

## 3. Metadata specifications (Phase 0 deliverable)

Ten specifications are declared, and the engine validates each one:

1. **Platform** — key, name, runtime, version, target stack, migration rules, per-area compatibility entries.
2. **Domain** — key, label, purpose, the modules that serve it, the registers it contains, its dependencies.
3. **Entity** — key, owning domain, source (`existing` or `planned`), tenancy mode, ownership rule, key field,
   status field, declared fields with types, and relations that name their target and the field carrying them.
4. **Workflow** — key, name, domain, trigger kind, and the workflow file that implements it.
5. **Report** — key, name, domain, and the page or function that produces it today.
6. **AI skill** — key, name, domain, delivering surface, and whether a person reviews the output.
7. **Capability** — key, phase, name, status (`present`, `partial`, `planned`, `blocked`, `unverified`), factory
   state (`reused`, `generated-reference`, `not-generated`), covered domains, evidence, gate flag, reason.
8. **Security** — roles, tenancy model, permission model, RLS statement.
9. **Screen** — generated specification: register columns, filters, detail fields, and the seven states
   (loading, empty, error, permission-denied, read-only, success).
10. **Dashboard** — served by the existing module surfaces named per domain; no dashboard is generated in this
    phase, and the mapping records which existing page carries it.

A capability that is `present` or `partial` must cite evidence, a `blocked` capability must state its reason,
and a `planned` capability may not cite delivered evidence. That is enforced by the validator and by the tests,
so a plan cannot quietly become a completion claim.

## 4. The factory chain (Phase 1)

`base44/shared/pmm.ts` is pure: no clock, no I/O, no entity access. The chain is:

1. **Load** — `loadMetadata` validates every record against the specification and reports errors and warnings.
2. **Resolve** — `resolveReferences` checks that every module, register, relation, domain dependency and
   capability domain exists, and returns the edges it resolved.
3. **AST** — `buildAst` produces canonical nodes for platform, domains, entities, modules, workflows, reports,
   AI skills, capabilities and roles.
4. **Graph** — `buildMetadataGraph` returns nodes, resolved edges, per-kind counts and orphans.
5. **Validate the graph** — `validateGraph` reports duplicate ids, dangling edges and domain dependency cycles.
6. **Compile** — `compileGraph` produces a deterministic dependency order and a stable graph hash, so the same
   metadata always compiles to the same result.

`base44/functions/pmmFactory/entry.ts` serves this read-only to the workspace at `/pmm-factory`, behind the
approved-access gate and a compliance or management role; an auditor may read. It has no write path.

## 5. Reference output (Phase 2–4 preview)

`generateReference` emits five artefacts for one register: a Prisma model, SQL DDL with `FORCE ROW LEVEL
SECURITY`, an OpenAPI document, a screen specification and a test specification. Every artefact is labelled
reference output. None has been deployed, migrated or executed, and the live register remains authoritative.
A planned register generates a design target and says so.

## 6. Honest position at the end of this phase

- Phase 0 and Phase 1 are delivered: the baseline, the specifications, the engine, the service and the tests.
- Phase 2, 3, 4 and 6 are **partial**: reference generators exist, but no database migration, API deployment,
  UI generation or generated test suite has been run in an approved runtime.
- Phase 5 is **planned**: no design-tool output is generated.
- Phases 7–12 are **present as reused capability**, because Governance, Compliance, Risk, Audit, the Evidence
  Engine and the AI layer already run in this app. They were hand-built, not generated by the factory.
- The MVP release gate is **blocked**, because its generated-output gates are unmet. That is the accurate
  position, not a scheduling note.
- Phase 13+ operating systems are present, partial or planned as the capability matrix states, one row each.

The factory does not publish, deploy, migrate or alter production records, and no phase of this work did.
