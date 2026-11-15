import React from 'react';
import CoverageBadge from '@/components/enterprise/os/CoverageBadge';
import { osCoverage, osStatus } from '@/lib/enterpriseOS';

/** @param {any} props */
export default function OsCard({ os, active = false, onSelect }) {
  const coverage = osCoverage(os);
  const status = osStatus(os);

  return (
    <button
      type="button"
      onClick={() => onSelect(os.id)}
      aria-pressed={active}
      className={`h-full w-full rounded-xl border p-3.5 text-left shadow-2xs transition ${
        active
          ? 'border-[#0072FF] bg-[#F2F8FF] ring-2 ring-[#0072FF]/30'
          : 'border-slate-200 bg-white hover:border-[#C084FC]/70 hover:bg-[#F8FAFF]'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-[#5A00D6]">
            Priority {os.priority}
          </p>
          <h3 className="mt-0.5 break-words text-sm font-extrabold leading-snug text-[#0A2B6D]">
            {os.label}
          </h3>
        </div>
        <CoverageBadge state={status} />
      </div>

      <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-[#0A2B6D]/75">{os.summary}</p>

      <div
        className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100"
        role="img"
        aria-label={`${coverage.percent}% of source mapping score (unverified)`}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${coverage.percent}%`,
            background: 'linear-gradient(90deg, #0072FF 0%, #5A00D6 70%, #FF2E9A 100%)',
          }}
        />
      </div>
      <p className="mt-1.5 text-[11px] font-semibold text-[#0A2B6D]/80">
        {coverage.live} with source · {coverage.partial} partial · {coverage.gap} gaps
      </p>
    </button>
  );
}