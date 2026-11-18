import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConditionsEditor from '@/components/fabric/ConditionsEditor';

/** One delivery route: which event reaches which published target, on what terms. */
export default function SubscriptionDialog({
  open, onOpenChange, subscription, eventTypes = [], workflows = [], flows = [], connectors = [],
  defaults = {}, busy, error, onSave,
} = {}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;
    let filters = [];
    try { filters = JSON.parse(subscription?.filters_json || '[]'); } catch { filters = []; }
    setForm({
      name: subscription?.name || '',
      description: subscription?.description || '',
      event_type_id: eventTypes.find((row) => row.event_key === subscription?.event_type_key)?.id || '',
      target_kind: subscription?.target_kind || 'Workflow',
      workflow_definition_id: subscription?.workflow_definition_id || '',
      flow_id: subscription?.flow_id || '',
      connector_id: subscription?.connector_id || '',
      max_attempts: subscription?.max_attempts || defaults.maxAttempts || 3,
      rate_limit_per_minute: subscription?.rate_limit_per_minute || defaults.rateLimit || 60,
      filters,
    });
  }, [open, subscription, eventTypes, defaults]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const publishedFlows = flows.filter((row) => row.status === 'Published');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{subscription ? 'Edit subscription' : 'New subscription'}</DialogTitle>
          <DialogDescription>
            Only a published workflow or published flow can receive an event, so a route always points at something a person signed off.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="fabric-sub-name">Name</Label>
            <Input id="fabric-sub-name" value={form.name || ''} onChange={(event) => set({ name: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="fabric-sub-event">Event</Label>
            <Select value={form.event_type_id || ''} onValueChange={(event_type_id) => set({ event_type_id })}>
              <SelectTrigger id="fabric-sub-event"><SelectValue placeholder="Choose an event" /></SelectTrigger>
              <SelectContent>
                {eventTypes.filter((row) => row.status === 'Active').map((row) => (
                  <SelectItem key={row.id} value={row.id}>{row.name} · {row.event_key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-sub-target">Delivers to</Label>
            <Select value={form.target_kind || 'Workflow'} onValueChange={(target_kind) => set({ target_kind })}>
              <SelectTrigger id="fabric-sub-target"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Workflow">Workflow</SelectItem>
                <SelectItem value="Automation flow">Automation flow</SelectItem>
                <SelectItem value="Record only">Record only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-sub-connector">Connector (optional)</Label>
            <Select value={form.connector_id || 'none'} onValueChange={(value) => set({ connector_id: value === 'none' ? '' : value })}>
              <SelectTrigger id="fabric-sub-connector"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No connector</SelectItem>
                {connectors.filter((row) => row.status === 'Active').map((row) => (
                  <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.target_kind === 'Workflow' && (
            <div className="sm:col-span-2">
              <Label htmlFor="fabric-sub-workflow">Published workflow</Label>
              <Select value={form.workflow_definition_id || ''} onValueChange={(workflow_definition_id) => set({ workflow_definition_id })}>
                <SelectTrigger id="fabric-sub-workflow"><SelectValue placeholder="Choose a published workflow" /></SelectTrigger>
                <SelectContent>
                  {workflows.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · v{row.version}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.target_kind === 'Automation flow' && (
            <div className="sm:col-span-2">
              <Label htmlFor="fabric-sub-flow">Published flow</Label>
              <Select value={form.flow_id || ''} onValueChange={(flow_id) => set({ flow_id })}>
                <SelectTrigger id="fabric-sub-flow"><SelectValue placeholder="Choose a published flow" /></SelectTrigger>
                <SelectContent>
                  {publishedFlows.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · v{row.version}</SelectItem>)}
                </SelectContent>
              </Select>
              {!publishedFlows.length && <p className="mt-1 text-[11px] text-amber-700">No flow is published yet, so there is nothing to deliver to.</p>}
            </div>
          )}

          <div>
            <Label htmlFor="fabric-sub-attempts">Maximum attempts</Label>
            <Input
              id="fabric-sub-attempts"
              type="number"
              min={1}
              max={10}
              value={form.max_attempts ?? 3}
              onChange={(event) => set({ max_attempts: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="fabric-sub-rate">Rate limit per minute</Label>
            <Input
              id="fabric-sub-rate"
              type="number"
              min={1}
              max={600}
              value={form.rate_limit_per_minute ?? 60}
              onChange={(event) => set({ rate_limit_per_minute: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="fabric-sub-description">What this subscription does</Label>
            <Textarea id="fabric-sub-description" rows={2} value={form.description || ''} onChange={(event) => set({ description: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Filters</Label>
            <ConditionsEditor value={form.filters || []} onChange={(filters) => set({ filters })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={() => onSave?.(form)} disabled={busy}>{busy ? 'Saving…' : subscription ? 'Save subscription' : 'Create subscription'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}