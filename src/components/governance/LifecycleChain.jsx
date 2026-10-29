import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { LIFECYCLE_STAGES } from '@/lib/governanceFramework';
import { ArrowRight, Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LifecycleChain({ onOpenObjects }) {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all(
      LIFECYCLE_STAGES.map((stage) =>
        base44.entities.GovernanceObject.count({ lifecycle_stage: stage.key }).catch(() => 0)
      )
    ).then((values) => {
      if (!active) return;
      setCounts(Object.fromEntries(LIFECYCLE_STAGES.map((stage, index) => [stage.key, values[index] || 0])));
    });
    return () => { active = false; };
  }, []);

  const total = counts ? Object.values(counts).reduce((sum, value) => sum + value, 0) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">
              Universal Governance Lifecycle · One Object, One Chain
            </p>
            <p className="mt-1 max-w-3xl text-xs font-semibold text-[#0A2B6D]">
              Every object in the platform follows the same eleven-step chain. Nothing exists independently:
              a policy produces a procedure, a procedure produces a plan, a plan produces a form, the form
              updates a register, the register holds the record, the record raises the task, the task is closed
              with evidence, evidence is reviewed, reviewed in audit, and audit raises the improvement.
            </p>
          </div>
          <div className="rounded-xl border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center">
            <p className="text-2xl font-extrabold tabular-nums text-[#0A2B6D]">{counts === null ? '—' : total}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Governance objects</p>
          </div>
        </div>
      </div>

      {counts === null ? (
        <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="flex flex-wrap items-stretch gap-2">
          {LIFECYCLE_STAGES.map((stage, index) => {
            const Icon = stage.icon;
            return (
              <React.Fragment key={stage.key}>
                <div className="min-w-[150px] flex-1 rounded-xl border-2 border-[#0A2B6D] bg-white p-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A2B6D]">
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                    <p className="text-xs font-extrabold text-[#0A2B6D]">{stage.key}</p>
                    <span className="ml-auto rounded-full bg-[#F5F0FF] px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-[#5A00D6]">
                      {counts[stage.key] || 0}
                    </span>
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium leading-4 text-[#0A2B6D]">{stage.blurb}</p>
                </div>
                {index < LIFECYCLE_STAGES.length - 1 && (
                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-[#A100FF]" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#0A2B6D] bg-white p-3">
        <p className="text-xs font-semibold text-[#0A2B6D]">
          Record a policy, procedure, plan, form, register, record, task, evidence, review, audit or improvement
          and its framework fields — owner, version, links, evidence and retention — are captured with it.
        </p>
        <Button onClick={onOpenObjects}><Plus className="h-4 w-4" />Open the universal object register</Button>
      </div>
    </div>
  );
}