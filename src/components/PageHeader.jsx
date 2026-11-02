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
 * - White background outside the tiles inside the header/topic section only, up to the header border.
 * - Dark Navy (#0A2B6D) outside the header border to the side of the page.
 * - Main Header Title: App Design Coloured Border, White background, App Design Coloured Symbol,
 *   and Dark Blue (#0A2B6D) writing changing into App Design Colours towards the end.
 * - Small Header Tiles: Fit neatly in 1–2 rows directly on the white header background, each with its own
 *   App Design Coloured Border, White background, Dark Blue (#0A2B6D) writing, and App Design Coloured Symbol
 *   (unless highlighting something, where the background is App Design Coloured).
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
        {/* White Background Outside the Tiles Inside the Header/Topic Section Only */}
        <div className="rounded-[13px] bg-white p-2.5 sm:p-3.5 space-y-2.5">
          {/* Main Header Inside Page Header: App Design Coloured Border + White Background + App Design Coloured Symbol + Dark Blue -> App Colour Writing */}
          <div
            className="rounded-2xl p-[2px] shadow-2xs"
            style={{ background: APP_BORDER_GRADIENT }}
          >
            <div className="flex min-w-0 w-full flex-wrap items-center justify-between gap-2.5 rounded-[14px] bg-white px-3.5 py-2.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl shadow-2xs"
                  style={{
                    border: '2px solid transparent',
                    background: `linear-gradient(#ffffff, #ffffff) padding-box, ${APP_BORDER_GRADIENT} border-box`,
                  }}
                >
                  <Icon className="h-4.5 w-4.5 shrink-0" style={{ color: '#0072FF' }} />
                </div>
                <h1
                  className="text-base sm:text-xl font-extrabold leading-tight tracking-tight text-[#0A2B6D]"
                  style={{ color: '#0A2B6D' }}
                >
                  <span style={{ color: '#5A00D6' }}>◉</span> {title}
                </h1>
              </div>

              {description && (
                <div
                  className="rounded-full p-[1.5px]"
                  style={{ background: APP_BORDER_GRADIENT }}
                >
                  <p
                    className="rounded-full bg-white px-3 py-0.5 text-[11px] sm:text-xs font-extrabold leading-snug text-[#0A2B6D]"
                    style={{ color: '#0A2B6D' }}
                  >
                    <span style={{ color: '#0072FF' }}>◉</span> {description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Small Header Tiles on 2 Lines at the Bottom of the Section on White */}
          <div className="space-y-1.5 bg-white">
            {/* Line 1 of Bottom Small Tiles: Compliance Tracker Small Tiles */}
            <div className="flex flex-wrap items-center gap-1.5 bg-white">
              <ModuleComplianceStrip path={seg} />
            </div>
            {/* Line 2 of Bottom Small Tiles: Audit & Module Action Small Tiles */}
            <div
              className={cn(
                'flex flex-wrap items-center bg-white',
                compactActions ? 'module-action-bar gap-1.5' : 'gap-2'
              )}
            >
              {beforeAudit}
              <div
                className={cn(
                  'flex shrink-0 flex-wrap items-center gap-1.5',
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
  return <div className={cn('module-action-bar flex flex-wrap items-center gap-2', className)}>{children}</div>;
}