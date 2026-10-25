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
 *  Row 1  live compliance tracker · documents/buttons · Audit Checklist (blue) + Audit Report (pink) (PageHeader bar)
 *  Row 2  small buttons / tabs / tiles (`tabs`, `actions`), module colours
 *  Row 3  search bar (`search`)
 *  Row 4  AI insight (`insightModule`)
 *  Row 5  small dashboards / tiles (`small`), then medium (`medium`)
 *  End    big dashboards (`large`: [{ key, title, content }]) — collapsible
 *  Then   the module's tab content (`children`).
 * Put `tabs` (a <TabsList>) and `children` (<TabsContent>s) inside a <Tabs> root.
 */
export default function ModuleShell({ embedded = false, header, title, subtitle, icon, moduleKey, tabs, actions, search, insightModule, insight, insightAfterTiles = false, small, medium, large = [], children }) {
  const colour = moduleKeyColour(moduleKey) || '#4f46e5';
  const rows = (
    <div className="space-y-2.5" style={{ '--module-colour': colour }}>
      {/* Insight directly under the Audit Register bar and above Employee/Module tiles */}
      {!insightAfterTiles && insight}
      {!insightAfterTiles && insightModule && <RegisterInsights module={insightModule} />}
      {actions && (
        <div className="module-shell-actions module-action-bar flex flex-wrap items-center rounded-xl border-2 border-[#0A2B6D] bg-white p-2 shadow-sm [&_button]:border-2 [&_button]:border-[#0A2B6D]">
          {actions}
        </div>
      )}
      {tabs && (
        <div className="[&>[role=tablist]]:bg-transparent [&>[role=tablist]]:p-0 [&>[role=tablist]]:shadow-none">
          {tabs}
        </div>
      )}
      {search && <div>{search}</div>}
      {small && <div className="module-shell-tiles grid gap-2 sm:grid-cols-2 lg:grid-cols-4 [&>*]:rounded-xl [&>*]:border-2 [&>*]:border-[#0A2B6D] [&>*]:bg-white [&>*]:p-3">{small}</div>}
      {medium && <div className="module-shell-tiles grid gap-3 md:grid-cols-2 [&>*]:rounded-xl [&>*]:border-2 [&>*]:border-[#0A2B6D] [&>*]:bg-white [&>*]:p-4">{medium}</div>}
    </div>
  );
  if (embedded) return <div className="space-y-2.5">{tabs}{children}</div>;
  return (
    <div className="space-y-2.5" style={{ '--module-colour': colour }}>
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
      {large.map((s) => <CollapsibleSection key={s.key || s.title} title={s.title}>{s.content}</CollapsibleSection>)}
    </div>
  );
}