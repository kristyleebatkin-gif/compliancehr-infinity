import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, Route } from 'lucide-react';

const stageTone = {
  linked: { border: '#0072FF', chip: '#0072FF', label: 'Linked' },
  declared: { border: '#A100FF', chip: '#A100FF', label: 'Declared' },
  break: { border: '#FF2E9A', chip: '#FF2E9A', label: 'Break' },
};

export default function TraceabilityPanel({ traces }) {
  const [onlyBroken, setOnlyBroken] = useState(false);
  const [expandedId, setExpandedId] = useState(traces[0]?.standard?.id || '');

  const visible = onlyBroken ? traces.filter((entry) => entry.trace.breaks.length > 0) : traces;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
        <div className="max-w-3xl">
          <p className="text-sm font-extrabold text-[#0A2B6D]">Trace one standard, stage by stage</p>
          <p className="text-[11px] font-semibold text-[#0A2B6D]/75">
            Sorted worst first. Each break is the exact point where an assessor cannot follow the chain from the
            regulation to the outcome using the records you hold today.
          </p>
        </div>
        <Button size="sm" variant={onlyBroken ? 'default' : 'outline'} onClick={() => setOnlyBroken((value) => !value)}>
          <Route className="h-3.5 w-3.5" />{onlyBroken ? 'Showing broken chains' : 'Show broken chains only'}
        </Button>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-[#C084FC] bg-[#F5F0FF] p-4 text-center text-xs font-bold text-[#0A2B6D]">
          No standards in the register yet, so there is no chain to trace. Standards are seeded in the Evidence OS.
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map(({ standard, trace }) => {
            const open = expandedId === standard.id;
            return (
              <div key={standard.id} className="rounded-xl border border-slate-200 bg-white shadow-2xs">
                <button
                  type="button"
                  onClick={() => setExpandedId(open ? '' : standard.id)}
                  className="flex w-full flex-wrap items-center justify-between gap-2 p-3 text-left"
                >
                  <span className="min-w-0">
                    <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#5A00D6]">
                      {standard.framework} · {standard.standard_code}
                    </span>
                    <span className="block text-sm font-extrabold text-[#0A2B6D]">{standard.standard_title}</span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className="text-[11px] font-bold tabular-nums text-[#0A2B6D]">{trace.resolved} of {trace.total} stages</span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[11px] font-extrabold text-white tabular-nums"
                      style={{ background: trace.percent >= 70 ? '#0072FF' : trace.percent >= 40 ? '#A100FF' : '#FF2E9A' }}
                    >
                      {trace.percent}%
                    </span>
                    <ChevronRight className={`h-4 w-4 text-[#0A2B6D] transition ${open ? 'rotate-90' : ''}`} />
                  </span>
                </button>

                {open && (
                  <div className="border-t border-slate-100 p-3">
                    <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-4">
                      {trace.stages.map((stage) => {
                        const style = stageTone[stage.status];
                        return (
                          <div
                            key={stage.key}
                            className="rounded-lg border-2 bg-white p-2"
                            style={{ borderColor: style.border }}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[10px] font-extrabold uppercase tracking-wide text-[#0A2B6D]">{stage.label}</p>
                              <span className="text-[9px] font-extrabold uppercase" style={{ color: style.chip }}>{style.label}</span>
                            </div>
                            <p className="text-[10px] font-semibold leading-snug text-[#0A2B6D]/80">{stage.detail}</p>
                          </div>
                        );
                      })}
                    </div>
                    {trace.breaks.length > 0 && (
                      <p className="mt-2 rounded-lg border border-[#FF2E9A] bg-[#F5F0FF] p-2 text-[11px] font-semibold text-[#0A2B6D]">
                        <span className="font-extrabold">Close next: </span>
                        {trace.breaks.slice(0, 4).map((stage) => stage.label).join(', ')}. Add the missing record, or
                        record the link in the Links register, and this chain changes immediately.
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}