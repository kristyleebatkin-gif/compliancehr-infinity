import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const STATUS_TONE = {
  Draft: 'bg-slate-100 text-slate-700 border-slate-200',
  Proposed: 'bg-blue-50 text-blue-700 border-blue-200',
  'In Review': 'bg-amber-50 text-amber-800 border-amber-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Deferred: 'bg-amber-50 text-amber-800 border-amber-200',
  Implemented: 'bg-violet-50 text-violet-700 border-violet-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

const RISK_TONE = {
  Low: 'text-emerald-700',
  Medium: 'text-amber-700',
  High: 'text-rose-700 font-bold',
  Critical: 'text-rose-700 font-bold',
};

const OUTCOME_TONE = {
  'Not measured': 'bg-slate-100 text-slate-600 border-slate-200',
  'On track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'At risk': 'bg-amber-50 text-amber-800 border-amber-200',
  Achieved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Not achieved': 'bg-rose-50 text-rose-700 border-rose-200',
};

/** @param {any} props */
export default function DecisionRegisterTable({ decisions = [], onOpen } = {}) {
  if (!decisions.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No decisions match this view</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          Decisions you record here keep their evidence, approval authority and outcome measures together.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Decision</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Outcome</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Review</TableHead>
            <TableHead className="text-right">Evidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {decisions.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer"
              onClick={() => onOpen?.(row)}
            >
              <TableCell className="min-w-[220px]">
                <div className="text-sm font-bold text-[#0A2B6D]">{row.title}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">{row.decision_number || 'Not numbered'}</div>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.decision_type}</TableCell>
              <TableCell className={`whitespace-nowrap text-xs ${RISK_TONE[row.risk_level] || 'text-slate-600'}`}>{row.risk_level}</TableCell>
              <TableCell>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[row.status] || STATUS_TONE.Draft}`}>
                  {row.status}
                </span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${OUTCOME_TONE[row.outcome_status] || OUTCOME_TONE['Not measured']}`}>
                  {row.outcome_status || 'Not measured'}
                </span>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.owner || 'Unassigned'}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.review_date || 'Not set'}</TableCell>
              <TableCell className="text-right text-xs text-[#0A2B6D]">{row.evidence_count || 0}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}