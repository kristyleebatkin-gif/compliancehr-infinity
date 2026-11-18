import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const SEVERITY_TONE = {
  Low: 'bg-slate-100 text-slate-600 border-slate-200',
  Medium: 'bg-amber-50 text-amber-800 border-amber-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Critical: 'bg-rose-100 text-rose-800 border-rose-300',
};

const STATUS_TONE = {
  Open: 'bg-rose-50 text-rose-700 border-rose-200',
  'Remediation planned': 'bg-amber-50 text-amber-800 border-amber-200',
  'In progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Closed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Risk accepted': 'bg-slate-100 text-slate-600 border-slate-200',
};

/** @param {any} props */
export default function GapTable({ gaps = [], onOpen } = {}) {
  if (!gaps.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No gaps match this view</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          Gaps are raised by an assessment run when a control has no current evidence, or a standard has no control.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Standard</TableHead>
            <TableHead>Gap</TableHead>
            <TableHead>Severity</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Plans</TableHead>
            <TableHead>Detected</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {gaps.map((row) => (
            <TableRow key={row.id} className="cursor-pointer" onClick={() => onOpen?.(row)}>
              <TableCell className="min-w-[130px] text-xs font-bold text-[#0A2B6D]">
                {row.standard_code || 'No standard'}
                <div className="text-[11px] font-normal text-[#0A2B6D]/60">{row.standard_title || ''}</div>
              </TableCell>
              <TableCell className="min-w-[260px]">
                <div className="text-sm text-[#0A2B6D]">{row.control_statement || row.observation || row.gap_type}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">{row.gap_type}</div>
              </TableCell>
              <TableCell>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${SEVERITY_TONE[row.severity] || SEVERITY_TONE.Medium}`}>
                  {row.severity}
                </span>
              </TableCell>
              <TableCell>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[row.status] || STATUS_TONE.Open}`}>
                  {row.status}
                </span>
              </TableCell>
              <TableCell className="text-right text-xs text-[#0A2B6D]">{row.remediation_count ?? 0}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]/70">
                {row.detected_on ? new Date(row.detected_on).toLocaleDateString() : '—'}
              </TableCell>
              <TableCell className="text-right">
                <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); onOpen?.(row); }}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}