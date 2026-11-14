import React from 'react';
import GateBadge, { GateFindings } from './GateBadge';

export default function BillingExceptionRow({ row, selected, onToggle }) {
  const selectable = row.state === 'ready';
  return (
    <tr className="border-b border-border/70 align-top">
      <td className="px-2 py-2">
        <input
          type="checkbox"
          className="h-4 w-4"
          checked={selected}
          disabled={!selectable}
          onChange={() => onToggle(row.shift_id)}
          aria-label={`Select shift on ${row.date} for ${row.participant_name || 'participant'}`}
        />
      </td>
      <td className="whitespace-nowrap px-2 py-2 text-[12px] font-semibold text-[#0A2B6D]">{row.date || '—'}</td>
      <td className="px-2 py-2 text-[12px] text-[#0A2B6D]">{row.participant_name || '—'}</td>
      <td className="px-2 py-2 text-[12px] font-semibold">${row.amount.toFixed(2)}</td>
      <td className="px-2 py-2"><GateBadge state={row.state} /></td>
      <td className="px-2 py-2"><GateFindings blockers={row.blockers} unknowns={row.unknowns} /></td>
    </tr>
  );
}