import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const STATUS_TONE = {
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Retrying: 'bg-amber-50 text-amber-700 border-amber-200',
  Queued: 'bg-slate-50 text-slate-700 border-slate-200',
  Failed: 'bg-rose-50 text-rose-700 border-rose-200',
  'Dead letter': 'bg-rose-50 text-rose-700 border-rose-200',
  Suppressed: 'bg-slate-50 text-slate-500 border-slate-200',
  Replayed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paused: 'bg-amber-50 text-amber-700 border-amber-200',
  Retired: 'bg-slate-50 text-slate-500 border-slate-200',
  Disabled: 'bg-slate-50 text-slate-500 border-slate-200',
  Unverified: 'bg-amber-50 text-amber-700 border-amber-200',
  Draft: 'bg-slate-50 text-slate-700 border-slate-200',
  Validated: 'bg-blue-50 text-blue-700 border-blue-200',
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Archived: 'bg-slate-50 text-slate-500 border-slate-200',
};

/** @param {any} props */
export function StatusBadge({ status = '' } = {}) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-bold ${STATUS_TONE[status] || STATUS_TONE.Draft}`}>
      {status || 'Unknown'}
    </span>
  );
}

/** Shared empty state so every fabric table explains what the register is for. */
export function FabricEmpty({ title, body } = {}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm font-bold text-[#0A2B6D]">{title}</p>
      <p className="mx-auto mt-1 max-w-xl text-xs text-[#0A2B6D]/70">{body}</p>
    </div>
  );
}

/** Small read-only table used by the drawers of this module. */
export function MiniTable({ head = [], rows = [] } = {}) {
  if (!rows.length) return <p className="text-xs text-[#0A2B6D]/70">Nothing recorded yet.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <Table>
        <TableHeader>
          <TableRow>{head.map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow>
        </TableHeader>
        <TableBody>{rows}</TableBody>
      </Table>
    </div>
  );
}

export { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow };