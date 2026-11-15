import React from 'react';
import PhasedImplementationPanel from './PhasedImplementationPanel';
import { Link } from 'react-router-dom';
import CoverageBadge from '@/components/enterprise/os/CoverageBadge';
import { DELIVERABLES, ENTERPRISE_GAPS, OPERATING_SYSTEMS, osCoverage, osStatus } from '@/lib/enterpriseOS';

/** @param {any} props */
export default function RoadmapPanel() {
  return (
    <div className="space-y-3">
      <PhasedImplementationPanel />
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <h2 className="text-lg font-extrabold leading-tight text-[#0A2B6D]">Existing source capability inventory</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-[#0A2B6D]/75">
          The twelve-phase sequence above governs delivery. This inventory retains the earlier source mappings;
          source coverage alone does not establish release acceptance.
        </p>

        <ol className="mt-3 space-y-1.5">
          {OPERATING_SYSTEMS.map((os) => {
            const coverage = osCoverage(os);
            return (
              <li
                key={os.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 p-2.5"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A2B6D] text-[11px] font-extrabold text-white">
                    {os.priority}
                  </span>
                  <p className="truncate text-sm font-bold text-[#0A2B6D]">{os.label}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-[#0A2B6D]/75">
                    {coverage.live} of {coverage.total} capabilities with source
                  </span>
                  <CoverageBadge state={osStatus(os)} />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h3 className="text-sm font-extrabold text-[#0A2B6D]">Final deliverables</h3>
          <ul className="mt-2 space-y-1.5">
            {DELIVERABLES.map((item) => (
              <li
                key={item.label}
                className="flex items-start justify-between gap-2 rounded-lg border border-slate-200 p-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0A2B6D]">{item.label}</p>
                  <p className="text-[11px] leading-snug text-[#0A2B6D]/70">{item.where}</p>
                </div>
                <CoverageBadge state={item.state} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h3 className="text-sm font-extrabold text-[#0A2B6D]">Earlier gap register</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#0A2B6D]/75">
            Existing findings are retained for reconciliation within the twelve-phase delivery sequence.
          </p>
          <ol className="mt-2 space-y-1.5">
            {ENTERPRISE_GAPS.slice(0, 8).map((item, index) => (
              <li key={`${item.osId}-next`} className="rounded-lg border border-slate-200 p-2">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#5A00D6]">
                  {index + 1}. {item.os}
                </p>
                <p className="text-xs leading-relaxed text-[#0A2B6D]">{item.gap}</p>
              </li>
            ))}
          </ol>
          <Link
            to="/documents"
            className="mt-3 inline-flex text-xs font-bold text-[#0072FF] hover:text-[#5A00D6]"
          >
            Open the document vault for the written audit pack
          </Link>
        </section>
      </div>
    </div>
  );
}