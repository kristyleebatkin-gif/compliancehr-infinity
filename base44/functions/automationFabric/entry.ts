// C8 — Enterprise Automation Fabric service.
//
// What this function really does:
//   - keeps a business-scoped event catalogue with a versioned payload contract
//   - validates an event against that contract before anything is routed
//   - stores the payload REDACTED, with the names of the fields that were withheld
//   - de-duplicates by an idempotency key built from the business, the event and its source
//   - chooses exactly one rule (or one subscription) to own the event, then routes it into an
//     EXISTING published Workflow Studio version through shared/workflowLauncher.ts
//   - records every delivery attempt, retries with exponential backoff, and dead-letters what
//     cannot be delivered so a person sees the failure reason instead of a silent loss
//
// What it deliberately refuses: a second workflow engine (routes call the Studio launcher), any
// flow step kind the app cannot actually perform, and any credential stored on a record (a
// connector holds the NAME of an app secret, never the value).
import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import { hasApprovedAccess, resolveUserTenantId, canComplianceReview, canManagementAct } from '../../shared/roleMatrix.ts';
import { Refusal, refuse, pageOf, getOwn, requireOwn } from '../../shared/serviceKit.ts';
import { str, nowIso, writeAudit } from '../../shared/registerCommon.ts';
import { launchPublishedWorkflow } from '../../shared/workflowLauncher.ts';
import {
  FABRIC_VERSION, EVENT_CATEGORIES, SENSITIVITIES, EVENT_CATALOGUE, MESSAGE_STATES,
  DEFAULT_MAX_ATTEMPTS, DEFAULT_RATE_LIMIT, parseJson,
  normaliseFields, validateEventPayload, redactPayload, sanitiseReason,
  idempotencyKey, messageRef, evaluateRules, validateConditions, conditionsPass, hashText,
  nextDeliveryState, nextAttemptAt, backoffSeconds, rateLimitState,
  validateFlowSteps, flowContentHash, credentialRefProblem, endpointProblem, messageSummary,
} from '../../shared/automationFabric.ts';

const canRead = (user: any) => canComplianceReview(user);
const canConfigure = (user: any) => canComplianceReview(user);
const canManageConnectors = (user: any) => canManagementAct(user);

const ROUTE = '/automation-fabric';

