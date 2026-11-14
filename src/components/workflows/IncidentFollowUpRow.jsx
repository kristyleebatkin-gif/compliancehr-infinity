import React from 'react';
import GateBadge, { GateFindings } from './GateBadge';

export default function IncidentFollowUpRow({ row, onAddAction }) {
  return (
    <tr className="border-b border-border/70 align-top">
      <td className="px-2 py-2 text-[12px] font-semibold text-[#0A2B6D]">
        {row.incident_number}
        <p className="mt-0.5 line-clamp-2 max-w-[280px] text-[11px] font-normal text-muted-foreground">{row.title}</p>
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-[12px]">{row.severity || '—'}</td>
      <td className="whitespace-nowrap px-2 py-2 text-[12px]">{row.owner || <span className="text-rose-700">No owner</span>}</td>
      <td className="whitespace-nowrap px-2 py-2 text-[12px]">{row.actions.length} linked</td>
      <td className="px-2 py-2"><GateBadge state={row.state} /></td>
      <td className="px-2 py-2"><GateFindings blockers={row.blockers} unknowns={row.unknowns} /></td>
      <td className="px-2 py-2 text-right">
        {row.state !== 'complete' && (
          <button
            type="button"
            onClick={() => onAddAction(row)}
            className="rounded-md border border-[#0072FF]/40 bg-white px-2 py-1 text-[11px] font-bold text-[#0A2B6D] hover:bg-[#F5F0FF]"
          >
            Add corrective action
          </button>
        )}
      </td>
    </tr>
  );
}