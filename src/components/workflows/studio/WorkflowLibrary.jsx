import React from 'react';
import { Archive, Copy, FilePlus2, PencilRuler, Play, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WORKFLOW_TEMPLATES } from '@/lib/workflowStudio';
import { cn } from '@/lib/utils';

const STATE_TONES = {
  Draft: 'border-border bg-muted text-muted-foreground',
  Validated: 'border-brand/40 bg-brand/10 text-brand',
  Published: 'border-safe/40 bg-safe/10 text-safe',
  Archived: 'border-border bg-muted text-muted-foreground',
};

export default function WorkflowLibrary({ definitions = [], busy = false, onCreate, onOpen, onClone, onPublish, onArchive, onStart }) {
  return (
    <div className="space-y-3">
      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-extrabold text-foreground">Start from an enterprise template</h2>
          <p className="text-xs text-muted-foreground">
            Illustrative draft graphs. Standards, evidence references, roles and timing require review before operational use.
          </p>
        </div>
        <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
          {WORKFLOW_TEMPLATES.map((template) => (
            <article key={template.code} className="flex flex-col justify-between rounded-lg border border-border p-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wide text-brand">{template.code}</span>
                  <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[11px] font-bold text-foreground">
                    {template.domain}
                  </span>
                </div>
                <h3 className="mt-1 text-sm font-bold text-foreground">{template.name}</h3>
                <p className="mt-1 text-[11px] font-medium leading-snug text-muted-foreground">{template.description}</p>
                <p className="mt-2 text-[11px] font-semibold text-muted-foreground">
                  {template.nodes.length} nodes · {template.sla_hours}h example target · {template.owner_role}
                </p>
              </div>
              <Button size="sm" className="mt-2" disabled={busy} onClick={() => onCreate?.(template)}>
                <FilePlus2 className="mr-1.5 h-4 w-4" /> Create draft from template
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-extrabold text-foreground">My workflows</h2>
            <p className="text-xs text-muted-foreground">Draft, validate and publish a workflow, or start a published one. Published versions are immutable; clone to revise.</p>
          </div>
          <span className="text-[11px] font-bold text-muted-foreground">{definitions.length} definition(s)</span>
        </div>
        <div className="divide-y divide-border">
          {definitions.map((definition) => (
            <div key={definition.id} className="flex flex-col gap-2 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-brand">{definition.code}</span>
                  <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', STATE_TONES[definition.state] || STATE_TONES.Draft)}>
                    {definition.state} · v{definition.version || 1}
                  </span>
                  <span className="text-[11px] font-semibold text-muted-foreground">{definition.domain}</span>
                </div>
                <h3 className="mt-0.5 truncate text-sm font-bold text-foreground">{definition.name}</h3>
                <p className="text-[11px] font-medium text-muted-foreground">
                  {definition.workflow_type} · owner {definition.owner_role || 'unassigned'} · {definition.sla_hours || 72}h target
                  {definition.content_hash ? ` · graph ${definition.content_hash.slice(-8)}` : ''}
                  {definition.publisher_independent === false && definition.state === 'Published' ? ' · self-published' : ''}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <Button size="sm" variant="outline" onClick={() => onOpen?.(definition)}>
                  <PencilRuler className="mr-1.5 h-4 w-4" /> Design
                </Button>
                <Button size="sm" variant="outline" disabled={busy} onClick={() => onClone?.(definition)}>
                  <Copy className="mr-1.5 h-4 w-4" /> Clone
                </Button>
                {definition.state !== 'Published' && definition.state !== 'Archived' && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy || !(definition.validated_hash && definition.validated_hash === definition.content_hash)}
                    title={definition.validated_hash === definition.content_hash ? 'Publish the validated version' : 'Validate this graph in the designer first'}
                    onClick={() => onPublish?.(definition)}
                  >
                    <Upload className="mr-1.5 h-4 w-4" /> Publish
                  </Button>
                )}
                {definition.state === 'Published' && (
                  <Button size="sm" disabled={busy} onClick={() => onStart?.(definition)}>
                    <Play className="mr-1.5 h-4 w-4" /> Start run
                  </Button>
                )}
                {definition.state !== 'Archived' && (
                  <Button size="sm" variant="ghost" disabled={busy} onClick={() => onArchive?.(definition)}>
                    <Archive className="mr-1.5 h-4 w-4" /> Archive
                  </Button>
                )}
              </div>
            </div>
          ))}
          {!definitions.length && (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No workflows yet. Add a template above to create your first one.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}