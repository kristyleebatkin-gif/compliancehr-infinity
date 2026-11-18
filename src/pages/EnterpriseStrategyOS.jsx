import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Compass, Link2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StrategyKpiStrip from '@/components/strategy/StrategyKpiStrip';
import BoardStrategyView from '@/components/strategy/BoardStrategyView';
import PortfolioTable from '@/components/strategy/PortfolioTable';
import ProgramTable from '@/components/strategy/ProgramTable';
import ObjectiveTable from '@/components/strategy/ObjectiveTable';
import BenefitTable from '@/components/strategy/BenefitTable';
import CapabilityTable from '@/components/strategy/CapabilityTable';
import AssessmentTable from '@/components/strategy/AssessmentTable';
import RoadmapTable from '@/components/strategy/RoadmapTable';
import StrategyAuditTable from '@/components/strategy/StrategyAuditTable';
import PortfolioDialog from '@/components/strategy/PortfolioDialog';
import ProgramDialog from '@/components/strategy/ProgramDialog';
import ObjectiveDialog from '@/components/strategy/ObjectiveDialog';
import BenefitDialog from '@/components/strategy/BenefitDialog';
import CapabilityDialog from '@/components/strategy/CapabilityDialog';
import AssessmentDialog from '@/components/strategy/AssessmentDialog';
import RoadmapDialog from '@/components/strategy/RoadmapDialog';
import RoadmapDecisionDialog from '@/components/strategy/RoadmapDecisionDialog';
import StrategyReasonDialog from '@/components/strategy/StrategyReasonDialog';

const EMPTY = {
  portfolios: [], programs: [], objectives: [], benefits: [], capabilities: [], assessments: [], roadmaps: [], audit: [],
  rollups: [], capabilityRollups: [], dueObjectives: [], meta: {}, counts: {}, canEdit: false, canApprove: false,
};

const closed = { open: false, record: null };
const REASON_STATUSES = ['Active', 'Closed', 'Achieved', 'Archived'];

