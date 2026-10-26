import React from 'react';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import CollapsibleSection from '@/components/module/CollapsibleSection';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import '@/components/module/moduleShell.css';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

export default function ModuleShell({
  embedded = false,
  header,
  title,
  subtitle,
  icon,
  moduleKey,
  tabs,
  actions,
  search,
  insightModule,
  insight,
  insightAfterTiles = false,
  small,
  medium,
  large = [],
  children,
}) {
  const colour = moduleKeyColour(moduleKey) || '#0072FF';
  const rows = (
    <div className="space-y-3" style={{ '--module-colour': colour }}>
      {!insightAfterTiles && insight}
      {!insightAfterTiles && insightModule && <RegisterInsights module={insightModule} />}

      {actions && (
        <div
          className="rounded-3xl p-[10px] shadow-md"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="module-shell-actions module-action-bar flex flex-wrap items-center justify-center rounded-[14px] bg-white p-3 [&_button]:rounded-full [&_button]:border-2 [&_button]:border-[#0A2B6D]">
            {actions}
          </div>
        </div>
      )}

      {tabs && (
        <div
          className="rounded-3xl p-[10px] shadow-md"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="rounded-[14px] bg-white p-2.5 [&>[role=tablist]]:bg-transparent [&>[role=tablist]]:p-0 [&>[role=tablist]]:shadow-none [&>[role=tablist]]:border-0">
            {tabs}
          </div>
        </div>
      )}

      {search && (
        <div
          className="rounded-3xl p-[10px] shadow-md"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="rounded-[14px] bg-white p-2.5">{search}</div>
        </div>
      )}

      {small && (
        <div
          className="rounded-3xl p-[10px] shadow-md"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="module-shell-tiles grid gap-2.5 rounded-[14px] bg-white p-3 sm:grid-cols-2 lg:grid-cols-4 [&>*]:rounded-2xl [&>*]:border-2 [&>*]:border-[#0A2B6D] [&>*]:bg-white [&>*]:p-3.5">
            {small}
          </div>
        </div>
      )}

      {medium && (
        <div
          className="rounded-3xl p-[10px] shadow-md"
          style={{ background: TOP_BORDER_GRADIENT }}
        >
          <div className="module-shell-tiles grid gap-3 rounded-[14px] bg-white p-3.5 md:grid-cols-2 [&>*]:rounded-2xl [&>*]:border-2 [&>*]:border-[#0A2B6D] [&>*]:bg-white [&>*]:p-4">
            {medium}
          </div>
        </div>
      )}
    </div>
  );

  if (embedded) return <div className="space-y-3">{tabs}{children}</div>;

  return (
    <div className="space-y-3" style={{ '--module-colour': colour }}>
      {header ? (
        <>
          {header}
          {rows}
        </>
      ) : (
        <PageHeader
          auditClassName="module-audit-buttons ml-auto"
          title={title}
          subtitle={subtitle}
          icon={icon}
          under={rows}
        />
      )}
      {children}
      {insightAfterTiles && insight}
      {insightAfterTiles && insightModule && <RegisterInsights module={insightModule} />}
      {large.map((s) => (
        <CollapsibleSection key={s.key || s.title} title={s.title}>
          {s.content}
        </CollapsibleSection>
      ))}
    </div>
  );
}