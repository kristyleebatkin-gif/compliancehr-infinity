import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { moduleColour } from '@/lib/moduleColours';

// Big dashboards sit at the end of a module and can be folded away.
export default function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const accent = moduleColour(title || 'ComplianceHR');
  return (
    <section
      className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel"
      style={{ borderTop: `4px solid ${accent}` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="comm-panel-bar relative flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-bold text-white"
        style={{ background: 'var(--header-gradient)' }}
      >
        <span className="relative">{title}</span>
        <ChevronDown className={`relative h-4 w-4 shrink-0 text-white transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          className="p-3.5"
          style={{ background: `linear-gradient(180deg, ${accent}10 0%, transparent 45%)` }}
        >
          {children}
        </div>
      )}
    </section>
  );
}