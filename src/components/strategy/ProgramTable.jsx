import React from 'react';
import { Archive, Pause, Pencil, Play, Square } from 'lucide-react';
import { Button, DueBadge, NewRow, StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow } from '@/components/strategy/strategyKit';

/** @param {any} props */
export default function ProgramTable({ programs = [], portfolios = [], canEdit, onNew, onEdit, onStatus } = {}) {
  const live = programs.filter((row) => row.status !== 'Archived');
  return (
    <div>
      <NewRow
        canEdit={canEdit}
        label="New program"
        onNew={onNew}
        note={portfolios.length ? 'A program always belongs to one portfolio in this business.' : 'Record a portfolio first: every program must belong to one.'}
      />
      {!programs.length ? (
        <StrategyEmpty
          title="No program recorded yet"
          body="A program turns a portfolio into a body of work. Link it to a portfolio so its objectives roll up to the right strategy."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Program</TableHead>
              <TableHead>Portfolio</TableHead>
              <TableHead>Sponsor and owner</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programs.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[210px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.program_key}</div>
                  <div className="mt-0.5 max-w-xs text-[11px] text-[#0A2B6D]/70">{row.purpose}</div>
                </TableCell>
                <TableCell className="min-w-[150px] text-xs text-[#0A2B6D]">
                  {row.portfolio_name}
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.portfolio_key}</div>
                </TableCell>
                <TableCell className="text-[11px] text-[#0A2B6D]/80">
                  <div className="text-xs font-bold text-[#0A2B6D]">{row.sponsor}</div>
                  <div>{row.owner_role || 'No delivery owner'}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]/80">
                  <div>{row.start_date || 'No start'}</div>
                  <div className="mt-1 flex items-center gap-1">{row.target_date || 'No target'} {row.status !== 'Closed' && <DueBadge state={row.target_date ? 'On track' : 'No date'} />}</div>
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
                    {canEdit && row.status !== 'Archived' && live.includes(row) && (
                      <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Archived')}><Archive className="h-3.5 w-3.5" /> Archive</Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </TableFrame>
      )}
    </div>
  );
}