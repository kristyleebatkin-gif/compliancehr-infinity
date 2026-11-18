import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TYPES = ['string', 'number', 'boolean', 'object', 'array'];

const blank = () => ({
  event_key: '', name: '', description: '', category: 'Compliance', sensitivity: 'Internal',
  domain: '', source_module: '', retention_days: 365, notes: '',
  fields: [{ name: '', type: 'string', required: true }],
});

/** Declares the payload contract an event must satisfy before anything is routed. */
export default function EventTypeDialog({ open, onOpenChange, eventType, catalogue = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!eventType) { setForm(blank()); return; }
    let fields = [];
    try { fields = JSON.parse(eventType.payload_schema_json || '[]'); } catch { fields = []; }
    setForm({
      event_key: eventType.event_key || '',
      name: eventType.name || '',
      description: eventType.description || '',
      category: eventType.category || 'Compliance',
      sensitivity: eventType.sensitivity || 'Internal',
      domain: eventType.domain || '',
      source_module: eventType.source_module || '',
      retention_days: eventType.retention_days || 365,
      notes: eventType.notes || '',
      fields: fields.length ? fields : [{ name: '', type: 'string', required: true }],
    });
  }, [open, eventType]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));
  const updateField = (index, patch) => set({ fields: form.fields.map((field, i) => (i === index ? { ...field, ...patch } : field)) });

  const submit = () => onSave?.({
    event_key: form.event_key.trim().toLowerCase(),
    name: form.name.trim(),
    description: form.description,
    category: form.category,
    sensitivity: form.sensitivity,
    domain: form.domain,
    source_module: form.source_module,
    retention_days: Number(form.retention_days) || 365,
    notes: form.notes,
    fields: form.fields.filter((field) => field.name.trim()),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{eventType ? 'Edit event type' : 'New event type'}</DialogTitle>
          <DialogDescription>
            The fields below are the contract. An event that does not satisfy them is refused before it is stored or routed.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="fabric-event-key">Event key</Label>
            <Input
              id="fabric-event-key"
              value={form.event_key}
              disabled={Boolean(eventType)}
              placeholder="incident.created"
              onChange={(event) => set({ event_key: event.target.value })}
            />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">Lower-case and dotted. This is what routing matches on.</p>
          </div>
          <div>
            <Label htmlFor="fabric-event-name">Name</Label>
            <Input id="fabric-event-name" value={form.name} onChange={(event) => set({ name: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="fabric-event-category">Category</Label>
            <Select value={form.category} onValueChange={(category) => set({ category })}>
              <SelectTrigger id="fabric-event-category"><SelectValue /></SelectTrigger>
              <SelectContent>{(catalogue.categories || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-event-sensitivity">Sensitivity</Label>
            <Select value={form.sensitivity} onValueChange={(sensitivity) => set({ sensitivity })}>
              <SelectTrigger id="fabric-event-sensitivity"><SelectValue /></SelectTrigger>
              <SelectContent>{(catalogue.sensitivities || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">Confidential and Restricted payloads are redacted before the record is written.</p>
          </div>
          <div>
            <Label htmlFor="fabric-event-domain">Operating area</Label>
            <Input id="fabric-event-domain" value={form.domain} onChange={(event) => set({ domain: event.target.value })} />
          </div>
          <div>
            <Label htmlFor="fabric-event-module">Producing module</Label>
            <Input id="fabric-event-module" value={form.source_module} onChange={(event) => set({ source_module: event.target.value })} placeholder="/incidents" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="fabric-event-description">What this event means</Label>
            <Textarea id="fabric-event-description" rows={2} value={form.description} onChange={(event) => set({ description: event.target.value })} />
          </div>
        </div>

        <div>
          <Label>Payload fields</Label>
          <div className="mt-1 space-y-2">
            {form.fields.map((field, index) => (
              <div key={index} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_140px_auto_auto]">
                <Input
                  value={field.name}
                  placeholder="lower_snake_case"
                  onChange={(event) => updateField(index, { name: event.target.value })}
                />
                <Select value={field.type || 'string'} onValueChange={(type) => updateField(index, { type })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
                <Button
                  type="button"
                  size="sm"
                  variant={field.required ? 'secondary' : 'outline'}
                  onClick={() => updateField(index, { required: !field.required })}
                >
                  {field.required ? 'Required' : 'Optional'}
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={() => set({ fields: form.fields.filter((_, i) => i !== index) })}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => set({ fields: [...form.fields, { name: '', type: 'string', required: false }] })}>
            <Plus className="h-3.5 w-3.5" /> Add field
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={submit} disabled={busy}>{busy ? 'Saving…' : eventType ? 'Save event type' : 'Create event type'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}