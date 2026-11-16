# Phase 11 acceptance log — 16 November 2026

Scope: the first implementation slice requested in `implementation-handoff.md`, applied to this
app (`6ac9f91f0d82b1f80ec6a25f`) instead of a reference package. Everything below was executed
against the live Base44 deployment of this app, not a fixture.

## Verified on this app

| # | Handoff requirement | How it is met | Evidence |
|---|---|---|---|
| 1 | Map the studio to existing entities and functions; preserve routes and IDs | Extended `WorkflowDefinition` / `WorkflowInstance`; added `WorkflowVersion` and `WorkflowEvent`; kept `/workflows`, `Workflow Studio` page, entity IDs and the tenant-scoped `workflowRuntime` function | 113 node tests and 144 Deno tests pass; every entity is classified exactly once and carries the business lock (`node scripts/tenant-rls.mjs` reports 0 entities to lock) |
| 2 | Restorable checkpoint before mutation | The slice changed four files plus two new entity schemas, all additive; nothing existing was deleted | Restore point available from the editor version history for this conversation |
| 3 | Authenticated, tenant-scoped draft; exact immutable version; content hash; edits invalidate validation; unsupported handlers refused before publication | `save` writes a tenant-stamped draft and clears `validated_hash`; `validate` stores the hash of the exact graph; `publish` requires `validated_hash === content_hash`, writes a `WorkflowVersion` snapshot and refuses any node type without a verified handler | Live run: create → Draft; validate → Validated; publish with a `NOTIFICATION` node → 422 naming the handler; edit after publication → 409 immutable; one version row recorded |
| 4 | Independent publication authority, then one complete START → TASK → APPROVAL → EVIDENCE_VALIDATION → END path, with evidence and human authority checked before advancing | Publisher identity is recorded against the author (`publisher_independent`); self-publication requires a recorded note; step completion is checked against the node's assigned role, with administrator overrides recorded as such; the evidence step refuses to pass with no evidence | Live run: publish without a note on own work → 422; with note → Published, `publisher_independent=false`; full path completed with `approval_count=1`; validation step blocked with "Evidence must be recorded before this step can pass validation." |
| 5 | Idempotent commands and append-only facts; leave execution blocked where the platform cannot guarantee the protocol | Every start/act/escalate carries a command key; a repeated key returns the recorded result, including after the run closed; every transition appends a `WorkflowEvent`; a transition whose event cannot be written rolls the run back and is refused | Live run: repeated act key while open → `deduplicated=true`; repeated key after completion → `deduplicated=true`; new key on a closed run → 409; 10 events recorded in order for one run |
| 6 | Exercise duplicate starts, conflicting retries, missing evidence, cancellation and archive guards | See above, plus archive refused while a run is open and allowed afterwards; rejection is terminal and cancels the run with a reason | Live run: duplicate start → `deduplicated=true`; archive with an open run → 409; reject with reason → Cancelled; archive after close → Archived |

## Deliberately still blocked, and why

- **No transactional persistence.** Base44 persistence has no cross-entity transaction, so a
  command writes the run and then its event, and compensates by restoring the previous run state
  when the event fails. This is supervised, single-writer execution, not the atomic
  command/event/outbox protocol the handoff asks for as a precondition for unattended starts.
  Unattended/automated starts therefore remain unavailable.
- **No scheduler.** SLA state is calculated when a run is read. No breach event is emitted, no
  reminder is sent, and no claim of historical SLA compliance is made (the analytics keep
  `slaCompliance: null`).
- **No notification, AI, webhook, sub-workflow or register-lookup adapters.** These node types
  are refused at publication rather than recorded as if they ran.
- **No MFA step-up and no board quorum.** Approvals record the person, role, authority used and
  whether they approved a step they completed themselves; independence is recorded, not enforced.
- **No evidence file storage or hash verification.** Evidence is counted as an event in the run.
  Linking to the Document Vault and hashing actual files is a separate integration.
- **Ten templates were re-pointed** from adapter nodes (notification, AI risk score, standard
  check, SLA check) to the equivalent human steps so they are honestly publishable; the
  underlying capability gap is unchanged and named on the studio page.

## Reproduce

```
node scripts/tenant-rls.mjs      # 0 entities to lock
npm test                         # 113 pass
npm run test:deno                # 144 pass, incl. tests/deno/workflowEngine.test.ts
npx vite build                   # clean
```
