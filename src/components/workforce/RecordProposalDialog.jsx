import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const blank = () => ({
  agent_id: '', tool_id: 'none', action_title: '', action_summary: '', input_source: '',
  input_refs: '', input_summary: '', output_summary: '', confidence: 70, rationale: '',
  idempotency_key: '', workflow_instance_id: '', notes: '',
});

/**
 * Records what an agent proposed. This is the governance record: the OS checks the agent's own tool
 * grant, redacts secrets and identifiers, then either permits a low-risk internal step or puts the
 * proposal in the human review queue.
 */
export default function RecordProposalDialog({ open, onOpenChange, agents = [], tools = [], busy, error, onSubmit } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => { if (open) setForm(blank()); }, [open]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const runnable = agents.filter((row) => row.status === 'Active');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Record an agent proposal</DialogTitle>
          <DialogDescription>
            This records what an agent produced so it can be governed. It does not call a model and it does not perform the action: the OS decides whether policy would permit it, and a person settles anything that matters.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {!runnable.length && <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">Activate an agent first. A paused or disabled agent cannot proceed with anything it produced.</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ai-dec-agent">Agent</Label>
            <Select value={form.agent_id} onValueChange={(agent_id) => set({ agent_id })}>
              <SelectTrigger id="ai-dec-agent"><SelectValue placeholder="Choose an active agent" /></SelectTrigger>
              <SelectContent>{runnable.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · {row.autonomy_level}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-dec-tool">Tool it used (optional)</Label>
            <Select value={form.tool_id} onValueChange={(tool_id) => set({ tool_id })}>
              <SelectTrigger id="ai-dec-tool"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No tool</SelectItem>
                {tools.filter((row) => row.status === 'Active').map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · {row.kind}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-dec-title">Proposed action</Label>
            <Input id="ai-dec-title" value={form.action_title} onChange={(e) => set({ action_title: e.target.value })} placeholder="Draft a corrective action for incident INC-1042" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-dec-action">What it proposes</Label>
            <Textarea id="ai-dec-action" rows={2} value={form.action_summary} onChange={(e) => set({ action_summary: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ai-dec-source">Input source</Label>
            <Input id="ai-dec-source" value={form.input_source} onChange={(e) => set({ input_source: e.target.value })} placeholder="/incidents" />
          </div>
          <div>
            <Label htmlFor="ai-dec-confidence">Confidence (%)</Label>
            <Input id="ai-dec-confidence" type="number" min={0} max={100} value={form.confidence} onChange={(e) => set({ confidence: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-dec-input">Input records</Label>
            <Textarea id="ai-dec-input" rows={2} value={form.input_refs} onChange={(e) => set({ input_refs: e.target.value })} placeholder="Incident:INC-1042&#10;Risk:RISK-22" />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">One provenance line per record, so the proposal can be traced back.</p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-dec-inputsummary">Input summary</Label>
            <Textarea id="ai-dec-inputsummary" rows={2} value={form.input_summary} onChange={(e) => set({ input_summary: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-dec-output">Output summary</Label>
            <Textarea id="ai-dec-output" rows={3} value={form.output_summary} onChange={(e) => set({ output_summary: e.target.value })} />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">Secrets and participant or staff identifiers are removed before this is stored.</p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-dec-rationale">Stated rationale</Label>
            <Textarea id="ai-dec-rationale" rows={2} value={form.rationale} onChange={(e) => set({ rationale: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ai-dec-key">Idempotency key</Label>
            <Input id="ai-dec-key" value={form.idempotency_key} onChange={(e) => set({ idempotency_key: e.target.value })} placeholder="Only needed for an internal step" />
          </div>
          <div>
            <Label htmlFor="ai-dec-run">Workflow run to correlate</Label>
            <Input id="ai-dec-run" value={form.workflow_instance_id} onChange={(e) => set({ workflow_instance_id: e.target.value })} placeholder="Optional run record id" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button
            disabled={busy || !form.agent_id || !form.action_title || !form.output_summary}
            onClick={() => onSubmit?.({
              ...form,
              tool_id: form.tool_id === 'none' ? '' : form.tool_id,
              confidence: Number(form.confidence),
              input_refs: form.input_refs.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => ({ ref: line })),
            })}
          >
            {busy ? 'Recording…' : 'Record and apply policy'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}