import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Gavel, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DecisionKpiStrip from '@/components/decisions/DecisionKpiStrip';
import DecisionRegisterTable from '@/components/decisions/DecisionRegisterTable';
import DecisionEvidenceTable from '@/components/decisions/DecisionEvidenceTable';
import DecisionOutcomeTable from '@/components/decisions/DecisionOutcomeTable';
import DecisionFormDialog from '@/components/decisions/DecisionFormDialog';
import DecisionDetailDialog from '@/components/decisions/DecisionDetailDialog';

const STATUSES = ['Draft', 'Proposed', 'In Review', 'Approved', 'Rejected', 'Deferred', 'Implemented', 'Closed'];
const TYPES = ['Operational Governance', 'Clinical Governance', 'Financial', 'Strategic', 'Risk Acceptance', 'Workforce', 'Technology', 'Policy', 'Safeguarding', 'Regulatory Response'];

export default function DecisionIntelligence() {
  const [filters, setFilters] = useState({ status: 'all', decision_type: 'all', search: '' });
  const [data, setData] = useState({ decisions: [], evidence: [], outcomes: [], counts: {} });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [selectedId, setSelectedId] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);

  const load = useCallback(async (next) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('decisionRegister', {
        action: 'list',
        status: next.status === 'all' ? '' : next.status,
        decision_type: next.decision_type === 'all' ? '' : next.decision_type,
        search: next.search.trim(),
      });
      const payload = response?.data || {};
      if (payload.error) setError(payload.error);
      else {
        setError('');
        setData({ ...payload, decisions: payload.decisions || [], evidence: payload.evidence || [], outcomes: payload.outcomes || [], counts: payload.counts || {} });
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The decision register is unavailable.');
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
      const response = await base44.functions.invoke('decisionRegister', payload);
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

  const openDecision = (id) => {
    setSelectedId(id);
    setDetailOpen(true);
  };

  const selected = useMemo(
    () => data.decisions.find((row) => row.id === selectedId) || null,
    [data.decisions, selectedId],
  );
  const decisionEvidence = useMemo(
    () => data.evidence.filter((row) => row.decision_id === selectedId),
    [data.evidence, selectedId],
  );
  const decisionOutcomes = useMemo(
    () => data.outcomes.filter((row) => row.decision_id === selectedId),
    [data.outcomes, selectedId],
  );

  const search = (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input
        value={filters.search}
        onChange={(e) => setFilters((current) => ({ ...current, search: e.target.value }))}
        placeholder="Search decisions, numbers or owners"
        aria-label="Search decisions"
      />
      <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
        <SelectTrigger className="sm:w-44" aria-label="Filter by status"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          {STATUSES.map((status) => <SelectItem key={status} value={status}>{status}</SelectItem>)}
        </SelectContent>
      </Select>
      <Select value={filters.decision_type} onValueChange={(value) => setFilters((current) => ({ ...current, decision_type: value }))}>
        <SelectTrigger className="sm:w-52" aria-label="Filter by decision type"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All decision types</SelectItem>
          {TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  );

  const actions = data.canWrite ? (
    <Button onClick={() => setFormOpen(true)} disabled={loading}>
      <Plus className="h-4 w-4" /> Record a decision
    </Button>
  ) : null;

  const tabs = (
    <Tabs defaultValue="register">
      <TabsList className="flex-wrap">
        <TabsTrigger value="register">Decision register ({data.counts.total ?? 0})</TabsTrigger>
        <TabsTrigger value="evidence">Evidence ({data.counts.evidenceRecords ?? 0})</TabsTrigger>
        <TabsTrigger value="outcomes">Outcome measures ({data.counts.measures ?? 0})</TabsTrigger>
      </TabsList>

      {error && (
        <p className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>
      )}

      <TabsContent value="register">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading the decision register…</p>
        ) : (
          <DecisionRegisterTable decisions={data.decisions} onOpen={(row) => openDecision(row.id)} />
        )}
      </TabsContent>

      <TabsContent value="evidence">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading decision evidence…</p>
        ) : (
          <DecisionEvidenceTable evidence={data.evidence} onOpenDecision={openDecision} />
        )}
      </TabsContent>

      <TabsContent value="outcomes">
        {loading ? (
          <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading outcome measures…</p>
        ) : (
          <DecisionOutcomeTable outcomes={data.outcomes} onOpenDecision={openDecision} />
        )}
      </TabsContent>
    </Tabs>
  );

  return (
    <>
      <ModuleShell
        title="Decision Intelligence OS"
        subtitle="Every governed decision with its evidence, approval authority, risk and measured outcome, read from your own records."
        icon={Gavel}
        moduleKey="decision-intelligence"
        workspaceKey="decision-intelligence"
        search={search}
        actions={actions}
        insight={<DecisionKpiStrip counts={data.counts} />}
        tabs={tabs}
      />

      <DecisionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        saving={busy}
        error={actionError}
        onCreate={async (form) => {
          const result = await run({ action: 'create', ...form });
          if (result) {
            setFormOpen(false);
            if (result.decision?.id) openDecision(result.decision.id);
          }
        }}
      />

      <DecisionDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        decision={selected}
        evidence={decisionEvidence}
        outcomes={decisionOutcomes}
        canWrite={Boolean(data.canWrite)}
        canDecide={Boolean(data.canDecide)}
        busy={busy}
        error={actionError}
        onAddEvidence={(id, payload) => run({ action: 'addEvidence', decision_id: id, ...payload })}
        onAddOutcome={(id, payload) => run({ action: 'addOutcome', decision_id: id, ...payload })}
        onDecide={(id, status) => run({ action: 'decide', decision_id: id, status })}
      />
    </>
  );
}