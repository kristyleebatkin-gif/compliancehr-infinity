import React, { useId, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { moduleColour } from '@/lib/moduleColours';

export default function SectionCard({ title, description, action, children, className, collapsible = false, defaultOpen = false, ...props }) {
  const contentId = useId();
  const [expanded, setExpanded] = useState(!collapsible || defaultOpen || (props.id && window.location.hash === `#${props.id}`));
  const panelTone = /investigation|policy/i.test(title || '') ? 'primary' : /incident|hazard|eliminat/i.test(title || '') ? 'danger' : /risk|assessment|isolate/i.test(title || '') ? 'hr-evidence' : /training|compliance|checklist/i.test(title || '') ? 'chart-2' : 'primary';
  const accent = moduleColour(title || 'ComplianceHR');
  return (
    <div
      className={cn(
        'dashboard-panel relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-panel transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
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
        <div className="dashboard-panel-header relative flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-5" style={{ background: 'var(--header-gradient)' }}>
          <div className="pointer-events-none absolute -right-8 -top-14 h-36 w-36 rounded-full border-[20px] border-white/10" />
          <div className="relative min-w-0 flex-1">
            {title && (
              collapsible ? (
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={contentId}
                  onClick={() => setExpanded((value) => !value)}
                  className="flex items-start gap-2 text-left text-sm font-extrabold text-white"
                >
                  <ChevronDown className={`mt-0.5 h-4 w-4 shrink-0 text-white transition-transform ${expanded ? '' : '-rotate-90'}`} />
                  <span data-panel-title>{title}</span>
                </button>
              ) : (
                <div data-panel-title className="break-words text-sm font-extrabold tracking-tight text-white">
                  {title}
                </div>
              )
            )}
            {description && <p className="mt-0.5 break-words text-xs font-medium text-white/90">{description}</p>}
          </div>
          {action && <div className="relative flex flex-wrap items-center gap-1.5">{action}</div>}
        </div>
      )}
      <div
        id={contentId}
        hidden={collapsible && !expanded}
        className="dashboard-panel-body p-3.5 sm:p-4"
        style={{ background: `linear-gradient(180deg, ${accent}12 0%, ${accent}05 42%, transparent 100%)` }}
      >
        {children}
      </div>
    </div>
  );
}