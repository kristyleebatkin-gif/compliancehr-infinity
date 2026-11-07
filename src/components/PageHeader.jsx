import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import { useLocation } from 'react-router-dom';
import { resolveAuditModule } from '@/lib/moduleAuditReport';

/** @param {any} props */
export default function PageHeader({
  title = '',
  subtitle = undefined,
  description: descriptionProp = undefined,
  action = undefined,
  actions = undefined,
  icon: Icon = LayoutGrid,
  className = undefined,
  under = undefined,
  beforeAudit = undefined,
  afterAudit = undefined,
  compactActions = true,
  actionClassName = undefined,
  auditClassName = undefined,
} = {}) {
  const { pathname } = useLocation();
  const seg = `/${pathname.split('/')[1] || ''}`;
  const description = subtitle || descriptionProp || resolveAuditModule(seg)?.blurb || '';
  const resolvedActions = action || actions;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs',
          className
        )}
      >
        <div
          className="h-1 w-full"
          style={{
            background: 'linear-gradient(90deg, #00C6FF 0%, #0072FF 35%, #5A00D6 70%, #FF2E9A 100%)',
          }}
        />
        <div className="p-4 sm:p-5 space-y-3.5">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#0A2B6D] text-white shadow-2xs">
              <Icon className="h-5 w-5 shrink-0 text-[#00C6FF]" />
            </div>
            <div className="min-w-0">
              <h1 className="font-editorial text-xl sm:text-2xl font-extrabold leading-tight tracking-tight text-[#0A2B6D]">
                {title}
              </h1>
              {description && (
                <p className="mt-1 text-sm font-normal leading-relaxed text-[#0A2B6D]/75">
                  {description}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 space-y-2.5">
            <ModuleComplianceStrip path={seg} />

            {/* Action Buttons Anchored at the Bottom of the Header Section */}
            <div
              className={cn(
                'flex flex-wrap items-center justify-end border-t border-slate-100 pt-2.5',
                compactActions ? 'module-action-bar gap-2' : 'gap-2.5'
              )}
            >
              {beforeAudit}
              <div className={cn('flex shrink-0 flex-wrap items-center gap-1.5', auditClassName)}>
                <ModuleAuditChecklistButton />
                <ModuleAuditButton />
              </div>
              {afterAudit}
              {resolvedActions && (
                <div
                  className={cn(
                    'flex flex-wrap items-center',
                    compactActions ? 'gap-2' : 'gap-2.5',
                    actionClassName
                  )}
                >
                  {resolvedActions}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {under}
    </div>
  );
}

export function HeaderUnderRow({ children, className = undefined }) {
  return (
    <div className={cn('module-action-bar flex flex-wrap items-center gap-2', className)}>
      {children}
    </div>
  );
}