import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, Network, RefreshCw } from 'lucide-react';
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
const CARRIED_FIELDS = ['code', 'name', 'workflow_type', 'domain', 'description', 'sla_hours', 'owner_role', 'standard_refs', 'evidence_refs', 'template_code'];

function errorMessage(err) {
  return err?.response?.data?.error || err?.data?.error || err?.message || 'The workflow engine could not complete that.';
}

function commandKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function fieldsOf(source) {
  return Object.fromEntries(CARRIED_FIELDS.map((key) => [key, source?.[key] ?? '']));
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
      setInstances(res.data.instances);
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
    setBusy(true);
    setError('');
    try {
      const res = await base44.functions.invoke('workflowRuntime', payload);
      const data = res?.data || {};
      if (data.error) {
        setError(data.error);
        return null;
      }
      await load();
      return data;
    } catch (err) {
      setError(errorMessage(err));
      return null;
    } finally {
      setBusy(false);
    }
  }, [load]);

  const summary = useMemo(() => summariseInstances(instances), [instances]);
  const designing = definitions.find((item) => item.id === designingId) || null;
  const recent = useMemo(
    () => [...instances]
      .filter((row) => OPEN_STATES.includes(row.state))
      .sort((a, b) => String(a.due_at).localeCompare(String(b.due_at)))
      .slice(0, 6),
    [instances]
  );

  const createDefinition = async (template) => {
    const created = await call({
      action: 'save',
      ...fieldsOf(template),
      code: template.code,
      template_code: template.code,
      standard_refs: template.standards,
      evidence_refs: template.evidence,
      nodes_json: JSON.stringify(template.nodes),
    });
    if (created?.definition?.id) {
      setDesigningId(created.definition.id);
      setTab('designer');
    }
  };

  const saveDefinition = async (definition, nodes) => {
    if (!definition?.id) return;
    await call({ action: 'save', definition_id: definition.id, ...fieldsOf(definition), nodes_json: JSON.stringify(nodes) });
  };

  const validateDefinition = async (definition, nodes) => {
    if (!definition?.id) return;
    const saved = await call({ action: 'save', definition_id: definition.id, ...fieldsOf(definition), nodes_json: JSON.stringify(nodes) });
    if (!saved) return;
    const result = await call({ action: 'validate', definition_id: definition.id });
    if (!result) return;
    const firstIssue = result.report?.errors?.[0] || (result.unsupported?.length
      ? `These step types have no verified runtime handler: ${result.unsupported.join(', ')}.`
      : '');
    if (result.definition?.state !== 'Validated' && firstIssue) setError(firstIssue);
  };

  const publishDefinition = async (definition, nodes, publicationNote) => {
    if (!definition?.id) return;
    const saved = await call({ action: 'save', definition_id: definition.id, ...fieldsOf(definition), nodes_json: JSON.stringify(nodes) });
    if (!saved) return;
    const validated = await call({ action: 'validate', definition_id: definition.id });
    if (!validated || validated.definition?.state !== 'Validated') return;
    await call({ action: 'publish', definition_id: definition.id, publication_note: publicationNote || '' });
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-4">
      <ModuleShell
        moduleKey="compliance"
        title="Workflow Studio"
        subtitle="Author, validate and publish governed workflows, then run them through their steps with a recorded version and an append-only trail."
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
            {error ? <p role="status">Workflow record data is unavailable. Counts and analytics cannot be assessed.</p> : <>
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
                            {row.current_node_label} · {row.task_role || 'no role'} · v{row.definition_version || 1}
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
                <h2 className="text-sm font-extrabold text-foreground">Engine status</h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Runs advance one step at a time, each pinned to the published version it started on. Each decision is
                  recorded against the person and role that made it.
                </p>
                <ul className="mt-2 space-y-1 text-[11px] font-semibold text-muted-foreground">
                  <li>Live: drafts, validation, versioned publication, task, approval, evidence validation, decision, escalation.</li>
                  <li>Not available: timed SLA sweep, notification delivery, AI steps, webhooks, sub-workflows and external adapters.</li>
                  <li>Clocks are calculated when a run is read, so a breach is reported but no reminder is sent.</li>
                </ul>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" disabled={busy} onClick={load}>
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
              Every transition is written to an append-only event log. Persistence is not transactional across records, so a
              write that cannot be audited is rolled back and refused rather than reported as done.
            </p>
            </>}
          </TabsContent>

          <TabsContent value="library" className="mt-4">
            <WorkflowLibrary
              definitions={definitions}
              busy={busy}
              onCreate={createDefinition}
              onOpen={(definition) => { setDesigningId(definition.id); setTab('designer'); }}
              onClone={(definition) => call({ action: 'clone', definition_id: definition.id })}
              onPublish={(definition) => publishDefinition(definition, JSON.parse(definition.nodes_json || '[]'), '')}
              onArchive={(definition) => call({ action: 'archive', definition_id: definition.id })}
              onStart={(definition) => { setStartPreset(definition.id); setTab('executions'); }}
            />
          </TabsContent>

          <TabsContent value="designer" className="mt-4">
            <WorkflowDesigner
              definition={designing}
              busy={busy}
              onSave={saveDefinition}
              onValidate={validateDefinition}
              onPublish={publishDefinition}
            />
          </TabsContent>

          <TabsContent value="executions" className="mt-4">
            <ExecutionMonitor
              instances={instances}
              definitions={definitions}
              busy={busy}
              presetDefinitionId={startPreset}
              onStart={(definitionId) => call({ action: 'start', definition_id: definitionId, command_key: commandKey() })}
              onAct={(instanceId, decision, note, expectedNodeId) => call({ action: 'act', instance_id: instanceId, decision, note, expected_node_id: expectedNodeId, command_key: commandKey() })}
              onEscalate={(instanceId, reason) => call({ action: 'escalate', instance_id: instanceId, reason, command_key: commandKey() })}
              onOpen={setOpenInstance}
            />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4">
            {error ? <p>Workflow analytics are unavailable.</p> : <WorkflowAnalytics instances={instances} />}
          </TabsContent>
        </Tabs>
      )}

      <InstanceTimeline instance={openInstance} onClose={() => setOpenInstance(null)} />
    </div>
  );
}