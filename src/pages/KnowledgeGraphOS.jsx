import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ModuleShell from '@/components/module/ModuleShell';
import { Loader2, Network } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { buildGraph, dnaCoverage, graphHealth, loadGraphUniverse, nodeKey, traceStandard } from '@/lib/knowledgeGraph';
import GraphCommandStrip from '@/components/graph/GraphCommandStrip';
import ComplianceDnaMatrix from '@/components/graph/ComplianceDnaMatrix';
import GraphExplorerPanel from '@/components/graph/GraphExplorerPanel';
import TraceabilityPanel from '@/components/graph/TraceabilityPanel';
import LinkRegisterPanel from '@/components/graph/LinkRegisterPanel';

export default function KnowledgeGraphOS() {
  const [data, setData] = useState(null);
  const [tenantId, setTenantId] = useState('');
  const [tab, setTab] = useState('command');

  const load = useCallback(async () => {
    const universe = await loadGraphUniverse();
    setData(universe);
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    base44.auth.me().then((me) => setTenantId(me?.data?.tenant_id || '')).catch(() => {});
  }, []);

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

      {!graph ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
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
              tenantId={tenantId}
              onChanged={load}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}