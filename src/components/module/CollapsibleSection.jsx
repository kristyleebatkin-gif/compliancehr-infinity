import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { moduleColour } from '@/lib/moduleColours';

// Big dashboards sit at the end of a module and can be folded away.
export default function CollapsibleSection({ title, subject, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const accent = moduleColour(title || 'ComplianceHR');
  return (
    <section
      className="overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-panel"
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="comm-panel-bar relative flex w-full items-center justify-between gap-2 border-b-2 border-[#FF2E9A] px-4 py-3 text-left text-base font-extrabold text-white"
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="relative flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
            {subject || 'Dashboard Section'}
          </span>
          <span data-panel-title className="text-base font-extrabold text-white">{title}</span>
        </div>
        <ChevronDown className={`relative h-4 w-4 shrink-0 text-white transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="dashboard-panel-body p-3.5 text-xs"
          style={{ background: `linear-gradient(180deg, ${accent}10 0%, transparent 45%)` }}
        >
          {children}
        </div>
      )}
    </section>
  );
}