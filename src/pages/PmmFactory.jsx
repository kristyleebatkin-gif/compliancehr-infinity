import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Factory } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ModuleShell from '@/components/module/ModuleShell';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FactoryKpiStrip from '@/components/pmm/FactoryKpiStrip';
import CapabilityMatrix from '@/components/pmm/CapabilityMatrix';
import MigrationMap from '@/components/pmm/MigrationMap';
import MetadataGraphPanel from '@/components/pmm/MetadataGraphPanel';
import ValidationPanel from '@/components/pmm/ValidationPanel';
import ArtefactPreview from '@/components/pmm/ArtefactPreview';

export default function PmmFactory() {
  const [overview, setOverview] = useState(null);
  const [capabilities, setCapabilities] = useState({ rows: [], summary: null });
  const [graph, setGraph] = useState(null);
  const [validation, setValidation] = useState(null);
  const [compiled, setCompiled] = useState(null);
  const [entityKey, setEntityKey] = useState('');
  const [reference, setReference] = useState(null);
  const [tab, setTab] = useState('capabilities');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const invoke = useCallback(async (payload) => {
    const response = await base44.functions.invoke('pmmFactory', payload);
    const data = response?.data || {};
    if (data.error) throw new Error(data.error);
    return data;
  }, []);

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [overviewData, capabilityData] = await Promise.all([
        invoke({ action: 'overview' }),
        invoke({ action: 'capabilities' }),
      ]);
      setOverview(overviewData);
      setCapabilities({ rows: capabilityData.rows || [], summary: capabilityData.summary || null });
      const registers = overviewData.registers || [];
      if (registers.length) setEntityKey((current) => current || registers[0].key);
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The PMM factory is unavailable.');
    } finally {
      setLoading(false);
    }
  }, [invoke]);

  useEffect(() => { loadBase(); }, [loadBase]);

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (tab === 'graph' && !graph) {
        setBusy('graph');
        try {
          const data = await invoke({ action: 'graph' });
          if (active) setGraph(data);
        } catch (e) {
          if (active) setError(e?.response?.data?.error || e?.message || 'The graph could not be built.');
        } finally {
          if (active) setBusy('');
        }
      }
      if (tab === 'validation' && !validation) {
        setBusy('validation');
        try {
          const [validated, compiledData] = await Promise.all([
            invoke({ action: 'validate' }),
            invoke({ action: 'compile' }),
          ]);
          if (active) { setValidation(validated); setCompiled(compiledData.compiled || null); }
        } catch (e) {
          if (active) setError(e?.response?.data?.error || e?.message || 'Validation could not be run.');
        } finally {
          if (active) setBusy('');
        }
      }
    };
    load();
    return () => { active = false; };
  }, [tab, graph, validation, invoke]);

  useEffect(() => {
    let active = true;
    if (tab !== 'artefacts' || !entityKey) return () => { active = false; };
    setBusy('entity');
    setReference(null);
    invoke({ action: 'entity', entity_key: entityKey })
      .then((data) => { if (active) setReference(data); })
      .catch((e) => { if (active) setError(e?.response?.data?.error || e?.message || 'Reference output could not be generated.'); })
      .finally(() => { if (active) setBusy(''); });
    return () => { active = false; };
  }, [tab, entityKey, invoke]);

  const registers = overview?.registers || [];
  const kpis = useMemo(() => ({
    counts: {
      ...(overview?.loaded?.counts || {}),
      modules: overview?.compiled?.coverage?.modules || 0,
    },
    byStatus: capabilities.summary?.byStatus || {},
    graphHash: overview?.compiled?.graphHash || '',
  }), [overview, capabilities.summary]);

  const notice = error ? (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs leading-5 text-rose-800">{error}</div>
  ) : null;

  const tabs = (
    <Tabs value={tab} onValueChange={setTab}>
      <TabsList className="flex flex-wrap">
        <TabsTrigger value="capabilities">Capability matrix</TabsTrigger>
        <TabsTrigger value="migration">Migration map</TabsTrigger>
        <TabsTrigger value="graph">Metadata graph</TabsTrigger>
        <TabsTrigger value="validation">Validation</TabsTrigger>
        <TabsTrigger value="artefacts">Reference output</TabsTrigger>
      </TabsList>

      <TabsContent value="capabilities" className="mt-4">
        {loading
          ? <p className="text-xs text-[#0A2B6D]/70">Reading the capability reconciliation…</p>
          : <CapabilityMatrix rows={capabilities.rows} summary={capabilities.summary} />}
      </TabsContent>

      <TabsContent value="migration" className="mt-4">
        <MigrationMap platform={overview?.platform || {}} />
      </TabsContent>

      <TabsContent value="graph" className="mt-4">
        <MetadataGraphPanel graph={graph} loading={busy === 'graph'} />
      </TabsContent>

      <TabsContent value="validation" className="mt-4">
        <ValidationPanel validation={validation} compiled={compiled} />
      </TabsContent>

      <TabsContent value="artefacts" className="mt-4">
        <ArtefactPreview
          registers={registers}
          entityKey={entityKey}
          onEntityChange={setEntityKey}
          reference={reference}
          loading={busy === 'entity'}
          error=""
        />
      </TabsContent>
    </Tabs>
  );

  return (
    <ModuleShell
      title="PMM Product Factory"
      subtitle="The metadata layer for this platform: domains, registers, automations and capabilities reconciled against the app as it actually is, validated, and compiled into one graph. Reference output shows what the factory would generate; nothing generated here is deployed."
      icon={Factory}
      moduleKey="pmm-factory"
      search={null}
      actions={null}
      insight={<FactoryKpiStrip counts={kpis.counts} byStatus={kpis.byStatus} graphHash={kpis.graphHash} />}
      tabs={tabs}
    >
      {notice}
    </ModuleShell>
  );
}