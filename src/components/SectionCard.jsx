import React from 'react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';

export default function SectionCard({ title, description, action, children, className, ...props }) {
  const accent = moduleColour(title || 'ComplianceHR');
  const secondary = moduleColour(title || 'ComplianceHR', 2);
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md', className)} {...props}>
      {(title || action) && (
        <div className="relative flex items-center justify-between border-b border-border/60 px-5 py-4" style={{ background: `linear-gradient(90deg, ${accent}14, ${secondary}08 65%, transparent)` }}>
          <div className="absolute inset-y-0 left-0 w-1" style={{ background: `linear-gradient(180deg, ${accent}, ${secondary})` }} />
          <div className="pl-1">
            {title && <div className="text-sm font-bold text-foreground">{title}</div>}
            {description && <div className="mt-0.5 text-xs text-foreground/55">{description}</div>}
          </div>
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}