import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const blank = () => ({ name: '', prompt_key: '', purpose: '', body: '', variables: '', change_note: '' });

const GUARDRAIL_EXAMPLE = 'You are assisting a compliance reviewer. Read the records supplied and draft a recommendation. Your output is a recommendation only: a human reviewer must approve it before anyone acts on it.';

/** A new prompt version. The guardrail line is part of the body, so it travels with the prompt. */
export default function PromptDialog({ open, onOpenChange, prompt, busy, error, onSave } = {}) {
  const [form, setForm] = useState(blank);

  useEffect(() => {
    if (!open) return;
    if (!prompt) { setForm(blank()); return; }
    let variables = [];
    try { variables = JSON.parse(prompt.variables_json || '[]'); } catch { variables = []; }
    setForm({
      name: prompt.name || '',
      prompt_key: prompt.prompt_key || '',
      purpose: prompt.purpose || '',
      body: prompt.body || '',
      variables: Array.isArray(variables) ? variables.join(', ') : '',
      change_note: '',
    });
  }, [open, prompt]);

  const set = (patch) => setForm((current) => ({ ...current, ...patch }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{prompt ? `New version of ${prompt.name}` : 'New prompt'}</DialogTitle>
          <DialogDescription>
            Saving writes a new version rather than editing the old one. The prompt must say what to produce and that a person approves the output; that guardrail is checked again at publication.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="ai-prompt-name">Prompt name</Label>
            <Input id="ai-prompt-name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="Incident triage recommendation" />
          </div>
          <div>
            <Label htmlFor="ai-prompt-key">Prompt key</Label>
            <Input id="ai-prompt-key" value={form.prompt_key} disabled={Boolean(prompt)} onChange={(e) => set({ prompt_key: e.target.value })} placeholder="incident_triage" />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">Versions of one prompt share this key.</p>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-prompt-purpose">Purpose</Label>
            <Input id="ai-prompt-purpose" value={form.purpose} onChange={(e) => set({ purpose: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="ai-prompt-body">Prompt body</Label>
            <Textarea id="ai-prompt-body" rows={9} value={form.body} onChange={(e) => set({ body: e.target.value })} placeholder={GUARDRAIL_EXAMPLE} />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">Include the instruction that the output is a recommendation pending human approval, and that credentials belong in app secrets.</p>
          </div>
          <div>
            <Label htmlFor="ai-prompt-vars">Variables</Label>
            <Input id="ai-prompt-vars" value={form.variables} onChange={(e) => set({ variables: e.target.value })} placeholder="incident_ref, severity" />
          </div>
          <div>
            <Label htmlFor="ai-prompt-change">What changed</Label>
            <Input id="ai-prompt-change" value={form.change_note} onChange={(e) => set({ change_note: e.target.value })} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button
            disabled={busy}
            onClick={() => onSave?.({
              ...form,
              prompt_key: form.prompt_key || form.name,
              variables: form.variables.split(',').map((item) => item.trim()).filter(Boolean),
            })}
          >
            {busy ? 'Saving…' : 'Save as draft version'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}