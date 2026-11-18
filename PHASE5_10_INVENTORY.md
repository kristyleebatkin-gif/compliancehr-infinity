# Phases 5–10 Capability Track — Read-Only Inventory & Conflict Register

Status: **Phase 0 complete, conflicts resolved, Steps C5, C6 and C7 built.**
Date: 18 November 2026.

Owner decisions recorded before any build:

1. **Separate capability track.** This work is numbered C5–C10 and mapped onto the existing
   12-phase register. `ENTERPRISE_PHASES` in `src/lib/enterprisePhases.js` is unchanged; ids 5–10 keep
   their accepted meanings.
2. **Reference documents too.** The non-native deliverables (PostgreSQL DDL, Prisma, OpenAPI, NestJS,
   Next.js, Terraform, AKS) are written as clearly-labelled design references, stating that this app
   does not execute them.

**Step C5 delivered (Decision Intelligence OS).** Three tenant-scoped records (`DecisionRecord`,
`DecisionEvidence`, `DecisionOutcome`), one server-authorised function (`decisionRegister`), one
module at `/decision-intelligence`, an `AuditLog` entry on every write, and a test cycle that
exercised create, evidence, outcome and decision outcome before the test records were removed.

**Step C6 delivered (Autonomous Compliance Operations OS).** Four tenant-scoped records
(`AutonomousAssessment`, `ComplianceGapAnalysis`, `ControlTestingResult`, `RemediationPlan`), the
assessment engine in `base44/shared/complianceAssessment.ts`, one server-authorised function
(`autonomousCompliance`), and one module at `/compliance-operations`. It reads the existing
`RegulatoryStandard`, `ComplianceControl`, `AssuranceEvidence` and `AssuranceFinding` registers; it
creates no fallback standard, control or evidence. A test cycle ran assessment, gap, remediation plan,
progress, verification, gap closure and a manual control test on a temporary framework, then removed
every test record and its audit entries.

**Step C7 delivered (Knowledge Graph & Digital Twin OS).** Seven tenant-scoped records:
`GraphEntity`, `GraphRelationship`, `GraphTaxonomy`, `GraphOntology`, `DigitalTwinModel`,
`DigitalTwinScenario`, `SimulationRun`. Two server-authorised functions: `knowledgeGraphRegistry`
(list, node, rebuild) and `digitalTwin` (models, scenarios, simulations). Two workspaces: a new
**Knowledge registry** tab on the existing Knowledge Graph OS at `/knowledge-graph`, and the Digital
Twin module at `/digital-twin`. Engines: `base44/shared/graphRegistry.ts` (index, endpoint and
ontology validation) and `base44/shared/digitalTwin.ts` (observed-input computation and simulation).
Conflict C3 was honoured: `KnowledgeLink` remains the only hand-edited edge store, and
`GraphRelationship` mirrors a recorded link by `knowledge_link_id` rather than copying it. The index
is derived, rebuildable and validated, so no fallback master data was created. A test cycle created a
model, validated it, approved it, created a scenario, ran a simulation, submitted and decided the
scenario and opened a model revision, then removed every test record and its audit entries. The
graph index itself was kept: it indexes 109 real register records into 30 validated relationships
with 0 candidates rejected.

This document records what exists, what is genuinely missing, and which conflicts must be resolved
before any schema is written. Nothing here is a delivery claim.

---

## 1. What the application already contains

| Surface | Count (verified on disk) | Source |
| --- | --- | --- |
| Entity schemas | 220 | `base44/entities/` |
| Backend functions | 127 | `base44/functions/` |
| Workflows | 68 | `base44/workflows/` |
| Pages | 108 | `src/pages/` |
| Components | 944 | `src/components/**/*.jsx` |
| Registered routes | 122 | `src/App.jsx` |
| Navigation keys | 65 | `src/lib/moduleDirectory.js` |

