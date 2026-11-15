// Phase 11 workflow runtime.
//
// One engine for the whole studio: it validates a graph, starts a run, walks the
// graph (auto-completing system nodes), hands the run to the accountable role,
// records every step, enforces the SLA clock and writes the audit event.
//
// The browser never writes definitions or instances — this function is the only
// writer, which is why both entities are service-role-on-write.
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId } from '../../shared/roleMatrix.ts';

const HUMAN_TYPES = new Set([
  'TASK', 'FORM', 'DECISION', 'COMPLIANCE_REVIEW', 'AUDIT_REVIEW', 'FINDING_REVIEW',
  'CORRECTIVE_ACTION', 'AUDIT_SIGNOFF', 'EVIDENCE_REQUEST', 'EVIDENCE_UPLOAD',
  'APPROVAL', 'CEO_APPROVAL', 'EXECUTIVE_APPROVAL', 'BOARD_APPROVAL', 'ESCALATION',
  'DOCUMENT_REQUEST',
]);

const APPROVAL_TYPES = new Set(['APPROVAL', 'CEO_APPROVAL', 'EXECUTIVE_APPROVAL', 'BOARD_APPROVAL', 'AUDIT_SIGNOFF', 'COMPLIANCE_REVIEW']);
const EVIDENCE_TYPES = new Set(['EVIDENCE_UPLOAD', 'EVIDENCE_REQUEST', 'DOCUMENT_REQUEST', 'EVIDENCE_VALIDATION']);

const str = (value: any) => (typeof value === 'string' ? value.trim() : '');
const isoNow = () => new Date().toISOString();
const hoursFrom = (hours: number) => new Date(Date.now() + hours * 3600000).toISOString();

