import React, { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, Boxes, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import TwinKpiStrip from '@/components/twin/TwinKpiStrip';
import ModelTable from '@/components/twin/ModelTable';
import ScenarioTable from '@/components/twin/ScenarioTable';
import RunTable from '@/components/twin/RunTable';
import ModelDialog from '@/components/twin/ModelDialog';
import ScenarioDialog from '@/components/twin/ScenarioDialog';
import DecisionDialog from '@/components/twin/DecisionDialog';
import RunDetailDialog from '@/components/twin/RunDetailDialog';

const EMPTY = {
  models: [], scenarios: [], runs: [], observations: { metrics: {} }, metricsCatalogue: [],
  counts: {}, canBuild: false, canApprove: false, estimateNotice: '', engineVersion: '',
};

export default function DigitalTwin() {
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const [modelState, setModelState] = useState({ open: false, model: null });
  const [scenarioState, setScenarioState] = useState({ open: false, scenario: null });
  const [decision, setDecision] = useState({ open: false, config: null });
  const [runDetail, setRunDetail] = useState({ open: false, run: null });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('digitalTwin', { action: 'list' });
      const payload = response?.data || {};
      if (payload.error) setError(payload.error);
      else {
        setError('');
        setData({ ...EMPTY, ...payload });
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The digital twin is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (payload) => {
    setBusy(true);
    setActionError('');
    try {
      const response = await base44.functions.invoke('digitalTwin', payload);
      const result = response?.data || {};
      if (result.error) {
        setActionError(result.error);
        return null;
      }
      await load();
      return result;
    } catch (e) {
      setActionError(e?.response?.data?.error || e?.message || 'That change could not be saved.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const ask = (config) => { setActionError(''); setDecision({ open: true, config }); };
  const closeDecision = () => setDecision({ open: false, config: null });

  const submitDecision = async ({ note, decision: choice }) => {
    const config = decision.config;
    if (!config) return;
    const result = await config.submit({ note, choice });
    if (result) closeDecision();
  };

  const saveModel = async (payload) => {
    const result = modelState.model
      ? await run({ action: 'updateModel', model_id: modelState.model.id, ...payload })
      : await run({ action: 'createModel', ...payload });
    if (result) setModelState({ open: false, model: null });
  };

  const saveScenario = async (payload) => {
    const result = scenarioState.scenario
      ? await run({ action: 'updateScenario', scenario_id: scenarioState.scenario.id, ...payload })
      : await run({ action: 'createScenario', ...payload });
    if (result) setScenarioState({ open: false, scenario: null });
  };

  const runScenario = async (row) => {
    const result = await run({ action: 'runSimulation', scenario_id: row.id });
    if (result?.run) setRunDetail({ open: true, run: result.run });
  };

  const actions = data.canBuild ? (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" onClick={() => { setActionError(''); setScenarioState({ open: true, scenario: null }); }} disabled={loading}>
        <Plus className="h-4 w-4" /> New scenario
      </Button>
      <Button onClick={() => { setActionError(''); setModelState({ open: true, model: null }); }} disabled={loading}>
        <Plus className="h-4 w-4" /> New model
      </Button>
    </div>
  ) : null;

  const inputs = data.metricsCatalogue.map((entry) => ({
    ...entry,
    observed: data.observations?.metrics?.[entry.key] || null,
  }));

  const tabs = (
    <Tabs defaultValue="runs">
      <TabsList className="flex-wrap">
        <TabsTrigger value="runs">Simulations ({data.counts.runs ?? 0})</TabsTrigger>
        <TabsTrigger value="scenarios">Scenarios ({data.counts.scenarios ?? 0})</TabsTrigger>
        <TabsTrigger value="models">Models ({data.counts.models ?? 0})</TabsTrigger>
        <TabsTrigger value="inputs">Observed inputs ({data.counts.inputsWithData ?? 0} with data)</TabsTrigger>
      </TabsList>

      {error && <p role="alert" className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

      <TabsContent value="runs" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading simulations…</p>
        ) : (
          <RunTable runs={data.runs} onOpen={(row) => setRunDetail({ open: true, run: row })} />
        )}
      </TabsContent>

      <TabsContent value="scenarios" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading scenarios…</p>
        ) : (
          <ScenarioTable
            scenarios={data.scenarios}
            canApprove={data.canApprove}
            onEdit={(row) => { setActionError(''); setScenarioState({ open: true, scenario: row }); }}
            onSubmit={(row) => run({ action: 'submitScenario', scenario_id: row.id })}
            onDecide={(row) => ask({
              title: `Decide ${row.name}`,
              description: 'Approving a scenario records that the levers and their reasons were reviewed. It does not make the estimate an outcome.',
              noteLabel: 'Decision note',
              options: ['Approved', 'Returned'],
              submitLabel: 'Record decision',
              submit: ({ note, choice }) => run({ action: 'decideScenario', scenario_id: row.id, decision: choice, note }),
            })}
            onRevise={(row) => run({ action: 'reviseScenario', scenario_id: row.id })}
            onRun={runScenario}
          />
        )}
      </TabsContent>

      <TabsContent value="models" className="mt-4">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading models…</p>
        ) : (
          <ModelTable
            models={data.models}
            canApprove={data.canApprove}
            onEdit={(row) => { setActionError(''); setModelState({ open: true, model: row }); }}
            onValidate={(row) => ask({
              title: `Validate ${row.name} v${row.version}`,
              description: 'Validation records that the inputs, weights and assumptions were checked. An approved version is needed before a scenario can rely on it.',
              noteLabel: 'What you checked',
              submitLabel: 'Validate model',
              submit: ({ note }) => run({ action: 'validateModel', model_id: row.id, note }),
            })}
            onApprove={(row) => ask({
              title: `Approve ${row.name} v${row.version}`,
              description: 'Approval must come from someone other than the author. An administrator approving their own model is recorded as an override.',
              noteLabel: 'Approval note',
              submitLabel: 'Approve model',
              submit: ({ note }) => run({ action: 'approveModel', model_id: row.id, note }),
            })}
            onRevise={(row) => ask({
              title: `New version of ${row.name}`,
              description: `This opens version ${Number(row.version || 1) + 1} as a draft. Version ${row.version} stays exactly as it is, so past simulations keep pointing at the model they used.`,
              noteLabel: 'What changes in this version',
              submitLabel: 'Open new version',
              submit: ({ note }) => run({ action: 'reviseModel', model_id: row.id, change_note: note }),
            })}
            onRetire={(row) => ask({
              title: `Retire ${row.name} v${row.version}`,
              description: 'A retired model can no longer be run. Its simulations stay on record.',
              noteLabel: 'Why this model is retired',
              submitLabel: 'Retire model',
              submit: ({ note }) => run({ action: 'retireModel', model_id: row.id, note }),
            })}
          />
        )}
      </TabsContent>

      <TabsContent value="inputs" className="mt-4">
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Input</TableHead>
                <TableHead>Observed value</TableHead>
                <TableHead>Records</TableHead>
                <TableHead>Where it comes from</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inputs.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="min-w-[200px]">
                    <div className="text-xs font-bold text-[#0A2B6D]">{row.label}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.unit} · {row.direction === 'higher_better' ? 'higher is better' : 'lower is better'}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">
                    {row.observed?.value === null || row.observed?.value === undefined ? 'no data' : `${row.observed.value}${row.unit === '%' ? '%' : ''}`}
                  </TableCell>
                  <TableCell className="text-xs text-[#0A2B6D]">{row.observed?.recordCount ?? 0}</TableCell>
                  <TableCell className="min-w-[260px] text-[11px] text-[#0A2B6D]/70">
                    {row.source}
                    <div>{row.observed?.note || row.description}</div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-2 text-[11px] text-[#0A2B6D]/70">
          These figures are read from your records when the page loads. They are observations, not estimates; only a simulation models a change.
        </p>
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      <ModuleShell
        title="Knowledge Graph & Digital Twin OS"
        subtitle="Twin models, reviewed scenarios and simulation runs over the records you hold. Every simulation is an estimate, kept with the versions and inputs it used."
        icon={Boxes}
        moduleKey="digital-twin"
        workspaceKey="digital-twin"
        search={null}
        actions={actions}
        insight={<TwinKpiStrip counts={data.counts} />}
        tabs={tabs}
      >
        <div className="flex items-start gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
          <p className="text-xs font-bold text-amber-900">
            {data.estimateNotice || 'Modelled estimates only. A simulation is not an observed outcome and not evidence of compliance.'}
          </p>
        </div>
      </ModuleShell>

      <ModelDialog
        open={modelState.open}
        onOpenChange={(open) => setModelState({ open, model: open ? modelState.model : null })}
        model={modelState.model}
        catalogue={data.metricsCatalogue}
        saving={busy}
        error={actionError}
        onSave={saveModel}
      />

      <ScenarioDialog
        open={scenarioState.open}
        onOpenChange={(open) => setScenarioState({ open, scenario: open ? scenarioState.scenario : null })}
        scenario={scenarioState.scenario}
        models={data.models}
        catalogue={data.metricsCatalogue}
        observations={data.observations}
        saving={busy}
        error={actionError}
        onSave={saveScenario}
      />

      <DecisionDialog
        open={decision.open}
        onOpenChange={(open) => (open ? setDecision(decision) : closeDecision())}
        title={decision.config?.title}
        description={decision.config?.description}
        noteLabel={decision.config?.noteLabel}
        options={decision.config?.options || []}
        submitLabel={decision.config?.submitLabel}
        busy={busy}
        error={actionError}
        onSubmit={submitDecision}
      />

      <RunDetailDialog
        open={runDetail.open}
        onOpenChange={(open) => setRunDetail({ open, run: open ? runDetail.run : null })}
        run={runDetail.run}
      />
    </>
  );
}