Already-delivered operating systems relevant to this request: Workflow Studio (`WorkflowDefinition`,
`WorkflowInstance`, `WorkflowVersion`, `WorkflowEvent`, `workflowRuntime`, `workflowEngine`),
Evidence Fabric (`AssuranceEvidence`, `EvidenceOS`, `AssuranceAuditMatrix`), Knowledge Graph
(`KnowledgeLink`, `KnowledgeGraphOS`, `lib/knowledgeGraph.js`, `components/graph/*`), AI Core
(`AiModel`, `AiAgent`, `AiPrompt`, `AiInteraction`, `AiRecommendation`, `AiReviewDecision`,
`AiGovernanceRecord`, `aiCopilot`, `agentRuntime`), Executive scoring
(`ExecutiveScoreSnapshot`, `ProgressSnapshot`, `ModuleDailyStatus`, `integrityIndex.js`), and the
V8000 package (`src/v8000/`, 75 files, validators/runners/checks).

---

## 2. Requested data model versus what exists

Legend: **Present** = the requested concept exists as a first-class tenant-scoped record.
**Partial** = the concept is expressed inside another record, as a field, or only in memory.
**Missing** = no record of this concept exists.

### Phase 5 — Decision Intelligence
| Requested table | Status | Existing equivalent |
| --- | --- | --- |
| `decision_register` | Missing | `BoardResolution` (board decisions only), `ApprovalChain` (approvals, not decisions) |
| `decision_recommendations` | Partial | `AiRecommendation` (AI-raised, human-verified); not attached to a decision |
| `decision_evidence` | Partial | `KnowledgeLink`, `AiRecommendation.evidence_refs`, `AssuranceEvidence` |
| `decision_outcomes` | Missing | `KPI.target_value` / `current_value` only |

No record currently holds impact, benefit, risk, approvals, outcome target versus actual for a
decision. This is a real gap.

### Phase 6 — Autonomous Compliance Operations
| Requested table | Status | Existing equivalent |
| --- | --- | --- |
| `autonomous_assessments` | Partial | `InternalAudit`, `NDISAuditRecord`, `ComplianceChecklistEntry`; V8000 runners compute in memory and persist nothing |
| `compliance_gap_analysis` | Partial | `lib/assuranceGaps.js`, `GapEnginePanel` — computed, not stored |
| `control_testing_results` | Partial | `ComplianceControl.last_tested_date` / `next_test_date`, `AssuranceEvidence.verification_status` |
| `remediation_plans` | Partial | `AssuranceFinding.corrective_action`, `ImprovementAction` |

V8000’s nightly runner is a pure function with no store and no schedule. Before C6, nothing in the
app stored an assessment: results were recomputed or typed in. C6 keeps the nightly runner as it is
and adds a persisted, record-reading assessment behind the `autonomousCompliance` function, so a
score now has stored control tests behind it rather than a recomputation.

### Phase 7 — Knowledge Graph & Digital Twin
| Requested table | Status | Existing equivalent |
| --- | --- | --- |
| `graph_entities` | Present (C7) | `GraphEntity` — tenanted reference to a real register record with type, canonical key, source register and safe summary |
| `graph_relationships` | Present (C7) | `GraphRelationship` — validated edges with type, weight, confidence, provenance, validity dates; mirrors `KnowledgeLink` by reference |
| `graph_taxonomies` | Present (C7) | `GraphTaxonomy` — the controlled node and relationship types generated from this app's registers |
| `graph_ontologies` | Present (C7) | `GraphOntology` — allowed triples and constraints every indexed edge is validated against |
| `digital_twin_models` | Present (C7) | `DigitalTwinModel` — versioned inputs, weights, ceilings, assumptions and approval record |
| `digital_twin_scenarios` | Present (C7) | `DigitalTwinScenario` — levers with a reason each, pinned model version, review decision |
| `simulation_runs` | Present (C7) | `SimulationRun` — pinned versions, input snapshot with provenance, modelled results, estimate notice |

