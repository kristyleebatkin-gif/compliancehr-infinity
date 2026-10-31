import React, { useId, useState } from 'react';
import {
  ChevronDown, ShieldCheck, Users, Heart, CalendarRange, Siren,
  AlertTriangle, FileText, DollarSign, GraduationCap, MessagesSquare, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

function resolveSectionSubject(title = '', description = '') {
  const text = `${title} ${description}`.toLowerCase();
  if (/roster|shift|availab|coverage|schedule|leave/.test(text)) {
    return { label: 'Rostering & Shifts', Icon: CalendarRange };
  }
  if (/participant|ndis|plan|support|consent|advoca|medication/.test(text)) {
    return { label: 'Participant & NDIS Care', Icon: Heart };
  }
  if (/staff|employee|hr|onboarding|appraisal|contract|badge|worker/.test(text)) {
    return { label: 'Workforce & HR', Icon: Users };
  }
  if (/incident|emergency|drill|whs|hazard|injury|police/.test(text)) {
    return { label: 'Incident & WHS Safety', Icon: Siren };
  }
  if (/risk|control|take 5|take-5|hierarchy|mitigat/.test(text)) {
    return { label: 'Risk & Controls', Icon: AlertTriangle };
  }
  if (/invoic|quote|receipt|payroll|claim|bank|budget|financ|proda/.test(text)) {
    return { label: 'Finance & Billing', Icon: DollarSign };
  }
  if (/train|quiz|certificat|competenc|course|skill/.test(text)) {
    return { label: 'Training & Credentials', Icon: GraduationCap };
  }
  if (/comm|message|email|inbox|diary|banter|note|alert/.test(text)) {
    return { label: 'Communications & Logs', Icon: MessagesSquare };
  }
  if (/document|vault|template|form|library|safe|policy/.test(text)) {
    return { label: 'Documents & Governance', Icon: FileText };
  }
  if (/audit|compliance|standard|quality|check|review|register/.test(text)) {
    return { label: 'Compliance & Audit', Icon: ShieldCheck };
  }
  return { label: 'Operations & Records', Icon: Sparkles };
}

export default function SectionCard({
  title,
  subject,
  description,
  action,
  children,
  className,
  collapsible = false,
  defaultOpen = false,
  ...props
}) {
  const contentId = useId();
  const [expanded, setExpanded] = useState(
    !collapsible || defaultOpen || (props.id && window.location.hash === `#${props.id}`)
  );
  const subjectInfo = resolveSectionSubject(title, description);
  const SubjectIcon = subjectInfo.Icon;
  const resolvedSubject = subject || subjectInfo.label;

  return (
    <div
      className={cn(
        'dashboard-panel overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 bg-white px-4 py-3.5 sm:px-5">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700">
              <SubjectIcon className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
              <span>{resolvedSubject}</span>
            </span>

            <div className="min-w-0 flex-1">
              {title &&
                (collapsible ? (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    onClick={() => setExpanded((value) => !value)}
                    className="flex items-center gap-2 text-left text-base sm:text-lg font-bold text-slate-900"
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-indigo-600 transition-transform ${
                        expanded ? '' : '-rotate-90'
                      }`}
                    />
                    <span data-panel-title>{title}</span>
                  </button>
                ) : (
                  <div
                    data-panel-title
                    className="break-words text-base sm:text-lg font-bold tracking-tight text-slate-900"
                  >
                    {title}
                  </div>
                ))}
              {description && (
                <p className="mt-0.5 break-words text-xs font-medium text-slate-600">
                  {description}
                </p>
              )}
            </div>
          </div>
          {action && <div className="flex flex-wrap items-center gap-1.5">{action}</div>}
        </div>
      )}
      <div
        id={contentId}
        hidden={collapsible && !expanded}
        className="dashboard-panel-body bg-white p-4 sm:p-5 text-xs text-slate-800"
      >
        {children}
      </div>
    </div>
  );
}