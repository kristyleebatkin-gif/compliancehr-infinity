import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const parse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value || '');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

/** @param {any} props */
export default function RunDetailDialog({ open, onOpenChange, run } = {}) {
  if (!run) return null;
  const inputs = parse(run.inputs_json, []);
  const results = parse(run.results_json, []);
  const assumptions = parse(run.assumptions_json, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{run.run_ref} · {run.scenario_name}</DialogTitle>
          <DialogDescription>
            {run.model_name} v{run.model_version} ({run.model_status_at_run}) · scenario v{run.scenario_version} ({run.scenario_status_at_run})
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[65vh] space-y-3 overflow-y-auto pr-1">
          <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            <p className="text-xs font-bold text-amber-900">{run.estimate_notice}</p>
          </div>

          <div className="grid gap-2 sm:grid-cols-4">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Observed baseline</p>
              <p className="text-xl font-bold text-[#0A2B6D]">{run.index_baseline ?? '—'}</p>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-amber-800">Modelled estimate</p>
              <p className="text-xl font-bold text-[#0A2B6D]">{run.index_projected ?? '—'}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Modelled change</p>
              <p className="text-xl font-bold text-[#0A2B6D]">{run.index_delta > 0 ? '+' : ''}{run.index_delta ?? 0}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Confidence</p>
              <p className="text-xl font-bold text-[#0A2B6D]">{run.confidence ?? 0}%</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Input</TableHead>
                  <TableHead>Observed</TableHead>
                  <TableHead>Lever</TableHead>
                  <TableHead>Modelled</TableHead>
                  <TableHead>Records behind it</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inputs.map((row) => (
                  <TableRow key={row.metric}>
                    <TableCell className="min-w-[180px]">
                      <div className="text-xs font-bold text-[#0A2B6D]">{row.label}</div>
                      <div className="text-[11px] text-[#0A2B6D]/60">{row.source}</div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">
                      {row.observed === null ? 'no data' : `${row.observed}${row.unit === '%' ? '%' : ''}`}
                    </TableCell>
                    <TableCell className="min-w-[150px] text-xs text-[#0A2B6D]">
                      {row.delta > 0 ? '+' : ''}{row.delta}
                      {row.rationale && <div className="text-[11px] text-[#0A2B6D]/60">{row.rationale}</div>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">
                      {row.projected === null ? '—' : `${row.projected}${row.unit === '%' ? '%' : ''}`}
                    </TableCell>
                    <TableCell className="min-w-[200px] text-[11px] text-[#0A2B6D]/70">
                      {row.record_count} record{row.record_count === 1 ? '' : 's'}
                      <div>{row.note}</div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Assumptions at run time</p>
            <ul className="mt-1 list-disc space-y-1 pl-4">
              {assumptions.map((line, index) => (
                <li key={index} className="text-[11px] text-[#0A2B6D]">{line}</li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-[#0A2B6D]/70">
            {run.metrics_used ?? 0} inputs had records behind them
            {run.metrics_missing ? `, ${run.metrics_missing} did not and were left out of the estimate` : ''}.
            {' '}Run by {run.run_by || 'unknown'} on {run.completed_at ? new Date(run.completed_at).toLocaleString() : 'an unrecorded date'}
            {run.duration_ms ? ` in ${run.duration_ms}ms` : ''}. Engine {run.engine_version || 'not recorded'}.
            {results.length ? ' Every figure above is a modelled estimate, not a measured outcome.' : ''}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}