Conflict C3 stands resolved as recorded: `KnowledgeLink` is still the only place an edge is recorded
by hand, and the relationship register is a derived, rebuildable mirror. No node, edge or type is
invented to fill a gap; an unlinked record is reported as unlinked.

A link table exists and is used by five modules. The graph index and the digital twin now exist.

### Phase 8 — Enterprise Automation Fabric
| Requested table | Status | Existing equivalent |
| --- | --- | --- |
| `event_registry` | Missing | `WorkflowEvent` is a per-run step log, not an event catalogue |
| `event_subscriptions` | Partial | Triggers declared inside workflow `.jsonc` files |
| `automation_flows` | Present (different shape) | `WorkflowDefinition` — 33 process types, versioned, publish-gated |
| `orchestration_rules` | Partial | `shared/workflowEngine.ts`, `connectedJourneyGate` |
| `integration_connectors` | Partial | Connector configs (`googlecalendar`, `gmail`) plus `integrationStatus`; not a register |
| `integration_messages` | Missing | — |

### Phase 9 — Autonomous AI Workforce
| Requested table | Status | Existing equivalent |
| --- | --- | --- |
| `ai_models` | **Present** | `AiModel` |
| `ai_agents` | **Present** | `AiAgent` (kind, guardrails, human-review flag, data scope) |
| `ai_prompts` | **Present** | `AiPrompt` (version, approval, testing notes) |
| `ai_tools` | Missing | — |
| `ai_agent_tools` | Missing | — |
| `ai_decisions` | Partial | `AiInteraction` (append-only audit), `AiReviewDecision` |
| `ai_reviews` | Partial | `AiReviewDecision` |

Three of seven requested tables already exist and must not be recreated.

### Phase 10 — Autonomous Enterprise Operating System
| Requested table | Status | Existing equivalent |
| --- | --- | --- |
| `enterprise_portfolios` | Missing | `BusinessProject` is project-level |
| `enterprise_programs` | Missing | — |
| `enterprise_objectives` | Missing | `Goal` is **participant**-scoped, `StaffGoal` is worker-scoped |
| `enterprise_benefits` | Missing | — |
| `enterprise_capabilities` | Missing | — |
| `enterprise_maturity_assessments` | Missing | Maturity exists only as prose in static blueprint data |

The strategy chain is a stated requirement in the existing phase register but has no records.

---

## 3. Conflict register

Each conflict must be resolved before the phase that touches it. None has been changed.

**C1 — Phase numbering collides with an existing owner-directed register (blocking).**
`src/lib/enterprisePhases.js` already defines a 12-phase register (owner direction, 15 November 2026)
where Phase 5 is Operational Governance, 6 Board & Strategy, 7 Clinical Governance, 8 Commercial
Governance, 9 Enterprise Intelligence, 10 AI Governance, 11 Accreditation, 12 Enterprise Digital
Twin. This request numbers Phases 5–10 as Decision Intelligence, Autonomous Compliance, Graph &
Twin, Automation Fabric, AI Workforce, Autonomous Enterprise. Reusing ids 5–10 would silently
rewrite an accepted governance register and every dependency that references it.
Proposal: leave `ENTERPRISE_PHASES` untouched and record this work as a separate **Capability
Track** (C5–C10) with an explicit mapping to the register phases.

**C2 — Duplicate-schema hazard on `ai_models`, `ai_agents`, `ai_prompts`.**
All three exist. Creating them again, or a second "AI workforce" register, would split the AI
inventory across two stores and break `AiGovernanceRecord`, `agentRuntime` and the AI audit trail.
Proposal: extend only the true gaps (`ai_tools`, `ai_agent_tools`); never duplicate.

**C3 — `KnowledgeLink` versus `graph_relationships`.**
A working, tenant-scoped relationship store is in use by Knowledge Graph, V8000 Fabric, governance
and tenant classification. A parallel relationship table would fork the graph.
Proposal: keep `KnowledgeLink` authoritative; add graph node/ontology/taxonomy records only if a
real feature needs them, and by reference, not by copy.

