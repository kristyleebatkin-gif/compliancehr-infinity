import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const RESULT_TONE = {
  Pass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Partial: 'bg-amber-50 text-amber-800 border-amber-200',
  Fail: 'bg-rose-50 text-rose-700 border-rose-200',
  'Not tested': 'bg-slate-100 text-slate-600 border-slate-200',
  'Not applicable': 'bg-slate-100 text-slate-600 border-slate-200',
};

/** @param {any} props */
export default function ControlTestTable({ tests = [] } = {}) {
  if (!tests.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No control tests recorded</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          An assessment run tests every active control automatically, or record a manual test against one control.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Control</TableHead>
            <TableHead>Standard</TableHead>
            <TableHead>Evidence state</TableHead>
            <TableHead>Result</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead>Tested</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tests.map((row) => (
            <TableRow key={row.id} title={row.notes || ''}>
              <TableCell className="min-w-[280px] text-sm text-[#0A2B6D]">
                {row.control_statement || 'Control'}
                <div className="text-[11px] text-[#0A2B6D]/60">
                  {row.test_source} · {row.tested_by || 'System'}
                  {row.evidence_title ? ` · evidence: ${row.evidence_title}` : ''}
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">{row.standard_code || '—'}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]/80">{row.evidence_state || 'None held'}</TableCell>
              <TableCell>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${RESULT_TONE[row.result] || RESULT_TONE['Not tested']}`}>
                  {row.result}
                </span>
              </TableCell>
              <TableCell className="text-right text-xs font-bold text-[#0A2B6D]">{row.score ?? 0}%</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]/70">
                {row.tested_on ? new Date(row.tested_on).toLocaleDateString() : '—'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}