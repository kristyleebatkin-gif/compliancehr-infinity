import React, { useId, useState } from 'react';
import {
  ChevronDown, ShieldCheck, Users, Heart, CalendarRange, Siren,
  AlertTriangle, FileText, DollarSign, GraduationCap, MessagesSquare, Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 28%, #5A00D6 62%, #FF2E9A 100%)';

const HEADING_TEXT_GRADIENT =
  'linear-gradient(90deg, #0A2B6D 0%, #0A2B6D 38%, #0072FF 62%, #5A00D6 82%, #FF2E9A 100%)';

const APP_COLOURS = ['#0072FF', '#5A00D6', '#FF2E9A', '#A100FF', '#00C6FF'];

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
  const seed = hashIndex(`${title}-${resolvedSubject}`);
  const symColor = APP_COLOURS[seed % APP_COLOURS.length];

  return (
    <div
      className={cn(
        'dashboard-panel rounded-2xl p-[3px] shadow-lg transition-all duration-200',
        className
      )}
      style={{ background: TOP_BORDER_GRADIENT }}
      {...props}
    >
      <div className="overflow-hidden rounded-[13px] bg-white">
        {(title || action) && (
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b-2 border-[#5A00D6]/25 bg-white px-3.5 py-2.5 sm:px-4">
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
              {/* Small Subject Tile: App Design Coloured Border + White Background + Dark Blue Writing + App Design Coloured Symbol */}
              <span
                className="inline-flex min-h-[30px] items-center gap-1.5 rounded-full bg-white px-3 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-[#0A2B6D] shadow-2xs"
                style={{ border: `2px solid ${symColor}`, color: '#0A2B6D' }}
              >
                <SubjectIcon className="h-3.5 w-3.5 shrink-0" style={{ color: symColor }} />
                <span style={{ color: '#0A2B6D' }}>{resolvedSubject}</span>
              </span>

              {/* Main Section Header Tile: App Design Coloured Border + White Background + Dark Blue -> App Colour Writing */}
              {title && (
                <div
                  className="rounded-xl p-[1.5px] shadow-2xs"
                  style={{ background: TOP_BORDER_GRADIENT }}
                >
                  <div className="flex flex-wrap items-center gap-2 rounded-[10.5px] bg-white px-3 py-1">
                    {collapsible ? (
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={contentId}
                        onClick={() => setExpanded((value) => !value)}
                        className="flex items-center gap-1.5 text-left font-editorial text-sm sm:text-base font-extrabold"
                      >
                        <ChevronDown
                          className={`h-4 w-4 shrink-0 text-[#5A00D6] transition-transform ${
                            expanded ? '' : '-rotate-90'
                          }`}
                        />
                        <span
                          data-panel-title
                          className="bg-clip-text text-transparent"
                          style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                        >
                          {title}
                        </span>
                      </button>
                    ) : (
                      <div
                        data-panel-title
                        className="break-words font-editorial text-sm sm:text-base font-extrabold tracking-tight bg-clip-text text-transparent"
                        style={{ backgroundImage: HEADING_TEXT_GRADIENT }}
                      >
                        <span style={{ color: symColor }}>◉</span> {title}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Description Pill: App Design Coloured Border + White Background + Dark Blue Writing */}
              {description && (
                <span
                  className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#0A2B6D]"
                  style={{ border: '1.5px solid #0072FF', color: '#0A2B6D' }}
                >
                  <span style={{ color: '#0072FF' }}>◉</span>
                  <span style={{ color: '#0A2B6D' }}>{description}</span>
                </span>
              )}
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