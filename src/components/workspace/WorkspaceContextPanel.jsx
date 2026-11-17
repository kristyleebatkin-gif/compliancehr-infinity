import React from 'react';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { describeLayout, isBuiltViewState } from '@/lib/workspaceLayout';

// Context sections the owner specification names. Each one is either live from this release or
// explicitly marked as not connected: no record counts, evidence or AI output are invented here.
const CONNECTIONS = [
  { label: 'Relationships', note: 'Knowledge Graph relationships are read in Knowledge Graph OS.', to: '/knowledge-graph' },
  { label: 'Evidence', note: 'Evidence and findings are held in Evidence OS.', to: '/evidence' },
  { label: 'Linked risks', note: 'Risks are held in the Risk register.', to: '/risks' },
  { label: 'Audits', note: 'Audit records are held in the Compliance Hub.', to: '/compliance' },
  { label: 'Incidents', note: 'Incidents are held in the Incident register.', to: '/incidents' },
  { label: 'Controls and standards', note: 'Controls and standards are held in Assurance Audit Matrix.', to: '/assurance-matrix' },
  { label: 'Comments', note: 'No workspace comment store is connected in this release.', to: null },
  { label: 'Tasks', note: 'Canonical tasks are held in Tasks.', to: '/tasks' },
  { label: 'Approvals', note: 'Canonical approvals are held in the Approval Inbox.', to: '/approvals' },
  { label: 'AI insights', note: 'AI outputs are reviewed in AI Intelligence OS; nothing is generated from this panel.', to: '/ai-os' },
];

export default function WorkspaceContextPanel({ open, onOpenChange, workspaceKey, workspaceLabel, workspace }) {
  const rows = [
    { label: 'Workspace key', value: workspaceKey || 'Not selected' },
    { label: 'Workspace', value: workspaceLabel || workspaceKey || 'Not selected' },
    { label: 'View state', value: (workspace.layout?.viewState || 'Dashboard') + (isBuiltViewState(workspace.layout?.viewState || 'Dashboard') ? ' · opens a real view' : ' · recorded only, no screen yet') },
    { label: 'Layout version', value: workspace.stored ? `Version ${workspace.version}${workspace.savedAt ? `, saved ${new Date(workspace.savedAt).toLocaleString()}` : ''}` : 'Nothing saved yet · default layout' },
    { label: 'Saved by', value: workspace.savedBy || 'Not recorded' },
    { label: 'Scope', value: 'Your own layout, inside your own business. Read and written by the workspace preferences service after an approved-account and role check.' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogTitle>Workspace context</DialogTitle>
        <DialogDescription>
          Properties, saved history and the connected registers for this workspace. Where a section is not connected, it says so instead of showing a figure.
        </DialogDescription>

        <section aria-label="Workspace properties">
          <h3 className="text-sm font-extrabold">Properties</h3>
          <dl className="mt-1 divide-y divide-border text-sm">
            {rows.map((row) => (
              <div key={row.label} className="grid gap-1 py-1.5 sm:grid-cols-[minmax(0,150px)_minmax(0,1fr)]">
                <dt className="font-bold">{row.label}</dt>
                <dd className="break-words">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-label="Current layout">
          <h3 className="text-sm font-extrabold">Current layout</h3>
          <p className="mt-1 text-sm">{describeLayout(workspace.layout)}</p>
          {workspace.note && <p className="text-xs italic">Last note: {workspace.note}</p>}
        </section>

        <section aria-label="Connected registers">
          <h3 className="text-sm font-extrabold">Context sections</h3>
          <p className="text-xs">These are separate registers. This panel reads none of them, so it shows no counts or statuses.</p>
          <ul className="mt-1 grid gap-1 sm:grid-cols-2">
            {CONNECTIONS.map((item) => (
              <li key={item.label} className="rounded-lg border border-border p-2 text-xs">
                <span className="font-bold">{item.label}</span>
                <span className="block">{item.note}</span>
                {item.to
                  ? <Link to={item.to} className="mt-1 inline-block font-bold text-[#0072FF]" onClick={() => onOpenChange(false)}>Open {item.label.toLowerCase()}</Link>
                  : <span className="mt-1 block font-semibold text-muted-foreground">Not connected</span>}
              </li>
            ))}
          </ul>
        </section>
      </DialogContent>
    </Dialog>
  );
}