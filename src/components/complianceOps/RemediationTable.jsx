import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const STATUS_TONE = {
  'Not started': 'bg-slate-100 text-slate-600 border-slate-200',
  'In progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Closed: 'bg-slate-100 text-slate-600 border-slate-200',
};

/** @param {any} props */
export default function RemediationTable({ plans = [], onOpen } = {}) {
  if (!plans.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No remediation plans raised</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          Open a gap and raise a plan: an accountable owner, a target date and progress recorded against it.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Plan</TableHead>
            <TableHead>Gap</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Target</TableHead>
            <TableHead className="min-w-[140px]">Completion</TableHead>
            <TableHead>Status</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {plans.map((row) => {
            const overdue = ['Not started', 'In progress', 'Blocked'].includes(row.status)
              && row.target_date && row.target_date < new Date().toISOString().slice(0, 10);
            return (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onOpen?.(row)}>
                <TableCell className="whitespace-nowrap text-xs font-bold text-[#0A2B6D]">{row.plan_ref || 'Plan'}</TableCell>
                <TableCell className="min-w-[240px] text-sm text-[#0A2B6D]">
                  {row.gap_title || row.gap_ref}
                  <div className="text-[11px] text-[#0A2B6D]/60">{row.standard_code || row.framework}</div>
                </TableCell>
                <TableCell className="min-w-[120px] text-xs text-[#0A2B6D]">{row.assigned_to || 'Unassigned'}</TableCell>
                <TableCell className={`whitespace-nowrap text-xs ${overdue ? 'font-bold text-rose-700' : 'text-[#0A2B6D]/80'}`}>
                  {row.target_date || '—'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-[#0A2B6D]" style={{ width: `${Math.max(0, Math.min(100, Number(row.completion_percentage) || 0))}%` }} />
                    </div>
                    <span className="text-[11px] font-bold text-[#0A2B6D]">{row.completion_percentage ?? 0}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[row.status] || STATUS_TONE['Not started']}`}>
                    {row.status}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={(event) => { event.stopPropagation(); onOpen?.(row); }}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}