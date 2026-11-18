import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const parse = (value, fallback) => {
  try {
    const parsed = JSON.parse(value || '');
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
};

/** @param {any} props */
export default function ModelDialog({ open, onOpenChange, model, catalogue = [], saving, error, onSave } = {}) {
  const [form, setForm] = useState({ name: '', domain: '', purpose: '', description: '', assumptions: '', horizon: '', review_due: '', change_note: '' });
  const [selection, setSelection] = useState({});
  const editing = Boolean(model);

  useEffect(() => {
    if (!open) return;
    const chosen = model ? parse(model.metrics_json, []) : [{ metric: 'control_coverage', weight: 50 }, { metric: 'risk_exposure', weight: 50 }];
    setForm({
      name: model?.name || '',
      domain: model?.domain || '',
      purpose: model?.purpose || '',
      description: model?.description || '',
      assumptions: model?.assumptions || '',
      horizon: model?.horizon || '',
      review_due: model?.review_due || '',
      change_note: model?.change_note || '',
    });
    setSelection(Object.fromEntries(chosen.map((row) => [row.metric, {
      checked: true,
      weight: row.weight ?? 50,
      ceiling: row.ceiling ?? (catalogue.find((entry) => entry.key === row.metric)?.ceiling ?? 100),
    }])));
  }, [open, model, catalogue]);

  const toggle = (key) => setSelection((current) => ({
    ...current,
    [key]: { checked: !current[key]?.checked, weight: current[key]?.weight ?? 50, ceiling: current[key]?.ceiling ?? 100 },
  }));

  const patchRow = (key, field, value) => setSelection((current) => ({
    ...current,
    [key]: { ...(current[key] || { checked: true, weight: 50, ceiling: 100 }), [field]: value },
  }));

  const submit = () => {
    const metrics = catalogue
      .filter((entry) => selection[entry.key]?.checked)
      .map((entry) => ({
        metric: entry.key,
        weight: Number(selection[entry.key].weight) || 0,
        ceiling: Number(selection[entry.key].ceiling) || entry.ceiling,
      }));
    onSave?.({ ...form, metrics });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? `Edit ${model?.name}` : 'New twin model'}</DialogTitle>
          <DialogDescription>
            Choose the register inputs this twin reads. Every input is a real count or share from your records; nothing is estimated at this step.
          </DialogDescription>
        </DialogHeader>

        {error && <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">{error}</p>}

        <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-1">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="twin-model-name">Model name</Label>
              <Input id="twin-model-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Compliance resilience review" />
            </div>
            <div>
              <Label htmlFor="twin-model-domain">Domain</Label>
              <Input id="twin-model-domain" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="Compliance" />
            </div>
          </div>

          <div>
            <Label htmlFor="twin-model-purpose">Purpose</Label>
            <Input id="twin-model-purpose" value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} placeholder="What decision will this model inform?" />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-[11px] font-bold uppercase tracking-wide text-[#0A2B6D]/70">Inputs and weights</p>
            <div className="mt-2 space-y-2">
              {catalogue.map((entry) => {
                const row = selection[entry.key] || { checked: false, weight: 50, ceiling: entry.ceiling };
                return (
                  <div key={entry.key} className="rounded-lg border border-slate-200 bg-white p-2">
                    <label className="flex items-start gap-2 text-xs font-bold text-[#0A2B6D]">
                      <input type="checkbox" className="mt-0.5" checked={Boolean(row.checked)} onChange={() => toggle(entry.key)} />
                      <span>
                        {entry.label}
                        <span className="ml-1 font-normal text-[#0A2B6D]/60">({entry.unit}, {entry.direction === 'higher_better' ? 'higher is better' : 'lower is better'})</span>
                        <span className="block text-[11px] font-normal text-[#0A2B6D]/60">{entry.description}</span>
                      </span>
                    </label>
                    {row.checked && (
                      <div className="mt-2 flex flex-wrap items-end gap-2 pl-5">
                        <div className="w-24">
                          <Label className="text-[10px]">Weight</Label>
                          <Input type="number" min="1" max="100" value={row.weight} onChange={(e) => patchRow(entry.key, 'weight', e.target.value)} aria-label={`${entry.label} weight`} />
                        </div>
                        {entry.unit === 'count' && (
                          <div className="w-28">
                            <Label className="text-[10px]">Worst case</Label>
                            <Input type="number" min="1" value={row.ceiling} onChange={(e) => patchRow(entry.key, 'ceiling', e.target.value)} aria-label={`${entry.label} worst case`} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Label htmlFor="twin-model-assumptions">Stated assumptions</Label>
            <Textarea
              id="twin-model-assumptions"
              value={form.assumptions}
              onChange={(e) => setForm({ ...form, assumptions: e.target.value })}
              placeholder="Assumes each input moves linearly by the stated lever and that the records held today are representative of the planning window."
              rows={3}
            />
            <p className="mt-1 text-[11px] text-[#0A2B6D]/60">Printed on every simulation this model produces.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="twin-model-horizon">Planning horizon</Label>
              <Input id="twin-model-horizon" value={form.horizon} onChange={(e) => setForm({ ...form, horizon: e.target.value })} placeholder="Next quarter" />
            </div>
            <div>
              <Label htmlFor="twin-model-review">Model review due</Label>
              <Input id="twin-model-review" type="date" value={form.review_due} onChange={(e) => setForm({ ...form, review_due: e.target.value })} />
            </div>
          </div>

          <div>
            <Label htmlFor="twin-model-description">How the model works</Label>
            <Textarea id="twin-model-description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>

          {!editing && (
            <div>
              <Label htmlFor="twin-model-change">Version note</Label>
              <Input id="twin-model-change" value={form.change_note} onChange={(e) => setForm({ ...form, change_note: e.target.value })} placeholder="First version." />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange?.(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving}>{saving ? 'Saving…' : editing ? 'Save draft' : 'Create draft model'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}