// Phase 11 first implementation slice: the pure rules the Workflow Studio run on.
//
// Supported here means "this runtime genuinely performs it": a person completes the
// step, or the engine checks something it can see in its own records. Everything else
// (notifications, waits, AI, API calls, webhooks, sub-workflows, register lookups)
// needs an adapter that does not exist yet, so publication refuses it rather than
// letting a run claim work that never happened.

export type StudioNode = {
  id: string;
  type: string;
  label: string;
  role: string;
  next: string;
  yes_next: string;
  no_next: string;
  sla_hours: number;
  instruction: string;
};

export const STRUCTURE_HANDLERS = ['START', 'END', 'DECISION'];

export const APPROVAL_HANDLERS = ['APPROVAL', 'CEO_APPROVAL', 'EXECUTIVE_APPROVAL', 'BOARD_APPROVAL', 'AUDIT_SIGNOFF'];

export const HUMAN_HANDLERS = [
  'TASK',
  'FORM',
  'COMPLIANCE_REVIEW',
  'AUDIT_REVIEW',
  'FINDING_REVIEW',
  'CORRECTIVE_ACTION',
  'AUDIT_SIGNOFF',
  'EVIDENCE_REQUEST',
  'EVIDENCE_UPLOAD',
  'DOCUMENT_REQUEST',
  'ESCALATION',
  'APPROVAL',
  'CEO_APPROVAL',
  'EXECUTIVE_APPROVAL',
  'BOARD_APPROVAL',
];

export const ENGINE_HANDLERS = ['EVIDENCE_VALIDATION'];

export const SUPPORTED_HANDLERS = [...STRUCTURE_HANDLERS, ...HUMAN_HANDLERS, ...ENGINE_HANDLERS];

export const CLOSED_INSTANCE_STATES = ['Completed', 'Failed', 'Cancelled'];

export const OPEN_INSTANCE_STATES = ['Running', 'Waiting', 'Paused', 'Escalated'];

export const MAX_NODES = 120;

/** Reads a stored or submitted graph into a known shape, refusing anything malformed. */
export function normaliseNodes(value: unknown): StudioNode[] {
  const list = Array.isArray(value) ? value : [];
  if (list.length > MAX_NODES) throw new Error(`A graph can hold up to ${MAX_NODES} steps.`);
  const seen = new Set<string>();
  return list.map((raw) => {
    const item = raw as any;
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('Every step must be a step object.');
    const id = String(item.id ?? '').trim().slice(0, 80);
    if (!id) throw new Error('Every step needs an id.');
    if (seen.has(id)) throw new Error(`Step id "${id}" is used twice.`);
    seen.add(id);
    const type = String(item.type ?? '').trim().toUpperCase().slice(0, 40);
    if (!type) throw new Error(`Step "${id}" needs a type.`);
    const hours = Number(item.sla_hours ?? 0);
    return {
      id,
      type,
      label: String(item.label ?? '').trim().slice(0, 160) || id,
      role: String(item.role ?? '').trim().slice(0, 80),
      next: String(item.next ?? '').trim().slice(0, 80),
      yes_next: String(item.yes_next ?? '').trim().slice(0, 80),
      no_next: String(item.no_next ?? '').trim().slice(0, 80),
      sla_hours: Number.isFinite(hours) && hours >= 0 ? Math.min(hours, 8760) : 0,
      instruction: String(item.instruction ?? '').trim().slice(0, 2000),
    };
  });
}

export function unsupportedHandlers(nodes: StudioNode[]): string[] {
  const unknown = new Set<string>();
  for (const node of nodes) if (!SUPPORTED_HANDLERS.includes(node.type)) unknown.add(node.type);
  return [...unknown].sort();
}

export function validateGraph(nodes: StudioNode[]): { valid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  if (!nodes.length) return { valid: false, errors: ['A workflow needs at least one step.'], warnings };

  const ids = new Set(nodes.map((node) => node.id));
  const unknown = unsupportedHandlers(nodes);
  if (unknown.length) {
    errors.push(`These step types have no verified runtime handler yet: ${unknown.join(', ')}.`);
  }

  const starts = nodes.filter((node) => node.type === 'START');
  const ends = nodes.filter((node) => node.type === 'END');
  if (starts.length !== 1) errors.push(`A workflow needs exactly one start step (found ${starts.length}).`);
  if (!ends.length) errors.push('A workflow needs an end step.');

  for (const node of nodes) {
    if (node.type === 'END') continue;
    if (node.type === 'DECISION') {
      if (!node.yes_next || !node.no_next) errors.push(`Decision "${node.label}" needs both an approve and a reject route.`);
      for (const route of [node.yes_next, node.no_next]) {
        if (route && !ids.has(route)) errors.push(`Decision "${node.label}" routes to a step that does not exist.`);
      }
      continue;
    }
    if (!node.next) errors.push(`"${node.label}" has no next step.`);
    else if (!ids.has(node.next)) errors.push(`"${node.label}" routes to a step that does not exist.`);
  }

  const reachable = new Set<string>();
  const start = starts[0];
  if (start) {
    const queue = [start.id];
    while (queue.length) {
      const currentId = queue.shift() as string;
      if (reachable.has(currentId)) continue;
      reachable.add(currentId);
      const current = nodes.find((node) => node.id === currentId);
      if (!current) continue;
      for (const route of [current.next, current.yes_next, current.no_next]) if (route) queue.push(route);
    }
    for (const node of nodes) if (!reachable.has(node.id)) warnings.push(`"${node.label}" cannot be reached from the start step.`);
  }

  const canEnd = new Set(ends.map((node) => node.id));
  let changed = true;
  while (changed) {
    changed = false;
    for (const node of nodes) {
      const routes = node.type === 'DECISION' ? [node.yes_next, node.no_next] : [node.next];
      if (!canEnd.has(node.id) && routes.some((route) => canEnd.has(route))) {
        canEnd.add(node.id);
        changed = true;
      }
    }
  }
  for (const node of nodes) {
    if (reachable.has(node.id) && !canEnd.has(node.id)) errors.push(`"${node.label}" has no route to an end step.`);
    if (HUMAN_HANDLERS.includes(node.type) && !node.role) warnings.push(`"${node.label}" has no assigned role, so only an administrator can complete it.`);
  }
  if (!nodes.some((node) => HUMAN_HANDLERS.includes(node.type))) errors.push('A workflow needs at least one step a person completes.');

  return { valid: errors.length === 0, errors, warnings };
}

