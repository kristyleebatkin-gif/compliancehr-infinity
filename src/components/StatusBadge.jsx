import React from 'react';
import { cn } from '@/lib/utils';
import { statusTone, ratingTone } from '@/lib/statusStyles';

export default function StatusBadge({ value, className }) {
  const cls = ratingTone[value] || statusTone(value);
  return (
    <span className={cn(
      'inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium',
      cls,
      className
    )}>
      {value}
    </span>
  );
}