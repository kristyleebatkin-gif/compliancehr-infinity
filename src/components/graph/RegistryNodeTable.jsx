import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const TYPE_TONE = {
  standard: 'bg-blue-50 text-blue-700 border-blue-200',
  control: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  evidence: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  finding: 'bg-rose-50 text-rose-700 border-rose-200',
  policy: 'bg-teal-50 text-teal-700 border-teal-200',
  form: 'bg-slate-50 text-slate-700 border-slate-200',
  audit: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  capa: 'bg-amber-50 text-amber-800 border-amber-200',
  risk: 'bg-orange-50 text-orange-800 border-orange-200',
  issue: 'bg-rose-50 text-rose-700 border-rose-200',
  recommendation: 'bg-slate-50 text-slate-700 border-slate-200',
};

/** @param {any} props */
export default function RegistryNodeTable({ nodes = [], total = 0, truncatedList = false, loading = false, onOpen } = {}) {
  if (loading) return <p className="py-8 text-center text-sm text-[#0A2B6D]/70">Loading the graph index…</p>;

  if (!nodes.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No indexed records match this view</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          The index is built from the standards, controls, evidence, findings, policies, forms, audits, corrective actions, risks, issues and recommendations you hold.
          If nothing is here yet, build the index first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Record</TableHead>
              <TableHead>Summary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Relationships</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {nodes.map((row) => (
              <TableRow key={row.id} className="cursor-pointer" onClick={() => onOpen?.(row)}>
                <TableCell>
                  <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${TYPE_TONE[row.entity_type] || TYPE_TONE.standard}`}>
                    {row.module_label || row.entity_type}
                  </span>
                </TableCell>
                <TableCell className="min-w-[240px] text-sm text-[#0A2B6D]">{row.display_label}</TableCell>
                <TableCell className="min-w-[180px] text-xs text-[#0A2B6D]/70">{row.summary || '—'}</TableCell>
                <TableCell className="whitespace-nowrap text-xs text-[#0A2B6D]/70">{row.record_status || '—'}</TableCell>
                <TableCell className="text-right text-xs font-bold text-[#0A2B6D]">{row.relationship_count ?? 0}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" aria-label={`Inspect ${row.display_label}`} onClick={(event) => { event.stopPropagation(); onOpen?.(row); }}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-[11px] text-[#0A2B6D]/70">
        Showing {nodes.length} of {total} matching records{truncatedList ? ' (first 200 shown; narrow the search to see the rest)' : ''}.
      </p>
    </div>
  );
}