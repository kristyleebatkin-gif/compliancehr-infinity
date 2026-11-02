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

  const APP_BORDER_GRADIENT =
    'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';
  const DARK_NAVY_CHASSIS =
    'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #131B4D 100%)';

  return (
    <div className="space-y-2">
      <div
        className={cn(
          'preserve-island-theme overflow-hidden rounded-2xl border-2 border-[#0A2B6D] shadow-lg',
          className
        )}
        style={{ background: DARK_NAVY_CHASSIS }}
      >
        <div className="h-1.5 w-full" style={{ background: APP_BORDER_GRADIENT }} />
        <div className="p-2 sm:p-2.5 space-y-2">
          {/* Main Header Pod: Full White Surface + App-Design-Colour Border + App-Coloured Icon */}
          <div
            className="rounded-2xl p-[2px] shadow-sm"
            style={{ background: APP_BORDER_GRADIENT }}
          >
            <div className="flex min-w-0 w-full items-center gap-3 rounded-[14px] bg-white px-3.5 py-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#0072FF] bg-[#F5F0FF] shadow-2xs">
                <Icon className="h-5 w-5 shrink-0" style={{ color: '#0072FF' }} />
              </div>
              <div className="min-w-0 flex-1">
                <h1
                  className="text-base sm:text-xl font-extrabold leading-tight tracking-tight text-[#0A2B6D]"
                  style={{ color: '#0A2B6D' }}
                >
                  <span style={{ color: '#5A00D6' }}>◉</span> {title}
                </h1>
                {description && (
                  <p
                    className="mt-0.5 text-xs sm:text-sm font-bold leading-snug text-[#5A00D6]"
                    style={{ color: '#5A00D6' }}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Action & Compliance Strip Inside Matching White App-Design-Bordered Bar */}
          <div
            className="rounded-xl p-[1.5px]"
            style={{ background: APP_BORDER_GRADIENT }}
          >
            <div
              className={cn(
                'flex flex-wrap items-center rounded-[10.5px] bg-white',
                compactActions ? 'module-action-bar gap-1.5 px-2.5 py-1.5' : 'gap-2 p-2'
              )}
            >
              <ModuleComplianceStrip path={seg} />
              {beforeAudit}
              <div
                className={cn(
                  'flex shrink-0 items-center gap-1 [&>button]:h-7 [&>button]:gap-1 [&>button]:px-2 [&>button]:text-[11px] [&>button_svg]:mr-0 [&>button_svg]:size-3',
                  auditClassName
                )}
              >
                <ModuleAuditChecklistButton />
                <ModuleAuditButton />
              </div>
              {afterAudit}
              {resolvedActions && (
                <div
                  className={cn(
                    'flex flex-wrap items-center',
                    compactActions ? 'gap-1' : 'gap-2',
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