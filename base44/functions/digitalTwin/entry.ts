import { perBusiness, createScopedClientFromRequest } from '../../shared/tenantScope.ts';
import {
  hasApprovedAccess, resolveUserTenantId, COMPLIANCE_REVIEW_ROLES, MANAGEMENT_ROLES,
} from '../../shared/roleMatrix.ts';
import { str, dateOnly, nowIso, writeAudit } from '../../shared/registerCommon.ts';
import {
  METRICS, ENGINE_VERSION, ESTIMATE_NOTICE, parseJson,
  computeObservations, simulate, validateModelMetrics, validateLevers,
} from '../../shared/digitalTwin.ts';

const canBuild = (user: any) => COMPLIANCE_REVIEW_ROLES.includes(user.role);
const canApprove = (user: any) => MANAGEMENT_ROLES.includes(user.role);

const getOwn = async (dao: any, id: string, tenantId: string) => {
  const record = await dao.get(id).catch((e: any) => (e?.status === 404 ? null : Promise.reject(e)));
  return record && record.tenant_id === tenantId ? record : null;
};

const audit = (base44: any, user: any, action: string, entityType: string, record: any, details: any) =>
  writeAudit(base44, user, { action, entityType, record, details, route: '/digital-twin' });

export default perBusiness(async function (req: Request) {
  try {
    const base44 = createScopedClientFromRequest(req);
    const user = await base44.auth.me().catch((e: any) => (e?.status === 401 ? null : Promise.reject(e)));
    if (!user) return Response.json({ error: 'Sign in to use the digital twin.' }, { status: 401 });
    const own = resolveUserTenantId(user);
    if (!hasApprovedAccess(user) || !own || own !== base44.businessId || !canBuild(user)) {
      return Response.json({ error: 'Approved compliance access to your assigned business is required.' }, { status: 403 });
    }
    const tenantId = base44.businessId;
    const entities = base44.asServiceRole.entities;
    const body = await req.json().catch(() => ({}));
    const action = str(body.action) || 'list';
    const actor = user.full_name || user.email || '';

    if (action === 'list') {
      const [modelsPage, scenariosPage, runsPage, observations] = await Promise.all([
        entities.DigitalTwinModel.filter({ tenant_id: tenantId }, { sort: '-created_date', limit: 200 }),
        entities.DigitalTwinScenario.filter({ tenant_id: tenantId }, { sort: '-updated_date', limit: 200 }),
        entities.SimulationRun.filter({ tenant_id: tenantId }, { sort: '-started_at', limit: 100 }),
        computeObservations(entities, tenantId),
      ]);
      const models = modelsPage?.items || [];
      const scenarios = scenariosPage?.items || [];
      const runs = runsPage?.items || [];
      const latestRun = runs[0] || null;
      return Response.json({
        saved: true,
        role: user.role,
        canBuild: canBuild(user),
        canApprove: canApprove(user),
        models,
        scenarios,
        runs,
        observations,
        metricsCatalogue: METRICS,
        estimateNotice: ESTIMATE_NOTICE,
        engineVersion: ENGINE_VERSION,
        counts: {
          models: models.length,
          approvedModels: models.filter((row: any) => row.status === 'Approved').length,
          draftModels: models.filter((row: any) => row.status === 'Draft').length,
          scenarios: scenarios.length,
          approvedScenarios: scenarios.filter((row: any) => row.status === 'Approved').length,
          runs: runs.length,
          latestProjected: latestRun ? latestRun.index_projected ?? null : null,
          latestBaseline: latestRun ? latestRun.index_baseline ?? null : null,
          latestConfidence: latestRun ? latestRun.confidence ?? null : null,
          latestRunAt: latestRun?.completed_at || latestRun?.started_at || '',
          inputsWithData: Object.values(observations.metrics).filter((row: any) => row.value !== null).length,
        },
      });
    }

    /* -------------------------------------------------------------------------------------
     * Models
     * -----------------------------------------------------------------------------------*/

    if (action === 'createModel') {
      const name = str(body.name).slice(0, 160);
      if (name.length < 4) return Response.json({ error: 'Give the model a name of at least 4 characters.' }, { status: 400 });
      const validated = validateModelMetrics(body.metrics);
      if ((validated as any).error) return Response.json({ error: (validated as any).error }, { status: 400 });
      const assumptions = str(body.assumptions).slice(0, 4000);
      if (assumptions.length < 10) {
        return Response.json({ error: 'State the assumptions this model rests on. An estimate without stated assumptions is not reviewable.' }, { status: 400 });
      }
      const total = await entities.DigitalTwinModel.count({ tenant_id: tenantId });
      const model = await entities.DigitalTwinModel.create({
        tenant_id: tenantId,
        model_key: `TWIN-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        name,
        version: 1,
        domain: str(body.domain).slice(0, 120),
        purpose: str(body.purpose).slice(0, 1000),
        description: str(body.description).slice(0, 4000),
        metrics_json: JSON.stringify((validated as any).metrics),
        metric_count: (validated as any).metrics.length,
        assumptions,
        confidence_note: str(body.confidence_note).slice(0, 1000),
        horizon: str(body.horizon).slice(0, 200),
        status: 'Draft',
        author: actor,
        author_id: user.id,
        change_note: str(body.change_note).slice(0, 400) || 'First version.',
        review_due: dateOnly(body.review_due),
        engine_version: ENGINE_VERSION,
        notes: str(body.notes).slice(0, 2000),
      });
      await audit(base44, user, 'Digital twin: model created', 'DigitalTwinModel', model, {
        model: model.name, version: model.version, inputs: model.metric_count,
      });
      return Response.json({ saved: true, model });
    }

    if (action === 'updateModel') {
      const model = await getOwn(entities.DigitalTwinModel, str(body.model_id), tenantId);
      if (!model) return Response.json({ error: 'That model is not in your business.' }, { status: 404 });
      if (model.status !== 'Draft') {
        return Response.json({ error: 'A validated or approved model cannot be edited. Save it as a new version instead.' }, { status: 409 });
      }
      const patch: any = {};
      if ('name' in body) {
        const name = str(body.name).slice(0, 160);
        if (name.length < 4) return Response.json({ error: 'Give the model a name of at least 4 characters.' }, { status: 400 });
        patch.name = name;
      }
      if ('metrics' in body) {
        const validated = validateModelMetrics(body.metrics);
        if ((validated as any).error) return Response.json({ error: (validated as any).error }, { status: 400 });
        patch.metrics_json = JSON.stringify((validated as any).metrics);
        patch.metric_count = (validated as any).metrics.length;
      }
      if ('assumptions' in body) {
        const assumptions = str(body.assumptions).slice(0, 4000);
        if (assumptions.length < 10) return Response.json({ error: 'State the assumptions this model rests on.' }, { status: 400 });
        patch.assumptions = assumptions;
      }
      if ('domain' in body) patch.domain = str(body.domain).slice(0, 120);
      if ('purpose' in body) patch.purpose = str(body.purpose).slice(0, 1000);
      if ('description' in body) patch.description = str(body.description).slice(0, 4000);
      if ('confidence_note' in body) patch.confidence_note = str(body.confidence_note).slice(0, 1000);
      if ('horizon' in body) patch.horizon = str(body.horizon).slice(0, 200);
      if ('review_due' in body) patch.review_due = dateOnly(body.review_due);
      if ('change_note' in body) patch.change_note = str(body.change_note).slice(0, 400);
      if (!Object.keys(patch).length) return Response.json({ error: 'Nothing to update.' }, { status: 400 });
      const updated = await entities.DigitalTwinModel.update(model.id, patch);
      await audit(base44, user, 'Digital twin: draft model updated', 'DigitalTwinModel', updated, {
        model: updated.name, version: updated.version, fields: Object.keys(patch),
      });
      return Response.json({ saved: true, model: updated });
    }

    if (action === 'reviseModel') {
      const model = await getOwn(entities.DigitalTwinModel, str(body.model_id), tenantId);
      if (!model) return Response.json({ error: 'That model is not in your business.' }, { status: 404 });
      const changeNote = str(body.change_note).slice(0, 400);
      if (changeNote.length < 6) return Response.json({ error: 'Record what changes in the new version.' }, { status: 400 });
      const validated = validateModelMetrics(parseJson(model.metrics_json, []));
      if ((validated as any).error) return Response.json({ error: (validated as any).error }, { status: 400 });
      const revision = await entities.DigitalTwinModel.create({
        tenant_id: tenantId,
        model_key: model.model_key,
        name: model.name,
        version: Number(model.version || 1) + 1,
        domain: model.domain || '',
        purpose: model.purpose || '',
        description: model.description || '',
        metrics_json: model.metrics_json,
        metric_count: model.metric_count || 0,
        assumptions: model.assumptions || '',
        confidence_note: model.confidence_note || '',
        horizon: model.horizon || '',
        status: 'Draft',
        author: actor,
        author_id: user.id,
        previous_version_id: model.id,
        change_note: changeNote,
        review_due: model.review_due || '',
        engine_version: ENGINE_VERSION,
        notes: model.notes || '',
      });
      await audit(base44, user, 'Digital twin: model revision opened', 'DigitalTwinModel', revision, {
        model: revision.name, from_version: model.version, to_version: revision.version, change_note: changeNote,
      });
      return Response.json({ saved: true, model: revision });
    }

    if (action === 'validateModel') {
      const model = await getOwn(entities.DigitalTwinModel, str(body.model_id), tenantId);
      if (!model) return Response.json({ error: 'That model is not in your business.' }, { status: 404 });
      if (model.status !== 'Draft') return Response.json({ error: 'Only a draft model can be validated.' }, { status: 409 });
      const note = str(body.note).slice(0, 2000);
      if (note.length < 4) return Response.json({ error: 'Record what you checked before validating.' }, { status: 400 });
      const updated = await entities.DigitalTwinModel.update(model.id, {
        status: 'Validated',
        reviewed_by: actor,
        reviewed_at: nowIso(),
        reviewed_note: note,
        change_note: model.change_note || '',
      });
      await audit(base44, user, 'Digital twin: model validated', 'DigitalTwinModel', updated, {
        model: updated.name, version: updated.version, note,
      });
      return Response.json({ saved: true, model: updated });
    }

    if (action === 'approveModel' || action === 'retireModel') {
      if (!canApprove(user)) {
        return Response.json({ error: 'Only Provider Administrator, Management or admin can approve or retire a model.' }, { status: 403 });
      }
      const model = await getOwn(entities.DigitalTwinModel, str(body.model_id), tenantId);
      if (!model) return Response.json({ error: 'That model is not in your business.' }, { status: 404 });
      const note = str(body.note).slice(0, 2000);

      if (action === 'retireModel') {
        if (!['Approved', 'Validated'].includes(model.status)) {
          return Response.json({ error: 'Only an approved or validated model can be retired.' }, { status: 409 });
        }
        if (note.length < 4) return Response.json({ error: 'Record why this model is retired.' }, { status: 400 });
        const retired = await entities.DigitalTwinModel.update(model.id, {
          status: 'Retired', retired_at: nowIso(), approval_note: note,
        });
        await audit(base44, user, 'Digital twin: model retired', 'DigitalTwinModel', retired, { model: retired.name, note });
        return Response.json({ saved: true, model: retired });
      }

      if (model.status !== 'Validated') {
        return Response.json({ error: 'Validate the model before it can be approved.' }, { status: 409 });
      }
      if (note.length < 4) return Response.json({ error: 'Record the approval note.' }, { status: 400 });
      const selfApproved = model.author_id === user.id;
      if (selfApproved && user.role !== 'admin') {
        return Response.json({ error: 'A model must be approved by someone other than its author.' }, { status: 403 });
      }
      const approved = await entities.DigitalTwinModel.update(model.id, {
        status: 'Approved',
        approved_by: actor,
        approved_by_id: user.id,
        approved_at: nowIso(),
        approval_note: note,
        approval_authority: selfApproved ? 'Administrator override' : 'Independent reviewer',
        self_approved: selfApproved,
      });
      // Exactly one approved version per model key: retire the version this one replaces.
      if (model.previous_version_id) {
        const previous = await getOwn(entities.DigitalTwinModel, model.previous_version_id, tenantId);
        if (previous && previous.status !== 'Retired') {
          await entities.DigitalTwinModel.update(previous.id, {
            status: 'Retired', retired_at: nowIso(), approval_note: `Superseded by version ${approved.version}.`,
          });
        }
      }
      await audit(base44, user, 'Digital twin: model approved', 'DigitalTwinModel', approved, {
        model: approved.name, version: approved.version, authority: approved.approval_authority, note,
      });
      return Response.json({ saved: true, model: approved });
    }

    /* -------------------------------------------------------------------------------------
     * Scenarios
     * -----------------------------------------------------------------------------------*/

    if (action === 'createScenario') {
      const model = await getOwn(entities.DigitalTwinModel, str(body.model_id), tenantId);
      if (!model) return Response.json({ error: 'Choose the model this scenario runs against.' }, { status: 404 });
      if (!['Validated', 'Approved'].includes(model.status)) {
        return Response.json({ error: 'Validate the model before it can be used by a scenario.' }, { status: 409 });
      }
      const name = str(body.name).slice(0, 160);
      if (name.length < 4) return Response.json({ error: 'Give the scenario a name of at least 4 characters.' }, { status: 400 });
      const levers = validateLevers(body.levers, parseJson(model.metrics_json, []));
      if ((levers as any).error) return Response.json({ error: (levers as any).error }, { status: 400 });
      const description = str(body.description).slice(0, 4000);
      if (description.length < 6) return Response.json({ error: 'Describe what this scenario tests.' }, { status: 400 });
      const total = await entities.DigitalTwinScenario.count({ tenant_id: tenantId });
      const scenario = await entities.DigitalTwinScenario.create({
        tenant_id: tenantId,
        scenario_key: `SCN-${new Date().getFullYear()}-${String(total + 1).padStart(3, '0')}`,
        name,
        version: 1,
        model_id: model.id,
        model_key: model.model_key || '',
        model_name: model.name,
        model_version: model.version,
        description,
        levers_json: JSON.stringify((levers as any).levers),
        lever_count: (levers as any).levers.length,
        baseline_note: str(body.baseline_note).slice(0, 2000),
        status: 'Draft',
        author: actor,
        author_id: user.id,
        run_count: 0,
        notes: str(body.notes).slice(0, 2000),
      });
      await audit(base44, user, 'Digital twin: scenario created', 'DigitalTwinScenario', scenario, {
        scenario: scenario.name, model: model.name, model_version: model.version, levers: scenario.lever_count,
      });
      return Response.json({ saved: true, scenario });
    }

    if (action === 'updateScenario') {
      const scenario = await getOwn(entities.DigitalTwinScenario, str(body.scenario_id), tenantId);
      if (!scenario) return Response.json({ error: 'That scenario is not in your business.' }, { status: 404 });
      if (!['Draft', 'Returned'].includes(scenario.status)) {
        return Response.json({ error: 'A submitted or approved scenario cannot be edited. Open a new version instead.' }, { status: 409 });
      }
      const model = await getOwn(entities.DigitalTwinModel, scenario.model_id, tenantId);
      if (!model) return Response.json({ error: 'The model behind this scenario is no longer available.' }, { status: 409 });
      const patch: any = {};
      if ('name' in body) {
        const name = str(body.name).slice(0, 160);
        if (name.length < 4) return Response.json({ error: 'Give the scenario a name of at least 4 characters.' }, { status: 400 });
        patch.name = name;
      }
      if ('description' in body) {
        const description = str(body.description).slice(0, 4000);
        if (description.length < 6) return Response.json({ error: 'Describe what this scenario tests.' }, { status: 400 });
        patch.description = description;
      }
      if ('levers' in body) {
        const levers = validateLevers(body.levers, parseJson(model.metrics_json, []));
        if ((levers as any).error) return Response.json({ error: (levers as any).error }, { status: 400 });
        patch.levers_json = JSON.stringify((levers as any).levers);
        patch.lever_count = (levers as any).levers.length;
      }
      if ('baseline_note' in body) patch.baseline_note = str(body.baseline_note).slice(0, 2000);
      if ('notes' in body) patch.notes = str(body.notes).slice(0, 2000);
      if (!Object.keys(patch).length) return Response.json({ error: 'Nothing to update.' }, { status: 400 });
      patch.status = 'Draft';
      const updated = await entities.DigitalTwinScenario.update(scenario.id, patch);
      await audit(base44, user, 'Digital twin: scenario updated', 'DigitalTwinScenario', updated, {
        scenario: updated.name, fields: Object.keys(patch),
      });
      return Response.json({ saved: true, scenario: updated });
    }

    if (action === 'reviseScenario') {
      const scenario = await getOwn(entities.DigitalTwinScenario, str(body.scenario_id), tenantId);
      if (!scenario) return Response.json({ error: 'That scenario is not in your business.' }, { status: 404 });
      const revision = await entities.DigitalTwinScenario.create({
        tenant_id: tenantId,
        scenario_key: scenario.scenario_key,
        name: scenario.name,
        version: Number(scenario.version || 1) + 1,
        model_id: scenario.model_id,
        model_key: scenario.model_key || '',
        model_name: scenario.model_name || '',
        model_version: scenario.model_version || 1,
        description: scenario.description || '',
        levers_json: scenario.levers_json,
        lever_count: scenario.lever_count || 0,
        baseline_note: scenario.baseline_note || '',
        status: 'Draft',
        author: actor,
        author_id: user.id,
        run_count: 0,
        notes: scenario.notes || '',
      });
      await audit(base44, user, 'Digital twin: scenario revision opened', 'DigitalTwinScenario', revision, {
        scenario: revision.name, from_version: scenario.version, to_version: revision.version,
      });
      return Response.json({ saved: true, scenario: revision });
    }

    if (action === 'submitScenario' || action === 'decideScenario') {
      const scenario = await getOwn(entities.DigitalTwinScenario, str(body.scenario_id), tenantId);
      if (!scenario) return Response.json({ error: 'That scenario is not in your business.' }, { status: 404 });

      if (action === 'submitScenario') {
        if (scenario.status !== 'Draft') return Response.json({ error: 'Only a draft scenario can be submitted.' }, { status: 409 });
        const submitted = await entities.DigitalTwinScenario.update(scenario.id, {
          status: 'Submitted', submitted_by: actor, submitted_at: nowIso(),
        });
        await audit(base44, user, 'Digital twin: scenario submitted', 'DigitalTwinScenario', submitted, { scenario: submitted.name });
        return Response.json({ saved: true, scenario: submitted });
      }

      if (!canApprove(user)) {
        return Response.json({ error: 'Only Provider Administrator, Management or admin can decide a scenario.' }, { status: 403 });
      }
      if (scenario.status !== 'Submitted') {
        return Response.json({ error: 'Only a submitted scenario can be decided.' }, { status: 409 });
      }
      const decision = str(body.decision);
      if (!['Approved', 'Returned'].includes(decision)) return Response.json({ error: 'Choose approve or return.' }, { status: 400 });
      const note = str(body.note).slice(0, 2000);
      if (note.length < 4) return Response.json({ error: 'Record the reason for this decision.' }, { status: 400 });
      const selfApproved = scenario.author_id === user.id;
      if (decision === 'Approved' && selfApproved && user.role !== 'admin') {
        return Response.json({ error: 'A scenario must be decided by someone other than its author.' }, { status: 403 });
      }
      const decided = await entities.DigitalTwinScenario.update(scenario.id, {
        status: decision,
        decided_by: actor,
        decided_by_id: user.id,
        decided_at: nowIso(),
        decision_note: note,
        approval_authority: decision === 'Approved'
          ? (selfApproved ? 'Administrator override' : 'Independent reviewer')
          : 'Independent reviewer',
        self_approved: decision === 'Approved' ? selfApproved : false,
      });
      await audit(base44, user, `Digital twin: scenario ${decision.toLowerCase()}`, 'DigitalTwinScenario', decided, {
        scenario: decided.name, decision, note,
      });
      return Response.json({ saved: true, scenario: decided });
    }

    /* -------------------------------------------------------------------------------------
     * Simulation
     * -----------------------------------------------------------------------------------*/

    if (action === 'runSimulation') {
      const scenario = await getOwn(entities.DigitalTwinScenario, str(body.scenario_id), tenantId);
      if (!scenario) return Response.json({ error: 'That scenario is not in your business.' }, { status: 404 });
      const model = await getOwn(entities.DigitalTwinModel, scenario.model_id, tenantId);
      if (!model) return Response.json({ error: 'The model behind this scenario is no longer available.' }, { status: 409 });
      if (!['Validated', 'Approved'].includes(model.status)) {
        return Response.json({ error: 'The model must be validated before it can be run.' }, { status: 409 });
      }

      const startedAt = nowIso();
      const started = Date.now();
      const observations = await computeObservations(entities, tenantId);
      const outcome = simulate(
        { metrics_json: parseJson(model.metrics_json, []) },
        { levers_json: parseJson(scenario.levers_json, []) },
        observations,
      );
      if ((outcome as any).error) return Response.json({ error: (outcome as any).error }, { status: 400 });

      const total = await entities.SimulationRun.count({ tenant_id: tenantId });
      const run = await entities.SimulationRun.create({
        tenant_id: tenantId,
        run_ref: `SIM-${new Date().getFullYear()}-${String(total + 1).padStart(4, '0')}`,
        model_id: model.id,
        model_key: model.model_key || '',
        model_name: model.name,
        model_version: model.version,
        model_status_at_run: model.status,
        scenario_id: scenario.id,
        scenario_key: scenario.scenario_key || '',
        scenario_name: scenario.name,
        scenario_version: scenario.version,
        scenario_status_at_run: scenario.status,
        status: 'Completed',
        estimate_notice: ESTIMATE_NOTICE,
        inputs_json: JSON.stringify((outcome as any).results.map((row: any) => ({
          metric: row.metric, label: row.label, unit: row.unit, observed: row.observed, delta: row.delta,
          projected: row.projected, record_count: row.record_count, note: row.note, source: row.source,
          rationale: row.rationale, observed_as_of: observations.asOf,
        }))),
        assumptions_json: JSON.stringify([
          model.assumptions || 'No assumptions were recorded with this model.',
          scenario.baseline_note || 'The baseline is the observed value of each input at run time.',
          ESTIMATE_NOTICE,
        ]),
        results_json: JSON.stringify((outcome as any).results),
        index_baseline: (outcome as any).index_baseline,
        index_projected: (outcome as any).index_projected,
        index_delta: (outcome as any).index_delta,
        confidence: (outcome as any).confidence,
        data_completeness: (outcome as any).data_completeness,
        metrics_used: (outcome as any).metrics_used,
        metrics_missing: (outcome as any).metrics_missing,
        started_at: startedAt,
        completed_at: nowIso(),
        duration_ms: Date.now() - started,
        run_by: actor,
        run_by_id: user.id,
        engine_version: ENGINE_VERSION,
        notes: str(body.notes).slice(0, 2000),
      });
      await entities.DigitalTwinScenario.update(scenario.id, {
        run_count: (Number(scenario.run_count) || 0) + 1,
        last_run_at: run.completed_at,
      });
      await audit(base44, user, 'Digital twin: simulation run', 'SimulationRun', run, {
        run_ref: run.run_ref, scenario: run.scenario_name, model: run.model_name,
        model_version: run.model_version, scenario_version: run.scenario_version,
        index_baseline: run.index_baseline, index_projected: run.index_projected, confidence: run.confidence,
        estimate: true,
      });
      return Response.json({ saved: true, run, estimateNotice: ESTIMATE_NOTICE });
    }

    return Response.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error: any) {
    return Response.json({ error: error?.message || 'The digital twin is unavailable.' }, { status: 500 });
  }
});