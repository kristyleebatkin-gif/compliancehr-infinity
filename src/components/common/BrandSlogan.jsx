import React from 'react';
import { cn } from '@/lib/utils';

export default function BrandSlogan({ size = 'md', compact = false, lightBackground = false, className = '' }) {
  const sizing = compact
    ? size === 'xs'
      ? 'text-[9px] tracking-[-0.04em] gap-x-0.5 mt-0.5'
      : 'text-[10px] sm:text-[11px] tracking-tight gap-x-1 mt-0.5'
    : size === 'xs'
      ? 'text-[9px] sm:text-[10px] tracking-tight gap-x-1.5 mt-0.5'
      : 'text-xs sm:text-[13px] tracking-wide gap-x-2 mt-0.5';

  return (
    <div className={cn('flex max-w-full items-center justify-center whitespace-nowrap text-center font-extrabold leading-tight', sizing, className)}>
      <span style={{ color: lightBackground ? '#0A2B6D' : '#00C6FF' }}>Complete Control.</span>{' '}
      <span style={{ color: lightBackground ? '#5A00D6' : '#A855F7' }}>Greater Confidence.</span>{' '}
      <span style={{ color: lightBackground ? '#A30059' : '#FF2E9A' }}>Brighter Success.</span>
    </div>
  );
}