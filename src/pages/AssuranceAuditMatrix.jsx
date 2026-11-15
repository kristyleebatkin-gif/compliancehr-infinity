import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Layers } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { AUDIT_CHECKPOINTS, CONTROLS, EVIDENCE_REQUIREMENTS, INDICATORS, catalogueSummary } from '@/lib/masterAssuranceCatalogue';
import { resolveAuditMatrix } from '@/lib/auditMatrixScoring';
import MatrixCommandStrip from '@/components/assurance/matrix/MatrixCommandStrip';
import DomainMatrixGrid from '@/components/assurance/matrix/DomainMatrixGrid';
import AuditMatrixTable from '@/components/assurance/matrix/AuditMatrixTable';
import TraceabilityChainDrawer from '@/components/assurance/matrix/TraceabilityChainDrawer';
import CatalogueTable from '@/components/assurance/matrix/CatalogueTable';
import ScoringModelCard from '@/components/assurance/matrix/ScoringModelCard';

const REGISTER_LIMIT = 500;

async function loadRegister(entity) {
  const page = await base44.entities[entity].filter({}, { limit: REGISTER_LIMIT });
  const items = page?.items || [];
  return { items, truncated: Boolean(page?.has_more) };
}

export default function AssuranceAuditMatrix() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [domain, setDomain] = useState('All');
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('command');

  const load = useCallback(async () => {
    setError('');
    setData(null);
    try {
      const [controls, evidence, findings] = await Promise.all([
        loadRegister('ComplianceControl'),
        loadRegister('AssuranceEvidence'),
        loadRegister('AssuranceFinding'),
      ]);
      setData({
        controls: controls.items,
        evidence: evidence.items,
        findings: findings.items,
        truncated: controls.truncated || evidence.truncated || findings.truncated,
      });
    } catch (err) {
      setError(err?.message || 'The audit matrix could not load.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const matrix = useMemo(
    () => (data ? resolveAuditMatrix({ controls: data.controls, evidence: data.evidence, findings: data.findings }) : null),
    [data]
  );

  const priorityGaps = useMemo(() => {
    if (!matrix) return [];
    const order = { Critical: 5, High: 4, Medium: 3, Low: 2, Informational: 1 };
    return [...matrix.rows]
      .filter((row) => row.state !== 'assured')
      .sort((a, b) => order[b.criticality] - order[a.criticality] || a.compliance_percentage - b.compliance_percentage)
      .slice(0, 8);
  }, [matrix]);

  const counters = catalogueSummary();

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <ModuleShell
        moduleKey="assurance-matrix"
        title="Assurance Audit Matrix"
        subtitle={`${counters.audits} audit checkpoints traced to ${counters.indicators} indicators, ${counters.controls} controls and ${counters.evidence} evidence requirements — scored only from the records your registers actually hold.`}
        icon={Layers}
      />

      {error ? (
        <div role="alert" className="rounded-xl border border-[#FF2E9A] bg-white p-4 text-primary">
          <p>Matrix unavailable: {error}</p>
          <Button onClick={load} variant="outline" className="mt-2">Retry</Button>
        </div>
      ) : !matrix ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto flex-wrap gap-1.5">
            <TabsTrigger value="command">Command</TabsTrigger>
            <TabsTrigger value="matrix">Audit matrix</TabsTrigger>
            <TabsTrigger value="indicators">Indicators</TabsTrigger>
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="evidence">Evidence</TabsTrigger>
            <TabsTrigger value="scoring">Scoring model</TabsTrigger>
          </TabsList>

          <TabsContent value="command" className="mt-4 space-y-3">
            <MatrixCommandStrip enterprise={matrix.enterprise} counts={matrix.counts} />
            <div className="grid gap-3 lg:grid-cols-2">
              <DomainMatrixGrid domains={matrix.byDomain} activeDomain={domain} onSelect={setDomain} />
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                <div className="border-b border-border px-4 py-3">
                  <h2 className="text-sm font-extrabold text-foreground">Priority checkpoints</h2>
                  <p className="text-xs text-muted-foreground">Critical first, then the lowest scoring. Open one to see its full traceability chain.</p>
                </div>
                <div className="divide-y divide-border">
                  {priorityGaps.map((row) => (
                    <button
                      key={row.audit_code}
                      type="button"
                      onClick={() => setSelected(row)}
                      className="flex w-full items-start justify-between gap-2 px-4 py-2.5 text-left hover:bg-muted/60"
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-brand">{row.audit_code} · {row.criticality}</span>
                        <span className="block truncate text-sm font-semibold text-foreground">{row.audit_name}</span>
                        <span className="block text-[11px] font-medium text-muted-foreground">{row.audit_domain}</span>
                      </span>
                      <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-bold ${row.state_tone}`}>
                        {row.state_label}
                      </span>
                    </button>
                  ))}
                  {!priorityGaps.length && (
                    <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                      Every checkpoint is assured from current evidence.
                    </p>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-primary">
              Reference coverage for the loaded registers. A checkpoint only reads Assured when a control is mapped, evidence is verified and
              in date, and no finding is open. Counts cover this loaded subset.
              {data.truncated && ' At least one register reached the 500-record limit.'}
            </p>
          </TabsContent>

          <TabsContent value="matrix" className="mt-4">
            <AuditMatrixTable rows={matrix.rows} domain={domain} onDomainChange={setDomain} onSelect={setSelected} />
          </TabsContent>

          <TabsContent value="indicators" className="mt-4">
            <CatalogueTable
              title={`Indicator catalogue · ${INDICATORS.length} indicators`}
              description="Every obligation is measured by an indicator, grouped in the ten indicator domains."
              rows={INDICATORS}
              searchKeys={['code', 'name', 'domain']}
              columns={[
                { key: 'code', label: 'Code', render: (row) => <span className="text-xs font-bold text-brand">{row.code}</span> },
                { key: 'name', label: 'Indicator' },
                { key: 'domain', label: 'Domain' },
              ]}
            />
          </TabsContent>

          <TabsContent value="controls" className="mt-4">
            <CatalogueTable
              title={`Control catalogue · ${CONTROLS.length} enterprise controls`}
              description="The controls that operationalise each indicator, from rights through to technology governance."
              rows={CONTROLS}
              searchKeys={['code', 'name', 'group']}
              columns={[
                { key: 'code', label: 'Code', render: (row) => <span className="text-xs font-bold text-brand">{row.code}</span> },
                { key: 'name', label: 'Control' },
                { key: 'group', label: 'Group' },
              ]}
            />
          </TabsContent>

          <TabsContent value="evidence" className="mt-4">
            <CatalogueTable
              title={`Evidence catalogue · ${EVIDENCE_REQUIREMENTS.length} evidence requirements`}
              description="What must exist and be current for each control to count as assured."
              rows={EVIDENCE_REQUIREMENTS}
              searchKeys={['code', 'name']}
              columns={[
                { key: 'code', label: 'Code', render: (row) => <span className="text-xs font-bold text-brand">{row.code}</span> },
                { key: 'name', label: 'Evidence requirement' },
              ]}
            />
          </TabsContent>

          <TabsContent value="scoring" className="mt-4">
            <ScoringModelCard />
          </TabsContent>
        </Tabs>
      )}

      <TraceabilityChainDrawer row={selected} onClose={() => setSelected(null)} />
    </div>
  );
}