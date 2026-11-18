import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RegistryKpiStrip from '@/components/graph/RegistryKpiStrip';
import RegistryNodeTable from '@/components/graph/RegistryNodeTable';
import RegistryNodeInspector from '@/components/graph/RegistryNodeInspector';
import RegistryOntologyPanel from '@/components/graph/RegistryOntologyPanel';

const EMPTY = {
  nodes: [], nodeTotal: 0, truncatedList: false, typeCounts: [], taxonomies: [], ontologies: [],
  counts: {}, canRebuild: false, lastIndexedAt: '',
};

/** @param {any} props */
export default function GraphRegistryPanel() {
  const [filters, setFilters] = useState({ type: 'all', search: '' });
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [rebuilding, setRebuilding] = useState(false);

  const [open, setOpen] = useState(false);
  const [node, setNode] = useState(null);
  const [nodeData, setNodeData] = useState({ relationships: [], counts: {}, sourceRecord: null });
  const [nodeLoading, setNodeLoading] = useState(false);
  const [nodeError, setNodeError] = useState('');

  const load = useCallback(async (next) => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('knowledgeGraphRegistry', {
        action: 'list',
        type: next.type === 'all' ? '' : next.type,
        search: next.search.trim(),
      });
      const payload = response?.data || {};
      if (payload.error) setError(payload.error);
      else {
        setError('');
        setData({ ...EMPTY, ...payload });
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The graph registry is unavailable.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => load(filters), 250);
    return () => clearTimeout(timer);
  }, [filters, load]);

  const rebuild = async () => {
    setRebuilding(true);
    setError('');
    setNotice('');
    try {
      const response = await base44.functions.invoke('knowledgeGraphRegistry', { action: 'rebuild' });
      const payload = response?.data || {};
      if (payload.error) setError(payload.error);
      else {
        const summary = payload.summary || {};
        setNotice(
          `Index rebuilt from the registers: ${summary.nodes ?? 0} records, ${summary.relationships ?? 0} validated relationships`
          + `${summary.rejectedCount ? `, ${summary.rejectedCount} candidate edges rejected by the ontology` : ''}`
          + `${summary.durationMs ? ` in ${Math.round(summary.durationMs / 100) / 10}s` : ''}.`,
        );
        await load(filters);
      }
    } catch (e) {
      setError(e?.response?.data?.error || e?.message || 'The index could not be rebuilt.');
    } finally {
      setRebuilding(false);
    }
  };

  const inspect = async (row) => {
    setNode(row);
    setNodeData({ relationships: [], counts: {}, sourceRecord: null });
    setNodeError('');
    setOpen(true);
    setNodeLoading(true);
    try {
      const response = await base44.functions.invoke('knowledgeGraphRegistry', { action: 'node', entity_key: row.entity_key });
      const payload = response?.data || {};
      if (payload.error) setNodeError(payload.error);
      else setNodeData({ relationships: payload.relationships || [], counts: payload.counts || {}, sourceRecord: payload.sourceRecord || null });
    } catch (e) {
      setNodeError(e?.response?.data?.error || e?.message || 'That record could not be inspected.');
    } finally {
      setNodeLoading(false);
    }
  };

  const types = data.typeCounts.filter((row) => row.count > 0);

  return (
    <div className="space-y-3">
      <RegistryKpiStrip counts={data.counts} indexedAt={data.lastIndexedAt} />

      <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <Input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
            placeholder="Search indexed records"
            aria-label="Search indexed graph records"
          />
          <Select value={filters.type} onValueChange={(value) => setFilters((current) => ({ ...current, type: value }))}>
            <SelectTrigger className="sm:w-56" aria-label="Filter by node type"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All node types</SelectItem>
              {types.map((row) => (
                <SelectItem key={row.key} value={row.key}>{row.label} ({row.count})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {data.canRebuild && (
          <Button onClick={rebuild} disabled={rebuilding || loading}>
            <RefreshCw className={`h-4 w-4 ${rebuilding ? 'animate-spin' : ''}`} /> {rebuilding ? 'Rebuilding…' : 'Rebuild index'}
          </Button>
        )}
      </div>

      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800">{notice}</p>}
      {error && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

      <RegistryNodeTable
        nodes={data.nodes}
        total={data.nodeTotal}
        truncatedList={data.truncatedList}
        loading={loading}
        onOpen={inspect}
      />

      <RegistryOntologyPanel taxonomies={data.taxonomies} ontologies={data.ontologies} canRebuild={data.canRebuild} />

      <RegistryNodeInspector
        open={open}
        onOpenChange={setOpen}
        node={node}
        relationships={nodeData.relationships}
        counts={nodeData.counts}
        sourceRecord={nodeData.sourceRecord}
        loading={nodeLoading}
        error={nodeError}
      />
    </div>
  );
}