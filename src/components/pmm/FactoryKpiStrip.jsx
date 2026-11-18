import React from 'react';

const TILE = 'rounded-xl border border-slate-200 bg-white p-3 shadow-2xs';

/** @param {any} props */
export default function FactoryKpiStrip({ counts = {}, byStatus = {}, graphHash = '' } = {}) {
  const tiles = [
    { label: 'Domains', value: counts.domains ?? 0, note: 'Business domains in the metadata repository' },
    { label: 'Registers', value: counts.entities ?? 0, note: `${counts.existingEntities ?? 0} live, ${counts.plannedEntities ?? 0} planned` },
    { label: 'Modules mapped', value: counts.modules ?? 0, note: 'Existing modules serving the domains' },
    { label: 'Automations', value: counts.workflows ?? 0, note: 'Workflow files named in the metadata' },
    { label: 'Present', value: byStatus.present ?? 0, note: 'Capabilities the app can actually do today' },
    { label: 'Blocked', value: byStatus.blocked ?? 0, note: 'Capabilities that cannot be claimed' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {tiles.map((tile) => (
        <div key={tile.label} className={TILE}>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">{tile.label}</p>
          <p className="mt-1 text-2xl font-black leading-none text-[#0A2B6D]">{tile.value}</p>
          <p className="mt-1 text-[11px] leading-4 text-[#0A2B6D]/70">{tile.note}</p>
        </div>
      ))}
      {graphHash ? (
        <p className="text-[11px] text-[#0A2B6D]/60 sm:col-span-2 lg:col-span-6">
          Compiled graph hash <span className="font-mono font-bold text-[#0A2B6D]">{graphHash}</span>. The same metadata always compiles to the same hash.
        </p>
      ) : null}
    </div>
  );
}