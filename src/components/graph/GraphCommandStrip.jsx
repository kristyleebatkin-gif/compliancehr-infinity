import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Network, Share2, AlertTriangle, Route, Layers } from 'lucide-react';

const tiles = [
  { key: 'nodes', label: 'Graph objects', icon: Network, tone: '#0A2B6D' },
  { key: 'edges', label: 'Typed links', icon: Share2, tone: '#0072FF' },
  { key: 'relationships', label: 'Relationship types in use', icon: Layers, tone: '#5A00D6' },
  { key: 'chains', label: 'Standards traced end to end', icon: Route, tone: '#0072FF' },
  { key: 'orphans', label: 'Objects standing alone', icon: AlertTriangle, tone: '#FF2E9A' },
];

export default function GraphCommandStrip({ health }) {
  const values = {
    nodes: health.nodeCount,
    edges: `${health.edgeCount}`,
    relationships: `${health.relationshipsUsed} / 23`,
    chains: `${health.completeChains} / ${health.standardCount}`,
    orphans: health.orphanCount,
  };
  const notes = {
    nodes: 'Records the graph can see across every register it covers.',
    edges: `${health.derivedCount} derived from record fields · ${health.recordedCount} recorded by hand`,
    relationships: 'The specification defines 23 typed relationships.',
    chains: `Average chain completeness ${health.averageChain}%`,
    orphans: 'Nothing references them, so an assessor cannot trace them.',
  };

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((tile) => (
          <div key={tile.key} className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-1.5">
              <tile.icon className="h-3.5 w-3.5" style={{ color: tile.tone }} />
              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#5A00D6]">{tile.label}</p>
            </div>
            <p className="mt-1 text-2xl font-extrabold tabular-nums text-[#0A2B6D]">{values[tile.key]}</p>
            <p className="text-[10px] font-semibold leading-snug text-[#0A2B6D]/70">{notes[tile.key]}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">Objects by type</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {health.byType.map((row) => (
            <Link
              key={row.key}
              to={row.path}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-bold transition ${
                row.count === 0 ? 'border-dashed border-[#C084FC] text-[#0A2B6D]/60' : 'border-[#C084FC] text-[#0A2B6D] hover:bg-[#F5F0FF]'
              }`}
            >
              {row.label}
              <span className="tabular-nums">{row.count}</span>
              {row.count > 0 && row.linked === 0 && (
                <span className="text-[#FF2E9A]">none linked</span>
              )}
              <ArrowRight className="h-2.5 w-2.5 text-[#A100FF]" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}