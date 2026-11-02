import React, { useState } from 'react';
import { ChevronDown, Sparkles } from 'lucide-react';
import { getHeaderView, getTitleGradientView } from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

function hashIndex(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** @param {any} props */
export default function CollapsibleSection({ title = undefined, subject = undefined, children = undefined, defaultOpen = true } = {}) {
  const [open, setOpen] = useState(defaultOpen);
  const seed = hashIndex(title || subject || 'section');

  return (
    <section
      className="rounded-3xl p-[10px] shadow-lg"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div className="overflow-hidden rounded-[16px] bg-white">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full flex-wrap items-center justify-between gap-2 border-b-2 border-[#0A2B6D]/15 bg-white px-4 py-3 text-left font-extrabold text-[#0A2B6D]"
        >
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className="inline-flex min-h-[34px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
              style={{ background: getHeaderView(seed) }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
              <span>{subject || 'Dashboard Section'}</span>
            </span>
            <span
              data-panel-title
              className="font-editorial text-base sm:text-lg font-extrabold bg-clip-text text-transparent"
              style={{ backgroundImage: getTitleGradientView(seed) }}
            >
              {title}
            </span>
          </div>
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-[#5A00D6] transition-transform ${open ? 'rotate-180' : ''}`}
          />
        </button>
        {open && (
          <div className="dashboard-panel-body bg-white p-4 text-xs text-[#0A2B6D]">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}