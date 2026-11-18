import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

/** @param {any} props */
export default function DecisionEvidenceTable({ evidence = [], onOpenDecision } = {}) {
  if (!evidence.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-[#0A2B6D]/70">
        No decision evidence has been attached yet.
      </div>
    );
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Evidence</TableHead>
            <TableHead>Decision</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Standard</TableHead>
            <TableHead>Verification</TableHead>
            <TableHead className="text-right">Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {evidence.map((row) => (
            <TableRow key={row.id} className="cursor-pointer" onClick={() => onOpenDecision?.(row.decision_id)}>
              <TableCell className="min-w-[180px] text-sm font-bold text-[#0A2B6D]">{row.title}</TableCell>
              <TableCell className="min-w-[180px] text-xs text-[#0A2B6D]">{row.decision_title}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.evidence_type}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.standard_code || '—'}</TableCell>
              <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]">{row.verification_status}</TableCell>
              <TableCell className="text-right text-xs font-bold text-[#0A2B6D]">{row.confidence ?? 0}%</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}