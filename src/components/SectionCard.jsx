import React from 'react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';

export default function SectionCard({ title, description, action, children, className, ...props }) {
  const accent = moduleColour(title || 'ComplianceHR');
  const secondary = moduleColour(title || 'ComplianceHR', 2);
  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="relative flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4" style={{ background: `linear-gradient(90deg, ${accent}1a, ${secondary}0d 60%, transparent)` }}>
          <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: `linear-gradient(180deg, ${accent}, ${secondary})` }} />
          <div className="pl-1.5">
            {title && <div className="text-sm font-extrabold uppercase tracking-wide text-foreground">{title}</div>}
            {description && <div className="mt-0.5 text-xs font-medium text-foreground/55">{description}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}