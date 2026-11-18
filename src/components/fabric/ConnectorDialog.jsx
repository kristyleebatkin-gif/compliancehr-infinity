import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const KINDS = ['Webhook', 'Message queue', 'HTTP API', 'Email', 'SMS', 'Workflow'];
const SCHEMES = ['Secret reference', 'Connected app connector', 'None'];

/** A connector records where messages go and the NAME of the secret that authenticates them. */
export default function ConnectorDialog({ open, onOpenChange, connector, eventTypes = [], defaults = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState({});

  useEffect(() => {
    if (!open) return;
    let allowed = [];
    try { allowed = JSON.parse(connector?.allowed_event_types_json || '[]'); } catch { allowed = []; }
    setForm({
      name: connector?.name || '',
      kind: connector?.kind || 'Webhook',
      endpoint_label: connector?.endpoint_label || '',
      credential_ref: connector?.credential_ref || '',
      auth_scheme: connector?.auth_scheme || 'Secret reference',
      allowed_event_types: allowed.join(', '),
      max_attempts: connector?.max_attempts || defaults.maxAttempts || 3,
      rate_limit_per_minute: connector?.rate_limit_per_minute || defaults.rateLimit || 60,
      notes: connector?.notes || '',
    });
  }, [open, connector, defaults]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{connector ? 'Edit connector' : 'New connector'}</DialogTitle>
          <DialogDescription>
            Enter the secret's name, never its value. Anything that looks like a pasted key is refused, so a credential cannot reach a record through this form.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="fabric-conn-name">Name</Label>
            <Input id="fabric-conn-name" value={form.name || ''} onChange={(event) => set({ name: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="fabric-conn-kind">Kind</Label>
            <Select value={form.kind || 'Webhook'} onValueChange={(kind) => set({ kind })}>
              <SelectTrigger id="fabric-conn-kind"><SelectValue /></SelectTrigger>
              <SelectContent>{KINDS.map((kind) => <SelectItem key={kind} value={kind}>{kind}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="fabric-conn-endpoint">Endpoint, described in words</Label>
            <Input
              id="fabric-conn-endpoint"
              value={form.endpoint_label || ''}
              placeholder="Operations Slack channel via incoming webhook"
              onChange={(event) => set({ endpoint_label: event.target.value })}
            />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">A URL carrying a token is refused here; put the URL in the secret instead.</p>
          </div>
          <div>
            <Label htmlFor="fabric-conn-secret">Secret name</Label>
            <Input
              id="fabric-conn-secret"
              value={form.credential_ref || ''}
              placeholder="secret://SLACK_WEBHOOK_URL"
              onChange={(event) => set({ credential_ref: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="fabric-conn-auth">Authentication</Label>
            <Select value={form.auth_scheme || 'Secret reference'} onValueChange={(auth_scheme) => set({ auth_scheme })}>
              <SelectTrigger id="fabric-conn-auth"><SelectValue /></SelectTrigger>
              <SelectContent>{SCHEMES.map((scheme) => <SelectItem key={scheme} value={scheme}>{scheme}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-conn-attempts">Maximum attempts</Label>
            <Input
              id="fabric-conn-attempts"
              type="number"
              min={1}
              max={10}
              value={form.max_attempts ?? 3}
              onChange={(event) => set({ max_attempts: event.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="fabric-conn-rate">Rate limit per minute</Label>
            <Input
              id="fabric-conn-rate"
              type="number"
              min={1}
              max={600}
              value={form.rate_limit_per_minute ?? 60}
              onChange={(event) => set({ rate_limit_per_minute: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="fabric-conn-events">Permitted events (optional)</Label>
            <Input
              id="fabric-conn-events"
              value={form.allowed_event_types || ''}
              placeholder="incident.created, risk.created"
              onChange={(event) => set({ allowed_event_types: event.target.value })}
            />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">
              Comma separated. Leave empty to allow every event. {eventTypes.length ? `${eventTypes.length} event types are declared in this business.` : ''}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="fabric-conn-notes">Notes</Label>
            <Textarea id="fabric-conn-notes" rows={2} value={form.notes || ''} onChange={(event) => set({ notes: event.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button
            disabled={busy}
            onClick={() => onSave?.({
              ...form,
              allowed_event_types: String(form.allowed_event_types || '').split(',').map((value) => value.trim()).filter(Boolean),
            })}
          >
            {busy ? 'Saving…' : 'Save connector'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}