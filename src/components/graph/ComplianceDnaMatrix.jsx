import React from 'react';
import { CheckCircle2, CircleDashed, AlertTriangle } from 'lucide-react';

const tone = {
  complete: { bar: '#0072FF', icon: CheckCircle2, iconTone: '#0072FF', label: 'Complete' },
  partial: { bar: '#A100FF', icon: CircleDashed, iconTone: '#A100FF', label: 'Partial' },
  gap: { bar: '#FF2E9A', icon: AlertTriangle, iconTone: '#FF2E9A', label: 'Not traced' },
  empty: { bar: '#C084FC', icon: CircleDashed, iconTone: '#5A00D6', label: 'No records' },
};

export default function ComplianceDnaMatrix({ rows }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs">
      <div className="border-b border-slate-200 p-3">
        <p className="text-sm font-extrabold text-[#0A2B6D]">Compliance DNA — 14-stage traceability</p>
        <p className="text-[11px] font-semibold text-[#0A2B6D]/75">
          Regulation → Standard → Obligation → Requirement → Control → Policy → Procedure → Form → Evidence → Audit →
          Finding → Corrective action → Risk → Outcome. Declared means the reference is stated in a text field but no
          record is linked to it yet.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC]">
            <tr>
              <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">Stage</th>
              <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">What it means here</th>
              <th className="px-2.5 py-1.5 text-right font-extrabold text-[#0A2B6D]">Records</th>
              <th className="px-2.5 py-1.5 text-right font-extrabold text-[#0A2B6D]">Traced</th>
              <th className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">Coverage</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const style = tone[row.status] || tone.empty;
              return (
                <tr key={row.key} className="border-t border-slate-100">
                  <td className="px-2.5 py-1.5 font-extrabold text-[#0A2B6D]">{row.label}</td>
                  <td className="px-2.5 py-1.5 font-semibold text-[#0A2B6D]/75">
                    {row.note}
                    {row.kind === 'declared' && (
                      <span className="ml-1 rounded-full border border-[#C084FC] px-1.5 py-0.5 text-[10px] font-bold text-[#5A00D6]">declared in text</span>
                    )}
                  </td>
                  <td className="px-2.5 py-1.5 text-right font-semibold tabular-nums text-[#0A2B6D]">{row.total}</td>
                  <td className="px-2.5 py-1.5 text-right font-semibold tabular-nums text-[#0A2B6D]">{row.covered}</td>
                  <td className="px-2.5 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-full max-w-[140px] overflow-hidden rounded-full bg-[#F5F0FF]">
                        <div className="h-full rounded-full" style={{ width: `${row.percent}%`, background: style.bar }} />
                      </div>
                      <span className="shrink-0 text-[11px] font-bold tabular-nums text-[#0A2B6D]">{row.percent}%</span>
                      <style.icon className="h-3.5 w-3.5 shrink-0" style={{ color: style.iconTone }} />
                      <span className="shrink-0 text-[10px] font-bold uppercase text-[#5A00D6]">{style.label}</span>
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