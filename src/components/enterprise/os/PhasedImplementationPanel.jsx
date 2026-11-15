import React, { useState } from 'react';
import { OS_BY_ID } from '@/lib/enterpriseOS';
import { EVIDENCE_CHAIN, PLATFORM_REQUIREMENTS, SHARED_ENGINES, ENTERPRISE_PHASES, REQUIRED_WORKSPACES, WORKSPACE_ELEMENTS, AI_ASSISTANTS, RELEASE_GATES } from '@/lib/enterprisePhases';

export default function PhasedImplementationPanel() {
  const [phaseId, setPhaseId] = useState(1);
  const phase = ENTERPRISE_PHASES.find(item => item.id === phaseId) || ENTERPRISE_PHASES[0];
  const box = 'rounded-xl border border-indigo-200 bg-white/95 p-4 shadow-2xs';
  return (
    <div className="space-y-4 text-[#0A2B6D]">
      <section className={box}>
        <h2 className="text-lg font-extrabold">Ten-phase enterprise implementation</h2>
        <p className="mt-2 text-sm">{EVIDENCE_CHAIN.join(' → ')}</p>
        <p className="mt-2 text-sm">This is the target delivery sequence. All phases require acceptance. Existing source mappings below identify reuse candidates; they do not establish completion.</p>
        <p className="mt-2 text-sm font-semibold">Security, privacy, tenant isolation and AI oversight start in the foundation and apply to every phase.</p>
        <details className="mt-3">
          <summary className="cursor-pointer font-semibold">Foundation and shared engines</summary>
          <p className="mt-2 text-sm">{PLATFORM_REQUIREMENTS.join(' · ')}</p>
          <p className="mt-2 text-sm">{SHARED_ENGINES.map(name => name + ' Engine').join(' · ')}</p>
          <p className="mt-2 text-xs">Router Remote requires a defined navigation contract. The existing React Router and routes are preserved.</p>
        </details>
      </section>
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,1fr)_3fr]">
        <nav aria-label="Implementation phases" className="grid content-start gap-2 sm:grid-cols-2 lg:grid-cols-1">
          {ENTERPRISE_PHASES.map(item => <button key={item.id} type="button" aria-pressed={item.id === phase.id} onClick={() => setPhaseId(item.id)} className={'rounded-xl border p-3 text-left text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ' + (item.id === phase.id ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 bg-white hover:bg-indigo-50')}>
            <span className="block text-xs text-indigo-700">Phase {item.id}</span>{item.title}
          </button>)}
        </nav>
        <section aria-live="polite" aria-atomic="true" className="min-w-0 space-y-3">
          <div className={box}>
            <h3 className="text-lg font-extrabold">Phase {phase.id} — {phase.title}</h3>
            <p className="mt-1 text-sm">Dependencies: {phase.dependsOn.length ? 'phases ' + phase.dependsOn.join(', ') : 'enterprise foundation acceptance'}.</p>
            <p className="mt-2 rounded-lg bg-indigo-50 p-3 text-sm"><strong>Acceptance gate: </strong>{phase.gate}</p>
            {phase.indicators && <p className="mt-2 text-sm"><strong>Executive dashboard requirements: </strong>{phase.indicators.join(' · ')}. Scores need documented definitions, denominators and evidence; unavailable results remain unavailable.</p>}
          </div>
          {phase.systems.map(system => <article key={system.name} className={box}>
            <h4 className="font-extrabold">{system.name}</h4>
            <p className="mt-1 text-xs font-semibold text-indigo-700">Target scope · acceptance pending</p>
            {system.registers.length > 0 && <p className="mt-2 text-sm"><strong>Registers: </strong>{system.registers.map(name => name + ' Register').join(' · ')}</p>}
            <ul className="mt-2 grid list-inside list-disc gap-1 text-sm sm:grid-cols-2">{system.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
            {system.frameworks.length > 0 && <p className="mt-2 text-sm"><strong>Framework targets: </strong>{system.frameworks.join(' · ')}. Edition, applicability and acceptance require verification.</p>}
            <details className="mt-3">
              <summary className="cursor-pointer text-sm font-bold">Existing source areas to reconcile</summary>
              {system.sourceIds.map(id => OS_BY_ID[id]).filter(Boolean).map(os => <div key={os.id} className="mt-2 border-t border-slate-200 pt-2">
                <p className="text-sm font-bold">{os.label}</p>
                <p className="text-xs">Source present: {os.capabilities.filter(c => c.state === 'live').length}; partial: {os.capabilities.filter(c => c.state === 'partial').length}; gaps: {os.capabilities.filter(c => c.state === 'gap').length}. Mapping covers the existing area, not all requirements above.</p>
                <ul className="mt-1 list-inside list-disc text-xs">{os.gaps.map(gap => <li key={gap}>{gap}</li>)}</ul>
              </div>)}
            </details>
          </article>)}
        </section>
      </div>
      <section className={box}>
        <h3 className="font-extrabold">Cross-platform delivery requirements</h3>
        <p className="mt-2 text-sm"><strong>Role workspaces: </strong>{REQUIRED_WORKSPACES.join(' · ')}</p>
        <p className="mt-2 text-sm"><strong>Each workspace: </strong>{WORKSPACE_ELEMENTS.join(' · ')}</p>
        <p className="mt-2 text-sm"><strong>Specialised AI assistants: </strong>{AI_ASSISTANTS.join(' · ')}</p>
        <p className="mt-2 text-sm">The target is 25+ operating systems, 350+ entity models, a unified evidence graph and enterprise data warehouse. Reconcile existing resources first; these targets do not represent current delivery.</p>
        <ol className="mt-3 list-inside list-decimal space-y-1 text-sm">{RELEASE_GATES.map(gate => <li key={gate}>{gate}</li>)}</ol>
      </section>
    </div>
  );
}
