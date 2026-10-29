import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function LinkHealthTable({ health }) {
  if (!health) return null;
  const { rows, totals } = health;
  const percent = totals.total ? Math.round((totals.linked / totals.total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="grid gap-2 sm:grid-cols-4">
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 text-center">
          <p className="text-2xl font-extrabold tabular-nums text-[#0A2B6D]">{totals.total}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Governance objects</p>
        </div>
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 text-center">
          <p className="text-2xl font-extrabold tabular-nums text-[#0072FF]">{totals.linked}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Linked to another object</p>
        </div>
        <div className="rounded-xl border-2 border-[#FF2E9A] bg-white p-3 text-center">
          <p className="text-2xl font-extrabold tabular-nums text-[#FF2E9A]">{totals.orphans}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Standing alone</p>
        </div>
        <div className="rounded-xl border-2 border-[#0A2B6D] bg-white p-3 text-center">
          <p className="text-2xl font-extrabold tabular-nums text-[#5A00D6]">{percent}%</p>
          <p className="text-[10px] font-bold uppercase tracking-wide text-[#5A00D6]">Link coverage</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border-2 border-[#0A2B6D] bg-white">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F5F0FF]">
            <tr>
              <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">Object type</th>
              <th className="px-2.5 py-1.5 text-right font-extrabold text-[#0A2B6D]">Total</th>
              <th className="px-2.5 py-1.5 text-right font-extrabold text-[#0A2B6D]">Linked</th>
              <th className="px-2.5 py-1.5 text-right font-extrabold text-[#0A2B6D]">Standing alone</th>
              <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const rowPercent = row.total ? Math.round((row.linked / row.total) * 100) : 0;
              return (
                <tr key={row.key} className="border-t border-[#C084FC]/40">
                  <td className="px-2.5 py-1.5 font-bold text-[#0A2B6D]">
                    <Link to={row.path} className="underline decoration-[#C084FC]">{row.label}</Link>
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-semibold tabular-nums text-[#0A2B6D]">{row.total}</td>
                  <td className="px-2.5 py-1.5 text-right font-semibold tabular-nums text-[#0072FF]">{row.linked}</td>
                  <td className={`px-2.5 py-1.5 text-right font-semibold tabular-nums ${row.orphans ? 'text-[#FF2E9A]' : 'text-[#0A2B6D]'}`}>
                    {row.orphans}
                  </td>
                  <td className="px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-full max-w-[120px] overflow-hidden rounded-full bg-[#F5F0FF]">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${rowPercent}%`, background: rowPercent >= 70 ? '#0072FF' : rowPercent >= 35 ? '#A100FF' : '#FF2E9A' }}
                        />
                      </div>
                      <span className="shrink-0 text-[11px] font-bold tabular-nums text-[#0A2B6D]">{rowPercent}%</span>
                      {row.total === 0
                        ? <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5A00D6]">no records yet</span>
                        : row.orphans === 0
                          ? <CheckCircle2 className="h-3.5 w-3.5 text-[#0072FF]" />
                          : <AlertTriangle className="h-3.5 w-3.5 text-[#FF2E9A]" />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}