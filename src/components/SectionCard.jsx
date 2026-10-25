import React, { useId, useState } from 'react';
import {
  ChevronDown, ShieldCheck, Users, Heart, CalendarRange, Siren,
  AlertTriangle, FileText, DollarSign, GraduationCap, MessagesSquare, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';

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

export default function SectionCard({ title, subject, description, action, children, className, collapsible = false, defaultOpen = false, ...props }) {
  const contentId = useId();
  const [expanded, setExpanded] = useState(!collapsible || defaultOpen || (props.id && window.location.hash === `#${props.id}`));
  const panelTone = /investigation|policy/i.test(title || '') ? 'primary' : /incident|hazard|eliminat/i.test(title || '') ? 'danger' : /risk|assessment|isolate/i.test(title || '') ? 'hr-evidence' : /training|compliance|checklist/i.test(title || '') ? 'chart-2' : 'primary';
  const accent = moduleColour(title || 'ComplianceHR');
  const subjectInfo = resolveSectionSubject(title, description);
  const SubjectIcon = subjectInfo.Icon;
  const resolvedSubject = subject || subjectInfo.label;

  return (
    <div
      className={cn(
        'dashboard-panel relative overflow-hidden rounded-2xl border-2 border-[#0A2B6D] bg-white shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
        className
      )}
      style={{
        '--panel-tone': `var(--${panelTone})`,
        '--section-accent': accent,
        borderTop: `4px solid ${accent}`,
        boxShadow: `0 1px 2px rgba(15, 23, 42, 0.04), 0 14px 34px -20px ${accent}55`,
      }}
      {...props}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-[0.08] blur-xl" style={{ backgroundColor: accent }} />
      {(title || action) && (
        <div
          className="dashboard-panel-header relative flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#FF2E9A] px-4 py-3 sm:px-5"
          style={{ background: 'var(--header-gradient)' }}
        >
          <div className="pointer-events-none absolute -right-8 -top-14 h-36 w-36 rounded-full border-[20px] border-white/10" />
          <div className="relative flex min-w-0 flex-1 items-start gap-2.5">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-white/20 text-white shadow-sm">
              <SubjectIcon className="h-4 w-4 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full border border-white/40 bg-white/20 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#00C6FF]" />
                  {resolvedSubject}
                </span>
              </div>
              {title && (
                collapsible ? (
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={contentId}
                    onClick={() => setExpanded((value) => !value)}
                    className="flex items-start gap-2 text-left text-base font-extrabold text-white"
                  >
                    <ChevronDown className={`mt-1 h-4 w-4 shrink-0 text-white transition-transform ${expanded ? '' : '-rotate-90'}`} />
                    <span data-panel-title>{title}</span>
                  </button>
                ) : (
                  <div data-panel-title className="break-words text-base font-extrabold tracking-tight text-white">
                    {title}
                  </div>
                )
              )}
              {description && <p className="mt-0.5 break-words text-xs font-medium text-white/90">{description}</p>}
            </div>
          </div>
          {action && <div className="relative flex flex-wrap items-center gap-1.5">{action}</div>}
        </div>
      )}
      <div
        id={contentId}
        hidden={collapsible && !expanded}
        className="dashboard-panel-body p-3.5 text-xs sm:p-4"
        style={{ background: `linear-gradient(180deg, ${accent}12 0%, ${accent}05 42%, transparent 100%)` }}
      >
        {children}
      </div>
    </div>
  );
}