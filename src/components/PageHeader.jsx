import React from 'react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';

export default function PageHeader({ title, subtitle, action, className }) {
  const primary = moduleColour(title);
  const secondary = moduleColour(title, 3);
  return (
    <div
      className={cn('relative overflow-hidden rounded-2xl border p-5 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-4 md:p-6', className)}
      style={{ borderColor: `${primary}35`, background: `linear-gradient(135deg, ${primary}1f 0%, ${secondary}12 58%, hsl(var(--card)) 100%)` }}
    >
      <div className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full opacity-15" style={{ backgroundColor: secondary }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-1 w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
      <div className="relative">
        <div className="mb-2 h-1 w-12 rounded-full" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {subtitle && <p className="mt-1 max-w-3xl text-sm text-foreground/60">{subtitle}</p>}
      </div>
      {action && <div className="relative mt-4 shrink-0 sm:mt-0">{action}</div>}
    </div>
  );
}