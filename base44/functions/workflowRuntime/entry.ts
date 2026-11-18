// Phase 11 Workflow Studio — first verified implementation slice.
//
// What this function really does:
//   - keeps an authenticated, business-scoped DRAFT definition
//   - validates the exact graph and stores a content hash; any edit clears it
//   - publishes an immutable VERSION snapshot, with independent-publisher recorded
//   - runs one supervised path: task, approval, evidence validation, decision, end
//   - every command carries an idempotency key; every transition appends an event
//
// What it deliberately refuses: any node type without a verified handler (notifications,
// waits, AI, API calls, webhooks, sub-workflows, register lookups). Persistence has no
// cross-entity transaction, so runs stay single-writer and each write is compensated if
// the matching event cannot be recorded. Documented in PHASE11_ACCEPTANCE_LOG.md.
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { studioTenant, studioRows } from '../../shared/workflowStudioAccess.ts';
import { appendWorkflowEvent as appendEvent } from '../../shared/workflowEvents.ts';
import { launchPublishedWorkflow } from '../../shared/workflowLauncher.ts';
import { assertWorkflowAction, readWorkflowRecords } from '../../shared/workflowSafety.ts';
import { publicationAuthority, approvalIndependence, definitionContributors } from '../../shared/workflowGovernance.ts';
import {
  normaliseNodes,
  validateGraph,
  unsupportedHandlers,
  contentHash,
  nextNodeId,
  canActOnNode,
  requiresEvidence,
  isApprovalNode,
  stepKind,
  dueAtFor,
  slaStateFor,
  nextVersion,
  OPEN_INSTANCE_STATES,
  type StudioNode,
} from '../../shared/workflowEngine.ts';

const MAX_TEXT = 500;

function fail(message: string, status = 400): never {
  const error: any = new Error(message);
  error.status = status;
  throw error;
}

function json(body: any, status = 200) {
  return Response.json(body, { status });
}

function text(value: unknown, limit = MAX_TEXT) {
  return String(value ?? '').trim().slice(0, limit);
}

function parseJson(value: unknown): any {
  try {
    return JSON.parse(String(value ?? '[]'));
  } catch {
    fail('The stored workflow graph could not be read.', 409);
  }
}

function parseSteps(value: unknown): any[] {
  try {
    const parsed = JSON.parse(String(value ?? '[]'));
    return Array.isArray(parsed) ? parsed.slice(0, 400) : [];
  } catch {
    return [];
  }
}

function actorName(user: any) {
  return text(user?.full_name || user?.email || 'Unknown user', 120);
}

async function pageOf(dao: any, query: any, sort: string, limit: number): Promise<any[]> {
  const page = await dao.filter(query, sort, limit, 0);
  const rows = Array.isArray(page) ? page : page?.items;
  return Array.isArray(rows) ? rows : [];
}

async function readDefinition(read: any, id: string) {
  const id_ = text(id, 80);
  if (!id_) fail('Choose a workflow first.', 400);
  const definition = await read.WorkflowDefinition.get(id_);
  if (!definition) fail('Workflow not found.', 404);
  return definition;
}

async function readInstance(read: any, id: string) {
  const id_ = text(id, 80);
  if (!id_) fail('Choose a run first.', 400);
  const instance = await read.WorkflowInstance.get(id_);
  if (!instance) fail('Run not found.', 404);
  return instance;
}

function graphOf(definition: any): StudioNode[] {
  return normaliseNodes(parseJson(definition?.nodes_json));
}

/* appendEvent (one append-only fact per run transition) lives in shared/workflowEvents.ts,
 * so the automation fabric records workflow facts exactly the same way this runtime does. */

/** Writes the run, then its event. If the event cannot be recorded the run is put back. */
async function commitTransition(read: any, write: any, instance: any, changes: Record<string, unknown>, event: Record<string, unknown>, previous: Record<string, unknown>) {
  const updated = await write.WorkflowInstance.update(instance.id, changes);
  try {
    await appendEvent(read, write, event);
  } catch (error) {
    try {
      await write.WorkflowInstance.update(instance.id, previous);
    } catch {
      fail('The run moved but its audit event could not be written. Stop this run and report it to your administrator.', 500);
    }
    throw error;
  }
  return updated;
}

