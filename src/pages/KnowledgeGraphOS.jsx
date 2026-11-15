import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModuleShell from '@/components/module/ModuleShell';
import { Loader2, Network } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildGraph, dnaCoverage, graphHealth, loadGraphUniverse, nodeKey, traceStandard } from '@/lib/knowledgeGraph';
import GraphCommandStrip from '@/components/graph/GraphCommandStrip';
import ComplianceDnaMatrix from '@/components/graph/ComplianceDnaMatrix';
import GraphExplorerPanel from '@/components/graph/GraphExplorerPanel';
import TraceabilityPanel from '@/components/graph/TraceabilityPanel';
import LinkRegisterPanel from '@/components/graph/LinkRegisterPanel';

export default function KnowledgeGraphOS() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('command');

  const load = useCallback(async () => {
    setError('');
    setData(null);
    try {
      setData(await loadGraphUniverse());
    } catch (err) {
      setError(err?.message || 'The graph could not load.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const graph = useMemo(() => (data ? buildGraph(data.recordsByType, data.links) : null), [data]);
  const traces = useMemo(() => {
    if (!graph) return [];
    return (data.recordsByType.standard || [])
      .map((standard) => ({ standard, trace: traceStandard(graph, nodeKey('standard', standard.id)) }))
      .sort((a, b) => a.trace.percent - b.trace.percent);
  }, [graph, data]);
  const health = useMemo(
    () => (graph ? graphHealth(graph, data.recordsByType, traces) : null),
    [graph, data, traces]
  );
  const dna = useMemo(() => (graph ? dnaCoverage(data.recordsByType, graph) : []), [graph, data]);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <ModuleShell
        moduleKey="knowledge-graph"
        title="Knowledge Graph OS"
        subtitle="One graph over every register: the 23 typed relationships and the 14-stage chain from regulation to outcome, scored from the records you actually hold."
        icon={Network}
      />

      {error ? (
        <div role="alert" className="rounded-xl border border-[#FF2E9A] bg-white p-4 text-primary">
          <p>Graph unavailable: {error}</p>
          <Button onClick={load} variant="outline" className="mt-2">Retry</Button>
        </div>
      ) : !graph ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="space-y-3">
        <p className="text-xs text-primary">Reference coverage for the loaded records only. This is not a compliance score or proof of a continuous, verified evidence chain. Findings and corrective actions may be inapplicable to a clean audit.</p>
        {data.truncated && <p role="status" className="rounded-xl border border-[#FF2E9A] bg-white p-3 text-xs text-primary">Partial graph: at least one register reached the 500-record limit. Counts and coverage apply to this loaded subset.</p>}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto flex-wrap gap-1.5">
            <TabsTrigger value="command">Graph command</TabsTrigger>
            <TabsTrigger value="explorer">Graph explorer</TabsTrigger>
            <TabsTrigger value="traceability">Traceability chains</TabsTrigger>
            <TabsTrigger value="links">Links register</TabsTrigger>
          </TabsList>

          <TabsContent value="command" className="mt-4 space-y-3">
            <GraphCommandStrip health={health} />
            <ComplianceDnaMatrix rows={dna} />
          </TabsContent>

          <TabsContent value="explorer" className="mt-4">
            <GraphExplorerPanel graph={graph} />
          </TabsContent>

          <TabsContent value="traceability" className="mt-4">
            <TraceabilityPanel traces={traces} />
          </TabsContent>

          <TabsContent value="links" className="mt-4">
            <LinkRegisterPanel
              links={data.links}
              recordsByType={data.recordsByType}
              tenantId={data.tenantId}
              onChanged={load}
            />
          </TabsContent>
        </Tabs>
        </div>
      )}
    </div>
  );
}