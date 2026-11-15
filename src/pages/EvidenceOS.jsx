import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModuleShell from '@/components/module/ModuleShell';
import EmptyState from '@/components/EmptyState';
import { Download, FileCheck2, Plus, RefreshCw } from 'lucide-react';
import EvidenceKpiStrip from '@/components/assurance/EvidenceKpiStrip';
import EvidenceRegisterTable from '@/components/assurance/EvidenceRegisterTable';
import ControlCoveragePanel from '@/components/assurance/ControlCoveragePanel';
import FindingsPanel from '@/components/assurance/FindingsPanel';
import EvidenceFormDialog from '@/components/assurance/EvidenceFormDialog';
import EvidenceChainDialog from '@/components/assurance/EvidenceChainDialog';
import GapEnginePanel from '@/components/assurance/GapEnginePanel';
import {
  EVIDENCE_STATES, EVIDENCE_STATE_ORDER, evidenceState, standardCoverage, summariseEvidence,
} from '@/lib/assuranceChain';
import { detectAssuranceGaps, gapToTask } from '@/lib/assuranceGaps';

const LOAD_LIMIT = 500;

const STATE_FILTERS = [
  { key: 'all', label: 'All' },
  ...EVIDENCE_STATE_ORDER.map((state) => ({ key: state, label: EVIDENCE_STATES[state].label })),
];

