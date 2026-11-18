/**
 * C9 — Autonomous AI Workforce OS: the pure governance rules.
 *
 * Everything here is pure so it can be tested without a database. The service in
 * `base44/functions/aiWorkforce/entry.ts` holds the records and calls these rules.
 *
 * The promises this module keeps, and that the module refuses to break:
 *   1. The OS never performs an action on anyone's behalf. It records a proposal, decides whether
 *      policy would permit it, and routes it to a human. `executionState` is never "executed".
 *   2. External, financial, employment, clinical, participant-impacting, permission-changing,
 *      destructive and compliance-status-changing actions can never be granted
 *      autonomy, whatever a screen sends.
 *   3. Secrets and participant/staff identifiers are removed before anything is stored or shown.
 *   4. A reviewer cannot approve their own AI proposal.
 */
import { canonicalJson, hashText, looksLikeSecretValue, SECRET_VALUE_PATTERNS } from './automationFabric.ts';

export const AI_WORKFORCE_VERSION = 'c9-1.0.0';
export const REDACTED = '[redacted]';
export const MIN_CONFIDENCE_FOR_AUTONOMY = 50;
export const MIN_REASON_LENGTH = 10;
export const MAX_PROMPT_LENGTH = 20000;
export const MAX_SUMMARY_LENGTH = 4000;

/** Providers are named for the record only. No provider is called by this module. */
export const PROVIDERS = ['OpenAI', 'Anthropic', 'Google', 'Azure OpenAI', 'Internal', 'Other'];

export const MODEL_STATUSES = ['Registered', 'Validated', 'Retired'];
export const SENSITIVITY_LEVELS = ['Public', 'Internal', 'Confidential', 'Restricted'];

export const AUTONOMY_LEVELS = ['Suggest only', 'Internal actions permitted'];
export const AGENT_STATUSES = ['Draft', 'Active', 'Paused', 'Disabled', 'Archived'];
export const AGENT_RISK_TIERS = ['Low', 'Medium', 'High', 'Critical'];

export const PROMPT_STATUSES = ['Draft', 'Validated', 'Published', 'Retired'];

/**
 * Every tool kind, with the risk it carries. The risk is a property of the kind, not something a
 * screen can set, so a tool cannot be labelled low risk by whoever created it.
 */
export const TOOL_KIND_RISK: Record<string, string> = {
  'Read internal record': 'Low',
  'Write internal record': 'Medium',
  'Send message': 'Medium',
  'External API': 'High',
  Financial: 'High',
  Employment: 'High',
  Clinical: 'High',
  'Participant impacting': 'High',
  'Permission change': 'Critical',
  Destructive: 'Critical',
  'Compliance status change': 'Critical',
};

export const TOOL_KINDS = Object.keys(TOOL_KIND_RISK);

/** Kinds an agent may ever carry out without a person deciding first. Nothing else qualifies. */
export const AUTONOMOUS_ELIGIBLE_KINDS = ['Read internal record', 'Write internal record'];

/** The kinds the brief forbids outright, kept explicit so the refusal can quote them. */
export const FORBIDDEN_AUTONOMOUS_KINDS = [
  'External API', 'Financial', 'Employment', 'Clinical', 'Participant impacting',
  'Permission change', 'Destructive', 'Compliance status change',
];

export const ASSIGNMENT_POLICIES = ['Denied', 'Propose only', 'Allowed with approval', 'Allowed internal'];

export const POLICY_VERDICTS = ['Blocked', 'Human approval required', 'Internal action permitted'];

export const DECISION_STATES = [
  'Awaiting human review', 'Permitted internal', 'Approved', 'Rejected', 'Overridden', 'Blocked',
  'Safe failure', 'Expired',
];

/** The only states a review can settle. Blocked and safe-failure decisions are not reviewable. */
export const REVIEWABLE_DECISION_STATES = ['Awaiting human review'];
export const REVIEW_OUTCOMES = ['Approved', 'Rejected', 'Overridden'];
export const EXECUTION_STATES = ['Not executed', 'Recorded only', 'Refused'];

export const parseJson = (value: unknown, fallback: any = null) => {
  if (value && typeof value === 'object') return value;
  try {
    const parsed = JSON.parse(String(value ?? ''));
    return parsed === undefined ? fallback : parsed;
  } catch {
    return fallback;
  }
};

const isPlainObject = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/* ------------------------------------------------------------------ settings validation */

