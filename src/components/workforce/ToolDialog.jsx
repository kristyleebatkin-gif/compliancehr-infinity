import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const blank = () => ({ name: '', kind: 'Read internal record', description: '', idempotency_supported: false, owner_role: '', notes: '' });

/** A tool an agent could use. Its kind fixes the risk the OS applies. */
export default function ToolDialog({ open, onOpenChange, tool, meta = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!tool) { setForm(blank()); return; }
    setForm({
      name: tool.name || '',
      kind: tool.kind || 'Read internal record',
      description: tool.description || '',
      idempotency_supported: Boolean(tool.idempotency_supported),
      owner_role: tool.owner_role || '',
      notes: tool.notes || '',
    });
  }, [open, tool]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const kinds = meta.toolKinds || [];
  const selected = kinds.find((item) => item.kind === form.kind);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tool ? 'Edit tool' : 'Define a tool'}</DialogTitle>
          <DialogDescription>
            The kind decides the risk and whether autonomy is even possible. This screen never runs the tool; it records what it is and what may be granted.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ai-tool-name">Tool name</Label>
            <Input id="ai-tool-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Read the incident register" />
          </div>
          <div>
            <Label htmlFor="ai-tool-kind">Tool kind</Label>
            <Select value={form.kind} onValueChange={(kind) => set({ kind })}>
              <SelectTrigger id="ai-tool-kind"><SelectValue /></SelectTrigger>
              <SelectContent>{kinds.map((item) => <SelectItem key={item.kind} value={item.kind}>{item.kind} · {item.risk}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-[#0A2B6D]">
            {selected?.autonomousEligible
              ? `${form.kind} is a ${selected.risk.toLowerCase()}-risk internal tool. It can be granted autonomy only by an explicit grant that requires an idempotency key.`
              : `${form.kind} can never be performed autonomously. A person must decide, and this app will not perform it either.`}
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-tool-description">What it does</Label>
            <Textarea id="ai-tool-description" rows={2} value={form.description} onChange={(e) => set({ description: e.target.value })} />
          </div>
          <div>
            <Label>Idempotency</Label>
            <Button type="button" variant={form.idempotency_supported ? 'secondary' : 'outline'} className="mt-1 w-full" onClick={() => set({ idempotency_supported: !form.idempotency_supported })}>
              {form.idempotency_supported ? 'Supports idempotency' : 'Does not support idempotency'}
            </Button>
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">A repeated call with the same key must not do the work twice.</p>
          </div>
          <div>
            <Label htmlFor="ai-tool-owner">Tool owner</Label>
            <Input id="ai-tool-owner" value={form.owner_role} onChange={(e) => set({ owner_role: e.target.value })} placeholder="Quality & Improvement Manager" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-tool-notes">Notes</Label>
            <Textarea id="ai-tool-notes" rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button disabled={busy} onClick={() => onSave?.({ ...form, ...(tool ? { tool_id: tool.id } : {}) })}>
            {busy ? 'Saving…' : tool ? 'Save tool' : 'Create tool'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}