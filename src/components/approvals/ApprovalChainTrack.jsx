import React from 'react';
import { Check } from 'lucide-react';
import { stagesOf, decisionsOf } from '@/lib/approvalChain';

// The five-level ladder for one request: each stage shows its number, who decides it, and
// whether it has been signed, is waiting, or is still ahead.
export default function ApprovalChainTrack({ chain }) {
  const stages = stagesOf(chain);
  const approved = new Set(
    decisionsOf(chain).filter((entry) => entry.decision === 'approve').map((entry) => Number(entry.level))
  );
  if (!stages.length) {
    return <p className="text-xs text-muted-foreground">The approval stages for this request were not recorded.</p>;
  }
  return (
    <ol aria-label="Approval levels" className="flex flex-wrap items-stretch gap-1.5">
      {stages.map((stage) => {
        const isDone = approved.has(Number(stage.level));
        const isCurrent = !isDone && Number(chain.current_level) === Number(stage.level) && chain.status === 'Pending';
        const tone = isDone
          ? 'border-safe bg-safe/10 text-foreground'
          : isCurrent
            ? 'border-warning bg-warning/10 text-foreground'
            : 'border-border bg-card text-muted-foreground';
        return (
          <li key={stage.level} className={`min-w-[130px] flex-1 rounded-lg border px-2 py-1.5 ${tone}`}>
            <div className="flex items-center gap-1.5">
              <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${isDone ? 'bg-safe text-safe-foreground' : isCurrent ? 'bg-warning text-warning-foreground' : 'bg-muted text-muted-foreground'}`}>
                {isDone ? <Check className="h-3 w-3" /> : stage.level}
              </span>
              <span className="text-[11px] font-bold leading-tight">{stage.name}</span>
            </div>
            <p className="mt-0.5 text-[10px] leading-tight">{(stage.roles || []).join(', ')}</p>
          </li>
        );
      })}
    </ol>
  );
}