function openStepChanges(node: StudioNode, fallbackHours: number, from: Date) {
  return {
    state: 'Running',
    current_node_id: node.id,
    current_node_label: node.label,
    current_node_type: node.type,
    task_kind: stepKind(node),
    task_label: node.label,
    task_role: node.role,
    evidence_required: requiresEvidence(node),
    due_at: dueAtFor(node, from, fallbackHours),
    sla_state: 'On track',
    sla_hours: Number(node.sla_hours) || fallbackHours,
  };
}

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me();
    const tenantId = studioTenant(user, base44.businessId);
    const read = base44.entities;
    const write = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const action = text(body.action, 40) || 'list';
    const name = actorName(user);

    if (action !== 'list') assertWorkflowAction(action);

    if (action === 'list') {
      const definitions = studioRows(
        await read.WorkflowDefinition.filter({ tenant_id: tenantId }, '-updated_date', 200, 0),
        tenantId, 200, 'definition',
      );
      const instances = studioRows(
        await read.WorkflowInstance.filter({ tenant_id: tenantId }, '-started_at', 300, 0),
        tenantId, 300, 'instance',
      );
      const now = new Date();
      return json({
        definitions: definitions.rows,
        instances: instances.rows.map((row: any) => ({ ...row, sla_state: slaStateFor(row.due_at, row.state, now) })),
        truncated: definitions.truncated || instances.truncated,
        supported_handlers: true,
        notice: 'Draft, validate and publish workflows, and run them through task, approval, evidence validation and end. Notifications, timers, AI steps, webhooks and sub-workflows remain unavailable.',
      });
    }

    if (action === 'save') {
      const nodes = normaliseNodes(parseJson(body.nodes_json));
      const hash = await contentHash(nodes);
      const fields = {
        name: text(body.name, 160) || 'Untitled workflow',
        workflow_type: text(body.workflow_type, 80) || 'Compliance Assessment',
        domain: text(body.domain, 80),
        description: text(body.description, 2000),
        nodes_json: JSON.stringify(nodes),
        sla_hours: Math.min(Math.max(Number(body.sla_hours) || 72, 1), 8760),
        owner_role: text(body.owner_role, 80),
        standard_refs: text(body.standard_refs, 500),
        evidence_refs: text(body.evidence_refs, 500),
        content_hash: hash,
      };

      if (!body.definition_id) {
        const counted = await read.WorkflowDefinition.count({});
        const total = typeof counted === 'number' ? counted : Number((counted as any)?.count) || 0;
        const created = await write.WorkflowDefinition.create({
          ...fields,
          code: text(body.code, 40) || `WF-${String(total + 1).padStart(4, '0')}`,
          state: 'Draft',
          version: 0,
          template_code: text(body.template_code, 40),
          author_ids_json: JSON.stringify([user.id]),
          author_id: user.id,
          author_name: name,
          validated_hash: '',
        });
        return json({ definition: created, content_hash: hash }, 201);
      }

      const definition = await readDefinition(read, body.definition_id);
      if (definition.state === 'Published') fail('A published workflow cannot be edited in place. Clone it to start a new version.', 409);
      if (definition.state === 'Archived') fail('An archived workflow cannot be edited. Clone it instead.', 409);
      const edited = Object.entries(fields).some(([key, value]) => String(definition[key] ?? '') !== String(value ?? '')) || Boolean(body.code && text(body.code, 40) !== definition.code);
      const updated = await write.WorkflowDefinition.update(definition.id, {
        ...fields,
        author_ids_json: JSON.stringify(definitionContributors(definition, user.id, edited)),
        code: text(body.code, 40) || definition.code,
        state: 'Draft',
        template_code: text(body.template_code, 40) || definition.template_code,
        // Any edit invalidates the earlier validation.
        validated_hash: '',
        validated_at: '',
        validated_by: '',
        author_id: definition.author_id || user.id,
        author_name: definition.author_name || name,
      });
      return json({ definition: updated, content_hash: hash });
    }

    if (action === 'validate') {
      const definition = await readDefinition(read, body.definition_id);
      if (definition.state === 'Published') fail('This workflow is already published. Clone it to change the graph.', 409);
      const nodes = graphOf(definition);
      const report = validateGraph(nodes);
      const unsupported = unsupportedHandlers(nodes);
      const hash = await contentHash(nodes);
      const pass = report.valid && !unsupported.length;
      const updated = await write.WorkflowDefinition.update(definition.id, {
        state: pass ? 'Validated' : 'Draft',
        content_hash: hash,
        validated_hash: pass ? hash : '',
        validated_at: pass ? new Date().toISOString() : '',
        validated_by: pass ? name : '',
        validation_json: JSON.stringify({ ...report, unsupported, checked_at: new Date().toISOString(), checked_by: name }),
      });
      return json({ definition: updated, report, unsupported, content_hash: hash });
    }

    if (action === 'publish') {
      if (!['admin', 'Provider Administrator', 'CEO', 'General Manager', 'Compliance Manager', 'Quality Manager'].includes(user.role)) fail('Workflow publication authority is required.', 403);
      const definition = await readDefinition(read, body.definition_id);
      if (definition.state === 'Published') fail('This workflow is already published. Clone it to publish a new version.', 409);
      if (definition.state === 'Archived') fail('An archived workflow cannot be published.', 409);

      const nodes = graphOf(definition);
      const report = validateGraph(nodes);
      const unsupported = unsupportedHandlers(nodes);
      if (unsupported.length) fail(`These step types have no verified runtime handler yet: ${unsupported.join(', ')}. Replace or remove them before publishing.`, 422);
      if (!report.valid) fail(report.errors[0] || 'This graph is not valid yet.', 422);

      const hash = await contentHash(nodes);
      if (!definition.validated_hash || definition.validated_hash !== hash) {
        fail('Validate this exact graph before publishing. Any edit since the last validation clears it.', 409);
      }

      const authorId = definition.author_id || definition.created_by_id;
      const independent = String(authorId || '') !== String(user.id);
      const publicationNote = text(body.publication_note, 500);
      const publicationError = publicationAuthority(authorId, user.id, definitionContributors(definition, user.id, false));
      if (publicationError) fail(publicationError, 403);

      const version = nextVersion(definition.version);
      const publishedAt = new Date().toISOString();
      const snapshot = await write.WorkflowVersion.create({
        definition_id: definition.id,
        definition_code: definition.code,
        definition_name: definition.name,
        version,
        content_hash: hash,
        nodes_json: JSON.stringify(nodes),
        validation_json: JSON.stringify(report),
        publisher_independent: independent,
        publication_note: publicationNote,
        published_by: name,
        published_by_id: user.id,
        published_at: publishedAt,
      });
      const updated = await write.WorkflowDefinition.update(definition.id, {
        state: 'Published',
        version,
        content_hash: hash,
        validated_hash: hash,
        published_version_id: snapshot.id,
        publisher_independent: independent,
        publication_note: publicationNote,
        published_at: publishedAt,
        published_by: name,
      });
      return json({ definition: updated, version: snapshot });
    }

    if (action === 'timeline') {
      const instance = await readInstance(read, body.instance_id);
      const steps = parseSteps(instance.steps_json).map((step) => ({
        node_id: step?.node_id || '', label: step?.label || '', type: step?.type || '',
        outcome: step?.outcome || '', by: step?.by || '', authority: step?.authority || '', at: step?.at || '',
      }));
      const events = await pageOf(read.WorkflowEvent, { instance_id: instance.id }, 'sequence', 200);
      return json({
        steps,
        events: events.map((event: any) => ({
          event_type: event.event_type, node_label: event.node_label, node_type: event.node_type,
          outcome: event.outcome, actor_name: event.actor_name, actor_role: event.actor_role,
          authority: event.authority, self_approved: Boolean(event.self_approved), occurred_at: event.occurred_at,
        })),
      });
    }

    if (action === 'versions') {
      const definition = await readDefinition(read, body.definition_id);
      const rows = await pageOf(read.WorkflowVersion, { definition_id: definition.id }, '-version', 50);
      return json({
        versions: rows.map((row: any) => ({
          id: row.id, version: row.version, content_hash: row.content_hash,
          published_by: row.published_by, published_at: row.published_at,
          publisher_independent: row.publisher_independent, publication_note: row.publication_note,
        })),
      });
    }

    if (action === 'clone') {
      const source = await readDefinition(read, body.definition_id);
      let nodes = graphOf(source);
      if (source.state === 'Published' && source.published_version_id) {
        const snapshot = await read.WorkflowVersion.get(source.published_version_id);
        if (snapshot) nodes = normaliseNodes(parseJson(snapshot.nodes_json));
      }
      const hash = await contentHash(nodes);
      const created = await write.WorkflowDefinition.create({
        code: `${source.code}-R${nextVersion(source.version)}`,
        name: text(body.name, 160) || `${source.name} (revision)`,
        workflow_type: source.workflow_type,
        domain: source.domain,
        description: source.description,
        state: 'Draft',
        version: source.version || 0,
        template_code: source.template_code,
        nodes_json: JSON.stringify(nodes),
        sla_hours: source.sla_hours,
        owner_role: source.owner_role,
        standard_refs: source.standard_refs,
        evidence_refs: source.evidence_refs,
        author_ids_json: JSON.stringify(definitionContributors(source, user.id, true)),
        author_id: user.id,
        author_name: name,
        content_hash: hash,
        validated_hash: '',
      });
      return json({ definition: created }, 201);
    }

    if (action === 'archive') {
      const definition = await readDefinition(read, body.definition_id);
      if (definition.state === 'Archived') return json({ definition });
      const open = await pageOf(read.WorkflowInstance, { definition_id: definition.id }, '-started_at', 50);
      if (open.some((row: any) => OPEN_INSTANCE_STATES.includes(row.state))) {
        fail('This workflow still has open runs. Close them before archiving.', 409);
      }
      const updated = await write.WorkflowDefinition.update(definition.id, { state: 'Archived', archived_at: new Date().toISOString() });
      return json({ definition: updated });
    }

    if (action === 'start') {
      // One launcher for every run in the app: the fabric routes events through the same call.
      const launched = await launchPublishedWorkflow({
        read,
        write,
        definitionId: text(body.definition_id, 80),
        commandKey: text(body.command_key, 120),
        contextLabel: text(body.context_label, 200),
        actorName: name,
        actorId: String(user.id || ''),
        actorRole: text(user.role, 60),
      });
      return launched.deduplicated
        ? json({ instance: launched.instance, deduplicated: true })
        : json({ instance: launched.instance }, 201);
    }

    if (action === 'act') {
      const instance = await readInstance(read, body.instance_id);

      // A retried command returns what it already recorded, even if the run has since closed.
      const commandKey = text(body.command_key, 120);
      if (commandKey) {
        const duplicate = await pageOf(read.WorkflowEvent, { instance_id: instance.id, command_key: commandKey }, '-occurred_at', 1);
        if (duplicate[0]) return json({ instance, deduplicated: true });
      }

      if (!OPEN_INSTANCE_STATES.includes(instance.state)) fail('This run is already closed.', 409);

      const snapshot = instance.version_id ? await read.WorkflowVersion.get(instance.version_id) : null;
      if (!snapshot) fail('The pinned version for this run is unavailable, so it cannot advance.', 409);
      const nodes = normaliseNodes(parseJson(snapshot.nodes_json));
      if (await contentHash(nodes) !== snapshot.content_hash || snapshot.content_hash !== instance.content_hash) fail('The pinned version failed its content integrity check.', 409);
      if (body.expected_node_id && body.expected_node_id !== instance.current_node_id) fail('This run has moved to another step. Refresh before acting.', 409);
      const node = nodes.find((item) => item.id === instance.current_node_id);
      if (!node) fail('This run is pointing at a step that is not in its pinned version.', 409);

      const authority = canActOnNode(node, user);
      if (!authority.allowed) fail(authority.reason || 'You are not authorised to complete this step.', 403);

      if (!['approve', 'reject'].includes(body.decision)) fail('Choose approve or reject explicitly.', 422);
      const decision = body.decision === 'reject' ? 'reject' : 'approve';
      if (decision === 'approve' && isApprovalNode(node)) {
        const history = await readWorkflowRecords(read.WorkflowEvent, { instance_id: instance.id });
        const independenceError = approvalIndependence(user.id, history);
        if (independenceError) fail(independenceError, 403);
      }
      const note = text(body.note, 1000);
      if (decision === 'reject' && !note) fail('A rejection needs a reason.', 422);
      if (decision === 'approve' && requiresEvidence(node) && Number(instance.evidence_count || 0) < 1) {
        fail('Evidence must be recorded before this step can pass validation.', 409);
      }

      const now = new Date();
      const at = now.toISOString();
      const steps = parseSteps(instance.steps_json);
      const previousHuman = [...steps].reverse().find((step) => step?.by && step.node_id !== 'start');
      const selfApproved = decision === 'approve' && isApprovalNode(node) && Boolean(previousHuman) && previousHuman.by === name;

      const previous = {
        state: instance.state, current_node_id: instance.current_node_id, current_node_label: instance.current_node_label,
        current_node_type: instance.current_node_type, current_step: instance.current_step, task_kind: instance.task_kind,
        task_label: instance.task_label, task_role: instance.task_role, evidence_required: instance.evidence_required,
        due_at: instance.due_at, sla_state: instance.sla_state, sla_hours: instance.sla_hours,
        evidence_count: Number(instance.evidence_count || 0), approval_count: Number(instance.approval_count || 0),
        completed_at: instance.completed_at, last_action_by: instance.last_action_by,
        last_action_at: instance.last_action_at, last_action_note: instance.last_action_note,
        escalated_at: instance.escalated_at, escalation_reason: instance.escalation_reason,
        steps_json: instance.steps_json,
      };

      const outcome = decision === 'approve'
        ? (isApprovalNode(node) ? 'Approved' : 'Completed')
        : 'Rejected';
      steps.push({ node_id: node.id, label: node.label, type: node.type, at, by: name, outcome, note, authority: authority.override ? 'Administrator override' : 'Assigned role' });

      const evidenceCount = Number(instance.evidence_count || 0) + (decision === 'approve' && ['EVIDENCE_UPLOAD', 'EVIDENCE_REQUEST'].includes(node.type) ? 1 : 0);
      const approvalCount = Number(instance.approval_count || 0) + (decision === 'approve' && isApprovalNode(node) ? 1 : 0);
      const common = {
        evidence_count: evidenceCount,
        approval_count: approvalCount,
        last_action_by: name,
        last_action_at: at,
        last_action_note: note || outcome,
        steps_json: JSON.stringify(steps),
        escalated_at: '',
        escalation_reason: '',
      };
      const eventBase = {
        instance_id: instance.id, definition_id: instance.definition_id, definition_version: instance.definition_version,
        node_id: node.id, node_label: node.label, node_type: node.type, note,
        actor_id: user.id, actor_name: name, actor_role: text(user.role, 60),
        authority: authority.override ? 'Administrator override' : 'Assigned role',
        self_approved: selfApproved, command_key: commandKey,
      };

      // A rejection on a person's own step is terminal unless the step is a decision with a rework route.
      if (decision === 'reject' && node.type !== 'DECISION') {
        const cancelled = await commitTransition(read, write, instance, {
          ...common,
          state: 'Cancelled',
          current_node_id: '', current_node_label: '', current_node_type: '',
          task_kind: '', task_label: '', task_role: '', evidence_required: false,
          due_at: '', sla_state: 'Closed', completed_at: at,
        }, { ...eventBase, event_type: 'Cancelled', outcome: 'Run cancelled', note: note || 'Step rejected' }, previous);
        return json({ instance: cancelled });
      }

      const nextId = nextNodeId(node, decision);
      const nextNode = nodes.find((item) => item.id === nextId);
      if (!nextNode) fail('The pinned graph has no next step for that outcome, so the run cannot advance.', 409);

      const evidenceEventType = ['EVIDENCE_UPLOAD', 'EVIDENCE_REQUEST'].includes(node.type) ? 'EvidenceRecorded' : null;
      const stepEventType = evidenceEventType || (isApprovalNode(node) && decision === 'approve' ? 'ApprovalRecorded' : (decision === 'reject' ? 'StepRejected' : 'StepCompleted'));
      if (stepEventType) await appendEvent(read, write, { ...eventBase, event_type: stepEventType, outcome });

      if (nextNode.type === 'END') {
        steps.push({ node_id: nextNode.id, label: nextNode.label, type: nextNode.type, at, by: name, outcome: 'Workflow completed', note: '' });
        const completed = await write.WorkflowInstance.update(instance.id, {
          ...common,
          state: 'Completed',
          current_node_id: '', current_node_label: '', current_node_type: '',
          task_kind: '', task_label: '', task_role: '', evidence_required: false,
          due_at: '', sla_state: 'Closed', completed_at: at,
          steps_json: JSON.stringify(steps),
        });
        await appendEvent(read, write, {
          instance_id: instance.id, definition_id: instance.definition_id, definition_version: instance.definition_version,
          event_type: 'Completed', node_id: nextNode.id, node_label: nextNode.label, node_type: nextNode.type,
          outcome: 'Workflow completed', actor_id: user.id, actor_name: name, actor_role: text(user.role, 60), authority: 'System',
        });
        return json({ instance: completed });
      }

      const fallbackHours = Number(instance.sla_hours) || 72;
      steps.push({ node_id: nextNode.id, label: nextNode.label, type: nextNode.type, at, by: name, outcome: 'Opened', note: '' });
      const advanced = await write.WorkflowInstance.update(instance.id, {
        ...common,
        ...openStepChanges(nextNode, fallbackHours, now),
        current_step: Number(instance.current_step || 1) + 1,
        steps_json: JSON.stringify(steps),
      });
      await appendEvent(read, write, {
        instance_id: instance.id, definition_id: instance.definition_id, definition_version: instance.definition_version,
        event_type: 'StepOpened', node_id: nextNode.id, node_label: nextNode.label, node_type: nextNode.type,
        outcome: 'Opened', actor_id: user.id, actor_name: name, actor_role: text(user.role, 60), authority: 'System',
      });
      return json({ instance: advanced });
    }

    if (action === 'escalate') {
      const instance = await readInstance(read, body.instance_id);
      if (!OPEN_INSTANCE_STATES.includes(instance.state)) fail('This run is already closed.', 409);
      const reason = text(body.reason, 500);
      if (!reason) fail('Give a reason for the escalation.', 422);
      const at = new Date().toISOString();
      const escalated = await write.WorkflowInstance.update(instance.id, {
        state: 'Escalated',
        escalated_at: at,
        escalation_reason: reason,
        last_action_by: name,
        last_action_at: at,
        last_action_note: reason,
      });
      await appendEvent(read, write, {
        instance_id: instance.id, definition_id: instance.definition_id, definition_version: instance.definition_version,
        event_type: 'Escalated', node_id: instance.current_node_id, node_label: instance.current_node_label,
        node_type: instance.current_node_type, outcome: 'Escalated', note: reason,
        actor_id: user.id, actor_name: name, actor_role: text(user.role, 60), authority: 'Assigned role',
      });
      return json({ instance: escalated });
    }

    fail('That workflow action is not supported.', 400);
  } catch (error: any) {
    const status = [400, 401, 403, 404, 409, 422, 503].includes(error?.status) ? error.status : 500;
    const message = status === 500
      ? 'The workflow engine could not complete that. Refresh and try again, or tell your administrator.'
      : String(error?.message || 'That workflow action is not available.');
    return Response.json({ error: message }, { status });
  }
});