import React from 'react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import { useLocation } from 'react-router-dom';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';

export default function PageHeader({ title, subtitle, action, icon: Icon, className, accent, showAlerts = true, showCompliance = true, showAudit = true, under, beforeAudit, afterAudit, compactActions = true, showDivider = true, actionClassName, auditClassName }) {
  const { pathname } = useLocation();
  const seg = `/${pathname.split('/')[1] || ''}`;
  // Header band uses the logo's brand gradient; the module accent stays as a thin identity strip.
  const primary = '#2563eb';
  const secondary = '#7c3aed';
  const moduleAccent = accent?.[0] || moduleColour(title);
  return (
    <div className="space-y-2.5">
    <div
      className={cn('app-page-header relative overflow-hidden rounded-2xl p-3.5 shadow-lg sm:flex sm:flex-col sm:items-start sm:gap-2 sm:p-4 md:flex-row md:items-center md:justify-between md:gap-4', className)}
      style={{
        background: 'var(--header-gradient)',
        boxShadow: '0 10px 30px -16px rgba(124, 58, 237, 0.45), 0 2px 5px rgba(15, 23, 42, 0.05)'
      }}
    >
      {/* Decorative glows, sheen and shading */}
      <div className="pointer-events-none absolute -right-12 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 left-24 h-36 w-36 rounded-full bg-fuchsia-300/25 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-24 w-24 rounded-full bg-cyan-300/20 blur-xl" />
      <div className="pointer-events-none absolute -right-20 top-0 h-full w-44 rotate-12" style={{ background: 'linear-gradient(90deg, transparent 15%, rgba(255,255,255,0.14) 50%, transparent 85%)' }} />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-32" style={{ background: `linear-gradient(90deg, ${primary}14, transparent)` }} />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[4px] w-full" style={{ background: 'var(--header-gradient)' }} />
      <div className="pointer-events-none absolute left-0 top-0 h-[2px] w-2/3" style={{ background: 'linear-gradient(90deg, rgba(255,255,255,0.7), transparent)' }} />
      <div className="relative flex min-w-0 w-full items-start gap-3">
        {Icon && (
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15 text-white shadow-md ring-1 ring-white/30 transition-transform duration-200 hover:scale-105 sm:h-10 sm:w-10"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          {showDivider && <div className="mb-1.5 h-0.5 w-10 rounded-full bg-white/60 shadow-sm" />}
          <h1 className="font-display text-xl font-bold tracking-tight text-header-foreground sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 max-w-3xl break-words text-[13px] font-medium leading-5 text-header-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
      {(showCompliance || showAudit || beforeAudit || afterAudit || action) && (
        <div className={cn('flex flex-wrap items-center border border-border/60 bg-card shadow-sm', compactActions ? 'module-action-bar gap-1 rounded-lg px-1.5 py-1' : 'gap-1.5 rounded-xl p-2')}>
          {showCompliance && <ModuleComplianceStrip path={seg} />}
          {beforeAudit}
          {showAudit && (compactActions ? (
            <div className={cn('flex shrink-0 items-center gap-1 [&>button]:h-7 [&>button]:gap-1 [&>button]:px-2 [&>button]:text-[11px] [&>button_svg]:mr-0 [&>button_svg]:size-3', auditClassName)}>
              <ModuleAuditChecklistButton />
              <ModuleAuditButton />
            </div>
          ) : <><ModuleAuditChecklistButton /><ModuleAuditButton /></>)}
          {afterAudit}
          {action && <div className={cn('flex flex-wrap items-center', compactActions ? 'gap-1' : 'gap-2', actionClassName)}>{action}</div>}
        </div>
      )}
      {under}
      {['Certificates', 'Equipment & MSDS', 'CRM & Leads', 'Projects Hub', 'Feedback & Surveys'].includes(title) && <AutoRegisterInsights placement="header" />}
    </div>
  );
}


// Row of controls rendered just below the header card (left-aligned by default).
export function HeaderUnderRow({ children, className }) {
  return <div className={cn('module-action-bar flex flex-wrap items-center gap-1', className)}>{children}</div>;
}