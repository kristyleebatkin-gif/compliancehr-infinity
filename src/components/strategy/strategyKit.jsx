import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export const STATUS_TONE = {
  Draft: 'bg-slate-50 text-slate-700 border-slate-200',
  Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Paused: 'bg-amber-50 text-amber-800 border-amber-200',
  Closed: 'bg-blue-50 text-blue-700 border-blue-200',
  Archived: 'bg-slate-50 text-slate-500 border-slate-200',
  Submitted: 'bg-blue-50 text-blue-700 border-blue-200',
  Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Returned: 'bg-amber-50 text-amber-800 border-amber-200',
  Validated: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
  'Not reviewed': 'bg-slate-50 text-slate-700 border-slate-200',
  'Under review': 'bg-amber-50 text-amber-800 border-amber-200',
  'Not started': 'bg-slate-50 text-slate-700 border-slate-200',
  'On track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'At risk': 'bg-amber-50 text-amber-800 border-amber-200',
  'Off track': 'bg-rose-50 text-rose-700 border-rose-200',
  Achieved: 'bg-blue-50 text-blue-700 border-blue-200',
  Planned: 'bg-slate-50 text-slate-700 border-slate-200',
  'In progress': 'bg-blue-50 text-blue-700 border-blue-200',
  Complete: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'On hold': 'bg-amber-50 text-amber-800 border-amber-200',
  Cancelled: 'bg-rose-50 text-rose-700 border-rose-200',
  Met: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Missed: 'bg-rose-50 text-rose-700 border-rose-200',
};

export const DUE_TONE = {
  Overdue: 'bg-rose-50 text-rose-700 border-rose-200',
  'Due soon': 'bg-amber-50 text-amber-800 border-amber-200',
  'On track': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'No date': 'bg-slate-50 text-slate-600 border-slate-200',
};

/** @param {any} props */
export function StatusBadge({ status = '' } = {}) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${STATUS_TONE[status] || STATUS_TONE.Draft}`}>
      {status || 'Unknown'}
    </span>
  );
}

/** @param {any} props */
export function DueBadge({ state = 'No date' } = {}) {
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${DUE_TONE[state] || DUE_TONE['No date']}`}>
      {state}
    </span>
  );
}

/** Progress is only drawn when a real measure exists. */
export function ProgressBar({ value } = {}) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return <span className="text-[11px] font-bold text-[#0A2B6D]/60">No measure yet</span>;
  }
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-[#0072FF] to-[#5A00D6]" style={{ width: `${Math.max(2, value)}%` }} />
      </div>
      <span className="text-[11px] font-bold text-[#0A2B6D]">{value}%</span>
    </div>
  );
}

export function StrategyEmpty({ title, body } = {}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
      <p className="text-sm font-bold text-[#0A2B6D]">{title}</p>
      <p className="mx-auto mt-1 max-w-xl text-xs text-[#0A2B6D]/70">{body}</p>
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

export function NewRow({ canEdit, label, onNew, note } = {}) {
  if (!canEdit) return null;
  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p className="text-[11px] text-[#0A2B6D]/60">{note}</p>
      <Button size="sm" onClick={onNew}>{label}</Button>
    </div>
  );
}

export const money = (value) => (typeof value === 'number' && Number.isFinite(value)
  ? new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(value)
  : '—');

export const measure = (value, unit = '') => (typeof value === 'number' && Number.isFinite(value)
  ? `${value}${unit ? ` ${unit}` : ''}`
  : '—');

export function parseList(json) {
  if (Array.isArray(json)) return json;
  try {
    const parsed = JSON.parse(String(json || '[]'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow };