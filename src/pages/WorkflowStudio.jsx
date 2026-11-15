import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Network, RefreshCw, TimerReset } from 'lucide-react';
import ModuleShell from '@/components/module/ModuleShell';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { base44 } from '@/api/base44Client';
import { summariseInstances, INSTANCE_STATES, SLA_STATES } from '@/lib/workflowStudio';
import StudioCommandStrip from '@/components/workflows/studio/StudioCommandStrip';
import WorkflowLibrary from '@/components/workflows/studio/WorkflowLibrary';
import WorkflowDesigner from '@/components/workflows/studio/WorkflowDesigner';
import ExecutionMonitor from '@/components/workflows/studio/ExecutionMonitor';
import InstanceTimeline from '@/components/workflows/studio/InstanceTimeline';
import WorkflowAnalytics from '@/components/workflows/studio/WorkflowAnalytics';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { STUDIO_RELEASE_NOTICE, studioScopeKey } from '@/lib/workflowStudioSafety';

const OPEN_STATES = ['Running', 'Waiting', 'Escalated', 'Paused'];

function errorMessage(err) {
  return err?.response?.data?.error || err?.data?.error || err?.message || 'The workflow engine could not complete that.';
}

export default function WorkflowStudio() {
  const { user } = useAuth();
  return <WorkflowStudioView key={studioScopeKey(user)} />;
}

