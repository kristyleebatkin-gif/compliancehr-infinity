/**
 * C8 — Enterprise Automation Fabric: the pure rules the fabric runs on.
 *
 * Everything here is a pure function so it can be tested without a database. The service in
 * `base44/functions/automationFabric/entry.ts` holds the records and calls these rules; nothing
 * here touches the SDK, and nothing here starts a workflow (that is the Workflow Studio runtime's
 * job, called through `workflowLauncher.ts`).
 *
 * Two promises this module keeps:
 *   1. A payload that fails its event's schema is refused before anything is routed.
 *   2. Anything that looks like a secret is replaced before a record is written, and the field
 *      names that were replaced are kept so a reader can see what was withheld.
 */

export const FABRIC_VERSION = 'c8-1.0.0';

export const MAX_PAYLOAD_BYTES = 64 * 1024;
export const MAX_EVENT_KEY = 120;
export const MAX_ATTEMPTS_LIMIT = 10;
export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_RATE_LIMIT = 60;
export const BACKOFF_BASE_SECONDS = 30;
export const BACKOFF_CEILING_SECONDS = 3600;
export const MAX_FLOW_STEPS = 20;
export const REDACTED = '[redacted]';

export const EVENT_CATEGORIES = ['Compliance', 'Workforce', 'Incident', 'Risk', 'Finance', 'Governance', 'Integration', 'System'];

export const SENSITIVITIES = ['Public', 'Internal', 'Confidential', 'Restricted'];

/** Field types a payload contract may declare. */
export const FIELD_TYPES = ['string', 'number', 'boolean', 'object', 'array'];

/**
 * Step kinds the fabric can genuinely perform. A flow that asks for a wait, an AI call, an HTTP
 * request or a sub-flow is refused at validation, exactly as Workflow Studio refuses node types
 * that have no verified handler. Declaring an action the app cannot perform would make a green
 * flow a false assurance.
 */
export const FLOW_STEP_KINDS = ['Route to workflow', 'Record only', 'Stop'];

export const RULE_ACTIONS = ['Route to workflow', 'Route to flow', 'Record only', 'Suppress'];

export const CONDITION_OPS = ['equals', 'not_equals', 'contains', 'exists', 'in', 'gt', 'gte', 'lt', 'lte'];

export const CONNECTOR_KINDS = ['Webhook', 'Message queue', 'HTTP API', 'Email', 'SMS', 'Workflow'];

export const MESSAGE_STATES = ['Queued', 'Delivered', 'Retrying', 'Failed', 'Dead letter', 'Suppressed', 'Replayed'];

export const TERMINAL_STATES = ['Delivered', 'Dead letter', 'Suppressed'];

/** The seeded event catalogue: real register activity this app can route today. */
export const EVENT_CATALOGUE = [
  {
    event_key: 'incident.created',
    name: 'Incident reported',
    category: 'Incident',
    domain: 'Incidents, Risk & Safety',
    source_module: '/incidents',
    sensitivity: 'Restricted',
    description: 'A new incident record was lodged and needs routing to the response workflow.',
    fields: [
      { name: 'incident_id', type: 'string', required: true },
      { name: 'severity', type: 'string', required: true },
      { name: 'category', type: 'string', required: false },
      { name: 'reported_at', type: 'string', required: false },
    ],
  },
  {
    event_key: 'risk.created',
    name: 'Risk raised',
    category: 'Risk',
    domain: 'Incidents, Risk & Safety',
    source_module: '/risks',
    sensitivity: 'Internal',
    description: 'A risk was added to a register and may need a treatment approval path.',
    fields: [
      { name: 'risk_id', type: 'string', required: true },
      { name: 'rating', type: 'string', required: false },
      { name: 'owner', type: 'string', required: false },
    ],
  },
  {
    event_key: 'compliance.evidence.expired',
    name: 'Evidence expired',
    category: 'Compliance',
    domain: 'Compliance, Quality & Documents',
    source_module: '/evidence',
    sensitivity: 'Internal',
    description: 'Evidence passed its expiry date, leaving a control uncovered.',
    fields: [
      { name: 'evidence_id', type: 'string', required: true },
      { name: 'standard_code', type: 'string', required: false },
      { name: 'expired_on', type: 'string', required: false },
    ],
  },
  {
    event_key: 'workflow.completed',
    name: 'Workflow completed',
    category: 'Governance',
    domain: 'Workflow Studio',
    source_module: '/workflows',
    sensitivity: 'Internal',
    description: 'A Workflow Studio run reached its end step.',
    fields: [
      { name: 'instance_id', type: 'string', required: true },
      { name: 'definition_code', type: 'string', required: false },
      { name: 'completed_at', type: 'string', required: false },
    ],
  },
  {
    event_key: 'workforce.credential.expiring',
    name: 'Staff credential expiring',
    category: 'Workforce',
    domain: 'Workforce & Training',
    source_module: '/certificates',
    sensitivity: 'Confidential',
    description: 'A screening or credential record is approaching expiry.',
    fields: [
      { name: 'staff_id', type: 'string', required: true },
      { name: 'credential', type: 'string', required: true },
      { name: 'expires_on', type: 'string', required: false },
    ],
  },
  {
    event_key: 'finance.invoice.approved',
    name: 'Invoice approved',
    category: 'Finance',
    domain: 'Finance',
    source_module: '/invoicing',
    sensitivity: 'Confidential',
    description: 'An invoice passed its approval step and may be queued for release.',
    fields: [
      { name: 'invoice_id', type: 'string', required: true },
      { name: 'amount', type: 'number', required: false },
      { name: 'approved_by', type: 'string', required: false },
    ],
  },
  {
    event_key: 'governance.decision.recorded',
    name: 'Decision recorded',
    category: 'Governance',
    domain: 'Decision Intelligence',
    source_module: '/decision-intelligence',
    sensitivity: 'Internal',
    description: 'A governed decision was approved and needs its follow-up routed.',
    fields: [
      { name: 'decision_id', type: 'string', required: true },
      { name: 'decision_type', type: 'string', required: false },
    ],
  },
  {
    event_key: 'integration.message.received',
    name: 'Integration message received',
    category: 'Integration',
    domain: 'Enterprise Automation',
    source_module: '/automation-fabric',
    sensitivity: 'Internal',
    description: 'An upstream system delivered a message into this business.',
    fields: [
      { name: 'source', type: 'string', required: true },
      { name: 'external_id', type: 'string', required: false },
    ],
  },
];

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

