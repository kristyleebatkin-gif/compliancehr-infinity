import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  High: 'bg-orange-50 text-orange-700 border-orange-200',
  Critical: 'bg-red-50 text-red-700 border-red-200',
  default: 'bg-slate-50 text-slate-600 border-slate-200',
};

export default function StatusBadge({ value, className }) {
  const cls = variants[value] || variants.default;
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
      cls,
      className
    )}>
      {value}
    </span>
  );
}