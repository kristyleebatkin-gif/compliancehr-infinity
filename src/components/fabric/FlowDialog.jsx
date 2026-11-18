import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import StepsEditor from '@/components/fabric/StepsEditor';

/** Builds a flow as an ordered set of steps the fabric can actually perform. */
export default function FlowDialog({ open, onOpenChange, flow, eventTypes = [], workflows = [], busy, error, onSave } = {}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;
    let steps = [];
    try { steps = JSON.parse(flow?.steps_json || '[]'); } catch { steps = []; }
    setForm({
      name: flow?.name || '',
      description: flow?.description || '',
      event_type_id: eventTypes.find((row) => row.event_key === flow?.trigger_event_key)?.id || '',
      owner_role: flow?.owner_role || '',
      change_note: '',
      steps: steps.length ? steps : [{ kind: 'Route to workflow', workflow_definition_id: '', workflow_definition_name: '', note: '' }],
    });
  }, [open, flow, eventTypes]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{flow ? `Edit ${flow.name}` : 'New automation flow'}</DialogTitle>
          <DialogDescription>
            Saving a flow clears any earlier validation, so changed steps can never be published on the strength of an old check.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="fabric-flow-name">Name</Label>
            <Input id="fabric-flow-name" value={form.name || ''} onChange={(event) => set({ name: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="fabric-flow-event">Triggering event</Label>
            <Select value={form.event_type_id || ''} onValueChange={(event_type_id) => set({ event_type_id })}>
              <SelectTrigger id="fabric-flow-event"><SelectValue placeholder="Choose an event" /></SelectTrigger>
              <SelectContent>
                {eventTypes.filter((row) => row.status === 'Active').map((row) => (
                  <SelectItem key={row.id} value={row.id}>{row.name} · {row.event_key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-flow-owner">Process owner</Label>
            <Input id="fabric-flow-owner" value={form.owner_role || ''} onChange={(event) => set({ owner_role: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="fabric-flow-change">What changed in this version</Label>
            <Input id="fabric-flow-change" value={form.change_note || ''} onChange={(event) => set({ change_note: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="fabric-flow-description">What this flow does</Label>
            <Textarea id="fabric-flow-description" rows={2} value={form.description || ''} onChange={(event) => set({ description: event.target.value })} />
          </div>
        </div>

        <div>
          <Label>Steps</Label>
          <StepsEditor value={form.steps || []} onChange={(steps) => set({ steps })} workflows={workflows} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={() => onSave?.(form)} disabled={busy}>{busy ? 'Saving…' : 'Save flow'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}