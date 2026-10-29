import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { NDIS_PRACTICE_STANDARDS } from '@/lib/governanceFramework';
import { Loader2 } from 'lucide-react';

const keyOf = (standard, source) => `${standard}|${source.entity}|${source.label}`;

export default function NdisStandardsMap() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let active = true;
    const rows = NDIS_PRACTICE_STANDARDS.flatMap((standard) => standard.sources.map((source) => ({ standard, source })));
    Promise.all(rows.map(({ source }) => base44.entities[source.entity].count(source.query || {}).catch(() => null)))
      .then((values) => {
        if (!active) return;
        setCounts(Object.fromEntries(rows.map(({ standard, source }, index) => [keyOf(standard.key, source), values[index]])));
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5">
        <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">NDIS Practice Standards Mapping</p>
        <p className="mt-1 max-w-4xl text-xs font-semibold text-[#0A2B6D]">
          Every module, form, policy and register maps to the standard it evidences. A standard with no records is a
          visible gap before the auditor finds it.
        </p>
      </div>

      {counts === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {NDIS_PRACTICE_STANDARDS.map((standard) => {
            const values = standard.sources.map((source) => counts[keyOf(standard.key, source)]);
            const populated = values.filter((value) => Number(value) > 0).length;
            const total = standard.sources.length;
            return (
              <div
                key={standard.key}
                className={`rounded-xl border-2 bg-white p-3 ${populated === 0 ? 'border-[#FF2E9A]' : populated < total ? 'border-[#A100FF]' : 'border-[#0A2B6D]'}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-extrabold text-[#0A2B6D]">{standard.key}</p>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                    style={{ background: populated === 0 ? '#FF2E9A' : populated < total ? '#A100FF' : '#0A2B6D' }}
                  >
                    {populated}/{total} evidenced
                  </span>
                </div>
                <div className="mt-1.5 space-y-1">
                  {standard.sources.map((source) => {
                    const value = counts[keyOf(standard.key, source)];
                    return (
                      <div key={source.label} className="flex items-center justify-between gap-2 rounded-lg bg-[#F5F0FF] px-2 py-1">
                        <span className="min-w-0 truncate text-[11px] font-bold text-[#0A2B6D]">{source.label}</span>
                        <span className="shrink-0 text-[11px] font-extrabold tabular-nums text-[#5A00D6]">
                          {value === null || value === undefined ? '—' : value}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {standard.modules.map((path) => (
                    <Link key={path} to={path} className="rounded-full border border-[#C084FC] bg-white px-2 py-0.5 text-[10px] font-bold text-[#0072FF]">
                      {path}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}