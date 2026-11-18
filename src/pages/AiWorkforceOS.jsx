import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Bot, Send, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WorkforceKpiStrip from '@/components/workforce/WorkforceKpiStrip';
import DecisionTable from '@/components/workforce/DecisionTable';
import AgentTable from '@/components/workforce/AgentTable';
import PromptTable from '@/components/workforce/PromptTable';
import ToolTable from '@/components/workforce/ToolTable';
import PolicyTable from '@/components/workforce/PolicyTable';
import ModelTable from '@/components/workforce/ModelTable';
import AuditTable from '@/components/workforce/AuditTable';
import ModelDialog from '@/components/workforce/ModelDialog';
import PromptDialog from '@/components/workforce/PromptDialog';
import AgentDialog from '@/components/workforce/AgentDialog';
import ToolDialog from '@/components/workforce/ToolDialog';
import PolicyDialog from '@/components/workforce/PolicyDialog';
import RecordProposalDialog from '@/components/workforce/RecordProposalDialog';
import DecisionReviewDialog from '@/components/workforce/DecisionReviewDialog';
import DecisionDetailDialog from '@/components/workforce/DecisionDetailDialog';
import ReasonDialog from '@/components/workforce/ReasonDialog';

const EMPTY = {
  models: [], agents: [], prompts: [], tools: [], assignments: [], decisions: [], reviews: [], audit: [],
  meta: {}, counts: {}, canReview: false, canConfigureAgents: false, canManageModels: false, canGrantTools: false,
};

const closed = { open: false, record: null };

