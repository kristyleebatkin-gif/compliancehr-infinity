import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

/** @param {any} props */
export default function RunTable({ runs = [], onOpen } = {}) {
  if (!runs.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No simulation has run yet</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          Each run keeps the model version, the scenario version and the inputs it read, so an estimate can be re-checked later.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Run</TableHead>
            <TableHead>Model / scenario versions</TableHead>
            <TableHead>Observed baseline</TableHead>
            <TableHead>Modelled estimate</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Run by</TableHead>
            <TableHead className="text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="min-w-[160px]">
                <div className="text-xs font-bold text-[#0A2B6D]">{row.run_ref}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">{row.scenario_name}</div>
              </TableCell>
              <TableCell className="min-w-[170px] text-[11px] text-[#0A2B6D]/70">
                {row.model_name} v{row.model_version}
                <div>scenario v{row.scenario_version} · {row.scenario_status_at_run}</div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.index_baseline ?? '—'}</TableCell>
              <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">
                {row.index_projected ?? '—'}
                <span className={`ml-1 text-[11px] font-bold ${row.index_delta > 0 ? 'text-emerald-700' : row.index_delta < 0 ? 'text-rose-700' : 'text-[#0A2B6D]/60'}`}>
                  ({row.index_delta > 0 ? '+' : ''}{row.index_delta ?? 0})
                </span>
                <div className="text-[10px] font-normal text-amber-700">estimate</div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.confidence ?? 0}%</TableCell>
              <TableCell className="min-w-[130px] text-[11px] text-[#0A2B6D]/70">
                {row.run_by || '—'}
                <div>{row.completed_at ? new Date(row.completed_at).toLocaleString() : ''}</div>
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="outline" onClick={() => onOpen?.(row)}>View</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}