**C4 — `WorkflowEvent` is not an event registry.**
`WorkflowEvent` records step transitions for one run, is append-only and service-role-only. An event
catalogue (event types, producers, schemas, subscriptions) is a different concern. Overloading it
would corrupt workflow audit history.
Proposal: new event-catalogue records with a distinct name; leave `WorkflowEvent` unchanged.

**C5 — Two recommendation stores.**
A new `decision_recommendations` alongside `AiRecommendation` would give the same concept two homes
and two review queues. Proposal: one recommendation store with an explicit source, referenced by
decisions.

**C6 — `Goal` cannot serve enterprise objectives.**
`Goal` is participant plan data (`participant_name`, `admin_approved`, progress against a support
goal) and carries participant-scoped RLS. Enterprise objectives are tenant-level and would leak
plan data or corrupt RLS. Proposal: separate enterprise records; no reuse.

**C7 — Deliverables 2–6 and 19–24 target a stack this application does not run on.**
The runtime is React + Vite with the Base44 backend (entities, backend functions, workflows), not
PostgreSQL migrations, Prisma, NestJS, Next.js, Terraform or AKS. Those artifacts can be produced
as reference design documents, but they would not deploy, would not be executed by this app, and
would immediately drift from the real data model. Proposal: map each to its native equivalent
(entities as the schema of record, entity RLS as the row-level policy layer, backend function
contracts as the API surface, platform hosting as the deployment model) and ship only the ones that
describe something real here.

**C8 — Write authority and tenant isolation.**
Existing computed-result entities are service-role-only on create/update/delete and scoped by
`data.tenant_id === user.data.tenant_id`. New decision, assessment, graph, event, AI-tool and
portfolio records must follow the same pattern; client-side writes for computed outcomes would be
a security regression.

**C9 — Truthfulness of "autonomous".**
Phase 6 and Phase 10 name autonomy. Today V8000 computes readiness in memory with no persistence
and no schedule, so no autonomy claim is supportable yet. Any autonomy feature needs a persisted
run record plus a real scheduled workflow, and status labels must stay literal until then.

**C10 — Preserved surfaces.**
Routes in `src/App.jsx`, `moduleDirectory.js` keys, branding tokens, tenant RLS and the 68 workflow
definitions are treated as fixed. New capability pages must be added, not substituted.

---

## 4. Proposed build order (one checkpoint per step)

Each step: entity schema with tenant RLS → backend authorisation → audit evidence → a page showing
real counts only → checkpoint, then stop for review.

| Step | Capability | Real gap closed | Depends on |
| --- | --- | --- | --- |
| C5 | Decision Intelligence ✅ | Decision register with evidence links, approvals, outcome target vs actual | C1, C5, C6 |
| C6 | Autonomous Compliance Operations ✅ | Persisted assessment runs and control-test results, feeding existing findings | C5, C9 |
| C7 | Graph & Digital Twin ✅ | Indexed, ontology-validated graph registry; versioned twin models, scenarios and simulation runs over the existing registers | C3 |
| C8 | Automation Fabric | Event catalogue, subscriptions, integration messages beside Workflow Studio | C4, C7 |
| C9 | AI Workforce | Tool register and agent-to-tool grants over the existing AI registers | C2 |
| C10 | Autonomous Enterprise | Portfolio → program → objective → benefit → capability → maturity chain | C6, C1 |

---

## 5. Phase 0 baseline, and what C5–C7 changed since

Phase 0 itself changed no entity, function, workflow, route, permission, style or data record, and
deployed nothing. Since then C5, C6 and C7 each added their own records, one server-authorised
function, one module and its audit writes, as recorded in §4 and in `MASTER_TODO.md`. No existing
module, route, entity or role was removed or replaced by any of the three steps.

Named checkpoints, one per step: C5 Decision Intelligence, C6 Autonomous Compliance Operations,
**C7 — Knowledge Graph & Digital Twin OS**.