export function riskOfKind(kind: unknown): string {
  return TOOL_KIND_RISK[String(kind ?? '')] || 'Critical';
}

export function autonomousEligible(kind: unknown): boolean {
  return AUTONOMOUS_ELIGIBLE_KINDS.includes(String(kind ?? ''));
}

export function providerProblem(provider: unknown): string {
  const value = String(provider ?? '').trim();
  if (!value) return 'Choose the provider this model belongs to.';
  if (!PROVIDERS.includes(value)) return `"${value}" is not a provider this app records (${PROVIDERS.join(', ')}).`;
  return '';
}

/**
 * A model record holds the NAME of an app secret, never the secret itself. A pasted key is
 * refused here, so a credential can never reach a record or a log line.
 */
export function credentialReferenceProblem(input: unknown): string {
  const ref = String(input ?? '').trim();
  if (!ref) return 'Name the app secret that holds this provider credential, e.g. secret://OPENAI_API_KEY.';
  if (!/^secret:\/\/[A-Z][A-Z0-9_]{1,63}$/.test(ref)) {
    return 'A credential reference must look like secret://OPENAI_API_KEY: the name of a secret the app holds. Paste the key into app secrets, not here.';
  }
  if (looksLikeSecretValue(ref) || /\s/.test(ref) || ref.length > 80) {
    return 'That reference looks like a raw credential. Store the value as an app secret and reference it by name.';
  }
  return '';
}

/** Model and provider settings are checked together, so an unusable model cannot be validated. */
export function validateModelSettings(input: any) {
  const errors: string[] = [];
  const provider = String(input?.provider ?? '').trim();
  const providerMessage = providerProblem(provider);
  if (providerMessage) errors.push(providerMessage);

  const providerModelId = String(input?.provider_model_id ?? '').trim();
  if (!providerModelId) errors.push('Record the provider model identifier this deployment uses.');
  else if (providerModelId.length > 120) errors.push('Keep the provider model identifier under 120 characters.');
  else if (looksLikeSecretValue(providerModelId)) errors.push('The model identifier looks like a credential.');

  const credentialMessage = credentialReferenceProblem(input?.credential_ref);
  if (credentialMessage) errors.push(credentialMessage);

  const contextWindow = Number(input?.context_window);
  if (!Number.isFinite(contextWindow) || contextWindow < 1000 || contextWindow > 10000000) {
    errors.push('Context window must be a number between 1,000 and 10,000,000 tokens.');
  }

  const ceiling = String(input?.sensitivity_ceiling ?? 'Internal');
  if (!SENSITIVITY_LEVELS.includes(ceiling)) errors.push('Choose a sensitivity ceiling from the list.');

  return {
    ok: errors.length === 0,
    errors,
    value: errors.length ? null : {
      provider,
      provider_model_id: providerModelId,
      credential_ref: String(input?.credential_ref ?? '').trim(),
      context_window: Math.round(contextWindow),
      sensitivity_ceiling: ceiling,
    },
  };
}

/* ------------------------------------------------------------------ prompt guardrails */

/**
 * A prompt is the instruction the model runs on, so it carries the guardrail itself: what to
 * produce, that the output is a recommendation, and that a person approves it before anyone acts.
 */
export function promptGuardrailProblem(body: unknown): string {
  const text = String(body ?? '');
  if (!text.trim()) return 'Write the prompt before saving this version.';
  if (text.trim().length < 40) return 'The prompt is too short to carry an instruction and its human-review guardrail.';
  if (text.length > MAX_PROMPT_LENGTH) return `Keep the prompt under ${MAX_PROMPT_LENGTH} characters.`;
  if (looksLikeSecretValue(text) || SECRET_VALUE_PATTERNS.some((pattern) => pattern.test(text))) {
    return 'The prompt appears to contain a credential. Credentials belong in app secrets, never in a prompt.';
  }
  if (!/\b(recommend|suggest|draft|propose|advis)/i.test(text)) {
    return 'The prompt must say that its output is a recommendation or draft, not a decision.';
  }
  if (!/\b(human|reviewer|person|manager)\b/i.test(text) || !/approv/i.test(text)) {
    return 'The prompt must state that a person reviews and approves the output before anyone acts on it.';
  }
  return '';
}

