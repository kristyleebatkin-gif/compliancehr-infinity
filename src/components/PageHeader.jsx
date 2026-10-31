import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';
import ModuleComplianceStrip from '@/components/ModuleComplianceStrip';
import { useLocation } from 'react-router-dom';
import AutoRegisterInsights from '@/components/AutoRegisterInsights';
import { resolveAuditModule } from '@/lib/moduleAuditReport';

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
  if (/document|safe|vault|storage/.test(t)) return 'Smart Vault & Document Control';
  if (/operation|control|dashboard|analytics/.test(t)) return 'Executive Command & Operations';
  return 'ComplianceHR Infinity';
}

export default function PageHeader({
  title,
  subtitle,
  description: descriptionProp,
  subject,
  action,
  actions,
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
  const description = subtitle || descriptionProp || modMeta?.blurb || '';
  const subjectLabel = subject || modMeta?.group || resolveHeaderSubject(title, seg);
  const resolvedActions = action || actions;

  return (
    <div className="space-y-4">
      <div
        className={cn(
          'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs',
          className
        )}
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 space-y-1.5 text-left">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
              <Icon className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
              <span>{subjectLabel}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>

            {description && (
              <p className="max-w-3xl text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                {description}
              </p>
            )}
          </div>

          {(resolvedActions || beforeAudit || afterAudit) && (
            <div
              className={cn(
                'flex flex-wrap items-center gap-2 shrink-0',
                compactActions ? 'module-action-bar' : '',
                actionClassName
              )}
            >
              {beforeAudit}
              {resolvedActions}
              {afterAudit}
            </div>
          )}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3">
          <ModuleComplianceStrip path={seg} />
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
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
      <div
        className={cn(
          'module-action-bar flex flex-wrap items-center gap-2',
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}