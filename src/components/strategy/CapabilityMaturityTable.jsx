import React from 'react';
import { DueBadge, StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow } from '@/components/strategy/strategyKit';

const level = (value) => (typeof value === 'number' ? value : '—');

/** Maturity is labelled with where the figure came from, so a declared score never reads as proven. */
export default function CapabilityMaturityTable({ capabilities = [] } = {}) {
  if (!capabilities.length) {
    return (
      <StrategyEmpty
        title="No capability recorded yet"
        body="Record a capability with its current and target maturity, then add maturity assessments. A capability only counts as evidence backed when a validated assessment carries evidence references."
      />
    );
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-[#0A2B6D]">Capability maturity</h3>
      <TableFrame>
        <TableHeader>
          <TableRow>
            <TableHead>Capability</TableHead>
            <TableHead>Current</TableHead>
            <TableHead>Target</TableHead>
            <TableHead>Gap</TableHead>
            <TableHead>Basis</TableHead>
            <TableHead>Review due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {capabilities.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="min-w-[200px]">
                <div className="text-xs font-bold text-[#0A2B6D]">{row.name}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">{row.domain || 'No domain'} · {row.owner || 'no owner'}</div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                <span className="font-bold">{level(row.current)}</span>
                {row.levelLabel && <span className="text-[#0A2B6D]/60"> · {row.levelLabel}</span>}
              </TableCell>
              <TableCell className="text-xs text-[#0A2B6D]">{level(row.target)}</TableCell>
              <TableCell className="text-xs font-bold text-[#0A2B6D]">{row.gap === null ? '—' : row.gap > 0 ? row.gap : 'met'}</TableCell>
              <TableCell className="min-w-[200px]">
                <div className="flex flex-wrap items-center gap-1">
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${row.evidenceBacked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                    {row.evidenceBacked ? 'Evidence backed' : 'Not evidenced'}
                  </span>
                  <StatusBadge status={row.status} />
                </div>
                <div className="mt-1 text-[11px] text-[#0A2B6D]/70">{row.basis}</div>
                {row.assessor && <div className="text-[11px] text-[#0A2B6D]/60">{row.assessor} · {String(row.assessedAt).slice(0, 10)}</div>}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {row.review_due ? <><DueBadge state={row.reviewState} /><div className="mt-1 text-[11px] text-[#0A2B6D]/60">{row.review_due}</div></> : <span className="text-[11px] text-[#0A2B6D]/60">—</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableFrame>
    </div>
  );
}