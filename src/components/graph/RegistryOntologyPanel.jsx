import React from 'react';
import { BadgeCheck, Layers, ShieldCheck } from 'lucide-react';

const STATUS_TONE = {
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Validated: 'bg-blue-50 text-blue-700 border-blue-200',
  Draft: 'bg-slate-50 text-slate-700 border-slate-200',
  Retired: 'bg-slate-50 text-slate-500 border-slate-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const parse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value || '');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

/** @param {any} props */
export default function RegistryOntologyPanel({ taxonomies = [], ontologies = [], onRebuild, canRebuild, rebuilding } = {}) {
  const taxonomy = taxonomies[0] || null;
  const nodeTypes = taxonomy ? parse(taxonomy.node_types_json, []) : [];
  const relationshipTypes = taxonomy ? parse(taxonomy.relationship_types_json, []) : [];

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A2B6D]">
            <Layers className="h-4 w-4" /> Controlled types
          </h3>
          {onRebuild && canRebuild && (
            <span className="text-[11px] text-[#0A2B6D]/60">Rebuild to refresh the type catalogue from this app's registers.</span>
          )}
        </div>
        {taxonomy ? (
          <>
            <p className="mt-1 text-xs text-[#0A2B6D]/70">{taxonomy.description}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {nodeTypes.map((type) => (
                <span key={type.key} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-[#0A2B6D]">
                  {type.label} <span className="font-normal text-[#0A2B6D]/60">({type.sourceEntity})</span>
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-[#0A2B6D]/60">
              {nodeTypes.length} node types and {relationshipTypes.length} relationship types. {taxonomy.is_system ? 'Generated from the registers this app actually has.' : 'Entered by hand.'}
            </p>
          </>
        ) : (
          <p className="mt-1 text-xs text-[#0A2B6D]/70">No type catalogue yet. Rebuild the index to generate it from the registers you hold.</p>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <h3 className="flex items-center gap-2 text-sm font-bold text-[#0A2B6D]">
          <ShieldCheck className="h-4 w-4" /> Ontologies in force
        </h3>
        {ontologies.length ? (
          <div className="mt-2 space-y-2">
            {ontologies.map((row) => {
              const triples = parse(row.allowed_relationships_json, []);
              return (
                <div key={row.id} className="rounded-lg border border-slate-200 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#0A2B6D]">{row.name}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[row.status] || STATUS_TONE.Draft}`}>{row.status}</span>
                    {row.is_system && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-[#0A2B6D]">
                        <BadgeCheck className="h-3 w-3" /> Built in
                      </span>
                    )}
                    <span className="text-[11px] text-[#0A2B6D]/60">v{row.version} · {row.triple_count ?? triples.length} allowed triples</span>
                  </div>
                  <p className="mt-1 text-xs text-[#0A2B6D]/70">{row.description}</p>
                  {row.constraints && <p className="mt-1 text-[11px] text-[#0A2B6D]/60">{row.constraints}</p>}
                  {row.approved_at && (
                    <p className="mt-1 text-[11px] text-[#0A2B6D]/60">
                      Approved by {row.approved_by || 'not recorded'} on {new Date(row.approved_at).toLocaleDateString()}.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="mt-1 text-xs text-[#0A2B6D]/70">No ontology is recorded yet, so nothing can be validated. Rebuild the index to install the built-in one.</p>
        )}
      </div>
    </div>
  );
}