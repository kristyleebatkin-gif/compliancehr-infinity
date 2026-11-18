import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const blank = () => ({ agent_id: '', tool_id: '', policy: 'Propose only', least_privilege_note: '', rate_limit_per_run: 1, review_due: '', notes: '' });

/** One agent, one tool, one written policy. This is the only place autonomy can be granted. */
export default function PolicyDialog({ open, onOpenChange, assignment, agents = [], tools = [], busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!assignment) { setForm(blank()); return; }
    setForm({
      agent_id: assignment.agent_id || '', tool_id: assignment.tool_id || '', policy: assignment.policy || 'Propose only',
      least_privilege_note: assignment.least_privilege_note || '', rate_limit_per_run: assignment.rate_limit_per_run || 1,
      review_due: assignment.review_due || '', notes: assignment.notes || '',
    });
  }, [open, assignment]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const tool = tools.find((row) => row.id === form.tool_id);
  const eligible = Boolean(tool && ['Read internal record', 'Write internal record'].includes(tool.kind));
  const canGoInternal = eligible && Boolean(tool?.idempotency_supported);
  const policies = ['Denied', 'Propose only', 'Allowed with approval', ...(canGoInternal ? ['Allowed internal'] : [])];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{assignment ? `Grant ${assignment.tool_name}` : 'Grant a tool to an agent'}</DialogTitle>
          <DialogDescription>
            Nothing is granted by default. A grant names the tool, the policy and why the agent needs it. Only a low-risk internal tool that supports idempotency can ever be granted internal autonomy.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ai-grant-agent">Agent</Label>
            <Select value={form.agent_id} onValueChange={(agent_id) => set({ agent_id })}>
              <SelectTrigger id="ai-grant-agent"><SelectValue placeholder="Choose an agent" /></SelectTrigger>
              <SelectContent>{agents.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · {row.agent_key}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-grant-tool">Tool</Label>
            <Select value={form.tool_id} onValueChange={(tool_id) => set({ tool_id })}>
              <SelectTrigger id="ai-grant-tool"><SelectValue placeholder="Choose a tool" /></SelectTrigger>
              <SelectContent>{tools.filter((row) => row.status === 'Active').map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · {row.kind}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {tool && (
            <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-[#0A2B6D]">
              {canGoInternal
                ? `${tool.kind} is internal and supports idempotency, so an explicit internal grant is possible. Anything else stays with a person.`
                : `${tool.kind} cannot be granted internal autonomy. The most that can be granted is a proposal or an approval step.`}
            </div>
          )}
          <div>
            <Label htmlFor="ai-grant-policy">Policy</Label>
            <Select value={form.policy} onValueChange={(policy) => set({ policy })}>
              <SelectTrigger id="ai-grant-policy"><SelectValue /></SelectTrigger>
              <SelectContent>{policies.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-grant-rate">Calls per run</Label>
            <Input id="ai-grant-rate" type="number" min={1} max={50} value={form.rate_limit_per_run} onChange={(e) => set({ rate_limit_per_run: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-grant-note">Least privilege justification</Label>
            <Textarea id="ai-grant-note" rows={3} value={form.least_privilege_note} onChange={(e) => set({ least_privilege_note: e.target.value })} placeholder="Why this agent needs this tool, and why a narrower grant will not do." />
          </div>
          <div>
            <Label htmlFor="ai-grant-review">Grant review due</Label>
            <Input id="ai-grant-review" type="date" value={form.review_due} onChange={(e) => set({ review_due: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button
            disabled={busy || !form.agent_id || !form.tool_id}
            onClick={() => onSave?.({ ...form, rate_limit_per_run: Number(form.rate_limit_per_run) || 1, ...(assignment ? { assignment_id: assignment.id } : {}) })}
          >
            {busy ? 'Saving…' : assignment ? 'Save grant' : 'Grant tool'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}