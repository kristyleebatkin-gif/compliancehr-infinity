import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const STATUS_TONE = {
  Draft: 'bg-slate-50 text-slate-700 border-slate-200',
  Validated: 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Retired: 'bg-slate-50 text-slate-500 border-slate-200',
};

/** @param {any} props */
export default function ModelTable({ models = [], canApprove = false, onEdit, onValidate, onApprove, onRevise, onRetire } = {}) {
  if (!models.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
        <p className="text-sm font-bold text-[#0A2B6D]">No twin model yet</p>
        <p className="mt-1 text-xs text-[#0A2B6D]/70">
          A model chooses which register inputs the twin reads and what each one weighs. It states its assumptions, and a scenario cannot run until the model is validated.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Model</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Inputs</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Approved by</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="min-w-[220px]">
                <div className="text-sm font-bold text-[#0A2B6D]">{row.name}</div>
                <div className="text-[11px] text-[#0A2B6D]/60">
                  {row.model_key} · v{row.version}{row.domain ? ` · ${row.domain}` : ''}
                </div>
                {row.change_note && <div className="text-[11px] text-[#0A2B6D]/70">{row.change_note}</div>}
              </TableCell>
              <TableCell>
                <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[row.status] || STATUS_TONE.Draft}`}>
                  {row.status}
                </span>
                {row.self_approved && <div className="mt-1 text-[10px] font-bold text-amber-700">Administrator override</div>}
              </TableCell>
              <TableCell className="text-right text-xs text-[#0A2B6D]">{row.metric_count ?? 0}</TableCell>
              <TableCell className="min-w-[120px] text-xs text-[#0A2B6D]/70">{row.author || '—'}</TableCell>
              <TableCell className="min-w-[140px] text-xs text-[#0A2B6D]/70">
                {row.approved_by ? (
                  <>
                    {row.approved_by}
                    <div className="text-[11px] text-[#0A2B6D]/60">{row.approved_at ? new Date(row.approved_at).toLocaleDateString() : ''}</div>
                  </>
                ) : '—'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex flex-wrap justify-end gap-1">
                  {row.status === 'Draft' && <Button size="sm" variant="outline" onClick={() => onEdit?.(row)}>Edit</Button>}
                  {row.status === 'Draft' && <Button size="sm" variant="secondary" onClick={() => onValidate?.(row)}>Validate</Button>}
                  {row.status === 'Validated' && canApprove && <Button size="sm" onClick={() => onApprove?.(row)}>Approve</Button>}
                  {row.status === 'Validated' && !canApprove && <span className="text-[11px] text-[#0A2B6D]/60">Needs a manager</span>}
                  {['Validated', 'Approved'].includes(row.status) && <Button size="sm" variant="outline" onClick={() => onRevise?.(row)}>New version</Button>}
                  {['Validated', 'Approved'].includes(row.status) && canApprove && (
                    <Button size="sm" variant="ghost" onClick={() => onRetire?.(row)}>Retire</Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}