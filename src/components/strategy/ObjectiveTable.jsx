import React from 'react';
import { Archive, Pencil } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button, DueBadge, NewRow, ProgressBar, StatusBadge, StrategyEmpty, TableBody, TableCell, TableFrame, TableHead, TableHeader, TableRow, money } from '@/components/strategy/strategyKit';

/** Raw objectives, with the calculated view (progress, benefits, due state) merged in by id. */
export default function ObjectiveTable({ objectives = [], views = {}, programs = [], statuses = [], canEdit, onNew, onEdit, onStatus } = {}) {
  return (
    <div>
      <NewRow
        canEdit={canEdit}
        label="New objective"
        onSave={undefined}
        onNew={onNew}
        note={programs.length ? 'An objective needs an owner, a measure, a target and a due date.' : 'Record a program first: every objective belongs to one.'}
      />
      {!objectives.length ? (
        <StrategyEmpty
          title="No objective recorded yet"
          body="An objective states what changes, who owns it, how it is measured and when it is due. Progress appears once a baseline, a target and an actual figure all exist."
        />
      ) : (
        <TableFrame>
          <TableHeader>
            <TableRow>
              <TableHead>Objective</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Measure</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Benefits</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {objectives.map((row) => {
              const view = views[row.id] || {};
              return (
                <TableRow key={row.id}>
                  <TableCell className="min-w-[220px]">
                    <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.objective_key} · {row.program_name}</div>
                  </TableCell>
                  <TableCell className="text-xs text-[#0A2B6D]">{row.owner}</TableCell>
                  <TableCell className="min-w-[190px] text-[11px] text-[#0A2B6D]/80">
                    <div>{row.measure}</div>
                    <div className="text-[#0A2B6D]/60">
                      {row.baseline_value === null || row.baseline_value === undefined ? 'no baseline' : row.baseline_value} → {row.target_value} {row.unit}
                      {row.current_value === null || row.current_value === undefined ? ' · no actual' : ` · now ${row.current_value}`}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <DueBadge state={view.due || 'No date'} />
                    <div className="mt-1 text-[11px] text-[#0A2B6D]/60">{row.due_date}</div>
                  </TableCell>
                  <TableCell className="min-w-[130px]"><ProgressBar value={view.progress ?? null} /></TableCell>
                  <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                    {view.benefitCount ?? 0}
                    <div className="text-[11px] text-[#0A2B6D]/60">{money(view.benefitValue ?? 0)}</div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    <StatusBadge status={row.status} />
                    {row.status_reason && <div className="mt-1 max-w-[180px] text-[11px] text-[#0A2B6D]/70">{row.status_reason}</div>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      {canEdit && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}><Pencil className="h-3.5 w-3.5" /> Edit</Button>}
                      {canEdit && (
                        <Select value={row.status} onValueChange={(value) => onStatus?.(row, value)}>
                          <SelectTrigger className="h-8 w-[140px] text-xs" aria-label="Objective status"><SelectValue /></SelectTrigger>
                          <SelectContent>{statuses.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
                        </Select>
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