export default function AiWorkforceOS() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState(null);
  const [modelState, setModelState] = useState(closed);
  const [promptState, setPromptState] = useState(closed);
  const [agentState, setAgentState] = useState(closed);
  const [toolState, setToolState] = useState(closed);
  const [policyState, setPolicyState] = useState(closed);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [reviewState, setReviewState] = useState({ open: false, decision: null });
  const [detailState, setDetailState] = useState({ open: false, loading: false, detail: null });
  const [reason, setReason] = useState({ open: false, config: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('aiWorkforce', { action: 'list' });
      const payload = response?.data || {};
      if (payload.error) setError(payload.error);
      else { setError(''); setData({ ...EMPTY, ...payload }); }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The AI workforce is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (payload) => {
    setBusy(true);
    setActionError('');
    try {
      const response = await base44.functions.invoke('aiWorkforce', payload);
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

  const ask = (config) => { setActionError(''); setReason({ open: true, config }); };
  const submitReason = async (note) => {
    const config = reason.config;
    if (!config) return;
    const result = await config.submit(note);
    if (result) setReason({ open: false, config: null });
  };

  const openDecision = async (row) => {
    setDetailState({ open: true, loading: true, detail: null });
    try {
      const response = await base44.functions.invoke('aiWorkforce', { action: 'decision', decision_id: row.id });
      const payload = response?.data || {};
      setDetailState({ open: true, loading: false, detail: payload.error ? null : payload });
      if (payload.error) setActionError(payload.error);
    } catch (e) {
      setDetailState({ open: true, loading: false, detail: null });
      setActionError(e?.response?.data?.error || e?.message || 'That decision could not be read.');
    }
  };

  const submitProposal = async (payload) => {
    const result = await run({ action: 'submitDecision', ...payload });
    if (result) {
      setProposalOpen(false);
      setNotice({ verdict: result.verdict, reason: result.reason, deduplicated: Boolean(result.deduplicated) });
    }
  };

  const submitReview = async (payload) => {
    const result = await run({ action: 'reviewDecision', decision_id: reviewState.decision?.id, ...payload });
    if (result) setReviewState({ open: false, decision: null });
  };

  const saveModel = async (payload) => {
    const result = await run({ action: 'saveModel', ...payload });
    if (result) setModelState(closed);
  };

  const savePrompt = async (payload) => {
    const result = await run({ action: 'savePrompt', ...payload });
    if (result) setPromptState(closed);
  };

  const saveAgent = async (payload) => {
    const result = await run({ action: 'saveAgent', ...payload });
    if (result) setAgentState(closed);
  };

  const saveTool = async (payload) => {
    const result = await run({ action: 'saveTool', ...payload });
    if (result) setToolState(closed);
  };

  const savePolicy = async (payload) => {
    const result = await run({ action: 'saveAssignment', ...payload });
    if (result) setPolicyState(closed);
  };

  const agentStatus = (row, status) => {
    if (status === 'Active') return run({ action: 'setAgentStatus', agent_id: row.id, status });
    return ask({
      title: `${status === 'Paused' ? 'Pause' : 'Disable'} ${row.name}`,
      description: 'A paused or disabled agent cannot proceed with anything it produced. This is recorded, along with your reason.',
      label: `Why this agent is being ${status.toLowerCase()}`,
      submitLabel: `${status} agent`,
      submit: (note) => run({ action: 'setAgentStatus', agent_id: row.id, status, reason: note }),
    });
  };

  const actions = data.canConfigureAgents ? (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-[#0072FF] via-[#5A00D6] to-[#A100FF] px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"
        onClick={() => { setActionError(''); setNotice(null); setProposalOpen(true); }}
        disabled={loading || !data.counts.activeAgents}
      >
        <Send className="h-4 w-4" /> Record a proposal
      </button>
    </div>
  ) : null;

  const tabs = (
    <Tabs defaultValue="decisions">
      <TabsList className="flex-wrap">
        <TabsTrigger value="decisions">Decisions ({data.counts.decisions ?? 0})</TabsTrigger>
        <TabsTrigger value="agents">Agents ({data.counts.agents ?? 0})</TabsTrigger>
        <TabsTrigger value="prompts">Prompts ({data.counts.prompts ?? 0})</TabsTrigger>
        <TabsTrigger value="tools">Tools ({data.counts.tools ?? 0})</TabsTrigger>
        <TabsTrigger value="policies">Tool policies ({data.counts.assignments ?? 0})</TabsTrigger>
        <TabsTrigger value="models">Models ({data.counts.models ?? 0})</TabsTrigger>
        <TabsTrigger value="audit">Audit trail ({data.counts.auditRecords ?? 0})</TabsTrigger>
      </TabsList>

      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
      {actionError && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{actionError}</p>}
      {notice && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-[#0A2B6D]">
          <p className="font-bold">Policy verdict: {notice.verdict}</p>
          <p className="mt-0.5">{notice.reason}</p>
          {notice.deduplicated && <p className="mt-0.5 font-bold">This proposal was already recorded, so nothing was stored twice.</p>}
        </div>
      )}

      <TabsContent value="decisions" className="mt-4">
        {loading ? <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading decisions…</p> : (
          <DecisionTable
            decisions={data.decisions}
            canReview={data.canReview}
            onOpen={openDecision}
            onReview={(row) => { setActionError(''); setReviewState({ open: true, decision: row }); }}
          />
        )}
      </TabsContent>

      <TabsContent value="agents" className="mt-4">
        {loading ? <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading agents…</p> : (
          <AgentTable
            agents={data.agents}
            canConfigure={data.canConfigureAgents}
            onNew={() => { setActionError(''); setAgentState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setAgentState({ open: true, record: row }); }}
            onStatus={agentStatus}
          />
        )}
      </TabsContent>

      <TabsContent value="prompts" className="mt-4">
        {loading ? <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading prompts…</p> : (
          <PromptTable
            prompts={data.prompts}
            canConfigure={data.canConfigureAgents}
            onNew={(row) => { setActionError(''); setPromptState({ open: true, record: row || null }); }}
            onPublish={(row) => run({ action: 'publishPrompt', prompt_id: row.id })}
          />
        )}
      </TabsContent>

      <TabsContent value="tools" className="mt-4">
        {loading ? <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading tools…</p> : (
          <ToolTable
            tools={data.tools}
            canManage={data.canGrantTools}
            onNew={() => { setActionError(''); setToolState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setToolState({ open: true, record: row }); }}
          />
        )}
      </TabsContent>

      <TabsContent value="policies" className="mt-4">
        {loading ? <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading tool policies…</p> : (
          <PolicyTable
            assignments={data.assignments}
            canManage={data.canGrantTools}
            onNew={() => { setActionError(''); setPolicyState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setPolicyState({ open: true, record: row }); }}
            onStatus={(row, status) => run({ action: 'setAssignmentStatus', assignment_id: row.id, status })}
          />
        )}
      </TabsContent>

      <TabsContent value="models" className="mt-4">
        {loading ? <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading models…</p> : (
          <ModelTable
            models={data.models}
            canManage={data.canManageModels}
            onNew={() => { setActionError(''); setModelState({ open: true, record: null }); }}
            onEdit={(row) => { setActionError(''); setModelState({ open: true, record: row }); }}
            onValidate={(row) => ask({
              title: `Validate ${row.name}`,
              description: 'Validation checks the provider settings and that the credential is referenced by name. No provider call is made, and no claim is made that the provider is reachable.',
              label: 'What you checked',
              submitLabel: 'Validate model',
              submit: (note) => run({ action: 'validateModel', model_id: row.id, note }),
            })}
            onRetire={(row) => ask({
              title: `Retire ${row.name}`,
              description: 'A retired model cannot run an agent. Agents already paused keep their history.',
              label: 'Why this model is retired',
              submitLabel: 'Retire model',
              submit: (note) => run({ action: 'retireModel', model_id: row.id, note }),
            })}
          />
        )}
      </TabsContent>

      <TabsContent value="audit" className="mt-4">
        {loading ? <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading the audit trail…</p> : <AuditTable records={data.audit} />}
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      <ModuleShell
        title="Autonomous AI Workforce OS"
        subtitle="Models, agents, versioned prompts, tool policies and human review in one governed register: every proposal traced to the versions that produced it, redacted before storage, and settled by a person."
        icon={Bot}
        moduleKey="ai-workforce"
        workspaceKey="ai-workforce"
        search={null}
        actions={actions}
        insight={<WorkforceKpiStrip counts={data.counts} />}
        tabs={tabs}
      >
        <div className="space-y-3">
          <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-xs font-bold text-amber-900">
              This OS governs AI work; it does not perform it. It never calls a model, never starts a workflow and never carries out an action. Approving a decision authorises a person to act, and the record keeps saying the AI executed nothing.
            </p>
          </div>
          <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
            <p className="text-xs font-bold text-[#0A2B6D]">
              No agent can be granted autonomy over external, financial, employment, clinical, participant-impacting, permission-changing, destructive or compliance-status-changing work. Provider keys stay in the platform secret store; a record only ever names the secret.
            </p>
          </div>
        </div>
      </ModuleShell>

      <ModelDialog open={modelState.open} onOpenChange={(open) => setModelState(open ? modelState : closed)} model={modelState.record} meta={data.meta} busy={busy} error={actionError} onSave={saveModel} />

      <PromptDialog open={promptState.open} onOpenChange={(open) => setPromptState(open ? promptState : closed)} prompt={promptState.record} busy={busy} error={actionError} onSave={savePrompt} />

      <AgentDialog
        open={agentState.open}
        onOpenChange={(open) => setAgentState(open ? agentState : closed)}
        agent={agentState.record}
        models={data.models}
        prompts={data.prompts}
        meta={data.meta}
        busy={busy}
        error={actionError}
        onSave={saveAgent}
      />

      <ToolDialog open={toolState.open} onOpenChange={(open) => setToolState(open ? toolState : closed)} tool={toolState.record} meta={data.meta} busy={busy} error={actionError} onSave={saveTool} />

      <PolicyDialog
        open={policyState.open}
        onOpenChange={(open) => setPolicyState(open ? policyState : closed)}
        assignment={policyState.record}
        agents={data.agents}
        tools={data.tools}
        busy={busy}
        error={actionError}
        onSave={savePolicy}
      />

      <RecordProposalDialog
        open={proposalOpen}
        onOpenChange={setProposalOpen}
        agents={data.agents}
        tools={data.tools}
        busy={busy}
        error={actionError}
        onSubmit={submitProposal}
      />

      <DecisionReviewDialog
        open={reviewState.open}
        onOpenChange={(open) => setReviewState(open ? reviewState : { open: false, decision: null })}
        decision={reviewState.decision}
        meta={data.meta}
        busy={busy}
        error={actionError}
        onSubmit={submitReview}
      />

      <DecisionDetailDialog
        open={detailState.open}
        onOpenChange={(open) => setDetailState(open ? detailState : { open: false, loading: false, detail: null })}
        detail={detailState.detail}
        loading={detailState.loading}
      />

      <ReasonDialog
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