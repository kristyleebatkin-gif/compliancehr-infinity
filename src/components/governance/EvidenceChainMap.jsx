import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { EVIDENCE_CHAINS } from '@/lib/governanceFramework';
import { ArrowRight, Loader2 } from 'lucide-react';

const keyOf = (chain, step) => `${chain}|${step.entity}|${step.label}`;

export default function EvidenceChainMap() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let active = true;
    const rows = EVIDENCE_CHAINS.flatMap((chain) => chain.steps.map((step) => ({ chain, step })));
    Promise.all(rows.map(({ step }) => base44.entities[step.entity].count(step.query || {}).catch(() => null)))
      .then((values) => {
        if (!active) return;
        setCounts(Object.fromEntries(rows.map(({ chain, step }, index) => [keyOf(chain.key, step), values[index]])));
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Evidence Mapping Engine</p>
        <p className="mt-1 max-w-4xl text-xs font-semibold text-[#0A2B6D]">
          Every participant and every staff member has one continuous chain from record to audit evidence. The counts
          below show where each chain is populated and where it breaks.
        </p>
      </div>

      {counts === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        EVIDENCE_CHAINS.map((chain) => (
          <div key={chain.key} className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
            <p className="text-sm font-extrabold text-[#0A2B6D]">{chain.title}</p>
            <div className="mt-2 flex flex-wrap items-stretch gap-1.5">
              {chain.steps.map((step, index) => {
                const value = counts[keyOf(chain.key, step)];
                return (
                  <React.Fragment key={step.label}>
                    <div className={`min-w-[120px] flex-1 rounded-lg border-2 p-2 ${Number(value) > 0 ? 'border-[#0A2B6D] bg-[#F5F0FF]' : 'border-dashed border-[#C084FC] bg-white'}`}>
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">{step.label}</p>
                      <p className="text-lg font-extrabold tabular-nums text-[#0A2B6D]">
                        {value === null || value === undefined ? '—' : value}
                      </p>
                    </div>
                    {index < chain.steps.length - 1 && (
                      <div className="flex items-center"><ArrowRight className="h-3.5 w-3.5 text-[#A100FF]" /></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
            {chain.steps.every((step) => Number(counts[keyOf(chain.key, step)]) > 0) ? (
              <p className="mt-1.5 text-[11px] font-bold text-[#0072FF]">Chain fully populated end to end.</p>
            ) : (
              <p className="mt-1.5 text-[11px] font-bold text-[#FF2E9A]">
                Chain has gaps — a missing step is evidence that cannot be produced at audit.
              </p>
            )}
          </div>
        ))
      )}
    </div>
  );
}