/**
 * Starts one published Workflow Studio version.
 *
 * Extracted from the Workflow Studio runtime so the automation fabric can route an event into the
 * SAME engine rather than a second one. There is exactly one way a run begins in this app: this
 * function. It checks that the definition is published, that the pinned snapshot still matches its
 * hash, that the graph still validates, and that the command key has not already started a run.
 *
 * Callers pass a command key so a retried command (or a republished event) cannot open two runs.
 */
import {
  normaliseNodes,
  validateGraph,
  contentHash,
  nextNodeId,
  requiresEvidence,
  stepKind,
  dueAtFor,
} from './workflowEngine.ts';
import { appendWorkflowEvent } from './workflowEvents.ts';

function fail(message: string, status = 400): never {
  const error: any = new Error(message);
  error.status = status;
  throw error;
}

function parseJson(value: unknown): any {
  try {
    return JSON.parse(String(value ?? '[]'));
  } catch {
    fail('The stored workflow graph could not be read.', 409);
  }
}

async function pageOf(dao: any, query: any, sort: string, limit: number): Promise<any[]> {
  const page = await dao.filter(query, sort, limit, 0);
  const rows = Array.isArray(page) ? page : page?.items;
  return Array.isArray(rows) ? rows : [];
}

export type LaunchInput = {
  read: any;
  write: any;
  definitionId: string;
  commandKey?: string;
  contextLabel?: string;
  actorName: string;
  actorId?: string;
  actorRole?: string;
};

export type LaunchResult = {
  instance: any;
  deduplicated: boolean;
  definitionVersion: number;
  contentHash: string;
};

export async function launchPublishedWorkflow(input: LaunchInput): Promise<LaunchResult> {
  const { read, write, actorName } = input;
  const definitionId = String(input.definitionId ?? '').trim().slice(0, 80);
  if (!definitionId) fail('Choose a workflow first.', 400);

  const definition = await read.WorkflowDefinition.get(definitionId);
  if (!definition) fail('Workflow not found.', 404);
  if (definition.state !== 'Published') fail('Only a published workflow can start. Publish it first.', 409);

  const versions = await pageOf(read.WorkflowVersion, { definition_id: definition.id }, '-version', 1);
  const snapshot = versions[0];
  if (!snapshot) fail('The published version snapshot is missing, so this workflow cannot start.', 409);
  if (snapshot.content_hash !== definition.content_hash) {
    fail('The published snapshot no longer matches the workflow. Publish it again before starting a run.', 409);
  }

  const nodes = normaliseNodes(parseJson(snapshot.nodes_json));
  if (await contentHash(nodes) !== snapshot.content_hash) fail('The published snapshot failed its content integrity check.', 409);
  const report = validateGraph(nodes);
  if (!report.valid) fail('The published graph does not pass execution checks. Publish a corrected version.', 409);

  const commandKey = String(input.commandKey ?? '').trim().slice(0, 120);
  if (commandKey) {
    const duplicate = await pageOf(read.WorkflowInstance, { definition_id: definition.id, start_key: commandKey }, '-created_date', 1);
    if (duplicate[0]) {
      return { instance: duplicate[0], deduplicated: true, definitionVersion: Number(duplicate[0].definition_version), contentHash: String(duplicate[0].content_hash || '') };
    }
  }

  const startNode = nodes.find((node) => node.type === 'START');
  const first = nodes.find((node) => node.id === nextNodeId(startNode, 'approve'));
  if (!first) fail('The published graph has no first step after the start.', 409);

  const now = new Date();
  const at = now.toISOString();
  const fallbackHours = Number(definition.sla_hours) || 72;
  const closesImmediately = first.type === 'END';
  const base = {
    node_id: 'start', label: startNode?.label || 'Started', type: 'START', at, by: actorName, outcome: 'Started', note: '',
  };

  const instance = await write.WorkflowInstance.create({
    definition_id: definition.id,
    definition_code: definition.code,
    definition_name: definition.name,
    definition_version: snapshot.version,
    version_id: snapshot.id,
    content_hash: snapshot.content_hash,
    start_key: commandKey,
    workflow_type: definition.workflow_type,
    domain: definition.domain,
    state: closesImmediately ? 'Completed' : 'Running',
    current_node_id: closesImmediately ? '' : first.id,
    current_node_label: closesImmediately ? '' : first.label,
    current_node_type: closesImmediately ? '' : first.type,
    current_step: 1,
    task_kind: closesImmediately ? '' : stepKind(first),
    task_label: closesImmediately ? '' : first.label,
    task_role: closesImmediately ? '' : first.role,
    assigned_role: first.role || definition.owner_role || '',
    context_label: String(input.contextLabel ?? '').trim().slice(0, 200),
    priority: 'Medium',
    sla_hours: Number(first.sla_hours) || fallbackHours,
    due_at: closesImmediately ? '' : dueAtFor(first, now, fallbackHours),
    sla_state: closesImmediately ? 'Closed' : 'On track',
    evidence_required: closesImmediately ? false : requiresEvidence(first),
    evidence_count: 0,
    approval_count: 0,
    started_at: at,
    started_by: actorName,
    completed_at: closesImmediately ? at : '',
    last_action_by: actorName,
    last_action_at: at,
    last_action_note: 'Run started',
    steps_json: JSON.stringify([
      base,
      { node_id: first.id, label: first.label, type: first.type, at, by: actorName, outcome: closesImmediately ? 'Workflow completed' : 'Opened', note: '' },
    ]),
  });

  await appendWorkflowEvent(read, write, {
    instance_id: instance.id, definition_id: definition.id, definition_version: snapshot.version,
    event_type: 'Started', node_id: 'start', node_label: base.label, node_type: 'START',
    outcome: 'Started', actor_id: String(input.actorId ?? ''), actor_name: actorName,
    actor_role: String(input.actorRole ?? 'Automation fabric'), authority: 'System', command_key: commandKey,
  });
  if (!closesImmediately) {
    await appendWorkflowEvent(read, write, {
      instance_id: instance.id, definition_id: definition.id, definition_version: snapshot.version,
      event_type: 'StepOpened', node_id: first.id, node_label: first.label, node_type: first.type,
      outcome: 'Opened', actor_id: String(input.actorId ?? ''), actor_name: actorName,
      actor_role: String(input.actorRole ?? 'Automation fabric'), authority: 'System',
    });
  }

  return {
    instance,
    deduplicated: false,
    definitionVersion: Number(snapshot.version),
    contentHash: String(snapshot.content_hash),
  };
}