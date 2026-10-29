import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { REGISTER_AUTOMATION } from '@/lib/governanceFramework';
import { ArrowRight, BookOpen, Loader2 } from 'lucide-react';

export default function RegisterFramework() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all(
      REGISTER_AUTOMATION.map((row) => base44.entities[row.entity].count(row.query || {}).catch(() => null))
    ).then((values) => {
      if (!active) return;
      setCounts(Object.fromEntries(REGISTER_AUTOMATION.map((row, index) => [row.source, values[index]])));
    });
    return () => { active = false; };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border-2 border-[#0A2B6D] bg-[#F5F0FF] p-3.5">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-wider text-[#5A00D6]">Register Framework · Automatic Register Updates</p>
          <p className="mt-1 max-w-3xl text-xs font-semibold text-[#0A2B6D]">
            A record is never filed on its own. Every completed form, report or acknowledgement updates the master
            registers it belongs to, so a register is always the current index of the records behind it.
          </p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Link to="/registers" className="rounded-full bg-[#0A2B6D] px-3 py-1 text-[11px] font-extrabold text-white">Universal Register Hub</Link>
          <Link to="/documents" className="rounded-full border-2 border-[#0A2B6D] bg-white px-3 py-1 text-[11px] font-extrabold text-[#0A2B6D]">Document Vault</Link>
        </div>
      </div>

      {counts === null ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          {REGISTER_AUTOMATION.map((row) => (
            <div key={row.source} className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-extrabold text-[#0A2B6D]">{row.source}</p>
                  <p className="text-[11px] font-semibold text-[#5A00D6]">Source record type</p>
                </div>
                <span className="rounded-full bg-[#F5F0FF] px-2.5 py-0.5 text-[11px] font-extrabold tabular-nums text-[#5A00D6]">
                  {counts[row.source] === null || counts[row.source] === undefined ? '—' : `${counts[row.source]} on file`}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-[#0A2B6D]">
                <ArrowRight className="h-3 w-3" />Updates
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {row.registers.map((register) => (
                  <span key={register} className="inline-flex items-center gap-1 rounded-full border border-[#C084FC] bg-[#F5F0FF] px-2 py-0.5 text-[11px] font-bold text-[#0A2B6D]">
                    <BookOpen className="h-3 w-3 text-[#5A00D6]" />{register}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}