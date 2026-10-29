import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { ASSURANCE_AREAS } from '@/lib/governanceFramework';
import { Loader2 } from 'lucide-react';

export default function AssuranceRegisters() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all(
      ASSURANCE_AREAS.map((area) => base44.entities[area.entity].count(area.query || {}).catch(() => null))
    ).then((values) => {
      if (!active) return;
      setCounts(Object.fromEntries(ASSURANCE_AREAS.map((area, index) => [area.key, values[index]])));
    });
    return () => { active = false; };
  }, []);

  const covered = counts ? ASSURANCE_AREAS.filter((area) => Number(counts[area.key]) > 0).length : 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Enterprise Assurance Registers</p>
          <p className="mt-1 max-w-3xl text-xs font-semibold text-[#0A2B6D]">
            The assurance areas an NDIS auditor, insurer or board will ask for, each backed by its live register.
            An area with no records is shown as a gap.
          </p>
        </div>
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-white px-4 py-2 text-center">
          <p className="text-2xl font-extrabold tabular-nums text-[#0A2B6D]">{counts === null ? '—' : `${covered}/${ASSURANCE_AREAS.length}`}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Areas with records</p>
        </div>
      </div>

      {counts === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {ASSURANCE_AREAS.map((area) => {
            const value = counts[area.key];
            const gap = !(Number(value) > 0);
            return (
              <div key={area.key} className={`rounded-xl border-2 bg-white p-3 ${gap ? 'border-[#FF2E9A]' : 'border-[#0A2B6D]'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-[#0A2B6D]">{area.key}</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5A00D6]">{area.standard}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-extrabold tabular-nums text-white ${gap ? 'bg-[#FF2E9A]' : 'bg-[#0A2B6D]'}`}>
                    {value === null || value === undefined ? '—' : value}
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium leading-4 text-[#0A2B6D]">{area.blurb}</p>
                <Link to={area.path} className="mt-1.5 inline-block text-[11px] font-bold text-[#0072FF] underline">
                  Open register →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}