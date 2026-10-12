import React from 'react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';

export default function PageHeader({ title, subtitle, action, icon: Icon, className, accent }) {
  const primary = accent?.[0] || moduleColour(title);
  const secondary = accent?.[1] || moduleColour(title, 3);
  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:flex sm:flex-col sm:items-start sm:gap-2 md:flex-row md:items-center md:justify-between md:gap-4 md:p-6', className)}
      style={{ borderColor: `${primary}35`, background: `linear-gradient(135deg, ${primary}1f 0%, ${secondary}16 100%)` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full opacity-15" style={{ backgroundColor: secondary }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
      <div className="relative flex items-start gap-3">
        {Icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm" style={{ backgroundColor: `${primary}26`, color: primary }}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div>
          <div className="mb-2 h-1 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="mt-1 max-w-3xl text-sm text-foreground/60">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="relative mt-3 w-full sm:mt-0 md:w-auto md:max-w-full">{action}</div>}
    </div>
  );
}