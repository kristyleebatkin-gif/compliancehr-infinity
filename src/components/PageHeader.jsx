import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid, Sparkles } from 'lucide-react';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import { useLocation } from 'react-router-dom';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import { resolveAuditModule } from '@/lib/moduleAuditReport';
import {
  getHeaderView,
  getTitleGradientView,
  getSubheaderColourView,
} from '@/lib/fullColourTiles';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

function hashIndex(str = '') {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

function resolveHeaderSubject(title = '', seg = '') {
  const t = `${title} ${seg}`.toLowerCase();
  if (/roster|shift|availab|schedule/.test(t)) return 'Rostering & Shift Management';
  if (/participant|ndis|goal|intake/.test(t)) return 'Participant Care & NDIS Plans';
  if (/employee|staff|hr|payroll|appraisal|badge/.test(t)) return 'Workforce, HR & Staff Credentials';
  if (/incident|emergency|drill|hazard|msds|equipment/.test(t)) return 'WHS, Incident & Emergency Safety';
  if (/risk|safeguard/.test(t)) return 'Enterprise & Participant Risk Control';
  if (/compliance|audit|quality|policy|checklist|review/.test(t)) return 'NDIS Governance, Audit & Quality';
  if (/invoic|quote|receipt|financ|procure/.test(t)) return 'Finance, Claims & Reconciliation';
  if (/comm|briefing|meeting|feedback|complaint/.test(t)) return 'Communications, Meetings & Logs';
  if (/train|certificate|skill/.test(t)) return 'Training Academy & Competency';
  if (/document|safe|vault/.test(t)) return 'Smart Vault & Document Control';
  if (/operation|control|dashboard|analytics/.test(t)) return 'Executive Command & Operations';
  return 'ComplianceHR Infinity Module';
}

export default function PageHeader({
  title,
  subtitle,
  subject,
  action,
  icon: Icon = LayoutGrid,
  className,
  under,
  beforeAudit,
  afterAudit,
  compactActions = true,
  actionClassName,
}) {
  const { pathname } = useLocation();
  const seg = `/${pathname.split('/')[1] || ''}`;
  const modMeta = resolveAuditModule(seg);
  const description = subtitle || modMeta?.blurb || '';
  const subjectLabel = subject || modMeta?.group || resolveHeaderSubject(title, seg);
  const seed = hashIndex(`${title}-${seg}`);

  return (
    <div className="space-y-3">
      <div
        className={cn('rounded-3xl p-[12px] shadow-lg', className)}
        style={{ background: TOP_BORDER_GRADIENT }}
      >
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[16px] bg-white px-4 py-4 sm:px-6 sm:py-5 text-center space-y-2.5">
          {/* Centred Subject & Module Pill Badges — Different Views of App Colours + WHITE Small Symbols */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-5 py-1 text-xs sm:text-sm font-extrabold tracking-wide text-white shadow-sm"
              style={{ background: getHeaderView(seed) }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/20 text-white">
                <Icon className="h-3.5 w-3.5 text-white" />
              </span>
              <span>Subject: {subjectLabel}</span>
            </span>

            <span
              className="inline-flex min-h-[38px] items-center justify-center gap-2 rounded-full border-2 border-[#0A2B6D] px-4 py-1 text-xs font-extrabold text-white shadow-2xs"
              style={{ background: getHeaderView(seed + 3) }}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                <Sparkles className="h-3 w-3 text-white" />
              </span>
              <span>Module: {title}</span>
            </span>
          </div>

          {/* Centred Module Heading & Sub-Header in Different Views of App Design Colours */}
          <div className="mx-auto max-w-4xl space-y-1">
            <h1 className="font-editorial text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: getTitleGradientView(seed) }}
              >
                {title}
              </span>
            </h1>
            {description && (
              <p
                className="mx-auto max-w-3xl text-xs sm:text-sm font-extrabold leading-relaxed"
                style={{ color: getSubheaderColourView(seed) }}
              >
                {description}
              </p>
            )}
          </div>

          {/* Live Compliance Strip & Module Actions */}
          <div
            className={cn(
              'mt-1 flex w-full flex-wrap items-center justify-center rounded-2xl border-2 border-[#0A2B6D] bg-white px-3 py-2 shadow-2xs',
              compactActions ? 'module-action-bar gap-2' : 'gap-2.5'
            )}
          >
            <ModuleComplianceStrip path={seg} />
            {beforeAudit}
            {action && (
              <div
                className={cn(
                  'flex flex-wrap items-center justify-center',
                  compactActions ? 'gap-1.5' : 'gap-2',
                  actionClassName
                )}
              >
                {action}
              </div>
            )}
            {afterAudit}
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

export function HeaderUnderRow({ children, className }) {
  return (
    <div
      className="rounded-3xl p-[10px] shadow-md"
      style={{ background: TOP_BORDER_GRADIENT }}
    >
      <div
        className={cn(
          'module-action-bar flex flex-wrap items-center justify-center gap-2 rounded-[14px] bg-white px-3 py-2',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}