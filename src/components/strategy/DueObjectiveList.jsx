import React from 'react';
import { DueBadge, ProgressBar, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow } from '@/components/strategy/strategyKit';

/** Objectives that are overdue or due within 30 days, with the measure behind each progress figure. */
export default function DueObjectiveList({ objectives = [] } = {}) {
  if (!objectives.length) {
    return (
      <StrategyEmpty
        title="Nothing overdue or due soon"
        body="No objective with a due date falls inside the next 30 days. Objectives without a real due date are shown as no date in the objectives register instead."
      />
    );
  }

  return (
    <div>
      <h3 className="mb-2 text-sm font-bold text-[#0A2B6D]">Objectives needing attention</h3>
      <TableFrame>
        <TableHeader>
          <TableRow>
            <TableHead>Objective</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Measure</TableHead>
            <TableHead>Progress</TableHead>
            <TableHead>Due</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {objectives.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="min-w-[220px]">
                <div className="text-xs font-bold text-[#0A2B6D]">{row.name}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">{row.portfolio_name} · {row.program_name}</div>
              </TableCell>
              <TableCell className="text-xs text-[#0A2B6D]">{row.owner || '—'}</TableCell>
              <TableCell className="min-w-[180px] text-[11px] text-[#0A2B6D]/80">
                <div>{row.measure || '—'}</div>
                <div className="text-[#0A2B6D]/60">
                  {row.baseline_value === null ? 'no baseline' : row.baseline_value} → {row.target_value === null ? 'no target' : row.target_value} {row.unit}
                  {row.current_value === null ? ' · no actual' : ` · now ${row.current_value}`}
                </div>
              </TableCell>
              <TableCell><ProgressBar value={row.progress} /></TableCell>
              <TableCell className="whitespace-nowrap">
                <DueBadge state={row.due} />
                <div className="mt-1 text-[11px] text-[#0A2B6D]/60">{row.due_date || '—'}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableFrame>
    </div>
  );
}