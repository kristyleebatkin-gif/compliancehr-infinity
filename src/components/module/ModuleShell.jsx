import React from 'react';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import CollapsibleSection from '@/components/module/CollapsibleSection';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import '@/components/module/moduleShell.css';

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
  children,
}) {
  const colour = moduleKeyColour(moduleKey) || '#4F46E5';
  const rows = (
    <div className="module-shell-workspace min-w-0 space-y-4" style={{ '--module-colour': colour }}>
      {!insightAfterTiles && insight}
      {!insightAfterTiles && insightModule && <RegisterInsights module={insightModule} />}

      {actions && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div role="group" aria-label={`${title || 'Module'} actions`} className="module-shell-actions module-action-bar flex flex-wrap items-center gap-2">
            {actions}
          </div>
        </div>
      )}

      {tabs && <div className="min-w-0 w-full">{tabs}</div>}

      {search && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-2xs">
          <div role="search" aria-label={`${title || 'Module'} search and filters`} className="module-shell-search min-w-0">{search}</div>
        </div>
      )}

      {small && (
        <div
          className={`module-shell-tiles grid gap-3 sm:grid-cols-2 ${
            React.Children.count(small) === 5
              ? 'md:grid-cols-3 lg:grid-cols-5'
              : 'lg:grid-cols-4'
          } [&>*]:rounded-2xl [&>*]:border [&>*]:border-slate-200 [&>*]:bg-white [&>*]:p-4 [&>*]:shadow-2xs`}
        >
          {small}
        </div>
      )}

      {medium && (
        <div className="module-shell-tiles grid gap-3 md:grid-cols-2 [&>*]:rounded-2xl [&>*]:border [&>*]:border-slate-200 [&>*]:bg-white [&>*]:p-4 [&>*]:shadow-2xs">
          {medium}
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