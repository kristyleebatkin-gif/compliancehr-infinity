import React from 'react';
import { cn } from '@/lib/utils';
import { LayoutGrid } from 'lucide-react';
import ModuleAuditButton from '@/components/ModuleAuditButton';
import ModuleAuditChecklistButton from '@/components/ModuleAuditChecklistButton';
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
  if (/document|safe|vault/.test(t)) return 'Smart Vault & Document Control';
  if (/operation|control|dashboard|analytics/.test(t)) return 'Executive Command & Operations';
  return 'ComplianceHR Infinity Module';
}

export default function PageHeader({ title, subtitle, subject, action, icon: Icon = LayoutGrid, className, under, beforeAudit, afterAudit, compactActions = true, actionClassName, auditClassName }) {
  const { pathname } = useLocation();
  const seg = `/${pathname.split('/')[1] || ''}`;
  const modMeta = resolveAuditModule(seg);
  const description = subtitle || modMeta?.blurb || '';
  const subjectLabel = subject || modMeta?.group || resolveHeaderSubject(title, seg);
  return (
    <div className="space-y-2.5">
      <div
        className={cn('app-page-header relative flex items-center overflow-hidden rounded-2xl border-2 border-[#5A00D6] px-5 py-4 shadow-lg', className)}
        style={{ background: 'var(--header-gradient)' }}
      >
        <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full border-[28px] border-white/10" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative flex min-w-0 w-full items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-2 border-white/60 bg-white/20 shadow-md ring-2 ring-white/25">
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/45 bg-white/20 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-2xs">
                <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
                Subject: {subjectLabel}
              </span>
              <span className="rounded-full border border-white/30 bg-[#0A2B6D]/45 px-2 py-0.5 text-[10px] font-bold text-white">
                Module: {title}
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">{title}</h1>
            {description && <p className="mt-0.5 text-xs font-medium leading-snug text-white/95">{description}</p>}
          </div>
        </div>
      </div>
      <div className={cn('flex flex-wrap items-center border-2 border-[#0A2B6D] bg-white shadow-sm', compactActions ? 'module-action-bar gap-2 rounded-xl px-3 py-2' : 'gap-2.5 rounded-xl p-2.5')}>
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