const audit = (base44: any, user: any, action: string, entityType: string, record: any, details: any) =>
  writeAudit(base44, user, { action, entityType, record, details, route: ROUTE });

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use the automation fabric.' }, { status: 401 });

    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId || !canRead(user)) {
      return Response.json({ error: 'Approved compliance access to your assigned business is required.' }, { status: 403 });
    }

    const tenantId = base44.businessId;
    const entities = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';
    const actor = user.full_name || user.email || 'Unknown';
    const configure = (allowed: boolean, message: string) => { if (!allowed) refuse(message, 403); };

    /* ------------------------------------------------------------------ read */

    if (action === 'list') {
      const [eventTypes, subscriptions, flows, rules, connectors, messagePage] = await Promise.all([
        pageOf(entities.AutomationEventType, { tenant_id: tenantId }, '-created_date', 200),
        pageOf(entities.AutomationSubscription, { tenant_id: tenantId }, '-created_date', 200),
        pageOf(entities.AutomationFlow, { tenant_id: tenantId }, '-updated_date', 200),
        pageOf(entities.OrchestrationRule, { tenant_id: tenantId }, 'priority', 200),
        pageOf(entities.IntegrationConnector, { tenant_id: tenantId }, '-created_date', 100),
        pageOf(entities.IntegrationMessage, { tenant_id: tenantId }, '-created_date', 100),
      ]);

      const targets = await pageOf(entities.WorkflowDefinition, { tenant_id: tenantId, state: 'Published' }, '-updated_date', 100);
      const messages = messagePage.map(messageSummary).filter(Boolean);
      const byStatus = MESSAGE_STATES.reduce((acc: Record<string, number>, state) => {
        acc[state] = messagePage.filter((row: any) => row.status === state).length;
        return acc;
      }, {});

      return Response.json({
        saved: true,
        role: user.role,
        canConfigure: canConfigure(user),
        canManageConnectors: canManageConnectors(user),
        fabricVersion: FABRIC_VERSION,
        catalogue: { categories: EVENT_CATEGORIES, sensitivities: SENSITIVITIES, seeded: EVENT_CATALOGUE.map((entry) => entry.event_key) },
        eventTypes,
        subscriptions,
        flows,
        rules,
        connectors,
        messages,
        workflowTargets: targets.map((row: any) => ({
          id: row.id, name: row.name, code: row.code, version: row.version, owner_role: row.owner_role || '',
        })),
        defaults: { maxAttempts: DEFAULT_MAX_ATTEMPTS, rateLimit: DEFAULT_RATE_LIMIT },
        counts: {
          eventTypes: eventTypes.length,
          activeTypes: eventTypes.filter((row: any) => row.status === 'Active').length,
          subscriptions: subscriptions.length,
          activeSubscriptions: subscriptions.filter((row: any) => row.status === 'Active').length,
          flows: flows.length,
          publishedFlows: flows.filter((row: any) => row.status === 'Published').length,
          rules: rules.length,
          activeRules: rules.filter((row: any) => row.status === 'Active').length,
          connectors: connectors.length,
          activeConnectors: connectors.filter((row: any) => row.status === 'Active').length,
          messages: messagePage.length,
          delivered: byStatus.Delivered || 0,
          retrying: byStatus.Retrying || 0,
          deadLetters: byStatus['Dead letter'] || 0,
          suppressed: byStatus.Suppressed || 0,
          redactedValues: messagePage.reduce((sum: number, row: any) => sum + Number(row.redacted_count || 0), 0),
          lastDeliveryAt: messagePage.reduce((latest: string, row: any) => (String(row.created_date || '') > latest ? row.created_date : latest), ''),
          publishedTargets: targets.length,
        },
      });
    }

    if (action === 'message') {
      const message = await requireOwn(entities.IntegrationMessage, body.message_id, tenantId, 'message');
      const attempts = await pageOf(entities.EventDeliveryAttempt, { tenant_id: tenantId, message_id: message.id }, 'attempt_number', 50);
      return Response.json({ saved: true, message, attempts, redactedFields: parseJson(message.redacted_fields_json, []) });
    }

    /* ------------------------------------------------------------------ event catalogue */

    if (action === 'createEventType') {
      configure(canConfigure(user), 'Your role cannot change the event catalogue.');
      const eventKey = str(body.event_key).toLowerCase().slice(0, 120);
      if (!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(eventKey)) {
        refuse('Use a dotted lower-case key such as incident.created.');
      }
      if ((await entities.AutomationEventType.count({ tenant_id: tenantId, event_key: eventKey })) > 0) {
        refuse('That event key is already in the catalogue.', 409);
      }
      const fields = normaliseFields(body.fields);
      if (!fields.ok) refuse(fields.error);
      if (!EVENT_CATEGORIES.includes(str(body.category))) refuse('Choose a category from the list.');
      const sensitivity = SENSITIVITIES.includes(str(body.sensitivity)) ? str(body.sensitivity) : 'Internal';
      const record = await entities.AutomationEventType.create({
        tenant_id: tenantId,
        event_key: eventKey,
        name: str(body.name).slice(0, 160) || eventKey,
        description: str(body.description).slice(0, 2000),
        category: str(body.category),
        domain: str(body.domain).slice(0, 160),
        source_module: str(body.source_module).slice(0, 160),
        schema_version: 1,
        payload_schema_json: JSON.stringify(fields.fields),
        required_fields_json: JSON.stringify(fields.fields.filter((field) => field.required).map((field) => field.name)),
        field_count: fields.fields.length,
        sensitivity,
        is_system: false,
        sample_payload_json: typeof body.sample === 'object' ? JSON.stringify(redactPayload(body.sample).payload) : '',
        retention_days: Math.min(3650, Math.max(1, Number(body.retention_days) || 365)),
        status: 'Active',
        version: 1,
        author: actor,
        author_id: user.id,
        notes: str(body.notes).slice(0, 2000),
      });
      await audit(base44, user, 'Automation fabric: event type created', 'AutomationEventType', record, { event_key: eventKey, fields: fields.fields.length, sensitivity });
      return Response.json({ saved: true, eventType: record });
    }

    if (action === 'updateEventType') {
      configure(canConfigure(user), 'Your role cannot change the event catalogue.');
      const existing = await requireOwn(entities.AutomationEventType, body.event_type_id, tenantId, 'event type');
      if (existing.status !== 'Active') refuse('A retired event type cannot be edited.', 409);
      const patch: any = {};
      if ('name' in body) patch.name = str(body.name).slice(0, 160) || existing.name;
      if ('description' in body) patch.description = str(body.description).slice(0, 2000);
      if ('category' in body) {
        if (!EVENT_CATEGORIES.includes(str(body.category))) refuse('Choose a category from the list.');
        patch.category = str(body.category);
      }
      if ('sensitivity' in body) {
        if (!SENSITIVITIES.includes(str(body.sensitivity))) refuse('Choose a sensitivity from the list.');
        patch.sensitivity = str(body.sensitivity);
      }
      if ('fields' in body) {
        const fields = normaliseFields(body.fields);
        if (!fields.ok) refuse(fields.error);
        patch.payload_schema_json = JSON.stringify(fields.fields);
        patch.required_fields_json = JSON.stringify(fields.fields.filter((field) => field.required).map((field) => field.name));
        patch.field_count = fields.fields.length;
        patch.schema_version = Number(existing.schema_version || 1) + 1;
        patch.version = Number(existing.version || 1) + 1;
      }
      const record = await entities.AutomationEventType.update(existing.id, patch);
      await audit(base44, user, 'Automation fabric: event type updated', 'AutomationEventType', record, {
        event_key: record.event_key, schema_version: record.schema_version, changed: Object.keys(patch),
      });
      return Response.json({ saved: true, eventType: record });
    }

    if (action === 'retireEventType') {
      configure(canConfigure(user), 'Your role cannot change the event catalogue.');
      const existing = await requireOwn(entities.AutomationEventType, body.event_type_id, tenantId, 'event type');
      const record = await entities.AutomationEventType.update(existing.id, {
        status: 'Retired', retired_at: nowIso(), notes: str(body.note).slice(0, 2000) || existing.notes || '',
      });
      await audit(base44, user, 'Automation fabric: event type retired', 'AutomationEventType', record, { event_key: record.event_key });
      return Response.json({ saved: true, eventType: record });
    }

    /* ------------------------------------------------------------------ subscriptions */

    if (action === 'saveSubscription') {
      configure(canConfigure(user), 'Your role cannot change subscriptions.');
      const eventType = await requireOwn(entities.AutomationEventType, body.event_type_id, tenantId, 'event type');
      if (eventType.status !== 'Active') refuse('Retire the event type? It cannot carry a new subscription.', 409);
      const targetKind = str(body.target_kind);
      if (!['Workflow', 'Automation flow', 'Record only'].includes(targetKind)) refuse('Choose what this subscription delivers to.');
      const patch: any = {
        name: str(body.name).slice(0, 160),
        description: str(body.description).slice(0, 2000),
        event_type_key: eventType.event_key,
        event_type_name: eventType.name,
        event_schema_version: Number(eventType.schema_version || 1),
        target_kind: targetKind,
        workflow_definition_id: '',
        workflow_definition_name: '',
        flow_id: '',
        flow_name: '',
        connector_id: '',
        connector_name: '',
      };
      if (!patch.name) refuse('Give the subscription a name.');

      if (targetKind === 'Workflow') {
        const definition = await requireOwn(entities.WorkflowDefinition, body.workflow_definition_id, tenantId, 'workflow');
        if (definition.state !== 'Published') refuse('Only a published workflow can be a delivery target.', 409);
        patch.workflow_definition_id = definition.id;
        patch.workflow_definition_name = definition.name;
      }
      if (targetKind === 'Automation flow') {
        const flow = await requireOwn(entities.AutomationFlow, body.flow_id, tenantId, 'flow');
        if (flow.status !== 'Published') refuse('Only a published flow can be a delivery target.', 409);
        patch.flow_id = flow.id;
        patch.flow_name = flow.name;
      }
      if (str(body.connector_id)) {
        const connector = await requireOwn(entities.IntegrationConnector, body.connector_id, tenantId, 'connector');
        if (connector.status !== 'Active') refuse('That connector is not active.', 409);
        patch.connector_id = connector.id;
        patch.connector_name = connector.name;
      }

      const filters = validateConditions(body.filters);
      if (!filters.ok) refuse(filters.error);
      patch.filters_json = JSON.stringify(filters.conditions);
      patch.filter_count = filters.conditions.length;
      patch.max_attempts = Math.min(10, Math.max(1, Number(body.max_attempts) || DEFAULT_MAX_ATTEMPTS));
      patch.rate_limit_per_minute = Math.min(600, Math.max(1, Number(body.rate_limit_per_minute) || DEFAULT_RATE_LIMIT));

      if (str(body.subscription_id)) {
        const existing = await requireOwn(entities.AutomationSubscription, body.subscription_id, tenantId, 'subscription');
        const record = await entities.AutomationSubscription.update(existing.id, { ...patch, version: Number(existing.version || 1) + 1 });
        await audit(base44, user, 'Automation fabric: subscription updated', 'AutomationSubscription', record, { event_key: record.event_type_key, target: record.target_kind });
        return Response.json({ saved: true, subscription: record });
      }

      const total = await entities.AutomationSubscription.count({ tenant_id: tenantId });
      const record = await entities.AutomationSubscription.create({
        tenant_id: tenantId,
        subscription_key: `SUB-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        ...patch,
        delivery_mode: 'Immediate',
        status: 'Active',
        version: 1,
        delivery_count: 0,
        failure_count: 0,
        created_by_name: actor,
      });
      await audit(base44, user, 'Automation fabric: subscription created', 'AutomationSubscription', record, { event_key: record.event_type_key, target: record.target_kind });
      return Response.json({ saved: true, subscription: record });
    }

    if (action === 'setSubscriptionStatus') {
      configure(canConfigure(user), 'Your role cannot change subscriptions.');
      const existing = await requireOwn(entities.AutomationSubscription, body.subscription_id, tenantId, 'subscription');
      const status = str(body.status);
      if (!['Active', 'Paused', 'Retired'].includes(status)) refuse('Choose Active, Paused or Retired.');
      const record = await entities.AutomationSubscription.update(existing.id, { status });
      await audit(base44, user, `Automation fabric: subscription ${status.toLowerCase()}`, 'AutomationSubscription', record, { event_key: record.event_type_key });
      return Response.json({ saved: true, subscription: record });
    }

    /* ------------------------------------------------------------------ flows */

    if (action === 'saveFlow') {
      configure(canConfigure(user), 'Your role cannot change automation flows.');
      const eventType = await requireOwn(entities.AutomationEventType, body.event_type_id, tenantId, 'event type');
      const workflowIds = (await pageOf(entities.WorkflowDefinition, { tenant_id: tenantId, state: 'Published' }, '-updated_date', 200)).map((row: any) => row.id);
      const validated = validateFlowSteps(body.steps, workflowIds);
      if (!validated.ok) refuse(validated.errors.join(' '));
      const hash = await flowContentHash(validated.steps);
      const patch: any = {
        name: str(body.name).slice(0, 160),
        description: str(body.description).slice(0, 2000),
        trigger_event_key: eventType.event_key,
        trigger_event_name: eventType.name,
        steps_json: JSON.stringify(validated.steps),
        step_count: validated.steps.length,
        content_hash: hash,
        validated_hash: '',
        validated_at: '',
        validated_by: '',
        validated_note: '',
        owner_role: str(body.owner_role).slice(0, 120),
      };
      if (!patch.name) refuse('Give the flow a name.');

      if (str(body.flow_id)) {
        const existing = await requireOwn(entities.AutomationFlow, body.flow_id, tenantId, 'flow');
        if (existing.status === 'Published') refuse('A published flow is immutable. Open a new version instead.', 409);
        const record = await entities.AutomationFlow.update(existing.id, {
          ...patch, status: 'Draft', version: Number(existing.version || 1),
          change_note: str(body.change_note).slice(0, 400) || existing.change_note || '',
        });
        await audit(base44, user, 'Automation fabric: flow draft saved', 'AutomationFlow', record, {
          steps: record.step_count, trigger: record.trigger_event_key, hash,
        });
        return Response.json({ saved: true, flow: record });
      }

      const total = await entities.AutomationFlow.count({ tenant_id: tenantId });
      const record = await entities.AutomationFlow.create({
        tenant_id: tenantId,
        flow_key: `FLOW-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        ...patch,
        status: 'Draft',
        version: 1,
        publisher_independent: false,
        run_count: 0,
        author: actor,
        author_id: user.id,
        change_note: str(body.change_note).slice(0, 400) || 'First version.',
      });
      await audit(base44, user, 'Automation fabric: flow created', 'AutomationFlow', record, {
        steps: record.step_count, trigger: record.trigger_event_key, hash,
      });
      return Response.json({ saved: true, flow: record });
    }

    if (action === 'validateFlow') {
      configure(canConfigure(user), 'Your role cannot validate automation flows.');
      const flow = await requireOwn(entities.AutomationFlow, body.flow_id, tenantId, 'flow');
      if (flow.status === 'Published') refuse('A published flow is immutable.', 409);
      const workflowIds = (await pageOf(entities.WorkflowDefinition, { tenant_id: tenantId, state: 'Published' }, '-updated_date', 200)).map((row: any) => row.id);
      const validated = validateFlowSteps(flow.steps_json, workflowIds);
      if (!validated.ok) {
        await entities.AutomationFlow.update(flow.id, { validated_hash: '', validated_at: '', validated_by: '', validated_note: '' });
        refuse(validated.errors.join(' '));
      }
      const hash = await flowContentHash(validated.steps);
      const record = await entities.AutomationFlow.update(flow.id, {
        steps_json: JSON.stringify(validated.steps),
        step_count: validated.steps.length,
        content_hash: hash,
        validated_hash: hash,
        validated_at: nowIso(),
        validated_by: actor,
        validated_note: str(body.note).slice(0, 2000),
        status: 'Validated',
      });
      await audit(base44, user, 'Automation fabric: flow validated', 'AutomationFlow', record, {
        steps: record.step_count, hash, note: record.validated_note,
      });
      return Response.json({ saved: true, flow: record });
    }

    if (action === 'publishFlow') {
      configure(canConfigure(user), 'Your role cannot publish automation flows.');
      const flow = await requireOwn(entities.AutomationFlow, body.flow_id, tenantId, 'flow');
      if (!flow.validated_hash) refuse('Validate this flow before publishing it.', 409);
      if (flow.validated_hash !== flow.content_hash) refuse('The steps changed after validation. Validate again before publishing.', 409);
      const workflowIds = (await pageOf(entities.WorkflowDefinition, { tenant_id: tenantId, state: 'Published' }, '-updated_date', 200)).map((row: any) => row.id);
      const validated = validateFlowSteps(flow.steps_json, workflowIds);
      if (!validated.ok) refuse(validated.errors.join(' '));
      const record = await entities.AutomationFlow.update(flow.id, {
        status: 'Published',
        published_at: nowIso(),
        published_by: actor,
        publisher_independent: String(flow.validated_by || '') !== actor,
      });
      await audit(base44, user, 'Automation fabric: flow published', 'AutomationFlow', record, {
        version: record.version, independent: record.publisher_independent, validated_by: record.validated_by,
      });
      return Response.json({ saved: true, flow: record });
    }

    if (action === 'reviseFlow') {
      configure(canConfigure(user), 'Your role cannot change automation flows.');
      const flow = await requireOwn(entities.AutomationFlow, body.flow_id, tenantId, 'flow');
      const total = await entities.AutomationFlow.count({ tenant_id: tenantId, flow_key: flow.flow_key });
      const record = await entities.AutomationFlow.create({
        tenant_id: tenantId,
        flow_key: flow.flow_key,
        name: flow.name,
        description: flow.description || '',
        trigger_event_key: flow.trigger_event_key,
        trigger_event_name: flow.trigger_event_name || '',
        steps_json: flow.steps_json,
        step_count: flow.step_count || 0,
        status: 'Draft',
        version: Number(flow.version || 1) + 1,
        content_hash: flow.content_hash || '',
        validated_hash: '',
        previous_version_id: flow.id,
        change_note: str(body.note).slice(0, 400) || 'New version opened.',
        owner_role: flow.owner_role || '',
        author: actor,
        author_id: user.id,
        run_count: 0,
        publisher_independent: false,
      });
      await audit(base44, user, 'Automation fabric: flow version opened', 'AutomationFlow', record, {
        previous_version: flow.version, version: record.version, versions: total + 1,
      });
      return Response.json({ saved: true, flow: record });
    }

    if (action === 'setFlowStatus') {
      configure(canConfigure(user), 'Your role cannot change automation flows.');
      const flow = await requireOwn(entities.AutomationFlow, body.flow_id, tenantId, 'flow');
      const status = str(body.status);
      if (!['Published', 'Paused', 'Archived'].includes(status)) refuse('Choose Published, Paused or Archived.');
      if (status === 'Published' && flow.status !== 'Published') refuse('Use publish to put a validated flow live.', 409);
      const record = await entities.AutomationFlow.update(flow.id, {
        status, archived_at: status === 'Archived' ? nowIso() : flow.archived_at || '',
      });
      await audit(base44, user, `Automation fabric: flow ${status.toLowerCase()}`, 'AutomationFlow', record, { version: record.version });
      return Response.json({ saved: true, flow: record });
    }

    /* ------------------------------------------------------------------ rules */

    if (action === 'saveRule') {
      configure(canConfigure(user), 'Your role cannot change orchestration rules.');
      const eventType = await requireOwn(entities.AutomationEventType, body.event_type_id, tenantId, 'event type');
      const action_ = str(body.action);
      if (!['Route to workflow', 'Route to flow', 'Record only', 'Suppress'].includes(action_)) refuse('Choose what the rule should do.');
      const conditions = validateConditions(body.conditions);
      if (!conditions.ok) refuse(conditions.error);
      const patch: any = {
        name: str(body.name).slice(0, 160),
        description: str(body.description).slice(0, 2000),
        event_type_key: eventType.event_key,
        conditions_json: JSON.stringify(conditions.conditions),
        condition_count: conditions.conditions.length,
        action: action_,
        target_workflow_id: '',
        target_workflow_name: '',
        target_flow_id: '',
        target_flow_name: '',
        priority: Math.min(9999, Math.max(1, Number(body.priority) || 100)),
        status: ['Active', 'Disabled'].includes(str(body.status)) ? str(body.status) : 'Active',
        effective_from: str(body.effective_from).slice(0, 10),
      };
      if (!patch.name) refuse('Give the rule a name.');
      if (action_ === 'Route to workflow') {
        const definition = await requireOwn(entities.WorkflowDefinition, body.target_workflow_id, tenantId, 'workflow');
        if (definition.state !== 'Published') refuse('Only a published workflow can be a rule target.', 409);
        patch.target_workflow_id = definition.id;
        patch.target_workflow_name = definition.name;
      }
      if (action_ === 'Route to flow') {
        const flow = await requireOwn(entities.AutomationFlow, body.target_flow_id, tenantId, 'flow');
        if (flow.status !== 'Published') refuse('Only a published flow can be a rule target.', 409);
        patch.target_flow_id = flow.id;
        patch.target_flow_name = flow.name;
      }

      if (str(body.rule_id)) {
        const existing = await requireOwn(entities.OrchestrationRule, body.rule_id, tenantId, 'rule');
        const record = await entities.OrchestrationRule.update(existing.id, patch);
        await audit(base44, user, 'Automation fabric: rule updated', 'OrchestrationRule', record, {
          event_key: record.event_type_key, action: record.action, priority: record.priority,
        });
        return Response.json({ saved: true, rule: record });
      }

      const total = await entities.OrchestrationRule.count({ tenant_id: tenantId });
      const record = await entities.OrchestrationRule.create({
        tenant_id: tenantId,
        rule_key: `RULE-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        ...patch,
        match_count: 0,
        created_by_name: actor,
      });
      await audit(base44, user, 'Automation fabric: rule created', 'OrchestrationRule', record, {
        event_key: record.event_type_key, action: record.action, priority: record.priority,
      });
      return Response.json({ saved: true, rule: record });
    }

    if (action === 'setRuleStatus') {
      configure(canConfigure(user), 'Your role cannot change orchestration rules.');
      const existing = await requireOwn(entities.OrchestrationRule, body.rule_id, tenantId, 'rule');
      const status = str(body.status);
      if (!['Active', 'Disabled'].includes(status)) refuse('A rule is either Active or Disabled.');
      const record = await entities.OrchestrationRule.update(existing.id, { status });
      await audit(base44, user, `Automation fabric: rule ${status.toLowerCase()}`, 'OrchestrationRule', record, { event_key: record.event_type_key });
      return Response.json({ saved: true, rule: record });
    }

    /* ------------------------------------------------------------------ connectors */

    if (action === 'saveConnector') {
      configure(canManageConnectors(user), 'Only an administrator can change integration connectors.');
      const name = str(body.name).slice(0, 160);
      if (!name) refuse('Give the connector a name.');
      const credentialRef = str(body.credential_ref).slice(0, 90);
      const refProblem = credentialRefProblem(credentialRef);
      if (refProblem) refuse(refProblem);
      const endpoint = endpointProblem(body.endpoint_label);
      if (endpoint) refuse(endpoint);
      const authScheme = ['Secret reference', 'Connected app connector', 'None'].includes(str(body.auth_scheme))
        ? str(body.auth_scheme) : 'Secret reference';
      if (authScheme === 'Secret reference' && !credentialRef) {
        refuse('A secret reference is needed, or choose authentication None.');
      }
      if (authScheme === 'None' && credentialRef) refuse('Remove the credential reference, or set authentication to Secret reference.');

      const patch: any = {
        name,
        kind: ['Webhook', 'Message queue', 'HTTP API', 'Email', 'SMS', 'Workflow'].includes(str(body.kind)) ? str(body.kind) : 'Webhook',
        endpoint_label: str(body.endpoint_label).slice(0, 300),
        credential_ref: credentialRef,
        auth_scheme: authScheme,
        rate_limit_per_minute: Math.min(600, Math.max(1, Number(body.rate_limit_per_minute) || DEFAULT_RATE_LIMIT)),
        max_attempts: Math.min(10, Math.max(1, Number(body.max_attempts) || DEFAULT_MAX_ATTEMPTS)),
        retry_policy_json: JSON.stringify({ base_seconds: backoffSeconds(1), ceiling_seconds: backoffSeconds(12) }),
        allowed_event_types_json: JSON.stringify((Array.isArray(body.allowed_event_types) ? body.allowed_event_types : []).map((value: any) => str(value)).filter(Boolean).slice(0, 50)),
        notes: str(body.notes).slice(0, 2000),
      };

      if (str(body.connector_id)) {
        const existing = await requireOwn(entities.IntegrationConnector, body.connector_id, tenantId, 'connector');
        const record = await entities.IntegrationConnector.update(existing.id, patch);
        await audit(base44, user, 'Automation fabric: connector updated', 'IntegrationConnector', record, {
          kind: record.kind, auth_scheme: record.auth_scheme,
        });
        return Response.json({ saved: true, connector: record });
      }

      const total = await entities.IntegrationConnector.count({ tenant_id: tenantId });
      const record = await entities.IntegrationConnector.create({
        tenant_id: tenantId,
        connector_key: `CONN-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        ...patch,
        status: 'Unverified',
        created_by_name: actor,
      });
      await audit(base44, user, 'Automation fabric: connector created', 'IntegrationConnector', record, {
        kind: record.kind, auth_scheme: record.auth_scheme, has_reference: Boolean(record.credential_ref),
      });
      return Response.json({ saved: true, connector: record });
    }

    if (action === 'setConnectorStatus') {
      configure(canManageConnectors(user), 'Only an administrator can change integration connectors.');
      const existing = await requireOwn(entities.IntegrationConnector, body.connector_id, tenantId, 'connector');
      const status = str(body.status);
      if (!['Active', 'Disabled', 'Unverified'].includes(status)) refuse('Choose Active, Disabled or Unverified.');
      if (status === 'Active' && existing.auth_scheme === 'Secret reference' && !existing.credential_ref) {
        refuse('This connector has no secret reference, so it cannot be activated.', 409);
      }
      const record = await entities.IntegrationConnector.update(existing.id, {
        status, last_verified_at: status === 'Active' ? nowIso() : existing.last_verified_at || '', verified_by: status === 'Active' ? actor : existing.verified_by || '',
      });
      await audit(base44, user, `Automation fabric: connector ${status.toLowerCase()}`, 'IntegrationConnector', record, { kind: record.kind });
      return Response.json({ saved: true, connector: record });
    }

    /* ------------------------------------------------------------------ routing */

    /**
     * One delivery attempt. Returns the state to record; it never throws for a delivery failure,
     * because a failure is data the operator must see rather than a crashed request.
     */
    const attemptDelivery = async (options: {
      message: any;
      eventType: any;
      payload: any;
      attempt: number;
      maxAttempts: number;
    }) => {
      const startedAt = nowIso();
      const started = Date.now();
      const { eventType, payload } = options;
      const attempt = Math.max(1, options.attempt);
      const base = {
        tenant_id: tenantId,
        message_id: options.message.id,
        message_ref: options.message.message_ref,
        trace_id: options.message.trace_id,
        attempt_number: attempt,
        started_at: startedAt,
        performed_by: actor,
      };

      const finish = async (outcome: 'Delivered' | 'Suppressed' | 'Failed', detail: any = {}) => {
        const state = nextDeliveryState({ delivered: outcome === 'Delivered', attempt, maxAttempts: options.maxAttempts });
        const settled = outcome === 'Delivered' || outcome === 'Suppressed';
        const record = await entities.EventDeliveryAttempt.create({
          ...base,
          completed_at: nowIso(),
          duration_ms: Date.now() - started,
          outcome: settled ? outcome : state.outcome,
          error_code: detail.errorCode || '',
          error_detail: detail.error ? sanitiseReason(detail.error) : '',
          backoff_seconds: settled ? 0 : (state.retry ? backoffSeconds(attempt) : 0),
          next_retry_at: settled || !state.retry ? '' : nextAttemptAt(attempt),
          workflow_instance_id: detail.instanceId || '',
        });
        return { record, state: settled ? { ...state, retry: false, status: outcome, outcome } : state };
      };

      // Exactly one owner: the first matching active rule, else the first active subscription.
      const rules = await pageOf(entities.OrchestrationRule, { tenant_id: tenantId, status: 'Active', event_type_key: eventType.event_key }, 'priority', 100);
      const rule = evaluateRules(rules, { eventKey: eventType.event_key, payload });
      let subscription: any = null;
      if (!rule) {
        const subs = await pageOf(entities.AutomationSubscription, { tenant_id: tenantId, status: 'Active', event_type_key: eventType.event_key }, 'created_date', 20);
        subscription = subs.find((row: any) => conditionsPass(row.filters_json, payload)) || null;
      }

      const action_ = rule ? rule.action : subscription ? (subscription.target_kind === 'Workflow' ? 'Route to workflow'
        : subscription.target_kind === 'Automation flow' ? 'Route to flow' : 'Record only') : '';
      const owner = rule || subscription || null;

      if (!action_) {
        const done = await finish('Failed', { errorCode: 'NO_ROUTE', error: 'No active rule or subscription routes this event.' });
        // No route is a configuration gap, not a transient fault: send it straight to a person.
        await entities.IntegrationMessage.update(options.message.id, {
          status: 'Dead letter',
          attempts: attempt,
          last_error: 'No active rule or subscription routes this event.',
          rule_id: '', rule_name: '', subscription_id: '', subscription_name: '',
        });
        return { ...done, status: 'Dead letter', detail: 'No active rule or subscription routes this event.' };
      }

      const context = `Event ${eventType.event_key} · ${options.message.message_ref}`;
      const route: any = {
        rule_id: rule?.id || '',
        rule_name: rule?.name || '',
        subscription_id: subscription?.id || '',
        subscription_name: subscription?.name || '',
      };

      if (action_ === 'Suppress') {
        const done = await finish('Suppressed');
        await entities.IntegrationMessage.update(options.message.id, {
          ...route, status: 'Suppressed', attempts: attempt, last_error: '',
          notes: 'A rule suppressed this event on purpose.',
        });
        if (rule) await entities.OrchestrationRule.update(rule.id, { match_count: Number(rule.match_count || 0) + 1, last_matched_at: nowIso() });
        return { ...done, status: 'Suppressed', route };
      }

      if (action_ === 'Record only') {
        const done = await finish('Delivered');
        await entities.IntegrationMessage.update(options.message.id, {
          ...route, status: 'Delivered', attempts: attempt, delivered_at: nowIso(), last_error: '',
          notes: 'Recorded in the fabric only; no workflow was started.',
        });
        if (rule) await entities.OrchestrationRule.update(rule.id, { match_count: Number(rule.match_count || 0) + 1, last_matched_at: nowIso() });
        if (subscription) await entities.AutomationSubscription.update(subscription.id, {
          delivery_count: Number(subscription.delivery_count || 0) + 1, last_delivery_at: nowIso(),
        });
        return { ...done, status: 'Delivered', route };
      }

      // Route to a workflow, or through a flow's ordered steps. Both end in the Studio launcher.
      const launched: { definitionId: string; definitionName: string; instanceId: string; version: number }[] = [];
      const launch = async (definitionId: string, definitionName: string, commandSuffix: string) => {
        const definition = await getOwn(entities.WorkflowDefinition, definitionId, tenantId);
        if (!definition) throw new Refusal('The workflow this route points to is no longer in your business.', 409);
        const result = await launchPublishedWorkflow({
          read: base44.entities,
          write: entities,
          definitionId: definition.id,
          commandKey: `fabric:${options.message.idempotency_key}:${commandSuffix}`.slice(0, 120),
          contextLabel: context,
          actorName: 'Automation fabric',
          actorId: '',
          actorRole: 'Automation fabric',
        });
        launched.push({
          definitionId: definition.id, definitionName: definition.name,
          instanceId: result.instance.id, version: result.definitionVersion,
        });
      };

      try {
        if (action_ === 'Route to workflow') {
          const definitionId = rule ? rule.target_workflow_id : subscription.workflow_definition_id;
          const definitionName = rule ? rule.target_workflow_name : subscription.workflow_definition_name;
          await launch(definitionId, definitionName, 'main');
        } else {
          const flowId = rule ? rule.target_flow_id : subscription.flow_id;
          const flow = await requireOwn(entities.AutomationFlow, flowId, tenantId, 'flow');
          if (flow.status !== 'Published') refuse('That flow is not published, so it cannot route.', 409);
          const steps = parseJson(flow.steps_json, []);
          for (const step of Array.isArray(steps) ? steps : []) {
            if (step.kind === 'Stop') break;
            if (step.kind === 'Route to workflow') {
              await launch(step.workflow_definition_id, step.workflow_definition_name, String(step.id || 'step'));
            }
          }
          await entities.AutomationFlow.update(flow.id, { run_count: Number(flow.run_count || 0) + 1, last_run_at: nowIso() });
        }
      } catch (error: any) {
        const reason = sanitiseReason(error?.message || 'The delivery could not be completed.');
        const done = await finish('Failed', { errorCode: `ROUTE_${error?.status || 500}`, error: reason });
        await entities.IntegrationMessage.update(options.message.id, {
          ...route,
          status: done.state.status,
          attempts: attempt,
          last_error: reason,
          next_attempt_at: done.state.retry ? nextAttemptAt(attempt) : '',
        });
        if (subscription) await entities.AutomationSubscription.update(subscription.id, {
          failure_count: Number(subscription.failure_count || 0) + 1,
        });
        return { ...done, status: done.state.status, detail: reason, route };
      }

      if (!launched.length) {
        const reason = 'The route ran but started no workflow.';
        const done = await finish('Failed', { errorCode: 'NO_TARGET', error: reason });
        await entities.IntegrationMessage.update(options.message.id, {
          ...route, status: done.state.status, attempts: attempt, last_error: reason,
          next_attempt_at: done.state.retry ? nextAttemptAt(attempt) : '',
        });
        return { ...done, status: done.state.status, detail: reason, route };
      }

      const first = launched[0];
      const done = await finish('Delivered', { instanceId: first.instanceId });
      await entities.IntegrationMessage.update(options.message.id, {
        ...route,
        status: 'Delivered',
        attempts: attempt,
        delivered_at: nowIso(),
        last_error: '',
        next_attempt_at: '',
        workflow_definition_id: first.definitionId,
        workflow_definition_name: first.definitionName,
        workflow_definition_version: first.version,
        workflow_instance_id: first.instanceId,
      });
      if (rule) await entities.OrchestrationRule.update(rule.id, { match_count: Number(rule.match_count || 0) + 1, last_matched_at: nowIso() });
      if (subscription) await entities.AutomationSubscription.update(subscription.id, {
        delivery_count: Number(subscription.delivery_count || 0) + 1, last_delivery_at: nowIso(),
      });
      return { ...done, status: 'Delivered', route, launched };
    };

    if (action === 'publishEvent') {
      configure(canConfigure(user), 'Your role cannot publish events.');
      const eventType = str(body.event_type_key)
        ? (await pageOf(entities.AutomationEventType, { tenant_id: tenantId, event_key: str(body.event_type_key) }, '-created_date', 1))[0]
        : await getOwn(entities.AutomationEventType, body.event_type_id, tenantId);
      if (!eventType) refuse('That event type is not in this business.', 404);
      if (eventType.status !== 'Active') refuse('This event type is retired and cannot carry new events.', 409);

      const fields = normaliseFields(eventType.payload_schema_json);
      const validated = validateEventPayload(eventType.payload_schema_json, body.payload || {});
      if (!validated.ok) refuse(validated.errors.join(' '));

      const key = await idempotencyKey({
        tenantId, eventKey: eventType.event_key,
        sourceRef: str(body.source_ref).slice(0, 200),
        occurredAt: str(body.occurred_at).slice(0, 40),
      });
      const existing = (await pageOf(entities.IntegrationMessage, { tenant_id: tenantId, idempotency_key: key }, '-created_date', 1))[0];
      if (existing) {
        return Response.json({
          saved: true, deduplicated: true, message: messageSummary(existing),
          detail: 'This event was already delivered for this business; nothing was routed twice.',
        });
      }

      const safe = redactPayload(validated.value);
      const maxAttempts = Math.min(10, Math.max(1, Number(body.max_attempts) || DEFAULT_MAX_ATTEMPTS));

      // Rate limit: the connector named by the caller, or the busiest connector recently used.
      let connector: any = null;
      if (str(body.connector_id)) connector = await requireOwn(entities.IntegrationConnector, body.connector_id, tenantId, 'connector');
      if (connector && connector.status !== 'Active') refuse('That connector is not active.', 409);
      const recent = await pageOf(entities.IntegrationMessage, {
        tenant_id: tenantId, ...(connector ? { connector_id: connector.id } : {}),
      }, '-created_date', 200);
      const limit = rateLimitState({
        attempts: recent.map((row: any) => row.created_date).filter(Boolean),
        limitPerMinute: connector?.rate_limit_per_minute || DEFAULT_RATE_LIMIT,
      });
      if (!limit.allowed) {
        return Response.json({
          saved: false,
          error: `Rate limit reached for this ${connector ? 'connector' : 'business'} (${limit.used} of ${limit.limit} in the last minute). Try again in ${limit.retryAfterSeconds}s.`,
          rateLimit: limit,
        }, { status: 429 });
      }

      const message = await entities.IntegrationMessage.create({
        tenant_id: tenantId,
        message_ref: messageRef(),
        trace_id: `trace-${key.replace(/^[a-z0-9]+:/, '').slice(0, 24)}`,
        event_key: eventType.event_key,
        event_type_name: eventType.name,
        event_schema_version: Number(eventType.schema_version || 1),
        direction: 'Inbound',
        source_ref: str(body.source_ref).slice(0, 200),
        status: 'Queued',
        payload_json: JSON.stringify(safe.payload),
        payload_hash: await hashText(JSON.stringify(safe.payload)),
        redacted_fields_json: JSON.stringify(safe.redactedFields),
        redacted_count: safe.redactedCount,
        attempts: 0,
        max_attempts: maxAttempts,
        next_attempt_at: '',
        last_error: '',
        connector_id: connector?.id || '',
        connector_name: connector?.name || '',
        idempotency_key: key,
        replay_count: 0,
        published_by: actor,
        published_by_id: user.id,
        notes: fields.ok ? `Payload contract v${eventType.schema_version}` : '',
      });

      const result = await attemptDelivery({ message, eventType, payload: safe.payload, attempt: 1, maxAttempts });

      await audit(base44, user, 'Automation fabric: event routed', 'IntegrationMessage', message, {
        trace_id: message.trace_id, event_key: eventType.event_key, status: result.status,
        redacted: safe.redactedCount, workflow_instance_id: result.launched?.[0]?.instanceId || '',
        workflow_version: result.launched?.[0]?.version ?? null, detail: result.detail || '',
        unknown_fields: validated.unknownFields.slice(0, 10),
      });

      const stored = await entities.IntegrationMessage.get(message.id);
      return Response.json({
        saved: true,
        message: messageSummary(stored),
        status: result.status,
        detail: result.detail || '',
        redactedFields: safe.redactedFields,
        workflow: result.launched?.[0] || null,
        rateLimit: limit,
      });
    }

    if (action === 'retryMessage') {
      configure(canConfigure(user), 'Your role cannot retry deliveries.');
      const message = await requireOwn(entities.IntegrationMessage, body.message_id, tenantId, 'message');
      if (['Delivered', 'Suppressed'].includes(message.status)) refuse('This message is already settled; use replay to send it again.', 409);
      const eventType = (await pageOf(entities.AutomationEventType, { tenant_id: tenantId, event_key: message.event_key }, '-created_date', 1))[0];
      if (!eventType) refuse('The event type for this message no longer exists.', 409);

      const attempt = Number(message.attempts || 0) + 1;
      const payload = parseJson(message.payload_json, {});
      const result = await attemptDelivery({
        message, eventType, payload, attempt, maxAttempts: Number(message.max_attempts || DEFAULT_MAX_ATTEMPTS),
      });
      await audit(base44, user, 'Automation fabric: delivery retried', 'IntegrationMessage', message, {
        trace_id: message.trace_id, attempt, status: result.status, detail: result.detail || '',
      });
      const stored = await entities.IntegrationMessage.get(message.id);
      return Response.json({ saved: true, message: messageSummary(stored), status: result.status, detail: result.detail || '' });
    }

    if (action === 'replayMessage') {
      configure(canConfigure(user), 'Your role cannot replay messages.');
      const original = await requireOwn(entities.IntegrationMessage, body.message_id, tenantId, 'message');
      const eventType = (await pageOf(entities.AutomationEventType, { tenant_id: tenantId, event_key: original.event_key }, '-created_date', 1))[0];
      if (!eventType) refuse('The event type for this message no longer exists.', 409);
      if (eventType.status !== 'Active') refuse('This event type is retired, so the message cannot be replayed.', 409);

      const payload = parseJson(original.payload_json, {});
      const key = await idempotencyKey({
        tenantId, eventKey: original.event_key,
        sourceRef: `${original.message_ref}:replay:${Number(original.replay_count || 0) + 1}`,
        occurredAt: nowIso(),
      });
      const replay = await entities.IntegrationMessage.create({
        tenant_id: tenantId,
        message_ref: messageRef(),
        trace_id: `trace-${key.replace(/^[a-z0-9]+:/, '').slice(0, 24)}`,
        event_key: original.event_key,
        event_type_name: original.event_type_name || eventType.name,
        event_schema_version: Number(original.event_schema_version || eventType.schema_version || 1),
        direction: original.direction || 'Inbound',
        source_ref: `${original.source_ref || 'replay'} (replay of ${original.message_ref})`.slice(0, 200),
        status: 'Queued',
        payload_json: original.payload_json,
        payload_hash: original.payload_hash || '',
        redacted_fields_json: original.redacted_fields_json || '[]',
        redacted_count: Number(original.redacted_count || 0),
        attempts: 0,
        max_attempts: Number(original.max_attempts || DEFAULT_MAX_ATTEMPTS),
        connector_id: original.connector_id || '',
        connector_name: original.connector_name || '',
        idempotency_key: key,
        replay_of_id: original.id,
        replay_count: 0,
        published_by: actor,
        published_by_id: user.id,
        notes: str(body.note).slice(0, 500) || `Replay of ${original.message_ref}`,
      });

      await entities.IntegrationMessage.update(original.id, { replay_count: Number(original.replay_count || 0) + 1 });
      const result = await attemptDelivery({
        message: replay, eventType, payload, attempt: 1, maxAttempts: Number(replay.max_attempts || DEFAULT_MAX_ATTEMPTS),
      });
      await audit(base44, user, 'Automation fabric: message replayed', 'IntegrationMessage', replay, {
        replay_of: original.message_ref, trace_id: replay.trace_id, status: result.status,
        workflow_instance_id: result.launched?.[0]?.instanceId || '',
      });
      const stored = await entities.IntegrationMessage.get(replay.id);
      return Response.json({ saved: true, message: messageSummary(stored), status: result.status, detail: result.detail || '' });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    const status = error instanceof Refusal || [400, 401, 403, 404, 409, 422].includes(error?.status)
      ? Number(error.status) || 400
      : 500;
    const message = status === 500
      ? 'The automation fabric could not complete that. Refresh and try again, or tell your administrator.'
      : sanitiseReason(error?.message || 'That action is not available.');
    return Response.json({ error: message }, { status });
  }
});