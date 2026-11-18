import React from 'react';
import { Archive, CheckCircle2, Pencil, RotateCcw, Send } from 'lucide-react';
import { Button, NewRow, StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow } from '@/components/strategy/strategyKit';

/** Versioned roadmaps. A submitted or approved version is never edited in place. */
export default function RoadmapTable({ roadmaps = [], programs = [], canEdit, canApprove, onNew, onEdit, onSubmit, onDecide, onArchive } = {}) {
  return (
    <div>
      <NewRow
        canEdit={canEdit}
        label="New roadmap"
        onNew={onNew}
        note={programs.length ? 'Saving a submitted or approved roadmap creates the next version instead of changing the approved one.' : 'Record a program first: every roadmap belongs to one.'}
      />
      {!roadmaps.length ? (
        <StrategyEmpty
          title="No roadmap recorded yet"
          body="A roadmap holds versioned initiatives, the dependencies between them and their milestones. It is approved by someone other than its author, and approval starts no work by itself."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Roadmap</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Decision</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roadmaps.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="min-w-[230px]">
                  <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                  <div className="text-[11px] text-[#0A2B6D]/60">
                    {row.roadmap_key} · version {row.version} · {row.program_name}
                  </div>
                  {row.previous_version_id && <div className="text-[11px] text-[#0A2B6D]/50">Follows an earlier version</div>}
                  <div className="mt-0.5 max-w-sm text-[11px] text-[#0A2B6D]/70">{row.summary}</div>
                </TableCell>
                <TableCell className="whitespace-nowrap text-[11px] text-[#0A2B6D]/80">
                  <div>{row.initiative_count ?? 0} initiatives</div>
                  <div>{row.dependency_count ?? 0} dependencies</div>
                  <div>{row.milestone_count ?? 0} milestones</div>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <StatusBadge status={row.status} />
                  {row.change_note && <div className="mt-1 max-w-[170px] text-[11px] text-[#0A2B6D]/70">{row.change_note}</div>}
                </TableCell>
                <TableCell className="min-w-[170px] text-[11px] text-[#0A2B6D]/80">
                  {row.decided_by ? (
                    <>
                      <div className="text-xs font-bold text-[#0A2B6D]">{row.decided_by}</div>
                      <div>{String(row.decided_at || '').slice(0, 10)} · {row.approval_authority}</div>
                      {row.decision_note && <div className="text-[#0A2B6D]/60">{row.decision_note}</div>}
                    </>
                  ) : row.submitted_by ? (
                    <div>Submitted by {row.submitted_by}</div>
                  ) : (
                    <div>Not submitted</div>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex flex-wrap justify-end gap-1">
                    {canEdit && ['Draft', 'Returned'].includes(row.status) && (
                      <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                    )}
                    {canEdit && ['Draft', 'Returned'].includes(row.status) && (
                      <Button size="sm" variant="secondary" onClick={() => onSubmit?.(row)}><Send className="h-3.5 w-3.5" /> Submit</Button>
                    )}
                    {canApprove && row.status === 'Submitted' && (
                      <Button size="sm" variant="default" onClick={() => onDecide?.(row, 'Approved')}><CheckCircle2 className="h-3.5 w-3.5" /> Approve</Button>
                    )}
                    {canApprove && row.status === 'Submitted' && (
                      <Button size="sm" variant="ghost" onClick={() => onDecide?.(row, 'Returned')}><RotateCcw className="h-3.5 w-3.5" /> Return</Button>
                    )}
                    {canEdit && row.status !== 'Archived' && (
                      <Button size="sm" variant="ghost" onClick={() => onArchive?.(row)}><Archive className="h-3.5 w-3.5" /> Archive</Button>
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