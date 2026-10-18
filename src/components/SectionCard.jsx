import React from 'react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';

export default function SectionCard({ title, description, action, children, className, ...props }) {
  const accent = moduleColour(title || 'ComplianceHR');
  const secondary = moduleColour(title || 'ComplianceHR', 2);
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        className
      )}
      style={{ boxShadow: `0 1px 2px rgba(15, 23, 42, 0.04), 0 14px 34px -20px ${accent}55` }}
      {...props}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1" style={{ background: `linear-gradient(90deg, ${accent}, ${secondary}80, transparent)` }} />
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.07] blur-xl" style={{ backgroundColor: secondary }} />
      {(title || action) && (
        <div className="relative flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-5" style={{ background: `linear-gradient(100deg, ${accent}2b, ${secondary}14 55%, transparent 90%)` }}>
          <div className="absolute inset-y-0 left-0 w-[4px] rounded-r" style={{ background: `linear-gradient(180deg, ${accent}, ${secondary})` }} />
          <div className="pointer-events-none absolute inset-y-0 left-4 w-24 opacity-25" style={{ background: `linear-gradient(90deg, ${secondary}30, transparent)` }} />
          <div className="pl-1.5">
            {title && <div className="text-sm font-extrabold uppercase tracking-wide" style={{ color: accent }}>{title}</div>}
            {description && <div className="mt-0.5 text-xs font-medium text-foreground/55">{description}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4 sm:p-5" style={{ background: `linear-gradient(180deg, ${accent}0a, transparent 36%)` }}>{children}</div>
    </div>
  );
}