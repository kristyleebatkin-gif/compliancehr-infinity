import React, { useMemo, useState } from 'react';
import { Layers } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AUDIT_CHECKPOINTS, CONTROLS, EVIDENCE_REQUIREMENTS, INDICATORS, catalogueSummary } from '@/lib/masterAssuranceCatalogue';
import { resolveAuditMatrix } from '@/lib/auditMatrixScoring';
import MatrixCommandStrip from '@/components/assurance/matrix/MatrixCommandStrip';
import DomainMatrixGrid from '@/components/assurance/matrix/DomainMatrixGrid';
import AuditMatrixTable from '@/components/assurance/matrix/AuditMatrixTable';
import TraceabilityChainDrawer from '@/components/assurance/matrix/TraceabilityChainDrawer';
import CatalogueTable from '@/components/assurance/matrix/CatalogueTable';
import ScoringModelCard from '@/components/assurance/matrix/ScoringModelCard';

export default function AssuranceAuditMatrix() {
  const [domain, setDomain] = useState('All');
  const [selected, setSelected] = useState(null);
  const [tab, setTab] = useState('command');

  const matrix = useMemo(() => resolveAuditMatrix(), []);

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
        subtitle={`${counters.audits} audit checkpoints traced to ${counters.indicators} indicators, ${counters.controls} controls and ${counters.evidence} evidence requirements — draft internal catalogue proposals awaiting mapping and assessment.`}
        icon={Layers}
      />

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
                  <h2 className="text-sm font-extrabold text-foreground">Proposed review priorities</h2>
                  <p className="text-xs text-muted-foreground">Proposed criticality order. Open a checkpoint to inspect its draft relationships.</p>
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
              Draft catalogue only. Generated names, criticalities, review cycles and relationships require validation. Live assessment, evidence-version verification, applicability and signed assurance are not connected. No compliance score is available.
            </p>
          </TabsContent>

          <TabsContent value="matrix" className="mt-4">
            <AuditMatrixTable rows={matrix.rows} domain={domain} onDomainChange={setDomain} onSelect={setSelected} />
          </TabsContent>

          <TabsContent value="indicators" className="mt-4">
            <CatalogueTable
              title={`Indicator catalogue · ${INDICATORS.length} indicators`}
              description="Draft indicator proposals grouped in ten internal domains; validate applicability and current regulatory sources."
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
              description="Draft control proposals from rights through to technology governance; relationships require review."
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
              description="Draft evidence requirement proposals; generated subjects require review before use in an audit."
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

      <TraceabilityChainDrawer row={selected} onClose={() => setSelected(null)} />
    </div>
  );
}