export function normaliseVariables(input: unknown) {
  const raw = parseJson(input, []);
  const list = Array.isArray(raw) ? raw : [];
  const seen = new Set<string>();
  const variables: string[] = [];
  for (const item of list) {
    const name = String(item ?? '').trim().toLowerCase();
    if (!name) continue;
    if (!/^[a-z][a-z0-9_]{0,40}$/.test(name)) return { ok: false, variables: [], error: `"${name}" is not a usable variable name. Use lower_snake_case.` };
    if (seen.has(name)) continue;
    seen.add(name);
    variables.push(name);
  }
  return { ok: true, variables, error: '' };
}

/** Tool policy: a grant may never widen what the kind of tool allows. */
export function validateToolPolicy(input: { kind?: unknown; policy?: unknown; idempotency_supported?: unknown }) {
  const kind = String(input?.kind ?? '');
  const policy = String(input?.policy ?? '');
  const errors: string[] = [];
  if (!TOOL_KINDS.includes(kind)) errors.push('Choose a tool kind from the list.');
  if (!ASSIGNMENT_POLICIES.includes(policy)) errors.push('Choose a policy from the list.');

  const risk = riskOfKind(kind);
  const eligible = autonomousEligible(kind);
  if (policy === 'Allowed internal' && !eligible) {
    errors.push(`${kind || 'That kind of tool'} can never be granted internal autonomy. External, financial, employment, clinical, participant-impacting, permission-changing, destructive and compliance-status-changing actions always need a person.`);
  }
  if (policy === 'Allowed internal' && kind === 'Write internal record' && !input?.idempotency_supported) {
    errors.push('An internal write needs a tool that supports idempotency before it can be granted autonomy.');
  }

  return {
    ok: errors.length === 0,
    errors,
    risk_level: risk,
    // A refused grant can never reduce what a person has to approve.
    autonomous_allowed: errors.length === 0 && eligible && policy === 'Allowed internal',
    requires_human_approval: errors.length > 0 ? true : policy !== 'Allowed internal',
  };
}

/* ------------------------------------------------------------------ the policy decision */

export type PolicyDecision = {
  verdict: string;
  status: string;
  executionState: string;
  allowedAutonomously: boolean;
  reason: string;
};

const blocked = (reason: string, status = 'Blocked'): PolicyDecision => ({
  verdict: 'Blocked', status, executionState: 'Refused', allowedAutonomously: false, reason,
});

const needsHuman = (reason: string): PolicyDecision => ({
  verdict: 'Human approval required', status: 'Awaiting human review', executionState: 'Not executed',
  allowedAutonomously: false, reason,
});

/**
 * The single place that decides whether a proposal may proceed. There is no branch here that
 * returns an executed state: the OS records, it never acts.
 */
export function decidePolicy(input: {
  agentStatus?: unknown;
  autonomyLevel?: unknown;
  assignment?: any;
  toolKind?: unknown;
  idempotencyKey?: unknown;
  confidence?: unknown;
  minConfidence?: number;
}): PolicyDecision {
  const agentStatus = String(input?.agentStatus ?? '');
  if (agentStatus !== 'Active') {
    return blocked(`The agent is ${agentStatus ? agentStatus.toLowerCase() : 'not active'}, so nothing it produced can proceed.`, 'Safe failure');
  }

  const assignment = input?.assignment;
  if (!assignment) return blocked('No tool policy grants this agent this tool, so the proposal is refused.');

  const kind = String(input?.toolKind ?? assignment.tool_kind ?? '');
  const risk = riskOfKind(kind);

  if (assignment.status !== 'Active') return blocked('The tool grant for this agent is disabled.');
  if (assignment.policy === 'Denied') return blocked(`${kind || 'This tool'} is denied to this agent by its own grant.`);
  if (!TOOL_KINDS.includes(kind)) return blocked('That tool kind is not one this OS recognises.');

  if (assignment.policy === 'Propose only') {
    return needsHuman(`${kind} is a ${risk.toLowerCase()}-risk action. The grant allows a proposal only, so a person must decide.`);
  }

  if (!autonomousEligible(kind)) {
    return needsHuman(`${kind} can never be performed autonomously. A person must decide, and the OS will not perform it either.`);
  }

  if (String(input?.autonomyLevel ?? '') !== 'Internal actions permitted') {
    return needsHuman('The agent is set to suggest only, so every outcome waits for a person.');
  }
  if (assignment.policy !== 'Allowed internal') {
    return needsHuman('The tool grant requires human approval for this tool.');
  }
  if (assignment.idempotency_required && !String(input?.idempotencyKey ?? '').trim()) {
    return needsHuman('A repeated internal action needs an idempotency key before it can be permitted.');
  }

  const confidence = Number(input?.confidence ?? 0);
  const floor = Number.isFinite(Number(input?.minConfidence)) ? Number(input?.minConfidence) : MIN_CONFIDENCE_FOR_AUTONOMY;
  if (Number.isFinite(confidence) && confidence < floor) {
    return needsHuman(`Confidence ${Math.round(confidence)}% is below the ${floor}% threshold for an internal step.`);
  }

  return {
    verdict: 'Internal action permitted',
    status: 'Permitted internal',
    executionState: 'Recorded only',
    allowedAutonomously: true,
    reason: `${kind} is a low-risk internal step permitted by an explicit per-tool grant. The OS records it and performs nothing.`,
  };
}

/* ------------------------------------------------------------------ human review */

/**
 * A review settles an awaiting decision. It refuses a self-review, an unknowable outcome, a bare
 * reason, and an override without its own reason. An approval never means the AI acted: the record
 * keeps `execution_state` at "not executed", because a person carries it out.
 */
export function reviewTransition(input: {
  decision?: any;
  outcome?: unknown;
  reason?: unknown;
  overrideReason?: unknown;
  reviewerName?: unknown;
  reviewerId?: unknown;
  reviewerRole?: unknown;
  now?: string;
}) {
  const errors: string[] = [];
  const decision = input?.decision;
  const outcome = String(input?.outcome ?? '');
  const reason = String(input?.reason ?? '').trim();
  const overrideReason = String(input?.overrideReason ?? '').trim();

  if (!decision) errors.push('That decision is not in your business.');
  else if (!REVIEWABLE_DECISION_STATES.includes(String(decision.status))) {
    errors.push(`This decision is ${String(decision.status).toLowerCase()}, so it cannot be reviewed again.`);
  }
  if (!REVIEW_OUTCOMES.includes(outcome)) errors.push('Choose approved, rejected or overridden.');
  if (reason.length < MIN_REASON_LENGTH) errors.push(`Give a review reason of at least ${MIN_REASON_LENGTH} characters. The reason is the audit record.`);
  if (outcome === 'Overridden' && overrideReason.length < MIN_REASON_LENGTH) {
    errors.push('An override needs its own reason, separate from the review note.');
  }
  if (decision && input?.reviewerId && decision.requested_by_id && String(input.reviewerId) === String(decision.requested_by_id)) {
    errors.push('A person cannot review their own AI proposal. Ask another reviewer.');
  }

  const now = input?.now || new Date().toISOString();
  return {
    ok: errors.length === 0,
    errors,
    patch: errors.length ? null : {
      status: outcome,
      review_outcome: outcome,
      reviewed_by: String(input?.reviewerName ?? '').slice(0, 160),
      reviewed_by_id: String(input?.reviewerId ?? ''),
      reviewed_at: now,
      override_reason: outcome === 'Overridden' ? overrideReason.slice(0, 2000) : '',
      execution_state: 'Not executed',
    },
  };
}

/* ------------------------------------------------------------------ redaction */

/**
 * Keys or values that never travel into a record, a log line or a screen: credentials, and the
 * identifiers that would make a participant or staff member recognisable.
 */
export const SENSITIVE_KEY_PATTERN = /(pass(word|phrase)?|secret|token|api[-_]?key|authorization|auth[-_]?header|credential|private[-_]?key|cookie|session[-_]?id|bearer|client[-_]?secret|signature|webhook[-_]?url|dsn|connection[-_]?string|participant|staff[-_]?_?name|employee[-_]?_?name|surname|diagnos|medical|medication|date[-_]?of[-_]?birth|dob|home[-_]?address|email|phone|mobile|medicare|ndis[-_]?number|bank|bsb|account[-_]?number)/i;

export const PII_VALUE_PATTERNS = [
  /[\w.+-]+@[\w-]+\.[\w.-]+/g,
  /(?:\+?61|0)4\d{2}[\s-]?\d{3}[\s-]?\d{3}/g,
  /\b\d{3}[\s-]?\d{3}[\s-]?\d{3}\b/g,
];

export const looksSensitive = (value: string) =>
  looksLikeSecretValue(value) || PII_VALUE_PATTERNS.some((pattern) => new RegExp(pattern.source).test(value));

