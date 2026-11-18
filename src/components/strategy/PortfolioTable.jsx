import React from 'react';
import { Archive, Pause, Pencil, Play, Square } from 'lucide-react';
import { Button, DueBadge, NewRow, ProgressBar, StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, money } from '@/components/strategy/strategyKit';

/** @param {any} props */
export default function PortfolioTable({ portfolios = [], views = {}, canEdit, onNew, onEdit, onStatus } = {}) {
  return (
    <div>
      <NewRow canEdit={canEdit} label="New portfolio" onNew={onNew} note="A portfolio needs a sponsor and a stated strategy alignment before it can be saved." />
      {!portfolios.length ? (
        <StrategyEmpty
          title="No portfolio recorded yet"
          body="Start at the top of the chain: record a portfolio with its executive sponsor and how it serves the strategy, then link programs, objectives and benefits to it."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Portfolio</TableHead>
              <TableHead>Sponsor and alignment</TableHead>
              <TableHead>Programs and objectives</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Validated benefit</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {portfolios.map((row) => {
              const view = views[row.id] || {};
              return (
                <TableRow key={row.id}>
                  <TableCell className="min-w-[200px]">
                    <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.portfolio_key}{row.horizon ? ` · ${row.horizon}` : ''}</div>
                    {row.description && <div className="mt-0.5 max-w-xs text-[11px] text-[#0A2B6D]/70">{row.description}</div>}
                  </TableCell>
                  <TableCell className="min-w-[200px] text-[11px] text-[#0A2B6D]/80">
                    <div className="text-xs font-bold text-[#0A2B6D]">{row.sponsor}</div>
                    <div className="mt-0.5">{row.strategy_alignment}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                    {view.programCount ?? 0} programs · {view.objectiveCount ?? 0} objectives
                  </TableCell>
                  <TableCell className="min-w-[130px]"><ProgressBar value={view.progress ?? null} /></TableCell>
                  <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">{money(view.benefitValue ?? 0)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <DueBadge state={view.reviewState || 'No date'} />
                    <div className="mt-1 text-[11px] text-[#0A2B6D]/60">{row.review_due || '—'}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={row.status} />
                    {row.status_reason && <div className="mt-1 max-w-[180px] text-[11px] text-[#0A2B6D]/70">{row.status_reason}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {canEdit && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                      {canEdit && ['Draft', 'Paused'].includes(row.status) && (
                        <Button size="sm" variant="secondary" onClick={() => onStatus?.(row, 'Active')}><Play className="h-3.5 w-3.5" /> Activate</Button>
                      )}
                      {canEdit && row.status === 'Active' && (
                        <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Paused')}><Pause className="h-3.5 w-3.5" /> Pause</Button>
                      )}
                      {canEdit && ['Active', 'Paused'].includes(row.status) && (
                        <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Closed')}><Square className="h-3.5 w-3.5" /> Close</Button>
                      )}
                      {canEdit && row.status !== 'Archived' && (
                        <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Archived')}><Archive className="h-3.5 w-3.5" /> Archive</Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </TableFrame>
      )}
    </div>
  );
}