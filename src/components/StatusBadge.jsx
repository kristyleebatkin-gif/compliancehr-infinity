import React from 'react';
import { cn } from '@/lib/utils';
import { statusTone, ratingTone } from '@/lib/statusStyles';

export default function StatusBadge({ value, className = undefined }) {
  const cls = ratingTone[value] || statusTone(value);
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-1.5 py-0 text-[11px] leading-4 font-medium',
      cls,
      className
    )}>
      {value}
    </span>
  );
}