/** Free text kept for a reader: secrets and identifiers masked, length bounded. */
export function redactText(input: unknown, limit = MAX_SUMMARY_LENGTH) {
  let text = String(input ?? '');
  const redactions: string[] = [];
  for (const pattern of SECRET_VALUE_PATTERNS) {
    const next = text.replace(new RegExp(pattern.source, 'gi'), REDACTED);
    if (next !== text) redactions.push('credential');
    text = next;
  }
  for (const pattern of PII_VALUE_PATTERNS) {
    const next = text.replace(new RegExp(pattern.source, 'g'), REDACTED);
    if (next !== text) redactions.push('identifier');
    text = next;
  }
  text = text.replace(/((?:token|secret|password|api[-_]?key|authorization)\s*[=:]\s*)\S+/gi, `$1${REDACTED}`);
  return { text: text.replace(/\s+/g, ' ').trim().slice(0, limit), redactions: [...new Set(redactions)] };
}

/** A record projected for storage: sensitive keys dropped, sensitive values masked. */
export function redactRecord(input: unknown) {
  const paths: string[] = [];
  const walk = (value: any, path: string, depth: number): any => {
    if (depth > 6) return REDACTED;
    if (Array.isArray(value)) return value.slice(0, 100).map((item, index) => walk(item, `${path}[${index}]`, depth + 1));
    if (isPlainObject(value)) {
      const out: Record<string, any> = {};
      for (const [key, item] of Object.entries(value)) {
        const child = path ? `${path}.${key}` : key;
        if (SENSITIVE_KEY_PATTERN.test(key)) { paths.push(child); out[key] = REDACTED; continue; }
        if (typeof item === 'string' && looksSensitive(item)) { paths.push(child); out[key] = REDACTED; continue; }
        if (typeof item === 'string' && item.length > MAX_SUMMARY_LENGTH) { paths.push(child); out[key] = REDACTED; continue; }
        out[key] = walk(item, child, depth + 1);
      }
      return out;
    }
    if (typeof value === 'function' || typeof value === 'symbol') return null;
    return value;
  };
  const safe = walk(input ?? {}, '', 0);
  const unique = [...new Set(paths)].sort();
  return { value: safe, redactedFields: unique, redactedCount: unique.length };
}

/* ------------------------------------------------------------------ audit chain */

export function auditRef(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `AIA-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function decisionRef(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `AID-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export function reviewRef(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return `AIR-${stamp}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

/** Each audit record is chained to the one before it, so a removed entry is visible. */
export async function chainHash(previous: unknown, entry: unknown) {
  return hashText(canonicalJson({ previous: String(previous ?? ''), entry: entry ?? {} }));
}

export function confidenceBand(confidence: unknown) {
  const value = Number(confidence);
  if (!Number.isFinite(value)) return 'Not stated';
  if (value >= 85) return 'High';
  if (value >= MIN_CONFIDENCE_FOR_AUTONOMY) return 'Moderate';
  return 'Low';
}

/** What a table or drawer may show. The stored payload stays out of the projection. */
export function decisionSummary(row: any) {
  if (!row || typeof row !== 'object') return null;
  return {
    id: row.id,
    decision_ref: row.decision_ref,
    agent_name: row.agent_name || '',
    agent_key: row.agent_key || '',
    autonomy_level: row.autonomy_level || '',
    tool_name: row.tool_name || '',
    tool_kind: row.tool_kind || '',
    tool_risk_level: row.tool_risk_level || '',
    model_name: row.model_name || '',
    model_version: row.model_version ?? null,
    prompt_version: row.prompt_version ?? null,
    action_title: row.action_title || '',
    action_summary: row.action_summary || '',
    confidence: Number(row.confidence ?? 0),
    confidence_band: row.confidence_band || confidenceBand(row.confidence),
    policy_verdict: row.policy_verdict || '',
    policy_reason: row.policy_reason || '',
    status: row.status || '',
    execution_state: row.execution_state || '',
    redacted_count: Number(row.redacted_count ?? 0),
    correlation_id: row.correlation_id || '',
    workflow_definition_name: row.workflow_definition_name || '',
    workflow_instance_id: row.workflow_instance_id || '',
    requested_by: row.requested_by || '',
    reviewed_by: row.reviewed_by || '',
    reviewed_at: row.reviewed_at || '',
    review_outcome: row.review_outcome || '',
    override_reason: row.override_reason || '',
    created_date: row.created_date || '',
  };
}