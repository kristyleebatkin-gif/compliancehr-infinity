import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const blank = () => ({
  name: '', provider: 'OpenAI', provider_model_id: '', credential_ref: '', context_window: 128000,
  sensitivity_ceiling: 'Internal', owner_role: '', notes: '',
});

/** Provider settings. The credential field takes the NAME of an app secret, never a key. */
export default function ModelDialog({ open, onOpenChange, model, meta = {}, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!model) { setForm(blank()); return; }
    setForm({
      name: model.name || '',
      provider: model.provider || 'OpenAI',
      provider_model_id: model.provider_model_id || '',
      credential_ref: model.credential_ref || '',
      context_window: model.context_window || 128000,
      sensitivity_ceiling: model.sensitivity_ceiling || 'Internal',
      owner_role: model.owner_role || '',
      notes: model.notes || '',
    });
  }, [open, model]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{model ? 'Edit model' : 'Register a model'}</DialogTitle>
          <DialogDescription>
            This record names the provider and model and points at the app secret holding the key. No provider is called from this module, and changing these settings clears validation until it is checked again.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ai-model-name">Model name</Label>
            <Input id="ai-model-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Support triage model" />
          </div>
          <div>
            <Label htmlFor="ai-model-provider">Provider</Label>
            <Select value={form.provider} onValueChange={(provider) => set({ provider })}>
              <SelectTrigger id="ai-model-provider"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.providers || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="ai-model-id">Provider model identifier</Label>
            <Input id="ai-model-id" value={form.provider_model_id} onChange={(e) => set({ provider_model_id: e.target.value })} placeholder="the exact identifier your provider issues" />
          </div>
          <div>
            <Label htmlFor="ai-model-secret">Credential reference</Label>
            <Input id="ai-model-secret" value={form.credential_ref} onChange={(e) => set({ credential_ref: e.target.value })} placeholder="secret://OPENAI_API_KEY" />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">The name of the secret, not the key. A pasted key is refused.</p>
          </div>
          <div>
            <Label htmlFor="ai-model-context">Context window (tokens)</Label>
            <Input id="ai-model-context" type="number" value={form.context_window} onChange={(e) => set({ context_window: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="ai-model-ceiling">Sensitivity ceiling</Label>
            <Select value={form.sensitivity_ceiling} onValueChange={(sensitivity_ceiling) => set({ sensitivity_ceiling })}>
              <SelectTrigger id="ai-model-ceiling"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.sensitivities || []).map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-model-notes">Notes</Label>
            <Textarea id="ai-model-notes" rows={2} value={form.notes} onChange={(e) => set({ notes: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button
            disabled={busy}
            onClick={() => onSave?.({ ...form, context_window: Number(form.context_window), ...(model ? { model_id: model.id } : {}) })}
          >
            {busy ? 'Saving…' : model ? 'Save settings' : 'Register model'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}