export default function EnterpriseStrategyOS() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [portfolioState, setPortfolioState] = useState(closed);
  const [programState, setProgramState] = useState(closed);
  const [objectiveState, setObjectiveState] = useState(closed);
  const [benefitState, setBenefitState] = useState(closed);
  const [capabilityState, setCapabilityState] = useState(closed);
  const [assessmentState, setAssessmentState] = useState({ open: false, capability: null });
  const [roadmapState, setRoadmapState] = useState(closed);
  const [decisionState, setDecisionState] = useState({ open: false, roadmap: null, outcome: 'Approved' });
  const [reason, setReason] = useState({ open: false, config: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('enterpriseStrategy', { action: 'list' });
      const payload = response?.data || {};
      if (payload.error) setError(payload.error);
      else { setError(''); setData({ ...EMPTY, ...payload }); }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The strategy workspace is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (payload) => {
    setBusy(true);
    setActionError('');
    try {
      const response = await base44.functions.invoke('enterpriseStrategy', payload);
      const result = response?.data || {};
      if (result.error) { setActionError(result.error); return null; }
      await load();
      return result;
    } catch (e) {
      setActionError(e?.response?.data?.error || e?.message || 'That change could not be saved.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const views = useMemo(() => {
    const portfolios = {};
    const objectives = {};
    const benefits = {};
    const capabilities = {};
    (data.rollups || []).forEach((portfolio) => {
      portfolios[portfolio.id] = portfolio;
      portfolio.programs.forEach((program) => {
        program.objectives.forEach((objective) => {
          objectives[objective.id] = objective;
          objective.benefits.forEach((benefit) => { benefits[benefit.id] = benefit; });
        });
      });
    });
    (data.capabilityRollups || []).forEach((row) => { capabilities[row.id] = row; });
    return { portfolios, objectives, benefits, capabilities };
  }, [data.rollups, data.capabilityRollups]);

  const ask = (config) => { setActionError(''); setReason({ open: true, config }); };
  const submitReason = async (note) => {
    const config = reason.config;
    if (!config) return;
    const result = await config.submit(note);
    if (result) setReason({ open: false, config: null });
  };

  const setStatus = (kind, row, status) => {
    const payload = { action: `set${kind}Status`, [`${kind.toLowerCase()}_id`]: row.id, status };
    if (!REASON_STATUSES.includes(status)) return run(payload);
    return ask({
      title: `${status === 'Archived' ? 'Archive' : `Set ${status}`}: ${row.name}`,
      description: status === 'Archived'
        ? 'An archived record leaves the rollups but is kept in the register and the audit trail.'
        : 'This status change sets work in motion or closes it, so it needs management approval and a recorded reason.',
      label: 'Why this status is changing',
      submitLabel: status,
      submit: (note) => run({ ...payload, reason: note }),
    });
  };

  const reviewBenefit = (row, reviewStatus) => ask({
    title: `${reviewStatus} benefit: ${row.name}`,
    description: 'A benefit only counts toward the portfolio once it is validated, so the reason for this review is kept on the record.',
    label: 'Review reason',
    submitLabel: reviewStatus,
    submit: (note) => run({ action: 'reviewBenefit', benefit_id: row.id, review_status: reviewStatus, reason: note }),
  });

  const validateAssessment = (row) => ask({
    title: `Validate assessment for ${row.capability_name}`,
    description: 'A validated assessment becomes the capability maturity, and it counts as evidence backed only when it carries evidence references.',
    label: 'Validation note',
    submitLabel: 'Validate assessment',
    submit: (note) => run({ action: 'validateAssessment', assessment_id: row.id, note }),
  });

  const savePortfolio = async (payload) => { const r = await run({ action: 'savePortfolio', ...payload }); if (r) setPortfolioState(closed); };
  const saveProgram = async (payload) => { const r = await run({ action: 'saveProgram', ...payload }); if (r) setProgramState(closed); };
  const saveObjective = async (payload) => { const r = await run({ action: 'saveObjective', ...payload }); if (r) setObjectiveState(closed); };
  const saveBenefit = async (payload) => { const r = await run({ action: 'saveBenefit', ...payload }); if (r) setBenefitState(closed); };
  const saveCapability = async (payload) => { const r = await run({ action: 'saveCapability', ...payload }); if (r) setCapabilityState(closed); };
  const saveAssessment = async (payload) => { const r = await run({ action: 'recordAssessment', ...payload }); if (r) setAssessmentState({ open: false, capability: null }); };
  const saveRoadmap = async (payload) => { const r = await run({ action: 'saveRoadmap', ...payload }); if (r) setRoadmapState(closed); };

  const submitRoadmap = (row) => run({ action: 'submitRoadmap', roadmap_id: row.id });

  const decideRoadmap = async (note) => {
    const result = await run({ action: 'decideRoadmap', roadmap_id: decisionState.roadmap?.id, outcome: decisionState.outcome, reason: note });
    if (result) setDecisionState({ open: false, roadmap: null, outcome: 'Approved' });
  };

  const archiveRoadmap = (row) => ask({
    title: `Archive ${row.name}`,
    description: 'An archived roadmap leaves the register view but stays in the audit trail.',
    label: 'Why this roadmap is being archived',
    submitLabel: 'Archive roadmap',
    submit: (note) => run({ action: 'archiveRoadmap', roadmap_id: row.id, reason: note }),
  });

  const notice = (
    <div className="space-y-3">
      <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="text-xs font-bold text-amber-900">
          This OS records strategy and authorises it; it starts no work. Activating a portfolio, closing a program or approving a roadmap needs a manager or administrator, and the reason is kept.
        </p>
      </div>
      <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-700" />
        <p className="text-xs font-bold text-[#0A2B6D]">
          Decisions, risks, compliance controls, evidence, workflows and AI recommendations are linked by reference only. Their registers stay the single source of truth, and nothing here invents a baseline, an actual or a maturity score.
        </p>
      </div>
    </div>
  );

  const tabs = (
    <Tabs defaultValue="board">
      <TabsList className="flex-wrap">
        <TabsTrigger value="board">Board view</TabsTrigger>
        <TabsTrigger value="portfolios">Portfolios ({data.counts.portfolios ?? 0})</TabsTrigger>
        <TabsTrigger value="programs">Programs ({data.counts.programs ?? 0})</TabsTrigger>
        <TabsTrigger value="objectives">Objectives ({data.counts.objectives ?? 0})</TabsTrigger>
        <TabsTrigger value="benefits">Benefits ({data.counts.benefits ?? 0})</TabsTrigger>
        <TabsTrigger value="capabilities">Capabilities ({data.counts.capabilities ?? 0})</TabsTrigger>
        <TabsTrigger value="assessments">Assessments ({data.counts.assessments ?? 0})</TabsTrigger>
        <TabsTrigger value="roadmaps">Roadmaps ({data.counts.roadmaps ?? 0})</TabsTrigger>
        <TabsTrigger value="audit">Audit trail ({data.counts.auditRecords ?? 0})</TabsTrigger>
      </TabsList>

      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
      {actionError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{actionError}</p>}
      {!data.canApprove && !loading && (
        <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-[#0A2B6D]/80">
          You can record and edit strategy here. Status changes that set work in motion, and roadmap approvals, are made by a manager or administrator.
        </p>
      )}

      {loading ? <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading the strategy register…</p> : (
        <>
          <TabsContent value="board" className="mt-4">
            <BoardStrategyView
              rollups={data.rollups}
              dueObjectives={data.dueObjectives}
              capabilityRollups={data.capabilityRollups}
              meta={data.meta}
              counts={data.counts}
            />
          </TabsContent>
          <TabsContent value="portfolios" className="mt-4">
            <PortfolioTable
              portfolios={data.portfolios} views={views.portfolios} canEdit={data.canEdit}
              onNew={() => { setActionError(''); setPortfolioState({ open: true, record: null }); }}
              onEdit={(row) => { setActionError(''); setPortfolioState({ open: true, record: row }); }}
              onStatus={(row, status) => setStatus('Portfolio', row, status)}
            />
          </TabsContent>
          <TabsContent value="programs" className="mt-4">
            <ProgramTable
              programs={data.programs} portfolios={data.portfolios.filter((row) => row.status !== 'Archived')} canEdit={data.canEdit}
              onNew={() => { setActionError(''); setProgramState({ open: true, record: null }); }}
              onEdit={(row) => { setActionError(''); setProgramState({ open: true, record: row }); }}
              onStatus={(row, status) => setStatus('Program', row, status)}
            />
          </TabsContent>
          <TabsContent value="objectives" className="mt-4">
            <ObjectiveTable
              objectives={data.objectives} views={views.objectives}
              programs={data.programs.filter((row) => row.status !== 'Archived')}
              statuses={data.meta.objectiveStatuses || []} canEdit={data.canEdit}
              onNew={() => { setActionError(''); setObjectiveState({ open: true, record: null }); }}
              onEdit={(row) => { setActionError(''); setObjectiveState({ open: true, record: row }); }}
              onStatus={(row, status) => setStatus('Objective', row, status)}
            />
          </TabsContent>
          <TabsContent value="benefits" className="mt-4">
            <BenefitTable
              benefits={data.benefits} views={views.benefits}
              objectives={data.objectives.filter((row) => row.status !== 'Archived')} canEdit={data.canEdit}
              onNew={() => { setActionError(''); setBenefitState({ open: true, record: null }); }}
              onEdit={(row) => { setActionError(''); setBenefitState({ open: true, record: row }); }}
              onReview={(row, reviewStatus) => reviewBenefit(row, reviewStatus)}
            />
          </TabsContent>
          <TabsContent value="capabilities" className="mt-4">
            <CapabilityTable
              capabilities={data.capabilities} views={views.capabilities} canEdit={data.canEdit}
              onNew={() => { setActionError(''); setCapabilityState({ open: true, record: null }); }}
              onEdit={(row) => { setActionError(''); setCapabilityState({ open: true, record: row }); }}
              onStatus={(row, status) => setStatus('Capability', row, status)}
              onAssess={(row) => { setActionError(''); setAssessmentState({ open: true, capability: row }); }}
            />
          </TabsContent>
          <TabsContent value="assessments" className="mt-4">
            <AssessmentTable
              assessments={data.assessments} capabilities={data.capabilities.filter((row) => row.status !== 'Archived')} canEdit={data.canEdit}
              onNew={() => { setActionError(''); setAssessmentState({ open: true, capability: null }); }}
              onValidate={validateAssessment}
            />
          </TabsContent>
          <TabsContent value="roadmaps" className="mt-4">
            <RoadmapTable
              roadmaps={data.roadmaps} programs={data.programs.filter((row) => row.status !== 'Archived')}
              canEdit={data.canEdit} canApprove={data.canApprove}
              onNew={() => { setActionError(''); setRoadmapState({ open: true, record: null }); }}
              onEdit={(row) => { setActionError(''); setRoadmapState({ open: true, record: row }); }}
              onSubmit={submitRoadmap}
              onDecide={(row, outcome) => { setActionError(''); setDecisionState({ open: true, roadmap: row, outcome }); }}
              onArchive={archiveRoadmap}
            />
          </TabsContent>
          <TabsContent value="audit" className="mt-4">
            <StrategyAuditTable records={data.audit} />
          </TabsContent>
        </>
      )}
    </Tabs>
  );

  return (
    <>
      <ModuleShell
        title="Enterprise Strategy & Transformation OS"
        subtitle="Portfolios, programs, objectives and benefits, with capability maturity and versioned roadmaps: rolled up from real measures, linked by reference to the registers you already keep, and approved by a person."
        icon={Compass}
        moduleKey="enterprise-strategy"
        workspaceKey="enterprise-strategy"
        search={null}
        actions={null}
        insight={<StrategyKpiStrip counts={data.counts} />}
        tabs={tabs}
      >
        {notice}
      </ModuleShell>

      <PortfolioDialog open={portfolioState.open} onOpenChange={(open) => setPortfolioState(open ? portfolioState : closed)} portfolio={portfolioState.record} busy={busy} error={actionError} onSave={savePortfolio} />
      <ProgramDialog open={programState.open} onOpenChange={(open) => setProgramState(open ? programState : closed)} program={programState.record} portfolios={data.portfolios.filter((row) => row.status !== 'Archived')} busy={busy} error={actionError} onSave={saveProgram} />
      <ObjectiveDialog open={objectiveState.open} onOpenChange={(open) => setObjectiveState(open ? objectiveState : closed)} objective={objectiveState.record} programs={data.programs.filter((row) => row.status !== 'Archived')} meta={data.meta} busy={busy} error={actionError} onSave={saveObjective} />
      <BenefitDialog open={benefitState.open} onOpenChange={(open) => setBenefitState(open ? benefitState : closed)} benefit={benefitState.record} objectives={data.objectives.filter((row) => row.status !== 'Archived')} meta={data.meta} busy={busy} error={actionError} onSave={saveBenefit} />
      <CapabilityDialog open={capabilityState.open} onOpenChange={(open) => setCapabilityState(open ? capabilityState : closed)} capability={capabilityState.record} meta={data.meta} busy={busy} error={actionError} onSave={saveCapability} />
      <AssessmentDialog
        open={assessmentState.open}
        onOpenChange={(open) => setAssessmentState(open ? assessmentState : { open: false, capability: null })}
        capability={assessmentState.capability}
        capabilities={data.capabilities.filter((row) => row.status !== 'Archived')}
        meta={data.meta} busy={busy} error={actionError} onSave={saveAssessment}
      />
      <RoadmapDialog open={roadmapState.open} onOpenChange={(open) => setRoadmapState(open ? roadmapState : closed)} roadmap={roadmapState.record} programs={data.programs.filter((row) => row.status !== 'Archived')} meta={data.meta} busy={busy} error={actionError} onSave={saveRoadmap} />
      <RoadmapDecisionDialog
        open={decisionState.open}
        onOpenChange={(open) => setDecisionState(open ? decisionState : { open: false, roadmap: null, outcome: 'Approved' })}
        roadmap={decisionState.roadmap} outcome={decisionState.outcome} busy={busy} error={actionError} onSubmit={decideRoadmap}
      />
      <StrategyReasonDialog
        open={reason.open}
        onOpenChange={(open) => setReason(open ? reason : { open: false, config: null })}
        title={reason.config?.title}
        description={reason.config?.description}
        label={reason.config?.label}
        submitLabel={reason.config?.submitLabel}
        busy={busy}
        error={actionError}
        onSubmit={submitReason}
      />
    </>
  );
}