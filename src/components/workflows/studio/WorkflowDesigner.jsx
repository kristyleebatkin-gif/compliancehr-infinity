import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Plus, Save, Trash2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NODE_CATEGORIES, NODE_LIBRARY, NODE_META, graphFromJson, validateWorkflow } from '@/lib/workflowStudio';
import { cn } from '@/lib/utils';
import { simulateWorkflow } from '@/lib/workflowStudioSafety';

export default function WorkflowDesigner({ definition, busy = false, onSave, onValidate, onPublish }) {
  const [nodes, setNodes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [category, setCategory] = useState('Core');
  const [decisions, setDecisions] = useState({});
  const [simulation, setSimulation] = useState(null);
  const [note, setNote] = useState('');
  useEffect(() => { setSimulation(null); setDecisions({}); }, [nodes]);

  useEffect(() => {
    setNodes(graphFromJson(definition?.nodes_json));
    setSelectedId(graphFromJson(definition?.nodes_json)[0]?.id || '');
  }, [definition?.id, definition?.nodes_json]);

  const validation = useMemo(() => validateWorkflow(nodes), [nodes]);
  const selected = nodes.find((item) => item.id === selectedId) || null;
  const savedGraph = useMemo(() => JSON.stringify(graphFromJson(definition?.nodes_json)), [definition?.nodes_json]);
  const dirty = useMemo(() => JSON.stringify(nodes) !== savedGraph, [nodes, savedGraph]);
  const locked = definition?.state === 'Published' || definition?.state === 'Archived';
  const validated = Boolean(definition?.validated_hash) && definition.validated_hash === definition.content_hash;
  const canPublish = Boolean(validated && !dirty && !locked);

  const updateNode = (id, changes) => setNodes((list) => list.map((item) => (item.id === id ? { ...item, ...changes } : item)));

  const addNode = (type) => {
    const id = `n${Date.now().toString(36)}`;
    const meta = NODE_META[type];
    setNodes((list) => {
      const next = [...list, { id, type, label: meta?.label || 'New step', role: '', next: '', yes_next: '', no_next: '', sla_hours: 0, instruction: '' }];
      const last = list[list.length - 1];
      if (last && last.type !== 'END' && !last.next) {
        const index = next.findIndex((item) => item.id === last.id);
        next[index] = { ...next[index], next: id };
      }
      return next;
    });
    setSelectedId(id);
  };

  const removeNode = (id) => {
    setNodes((list) => list.filter((item) => item.id !== id).map((item) => ({
      ...item,
      next: item.next === id ? '' : item.next,
      yes_next: item.yes_next === id ? '' : item.yes_next,
      no_next: item.no_next === id ? '' : item.no_next,
    })));
    setSelectedId('');
  };

  if (!definition) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground shadow-2xs">
        Choose a workflow in the library and press Design to open it here.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-card p-3">
        <div>
          <h2 className="text-sm font-extrabold text-foreground">{definition.name}</h2>
          <p className="text-xs text-muted-foreground">
            {definition.code} · {definition.state} v{definition.version || 0} · {nodes.length} nodes
            {definition.content_hash ? ` · graph ${definition.content_hash.slice(-8)}` : ''}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
            <span className={cn('rounded-full border px-2 py-0.5', validated ? 'border-safe/40 bg-safe/10 text-safe' : 'border-warning/50 bg-warning/15 text-warning')}>
              {validated ? 'Validated' : 'Not validated'}
            </span>
            {dirty && <span className="rounded-full border border-brand/40 bg-brand/10 px-2 py-0.5 text-brand">Unsaved changes</span>}
            {definition.publisher_independent === false && definition.state === 'Published' && (
              <span className="rounded-full border border-warning/50 bg-warning/15 px-2 py-0.5 text-warning">Self-published</span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant="outline" disabled={busy || locked || !dirty} onClick={() => onSave?.(definition, nodes)}>
            <Save className="mr-1.5 h-4 w-4" /> Save draft
          </Button>
          <Button size="sm" variant="outline" disabled={busy || locked} onClick={() => onValidate?.(definition, nodes)}>
            <CheckCircle2 className="mr-1.5 h-4 w-4" /> Validate
          </Button>
          <Button
            size="sm"
            disabled={busy || !canPublish}
            title={canPublish ? 'Publish this exact validated graph as an immutable version' : 'Save, then validate this exact graph before publishing'}
            onClick={() => onPublish?.(definition, nodes, note)}
          >
            <Upload className="mr-1.5 h-4 w-4" /> Publish
          </Button>
        </div>
      </div>

      {locked ? (
        <p role="status" className="rounded-xl border border-border bg-card p-3 text-xs font-semibold text-muted-foreground">
          This workflow is {definition.state.toLowerCase()}. A published version never changes, so clone it from the library to author a revision.
        </p>
      ) : (
        <label className="block rounded-xl border border-border bg-card p-3 text-[11px] font-bold text-foreground">
          Publication note (required when you authored this graph)
          <Input
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Why this version is being published, and under whose authority"
            className="mt-1"
          />
        </label>
      )}

      <section className="rounded-xl border border-border bg-card p-3 space-y-2" aria-label="Routing simulation">
        <h3 className="font-bold">Routing simulation</h3>
        <p className="text-xs">Hypothetical traversal only. Human steps are assumed complete; no tasks, approvals, uploads, AI calls or notifications are created. Adapter nodes stop the simulation.</p>
        {nodes.filter(n => n.type === 'DECISION').map(n => <label className="block text-sm" key={n.id}>
          {n.label}
          <select aria-label={n.label} value={decisions[n.id] || ''} onChange={e => { setSimulation(null); setDecisions(d => ({ ...d, [n.id]: e.target.value })); }} className="ml-2 border rounded p-1">
            <option value="">Choose branch</option><option value="approve">Approve / Yes</option><option value="reject">Reject / No</option>
          </select>
        </label>)}
        <Button size="sm" variant="outline" disabled={!validation.valid} onClick={() => setSimulation(simulateWorkflow(nodes, decisions))}>Simulate routing</Button>
        {simulation && <div role="status"><p>{simulation.status}</p><ol className="list-decimal pl-5">{simulation.steps.map((s, i) => <li key={i}>{s.label} ({s.type})</li>)}</ol></div>}
      </section>
      <div className="grid gap-3 lg:grid-cols-[240px_1fr_300px]">
        <section className="rounded-xl border border-border bg-card p-3 shadow-2xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Node palette</h3>
          <div className="mt-2 flex flex-wrap gap-1">
            {NODE_CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[11px] font-bold',
                  category === item ? 'border-brand bg-brand/10 text-brand' : 'border-border text-muted-foreground'
                )}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="mt-2 space-y-1">
            {NODE_LIBRARY.filter((item) => item.category === category).map((item) => (
              <button
                key={item.type}
                type="button"
                onClick={() => addNode(item.type)}
                className="flex w-full items-start gap-2 rounded-lg border border-border p-2 text-left hover:bg-muted/60"
              >
                <Plus className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                <span className="min-w-0">
                  <span className="block text-xs font-bold text-foreground">{item.label}</span>
                  <span className="block text-[11px] font-medium leading-snug text-muted-foreground">{item.description}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-card p-3 shadow-2xs">
          <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Flow</h3>
          <ol className="mt-2 space-y-1.5">
            {nodes.map((item, index) => {
              const meta = NODE_META[item.type];
              const target = item.type === 'DECISION'
                ? `${item.yes_next || '—'} / ${item.no_next || '—'}`
                : item.next || '—';
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'flex w-full items-center gap-2 rounded-lg border p-2 text-left',
                      selectedId === item.id ? 'border-brand bg-brand/10' : 'border-border hover:bg-muted/60'
                    )}
                  >
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-card text-[11px] font-bold text-foreground">
                      {index + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-bold text-foreground">{item.label}</span>
                      <span className="block truncate text-[11px] font-medium text-muted-foreground">
                        {meta?.label || item.type} · {item.role || 'unassigned'} · next {target}
                      </span>
                    </span>
                    <span className={cn('rounded-full border px-1.5 py-0.5 text-[10px] font-bold', meta?.human ? 'border-warning/50 bg-warning/15 text-warning' : 'border-border bg-muted text-muted-foreground')}>
                      {meta?.human ? 'Person' : 'Adapter required'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </section>

        <div className="space-y-3">
          <section className="rounded-xl border border-border bg-card p-3 shadow-2xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Properties</h3>
            {selected ? (
              <div className="mt-2 space-y-2">
                <label className="block text-[11px] font-bold text-foreground">
                  Step name
                  <Input value={selected.label} onChange={(event) => updateNode(selected.id, { label: event.target.value })} className="mt-1" />
                </label>
                <label className="block text-[11px] font-bold text-foreground">
                  Owner role
                  <Input
                    value={selected.role}
                    onChange={(event) => updateNode(selected.id, { role: event.target.value })}
                    placeholder="Compliance Manager"
                    className="mt-1"
                  />
                </label>
                <label className="block text-[11px] font-bold text-foreground">
                  Step SLA (hours)
                  <Input
                    type="number"
                    value={selected.sla_hours || ''}
                    onChange={(event) => updateNode(selected.id, { sla_hours: Number(event.target.value) || 0 })}
                    className="mt-1"
                  />
                </label>
                {selected.type === 'DECISION' ? (
                  <>
                    <label className="block text-[11px] font-bold text-foreground">
                      Approve goes to
                      <select
                        value={selected.yes_next || ''}
                        onChange={(event) => updateNode(selected.id, { yes_next: event.target.value })}
                        className="mt-1 h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                      >
                        <option value="">Not set</option>
                        {nodes.filter((item) => item.id !== selected.id).map((item) => (
                          <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-[11px] font-bold text-foreground">
                      Reject goes to
                      <select
                        value={selected.no_next || ''}
                        onChange={(event) => updateNode(selected.id, { no_next: event.target.value })}
                        className="mt-1 h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                      >
                        <option value="">Not set</option>
                        {nodes.filter((item) => item.id !== selected.id).map((item) => (
                          <option key={item.id} value={item.id}>{item.label}</option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : (
                  <label className="block text-[11px] font-bold text-foreground">
                    Next step
                    <select
                      value={selected.next || ''}
                      onChange={(event) => updateNode(selected.id, { next: event.target.value })}
                      className="mt-1 h-9 w-full rounded-md border border-input bg-card px-2 text-sm"
                    >
                      <option value="">Not set</option>
                      {nodes.filter((item) => item.id !== selected.id).map((item) => (
                        <option key={item.id} value={item.id}>{item.label}</option>
                      ))}
                    </select>
                  </label>
                )}
                <Button size="sm" variant="outline" onClick={() => removeNode(selected.id)}>
                  <Trash2 className="mr-1.5 h-4 w-4" /> Remove step
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">Select a step in the flow to configure it.</p>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-3 shadow-2xs">
            <h3 className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Validation</h3>
            {validation.valid && !validation.warnings.length && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-safe">
                <CheckCircle2 className="h-4 w-4" /> Graph structure checked. Save and validate to make this graph publishable.
              </p>
            )}
            <ul className="mt-2 space-y-1">
              {validation.errors.map((error) => (
                <li key={error} className="flex items-start gap-1.5 text-[11px] font-semibold text-danger">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
                </li>
              ))}
              {validation.warnings.map((warning) => (
                <li key={warning} className="flex items-start gap-1.5 text-[11px] font-semibold text-warning">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {warning}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}