/** Deterministic JSON: the same graph always produces the same hash. */
export function canonicalGraph(nodes: StudioNode[]): string {
  const sortValue = (value: any): any => {
    if (Array.isArray(value)) return value.map(sortValue);
    if (value && typeof value === 'object') {
      return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key])]));
    }
    return value;
  };
  return JSON.stringify(sortValue(nodes));
}

function fnvHex(text: string): string {
  let hash = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  const mask = 0xffffffffffffffffn;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= BigInt(text.charCodeAt(index));
    hash = (hash * prime) & mask;
  }
  return `fnv1a64:${hash.toString(16).padStart(16, '0')}`;
}

/** SHA-256 of the canonical graph, with a documented fallback where Web Crypto is absent. */
export async function contentHash(nodes: StudioNode[]): Promise<string> {
  const text = canonicalGraph(nodes);
  const subtle = (globalThis as any)?.crypto?.subtle;
  if (!subtle) return fnvHex(text);
  const bytes = new TextEncoder().encode(text);
  const digest = await subtle.digest('SHA-256', bytes);
  return `sha256:${[...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')}`;
}

export function nextNodeId(node: StudioNode | undefined, outcome: 'approve' | 'reject'): string {
  if (!node) return '';
  if (node.type === 'DECISION') return outcome === 'reject' ? node.no_next : node.yes_next;
  return node.next;
}

export function requiresEvidence(node: StudioNode | undefined): boolean {
  return node?.type === 'EVIDENCE_VALIDATION';
}

export function isApprovalNode(node: StudioNode | undefined): boolean {
  return Boolean(node && APPROVAL_HANDLERS.includes(node.type));
}

export function stepKind(node: StudioNode | undefined): string {
  if (!node || node.type === 'END') return 'Closed';
  if (APPROVAL_HANDLERS.includes(node.type)) return 'Approval';
  if (node.type === 'EVIDENCE_VALIDATION') return 'Evidence validation';
  if (node.type === 'DECISION') return 'Decision';
  return 'Task';
}

/** Who may complete this step. Administrators are recorded as an override, never silently. */
export function canActOnNode(node: StudioNode | undefined, actor: any): { allowed: boolean; override: boolean; reason?: string } {
  if (!node) return { allowed: false, override: false, reason: 'This step is no longer part of the pinned version.' };
  const role = String(actor?.role ?? '').trim();
  if (role === 'admin') return { allowed: true, override: true };
  const required = node.role;
  if (!required) return role === 'Provider Administrator' ? { allowed: true, override: true } : { allowed: false, override: false, reason: 'This step has no assigned role. An administrator must assign or supervise it.' };
  if (role.toLowerCase() === required.toLowerCase()) return { allowed: true, override: false };
  if (role === 'Provider Administrator') return { allowed: true, override: true };
  return { allowed: false, override: false, reason: `This step is assigned to ${required}.` };
}

export function dueAtFor(node: StudioNode | undefined, from: Date, fallbackHours: number): string | null {
  const hours = Number(node?.sla_hours) > 0 ? Number(node?.sla_hours) : Number(fallbackHours || 0);
  if (!Number.isFinite(hours) || hours <= 0) return null;
  return new Date(from.getTime() + hours * 3600000).toISOString();
}

export function slaStateFor(dueAt: string | null | undefined, state: string, now = new Date()): string {
  if (CLOSED_INSTANCE_STATES.includes(state)) return 'Closed';
  if (!dueAt) return 'On track';
  const due = new Date(dueAt).getTime();
  if (!Number.isFinite(due)) return 'On track';
  const hoursLeft = (due - now.getTime()) / 3600000;
  if (hoursLeft <= 0) return 'Breached';
  if (hoursLeft <= 8) return 'Due soon';
  return 'On track';
}

export function nextVersion(number: unknown): number {
  const value = Number(number);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) + 1 : 1;
}