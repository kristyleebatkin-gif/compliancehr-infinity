import React, { useState } from 'react';
import {
  MASTER_SCOPE_VERSION, MASTER_CATALOGUE, MASTER_ROLES, MASTER_WORKSPACE_ELEMENTS,
  MODULE_OUTPUTS, MASTER_TRACEABILITY, MASTER_ENGINES, FOUNDATION_SERVICES, MASTER_COPILOTS,
  MODULE_AI_REQUIREMENTS, MASTER_EVIDENCE_REQUIREMENTS, MASTER_INTEGRATIONS, MASTER_FRAMEWORKS,
  MASTER_SECURITY_REQUIREMENTS, MASTER_ENTITY_FIELDS, MASTER_DATABASE_REQUIREMENTS,
  MASTER_API_REQUIREMENTS, MASTER_DESIGN_REQUIREMENTS, ARCHITECTURE_DECISIONS, filterMasterCatalogue,
} from '@/lib/enterpriseMasterScope';

const groups = [
  ['Role catalogue — proposed roles', MASTER_ROLES],
  ['Every role workspace requires', MASTER_WORKSPACE_ELEMENTS],
  ['Universal engines', MASTER_ENGINES],
  ['Foundation services', FOUNDATION_SERVICES],
  ['AI copilots', MASTER_COPILOTS],
  ['AI requirements for every module', MODULE_AI_REQUIREMENTS],
  ['Evidence requirements for every module', MASTER_EVIDENCE_REQUIREMENTS],
  ['Integration targets — connection not established by this catalogue', MASTER_INTEGRATIONS],
  ['Compliance framework targets — applicability and editions require verification', MASTER_FRAMEWORKS],
  ['Security requirements', MASTER_SECURITY_REQUIREMENTS],
  ['Target entity fields — existing IDs are preserved', MASTER_ENTITY_FIELDS],
  ['Target database capabilities — persistence design required', MASTER_DATABASE_REQUIREMENTS],
  ['API contract deliverables', MASTER_API_REQUIREMENTS],
  ['Design and accessibility requirements', MASTER_DESIGN_REQUIREMENTS],
];

export default function EnterpriseMasterScope() {
  const [query, setQuery] = useState('');
  const rows = filterMasterCatalogue(query);
  return (
    <div className="space-y-4 text-[#0A2B6D]">
      <section className="space-y-3 rounded-xl border border-[#4F46E5]/30 bg-white p-4">
        <h2 className="text-lg font-extrabold">Master enterprise scope · Version {MASTER_SCOPE_VERSION}</h2>
        <p className="text-sm">{MASTER_CATALOGUE.length} catalogue groups reserve 1,500 module numbers. Individual modules, data contracts and acceptance criteria still need definition. These are scope targets; they do not represent 1,500 built modules or completed operating systems.</p>
        <p className="text-sm font-semibold">{MASTER_TRACEABILITY.join(' → ')}</p>
        <details><summary className="cursor-pointer font-bold">Architecture decisions and release boundaries</summary>
          <ul className="mt-3 list-inside list-disc space-y-2 text-sm">{ARCHITECTURE_DECISIONS.map(item => <li key={item}>{item}</li>)}</ul>
        </details>
      </section>
      <section className="space-y-3 rounded-xl border border-[#9333EA]/30 bg-white p-4">
        <h3 className="font-extrabold">Master module catalogue</h3>
        <label className="flex max-w-lg flex-col gap-1 text-sm font-semibold">Find a catalogue group
          <input className="rounded-lg border border-slate-300 px-3 py-2 font-normal" placeholder="Group name or number range" value={query} onChange={event => setQuery(event.target.value)} />
        </label>
        <p className="text-sm" role="status">{rows.length} of {MASTER_CATALOGUE.length} groups displayed.</p>
        <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm">
          <caption className="sr-only">Reserved module ranges and outstanding scope definition</caption>
          <thead><tr>{['Reserved range', 'Operating system group', 'Delivery status'].map(label => <th key={label} scope="col" className="border-b p-3">{label}</th>)}</tr></thead>
          <tbody>{rows.map(group => <tr key={group.id}><td className="border-b p-3 tabular-nums">{String(group.first).padStart(3, '0')}–{String(group.last).padStart(3, '0')}</td><td className="border-b p-3 font-semibold">{group.name}</td><td className="border-b p-3">{group.status}</td></tr>)}</tbody>
        </table></div>
        {!rows.length && <p>No catalogue groups match your search.</p>}
      </section>
      <section className="rounded-xl border border-[#EC4899]/30 bg-white p-4">
        <h3 className="font-extrabold">Forty required outputs for every defined module</h3>
        <p className="mt-2 text-sm">Each output needs a reviewed artefact and acceptance evidence before the module can be marked complete.</p>
        <ol className="mt-3 grid list-inside list-decimal gap-2 text-sm sm:grid-cols-2">{MODULE_OUTPUTS.map(item => <li key={item}>{item}</li>)}</ol>
      </section>
      <div className="grid items-start gap-3 lg:grid-cols-2">{groups.map(([label, items]) => <details key={label} className="rounded-xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer font-bold">{label}</summary>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm">{items.map(item => <li key={item}>{item}</li>)}</ul>
      </details>)}</div>
    </div>
  );
}
