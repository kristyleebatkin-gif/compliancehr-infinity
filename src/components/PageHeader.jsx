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
 * CANONICAL COMPLIANCEHR INFINITY HEADER TEMPLATE (src/DESIGN_TEMPLATE_SPEC.md):
 * - Separated by an App Design Coloured Gradient Border.
 * - White background inside the header/topic section outside the small tiles up to the header border.
 * - Dark Navy (#0A2B6D) outside the header border to the side of the page.
 * - Main Header Title: Dark Blue (#0A2B6D) writing changing into App Design Colours towards the end,
 *   with an App Design Coloured Symbol and App Design Coloured Border on a White background.
 * - Small Header Tiles: Fit neatly in 1–2 rows with App Design Coloured Borders, Dark Blue (#0A2B6D) writing,
 *   and App Design Coloured Symbols on a White background (or App Design Coloured Gradient for primary highlights).
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

  const HEADING_TEXT_GRADIENT =
    'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

  return (
    <div className="space-y-2">
      {/* App-Design-Coloured Outer Border Separating Topic/Subject/Header from Dark Navy Page Surround */}
      <div
        className={cn(
          'preserve-island-theme overflow-hidden rounded-2xl p-[3px] shadow-lg',
          className
        )}
        style={{ background: APP_BORDER_GRADIENT }}
      >
        {/* White Background Outside the Tiles Inside the Header/Topic Section */}
        <div className="rounded-[13px] bg-white p-2.5 sm:p-3 space-y-2">
          {/* Main Topic Header Tile: App Design Border + White Background + App Symbol + Dark Blue -> App Colour Title */}
          <div
            className="rounded-2xl p-[2px] shadow-2xs"
            style={{ background: APP_BORDER_GRADIENT }}
          >
            <div className="flex min-w-0 w-full items-center gap-3 rounded-[14px] bg-white px-3.5 py-2.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F5F0FF] shadow-2xs"
                style={{ border: '2px solid #0072FF' }}
              >
                <Icon className="h-5 w-5 shrink-0" style={{ color: '#0072FF' }} />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-extrabold leading-tight tracking-tight">
                  <span style={{ color: '#5A00D6' }}>◉</span>{' '}
                  <span
                    className="bg-clip-text text-transparent"
                    style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                  >
                    {title}
                  </span>
                </h1>
                {description && (
                  <p
                    className="mt-0.5 text-xs sm:text-sm font-bold leading-snug text-[#0A2B6D]"
                    style={{ color: '#0A2B6D' }}
                  >
                    {description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Small Header Tiles Row (1–2 Rows): App Design Border + White Background + Dark Blue Writing + Coloured Symbols */}
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
                  'flex shrink-0 items-center gap-1.5 [&>button]:h-7 [&>button]:gap-1 [&>button]:px-2.5 [&>button]:text-[11px] [&>button_svg]:mr-0 [&>button_svg]:size-3',
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
                    compactActions ? 'gap-1.5' : 'gap-2',
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
  return <div className={cn('module-action-bar flex flex-wrap items-center gap-1.5', className)}>{children}</div>;
}