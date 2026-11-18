# C9 — Autonomous AI Workforce OS

Design reference and delivery record for Capability Track C9. This file holds the C9 material that
would otherwise have pushed `PHASE5_10_REFERENCE_ARCHITECTURE.md` past a readable length, in the same
way `PHASE5_10_C8_REFERENCE.md` holds C8. Everything in §1 and §2 runs today; §3 states the
boundaries; §4 states what is deliberately not built.

---

## 1. What runs today

**Records (eight, all tenant-scoped, all `__service_role_only__` on create, update and delete).**

| Record | Holds | Notable fields |
| --- | --- | --- |
| `AiWorkforceModel` | A provider deployment as registered by a person | `provider`, `provider_model_id`, `credential_ref`, `sensitivity_ceiling`, `status`, `validated_at` |
| `AiPromptVersion` | One immutable version of a prompt | `prompt_key` (shared by every version), `version`, `body_hash`, `status`, `published_by`, `publisher_independent` |
| `AiTool` | One capability the workforce could use | `kind`, `risk_level`, `autonomous_allowed`, `requires_human_approval`, `idempotency_supported` |
| `AiWorkforceAgent` | An agent definition | `model_id`, `prompt_id`, `prompt_version`, `prompt_hash`, `autonomy_level`, `risk_tier`, `status` |
| `AiAgentToolAssignment` | One agent's permission to use one tool | `policy`, `requires_human_approval`, `idempotency_required`, `least_privilege_note`, `review_due` |
| `AiDecisionRecord` | One proposal as recorded | `policy_verdict`, `status`, `execution_state`, `redacted_count`, `idempotency_key`, `correlation_id` |
| `AiDecisionReview` | One person's outcome on a proposal | `outcome`, `reason`, `override_reason`, `conditions`, `reviewer_id`, `independent` |
| `AiAuditRecord` | Append-only trail of every change | `action`, `subject_type`, `subject_ref`, `outcome`, `previous_hash`, `chain_hash` |

**Service.** `base44/shared/aiWorkforce.ts` is the rule book: the policy table (tool kind × request →
`Denied` / `Propose only` / `Allowed with approval` / `Allowed internal`), the redaction list, the
human-review guardrail phrase a publishable prompt must contain, the status transitions, and the
"may this person review this proposal" rule. The backend function `aiWorkforce` is the only writer,
and it scopes every read and write by the caller's `tenant_id`.

**Actions on the function.** `list`, `saveModel`, `validateModel`, `savePrompt`, `publishPrompt`,
`saveTool`, `saveAgent`, `setAgentStatus`, `saveAssignment`, `submitDecision`, `reviewDecision`,
`auditTrail`. Every write emits an `AiAuditRecord` and an `AuditLog` entry.

**Module.** `/ai-workforce`, seven tabs: decisions (the review queue), agents, grants, tools,
prompts, models and the audit trail, with a proposal dialog, a review dialog and a decision detail
view. Gated in `src/lib/roleMatrix.js` to Provider Administrator, Compliance Manager, Compliance
Administrator, Management, Administration, Quality & Improvement Manager, Auditor and admin.

**Tests.** `tests/deno/capabilityC9.test.ts` covers the policy table, tenancy isolation, permissions,
redaction, idempotency, the forbidden-autonomy refusal, the safe failure state and reviewer
independence.

---

## 2. Live verification (production database, then removed)

A live cycle created a model, validated it, created and published a prompt, defined a financial tool
and a low-risk read tool, registered an agent, activated it, was **refused** internal autonomy on the
financial tool, then granted that tool proposal-only and the read tool internal. It recorded two
proposals and reviewed one:

| Check | Result |
| --- | --- |
| Financial tool granted internal autonomy | Refused, with the reason printed |
| Financial proposal verdict | `Human approval required` / `Awaiting human review` / `Not executed` |
| Read-tool proposal under permitted autonomy | `Internal action permitted` / `Permitted internal` / `Recorded only` |
| Redaction on that proposal | 2 fields withheld (email address, secret-looking token) |
| Review by the person who recorded the proposal | Refused: a person cannot review their own proposal |
| Proposal recorded after the agent was disabled | `Blocked` / `Safe failure` / `Refused` |

The cycle removed its nine records and fourteen audit rows. One blocked decision
(`AID-20261118025422-UKM3`, agent "C9 smoke agent") survived a cancelled cleanup run; it was deleted
on request by its exact id, after its reference, agent name and status were checked, and no other AI
record was touched. All AI workforce counts read zero afterwards. The full note is in
`PHASE5_10_INVENTORY.md`.

---

## 3. Boundaries that hold

1. **No provider call.** This module invokes no model provider. A model record holds the *name* of
   the app secret that would carry a key (`secret://OPENAI_API_KEY`); a pasted key is refused.
2. **No execution.** `execution_state` is `Not executed`, `Recorded only` or `Refused`. An approval is
   a person's authorisation to act themselves.
3. **Autonomy is bounded by tool kind.** External, financial, employment, clinical,
   participant-impacting, permission-changing, destructive and compliance-status-changing tools can
   never be granted internal autonomy, whatever the agent's autonomy level says.
4. **A person reviews, and not their own work.** A proposal recorded by one user cannot be reviewed
   by that user; the queue asks for another reviewer, and independence is recorded on the review.
5. **Refusal over silent recording.** A paused, disabled or archived agent yields `Blocked` /
   `Safe failure` / `Refused`: a record of a refusal, not a decision that happened.
6. **Redaction before storage.** Secrets, emails, phone numbers and record identifiers are withheld,
   and the count of withheld fields is stored with the proposal.

Conflict C9 was honoured by wording throughout: every label ("proposed", "permitted internal", "not
executed") states literally what happened, and no autonomy claim is made for a model, agent or
workflow that has not run.

---

## 4. Deliberately not built

- No provider call, no sampling, no token accounting, no cost ledger. The OS governs a workforce; it
  does not run one.
- No self-service agent execution from the browser: the function refuses to act on a proposal, so
  there is nothing for the UI to trigger.
- No automatic approval, no timeout that approves. A proposal that expires shows as expired and
  leaves the queue; it never becomes a decision.
- No provider SDK, key storage or streaming. If a provider call is ever added, it belongs behind its
  own bounded function with its own secret, and this module's records would supply the pinned prompt
  hash and model identifier for it.

Named checkpoint for this step: **Capability Track C9 — Autonomous AI Workforce OS**.
