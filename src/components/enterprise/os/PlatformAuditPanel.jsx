import React from 'react';
import CoverageBadge from '@/components/enterprise/os/CoverageBadge';
import {
  API_PLAN,
  ENTERPRISE_GAPS,
  OPERATING_SYSTEMS,
  PLATFORM_AUDIT,
  PLATFORM_COVERAGE,
  SCHEMA_PLAN,
  osCoverage,
} from '@/lib/enterpriseOS';

const INVENTORY = [
  { label: 'Pages', value: PLATFORM_AUDIT.pages },
  { label: 'Entity schemas', value: PLATFORM_AUDIT.entitySchemas },
  { label: 'Backend functions', value: PLATFORM_AUDIT.backendFunctions },
  { label: 'Workflows', value: PLATFORM_AUDIT.workflows },
  { label: 'Modules in directory', value: PLATFORM_AUDIT.modules },
  { label: 'Navigation groups', value: PLATFORM_AUDIT.navGroups },
];

/** @param {any} props */
export default function PlatformAuditPanel() {
  return (
    <div className="space-y-3">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold leading-tight text-[#0A2B6D]">Platform audit</h2>
            <p className="mt-1 text-sm leading-relaxed text-[#0A2B6D]/75">
              Counted from the live repository on {PLATFORM_AUDIT.auditedOn}. Nothing was removed to produce
              these numbers, and no capability is marked working without a module or register behind it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <CoverageBadge state="live" label="Working" count={PLATFORM_COVERAGE.live} />
            <CoverageBadge state="partial" label="Partial" count={PLATFORM_COVERAGE.partial} />
            <CoverageBadge state="gap" label="Gap" count={PLATFORM_COVERAGE.gap} />
          </div>
        </div>

        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {INVENTORY.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-[#F8FAFC] p-2.5">
              <dt className="text-[11px] font-semibold leading-snug text-[#0A2B6D]/80">{item.label}</dt>
              <dd className="text-xl font-extrabold leading-tight text-[#0A2B6D]">{item.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <h3 className="text-sm font-extrabold text-[#0A2B6D]">Coverage by operating system</h3>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {['Operating system', 'Working', 'Partial', 'Gap', 'Coverage'].map((heading) => (
                  <th
                    key={heading}
                    scope="col"
                    className="border-b border-slate-200 px-3 py-2 text-left text-[11px] font-extrabold uppercase tracking-widest text-[#0A2B6D]"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {OPERATING_SYSTEMS.map((os) => {
                const coverage = osCoverage(os);
                return (
                  <tr key={os.id}>
                    <td className="border-b border-slate-100 px-3 py-1.5 font-bold text-[#0A2B6D]">{os.label}</td>
                    <td className="border-b border-slate-100 px-3 py-1.5 font-semibold text-[#0B6B45]">{coverage.live}</td>
                    <td className="border-b border-slate-100 px-3 py-1.5 font-semibold text-[#8A4B00]">{coverage.partial}</td>
                    <td className="border-b border-slate-100 px-3 py-1.5 font-semibold text-[#8A1230]">{coverage.gap}</td>
                    <td className="border-b border-slate-100 px-3 py-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.max(coverage.percent, 3)}%`,
                              background: 'linear-gradient(90deg, #0072FF 0%, #5A00D6 70%, #FF2E9A 100%)',
                            }}
                          />
                        </div>
                        <span className="text-xs font-bold text-[#0A2B6D]">{coverage.percent}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h3 className="text-sm font-extrabold text-[#0A2B6D]">Schema expansion plan</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#0A2B6D]/75">
            Schemas that no existing entity covers. Every table must carry tenant, audit and soft-delete fields.
          </p>
          <ul className="mt-2 space-y-1.5">
            {SCHEMA_PLAN.map((row) => (
              <li key={row.scheme} className="rounded-lg border border-slate-200 p-2">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-[#0A2B6D]">{row.scheme} schema</p>
                  <CoverageBadge state={row.state} />
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-[#0A2B6D]/75">{row.entities.join(', ')}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
          <h3 className="text-sm font-extrabold text-[#0A2B6D]">API expansion plan</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#0A2B6D]/75">
            Target contract domains. A domain is only working when it is authenticated, tenant-isolated and
            validated — today the app reads and writes through the platform SDK and backend functions.
          </p>
          <ul className="mt-2 space-y-1.5">
            {API_PLAN.map((row) => (
              <li
                key={row.contract}
                className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 p-2"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0A2B6D]">{row.domain}</p>
                  <p className="text-[11px] font-mono text-[#0A2B6D]/70">{row.contract}</p>
                </div>
                <CoverageBadge state={row.state} />
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs">
        <h3 className="text-sm font-extrabold text-[#0A2B6D]">Gap register ({ENTERPRISE_GAPS.length})</h3>
        <ol className="mt-2 space-y-1.5">
          {ENTERPRISE_GAPS.map((item) => (
            <li key={`${item.osId}-${item.gap}`} className="flex gap-2 rounded-lg border border-slate-200 p-2">
              <span className="mt-0.5 shrink-0 rounded bg-[#F5F0FF] px-1.5 py-0.5 text-[11px] font-extrabold text-[#5A00D6]">
                P{item.priority}
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">{item.os}</p>
                <p className="text-xs leading-relaxed text-[#0A2B6D]">{item.gap}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}