export default function EvidenceOS() {
  const [standards, setStandards] = useState([]);
  const [controls, setControls] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [findings, setFindings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('all');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [verifyingId, setVerifyingId] = useState(null);
  const [chainControlId, setChainControlId] = useState(null);
  const [me, setMe] = useState(null);
  const [remediationTasks, setRemediationTasks] = useState([]);
  const [creatingActions, setCreatingActions] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const [standardPage, controlPage, evidencePage, findingPage] = await Promise.all([
      base44.entities.RegulatoryStandard.filter({}, { sort: 'standard_code', limit: LOAD_LIMIT }),
      base44.entities.ComplianceControl.filter({}, { sort: 'standard_code', limit: LOAD_LIMIT }),
      base44.entities.AssuranceEvidence.filter({}, { sort: '-updated_date', limit: LOAD_LIMIT }),
      base44.entities.AssuranceFinding.filter({}, { sort: '-updated_date', limit: LOAD_LIMIT }),
    ]);
    setStandards(standardPage.items || []);
    setControls(controlPage.items || []);
    setEvidence(evidencePage.items || []);
    setFindings(findingPage.items || []);
    setLoading(false);
  }, []);

  const loadRemediationTasks = useCallback(async () => {
    const page = await base44.entities.TodoTask
      .filter({ task_type: 'Assurance remediation' }, { limit: LOAD_LIMIT })
      .catch(() => ({ items: [] }));
    setRemediationTasks(page.items || []);
  }, []);

  useEffect(() => {
    load();
    loadRemediationTasks();
    base44.auth.me().then(setMe).catch(() => {});
  }, [load, loadRemediationTasks]);

  const controlsById = useMemo(() => new Map(controls.map((control) => [control.id, control])), [controls]);
  const summary = useMemo(() => summariseEvidence({ evidence, controls, findings }), [evidence, controls, findings]);
  const coverageRows = useMemo(
    () => standardCoverage({ standards, controls, evidence, findings }),
    [standards, controls, evidence, findings]
  );

  const counts = useMemo(() => {
    const next = { all: evidence.length };
    EVIDENCE_STATE_ORDER.forEach((state) => { next[state] = 0; });
    evidence.forEach((item) => { next[evidenceState(item)] += 1; });
    return next;
  }, [evidence]);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return evidence.filter((item) => {
      if (stateFilter !== 'all' && evidenceState(item) !== stateFilter) return false;
      if (!term) return true;
      return [item.title, item.owner, item.standard_code, item.framework, item.evidence_type, item.control_statement, item.source]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [evidence, query, stateFilter]);

  const gaps = useMemo(
    () => detectAssuranceGaps({ standards, controls, evidence, findings }),
    [standards, controls, evidence, findings]
  );
  const raisedActions = useMemo(
    () => new Map(remediationTasks.map((task) => [task.title, task])),
    [remediationTasks]
  );

  const createGapActions = async (selectedGaps) => {
    if (!selectedGaps.length) return;
    setCreatingActions(true);
    const tenantId = me?.data?.tenant_id || me?.tenant_id || '';
    await base44.entities.TodoTask.bulkCreate(selectedGaps.map((gap) => gapToTask(gap, tenantId)));
    setCreatingActions(false);
    await loadRemediationTasks();
  };

  const chainControl = chainControlId ? controlsById.get(chainControlId) : null;
  const chainStandard = useMemo(() => {
    if (!chainControl) return null;
    return (
      standards.find((standard) => standard.id === chainControl.standard_id) ||
      standards.find((standard) => standard.standard_code && standard.standard_code === chainControl.standard_code) ||
      null
    );
  }, [chainControl, standards]);

  const openForm = (record = null) => {
    setEditing(record);
    setFormOpen(true);
  };

  const saveEvidence = async (values) => {
    setSaving(true);
    const control = controlsById.get(values.control_id);
    const payload = {
      ...values,
      control_statement: control?.control_statement || '',
      standard_code: control?.standard_code || '',
      framework: control?.framework || '',
    };
    if (editing?.id) {
      await base44.entities.AssuranceEvidence.update(editing.id, payload);
    } else {
      await base44.entities.AssuranceEvidence.create({ ...payload, verification_status: 'Unverified' });
    }
    setSaving(false);
    setFormOpen(false);
    setEditing(null);
    await load();
  };

  const deleteEvidence = async (record) => {
    setSaving(true);
    await base44.entities.AssuranceEvidence.delete(record.id);
    setSaving(false);
    setFormOpen(false);
    setEditing(null);
    await load();
  };

  const verifyEvidence = async (record) => {
    setVerifyingId(record.id);
    await base44.entities.AssuranceEvidence.update(record.id, {
      verification_status: 'Verified',
      confidence: Number(record.confidence) || 90,
      verified_by: me?.full_name || me?.email || 'Unknown user',
      verified_date: new Date().toISOString().slice(0, 10),
    });
    setVerifyingId(null);
    await load();
  };

  const changeFindingStatus = async (finding, status) => {
    const payload = { status };
    if (status === 'Closed') {
      payload.closure_verified_by = me?.full_name || me?.email || 'Unknown user';
      payload.closure_verified_date = new Date().toISOString().slice(0, 10);
    }
    await base44.entities.AssuranceFinding.update(finding.id, payload);
    await load();
  };

  const openStandardChain = (row) => {
    const first = controls.find(
      (control) => control.standard_id === row.id || (control.standard_code && control.standard_code === row.standard_code)
    );
    if (first) setChainControlId(first.id);
  };

  const exportCsv = () => {
    const lines = [
      ['Evidence', 'Standard', 'Control', 'Type', 'Owner', 'Valid to', 'Confidence', 'Status', 'Verified by', 'Verified date'],
    ];
    rows.forEach((item) => {
      lines.push([
        item.title,
        item.standard_code || '',
        item.control_statement || '',
        item.evidence_type,
        item.owner || '',
        item.valid_to || '',
        item.confidence ?? '',
        EVIDENCE_STATES[evidenceState(item)].label,
        item.verified_by || '',
        item.verified_date || '',
      ]);
    });
    const csv = lines.map((line) => line.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `evidence-register-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <ModuleShell
        title="Evidence OS"
        subtitle="Every control traced from standard to evidence to finding — coverage only counts verified evidence"
        icon={FileCheck2}
        moduleKey="compliance"
        actions={(
          <>
            <Button size="sm" onClick={() => openForm(null)}>
              <Plus className="h-4 w-4" /> Add evidence
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} disabled={rows.length === 0}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </>
        )}
      />

      <EvidenceKpiStrip summary={summary} />

      <div className="module-filter-bar flex flex-wrap items-center gap-2">
        {STATE_FILTERS.map((filter) => (
          <button
            key={filter.key}
            onClick={() => setStateFilter(filter.key)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              stateFilter === filter.key
                ? 'border-brand bg-brand text-brand-foreground'
                : 'border-border bg-background hover:bg-muted'
            }`}
          >
            {filter.label} ({counts[filter.key] ?? 0})
          </button>
        ))}
        <div className="min-w-[200px] flex-1">
          <Input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search evidence, control, owner or standard…"
            aria-label="Search evidence"
          />
        </div>
      </div>

      <Tabs defaultValue="register" className="min-w-0">
        <TabsList aria-label="Evidence OS views">
          <TabsTrigger value="register">Evidence register</TabsTrigger>
          <TabsTrigger value="coverage">Control coverage</TabsTrigger>
          <TabsTrigger value="findings">Findings &amp; CAPA</TabsTrigger>
          <TabsTrigger value="gaps">Assurance gaps ({gaps.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="register" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading evidence register…</p>
          ) : rows.length === 0 ? (
            <EmptyState
              icon={FileCheck2}
              title="No evidence in this view"
              message="Add evidence against a control and verify it. Only verified evidence counts toward coverage, audit readiness and board assurance."
              modulePath="Compliance"
              action={(
                <button
                  onClick={() => openForm(null)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#0A2B6D] px-3.5 py-1.5 text-xs font-extrabold text-white transition hover:bg-[#5A00D6]"
                >
                  <Plus className="h-3.5 w-3.5" /> Add evidence
                </button>
              )}
            />
          ) : (
            <EvidenceRegisterTable
              rows={rows}
              onVerify={verifyEvidence}
              onEdit={openForm}
              onOpenChain={setChainControlId}
              verifyingId={verifyingId}
            />
          )}
        </TabsContent>

        <TabsContent value="coverage" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Calculating coverage…</p>
          ) : (
            <ControlCoveragePanel rows={coverageRows} onOpenStandard={openStandardChain} />
          )}
        </TabsContent>

        <TabsContent value="findings" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Loading findings…</p>
          ) : (
            <FindingsPanel findings={findings} controlsById={controlsById} onStatusChange={changeFindingStatus} />
          )}
        </TabsContent>

        <TabsContent value="gaps" className="mt-2 min-w-0 rounded-xl border border-border bg-card p-3 sm:p-4">
          {loading ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Detecting assurance gaps…</p>
          ) : (
            <GapEnginePanel
              gaps={gaps}
              existingTitles={raisedActions}
              onCreateActions={createGapActions}
              creating={creatingActions}
            />
          )}
        </TabsContent>
      </Tabs>

      <EvidenceFormDialog
        open={formOpen}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSave={saveEvidence}
        onDelete={deleteEvidence}
        controls={controls}
        evidence={editing}
        saving={saving}
      />

      <EvidenceChainDialog
        open={Boolean(chainControlId)}
        onClose={() => setChainControlId(null)}
        standard={chainStandard}
        control={chainControl}
        evidence={chainControlId ? evidence.filter((item) => item.control_id === chainControlId) : []}
        findings={chainControlId ? findings.filter((item) => item.control_id === chainControlId) : []}
      />
    </div>
  );
}