function parseNodes(raw: any) {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function structuralErrors(nodes: any[]) {
  const errors: string[] = [];
  if (nodes.length < 3) errors.push('A workflow needs at least a start, one step and an end node.');
  if (nodes.length > 120) errors.push('A workflow cannot hold more than 120 nodes.');
  const ids = new Set<string>();
  nodes.forEach((item: any) => {
    if (!str(item?.id)) errors.push('Every node needs an id.');
    else if (ids.has(item.id)) errors.push(`Node id "${item.id}" is used twice.`);
    else ids.add(item.id);
    if (!str(item?.type)) errors.push('Every node needs a type.');
    if (!str(item?.label)) errors.push('Every node needs a name.');
  });
  const starts = nodes.filter((item) => item.type === 'START').length;
  if (starts !== 1) errors.push(`A workflow needs exactly one start node (found ${starts}).`);
  if (!nodes.some((item) => item.type === 'END')) errors.push('A workflow needs an end node.');
  if (!nodes.some((item) => HUMAN_TYPES.has(item.type))) errors.push('A workflow needs at least one human step.');
  return errors;
}

function nextOf(item: any, outcome: string) {
  if (!item) return '';
  if (item.type === 'DECISION') return outcome === 'reject' ? str(item.no_next) : str(item.yes_next);
  return str(item.next);
}

function step(node: any, outcome: string, by: string, note = '') {
  return {
    node_id: node.id,
    label: node.label,
    type: node.type,
    at: isoNow(),
    by,
    outcome,
    note,
  };
}

function taskKind(type: string) {
  if (APPROVAL_TYPES.has(type)) return 'Approval';
  if (EVIDENCE_TYPES.has(type)) return 'Evidence';
  if (type === 'DECISION') return 'Decision';
  if (String(type).startsWith('AI_')) return 'AI review';
  return 'Task';
}

// Walks forward from a node until it reaches a person or the end of the graph.
function advance(nodes: any[], fromId: string, outcome: string, by: string) {
  const map = new Map(nodes.map((item: any) => [item.id, item]));
  const steps: any[] = [];
  let currentId = nextOf(map.get(fromId), outcome);
  let guard = 0;
  while (currentId && guard < 200) {
    guard += 1;
    const current: any = map.get(currentId);
    if (!current) break;
    if (current.type === 'END') {
      steps.push(step(current, 'Workflow completed', by));
      return { steps, task: null, done: true };
    }
    if (HUMAN_TYPES.has(current.type)) return { steps, task: current, done: false };
    steps.push(step(current, 'Auto-completed', 'Workflow engine'));
    currentId = nextOf(current, 'approve');
  }
  return { steps, task: null, done: true };
}

function roleAllows(roleLine: string, role: string) {
  if (role === 'admin') return true;
  const allowed = String(roleLine || '').split(',').map((item) => item.trim()).filter(Boolean);
  if (!allowed.length) return true;
  return allowed.includes(role);
}

export default perBusiness(async function (req: Request) {
  let base44;
  try {
    base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use Workflow Studio.' }, { status: 401 });
    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId) {
      return Response.json({ error: 'Approved access to your assigned business is required.' }, { status: 403 });
    }
    const tenantId = base44.businessId;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';
    const actor = user.full_name || user.email;

    if (action === 'list') {
      const definitions = await base44.entities.WorkflowDefinition.filter({}, { sort: '-updated_date', limit: 200 });
      const instances = await base44.entities.WorkflowInstance.filter({}, { sort: '-started_at', limit: 300 });
      return Response.json({
        saved: true,
        definitions: definitions?.items || [],
        instances: instances?.items || [],
      });
    }

    if (action === 'create') {
      const nodes = parseNodes(body.nodes_json);
      const name = str(body.name).slice(0, 140);
      if (name.length < 4) return Response.json({ error: 'Give the workflow a name (at least 4 characters).' }, { status: 400 });
      const errors = structuralErrors(nodes);
      if (errors.length) return Response.json({ error: errors[0] }, { status: 400 });
      const existing = await base44.entities.WorkflowDefinition.filter({}, { limit: 200 });
      const numbers = (existing?.items || [])
        .map((row: any) => Number(String(row.code || '').replace(/[^0-9]/g, '')))
        .filter((value: number) => Number.isFinite(value));
      const nextNumber = (numbers.length ? Math.max(...numbers) : 0) + 1;
      const created = await base44.asServiceRole.entities.WorkflowDefinition.create({
        tenant_id: tenantId,
        code: `WF-${String(nextNumber).padStart(4, '0')}`,
        name,
        workflow_type: str(body.workflow_type) || 'Compliance Assessment',
        domain: str(body.domain).slice(0, 80),
        description: str(body.description).slice(0, 800),
        state: 'Draft',
        version: 1,
        template_code: str(body.template_code).slice(0, 40),
        nodes_json: JSON.stringify(nodes),
        validation_json: JSON.stringify({ valid: true, errors: [], warnings: [] }),
        sla_hours: Number(body.sla_hours) > 0 ? Number(body.sla_hours) : 72,
        owner_role: str(body.owner_role).slice(0, 80),
        standard_refs: str(body.standard_refs).slice(0, 400),
        evidence_refs: str(body.evidence_refs).slice(0, 400),
      });
      return Response.json({ saved: true, definition: created });
    }

    if (action === 'clone') {
      const source = await base44.asServiceRole.entities.WorkflowDefinition.get(str(body.definition_id))
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!source || source.tenant_id !== tenantId) return Response.json({ error: 'That workflow was not found.' }, { status: 404 });
      const created = await base44.asServiceRole.entities.WorkflowDefinition.create({
        tenant_id: tenantId,
        code: `${source.code}-C${String(Number(source.version) || 1)}`,
        name: `${source.name} (copy)`.slice(0, 140),
        workflow_type: source.workflow_type,
        domain: source.domain,
        description: source.description,
        state: 'Draft',
        version: 1,
        template_code: source.template_code,
        nodes_json: source.nodes_json,
        sla_hours: source.sla_hours,
        owner_role: source.owner_role,
        standard_refs: source.standard_refs,
        evidence_refs: source.evidence_refs,
      });
      return Response.json({ saved: true, definition: created });
    }

    if (action === 'save') {
      const definition = await base44.asServiceRole.entities.WorkflowDefinition.get(str(body.definition_id))
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!definition || definition.tenant_id !== tenantId) return Response.json({ error: 'That workflow was not found.' }, { status: 404 });
      if (definition.state === 'Archived') return Response.json({ error: 'An archived workflow cannot be edited. Clone it first.' }, { status: 400 });
      const nodes = parseNodes(body.nodes_json);
      const errors = structuralErrors(nodes);
      const changes: any = {
        nodes_json: JSON.stringify(nodes),
        state: errors.length ? 'Draft' : 'Validated',
        validation_json: JSON.stringify({ valid: !errors.length, errors, warnings: parseNodes(body.warnings_json) }),
      };
      if (str(body.name)) changes.name = str(body.name).slice(0, 140);
      if (str(body.description)) changes.description = str(body.description).slice(0, 800);
      if (Number(body.sla_hours) > 0) changes.sla_hours = Number(body.sla_hours);
      if (str(body.owner_role)) changes.owner_role = str(body.owner_role).slice(0, 80);
      const saved = await base44.asServiceRole.entities.WorkflowDefinition.update(definition.id, changes);
      return Response.json({ saved: true, definition: saved, errors });
    }

    if (action === 'publish') {
      const definition = await base44.asServiceRole.entities.WorkflowDefinition.get(str(body.definition_id))
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!definition || definition.tenant_id !== tenantId) return Response.json({ error: 'That workflow was not found.' }, { status: 404 });
      const errors = structuralErrors(parseNodes(definition.nodes_json));
      if (errors.length) return Response.json({ error: `Fix the workflow first: ${errors[0]}` }, { status: 400 });
      const saved = await base44.asServiceRole.entities.WorkflowDefinition.update(definition.id, {
        state: 'Published',
        version: (Number(definition.version) || 1) + 1,
        published_at: isoNow(),
        published_by: actor,
        validation_json: JSON.stringify({ valid: true, errors: [], warnings: [] }),
      });
      return Response.json({ saved: true, definition: saved });
    }

    if (action === 'archive') {
      const definition = await base44.asServiceRole.entities.WorkflowDefinition.get(str(body.definition_id))
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!definition || definition.tenant_id !== tenantId) return Response.json({ error: 'That workflow was not found.' }, { status: 404 });
      const saved = await base44.asServiceRole.entities.WorkflowDefinition.update(definition.id, { state: 'Archived' });
      return Response.json({ saved: true, definition: saved });
    }

    if (action === 'start') {
      const definition = await base44.asServiceRole.entities.WorkflowDefinition.get(str(body.definition_id))
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!definition || definition.tenant_id !== tenantId) return Response.json({ error: 'That workflow was not found.' }, { status: 404 });
      if (definition.state !== 'Published') return Response.json({ error: 'Publish the workflow before starting a run.' }, { status: 400 });
      const nodes = parseNodes(definition.nodes_json);
      const start = nodes.find((item: any) => item.type === 'START');
      if (!start) return Response.json({ error: 'This workflow has no start node.' }, { status: 400 });

      const slaHours = Number(definition.sla_hours) > 0 ? Number(definition.sla_hours) : 72;
      const walk = advance(nodes, start.id, 'approve', 'Workflow engine');
      const steps = [step(start, 'Started', actor), ...walk.steps];
      const now = isoNow();

      const created = await base44.asServiceRole.entities.WorkflowInstance.create({
        tenant_id: tenantId,
        definition_id: definition.id,
        definition_code: definition.code,
        definition_name: definition.name,
        workflow_type: definition.workflow_type,
        domain: definition.domain,
        state: walk.done ? 'Completed' : 'Running',
        current_node_id: walk.task?.id || '',
        current_node_label: walk.task?.label || '',
        current_node_type: walk.task?.type || '',
        current_step: steps.length,
        task_kind: walk.task ? taskKind(walk.task.type) : '',
        task_label: walk.task?.label || '',
        task_role: walk.task?.role || definition.owner_role || '',
        assigned_role: walk.task?.role || definition.owner_role || '',
        steps_json: JSON.stringify(steps),
        context_label: str(body.context_label).slice(0, 200),
        priority: ['Low', 'Medium', 'High', 'Critical'].includes(body.priority) ? body.priority : 'Medium',
        sla_hours: slaHours,
        due_at: hoursFrom(walk.task?.sla_hours > 0 ? walk.task.sla_hours : slaHours),
        sla_state: walk.done ? 'Closed' : 'On track',
        started_at: now,
        started_by: actor,
        completed_at: walk.done ? now : '',
        last_action_by: actor,
        last_action_at: now,
      });
      return Response.json({ saved: true, instance: created });
    }

    if (action === 'act') {
      const instance = await base44.asServiceRole.entities.WorkflowInstance.get(str(body.instance_id))
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!instance || instance.tenant_id !== tenantId) return Response.json({ error: 'That run was not found.' }, { status: 404 });
      if (!['Running', 'Waiting', 'Escalated', 'Paused'].includes(instance.state)) {
        return Response.json({ error: 'That run is already closed.' }, { status: 400 });
      }
      if (!roleAllows(instance.task_role, user.role)) {
        return Response.json({ error: `This step belongs to ${instance.task_role}.` }, { status: 403 });
      }
      const decision = str(body.decision) || 'complete';
      if (!['complete', 'approve', 'reject'].includes(decision)) return Response.json({ error: 'Choose approve, reject or complete.' }, { status: 400 });
      if (decision === 'reject' && str(body.note).length < 3) {
        return Response.json({ error: 'Say why this step is being rejected.' }, { status: 400 });
      }
      const definition = await base44.asServiceRole.entities.WorkflowDefinition.get(instance.definition_id)
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!definition) return Response.json({ error: 'The workflow definition behind this run was removed.' }, { status: 400 });
      const nodes = parseNodes(definition.nodes_json);
      const currentNode: any = nodes.find((item: any) => item.id === instance.current_node_id);
      if (!currentNode) return Response.json({ error: 'The current step is no longer in the workflow.' }, { status: 400 });

      const note = str(body.note).slice(0, 1000);
      const steps = parseNodes(instance.steps_json);
      steps.push(step(currentNode, decision === 'reject' ? 'Rejected' : 'Completed', actor, note));
      const now = isoNow();
      const changes: any = {
        steps_json: JSON.stringify(steps),
        last_action_by: actor,
        last_action_at: now,
        last_action_note: note,
        evidence_count: (Number(instance.evidence_count) || 0) + (EVIDENCE_TYPES.has(currentNode.type) ? 1 : 0),
        approval_count: (Number(instance.approval_count) || 0) + (APPROVAL_TYPES.has(currentNode.type) ? 1 : 0),
      };

      if (decision === 'reject' && currentNode.type !== 'DECISION') {
        changes.state = 'Failed';
        changes.task_kind = '';
        changes.task_label = '';
        changes.task_role = '';
        changes.sla_state = 'Closed';
        changes.completed_at = now;
        changes.current_node_label = currentNode.label;
        const failed = await base44.asServiceRole.entities.WorkflowInstance.update(instance.id, changes);
        return Response.json({ saved: true, instance: failed });
      }

      const walk = advance(nodes, currentNode.id, decision === 'reject' ? 'reject' : 'approve', actor);
      const allSteps = [...steps, ...walk.steps];
      changes.steps_json = JSON.stringify(allSteps);
      changes.current_step = allSteps.length;
      if (walk.done) {
        changes.state = 'Completed';
        changes.current_node_id = '';
        changes.current_node_label = '';
        changes.current_node_type = '';
        changes.task_kind = '';
        changes.task_label = '';
        changes.task_role = '';
        changes.sla_state = 'Closed';
        changes.completed_at = now;
      } else {
        changes.state = 'Running';
        changes.current_node_id = walk.task.id;
        changes.current_node_label = walk.task.label;
        changes.current_node_type = walk.task.type;
        changes.task_kind = taskKind(walk.task.type);
        changes.task_label = walk.task.label;
        changes.task_role = walk.task.role || '';
        changes.assigned_role = walk.task.role || '';
        changes.sla_state = 'On track';
        changes.due_at = hoursFrom(walk.task.sla_hours > 0 ? walk.task.sla_hours : Number(instance.sla_hours) || 72);
      }
      const saved = await base44.asServiceRole.entities.WorkflowInstance.update(instance.id, changes);
      return Response.json({ saved: true, instance: saved });
    }

    if (action === 'escalate') {
      const instance = await base44.asServiceRole.entities.WorkflowInstance.get(str(body.instance_id))
        .catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
      if (!instance || instance.tenant_id !== tenantId) return Response.json({ error: 'That run was not found.' }, { status: 404 });
      if (!['Running', 'Waiting', 'Escalated', 'Paused'].includes(instance.state)) {
        return Response.json({ error: 'That run is already closed.' }, { status: 400 });
      }
      const reason = str(body.reason).slice(0, 500);
      if (reason.length < 3) return Response.json({ error: 'Say why this run is being escalated.' }, { status: 400 });
      const steps = parseNodes(instance.steps_json);
      steps.push({
        node_id: instance.current_node_id || 'escalation',
        label: `Escalated by ${actor}`,
        type: 'ESCALATION',
        at: isoNow(),
        by: actor,
        outcome: 'Escalated',
        note: reason,
      });
      const saved = await base44.asServiceRole.entities.WorkflowInstance.update(instance.id, {
        state: 'Escalated',
        escalated_at: isoNow(),
        escalation_reason: reason,
        steps_json: JSON.stringify(steps),
        last_action_by: actor,
        last_action_at: isoNow(),
        last_action_note: reason,
      });
      return Response.json({ saved: true, instance: saved });
    }

    if (action === 'scanSla') {
      const page = await base44.entities.WorkflowInstance.filter(
        { state: { $in: ['Running', 'Waiting', 'Escalated', 'Paused'] } },
        { limit: 300 },
      );
      const now = Date.now();
      const breached: string[] = [];
      for (const row of page?.items || []) {
        if (!row.due_at || row.sla_state === 'Breached') continue;
        if (new Date(row.due_at).getTime() < now) {
          await base44.asServiceRole.entities.WorkflowInstance.update(row.id, { sla_state: 'Breached' });
          breached.push(row.id);
        }
      }
      return Response.json({ saved: true, breached: breached.length });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The workflow engine could not complete that.' }, { status: 500 });
  }
});