const bytesOf = (value: unknown) => {
  try {
    return new TextEncoder().encode(JSON.stringify(value ?? {})).length;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
};

/* ------------------------------------------------------------------ event contract */

/** Reads a stored contract into `{ name, type, required }` fields, refusing anything malformed. */
export function normaliseFields(value: unknown): { ok: boolean; fields: { name: string; type: string; required: boolean }[]; error: string } {
  const raw = parseJson(value, []);
  const list = Array.isArray(raw) ? raw : [];
  const fields: { name: string; type: string; required: boolean }[] = [];
  const seen = new Set<string>();
  for (const item of list) {
    const name = String((item as any)?.name ?? '').trim();
    const type = String((item as any)?.type ?? 'string').trim();
    if (!/^[a-z][a-z0-9_]{0,48}$/.test(name)) return { ok: false, fields: [], error: `"${name || 'unnamed'}" is not a usable field name. Use lower_snake_case.` };
    if (seen.has(name)) return { ok: false, fields: [], error: `The field "${name}" is declared twice.` };
    if (!FIELD_TYPES.includes(type)) return { ok: false, fields: [], error: `"${name}" declares the unknown type "${type}".` };
    seen.add(name);
    fields.push({ name, type, required: Boolean((item as any)?.required) });
  }
  if (!fields.length) return { ok: false, fields: [], error: 'A payload contract needs at least one field.' };
  return { ok: true, fields, error: '' };
}

/**
 * Validates a payload against its event contract. Unknown fields are allowed (integrations evolve)
 * but reported, so a reader can see the event carried more than the contract promised.
 */
export function validateEventPayload(fieldsInput: unknown, payloadInput: unknown) {
  const contract = normaliseFields(fieldsInput);
  if (!contract.ok) return { ok: false, errors: [contract.error], unknownFields: [], value: null };
  if (!isPlainObject(payloadInput)) return { ok: false, errors: ['The payload must be an object of named fields.'], unknownFields: [], value: null };
  const size = bytesOf(payloadInput);
  if (size > MAX_PAYLOAD_BYTES) {
    return { ok: false, errors: [`The payload is ${size} bytes; an event may carry at most ${MAX_PAYLOAD_BYTES}.`], unknownFields: [], value: null };
  }

  const errors: string[] = [];
  const declared = new Set(contract.fields.map((field) => field.name));
  const unknownFields = Object.keys(payloadInput).filter((key) => !declared.has(key)).slice(0, 50);

  for (const field of contract.fields) {
    const has = Object.prototype.hasOwnProperty.call(payloadInput, field.name);
    if (!has || payloadInput[field.name] === null || payloadInput[field.name] === undefined) {
      if (field.required) errors.push(`"${field.name}" is required by this event.`);
      continue;
    }
    const value = payloadInput[field.name];
    const actual = Array.isArray(value) ? 'array' : typeof value;
    if (field.type === 'number' && !Number.isFinite(Number(value))) errors.push(`"${field.name}" must be a number.`);
    else if (field.type === 'object' && !isPlainObject(value)) errors.push(`"${field.name}" must be an object.`);
    else if (field.type === 'array' && !Array.isArray(value)) errors.push(`"${field.name}" must be a list.`);
    else if (['string', 'boolean'].includes(field.type) && actual !== field.type) errors.push(`"${field.name}" must be a ${field.type}.`);
    else if (field.type === 'string' && !String(value).trim()) errors.push(`"${field.name}" cannot be empty.`);
  }

  return { ok: errors.length === 0, errors, unknownFields, value: errors.length ? null : payloadInput };
}

/* ------------------------------------------------------------------ secret redaction */

/** Field names whose value is never stored, whatever the event says. */
export const SECRET_KEY_PATTERN = /(pass(word|phrase)?|secret|token|api[-_]?key|authorization|auth[-_]?header|credential|private[-_]?key|cookie|session[-_]?id|bearer|client[-_]?secret|signature|webhook[-_]?url|dsn|connection[-_]?string)/i;

/** Value shapes that are redacted even under an innocent field name. */
export const SECRET_VALUE_PATTERNS = [
  /\bBearer\s+[A-Za-z0-9._\-]{8,}/i,
  /\bsk_(live|test)_[A-Za-z0-9]{8,}/i,
  /\bAKIA[0-9A-Z]{12,}\b/,
  /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/,
  /https?:\/\/[^\s"']*[?&](token|key|signature|sig|password)=[^\s"'&]+/i,
  /\b(ghp|gho|glpat|xox[baprs])[-_][A-Za-z0-9_-]{10,}/i,
];

export const looksLikeSecretValue = (value: string) => SECRET_VALUE_PATTERNS.some((pattern) => pattern.test(value));

/**
 * Replaces every secret-looking key and value, returning the safe copy plus the paths withheld.
 * The original payload is never returned from this function, so a caller cannot accidentally
 * store it.
 */
export function redactPayload(payloadInput: unknown, options: { force?: boolean } = {}) {
  const paths: string[] = [];
  const walk = (value: any, path: string, depth: number): any => {
    if (depth > 8) return REDACTED;
    if (Array.isArray(value)) return value.slice(0, 200).map((item, index) => walk(item, `${path}[${index}]`, depth + 1));
    if (isPlainObject(value)) {
      const out: Record<string, any> = {};
      for (const [key, item] of Object.entries(value)) {
        const childPath = path ? `${path}.${key}` : key;
        if (options.force || SECRET_KEY_PATTERN.test(key)) {
          paths.push(childPath);
          out[key] = REDACTED;
          continue;
        }
        if (typeof item === 'string' && looksLikeSecretValue(item)) {
          paths.push(childPath);
          out[key] = REDACTED;
          continue;
        }
        if (typeof item === 'string' && item.length > 4000) {
          paths.push(childPath);
          out[key] = REDACTED;
          continue;
        }
        out[key] = walk(item, childPath, depth + 1);
      }
      return out;
    }
    if (typeof value === 'function' || typeof value === 'symbol') return null;
    return value;
  };
  const safe = walk(payloadInput ?? {}, '', 0);
  const unique = [...new Set(paths)].sort();
  return { payload: safe, redactedFields: unique, redactedCount: unique.length };
}

/** Removes anything secret-looking from a free-text failure reason before it is stored. */
export function sanitiseReason(input: unknown, limit = 500) {
  let text = String(input ?? '').replace(/\s+/g, ' ').trim();
  for (const pattern of SECRET_VALUE_PATTERNS) text = text.replace(new RegExp(pattern.source, 'gi'), REDACTED);
  text = text.replace(/((?:token|secret|password|api[-_]?key|authorization)\s*[=:]\s*)\S+/gi, `$1${REDACTED}`);
  return text.slice(0, limit);
}

/* ------------------------------------------------------------------ hashing and idempotency */

export function canonicalJson(value: any): string {
  const sort = (item: any): any => {
    if (Array.isArray(item)) return item.map(sort);
    if (isPlainObject(item)) return Object.fromEntries(Object.keys(item).sort().map((key) => [key, sort(item[key])]));
    return item;
  };
  return JSON.stringify(sort(value ?? {}));
}

function fnvHex(text: string) {
  // Documented fallback for a runtime without Web Crypto. Not used where SHA-256 is available.
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= BigInt(text.charCodeAt(index));
    hash = (hash * prime) & mask;
  }
  return `fnv1a64:${hash.toString(16).padStart(16, '0')}`;
}

export async function hashText(text: string): Promise<string> {
  const subtle = (globalThis as any)?.crypto?.subtle;
  if (!subtle) return fnvHex(text);
  const digest = await subtle.digest('SHA-256', new TextEncoder().encode(text));
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

/**
 * One key per business, event and source. The business is part of the key, so two businesses
 * publishing the same upstream event can never collide or see each other's delivery.
 */
export async function idempotencyKey(input: { tenantId: string; eventKey: string; sourceRef?: string; occurredAt?: string }) {
  const tenantId = String(input.tenantId ?? '').trim();
  const eventKey = String(input.eventKey ?? '').trim();
  const sourceRef = String(input.sourceRef ?? '').trim();
  const occurredAt = String(input.occurredAt ?? '').trim();
  if (!tenantId || !eventKey) throw new Error('An idempotency key needs the business and the event.');
  return hashText(canonicalJson({ tenantId, eventKey, sourceRef, occurredAt }));
}

export function messageRef(now = new Date()) {
  const stamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const noise = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `MSG-${stamp}-${noise}`;
}

/* ------------------------------------------------------------------ conditions and rules */

export function validateConditions(input: unknown) {
  const raw = parseJson(input, []);
  if (!Array.isArray(raw)) return { ok: false, conditions: [], error: 'Conditions must be a list.' };
  if (raw.length > 20) return { ok: false, conditions: [], error: 'A rule may hold at most 20 conditions.' };
  const conditions: any[] = [];
  for (const item of raw) {
    const field = String((item as any)?.field ?? '').trim();
    const op = String((item as any)?.op ?? 'equals').trim();
    if (!field) return { ok: false, conditions: [], error: 'Every condition needs a field.' };
    if (!CONDITION_OPS.includes(op)) return { ok: false, conditions: [], error: `"${op}" is not a supported condition (${CONDITION_OPS.join(', ')}).` };
    conditions.push({ field, op, value: (item as any)?.value ?? '' });
  }
  return { ok: true, conditions, error: '' };
}

const valueAt = (payload: any, path: string) => {
  if (!path) return undefined;
  return path.split('.').reduce((current: any, part: string) => {
    if (current === null || current === undefined) return undefined;
    const key = part.replace(/\[(\d+)\]/g, '.$1');
    return key.split('.').reduce((inner: any, step: string) => (inner === null || inner === undefined ? undefined : inner[step]), current);
  }, payload);
};

function conditionPasses(condition: any, payload: any) {
  const actual = valueAt(payload, condition.field);
  const expected = condition.value;
  switch (condition.op) {
    case 'exists':
      return expected === false ? actual === undefined : actual !== undefined && actual !== null && actual !== '';
    case 'equals':
      return String(actual ?? '') === String(expected ?? '');
    case 'not_equals':
      return String(actual ?? '') !== String(expected ?? '');
    case 'contains':
      return String(actual ?? '').toLowerCase().includes(String(expected ?? '').toLowerCase());
    case 'in':
      return (Array.isArray(expected) ? expected : String(expected ?? '').split(',').map((v) => v.trim()))
        .map((v) => String(v)).includes(String(actual ?? ''));
    case 'gt': return Number(actual) > Number(expected);
    case 'gte': return Number(actual) >= Number(expected);
    case 'lt': return Number(actual) < Number(expected);
    case 'lte': return Number(actual) <= Number(expected);
    default: return false;
  }
}

/** True when every condition passes for this payload. Used by rules and by subscription filters. */
export function conditionsPass(conditionsInput: unknown, payload: any) {
  const parsed = validateConditions(conditionsInput);
  if (!parsed.ok) return false;
  return parsed.conditions.every((condition: any) => conditionPasses(condition, payload));
}

/**
 * Chooses the single rule that owns an event. Lower priority numbers win; among equals the rule
 * created first wins, and the tie is broken by record id so the outcome is stable across reads.
 * Only one rule can ever claim an event, so an event is never routed twice by two rules.
 */
export function evaluateRules(rules: any[], event: { eventKey: string; payload: any; today?: string }) {
  const today = event.today || new Date().toISOString().slice(0, 10);
  const candidates = (Array.isArray(rules) ? rules : [])
    .filter((rule) => rule && rule.status === 'Active' && rule.event_type_key === event.eventKey)
    .filter((rule) => !rule.effective_from || rule.effective_from <= today)
    .sort((left, right) => {
      const byPriority = Number(left.priority ?? 100) - Number(right.priority ?? 100);
      if (byPriority !== 0) return byPriority;
      const byCreated = String(left.created_date ?? '').localeCompare(String(right.created_date ?? ''));
      if (byCreated !== 0) return byCreated;
      return String(left.id ?? '').localeCompare(String(right.id ?? ''));
    });
  for (const rule of candidates) {
    const parsed = validateConditions(rule.conditions_json);
    const conditions = parsed.ok ? parsed.conditions : [];
    if (conditions.every((condition: any) => conditionPasses(condition, event.payload))) return rule;
  }
  return null;
}

/* ------------------------------------------------------------------ retries, backoff, limits */

export function backoffSeconds(attempt: number, base = BACKOFF_BASE_SECONDS, ceiling = BACKOFF_CEILING_SECONDS) {
  const number = Math.max(1, Math.floor(Number(attempt) || 1));
  return Math.min(ceiling, Math.max(1, Math.round(base)) * 2 ** (number - 1));
}

export function nextAttemptAt(attempt: number, now = new Date()) {
  return new Date(now.getTime() + backoffSeconds(attempt) * 1000).toISOString();
}

/** What a failed attempt becomes: a retry with a delay, or a dead letter that needs a person. */
export function nextDeliveryState(input: { delivered: boolean; attempt: number; maxAttempts: number }) {
  const attempt = Math.max(1, Math.floor(Number(input.attempt) || 1));
  const maxAttempts = Math.min(MAX_ATTEMPTS_LIMIT, Math.max(1, Math.floor(Number(input.maxAttempts) || DEFAULT_MAX_ATTEMPTS)));
  if (input.delivered) return { status: 'Delivered', outcome: 'Delivered', retry: false, exhausted: false };
  if (attempt >= maxAttempts) return { status: 'Dead letter', outcome: 'Dead letter', retry: false, exhausted: true };
  return { status: 'Retrying', outcome: 'Retrying', retry: true, exhausted: false };
}

/** Counts attempts inside the last minute; refuses the next one when the connector is saturated. */
export function rateLimitState(input: { attempts: string[]; limitPerMinute?: number; now?: Date; windowMs?: number }) {
  const limit = Math.max(1, Math.floor(Number(input.limitPerMinute) || DEFAULT_RATE_LIMIT));
  const now = input.now || new Date();
  const windowMs = input.windowMs || 60000;
  const recent = (Array.isArray(input.attempts) ? input.attempts : [])
    .map((value) => new Date(value).getTime())
    .filter((time) => Number.isFinite(time) && now.getTime() - time < windowMs);
  const used = recent.length;
  const oldest = recent.length ? Math.min(...recent) : now.getTime();
  return {
    allowed: used < limit,
    used,
    limit,
    remaining: Math.max(0, limit - used),
    retryAfterSeconds: used < limit ? 0 : Math.max(1, Math.ceil((windowMs - (now.getTime() - oldest)) / 1000)),
  };
}

/* ------------------------------------------------------------------ flows */

export function validateFlowSteps(input: unknown, workflowIds: string[] = []) {
  const raw = parseJson(input, []);
  if (!Array.isArray(raw)) return { ok: false, steps: [], errors: ['The flow steps must be a list.'] };
  if (!raw.length) return { ok: false, steps: [], errors: ['A flow needs at least one step.'] };
  if (raw.length > MAX_FLOW_STEPS) return { ok: false, steps: [], errors: [`A flow may hold at most ${MAX_FLOW_STEPS} steps.`] };
  const errors: string[] = [];
  const steps: any[] = [];
  const seen = new Set<string>();
  raw.forEach((item, index) => {
    const id = String((item as any)?.id ?? `step-${index + 1}`).trim().slice(0, 60);
    const kind = String((item as any)?.kind ?? '').trim();
    if (seen.has(id)) errors.push(`Step id "${id}" is used twice.`);
    seen.add(id);
    if (!FLOW_STEP_KINDS.includes(kind)) {
      errors.push(`Step ${index + 1} asks for "${kind || 'nothing'}", which this fabric cannot perform. Supported: ${FLOW_STEP_KINDS.join(', ')}.`);
      return;
    }
    const target = String((item as any)?.workflow_definition_id ?? '').trim();
    if (kind === 'Route to workflow') {
      if (!target) errors.push(`Step ${index + 1} routes to a workflow but names none.`);
      else if (workflowIds.length && !workflowIds.includes(target)) errors.push(`Step ${index + 1} routes to a workflow that is not in this business.`);
    }
    steps.push({
      id,
      kind,
      workflow_definition_id: kind === 'Route to workflow' ? target : '',
      workflow_definition_name: kind === 'Route to workflow' ? String((item as any)?.workflow_definition_name ?? '').trim().slice(0, 160) : '',
      note: String((item as any)?.note ?? '').trim().slice(0, 300),
    });
  });
  if (!steps.some((step) => step.kind === 'Route to workflow') && !steps.some((step) => step.kind === 'Record only')) {
    errors.push('A flow needs at least one step that routes to a workflow or records the event.');
  }
  return { ok: errors.length === 0, steps, errors };
}

export async function flowContentHash(steps: unknown) {
  return hashText(canonicalJson(parseJson(steps, [])));
}

/* ------------------------------------------------------------------ connector credentials */

/**
 * A connector holds the NAME of a secret, never the secret. This refuses anything that looks like
 * a credential pasted into the reference field, so a raw key can never reach a record.
 */
export function credentialRefProblem(input: unknown): string {
  const ref = String(input ?? '').trim();
  if (!ref) return '';
  if (!/^secret:\/\/[A-Z][A-Z0-9_]{1,63}$/.test(ref)) {
    return 'A credential reference must look like secret://SLACK_WEBHOOK_URL: the name of a secret the app already holds. Paste the secret into app secrets, not here.';
  }
  if (looksLikeSecretValue(ref) || ref.length > 80 || /\s/.test(ref)) {
    return 'That reference looks like a raw credential. Store the value as an app secret and reference it by name.';
  }
  return '';
}

export function endpointProblem(input: unknown): string {
  const label = String(input ?? '').trim();
  if (!label) return 'Describe where messages go.';
  if (looksLikeSecretValue(label)) return 'The endpoint carries a credential. Remove it from the address and use a secret reference instead.';
  return '';
}

/* ------------------------------------------------------------------ display helpers */

/** Small, safe projection of a stored message for a table. The payload is already redacted. */
export function messageSummary(row: any) {
  if (!row || typeof row !== 'object') return null;
  return {
    id: row.id,
    message_ref: row.message_ref,
    trace_id: row.trace_id,
    event_key: row.event_key,
    event_type_name: row.event_type_name,
    status: row.status,
    direction: row.direction,
    attempts: Number(row.attempts ?? 0),
    max_attempts: Number(row.max_attempts ?? 0),
    redacted_count: Number(row.redacted_count ?? 0),
    delivered_at: row.delivered_at || '',
    next_attempt_at: row.next_attempt_at || '',
    last_error: row.last_error || '',
    workflow_definition_name: row.workflow_definition_name || '',
    workflow_definition_version: row.workflow_definition_version ?? null,
    workflow_instance_id: row.workflow_instance_id || '',
    rule_name: row.rule_name || '',
    subscription_name: row.subscription_name || '',
    connector_name: row.connector_name || '',
    created_date: row.created_date || '',
    replay_of_id: row.replay_of_id || '',
  };
}