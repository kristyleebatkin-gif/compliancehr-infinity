import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const sampleFor = (eventType) => {
  if (!eventType) return '{}';
  let fields = [];
  try { fields = JSON.parse(eventType.payload_schema_json || '[]'); } catch { fields = []; }
  const sample = {};
  fields.forEach((field) => {
    sample[field.name] = field.type === 'number' ? 1 : field.type === 'boolean' ? false : field.type === 'object' ? {} : field.type === 'array' ? [] : '';
  });
  return JSON.stringify(sample, null, 2);
};

/** Publishes one event: validated, redacted, de-duplicated, then routed. */
export default function PublishEventDialog({ open, onOpenChange, eventTypes = [], connectors = [], busy, error, onPublish } = {}) {
  const [form, setForm] = useState({});
  const [result, setResult] = useState(null);
  const [parseError, setParseError] = useState('');
  const active = eventTypes.filter((row) => row.status === 'Active');
  const selected = active.find((row) => row.id === form.event_type_id) || null;

  useEffect(() => {
    if (!open) return;
    const first = active[0] || null;
    setResult(null);
    setParseError('');
    setForm({
      event_type_id: first?.id || '',
      payload_text: sampleFor(first),
      source_ref: '',
      occurred_at: '',
      connector_id: '',
      max_attempts: 3,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  const submit = async () => {
    let payload = {};
    try {
      payload = JSON.parse(form.payload_text || '{}');
      setParseError('');
    } catch {
      setParseError('The payload is not valid JSON. Fix it before publishing.');
      return;
    }
    const output = await onPublish?.({
      event_type_id: form.event_type_id,
      payload,
      source_ref: form.source_ref,
      occurred_at: form.occurred_at,
      connector_id: form.connector_id,
      max_attempts: Number(form.max_attempts) || 3,
    });
    if (output) setResult(output);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Publish an event</DialogTitle>
          <DialogDescription>
            The payload is checked against the event's contract first. Only then is it redacted, stored, and routed through one matching rule.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}
        {parseError && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{parseError}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="fabric-pub-event">Event</Label>
            <Select
              value={form.event_type_id || ''}
              onValueChange={(event_type_id) => {
                const next = active.find((row) => row.id === event_type_id);
                set({ event_type_id, payload_text: sampleFor(next) });
              }}
            >
              <SelectTrigger id="fabric-pub-event"><SelectValue placeholder="Choose an event" /></SelectTrigger>
              <SelectContent>
                {active.map((row) => <SelectItem key={row.id} value={row.id}>{row.name} · {row.event_key}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-pub-source">Source record</Label>
            <Input
              id="fabric-pub-source"
              value={form.source_ref || ''}
              placeholder="Incident INC-00042"
              onChange={(event) => set({ source_ref: event.target.value })}
            />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">The same event from the same source is delivered once, not twice.</p>
          </div>
          <div>
            <Label htmlFor="fabric-pub-connector">Connector (optional)</Label>
            <Select value={form.connector_id || 'none'} onValueChange={(value) => set({ connector_id: value === 'none' ? '' : value })}>
              <SelectTrigger id="fabric-pub-connector"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No connector</SelectItem>
                {connectors.filter((row) => row.status === 'Active').map((row) => (
                  <SelectItem key={row.id} value={row.id}>{row.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="fabric-pub-occurred">Occurred at (optional)</Label>
            <Input
              id="fabric-pub-occurred"
              type="datetime-local"
              value={form.occurred_at || ''}
              onChange={(event) => set({ occurred_at: event.target.value })}
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="fabric-pub-payload">Payload (JSON)</Label>
            <Textarea
              id="fabric-pub-payload"
              rows={8}
              className="font-mono text-xs"
              value={form.payload_text || ''}
              onChange={(event) => set({ payload_text: event.target.value })}
            />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">
              {selected ? `${selected.field_count} declared fields, sensitivity ${selected.sensitivity}.` : 'Choose an event to see its contract.'}
            </p>
          </div>
        </div>

        {result && (
          <div className={`rounded-lg border px-3 py-2 text-xs ${result.status === 'Delivered' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-amber-200 bg-amber-50 text-amber-800'}`}>
            <p className="flex items-center gap-1.5 font-bold">
              {result.status === 'Delivered' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
              {result.deduplicated ? 'Already delivered' : result.status}
            </p>
            <p className="mt-1">
              {result.deduplicated
                ? result.detail
                : `${result.message?.message_ref || ''} · trace ${result.message?.trace_id || ''}`}
            </p>
            {!result.deduplicated && result.detail && <p className="mt-1">{result.detail}</p>}
            {result.redactedFields?.length > 0 && (
              <p className="mt-1 font-bold">Withheld before storage: {result.redactedFields.join(', ')}</p>
            )}
            {result.workflow && (
              <p className="mt-1">
                Started {result.workflow.definitionName} v{result.workflow.version} · run {String(result.workflow.instanceId || '').slice(0, 8)}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Close</Button>
          <Button onClick={submit} disabled={busy}>{busy ? 'Publishing…' : 'Publish event'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}