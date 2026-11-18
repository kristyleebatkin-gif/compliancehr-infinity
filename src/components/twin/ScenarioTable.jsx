import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const STATUS_TONE = {
  Draft: 'bg-slate-50 text-slate-700 border-slate-200',
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Returned: 'bg-amber-50 text-amber-800 border-amber-200',
  Archived: 'bg-slate-50 text-slate-500 border-slate-200',
};

/** @param {any} props */
export default function ScenarioTable({ scenarios = [], canApprove = false, onEdit, onSubmit, onDecide, onRevise, onRun } = {}) {
  if (!scenarios.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No scenario yet</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          A scenario states one lever per model input with the reason for it. Nothing else moves the estimate.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Scenario</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Levers</TableHead>
            <TableHead>Simulations</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {scenarios.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="min-w-[220px]">
                <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">{row.scenario_key} · v{row.version}</div>
                <div className="text-[11px] text-[#0A2B6D]/70">{row.description}</div>
              </TableCell>
              <TableCell className="min-w-[150px] text-xs text-[#0A2B6D]">
                {row.model_name}
                <div className="text-[11px] text-[#0A2B6D]/60">pinned at v{row.model_version}</div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[row.status] || STATUS_TONE.Draft}`}>
                  {row.status}
                </span>
                {row.self_approved && <div className="mt-1 text-[10px] font-bold text-amber-700">Administrator override</div>}
              </TableCell>
              <TableCell className="text-right text-xs text-[#0A2B6D]">{row.lever_count ?? 0}</TableCell>
              <TableCell className="text-xs text-[#0A2B6D]">
                {row.run_count ?? 0}
                {row.last_run_at && <div className="text-[11px] text-[#0A2B6D]/60">{new Date(row.last_run_at).toLocaleDateString()}</div>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-1">
                  {['Draft', 'Returned'].includes(row.status) && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}>Edit</Button>}
                  {['Draft', 'Returned'].includes(row.status) && <Button size="sm" variant="secondary" onClick={() => onSubmit?.(row)}>Submit</Button>}
                  {row.status === 'Submitted' && canApprove && <Button size="sm" onClick={() => onDecide?.(row)}>Decide</Button>}
                  {row.status === 'Submitted' && !canApprove && <span className="text-[11px] text-[#0A2B6D]/60">Awaiting review</span>}
                  {row.status === 'Approved' && <Button size="sm" variant="outline" onClick={() => onRevise?.(row)}>New version</Button>}
                  {row.status !== 'Archived' && <Button size="sm" onClick={() => onRun?.(row)}>Run</Button>}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}