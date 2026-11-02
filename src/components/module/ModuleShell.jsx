import React from 'react';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import CollapsibleSection from '@/components/module/CollapsibleSection';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import '@/components/module/moduleShell.css';

const TOP_BORDER_GRADIENT =
  'linear-gradient(120deg, #00C6FF 0%, #0072FF 22%, #5A00D6 48%, #A100FF 74%, #FF2E9A 100%)';

/** @param {any} props */
export default function ModuleShell({
  embedded = false,
  header = null,
  title = '',
  subtitle = '',
  icon = undefined,
  moduleKey = '',
  tabs = null,
  actions = null,
  search = null,
  insightModule = null,
  insight = null,
  insightAfterTiles = false,
  small = null,
  medium = null,
  large = [],
  children = null,
} = {}) {
  const colour = moduleKeyColour(moduleKey) || '#0072FF';
  const rows = (
    <div className="module-shell-workspace min-w-0 space-y-4" style={{ '--module-colour': colour }}>
      {!insightAfterTiles && insight}
      {!insightAfterTiles && insightModule && <RegisterInsights module={insightModule} />}

      {actions && (
        <div
          className="preserve-island-theme rounded-2xl border-2 border-[#0A2B6D] p-1.5 shadow-md"
          style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #131B4D 100%)' }}
        >
          <div className="rounded-xl p-[2px]" style={{ background: TOP_BORDER_GRADIENT }}>
            <div role="group" aria-label={`${title || 'Module'} actions`} className="module-shell-actions module-action-bar flex flex-wrap items-center justify-center rounded-[10px] bg-white p-2 [&_button]:rounded-full [&_button]:border-2 [&_button]:border-[#0072FF]">
              {actions}
            </div>
          </div>
        </div>
      )}

      {tabs && <div className="min-w-0 w-full">{tabs}</div>}

      {search && (
        <div
          className="preserve-island-theme rounded-2xl border-2 border-[#0A2B6D] p-1.5 shadow-md"
          style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #131B4D 100%)' }}
        >
          <div className="rounded-xl p-[2px]" style={{ background: TOP_BORDER_GRADIENT }}>
            <div role="search" aria-label={`${title || 'Module'} search and filters`} className="module-shell-search min-w-0 rounded-[10px] bg-white p-2.5">{search}</div>
          </div>
        </div>
      )}

      {small && (
        <div
          className="preserve-island-theme rounded-2xl border-2 border-[#0A2B6D] p-1.5 shadow-md"
          style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #131B4D 100%)' }}
        >
          <div
            className={`module-shell-tiles grid gap-2 rounded-xl p-1 sm:grid-cols-2 ${
              React.Children.count(small) === 5
                ? 'md:grid-cols-3 lg:grid-cols-5'
                : ' lg:grid-cols-4'
            } [&>*]:rounded-3xl [&>*]:border-2 [&>*]:border-[#0072FF] [&>*]:bg-white [&>*]:p-3`}
          >
            {small}
          </div>
        </div>
      )}

      {medium && (
        <div
          className="preserve-island-theme rounded-2xl border-2 border-[#0A2B6D] p-1.5 shadow-md"
          style={{ background: 'linear-gradient(165deg, #061A44 0%, #0A2B6D 55%, #131B4D 100%)' }}
        >
          <div className="module-shell-tiles grid gap-2.5 rounded-xl p-1 md:grid-cols-2 [&>*]:rounded-3xl [&>*]:border-2 [&>*]:border-[#0072FF] [&>*]:bg-white [&>*]:p-3">
            {medium}
          </div>
        </div>
      )}
    </div>
  );

  const supportingSections = large.map((section) => (
    <CollapsibleSection key={section.key || section.title} title={section.title}>
      {section.content}
    </CollapsibleSection>
  ));

  if (embedded) {
    return (
      <div className="module-shell-workspace min-w-0 space-y-4" style={{ '--module-colour': colour }}>
        {rows}
        {children}
        {insightAfterTiles && insight}
        {insightAfterTiles && insightModule && <RegisterInsights module={insightModule} />}
        {supportingSections}
      </div>
    );
  }

  return (
    <div className="module-shell-workspace min-w-0 space-y-4" style={{ '--module-colour': colour }}>
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
      {supportingSections}
    </div>
  );
}