import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const blank = () => ({
  name: '', purpose: '', description: '', model_id: '', prompt_id: '',
  autonomy_level: 'Suggest only', risk_tier: 'Low', data_scope: '', owner_role: '', review_due: '', notes: '',
});

/** An agent pins one validated model and one published prompt version. */
export default function AgentDialog({ open, onOpenChange, agent, models = [], prompts = [], meta = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);
  const active = agent?.status === 'Active';

  useEffect(() => {
    if (!open) return;
    if (!agent) { setForm(blank()); return; }
    setForm({
      name: agent.name || '', purpose: agent.purpose || '', description: agent.description || '',
      model_id: agent.model_id || '', prompt_id: agent.prompt_id || '',
      autonomy_level: agent.autonomy_level || 'Suggest only', risk_tier: agent.risk_tier || 'Low',
      data_scope: agent.data_scope || '', owner_role: agent.owner_role || '',
      review_due: agent.review_due || '', notes: agent.notes || '',
    });
  }, [open, agent]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const validatedModels = models.filter((row) => row.status === 'Validated');
  const publishedPrompts = prompts.filter((row) => row.status === 'Published');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{agent ? `Edit ${agent.name}` : 'Register an agent'}</DialogTitle>
          <DialogDescription>
            An agent runs only on a validated model and a published prompt version, and it keeps the exact version it was activated on. {active ? 'It is active, so its model and prompt cannot be repointed until it is paused.' : ''}
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {!validatedModels.length && <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">Register and validate a model before an agent can run.</p>}
        {!publishedPrompts.length && <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-900">Publish a prompt version before an agent can run.</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ai-agent-name">Agent name</Label>
            <Input id="ai-agent-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Incident triage assistant" />
          </div>
          <div>
            <Label htmlFor="ai-agent-purpose">Purpose</Label>
            <Input id="ai-agent-purpose" value={form.purpose} onChange={(e) => set({ purpose: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ai-agent-model">Model</Label>
            <Select value={form.model_id} onValueChange={(model_id) => set({ model_id })} disabled={active}>
              <SelectTrigger id="ai-agent-model"><SelectValue placeholder="Choose a validated model" /></SelectTrigger>
              <SelectContent>{validatedModels.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · {row.provider}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-agent-prompt">Prompt version</Label>
            <Select value={form.prompt_id} onValueChange={(prompt_id) => set({ prompt_id })} disabled={active}>
              <SelectTrigger id="ai-agent-prompt"><SelectValue placeholder="Choose a published prompt" /></SelectTrigger>
              <SelectContent>{publishedPrompts.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} v{row.version}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-agent-autonomy">Autonomy</Label>
            <Select value={form.autonomy_level} onValueChange={(autonomy_level) => set({ autonomy_level })}>
              <SelectTrigger id="ai-agent-autonomy"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.autonomyLevels || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">Even with internal autonomy, external, financial, employment, clinical, participant-impacting, permission-changing, destructive and compliance-status-changing actions always need a person.</p>
          </div>
          <div>
            <Label htmlFor="ai-agent-risk">Risk tier</Label>
            <Select value={form.risk_tier} onValueChange={(risk_tier) => set({ risk_tier })}>
              <SelectTrigger id="ai-agent-risk"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.riskTiers || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-agent-scope">Data scope</Label>
            <Input id="ai-agent-scope" value={form.data_scope} onChange={(e) => set({ data_scope: e.target.value })} placeholder="Incident and risk registers for this business only" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-agent-description">What it does</Label>
            <Textarea id="ai-agent-description" rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ai-agent-owner">Process owner</Label>
            <Input id="ai-agent-owner" value={form.owner_role} onChange={(e) => set({ owner_role: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ai-agent-review">Governance review due</Label>
            <Input id="ai-agent-review" type="date" value={form.review_due} onChange={(e) => set({ review_due: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy || !form.model_id || !form.prompt_id} onClick={() => onSave?.({ ...form, ...(agent ? { agent_id: agent.id } : {}) })}>
            {busy ? 'Saving…' : agent ? 'Save agent' : 'Register agent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}