import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import { useLocation } from 'react-router-dom';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import { resolveAuditModule } from '@/lib/moduleAuditReport';

export default function PageHeader({ title, subtitle, action, icon: Icon = LayoutGrid, className, under, beforeAudit, afterAudit, compactActions = true, actionClassName, auditClassName }) {
  const { pathname } = useLocation();
  const seg = `/${pathname.split('/')[1] || ''}`;
  const description = subtitle || resolveAuditModule(seg)?.blurb || '';
  return (
    <div className="space-y-2.5">
      <div
        className={cn('app-page-header relative flex items-center overflow-hidden rounded-2xl px-5 py-4 shadow-lg', className)}
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative flex min-w-0 w-full items-center gap-3.5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-md ring-1 ring-white/30">
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{title}</h1>
            {description && <p className="mt-1 text-sm font-medium leading-relaxed text-white/95">{description}</p>}
          </div>
        </div>
      </div>
      <div className={cn('flex flex-wrap items-center border border-violet-200 bg-white shadow-sm', compactActions ? 'module-action-bar gap-2 rounded-xl px-3 py-2' : 'gap-2.5 rounded-xl p-2.5')}>
        <ModuleComplianceStrip path={seg} />
        {beforeAudit}
        {action && <div className={cn('flex flex-wrap items-center', compactActions ? 'gap-1.5' : 'gap-2', actionClassName)}>{action}</div>}
        <div className={cn('module-audit-buttons ml-auto flex shrink-0 items-center gap-1.5 [&>button]:h-8 [&>button]:gap-1.5 [&>button]:px-3 [&>button]:text-xs [&>button_svg]:mr-0 [&>button_svg]:size-3.5', auditClassName)}>
          <ModuleAuditChecklistButton />
          <ModuleAuditButton />
        </div>
        {afterAudit}
      </div>
      {under}
      {['Certificates', 'Equipment & MSDS', 'CRM & Leads', 'Projects Hub', 'Feedback & Surveys'].includes(title) && <AutoRegisterInsights placement="header" />}
    </div>
  );
}

// Row of controls rendered just below the header card (left-aligned by default).
export function HeaderUnderRow({ children, className }) {
  return <div className={cn('module-action-bar flex flex-wrap items-center gap-1', className)}>{children}</div>;
}