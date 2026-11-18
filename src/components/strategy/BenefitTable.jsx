import React from 'react';
import { Archive, CheckCircle2, Pencil, XCircle } from 'lucide-react';
import { Button, NewRow, ProgressBar, StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, money } from '@/components/strategy/strategyKit';

/** Benefits roll up to one objective. Realisation is calculated from the actual measure only. */
export default function BenefitTable({ benefits = [], views = {}, objectives = [], canEdit, onNew, onEdit, onReview } = {}) {
  return (
    <div>
      <NewRow
        canEdit={canEdit}
        label="New benefit"
        onNew={onNew}
        note={objectives.length ? 'A valued benefit records the method and the amount a person assessed, not a guess.' : 'Record an objective first: every benefit belongs to one.'}
      />
      {!benefits.length ? (
        <StrategyEmpty
          title="No benefit recorded yet"
          body="A benefit carries a baseline, a target and the actual realised figure. Only validated benefits count toward the portfolio's valued benefit."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Benefit</TableHead>
              <TableHead>Baseline, target, actual</TableHead>
              <TableHead>Realisation</TableHead>
              <TableHead>Valuation</TableHead>
              <TableHead>Evidence</TableHead>
              <TableHead>Review</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benefits.map((row) => {
              const view = views[row.id] || {};
              return (
                <TableRow key={row.id}>
                  <TableCell className="min-w-[210px]">
                    <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.benefit_key} · {row.objective_name}</div>
                    {row.owner && <div className="text-[11px] text-[#0A2B6D]/60">Owner {row.owner}</div>}
                  </TableCell>
                  <TableCell className="min-w-[170px] text-[11px] text-[#0A2B6D]/80">
                    <div>Baseline {row.baseline_value === null || row.baseline_value === undefined ? '—' : row.baseline_value}</div>
                    <div>Target {row.target_value === null || row.target_value === undefined ? '—' : row.target_value} {row.unit}</div>
                    <div>Actual {row.actual_value === null || row.actual_value === undefined ? 'not measured' : row.actual_value}</div>
                  </TableCell>
                  <TableCell className="min-w-[130px]">
                    <ProgressBar value={view.progress ?? null} />
                    {view.realised && <div className="mt-1 text-[10px] font-bold text-emerald-700">Target met</div>}
                  </TableCell>
                  <TableCell className="min-w-[150px] text-[11px] text-[#0A2B6D]/80">
                    <div>{row.valuation_method}</div>
                    <div className="text-xs font-bold text-[#0A2B6D]">{money(view.valuation_amount ?? 0)}</div>
                  </TableCell>
                  <TableCell className="text-xs text-[#0A2B6D]">{view.evidenceCount ?? 0}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={row.review_status} />
                    {row.status_reason && <div className="mt-1 max-w-[180px] text-[11px] text-[#0A2B6D]/70">{row.status_reason}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {canEdit && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                      {canEdit && row.review_status !== 'Validated' && (
                        <Button size="sm" variant="secondary" onClick={() => onReview?.(row, 'Validated')}><CheckCircle2 className="h-3.5 w-3.5" /> Validate</Button>
                      )}
                      {canEdit && row.review_status !== 'Rejected' && (
                        <Button size="sm" variant="ghost" onClick={() => onReview?.(row, 'Rejected')}><XCircle className="h-3.5 w-3.5" /> Reject</Button>
                      )}
                      {canEdit && row.review_status !== 'Archived' && (
                        <Button size="sm" variant="ghost" onClick={() => onReview?.(row, 'Archived')}><Archive className="h-3.5 w-3.5" /> Archive</Button>
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