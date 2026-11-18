import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const KINDS = ['Route to workflow', 'Record only', 'Stop'];

/** Ordered steps. Only the step kinds the fabric can genuinely perform are offered. */
export default function StepsEditor({ value = [], onChange, workflows = [] } = {}) {
  const update = (index, patch) => onChange(value.map((step, i) => (i === index ? { ...step, ...patch } : step)));
  return (
    <div className="space-y-2">
      {value.map((step, index) => (
        <div key={index} className="rounded-lg border border-slate-200 bg-slate-50/60 p-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[160px_1fr_auto]">
            <Select
              value={step.kind || 'Route to workflow'}
              onValueChange={(kind) => update(index, { kind, workflow_definition_id: kind === 'Route to workflow' ? step.workflow_definition_id : '' })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{KINDS.map((kind) => <SelectItem key={kind} value={kind}>{kind}</SelectItem>)}</SelectContent>
            </Select>
            {step.kind === 'Route to workflow' ? (
              <Select
                value={step.workflow_definition_id || ''}
                onValueChange={(id) => {
                  const target = workflows.find((row) => row.id === id);
                  update(index, { workflow_definition_id: id, workflow_definition_name: target?.name || '' });
                }}
              >
                <SelectTrigger><SelectValue placeholder="Published workflow" /></SelectTrigger>
                <SelectContent>
                  {workflows.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · v{row.version}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input value={step.note || ''} placeholder="What this step means, in words" onChange={(event) => update(index, { note: event.target.value })} />
            )}
            <Button type="button" size="icon" variant="ghost" onClick={() => onChange(value.filter((_, i) => i !== index))}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => onChange([...value, { kind: 'Route to workflow', workflow_definition_id: '', workflow_definition_name: '', note: '' }])}
      >
        <Plus className="h-3.5 w-3.5" /> Add step
      </Button>
      <p className="text-[11px] text-[#0A2B6D]/60">
        A flow needs at least one step that routes to a workflow or records the event. Waits, AI calls and HTTP requests are not offered because this fabric cannot perform them.
      </p>
    </div>
  );
}