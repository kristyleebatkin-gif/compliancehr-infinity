import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import { useLocation } from 'react-router-dom';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import { resolveAuditModule } from '@/lib/moduleAuditReport';

/*
 * LOCKED HEADER STANDARD (src/HEADER_RULES.md) — restored 2 Nov 2026 at the owner's request.
 * Exactly 3cm tall, app blue-purple-pink gradient, black outer border, white text with a black outline,
 * standard body font, short professional description, modular icon tile on the LEFT.
 * Directly beneath: live compliance tracker, Audit Checklist export and Audit Report — always shown.
 * Sizing/colour/border/font are enforced in src/index.css (".app-page-header").
 */
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
    <div className="space-y-2.5">
      <div
        className={cn('app-page-header relative flex items-center overflow-hidden rounded-2xl px-4 shadow-lg', className)}
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="relative flex min-w-0 w-full items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-md ring-1 ring-white/30">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h1>{title}</h1>
            {description && <p className="line-clamp-2">{description}</p>}
          </div>
        </div>
      </div>
      <div
        className={cn(
          'flex flex-wrap items-center border border-border/60 bg-card shadow-sm',
          compactActions ? 'module-action-bar gap-1 rounded-lg px-1.5 py-1' : 'gap-1.5 rounded-xl p-2'
        )}
      >
        <ModuleComplianceStrip path={seg} />
        {beforeAudit}
        <div className={cn('flex shrink-0 items-center gap-1 [&>button]:h-7 [&>button]:gap-1 [&>button]:px-2 [&>button]:text-[11px] [&>button_svg]:mr-0 [&>button_svg]:size-3', auditClassName)}>
          <ModuleAuditChecklistButton />
          <ModuleAuditButton />
        </div>
        {afterAudit}
        {resolvedActions && (
          <div className={cn('flex flex-wrap items-center', compactActions ? 'gap-1' : 'gap-2', actionClassName)}>
            {resolvedActions}
          </div>
        )}
      </div>
      {under}
      {['Certificates', 'Equipment & MSDS', 'CRM & Leads', 'Projects Hub', 'Feedback & Surveys'].includes(title) && (
        <AutoRegisterInsights placement="header" />
      )}
    </div>
  );
}

// Row of controls rendered just below the header card (left-aligned by default).
export function HeaderUnderRow({ children, className = undefined }) {
  return <div className={cn('module-action-bar flex flex-wrap items-center gap-1', className)}>{children}</div>;
}