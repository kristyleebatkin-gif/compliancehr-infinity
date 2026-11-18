import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const STATUS_TONE = {
  'Awaiting human review': 'bg-amber-50 text-amber-800 border-amber-200',
  'Permitted internal': 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  Overridden: 'bg-purple-50 text-purple-700 border-purple-200',
  Blocked: 'bg-rose-50 text-rose-700 border-rose-200',
  'Safe failure': 'bg-rose-50 text-rose-700 border-rose-200',
  Expired: 'bg-slate-50 text-slate-600 border-slate-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paused: 'bg-amber-50 text-amber-700 border-amber-200',
  Disabled: 'bg-slate-50 text-slate-500 border-slate-200',
  Draft: 'bg-slate-50 text-slate-700 border-slate-200',
  Validated: 'bg-blue-50 text-blue-700 border-blue-200',
  Published: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Registered: 'bg-slate-50 text-slate-700 border-slate-200',
  Retired: 'bg-slate-50 text-slate-500 border-slate-200',
  Archived: 'bg-slate-50 text-slate-500 border-slate-200',
  Denied: 'bg-rose-50 text-rose-700 border-rose-200',
  'Propose only': 'bg-blue-50 text-blue-700 border-blue-200',
  'Allowed with approval': 'bg-amber-50 text-amber-800 border-amber-200',
  'Allowed internal': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Human approval required': 'bg-amber-50 text-amber-800 border-amber-200',
  'Internal action permitted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Recorded: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Refused: 'bg-rose-50 text-rose-700 border-rose-200',
  Changed: 'bg-blue-50 text-blue-700 border-blue-200',
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-rose-50 text-rose-700 border-rose-200',
  Critical: 'bg-rose-50 text-rose-700 border-rose-200',
};

/** @param {any} props */
export function StatusBadge({ status = '' } = {}) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[status] || STATUS_TONE.Draft}`}>
      {status || 'Unknown'}
    </span>
  );
}

export function WorkforceEmpty({ title, body } = {}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm font-bold text-[#0A2B6D]">{title}</p>
      <p className="mx-auto mt-1 max-w-xl text-xs text-[#0A2B6D]/70">{body}</p>
    </div>
  );
}

export function MiniTable({ head = [], rows = [] } = {}) {
  if (!rows.length) return <p className="text-xs text-[#0A2B6D]/70">Nothing recorded yet.</p>;
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <Table>
        <TableHeader><TableRow>{head.map((label) => <TableHead key={label}>{label}</TableHead>)}</TableRow></TableHeader>
        <TableBody>{rows}</TableBody>
      </Table>
    </div>
  );
}

export function TableFrame({ children } = {}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
      <Table>{children}</Table>
    </div>
  );
}

export function NewRow({ canConfigure, label, onNew } = {}) {
  if (!canConfigure) return null;
  return <div className="mb-3 flex justify-end"><Button size="sm" onClick={onNew}>{label}</Button></div>;
}

export { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow };