import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CircleSlash, CircleDot, CheckCircle2 } from 'lucide-react';
import CoverageBadge from '@/components/enterprise/os/CoverageBadge';
import useOsRecordCounts from '@/hooks/useOsRecordCounts';
import { MODULE_DIRECTORY } from '@/lib/moduleDirectory';
import { osCoverage } from '@/lib/enterpriseOS';

const ICONS = { live: CheckCircle2, partial: CircleDot, gap: CircleSlash };
const ICON_COLOURS = { live: '#0B6B45', partial: '#8A4B00', gap: '#8A1230' };

/** @param {any} props */
export default function OsDetailPanel({ os }) {
  const coverage = osCoverage(os);
  const counts = useOsRecordCounts(os.registers || []);
  const modules = (os.moduleKeys || [])
    .map((key) => MODULE_DIRECTORY.find((module) => module.key === key))
    .filter(Boolean);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold leading-tight text-[#0A2B6D]">{os.label}</h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-[#0A2B6D]/75">{os.summary}</p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <CoverageBadge state="live" count={coverage.live} />
          <CoverageBadge state="partial" count={coverage.partial} />
          <CoverageBadge state="gap" count={coverage.gap} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5A00D6]">
            Capability coverage
          </h3>
          <ul className="mt-2 space-y-1.5">
            {os.capabilities.map((capability) => {
              const Icon = ICONS[capability.state] || CircleSlash;
              return (
                <li key={capability.label} className="flex gap-2 rounded-lg border border-slate-200 p-2">
                  <Icon size={15} className="mt-0.5 shrink-0" style={{ color: ICON_COLOURS[capability.state] }} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold leading-snug text-[#0A2B6D]">{capability.label}</p>
                    {capability.note && (
                      <p className="mt-0.5 text-[11px] leading-snug text-[#0A2B6D]/70">{capability.note}</p>
                    )}
                    {capability.to && (
                      <Link
                        to={capability.to}
                        className="mt-0.5 inline-flex items-center gap-1 text-[11px] font-bold text-[#0072FF] hover:text-[#5A00D6]"
                      >
                        Open workspace <ArrowUpRight size={11} />
                      </Link>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5A00D6]">
              Modules serving this OS
            </h3>
            {modules.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {modules.map((module) => (
                  <Link
                    key={module.key}
                    to={module.path}
                    className="rounded-lg border border-[#C084FC]/50 bg-[#F5F0FF] px-2.5 py-1 text-xs font-bold text-[#0A2B6D] hover:border-[#0072FF] hover:text-[#5A00D6]"
                  >
                    {module.label}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-[#0A2B6D]/70">No module is dedicated to this OS yet.</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5A00D6]">
              Live registers
            </h3>
            {!os.registers?.length && (
              <p className="mt-2 text-xs text-[#0A2B6D]/70">No register is assigned to this OS yet.</p>
            )}
            {os.registers?.length > 0 && (
              <dl className="mt-2 grid grid-cols-2 gap-2">
                {os.registers.map((register) => {
                  const value = counts?.[register.entity];
                  return (
                    <div key={register.entity} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-2">
                      <dt className="text-[11px] font-semibold leading-snug text-[#0A2B6D]/80">
                        {register.label}
                      </dt>
                      <dd className="text-lg font-extrabold leading-tight text-[#0A2B6D]">
                        {counts === null ? '—' : value === null || value === undefined ? 'No access' : value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>

          {os.gaps?.length > 0 && (
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-[#5A00D6]">
                Not built yet
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs leading-relaxed text-[#0A2B6D]/80">
                {os.gaps.map((gap) => <li key={gap}>{gap}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}