function WorkflowStudioView() {
  const [definitions, setDefinitions] = useState([]);
  const [instances, setInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('command');
  const [designingId, setDesigningId] = useState('');
  const [localDraft, setLocalDraft] = useState(null);
  const [truncated, setTruncated] = useState(false);
  const [startPreset, setStartPreset] = useState('');
  const [openInstance, setOpenInstance] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await base44.functions.invoke('workflowRuntime', { action: 'list' });
      if (!Array.isArray(res?.data?.definitions) || !Array.isArray(res?.data?.instances)) throw new Error('Workflow data is unavailable.');
      setTruncated(Boolean(res.data.truncated));
      setDefinitions(res.data.definitions);
      setInstances(res?.data?.instances || []);
      setError('');
    } catch (err) {
      setDefinitions([]);
      setInstances([]);
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const call = useCallback(async (payload) => {
    if (payload.action !== 'list') { setError(STUDIO_RELEASE_NOTICE); return null; }
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('workflowRuntime', payload);
      if (res?.data?.error) {
        setError(res.data.error);
        return null;
      }
      await load();
      return res?.data || null;
    } catch (err) {
      setDefinitions([]);
      setInstances([]);
      setError(errorMessage(err));
      return null;
    } finally {
      setBusy(false);
    }
  }, [load]);

  const summary = useMemo(() => summariseInstances(instances), [instances]);
  const designing = localDraft || definitions.find((item) => item.id === designingId) || null;
  const recent = useMemo(
    () => [...instances]
      .filter((row) => OPEN_STATES.includes(row.state))
      .sort((a, b) => String(a.due_at).localeCompare(String(b.due_at)))
      .slice(0, 6),
    [instances]
  );

  const createDefinition = async (template) => {
    const data = { definition: {
      id: `local-${template.code}`, state: 'Draft', version: 0, code: template.code,
      name: template.name,
      workflow_type: template.workflow_type,
      domain: template.domain,
      description: template.description,
      nodes_json: JSON.stringify(template.nodes),
      sla_hours: template.sla_hours,
      owner_role: template.owner_role,
      standard_refs: template.standards,
      evidence_refs: template.evidence,
      template_code: template.code,
    } };
    setLocalDraft(data.definition);
    if (data?.definition) {
      setDesigningId(data.definition.id);
      setTab('designer');
    }
  };

  const saveDefinition = async (definition, nodes) => {
    setLocalDraft({ ...definition, id: `local-${definition.template_code || definition.id}`, state: 'Draft', nodes_json: JSON.stringify(nodes) });
  };

  const publishDefinition = async (definition, nodes) => {
    if (nodes) {
      const saved = await call({ action: 'save', definition_id: definition.id, nodes_json: JSON.stringify(nodes) });
      if (!saved) return;
    }
    await call({ action: 'publish', definition_id: definition.id });
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <ModuleShell
        moduleKey="compliance"
        title="Workflow Studio"
        subtitle="Phase 11 design workspace: explore templates, edit local draft graphs and test routing without operational side effects."
        icon={Network}
      />

      <p role="status" className="rounded-xl border border-border bg-card p-3 text-sm text-primary">{STUDIO_RELEASE_NOTICE}</p>
      {truncated && <p role="status">Showing a bounded sample: up to 200 definitions and 300 runs. Totals describe this sample only.</p>}
      {error && (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#FF2E9A] bg-white p-3 text-sm font-semibold text-primary">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={load}>Refresh</Button>
        </div>
      )}

      {loading && !definitions.length && !instances.length ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto flex-wrap gap-1.5">
            <TabsTrigger value="command">Command</TabsTrigger>
            <TabsTrigger value="library">Workflow library</TabsTrigger>
            <TabsTrigger value="designer">Designer</TabsTrigger>
            <TabsTrigger value="executions">Executions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="command" className="mt-4 space-y-3">
            <StudioCommandStrip summary={summary} />
            <div className="grid gap-3 lg:grid-cols-2">
              <section className="overflow-hidden rounded-xl border border-border bg-card shadow-2xs">
                <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
                  <div>
                    <h2 className="text-sm font-extrabold text-foreground">Needs attention</h2>
                    <p className="text-xs text-muted-foreground">Open runs by nearest due time.</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setTab('executions')}>All runs</Button>
                </div>
                <ul className="divide-y divide-border">
                  {recent.map((row) => (
                    <li key={row.id}>
                      <button
                        type="button"
                        onClick={() => setOpenInstance(row)}
                        className="flex w-full items-start justify-between gap-2 px-4 py-2.5 text-left hover:bg-muted/60"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold text-foreground">{row.definition_name}</span>
                          <span className="block truncate text-[11px] font-medium text-muted-foreground">
                            {row.current_node_label} · {row.task_role || 'no role'} · {row.context_label || 'no reference'}
                          </span>
                        </span>
                        <span className="flex shrink-0 flex-col items-end gap-1">
                          <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', INSTANCE_STATES[row.state])}>{row.state}</span>
                          <span className={cn('rounded-full border px-2 py-0.5 text-[11px] font-bold', SLA_STATES[row.sla_state] || SLA_STATES['On track'])}>
                            {row.sla_state || 'On track'}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                  {!recent.length && (
                    <li className="px-4 py-10 text-center text-sm text-muted-foreground">
                      No open runs. Add a template in the library to get started.
                    </li>
                  )}
                </ul>
              </section>

              <section className="rounded-xl border border-border bg-card p-4 shadow-2xs">
                <h2 className="text-sm font-extrabold text-foreground">Engine checks</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  SLA calculation, reminders and escalation delivery require verified runtime adapters. No background sweep or notification service is enabled by this workspace.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled title="Operational engine not enabled" onClick={() => call({ action: 'scanSla' })}>
                    <TimerReset className="mr-1.5 h-4 w-4" /> Re-check SLA clocks
                  </Button>
                  <Button size="sm" variant="outline" onClick={load}>
                    <RefreshCw className="mr-1.5 h-4 w-4" /> Refresh
                  </Button>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-semibold">
                  <div><dt className="text-muted-foreground">Definitions</dt><dd className="text-foreground">{definitions.length}</dd></div>
                  <div><dt className="text-muted-foreground">Published</dt><dd className="text-foreground">{definitions.filter((item) => item.state === 'Published').length}</dd></div>
                  <div><dt className="text-muted-foreground">Total runs</dt><dd className="text-foreground">{summary.total}</dd></div>
                  <div><dt className="text-muted-foreground">Failed runs</dt><dd className="text-foreground">{summary.failed}</dd></div>
                </dl>
              </section>
            </div>
            <p className="text-xs text-primary">
              Stored runs are shown for review. Immutable event storage, verified evidence links and version-pinned execution remain release requirements.
            </p>
          </TabsContent>

          <TabsContent value="library" className="mt-4">
            <WorkflowLibrary
              definitions={definitions}
              busy={busy}
              onCreate={createDefinition}
              onOpen={(definition) => { setLocalDraft(null); setDesigningId(definition.id); setTab('designer'); }}
              onClone={(definition) => call({ action: 'clone', definition_id: definition.id })}
              onPublish={(definition) => publishDefinition(definition)}
              onArchive={(definition) => call({ action: 'archive', definition_id: definition.id })}
              onStart={(definition) => { setStartPreset(definition.id); setTab('executions'); }}
            />
          </TabsContent>

          <TabsContent value="designer" className="mt-4">
            <WorkflowDesigner
              definition={designing}
              busy={busy}
              onSave={saveDefinition}
              onPublish={publishDefinition}
            />
          </TabsContent>

          <TabsContent value="executions" className="mt-4">
            <ExecutionMonitor
              instances={instances}
              definitions={definitions}
              busy={true}
              presetDefinitionId={startPreset}
              onStart={(definitionId, contextLabel) => call({ action: 'start', definition_id: definitionId, context_label: contextLabel })}
              onAct={(instanceId, decision, note) => call({ action: 'act', instance_id: instanceId, decision, note })}
              onEscalate={(instanceId, reason) => call({ action: 'escalate', instance_id: instanceId, reason })}
              onOpen={setOpenInstance}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            <WorkflowAnalytics instances={instances} />
          </TabsContent>
        </Tabs>
      )}

      <InstanceTimeline instance={openInstance} onClose={() => setOpenInstance(null)} />
    </div>
  );
}