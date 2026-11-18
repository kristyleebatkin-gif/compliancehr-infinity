import React from 'react';
import { Archive, ClipboardList, Pencil, Play } from 'lucide-react';
import { Button, DueBadge, NewRow, StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow } from '@/components/strategy/strategyKit';

/** @param {any} props */
export default function CapabilityTable({ capabilities = [], views = {}, canEdit, onNew, onEdit, onStatus, onAssess } = {}) {
  return (
    <div>
      <NewRow canEdit={canEdit} label="New capability" onNew={onNew} note="Record what the organisation can do today, where it needs to be, and what that judgement rests on." />
      {!capabilities.length ? (
        <StrategyEmpty
          title="No capability recorded yet"
          body="A capability tracks current and target maturity with its evidence basis. Maturity becomes evidence backed only when a validated assessment carries evidence references."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Capability</TableHead>
              <TableHead>Maturity</TableHead>
              <TableHead>Gap</TableHead>
              <TableHead>Basis</TableHead>
              <TableHead>Review</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {capabilities.map((row) => {
              const view = views[row.id] || {};
              return (
                <TableRow key={row.id}>
                  <TableCell className="min-w-[210px]">
                    <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.capability_key} · {row.domain || 'No domain'}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">Owner {row.owner}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                    <span className="font-bold">{view.current ?? row.current_maturity ?? '—'}</span> → {view.target ?? row.target_maturity ?? '—'}
                    {view.levelLabel && <div className="text-[11px] text-[#0A2B6D]/60">{view.levelLabel}</div>}
                  </TableCell>
                  <TableCell className="text-xs font-bold text-[#0A2B6D]">{view.gap === null || view.gap === undefined ? '—' : view.gap > 0 ? view.gap : 'met'}</TableCell>
                  <TableCell className="min-w-[190px]">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${view.evidenceBacked ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
                      {view.evidenceBacked ? 'Evidence backed' : 'Not evidenced'}
                    </span>
                    <div className="mt-1 text-[11px] text-[#0A2B6D]/70">{view.basis || row.evidence_basis}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <DueBadge state={view.reviewState || 'No date'} />
                    <div className="mt-1 text-[11px] text-[#0A2B6D]/60">{row.review_due || '—'}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap"><StatusBadge status={row.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {canEdit && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                      {canEdit && <Button size="sm" variant="secondary" onClick={() => onAssess?.(row)}><ClipboardList className="h-3.5 w-3.5" /> Assess</Button>}
                      {canEdit && row.status === 'Draft' && (
                        <Button size="sm" variant="ghost" onClick={() => onStatus?.(row, 'Active')}><Play className="h-3.5 w-3.5" /> Activate</Button>
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