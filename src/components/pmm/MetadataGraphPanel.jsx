import React from 'react';
import { PanelNote, PmmEmpty } from './pmmKit';

const KIND_ORDER = ['platform', 'domain', 'entity', 'module', 'workflow', 'report', 'ai', 'capability', 'role'];

/** @param {any} props */
export default function MetadataGraphPanel({ graph = null, loading = false } = {}) {
  if (loading) return <PmmEmpty title="Building the metadata graph" body="Loading nodes and resolved references." />;
  if (!graph) return <PmmEmpty title="No graph yet" body="Open this tab again once the factory has compiled the metadata." />;
  const stats = graph.stats || {};
  const findings = graph.validated?.findings || [];
  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {KIND_ORDER.filter((kind) => stats[kind]).map((kind) => (
          <div key={kind} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">{kind}</p>
            <p className="mt-1 text-xl font-black leading-none text-[#0A2B6D]">{stats[kind]}</p>
          </div>
        ))}
      </div>

      <div className={`rounded-xl border p-3 text-xs leading-5 ${graph.validated?.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
        {graph.validated?.ok
          ? `The graph is valid: ${graph.nodes?.length || 0} nodes and ${graph.edges?.length || 0} resolved edges, with no duplicate ids, dangling edges or dependency cycles.`
          : `The graph has ${findings.length} finding(s).`}
      </div>

      {findings.length ? (
        <ul className="space-y-1">
          {findings.map((finding) => (
            <li key={`${finding.path}-${finding.message}`} className="rounded-lg border border-rose-200 bg-white p-2 text-[11px] text-rose-800">
              <span className="font-mono font-bold">{finding.path}</span> {finding.message}
            </li>
          ))}
        </ul>
      ) : null}

      {graph.orphans?.length ? (
        <PanelNote>
          {graph.orphans.length} node(s) carry no resolved edge: {graph.orphans.slice(0, 8).join(', ')}
          {graph.orphans.length > 8 ? ` and ${graph.orphans.length - 8} more` : ''}. Platform and role nodes are expected here because they are
          declared once rather than per domain.
        </PanelNote>
      ) : null}

      <div className="rounded-xl border border-slate-200 bg-white">
        <p className="border-b border-slate-200 p-3 text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">
          Nodes ({graph.nodes?.length || 0})
        </p>
        <ul className="max-h-80 divide-y divide-slate-100 overflow-auto">
          {(graph.nodes || []).map((node) => (
            <li key={node.id} className="flex items-center justify-between gap-3 px-3 py-1.5">
              <span className="min-w-0 truncate text-[11px] font-bold text-[#0A2B6D]">{node.name}</span>
              <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[10px] text-[#0A2B6D]/70">{node.kind}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}