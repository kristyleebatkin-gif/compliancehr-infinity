import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ConditionsEditor from '@/components/fabric/ConditionsEditor';

const ACTIONS = ['Route to workflow', 'Route to flow', 'Record only', 'Suppress'];

/** A rule decides which published target owns an event, and under which conditions. */
export default function RuleDialog({ open, onOpenChange, rule, eventTypes = [], workflows = [], flows = [], busy, error, onSave } = {}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;
    let conditions = [];
    try { conditions = JSON.parse(rule?.conditions_json || '[]'); } catch { conditions = []; }
    setForm({
      name: rule?.name || '',
      description: rule?.description || '',
      event_type_id: eventTypes.find((row) => row.event_key === rule?.event_type_key)?.id || '',
      action: rule?.action || 'Route to workflow',
      target_workflow_id: rule?.target_workflow_id || '',
      target_flow_id: rule?.target_flow_id || '',
      priority: rule?.priority || 100,
      status: rule?.status || 'Active',
      effective_from: rule?.effective_from || '',
      conditions,
    });
  }, [open, rule, eventTypes]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const publishedFlows = flows.filter((row) => row.status === 'Published');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{rule ? 'Edit rule' : 'New orchestration rule'}</DialogTitle>
          <DialogDescription>
            Lower priority numbers are read first, and the first matching active rule owns the event, so one event is never routed twice.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="fabric-rule-name">Name</Label>
            <Input id="fabric-rule-name" value={form.name || ''} onChange={(event) => set({ name: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="fabric-rule-event">Event</Label>
            <Select value={form.event_type_id || ''} onValueChange={(event_type_id) => set({ event_type_id })}>
              <SelectTrigger id="fabric-rule-event"><SelectValue placeholder="Choose an event" /></SelectTrigger>
              <SelectContent>
                {eventTypes.filter((row) => row.status === 'Active').map((row) => (
                  <SelectItem key={row.id} value={row.id}>{row.name} · {row.event_key}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-rule-action">Action</Label>
            <Select value={form.action || 'Route to workflow'} onValueChange={(action) => set({ action })}>
              <SelectTrigger id="fabric-rule-action"><SelectValue /></SelectTrigger>
              <SelectContent>{ACTIONS.map((action) => <SelectItem key={action} value={action}>{action}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-rule-priority">Priority</Label>
            <Input
              id="fabric-rule-priority"
              type="number"
              min={1}
              max={9999}
              value={form.priority ?? 100}
              onChange={(event) => set({ priority: event.target.value })}
            />
          </div>

          {form.action === 'Route to workflow' && (
            <div className="sm:col-span-2">
              <Label htmlFor="fabric-rule-workflow">Published workflow</Label>
              <Select value={form.target_workflow_id || ''} onValueChange={(target_workflow_id) => set({ target_workflow_id })}>
                <SelectTrigger id="fabric-rule-workflow"><SelectValue placeholder="Choose a published workflow" /></SelectTrigger>
                <SelectContent>
                  {workflows.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · v{row.version}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.action === 'Route to flow' && (
            <div className="sm:col-span-2">
              <Label htmlFor="fabric-rule-flow">Published flow</Label>
              <Select value={form.target_flow_id || ''} onValueChange={(target_flow_id) => set({ target_flow_id })}>
                <SelectTrigger id="fabric-rule-flow"><SelectValue placeholder="Choose a published flow" /></SelectTrigger>
                <SelectContent>
                  {publishedFlows.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · v{row.version}</SelectItem>)}
                </SelectContent>
              </Select>
              {!publishedFlows.length && <p className="mt-1 text-[11px] text-amber-700">No flow is published yet, so there is nothing to route to.</p>}
            </div>
          )}

          <div>
            <Label htmlFor="fabric-rule-status">Status</Label>
            <Select value={form.status || 'Active'} onValueChange={(status) => set({ status })}>
              <SelectTrigger id="fabric-rule-status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-rule-from">Effective from</Label>
            <Input id="fabric-rule-from" type="date" value={form.effective_from || ''} onChange={(event) => set({ effective_from: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="fabric-rule-description">Why this rule exists</Label>
            <Textarea id="fabric-rule-description" rows={2} value={form.description || ''} onChange={(event) => set({ description: event.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>Conditions</Label>
            <ConditionsEditor value={form.conditions || []} onChange={(conditions) => set({ conditions })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={() => onSave?.(form)} disabled={busy}>{busy ? 'Saving…' : 'Save rule'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}