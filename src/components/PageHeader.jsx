import React from 'react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import { useLocation } from 'react-router-dom';

export default function PageHeader({ title, subtitle, action, icon: Icon, className, accent, showAlerts = true, showCompliance = true, showAudit = true, under }) {
  const { pathname } = useLocation();
  const seg = `/${pathname.split('/')[1] || ''}`;
  const primary = accent?.[0] || moduleColour(title);
  const secondary = accent?.[1] || moduleColour(title, 3);
  return (
    <div className="space-y-3">
    <div
      className={cn('relative overflow-hidden rounded-2xl border p-6 shadow-lg sm:flex sm:flex-col sm:items-start sm:gap-2 md:flex-row md:items-center md:justify-between md:gap-4', className)}
      style={{
        borderColor: `${primary}45`,
        background: `linear-gradient(120deg, ${primary}26 0%, ${secondary}1a 55%, hsl(var(--card)) 100%)`,
        boxShadow: `0 10px 40px -18px ${primary}66, 0 2px 6px rgba(15, 23, 42, 0.04)`
      }}
    >
      {/* Decorative glows, sheen and shading */}
      <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full opacity-25 blur-2xl" style={{ backgroundColor: secondary }} />
      <div className="pointer-events-none absolute -bottom-16 left-24 h-36 w-36 rounded-full opacity-20 blur-2xl" style={{ backgroundColor: primary }} />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 rounded-full opacity-10 blur-xl" style={{ backgroundColor: primary }} />
      <div className="pointer-events-none absolute -right-20 top-0 h-full w-44 rotate-12" style={{ background: 'linear-gradient(90deg, transparent 15%, rgba(255,255,255,0.14) 50%, transparent 85%)' }} />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-32" style={{ background: `linear-gradient(90deg, ${primary}14, transparent)` }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[4px] w-full" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary}, ${primary}00)` }} />
      <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-2/3" style={{ background: `linear-gradient(90deg, ${secondary}, transparent)` }} />
      <div className="relative flex items-start gap-4">
        {Icon && (
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-200 hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, boxShadow: `0 6px 18px -6px ${primary}80` }}
          >
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div>
          <div className="mb-2 h-1 w-14 rounded-full shadow-sm" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-3xl text-sm font-medium text-foreground/65">{subtitle}</p>}
        </div>
      </div>
    </div>
      {(showCompliance || showAudit || action) && (
        <div className="flex flex-wrap items-center gap-2">
          {showCompliance && <ModuleComplianceStrip path={seg} />}
          {showAudit && <ModuleAuditChecklistButton />}
          {showAudit && <ModuleAuditButton />}
          {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
        </div>
      )}
    </div>
  );
}


// Row of controls rendered just below the header card (left-aligned by default).
export function HeaderUnderRow({ children, className }) {
  return <div className={cn('flex flex-wrap items-center gap-2', className)}>{children}</div>;
}