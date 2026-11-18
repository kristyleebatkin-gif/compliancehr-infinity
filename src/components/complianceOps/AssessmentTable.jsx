import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const STATUS_TONE = {
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Completed with gaps': 'bg-amber-50 text-amber-800 border-amber-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
};

const scoreTone = (value) => {
  const n = Number(value) || 0;
  if (n >= 85) return 'text-emerald-700 font-bold';
  if (n >= 60) return 'text-amber-700 font-bold';
  return 'text-rose-700 font-bold';
};

/** @param {any} props */
export default function AssessmentTable({ assessments = [] } = {}) {
  if (!assessments.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No assessment has been run yet</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          A run scores every active control in the chosen framework from the evidence you hold, and raises a gap wherever coverage is missing.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Assessment</TableHead>
            <TableHead>Framework</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Score</TableHead>
            <TableHead className="text-right">Confidence</TableHead>
            <TableHead className="text-right">Controls</TableHead>
            <TableHead className="text-right">Gaps</TableHead>
            <TableHead>Assessed</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assessments.map((row) => (
            <TableRow key={row.id} title={row.methodology || ''}>
              <TableCell className="min-w-[160px]">
                <div className="text-sm font-bold text-[#0A2B6D]">{row.assessment_ref}</div>
                <span className={`mt-1 inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[row.status] || STATUS_TONE.Completed}`}>
                  {row.status}
                </span>
              </TableCell>
              <TableCell className="min-w-[170px] text-xs text-[#0A2B6D]">{row.framework}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]/80">{row.assessment_type}</TableCell>
              <TableCell className={`text-right text-sm ${scoreTone(row.score)}`}>{row.score ?? 0}%</TableCell>
              <TableCell className="text-right text-xs text-[#0A2B6D]">{row.confidence_score ?? 0}%</TableCell>
              <TableCell className="text-right text-xs text-[#0A2B6D]">
                {row.controls_passed ?? 0} of {row.controls_total ?? 0}
              </TableCell>
              <TableCell className="text-right text-xs font-bold text-[#0A2B6D]">{row.gaps_found ?? 0}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]/70">
                {row.assessed_on ? new Date(row.assessed_on).toLocaleString() : '—'}
                <div className="text-[11px]">{row.run_by || ''}</div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}