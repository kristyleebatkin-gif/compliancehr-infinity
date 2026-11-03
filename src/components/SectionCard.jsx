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

/** @param {any} props */
export default function SectionCard({
  title = undefined,
  subject = undefined,
  description = undefined,
  action = undefined,
  children = undefined,
  className = undefined,
  collapsible = false,
  defaultOpen = false,
  ...props
} = {}) {
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
        'dashboard-panel overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xs',
        className
      )}
      {...props}
    >
      {(title || action) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-[#F8FAFC] px-4 py-3 sm:px-5">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-[#0072FF]/10 px-2 py-0.5 text-xs font-bold text-[#0072FF]">
                <SubjectIcon className="h-3.5 w-3.5 shrink-0" />
                <span>{resolvedSubject}</span>
              </span>

              {title && (
                collapsible ? (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    onClick={() => setExpanded((value) => !value)}
                    className="inline-flex items-center gap-1.5 text-left font-editorial text-base sm:text-lg font-extrabold text-[#0A2B6D] hover:text-[#0072FF]"
                  >
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 text-[#0A2B6D] transition-transform ${
                        expanded ? '' : '-rotate-90'
                      }`}
                    />
                    <span data-panel-title>{title}</span>
                  </button>
                ) : (
                  <h2
                    data-panel-title
                    className="font-editorial text-base sm:text-lg font-extrabold tracking-tight text-[#0A2B6D]"
                  >
                    {title}
                  </h2>
                )
              )}
            </div>

            {description && (
              <p className="mt-1 text-xs sm:text-sm font-normal text-[#0A2B6D]/75">
                {description}
              </p>
            )}
          </div>

          {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
        </div>
      )}

      <div
        id={contentId}
        hidden={collapsible && !expanded}
        className="dashboard-panel-body p-4 sm:p-5 text-sm text-[#0A2B6D]"
      >
        {children}
      </div>
    </div>
  );
}