import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const TONE = {
  'Not started': 'bg-slate-100 text-slate-600 border-slate-200',
  'On track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Off track': 'bg-amber-50 text-amber-800 border-amber-200',
  Achieved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Not achieved': 'bg-rose-50 text-rose-700 border-rose-200',
};

/** @param {any} props */
export default function DecisionOutcomeTable({ outcomes = [], onOpenDecision } = {}) {
  if (!outcomes.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-[#0A2B6D]/70">
        No outcome measures have been recorded against a decision yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Measure</TableHead>
            <TableHead>Decision</TableHead>
            <TableHead className="text-right">Target</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            <TableHead>Measured</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outcomes.map((row) => (
            <TableRow key={row.id} className="cursor-pointer" onClick={() => onOpenDecision?.(row.decision_id)}>
              <TableCell className="min-w-[180px] text-sm font-bold text-[#0A2B6D]">{row.metric_name}</TableCell>
              <TableCell className="min-w-[180px] text-xs text-[#0A2B6D]">{row.decision_title}</TableCell>
              <TableCell className="text-right text-xs text-[#0A2B6D]">{row.target_value}{row.unit ? ` ${row.unit}` : ''}</TableCell>
              <TableCell className="text-right text-xs text-[#0A2B6D]">{row.actual_value}{row.unit ? ` ${row.unit}` : ''}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.measured_date || '—'}</TableCell>
              <TableCell>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${TONE[row.status] || TONE['Not started']}`}>
                  {row.status}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}