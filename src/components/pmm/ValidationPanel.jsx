import React from 'react';
import { PmmEmpty } from './pmmKit';

function IssueList({ title, issues = [], tone = 'rose' }) {
  if (!issues.length) return null;
  const classes = tone === 'rose'
    ? 'border-rose-200 bg-rose-50 text-rose-800'
    : 'border-amber-200 bg-amber-50 text-amber-900';
  return (
    <div className={`rounded-xl border p-3 ${classes}`}>
      <p className="text-[11px] font-bold uppercase tracking-wide">{title} ({issues.length})</p>
      <ul className="mt-2 space-y-1">
        {issues.map((item, index) => (
          <li key={`${item.path}-${index}`} className="text-[11px] leading-5">
            <span className="font-mono font-bold">{item.path}</span> {item.message}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** @param {any} props */
export default function ValidationPanel({ validation = null, compiled = null } = {}) {
  if (!validation) return <PmmEmpty title="No validation run yet" body="Run the metadata validation to see the findings." />;
  const loaded = validation.loaded || {};
  const resolved = validation.resolved || {};
  return (
    <div className="space-y-3">
      <div className={`rounded-xl border p-3 text-xs leading-5 ${loaded.ok && resolved.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}>
        {loaded.ok && resolved.ok
          ? 'Every metadata record satisfies the specification and every declared reference resolves.'
          : 'The metadata does not yet satisfy the specification. The findings below are the work to do.'}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {Object.entries(loaded.counts || {}).map(([key, value]) => (
          <div key={key} className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">{key.replace(/([A-Z])/g, ' $1')}</p>
            <p className="mt-1 text-xl font-black leading-none text-[#0A2B6D]">{value}</p>
          </div>
        ))}
      </div>

      <IssueList title="Specification errors" issues={loaded.errors || []} />
      <IssueList title="Warnings" issues={loaded.warnings || []} tone="amber" />
      <IssueList title="Unresolved references" issues={(resolved.unresolved || []).map((item) => ({ path: `${item.from} → ${item.to}`, message: `${item.kind} does not resolve.` }))} />

      {compiled ? (
        <div className="rounded-xl border border-slate-200 bg-white p-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/60">Compile result</p>
          <p className="mt-1 text-[11px] leading-5 text-[#0A2B6D]/80">
            Deterministic graph hash <span className="font-mono font-bold">{compiled.graphHash}</span>, {compiled.coverage?.entities || 0} registers,
            {' '}{compiled.coverage?.modules || 0} modules and {compiled.coverage?.capabilities || 0} capabilities.
          </p>
          <p className="mt-2 text-[11px] font-bold text-[#0A2B6D]">Dependency order</p>
          <ol className="mt-1 flex flex-wrap gap-1.5">
            {(compiled.domainOrder || []).map((domain, index) => (
              <li key={domain} className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-[#0A2B6D]">
                {index + 1}. {domain}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}