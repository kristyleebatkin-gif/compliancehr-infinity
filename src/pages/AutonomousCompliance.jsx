import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ClipboardList, PlayCircle, ShieldCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ComplianceOpsKpiStrip from '@/components/complianceOps/ComplianceOpsKpiStrip';
import AssessmentTable from '@/components/complianceOps/AssessmentTable';
import GapTable from '@/components/complianceOps/GapTable';
import ControlTestTable from '@/components/complianceOps/ControlTestTable';
import RemediationTable from '@/components/complianceOps/RemediationTable';
import RunAssessmentDialog from '@/components/complianceOps/RunAssessmentDialog';
import GapDialog from '@/components/complianceOps/GapDialog';
import RecordTestDialog from '@/components/complianceOps/RecordTestDialog';
import PlanDialog from '@/components/complianceOps/PlanDialog';

const GAP_STATUSES = ['Open', 'Remediation planned', 'In progress', 'Closed', 'Risk accepted'];

export default function AutonomousCompliance() {
  const [filters, setFilters] = useState({ framework: 'all', gap_status: 'all', search: '' });
  const [data, setData] = useState({
    assessments: [], gaps: [], tests: [], plans: [], counts: {}, frameworks: [],
    controlOptions: [], evidenceOptions: [], canTest: false, canVerify: false,
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [runOpen, setRunOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [gapId, setGapId] = useState('');
  const [gapOpen, setGapOpen] = useState(false);
  const [planId, setPlanId] = useState('');
  const [planOpen, setPlanOpen] = useState(false);

  const load = useCallback(async (next) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('autonomousCompliance', {
        action: 'list',
        framework: next.framework === 'all' ? '' : next.framework,
        gap_status: next.gap_status === 'all' ? '' : next.gap_status,
        search: next.search.trim(),
      });
      const payload = response?.data || {};
      if (payload.error) setError(payload.error);
      else {
        setError('');
        setData({
          assessments: payload.assessments || [],
          gaps: payload.gaps || [],
          tests: payload.tests || [],
          plans: payload.plans || [],
          counts: payload.counts || {},
          frameworks: payload.frameworks || [],
          controlOptions: payload.controlOptions || [],
          evidenceOptions: payload.evidenceOptions || [],
          canTest: Boolean(payload.canTest),
          canVerify: Boolean(payload.canVerify),
        });
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'Compliance operations are unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(filters), 250);
    return () => clearTimeout(timer);
  }, [filters, load]);

  const run = async (payload) => {
    setBusy(true);
    setActionError('');
    try {
      const response = await base44.functions.invoke('autonomousCompliance', payload);
      const result = response?.data || {};
      if (result.error) {
        setActionError(result.error);
        return null;
      }
      await load(filters);
      return result;
    } catch (e) {
      setActionError(e?.response?.data?.error || e?.message || 'That change could not be saved.');
      return null;
    } finally {
      setBusy(false);
    }
  };

  const selectedGap = useMemo(() => data.gaps.find((row) => row.id === gapId) || null, [data.gaps, gapId]);
  const selectedPlan = useMemo(() => data.plans.find((row) => row.id === planId) || null, [data.plans, planId]);

  const search = (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={filters.search}
        onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
        placeholder="Search standards, controls or gaps"
        aria-label="Search compliance gaps"
      />
      <Select value={filters.framework} onValueChange={(value) => setFilters((current) => ({ ...current, framework: value }))}>
        <SelectTrigger className="sm:w-56" aria-label="Filter by framework"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All frameworks</SelectItem>
          {data.frameworks.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.gap_status} onValueChange={(value) => setFilters((current) => ({ ...current, gap_status: value }))}>
        <SelectTrigger className="sm:w-48" aria-label="Filter gaps by status"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All gap statuses</SelectItem>
          {GAP_STATUSES.map((name) => <SelectItem key={name} value={name}>{name}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const actions = data.canTest ? (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => { setActionError(''); setTestOpen(true); }} variant="outline" disabled={loading}>
        <ShieldCheck className="h-4 w-4" /> Record a test
      </Button>
      <Button onClick={() => { setActionError(''); setRunOpen(true); }} disabled={loading}>
        <PlayCircle className="h-4 w-4" /> Run assessment
      </Button>
    </div>
  ) : null;

  const tabs = (
    <Tabs defaultValue="gaps">
      <TabsList className="flex-wrap">
        <TabsTrigger value="gaps">Gap analysis ({data.counts.openGaps ?? 0} open)</TabsTrigger>
        <TabsTrigger value="assessments">Assessments ({data.counts.assessments ?? 0})</TabsTrigger>
        <TabsTrigger value="tests">Control testing ({data.counts.controlsTested ?? 0})</TabsTrigger>
        <TabsTrigger value="plans">Remediation ({data.counts.plansOpen ?? 0} open)</TabsTrigger>
      </TabsList>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>
      )}

      <TabsContent value="gaps">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading gap analysis…</p>
        ) : (
          <GapTable gaps={data.gaps} onOpen={(row) => { setActionError(''); setGapId(row.id); setGapOpen(true); }} />
        )}
      </TabsContent>

      <TabsContent value="assessments">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading assessments…</p>
        ) : (
          <AssessmentTable assessments={data.assessments} />
        )}
      </TabsContent>

      <TabsContent value="tests">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading control tests…</p>
        ) : (
          <ControlTestTable tests={data.tests} />
        )}
      </TabsContent>

      <TabsContent value="plans">
        {loading ? (
          <p className="py-8 text-center text-[#0A2B6D]/70">Loading remediation plans…</p>
        ) : (
          <RemediationTable plans={data.plans} onOpen={(row) => { setActionError(''); setPlanId(row.id); setPlanOpen(true); }} />
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      <ModuleShell
        title="Autonomous Compliance Operations OS"
        subtitle="Assessments, gaps, control tests and remediation built only from the standards, controls and evidence you actually hold."
        icon={ClipboardList}
        moduleKey="compliance-operations"
        workspaceKey="compliance-operations"
        search={search}
        actions={actions}
        insight={<ComplianceOpsKpiStrip counts={data.counts} />}
        tabs={tabs}
      />

      <RunAssessmentDialog
        open={runOpen}
        onOpenChange={setRunOpen}
        frameworks={data.frameworks}
        saving={busy}
        error={actionError}
        onRun={async (payload) => {
          const result = await run({ action: 'runAssessment', ...payload });
          if (result) {
            setRunOpen(false);
            setFilters((current) => ({ ...current, framework: payload.framework }));
          }
        }}
      />

      <RecordTestDialog
        open={testOpen}
        onOpenChange={setTestOpen}
        controlOptions={data.controlOptions}
        evidenceOptions={data.evidenceOptions}
        saving={busy}
        error={actionError}
        onSubmit={async (payload) => {
          const result = await run({ action: 'recordTest', ...payload });
          if (result) setTestOpen(false);
        }}
      />

      <GapDialog
        open={gapOpen}
        onOpenChange={setGapOpen}
        gap={selectedGap}
        busy={busy}
        error={actionError}
        canVerify={data.canVerify}
        onSave={async (id, patch) => {
          const result = await run({ action: 'updateGap', gap_id: id, ...patch });
          if (result) setGapOpen(false);
        }}
        onCreatePlan={async (id, payload) => {
          const result = await run({ action: 'createRemediation', gap_id: id, ...payload });
          if (result) {
            setGapOpen(false);
            if (result.plan?.id) {
              setPlanId(result.plan.id);
              setPlanOpen(true);
            }
          }
        }}
      />

      <PlanDialog
        open={planOpen}
        onOpenChange={setPlanOpen}
        plan={selectedPlan}
        canVerify={data.canVerify}
        busy={busy}
        error={actionError}
        onProgress={async (id, payload) => run({ action: 'updateRemediation', plan_id: id, ...payload })}
        onVerify={async (id, note) => {
          const result = await run({ action: 'verifyRemediation', plan_id: id, note });
          if (result) setPlanOpen(false);
        }}
      />
    </>
  );
}