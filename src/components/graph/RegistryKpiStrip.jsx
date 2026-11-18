import React from 'react';
import { GitBranch, Link2, Network, ShieldQuestion, SplitSquareHorizontal, Tags } from 'lucide-react';

const tiles = [
  { key: 'nodes', label: 'Indexed records', hint: 'Real register records in the graph', icon: Network, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  { key: 'relationships', label: 'Relationships', hint: 'Validated edges in this business', icon: GitBranch, tone: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  { key: 'recordedLinks', label: 'Recorded links', hint: 'Mirrored from the Links register', icon: Link2, tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  { key: 'derivedEdges', label: 'Edges from record fields', hint: 'Read from the records themselves', icon: SplitSquareHorizontal, tone: 'text-slate-700 bg-slate-50 border-slate-200' },
  { key: 'nodesOrphan', label: 'Unlinked records', hint: 'Indexed with no relationship', icon: ShieldQuestion, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
  { key: 'relationshipTypesUsed', label: 'Relationship types used', hint: 'Of the 23 canonical types', icon: Tags, tone: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
];

/** @param {any} props */
export default function RegistryKpiStrip({ counts = {}, indexedAt = '' } = {}) {
  return (
    <div className="space-y-2">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {tiles.map(({ key, label, hint, icon: Icon, tone }) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
            <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${tone}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="mt-2 text-2xl font-bold text-[#0A2B6D]">{counts[key] ?? 0}</div>
            <div className="text-xs font-bold uppercase tracking-wide text-[#0A2B6D]/70">{label}</div>
            <p className="mt-0.5 text-[11px] text-[#0A2B6D]/60">{hint}</p>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-[#0A2B6D]/70">
        {indexedAt
          ? `Last indexed ${new Date(indexedAt).toLocaleString()}.`
          : 'The index has not been built yet, so there is nothing to inspect.'}
        {' '}Counts cover the indexed records of this business only.
      </p>
    </div>
  );
}