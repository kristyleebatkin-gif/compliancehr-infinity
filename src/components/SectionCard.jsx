import React, { useId, useState } from 'react';
import {
  ChevronDown, ShieldCheck, Users, Heart, CalendarRange, Siren,
  AlertTriangle, FileText, DollarSign, GraduationCap, MessagesSquare, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
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
  className = undefined,
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
  const seed = hashIndex(`${title}-${resolvedSubject}`);

  return (
    <div
      className={cn(
        'dashboard-panel rounded-3xl p-[10px] shadow-lg transition-all duration-200',
        className
      )}
      style={{ background: TOP_BORDER_GRADIENT }}
      {...props}
    >
      <div className="overflow-hidden rounded-[16px] bg-white">
        {(title || action) && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#0A2B6D]/15 bg-white px-4 py-3.5 sm:px-5">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2.5">
              {/* Subject Header Pill with WHITE Small Symbol */}
              <span
                className="inline-flex min-h-[34px] items-center gap-2 rounded-full border-2 border-[#0A2B6D] px-3.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-2xs"
                style={{ background: getHeaderView(seed) }}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white bg-white/20 text-white">
                  <SubjectIcon className="h-3 w-3 text-white" />
                </span>
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
                      className="flex items-center gap-2 text-left font-editorial text-base sm:text-lg font-extrabold"
                    >
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-[#5A00D6] transition-transform ${
                          expanded ? '' : '-rotate-90'
                        }`}
                      />
                      <span
                        data-panel-title
                        className="bg-clip-text text-transparent"
                        style={{ backgroundImage: getTitleGradientView(seed) }}
                      >
                        {title}
                      </span>
                    </button>
                  ) : (
                    <div
                      data-panel-title
                      className="break-words font-editorial text-base sm:text-lg font-extrabold tracking-tight bg-clip-text text-transparent"
                      style={{ backgroundImage: getTitleGradientView(seed) }}
                    >
                      {title}
                    </div>
                  ))}
                {description && (
                  <p
                    className="mt-0.5 break-words text-xs font-semibold"
                    style={{ color: getSubheaderColourView(seed) }}
                  >
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
          className="dashboard-panel-body bg-white p-4 text-xs text-[#0A2B6D]"
        >
          {children}
        </div>
      </div>
    </div>
  );
}