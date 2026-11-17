import React, { useState } from 'react';
import PageHeader from '@/components/PageHeader';
import RegisterInsights from '@/components/RegisterInsights';
import CollapsibleSection from '@/components/module/CollapsibleSection';
import { moduleKeyColour } from '@/components/dashboard/dashboardModuleColours';
import WorkspaceLayoutBar from '@/components/workspace/WorkspaceLayoutBar';
import WorkspaceContextPanel from '@/components/workspace/WorkspaceContextPanel';
import useWorkspaceLayout from '@/components/workspace/useWorkspaceLayout';
import { orderedSections } from '@/lib/workspaceLayout';
import '@/components/module/moduleShell.css';

/**
 * The shared module shell.
 *
 * Passing `workspaceKey` turns on the Workspace OS strip: persisted view state, block order and
 * version history for this person in this business. Without it the shell renders exactly as before.
 *
 * @param {any} props
 */
export default function ModuleShell({
  embedded = false,
  header = null,
  title = '',
  subtitle = '',
  icon = undefined,
  moduleKey = '',
  workspaceKey = '',
  workspaceLabel = '',
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
  const workspace = useWorkspaceLayout(workspaceKey, workspaceLabel || title);
  const [contextOpen, setContextOpen] = useState(false);
  const layout = workspace.permitted && workspace.layout ? workspace.layout : null;

  const availableSections = [
    insight || insightModule ? 'insight' : null,
    small ? 'tiles' : null,
    medium ? 'medium' : null,
    large.length ? 'supporting' : null,
  ].filter(Boolean);

  const isVisible = (key) => (!layout ? true : layout.sections.find((section) => section.key === key)?.visible !== false);

  const toolbar = (actions || search) ? (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs lg:flex-row lg:items-center lg:justify-between">
      {search && (
        <div
          role="search"
          aria-label={`${title || 'Module'} search and filters`}
          className="module-shell-search min-w-0 flex-1"
        >
          {search}
        </div>
      )}
      {actions && (
        <div
          role="group"
          aria-label={`${title || 'Module'} actions`}
          className="module-shell-actions module-action-bar flex flex-wrap items-center gap-2"
        >
          {actions}
        </div>
      )}
    </div>
  ) : null;

  const insightBlock = (insight || insightModule) ? (
    <>
      {insight}
      {insightModule && <RegisterInsights module={insightModule} />}
    </>
  ) : null;

  const tilesBlock = small ? (
    <div
      className={`module-shell-tiles grid gap-3 sm:grid-cols-2 ${
        React.Children.count(small) === 5
          ? 'md:grid-cols-3 lg:grid-cols-5'
          : 'lg:grid-cols-4'
      } [&>*]:rounded-xl [&>*]:border [&>*]:border-slate-200 [&>*]:bg-white [&>*]:p-4 [&>*]:shadow-2xs`}
    >
      {small}
    </div>
  ) : null;

  const mediumBlock = medium ? (
    <div className="module-shell-tiles grid gap-3 md:grid-cols-2 [&>*]:rounded-xl [&>*]:border [&>*]:border-slate-200 [&>*]:bg-white [&>*]:p-4 [&>*]:shadow-2xs">
      {medium}
    </div>
  ) : null;

  const supportingSections = large.map((section) => (
    <CollapsibleSection key={section.key || section.title} title={section.title}>
      {section.content}
    </CollapsibleSection>
  ));

  // Blocks the saved layout can order. A saved layout never hides a page's own content or its tabs.
  const blockFor = { insight: insightBlock, tiles: tilesBlock, medium: mediumBlock };
  const orderedBlocks = orderedSections(layout)
    .filter((section) => section.key in blockFor && isVisible(section.key) && blockFor[section.key])
    .map((section) => <React.Fragment key={section.key}>{blockFor[section.key]}</React.Fragment>);

  const legacyBlocks = (
    <>
      {!insightAfterTiles && insightBlock}
      {toolbar}
      {tabs && <div className="min-w-0 w-full">{tabs}</div>}
      {tilesBlock}
      {mediumBlock}
    </>
  );

  const layoutBlocks = (
    <>
      {toolbar}
      {tabs && <div className="min-w-0 w-full">{tabs}</div>}
      {orderedBlocks}
    </>
  );

  const blocks = layout ? layoutBlocks : legacyBlocks;
  const supporting = isVisible('supporting') ? supportingSections : null;
  const insightAfter = (!layout && insightAfterTiles) ? insightBlock : null;

  const workspaceBar = workspace.permitted ? (
    <WorkspaceLayoutBar
      workspaceKey={workspaceKey}
      workspaceLabel={workspaceLabel || title || workspaceKey}
      availableSections={availableSections}
      workspace={workspace}
      onOpenContext={() => setContextOpen(true)}
    />
  ) : null;

  const contextPanel = workspace.permitted ? (
    <WorkspaceContextPanel
      open={contextOpen}
      onOpenChange={setContextOpen}
      workspaceKey={workspaceKey}
      workspaceLabel={workspaceLabel || title || workspaceKey}
      workspace={workspace}
    />
  ) : null;

  if (embedded) {
    return (
      <div className="module-shell-workspace min-w-0 space-y-4" style={{ '--module-colour': colour }}>
        {workspaceBar}
        {contextPanel}
        {blocks}
        {children}
        {insightAfter}
        {supporting}
      </div>
    );
  }

  return (
    <div className="module-shell-workspace min-w-0 space-y-4" style={{ '--module-colour': colour }}>
      {header ? (
        <>
          {header}
          {workspaceBar}
          {contextPanel}
          {blocks}
        </>
      ) : (
        <PageHeader
          auditClassName="module-audit-buttons ml-auto"
          title={title}
          subtitle={subtitle}
          icon={icon}
          under={(
            <>
              {workspaceBar}
              {contextPanel}
              {blocks}
            </>
          )}
        />
      )}
      {children}
      {insightAfter}
      {supporting}
    </div>
  );
}