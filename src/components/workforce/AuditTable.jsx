import React from 'react';
import { StatusBadge } from '@/components/workforce/workforceKit';

const when = (value) => (value ? new Date(value).toLocaleString() : '—');

/** Append-only, hash-chained record of every action taken in this module. */
export default function AuditTable({ records = [] } = {}) {
  if (!records.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No audit record yet</p>
        <p className="mx-auto mt-1 max-w-xl text-xs text-[#0A2B6D]/70">
          Every change, refusal and review appends one record, chained to the record before it. Secrets and identifiers are removed before the detail is written.
        </p>
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <table className="w-full text-left">
        <thead className="bg-slate-50">
          <tr>
            {['When', 'Actor', 'Action', 'Subject', 'Outcome', 'Detail', 'Chain'].map((label) => (
              <th key={label} className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]">{label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((row) => (
            <tr key={row.id} className="border-t border-slate-100 align-top">
              <td className="whitespace-nowrap px-3 py-2 text-[11px] text-[#0A2B6D]/80">{when(row.occurred_at)}</td>
              <td className="min-w-[130px] px-3 py-2 text-[11px] text-[#0A2B6D]">
                <div className="font-bold">{row.actor}</div>
                <div className="text-[#0A2B6D]/60">{row.actor_role}</div>
              </td>
              <td className="min-w-[180px] px-3 py-2 text-xs font-bold text-[#0A2B6D]">{row.action}</td>
              <td className="min-w-[140px] px-3 py-2 text-[11px] text-[#0A2B6D]/80">
                <div>{row.subject_type}</div>
                <div className="text-[#0A2B6D]/50">{row.subject_ref || '—'}</div>
              </td>
              <td className="px-3 py-2"><StatusBadge status={row.outcome} /></td>
              <td className="min-w-[220px] px-3 py-2 text-[11px] text-[#0A2B6D]/80">
                {row.detail}
                {row.redacted_count > 0 && <div className="text-[#0A2B6D]/50">{row.redacted_count} value(s) redacted</div>}
              </td>
              <td className="px-3 py-2 text-[10px] text-[#0A2B6D]/50">{(row.chain_hash || '').slice(0, 14) || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}