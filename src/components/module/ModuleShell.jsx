import React from 'react';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import CollapsibleSection from '@/components/module/CollapsibleSection';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import '@/components/module/moduleShell.css';

const WHITE_ROW = 'flex flex-wrap items-center gap-1.5 rounded-xl border border-border/60 bg-white p-2 shadow-sm';

/*
 * STANDARD MODULE LAYOUT (owner's rule) — every module, top to bottom:
 *  Header (unchanged PageHeader)
 *  Row 1  white: live compliance tracker · screen tabs (`tabs`) · Audit Checklist + Audit Report (end)
 *  Row 2  white: every button / action tile (`actions`), module colours, left to right
 *  Row 3  search bar (`search`)
 *  Row 4  AI insight (`insightModule`)
 *  Row 5  small dashboards / tiles (`small`), then medium (`medium`)
 *  End    big dashboards (`large`: [{ key, title, content }]) — collapsible
 *  Then   the module's tab content (`children`).
 * Put `tabs` (a <TabsList>) and `children` (<TabsContent>s) inside a <Tabs> root.
 */
export default function ModuleShell({ embedded = false, title, subtitle, icon, moduleKey, tabs, actions, search, insightModule, insight, insightAfterTiles = false, small, medium, large = [], children }) {
  const colour = moduleKeyColour(moduleKey) || '#4f46e5';
  const rows = (
    <div className="space-y-2.5" style={{ '--module-colour': colour }}>
      {search && <div>{search}</div>}
      {!insightAfterTiles && insight}
      {!insightAfterTiles && insightModule && <RegisterInsights module={insightModule} />}
      {(tabs || actions) && (
        <div className="flex flex-col" style={{ gap: '0.5cm' }}>
          {tabs && <div className="[&>[role=tablist]]:bg-transparent [&>[role=tablist]]:p-0 [&>[role=tablist]]:shadow-none">{tabs}</div>}
          {actions && <div className="module-shell-actions module-action-bar flex flex-wrap items-center">{actions}</div>}
        </div>
      )}
      {small && <div className="module-shell-tiles grid gap-2 sm:grid-cols-2 lg:grid-cols-4 [&>*]:rounded-xl [&>*]:border [&>*]:p-3">{small}</div>}
      {medium && <div className="module-shell-tiles grid gap-3 md:grid-cols-2 [&>*]:rounded-xl [&>*]:border [&>*]:p-4">{medium}</div>}
    </div>
  );
  if (embedded) return <div className="space-y-2.5">{tabs}{children}</div>;
  return (
    <div className="space-y-2.5" style={{ '--module-colour': colour }}>
      <PageHeader
        auditClassName="module-audit-buttons ml-auto"
        title={title}
        subtitle={subtitle}
        icon={icon}
        under={rows}
      />
      {children}
      {insightAfterTiles && insight}
      {insightAfterTiles && insightModule && <RegisterInsights module={insightModule} />}
      {large.map((s) => <CollapsibleSection key={s.key || s.title} title={s.title}>{s.content}</CollapsibleSection>)}
    </div>
  );
}