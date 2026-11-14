import React from 'react';
import { CheckCheck, GitBranch } from 'lucide-react';
import GateBadge, { GateFindings } from './GateBadge';

export default function DocumentReleaseRow({ row, canGovern, onAcknowledge, onRevise }) {
  return (
    <tr className="border-b border-border/70 align-top">
      <td className="px-2 py-2 text-[12px] font-semibold text-[#0A2B6D]">
        {row.title}
        <p className="text-[11px] font-normal text-muted-foreground">{row.register_id} · v{row.version || '—'} · {row.category || 'Uncategorised'}</p>
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-[12px]">{row.status || '—'}</td>
      <td className="whitespace-nowrap px-2 py-2 text-[12px]">
        {row.approved_by ? `${row.approved_by}` : <span className="text-rose-700">No approver</span>}
        {row.approval_date ? <p className="text-[11px] text-muted-foreground">{row.approval_date}</p> : null}
      </td>
      <td className="px-2 py-2"><GateBadge state={row.state} /></td>
      <td className="px-2 py-2"><GateFindings blockers={row.blockers} unknowns={row.unknowns} /></td>
      <td className="px-2 py-2">
        <div className="flex flex-wrap justify-end gap-1">
          {row.state === 'ready' && (
            <button
              type="button"
              disabled
              onClick={() => onAcknowledge(row)}
              className="inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
            >
              <CheckCheck className="h-3 w-3" /> Acknowledge
            </button>
          )}
          {canGovern && row.status === 'Approved' && (
            <button
              type="button"
              disabled
              onClick={() => onRevise(row)}
              className="inline-flex items-center gap-1 rounded-md border border-[#0072FF]/40 bg-white px-2 py-1 text-[11px] font-bold text-[#0A2B6D] hover:bg-[#F5F0FF] disabled:opacity-50"
            >
              <GitBranch className="h-3 w-3" /> New draft version
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}